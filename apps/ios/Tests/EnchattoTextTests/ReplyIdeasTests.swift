import XCTest
@testable import EnchattoText

/// `ReplyIdeas`: what the on-device model is asked for replies, and what of its answers is kept. The answers below
/// are of the kinds it gave on a Mac with Apple Intelligence, slips included
final class ReplyIdeasTests: XCTestCase {
    private func reply(_ japanese: String, _ english: String) -> ReplyIdeas.Reply {
        ReplyIdeas.Reply(japanese: japanese, english: english)
    }

    func testThePromptShowsEachMessageWithItsTranslationAndAsksForTheLast() {
        let prompt = ReplyIdeas.prompt([
            ReplyIdeas.Line(name: "Yuki", text: "こんにちは！", translation: "Hello!"),
            ReplyIdeas.Line(name: "Sam", text: "I went to Kyoto\nyesterday", translation: "昨日京都に行った"),
            ReplyIdeas.Line(name: "Mia", text: "Same here", translation: "Same here"),
        ])
        XCTAssertEqual(prompt, """
            The chat, oldest first:
            Yuki: こんにちは！ (Hello!)
            Sam: I went to Kyoto yesterday (昨日京都に行った)
            Mia: Same here

            Suggest replies to Mia's last message.
            """)
    }

    func testALongMessageIsCutForTheModel() {
        let prompt = ReplyIdeas.prompt([ReplyIdeas.Line(name: "Ken", text: String(repeating: "あ", count: 500))])
        XCTAssertTrue(prompt.contains("Ken: \(String(repeating: "あ", count: ReplyIdeas.lineLimit))…\n"))
    }

    func testRepliesAreKeptAsTheyCameWhenNothingIsWrong() {
        let replies = [reply("いいね！", "Nice!"), reply("どうだった？", "How was it?"), reply("楽しそう！", "Sounds fun!")]
        XCTAssertEqual(ReplyIdeas.tidy(replies), replies)
    }

    func testQuotesAndFullStopsComeOffAndEllipsesStay() {
        XCTAssertEqual(
            ReplyIdeas.tidy([reply("「いいね」", "\"That's nice.\""), reply("そうなんだ。", "I see..."), reply(" うん ", "“Yeah”")]),
            [reply("いいね", "That's nice"), reply("そうなんだ", "I see..."), reply("うん", "Yeah")]
        )
    }

    func testRepliesWithTheModelsSlipsAreDropped() {
        let kept = ReplyIdeas.tidy([
            reply("いいね」}, {\"japanese\": \"すごい", "Nice"),          // its JSON, left in the reply
            reply("That sounds fun", "That sounds fun"),               // English where Japanese was asked for
            reply("楽しそう", "楽しそう"),                               // and the other way round
            reply("あなたは行った？", "Did you go?"),                    // あなた
            reply("", "Nice!"),
            reply(String(repeating: "すごい", count: 20), "Wow"),        // no line for a strip
            reply("どこに行ったの？", "Where did you go?"),
        ])
        XCTAssertEqual(kept, [reply("どこに行ったの？", "Where did you go?")])
    }

    func testAReplyThatSaysAgainWhatAnotherSaidIsDroppedInEitherLanguage() {
        let kept = ReplyIdeas.tidy([
            reply("いいね！", "Nice!"),
            reply("いいね", "Cool"),             // the same Japanese, but for the mark
            reply("素敵！", "nice"),              // the same English, but for case and the mark
            reply("最高！", "The best!"),
        ])
        XCTAssertEqual(kept, [reply("いいね！", "Nice!"), reply("最高！", "The best!")])
    }

    func testThreeAtMost() {
        let kept = ReplyIdeas.tidy([
            reply("いいね", "Nice"), reply("すごい", "Wow"), reply("本当？", "Really?"), reply("やった", "Yay"),
        ])
        XCTAssertEqual(kept.map(\.english), ["Nice", "Wow", "Really?"])
    }
}
