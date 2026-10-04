import NaturalLanguage
import XCTest
@testable import EnchattoText

/// `MyMemoryTranslationService` is the only caller of the casualizer, and it holds the rule that
/// carries the sentence-ending punctuation of the source over to the Japanese translation
/// (`matchEndingPunctuation`, private, so it is tested through `translate`).
///
/// Nothing in this file reaches the network. `StubURLProtocol` answers every request made
/// through `URLSession.shared`, and fails a request that a test did not prepare an answer for.
///
/// What depends on the operating system: the direction of a translation comes from
/// `NLLanguageRecognizer`, except for a message in kana or kanji with no Latin letter in it,
/// which is Japanese whatever the recognizer says. These tests only need English sentences not
/// to be taken for Japanese, which is as safe as detection gets.
final class MyMemoryTranslationServiceTests: XCTestCase {
    private let service = MyMemoryTranslationService()

    override func setUp() {
        super.setUp()
        StubURLProtocol.reset()
        URLProtocol.registerClass(StubURLProtocol.self)
    }

    override func tearDown() {
        URLProtocol.unregisterClass(StubURLProtocol.self)
        StubURLProtocol.reset()
        super.tearDown()
    }

    /// `source` and `target` are ignored by the service: it detects the language itself.
    private func translate(_ text: String) async throws -> String {
        try await service.translate(text: text, source: "en", target: "ja")
    }

    // MARK: - Short phrases (answered from the built-in table, no request)

    func testShortPhraseIsAnsweredWithoutARequest() async throws {
        let hello = try await translate("Hello")
        XCTAssertEqual(hello, "こんにちは")
        let tired = try await translate("I'm tired")
        XCTAssertEqual(tired, "疲れた")
        // The lookup ignores case and surrounding punctuation.
        let morning = try await translate("GOOD MORNING")
        XCTAssertEqual(morning, "おはよう")
        let ok = try await translate("ok!!!")
        XCTAssertEqual(ok, "オッケー！")
        XCTAssertEqual(StubURLProtocol.requests.count, 0)
    }

    func testEndingPunctuationIsCarriedOverInFullWidth() async throws {
        let exclamation = try await translate("Hello!")
        XCTAssertEqual(exclamation, "こんにちは！")
        let question = try await translate("Really?")
        XCTAssertEqual(question, "まじで？")
        let fullStop = try await translate("Thanks.")
        XCTAssertEqual(fullStop, "ありがとう。")
        XCTAssertEqual(StubURLProtocol.requests.count, 0)
    }

    // MARK: - Translations from the service (stubbed)

    func testTranslationIntoJapaneseIsCasualizedAndPunctuated() async throws {
        StubURLProtocol.respond(translatedText: "駅はどこですか")
        let result = try await translate("Where is the station?")
        XCTAssertEqual(result, "駅はどこなの？")

        XCTAssertEqual(StubURLProtocol.requests.count, 1)
        XCTAssertEqual(StubURLProtocol.lastQuery["q"], "Where is the station?")
        XCTAssertEqual(StubURLProtocol.lastQuery["langpair"], "en|ja")
    }

    func testPunctuationIsNeitherInventedNorDoubled() async throws {
        // The source has no ending punctuation: none is added.
        StubURLProtocol.respond(translatedText: "明日学校に行きます")
        let plain = try await translate("I am going to school tomorrow")
        XCTAssertEqual(plain, "明日学校に行く")

        // The translation already ends in punctuation: it is kept, not doubled.
        StubURLProtocol.respond(translatedText: "昨日映画を見ました。")
        let punctuated = try await translate("I watched a movie yesterday.")
        XCTAssertEqual(punctuated, "昨日映画を見た。")
    }

    /// でしたか。 with a full stop: the casualizer cannot tell "Were you OK?" from "I see", and
    /// keeps だったか。 The source can tell.
    func testAQuestionInTheSourceStaysAQuestion() async throws {
        StubURLProtocol.respond(translatedText: "大丈夫でしたか。")
        let asked = try await translate("Were you OK?")
        XCTAssertEqual(asked, "大丈夫だった？")
        // A source that does not ask keeps the realization
        StubURLProtocol.respond(translatedText: "そうでしたか。")
        let realized = try await translate("I see, so that is how it was.")
        XCTAssertEqual(realized, "そうだったか。")
        // Every other か。 the casualizer leaves is left here too
        StubURLProtocol.respond(translatedText: "行きましょうか。")
        let shallWe = try await translate("Shall we go?")
        XCTAssertEqual(shallWe, "行きましょうか。")
        StubURLProtocol.respond(translatedText: "本当に大丈夫でしょうか。")
        let wonder = try await translate("Is it really all right?")
        XCTAssertEqual(wonder, "本当に大丈夫でしょうか。")
    }

