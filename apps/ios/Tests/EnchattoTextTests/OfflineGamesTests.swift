import XCTest
@testable import EnchattoText

/// Dice that come up the same every time for a seed
private struct Dice: RandomNumberGenerator {
    var state: UInt64
    init(_ seed: UInt64) { state = seed &+ 0x9E37_79B9_7F4A_7C15 }
    mutating func next() -> UInt64 {
        state &+= 0x9E37_79B9_7F4A_7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58_476D_1CE4_E5B9
        z = (z ^ (z >> 27)) &* 0x94D0_49BB_1331_11EB
        return z ^ (z >> 31)
    }
}

private let deck = (0..<30).map { OfflineEmoji(emoji: "e\($0)", en: "en\($0)", ja: "ja\($0)") }

final class OfflineMatchTests: XCTestCase {
    private func game(players: Int = 2, seed: UInt64 = 7) -> OfflineMatch {
        var dice = Dice(seed)
        return OfflineMatch(deck: deck, players: players, using: &dice)
    }

    /// Two cards of one pair, and a card of another
    private func cards(of g: OfflineMatch) -> (a: Int, b: Int, other: Int) {
        let first = g.cards.first { !$0.matched }!
        let partner = g.cards.first { $0.pair == first.pair && $0.id != first.id }!
        let other = g.cards.first { $0.pair != first.pair && !$0.matched }!
        return (first.id, partner.id, other.id)
    }

    func testTheBoardIsEightPairsEachInBothLanguages() {
        let g = game()
        XCTAssertEqual(g.cards.count, 16)
        XCTAssertEqual(g.cards.map(\.id), Array(0..<16))
        for pair in 0..<8 {
            let two = g.cards.filter { $0.pair == pair }
            XCTAssertEqual(two.count, 2)
            XCTAssertEqual(two[0].emoji, two[1].emoji)
            XCTAssertEqual(Set(two.map { String($0.label.prefix(2)) }), ["en", "ja"])
        }
        XCTAssertEqual(game(seed: 7), game(seed: 7), "the same dice deal the same board")
        XCTAssertNotEqual(game(seed: 7).cards.map(\.pair), game(seed: 8).cards.map(\.pair))
    }

    func testAPairScoresAndIsAnotherGo() {
        var g = game()
        let c = cards(of: g)
        XCTAssertEqual(g.flip(c.a), .first)
        XCTAssertEqual(g.flip(c.a), .ignored, "a card that is up cannot be turned again")
        XCTAssertEqual(g.flip(c.b), .match)
        XCTAssertEqual(g.scores, [1, 0])
        XCTAssertEqual(g.turn, 0)
        XCTAssertEqual(g.tries, 1)
        XCTAssertFalse(g.unsettled)
        XCTAssertEqual(g.flip(c.a), .ignored, "nor one that is found")
    }

    func testAMissStaysUpUntilSettledThenTheOtherPlays() {
        var g = game()
        let c = cards(of: g)
        XCTAssertEqual(g.flip(c.a), .first)
        XCTAssertEqual(g.flip(c.other), .miss)
        XCTAssertTrue(g.unsettled)
        XCTAssertEqual(g.flip(c.b), .ignored, "nothing turns while two are up")
        XCTAssertEqual(g.turn, 0)
        g.settle()
        XCTAssertFalse(g.cards[c.a].faceUp)
        XCTAssertFalse(g.cards[c.other].faceUp)
        XCTAssertEqual(g.turn, 1)
        XCTAssertEqual(g.scores, [0, 0])
        g.settle()
        XCTAssertEqual(g.turn, 1, "settling with nothing up changes nothing")
        XCTAssertEqual(g.flip(99), .ignored)
    }

    func testOnePlayerKeepsTheGoAndCountsTries() {
        var g = game(players: 1)
        let c = cards(of: g)
        _ = g.flip(c.a)
        XCTAssertEqual(g.flip(c.other), .miss)
        g.settle()
        XCTAssertEqual(g.turn, 0)
        XCTAssertEqual(g.tries, 1)
        XCTAssertEqual(g.scores, [0])
    }

    func testTheLastPairEndsItAndTheMostPairsWin() {
        var g = game()
        // The first player finds five pairs, misses, and the second finds the other three
        for _ in 0..<5 {
            let c = cards(of: g)
            _ = g.flip(c.a)
            XCTAssertEqual(g.flip(c.b), .match)
        }
        let c = cards(of: g)
        _ = g.flip(c.a)
        _ = g.flip(c.other)
        g.settle()
        XCTAssertNil(g.winner)
        var last = OfflineMatch.Flip.ignored
        while !g.finished {
            let c = g.cards.first { !$0.matched }!
            let partner = g.cards.first { $0.pair == c.pair && $0.id != c.id }!
            _ = g.flip(c.id)
            last = g.flip(partner.id)
        }
        XCTAssertEqual(last, .finished)
        XCTAssertEqual(g.scores, [5, 3])
        XCTAssertEqual(g.found, g.total)
        XCTAssertEqual(g.winner, 0)
        XCTAssertEqual(g.tries, 9)
    }

