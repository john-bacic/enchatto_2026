import XCTest
@testable import EnchattoText

/// The offline room's conversation: what is kept of each thing said, what waits for the phone's translator,
/// and what the translator's answers do to it. No screen and no translator here: readings are faked.
final class OfflineConversationTests: XCTestCase {
    private let reading: (String) -> String = { "<\($0)>" }
    private let ids = (0..<8).map { _ in UUID() }

    func testWhatIsSaidIsKeptInOrderWithJapaneseRead() {
        var c = OfflineConversation()
        c.say("  Where is the station?  ", in: "en", id: ids[0], reading: reading)
        c.say("駅はあそこです", in: "ja", id: ids[1], reading: reading)
        XCTAssertEqual(c.lines.map(\.text), ["Where is the station?", "駅はあそこです"])
        XCTAssertNil(c.lines[0].romaji, "English has no reading until its Japanese arrives")
        XCTAssertEqual(c.lines[1].romaji, "<駅はあそこです>")
        XCTAssertEqual(c.lines.map(\.otherLang), ["ja", "en"])
    }

    func testNothingAndOtherLanguagesAreNotSaid() {
        var c = OfflineConversation()
        XCTAssertNil(c.say("   \n ", in: "en", reading: reading))
        XCTAssertNil(c.say("Bonjour", in: "fr", reading: reading))
        XCTAssertTrue(c.lines.isEmpty)
    }

    func testEachLanguageWaitsForItsOwnTranslatorOldestFirst() {
        var c = OfflineConversation()
        c.say("one", in: "en", id: ids[0], reading: reading)
        c.say("いち", in: "ja", id: ids[1], reading: reading)
        c.say("two", in: "en", id: ids[2], reading: reading)
        XCTAssertEqual(c.waiting(from: "en").map(\.id), [ids[0], ids[2]])
        XCTAssertEqual(c.waiting(from: "ja").map(\.id), [ids[1]])
    }

    func testATranslationFillsTheLineAndReadsTheJapaneseSide() {
        var c = OfflineConversation()
        c.say("Thank you", in: "en", id: ids[0], reading: reading)
        c.say("どういたしまして", in: "ja", id: ids[1], reading: reading)
        c.translated(ids[0], as: " ありがとう ", reading: reading)
        c.translated(ids[1], as: "You're welcome", reading: reading)
        XCTAssertEqual(c.lines[0].translation, "ありがとう")
        XCTAssertEqual(c.lines[0].romaji, "<ありがとう>", "an English line is read by its Japanese translation")
        XCTAssertEqual(c.lines[1].translation, "You're welcome")
        XCTAssertEqual(c.lines[1].romaji, "<どういたしまして>", "a Japanese line keeps the reading of what was said")
        XCTAssertTrue(c.waiting(from: "en").isEmpty)
        XCTAssertTrue(c.waiting(from: "ja").isEmpty)
    }

    func testAFailureStopsWaitingUntilItIsAskedForAgain() {
        var c = OfflineConversation()
        c.say("Hello", in: "en", id: ids[0], reading: reading)
        c.failed(ids[0])
        XCTAssertTrue(c.lines[0].failed)
        XCTAssertTrue(c.waiting(from: "en").isEmpty)
        XCTAssertTrue(c.retry())
        XCTAssertEqual(c.waiting(from: "en").map(\.id), [ids[0]])
        XCTAssertFalse(c.retry(), "nothing failed is nothing to retry")
        // An empty answer is a failure, and a late failure does not undo a translation
        c.translated(ids[0], as: "  ", reading: reading)
        XCTAssertTrue(c.lines[0].failed)
        c.translated(ids[0], as: "こんにちは", reading: reading)
        c.failed(ids[0])
        XCTAssertEqual(c.lines[0].translation, "こんにちは")
        XCTAssertFalse(c.lines[0].failed)
    }

    func testALongConversationLosesItsOldestLines() {
        var c = OfflineConversation()
        for i in 0..<(OfflineConversation.capacity + 5) { c.say("line \(i)", in: "en", reading: reading) }
        XCTAssertEqual(c.lines.count, OfflineConversation.capacity)
        XCTAssertEqual(c.lines.first?.text, "line 5")
    }

    func testItComesBackFromItsFileAsItWas() throws {
        var c = OfflineConversation()
        c.say("Good morning", in: "en", at: Date(timeIntervalSince1970: 1_800_000_000), id: ids[0], reading: reading)
        c.translated(ids[0], as: "おはよう", reading: reading)
        c.say("おはよう", in: "ja", at: Date(timeIntervalSince1970: 1_800_000_010), id: ids[1], reading: reading)
        c.failed(ids[1])
        let back = try JSONDecoder().decode(OfflineConversation.self, from: JSONEncoder().encode(c))
        XCTAssertEqual(back, c)
        var cleared = back
        cleared.remove(ids[0])
        XCTAssertEqual(cleared.lines.map(\.id), [ids[1]])
        cleared.clear()
        XCTAssertTrue(cleared.lines.isEmpty)
    }
}