    func testAQuestionWithAFullStopThatTheSourceDoesNotMark() async throws {
        // DEFECT: only the last sentence is looked at, and only its ending mark. A question in
        // front of another sentence keeps the か of an older man's question (大丈夫だったか。).
        StubURLProtocol.respond(translatedText: "大丈夫でしたか。心配しました。")
        let first = try await translate("Were you OK? I was worried.")
        XCTExpectDefect(first, shouldBe: "大丈夫だった？心配した。")
        // DEFECT: so does a question typed without its question mark.
        StubURLProtocol.respond(translatedText: "大丈夫でしたか。")
        let unmarked = try await translate("were you ok")
        XCTExpectDefect(unmarked, shouldBe: "大丈夫だった？")
    }

    func testTranslationIntoEnglishIsReturnedAsIs() async throws {
        StubURLProtocol.respond(translatedText: "Where is the station")
        let result = try await translate("駅はどこですか？")
        XCTAssertEqual(result, "Where is the station")
        XCTAssertEqual(StubURLProtocol.lastQuery["langpair"], "ja|en")
    }

    func testEmptyTranslationFallsBackToTheOriginalText() async throws {
        StubURLProtocol.respond(translatedText: "")
        let result = try await translate("Where is the station?")
        XCTAssertEqual(result, "Where is the station?")
    }

    /// The safety net of this file: with no prepared answer the request fails inside the stub.
    /// It is recorded, so it did go through `StubURLProtocol` and not to the real service.
    func testRequestWithoutAPreparedAnswerFailsInsteadOfReachingTheNetwork() async {
        do {
            let result = try await translate("Where is the station?")
            XCTFail("an unprepared request should fail, but returned \(result)")
        } catch let error as URLError {
            XCTAssertEqual(error.code, .notConnectedToInternet)
        } catch {
            XCTFail("unexpected error: \(error)")
        }
        XCTAssertEqual(StubURLProtocol.requests.count, 1)
        XCTAssertEqual(StubURLProtocol.requests.first?.url?.host, "api.mymemory.translated.net")
    }

    func testServerAndAPIErrorsAreThrown() async {
        StubURLProtocol.respond(httpStatus: 500, json: "{}")
        do {
            _ = try await translate("Where is the station?")
            XCTFail("an HTTP 500 should throw")
        } catch TranslationError.serverError(let code) {
            XCTAssertEqual(code, 500)
        } catch {
            XCTFail("unexpected error: \(error)")
        }

        StubURLProtocol.respond(
            httpStatus: 200,
            json: #"{"responseData":{"translatedText":""},"responseStatus":429,"responseDetails":"quota"}"#
        )
        do {
            _ = try await translate("Where is the station?")
            XCTFail("an API status other than 200 should throw")
        } catch TranslationError.apiError(let message) {
            XCTAssertEqual(message, "quota")
        } catch {
            XCTFail("unexpected error: \(error)")
        }
    }

    // MARK: - Which way a message is translated

    /// NLLanguageRecognizer takes a short message written only in kanji for Chinese (which
    /// words is up to the operating system: 東京 and 日本 are recognised on macOS 26.6, 大丈夫
    /// and 了解 are not). The app has no Chinese: such a message is Japanese and is translated
    /// into English, not sent as English to be translated into Japanese.
    func testJapaneseWrittenOnlyInKanjiIsTranslatedIntoEnglish() async throws {
        for word in ["大丈夫", "了解", "今日", "学生", "東京", "何時？", "3時", "笑", "了解！"] {
            StubURLProtocol.respond(translatedText: "ok")
            _ = try await translate(word)
            XCTAssertEqual(StubURLProtocol.lastQuery["langpair"], "ja|en", "for \(word)")
        }
    }

