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
/// `NLLanguageRecognizer`. These tests only need English sentences not to be taken for Japanese
/// and a sentence with kana to be taken for Japanese, which is as safe as detection gets.
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

    // MARK: - Known defects

    func testJapaneseWrittenOnlyInKanjiIsTranslatedIntoEnglish() async throws {
        // DEFECT: `detectLanguage` trusts NLLanguageRecognizer, which takes a short message
        // written only in kanji for Chinese, and the service treats everything that is not
        // Japanese as English. One-word replies such as 大丈夫 and 了解 are therefore sent to
        // be translated from English into Japanese ("en|ja").
        //
        // Which words are affected is up to the operating system (東京 and 日本 are recognised
        // on macOS 26.6), so a word this macOS does recognise as Japanese is left out here.
        for word in ["大丈夫", "了解", "今日", "学生"] {
            let recognizer = NLLanguageRecognizer()
            recognizer.processString(word)
            if recognizer.dominantLanguage == .japanese { continue }

            StubURLProtocol.respond(translatedText: "ok")
            _ = try await translate(word)
            XCTExpectDefect(StubURLProtocol.lastQuery["langpair"] ?? "no request", shouldBe: "ja|en")
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
