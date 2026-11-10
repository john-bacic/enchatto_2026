import Foundation

// The two games the offline room can play: Emoji Match and Emoji Bingo, as one phone plays them with nobody
// else connected. In a room these games are the server's (apps/web/convex/emojiMatch.ts, emojiBingo.ts); here
// the rules are the phone's own, written to play the same way. No screen in this file and no clock: the screens
// are Views/OfflineGamesView.swift. The deck (which emoji, and their names) and the dice are handed in.

/// An emoji with its name in the two languages
struct OfflineEmoji: Equatable {
    let emoji: String
    let en: String
    let ja: String
}

// MARK: - Emoji Match

/// Pairs to find on a 4 × 4 board: each emoji is there twice, once under its English name and once under its
/// Japanese one. One player counts their tries; two take turns on the one phone, and a pair found is another go.
struct OfflineMatch: Equatable {
    struct Card: Equatable, Identifiable {
        /// Its place on the board
        let id: Int
        let pair: Int
        let emoji: String
        let label: String
        var faceUp = false
        var matched = false
    }

    enum Flip: Equatable {
        /// Not a card that can be turned now
        case ignored
        case first
        case match
        /// Two that are not a pair: they stay up until `settle`
        case miss
        /// The match that was the last pair
        case finished
    }

    static let pairs = 8

    private(set) var cards: [Card]
    let players: Int
    /// Whose go it is, from 0
    private(set) var turn = 0
    /// Pairs found, by player
    private(set) var scores: [Int]
    /// Times two cards were turned over, by anyone
    private(set) var tries = 0
    private(set) var picked: [Int] = []

    init<G: RandomNumberGenerator>(deck: [OfflineEmoji], players: Int, pairs: Int = OfflineMatch.pairs, using dice: inout G) {
        let chosen = deck.shuffled(using: &dice).prefix(pairs)
        var made: [(pair: Int, emoji: String, label: String)] = []
        for (i, entry) in chosen.enumerated() {
            made.append((i, entry.emoji, entry.en))
            made.append((i, entry.emoji, entry.ja))
        }
        made.shuffle(using: &dice)
        cards = made.enumerated().map { Card(id: $0.offset, pair: $0.element.pair, emoji: $0.element.emoji, label: $0.element.label) }
        self.players = max(1, min(2, players))
        scores = Array(repeating: 0, count: self.players)
    }

    /// Two cards that are not a pair are face up, waiting to be turned back
    var unsettled: Bool { picked.count == 2 }
    var finished: Bool { !cards.isEmpty && cards.allSatisfy(\.matched) }
    var found: Int { scores.reduce(0, +) }
    var total: Int { cards.count / 2 }

    /// The player with the most pairs once every pair is found. Nil before then, and for a tie
    var winner: Int? {
        guard finished, let best = scores.max(), scores.filter({ $0 == best }).count == 1 else { return nil }
        return scores.firstIndex(of: best)
    }

    mutating func flip(_ id: Int) -> Flip {
        guard !unsettled, cards.indices.contains(id), !cards[id].faceUp, !cards[id].matched else { return .ignored }
        cards[id].faceUp = true
        picked.append(id)
        guard picked.count == 2 else { return .first }
        tries += 1
        let (a, b) = (picked[0], picked[1])
        guard cards[a].pair == cards[b].pair else { return .miss }
        cards[a].matched = true
        cards[b].matched = true
        scores[turn] += 1
        picked = []
        return finished ? .finished : .match
    }

    /// Turns two cards that were not a pair back over, and hands the go to the other player
    mutating func settle() {
        guard unsettled else { return }
        for id in picked { cards[id].faceUp = false }
        picked = []
        turn = (turn + 1) % players
    }
}

// MARK: - Emoji Bingo

/// Bingo against Chatto. Each roll calls an emoji; the player stamps it on their own card by hand and calls
/// bingo with a line of five, while Chatto's card stamps itself. Chatto calls bingo when the dice are picked up
/// again with a line of Chatto's already there: a line they both complete on the same call is the player's to
/// claim first.
struct OfflineBingo: Equatable {
    enum Status: Equatable { case playing, won, lost }

    static let free = "⭐"
    static let side = 5
    static let centre = 12
    static let lines: [[Int]] = [
        [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
        [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
        [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
    ]

    /// 25 cells, row by row, with the free space in the middle
    let card: [String]
    let rival: [String]
    /// Every emoji, in the order the rolls will call them
    let deck: [String]
    private(set) var called: [String] = []
    /// Cells the player has stamped. The free space starts stamped
    private(set) var marked: Set<Int> = [OfflineBingo.centre]
    private(set) var status: Status = .playing

    /// `pool` needs 24 emoji or more: a card has 24 different ones
    init<G: RandomNumberGenerator>(pool: [String], using dice: inout G) {
        func deal(_ dice: inout G) -> [String] {
            let picked = Array(pool.shuffled(using: &dice).prefix(24))
            return Array(picked.prefix(12)) + [OfflineBingo.free] + Array(picked.dropFirst(12))
        }
        card = deal(&dice)
        rival = deal(&dice)
        deck = pool.shuffled(using: &dice)
    }

    private static func line(in stamped: Set<Int>) -> Bool {
        lines.contains { $0.allSatisfy(stamped.contains) }
    }

    /// Stamps a line still needs, at best
    private static func needs(_ stamped: Set<Int>) -> Int {
        lines.map { $0.filter { !stamped.contains($0) }.count }.min() ?? OfflineBingo.side
    }

    /// Chatto's card stamps itself as emoji are called
    var rivalMarked: Set<Int> {
        let said = Set(called)
        return Set(rival.indices.filter { $0 == OfflineBingo.centre || said.contains(rival[$0]) })
    }

    var rivalHasLine: Bool { OfflineBingo.line(in: rivalMarked) }
    var rivalNeeds: Int { OfflineBingo.needs(rivalMarked) }
    var needs: Int { OfflineBingo.needs(marked) }
    var canClaim: Bool { status == .playing && OfflineBingo.line(in: marked) }

    /// Cells that have been called and not yet stamped
    var waiting: Set<Int> {
        let said = Set(called)
        return Set(card.indices.filter { !marked.contains($0) && said.contains(card[$0]) })
    }

    /// Calls the next emoji. Nil when the game is over, which this roll may be what decides: Chatto had a line
    @discardableResult
    mutating func roll() -> String? {
        guard status == .playing else { return nil }
        guard !rivalHasLine, called.count < deck.count else {
            status = .lost
            return nil
        }
        let emoji = deck[called.count]
        called.append(emoji)
        return emoji
    }

    /// Stamps a cell whose emoji has been called. Returns whether it was stamped
    @discardableResult
    mutating func mark(_ cell: Int) -> Bool {
        guard status == .playing, waiting.contains(cell) else { return false }
        marked.insert(cell)
        return true
    }

    @discardableResult
    mutating func claim() -> Bool {
        guard canClaim else { return false }
        status = .won
        return true
    }
}