    func testKanaOrKanjiWithoutLatinLettersIsJapanese() {
        for text in ["大丈夫", "了解", "3時", "5,000円", "笑", "ラーメン", "うん", "ｱﾘｶﾞﾄｳ", "駅はどこですか？", "時々", "参加×"] {
            XCTAssertTrue(MyMemoryTranslationService.isJapanese(text), text)
        }
    }

    /// × and ÷ lie among the accented Latin letters in Unicode (U+00D7, U+00F7) and are signs.
    /// × is the "no" mark of Japanese chat (参加×).
    func testMultiplicationAndDivisionSignsAreNotLatinLetters() {
        for text in ["参加×", "大丈夫×", "明日×", "了解÷"] {
            XCTAssertTrue(MyMemoryTranslationService.isJapanese(text), text)
        }
        // The letters on either side of them still are Latin letters
        for text in ["参加Ö", "参加Ø", "参加ö", "参加ø", "café 東京"] {
            let recognizer = NLLanguageRecognizer()
            recognizer.processString(text)
            XCTAssertEqual(
                MyMemoryTranslationService.isJapanese(text),
                recognizer.dominantLanguage == .japanese,
                text
            )
        }
        // Without kana or kanji a sign changes nothing
        XCTAssertFalse(MyMemoryTranslationService.isJapanese("3×4"))
        XCTAssertFalse(MyMemoryTranslationService.isJapanese("café"))
    }

    /// Without kana or kanji the answer is the recognizer's, and it does not take English for
    /// Japanese.
    func testEnglishIsNotJapanese() {
        for text in ["Hello", "Where is the station?", "I'm tired", "Thanks.", "OK", "", " "] {
            XCTAssertFalse(MyMemoryTranslationService.isJapanese(text), text)
        }
    }

    /// A message that mixes Latin letters with kana or kanji is left to the recognizer: an
    /// English sentence may quote a Japanese word.
    func testMixedTextFollowsTheRecognizer() {
        for text in ["I love 寿司", "This is 東京", "Johnです", "iPhoneを買った", "Wi-Fiはありますか？", "OKです"] {
            let recognizer = NLLanguageRecognizer()
            recognizer.processString(text)
            XCTAssertEqual(
                MyMemoryTranslationService.isJapanese(text),
                recognizer.dominantLanguage == .japanese,
                text
            )
        }
    }
}

// MARK: - Network stub

/// Answers every `URLSession.shared` request while it is registered. A request with no
/// prepared answer fails, so a test can never fall through to the real service.
final class StubURLProtocol: URLProtocol {
    private static let lock = NSLock()
    private static var answer: (status: Int, body: Data)?
    private static var recorded: [URLRequest] = []

    static func reset() {
        lock.lock()
        answer = nil
        recorded = []
        lock.unlock()
    }

    static func respond(httpStatus: Int, json: String) {
        lock.lock()
        answer = (httpStatus, Data(json.utf8))
        lock.unlock()
    }

    /// The shape of a successful MyMemory response.
    static func respond(translatedText: String) {
        let payload: [String: Any] = [
            "responseData": ["translatedText": translatedText],
            "responseStatus": 200,
        ]
        let data = try! JSONSerialization.data(withJSONObject: payload)
        respond(httpStatus: 200, json: String(decoding: data, as: UTF8.self))
    }

    static var requests: [URLRequest] {
        lock.lock()
        defer { lock.unlock() }
        return recorded
    }

    /// Query items of the most recent request, decoded.
    static var lastQuery: [String: String] {
        guard let url = requests.last?.url,
              let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems
        else { return [:] }
        return Dictionary(items.map { ($0.name, $0.value ?? "") }, uniquingKeysWith: { first, _ in first })
    }

    override class func canInit(with request: URLRequest) -> Bool { true }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        Self.lock.lock()
        Self.recorded.append(request)
        let answer = Self.answer
        Self.lock.unlock()

        guard let answer = answer, let url = request.url,
              let response = HTTPURLResponse(
                  url: url,
                  statusCode: answer.status,
                  httpVersion: "HTTP/1.1",
                  headerFields: ["Content-Type": "application/json"]
              )
        else {
            client?.urlProtocol(self, didFailWithError: URLError(.notConnectedToInternet))
            return
        }
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: answer.body)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}
