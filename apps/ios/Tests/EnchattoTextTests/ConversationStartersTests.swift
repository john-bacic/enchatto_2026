import XCTest
@testable import EnchattoText

/// `ConversationStarters` against the web's rules. StarterCases.jsonl is written by
/// apps/web/tests/web/conversation-starters.test.ts: moments of a room, made up from a fixed seed, each with what the
/// web's `startersFor` offers in it. The phone must offer the same, chip for chip, so that a change to the rules made
/// on one side only fails here. After a change on the web, run that test with -u, then this one.
final class ConversationStartersTests: XCTestCase {
    func testOffersWhatTheWebOffers() throws {
        let file = URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("StarterCases.jsonl")
        let lines = try String(contentsOf: file, encoding: .utf8).split(separator: "\n")
        XCTAssertGreaterThan(lines.count, 100)
        for (n, line) in lines.enumerated() {
            let moment = try JSONDecoder().decode(Moment.self, from: Data(line.utf8))
            let (starters, wakeAt) = ConversationStarters.startersFor(moment.input.starterInput)
            let expected = try moment.output.starters?.starters()
            let label = "line \(n + 1), \(expected?.key ?? "nothing offered")"
            XCTAssertEqual(starters?.key, expected?.key, label)
            XCTAssertEqual(starters?.chips.map(\.key), expected?.chips.map(\.key), label)
            XCTAssertEqual(starters, expected, label)
            XCTAssertEqual(wakeAt, moment.output.wakeAt, label)
        }
    }
}

// The web's shapes, as JSON.stringify writes them

private struct Moment: Decodable {
    let input: Input
    let output: Output
}

private struct Input: Decodable {
    let messages: [WebMessage]
    let people: [Person]
    let meId: String
    let hostId: String?
    let replyTo: WebMessage?
    let now: Double
    let month: Int
    let gameOn: Bool
    let shuffle: Int?
    let ideas: [String: [StarterPhrase]]?

    var starterInput: StarterInput {
        StarterInput(
            messages: messages.map(\.starterMessage),
            people: people.map { StarterPerson(id: $0._id, nickname: $0.nickname) },
            meId: meId,
            hostId: hostId,
            replyTo: replyTo?.starterMessage,
            now: now,
            month: month,
            gameOn: gameOn,
            shuffle: shuffle ?? 0,
            ideas: ideas ?? [:]
        )
    }
}

private struct WebMessage: Decodable {
    struct Processing: Decodable {
        let translatedText: String?
        let suggestions: [String]?
    }

    let _id: String
    let senderId: String
    let createdAt: Double
    let kind: String
    let text: String?
    let processing: Processing?

    var starterMessage: StarterMessage {
        StarterMessage(
            id: _id,
            senderId: senderId,
            kind: kind,
            text: text,
            translatedText: processing?.translatedText,
            suggestions: processing?.suggestions,
            createdAt: createdAt
        )
    }
}

private struct Person: Decodable {
    let _id: String
    let nickname: String
}

private struct Output: Decodable {
    struct WebStarters: Decodable {
        let key: String
        let chips: [WebChip]

        func starters() throws -> Starters {
            Starters(key: key, chips: try chips.map {
                let kind = try XCTUnwrap(StarterChipKind(rawValue: $0.kind), "a chip of a kind the phone does not know: \($0.kind)")
                return StarterChip(key: $0.key, kind: kind, phrase: $0.phrase, text: $0.text)
            })
        }
    }

    struct WebChip: Decodable {
        let key: String
        let kind: String
        let phrase: StarterPhrase?
        let text: String?
    }

    let starters: WebStarters?
    let wakeAt: Double?
}