    func testFourPairsEachIsATie() {
        var g = game()
        while !g.finished {
            if g.scores[g.turn] == 4 {
                // This player has their four: a miss hands the board over
                let open = g.cards.filter { !$0.matched }
                _ = g.flip(open[0].id)
                _ = g.flip(open.first { $0.pair != open[0].pair }!.id)
                g.settle()
                continue
            }
            let c = g.cards.first { !$0.matched }!
            _ = g.flip(c.id)
            _ = g.flip(g.cards.first { $0.pair == c.pair && $0.id != c.id }!.id)
        }
        XCTAssertEqual(g.scores, [4, 4])
        XCTAssertNil(g.winner)
    }
}

final class OfflineBingoTests: XCTestCase {
    private let pool = (0..<48).map { "e\($0)" }

    private func game(seed: UInt64) -> OfflineBingo {
        var dice = Dice(seed)
        return OfflineBingo(pool: pool, using: &dice)
    }

    /// Plays a game out as someone who stamps everything and claims the moment they can
    private func played(seed: UInt64) -> OfflineBingo {
        var g = game(seed: seed)
        while g.status == .playing {
            if g.claim() { break }
            guard g.roll() != nil else { break }
            for cell in g.waiting { g.mark(cell) }
        }
        return g
    }

    func testACardIsTwentyFourDifferentEmojiRoundAFreeMiddle() {
        let g = game(seed: 3)
        for card in [g.card, g.rival] {
            XCTAssertEqual(card.count, 25)
            XCTAssertEqual(card[OfflineBingo.centre], OfflineBingo.free)
            XCTAssertEqual(Set(card).count, 25)
        }
        XCTAssertNotEqual(g.card, g.rival)
        XCTAssertEqual(g.deck.sorted(), pool.sorted(), "every emoji is called once")
        XCTAssertEqual(g.marked, [OfflineBingo.centre])
        XCTAssertEqual(g.needs, 4)
        XCTAssertEqual(g.rivalNeeds, 4)
        XCTAssertEqual(game(seed: 3), game(seed: 3))
    }

    func testOnlyWhatWasCalledCanBeStamped() {
        var g = game(seed: 3)
        let onCard = g.card.firstIndex { $0 != OfflineBingo.free }!
        XCTAssertFalse(g.mark(onCard), "nothing has been called")
        XCTAssertFalse(g.claim())
        // Roll until something on the card comes up
        while g.waiting.isEmpty { XCTAssertNotNil(g.roll()) }
        let cell = g.waiting.first!
        XCTAssertTrue(g.mark(cell))
        XCTAssertFalse(g.mark(cell), "a stamped cell is not stamped twice")
        XCTAssertFalse(g.mark(OfflineBingo.centre))
        XCTAssertTrue(g.waiting.isEmpty || !g.waiting.contains(cell))
    }

    func testEveryGameEndsWithALineForWhoeverWon() {
        var won = 0
        var lost = 0
        for seed in 0..<120 {
            let g = played(seed: UInt64(seed))
            switch g.status {
            case .won:
                won += 1
                XCTAssertTrue(OfflineBingo.lines.contains { $0.allSatisfy(g.marked.contains) })
            case .lost:
                lost += 1
                XCTAssertTrue(g.rivalHasLine)
            case .playing:
                XCTFail("seed \(seed) never ended")
            }
            XCTAssertLessThanOrEqual(g.called.count, pool.count)
            XCTAssertNil({ var again = g; return again.roll() }(), "nothing is called once it is over")
        }
        // Someone who stamps everything and claims at once wins ties, so wins more than half, and not always
        XCTAssertGreaterThan(won, lost)
        XCTAssertGreaterThan(lost, 10)
    }

    func testChattoWinsWhenTheDiceArePickedUpWithItsLineThere() {
        // A game Chatto wins against someone who never stamps: the roll after its line is the one that ends it
        var g = game(seed: 5)
        var rolls = 0
        while g.status == .playing {
            let hadLine = g.rivalHasLine
            let got = g.roll()
            rolls += 1
            if hadLine {
                XCTAssertNil(got)
                XCTAssertEqual(g.status, .lost)
            } else {
                XCTAssertNotNil(got)
            }
            XCTAssertLessThan(rolls, 60)
        }
        XCTAssertEqual(g.status, .lost)
        XCTAssertFalse(g.claim())
        XCTAssertFalse(g.mark(g.card.indices.first { $0 != OfflineBingo.centre }!))
    }

    func testALineBothCompleteOnOneCallIsThePlayersToClaim() {
        // Found by search: a deal where both have a line after the same call
        for seed in 0..<4000 {
            var g = game(seed: UInt64(seed))
            while g.status == .playing, !g.rivalHasLine, !g.canClaim {
                g.roll()
                for cell in g.waiting { g.mark(cell) }
            }
            guard g.rivalHasLine, g.canClaim else { continue }
            XCTAssertTrue(g.claim())
            XCTAssertEqual(g.status, .won)
            return
        }
        XCTFail("no deal in 4000 had both lines complete on the same call")
    }
}
