import SwiftUI

// The games the offline room can play, with nobody connected: Chatto Dash practice (DashPracticeView), and
// Emoji Match and Emoji Bingo as one phone plays them. Their rules are the phone's own
// (Services/Processing/OfflineGames.swift); the cards, the bingo ball and the bingo cell are the ones the room's
// games draw (EmojiMatchGameView, EmojiBingoGameView).

enum OfflineGame: String, Identifiable, CaseIterable {
    case match, bingo, dash

    var id: String { rawValue }

    var title: String {
        switch self {
        case .match: return "Emoji Match"
        case .bingo: return "Emoji Bingo"
        case .dash: return "Chatto Dash"
        }
    }

    var tagline: String {
        switch self {
        case .match: return "flip the pairs"
        case .bingo: return "roll & stamp"
        case .dash: return "3D obstacle race"
        }
    }

    var icon: String {
        switch self {
        case .match: return "o-cherry"
        case .bingo: return "g-clover"
        case .dash: return "o-shootingstar"
        }
    }

    var fill: Color {
        switch self {
        case .match: return EC.violetSoft
        case .bingo: return EC.mintSoft
        case .dash: return Color(hex: "cfe8ff")
        }
    }

    /// What this build can play with no connection
    static var playable: [OfflineGame] {
        allCases.filter { $0 != .dash || DashPracticeView.isAvailable }
    }

    /// The emoji both games are played with, with their names: the ones the room's bingo calls. Not the star,
    /// which is a bingo card's free space and never called
    static let deck: [OfflineEmoji] = BingoEmojiNames.names
        .filter { $0.key != OfflineBingo.free }
        .map { OfflineEmoji(emoji: $0.key, en: $0.value.en, ja: $0.value.ja) }
        .sorted { $0.emoji < $1.emoji }
}

// MARK: - Picking one

struct OfflineGamePicker: View {
    let lang: String
    let onPick: (OfflineGame) -> Void

    var body: some View {
        VStack(spacing: 14) {
            Text(L.t("Pick a game!", lang).uppercased())
                .font(.chunky(24))
                .foregroundStyle(EC.ink)
                .shadow(color: EC.yellow, radius: 0, y: 3)
                .padding(.top, 26)
            Text(L.t("These play on this iPhone, with no connection.", lang))
                .font(.round(13, .bold))
                .foregroundStyle(EC.inkSoft)
                .multilineTextAlignment(.center)
            ForEach(OfflineGame.playable) { game in
                Button {
                    Haptics.tap()
                    onPick(game)
                } label: {
                    HStack(spacing: 12) {
                        PackIcon(game.icon, size: 44)
                        VStack(alignment: .leading, spacing: 0) {
                            Text(L.t(game.title, lang))
                                .font(.chunky(18, relativeTo: .headline))
                                .foregroundStyle(EC.ink)
                            Text(L.t(game.tagline, lang))
                                .font(.round(12.5, .black))
                                .foregroundStyle(EC.ink.opacity(0.65))
                        }
                        Spacer(minLength: 0)
                        Image(systemName: "play.fill")
                            .font(.system(size: 14, weight: .black))
                            .foregroundStyle(EC.ink.opacity(0.5))
                    }
                    .padding(.horizontal, 12)
                    .frame(maxWidth: .infinity, minHeight: 68)
                    .ecCard(fill: game.fill, radius: 20, border: 3, shadow: 5)
                }
                .buttonStyle(.pressable)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 18)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(EC.paper.ignoresSafeArea())
    }
}

/// The top of a game's screen: a way out, its name, and something to its right
private struct OfflineGameHeader<Trailing: View>: View {
    let game: OfflineGame
    let lang: String
    let onClose: () -> Void
    @ViewBuilder var trailing: Trailing

    var body: some View {
        HStack(spacing: 10) {
            Button {
                Haptics.tap()
                onClose()
            } label: {
                Image(systemName: "xmark")
            }
            .buttonStyle(.roundIcon(.white, diameter: 40))
            .accessibilityLabel(L.t("Close", lang))
            PackIcon(game.icon, size: 30)
            Text(L.t(game.title, lang))
                .font(.chunky(19, relativeTo: .title3))
                .foregroundStyle(EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Spacer(minLength: 0)
            trailing
        }
        .padding(.horizontal, 14)
        .padding(.top, 8)
        .padding(.bottom, 8)
    }
}

/// A best result kept on the phone under a key: the lowest number is the best
private enum OfflineBest {
    static func read(_ key: String) -> Int? {
        let kept = UserDefaults.standard.integer(forKey: key)
        return kept > 0 ? kept : nil
    }

    /// Keeps `value` if it beats what is kept. Returns whether it did
    static func keep(_ value: Int, under key: String) -> Bool {
        if let kept = read(key), kept <= value { return false }
        UserDefaults.standard.set(value, forKey: key)
        return true
    }
}

// MARK: - Emoji Match

struct OfflineMatchView: View {
    let lang: String
    let onClose: () -> Void

    @State private var game: OfflineMatch?
    @State private var deal = 0
    @State private var confetti = 0
    @State private var newBest = false
    @State private var best = OfflineBest.read(OfflineMatchView.bestKey)

    private static let bestKey = "enchatto_offlineMatchBest"
    /// How long two cards that are not a pair stay up, as in a room's game
    private static let reveal: UInt64 = 1_200_000_000

    var body: some View {
        VStack(spacing: 10) {
            OfflineGameHeader(game: .match, lang: lang, onClose: onClose) {
                if game != nil {
                    Button {
                        Haptics.tap()
                        game = nil
                    } label: {
                        Image(systemName: "arrow.counterclockwise")
                    }
                    .buttonStyle(.roundIcon(.white, diameter: 40))
                    .accessibilityLabel(L.t("Play Again", lang))
                }
            }
            if let game {
                if game.finished {
                    finished(game)
                } else {
                    status(game)
                    board(game)
                }
            } else {
                setup
            }
        }
        .ecPaperBackground()
        .overlay { ConfettiBurst(trigger: confetti, count: 50).ignoresSafeArea().allowsHitTesting(false) }
    }

    private var setup: some View {
        VStack(spacing: 14) {
            Spacer(minLength: 0)
            PackIcon("o-cherry", size: 76)
            Text(L.t("Each picture is there twice: once in English, once in Japanese. Find the pairs!", lang))
                .font(.round(15, .bold))
                .foregroundStyle(EC.ink.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 28)
            if let best {
                ECChip(text: "\(L.t("Best", lang)): \(best) \(L.t("tries", lang))", fill: EC.yellowSoft)
            }
            Button(L.t("1 player", lang)) { start(players: 1) }
                .buttonStyle(.chunky(EC.blue))
            Button {
                start(players: 2)
            } label: {
                HStack(spacing: 8) {
                    LangBadge(lang: "en", size: 24)
                    Text(L.t("2 players", lang))
                    LangBadge(lang: "ja", size: 24)
                }
            }
            .buttonStyle(.chunky(EC.pink))
            Text(L.t("Two players take turns on this phone. A pair is another go.", lang))
                .font(.round(12, .bold))
                .foregroundStyle(EC.inkSoft)
                .multilineTextAlignment(.center)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 24)
    }

    private func start(players: Int) {
        Haptics.thump()
        var dice = SystemRandomNumberGenerator()
        game = OfflineMatch(deck: OfflineGame.deck, players: players, using: &dice)
        deal += 1
        newBest = false
    }

    private func status(_ game: OfflineMatch) -> some View {
        HStack(spacing: 10) {
            if game.players == 2 {
                ForEach(0..<2, id: \.self) { player in
                    let active = game.turn == player
                    HStack(spacing: 6) {
                        LangBadge(lang: player == 0 ? "en" : "ja", size: 24)
                        Text("\(game.scores[player])")
                            .font(.chunky(20))
                            .foregroundStyle(EC.ink)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .frame(maxWidth: .infinity)
                    .ecCard(fill: active ? EC.yellow : .white, radius: 16, border: 3, shadow: active ? 5 : 2)
                    .offset(y: active ? -2 : 0)
                    .accessibilityLabel(player == 0 ? "English" : "日本語")
                    .accessibilityValue("\(game.scores[player])")
                }
            } else {
                ECChip(text: "\(game.found)/\(game.total) \(L.t("pairs", lang))", fill: EC.mintSoft)
                ECChip(text: "\(game.tries) \(L.t("tries", lang))")
                if let best {
                    ECChip(text: "\(L.t("Best", lang)): \(best)", fill: EC.yellowSoft)
                }
                Spacer(minLength: 0)
            }
        }
        .padding(.horizontal, 16)
        .animation(.spring(response: 0.3, dampingFraction: 0.65), value: game.turn)
    }

    private func board(_ game: OfflineMatch) -> some View {
        GeometryReader { geo in
            let cols = 4
            let rows = Int(ceil(Double(game.cards.count) / Double(cols)))
            let gap: CGFloat = 9
            let cellW = (geo.size.width - gap * CGFloat(cols - 1)) / CGFloat(cols)
            let cellH = (geo.size.height - gap * CGFloat(rows - 1)) / CGFloat(rows) - 4
            let height = min(cellH, cellW * 1.3)
            let width = min(cellW, height / 0.8)
            LazyVGrid(columns: Array(repeating: GridItem(.fixed(width), spacing: gap), count: cols), spacing: gap) {
                ForEach(game.cards) { card in
                    FlipCardView(
                        card: EmojiMatchCard(
                            cardId: "offline_\(card.id)",
                            pairKey: "pair_\(card.pair)",
                            content: EmojiMatchContent(kind: "emoji", value: card.emoji, label: card.label),
                            isMatched: card.matched,
                            isRevealed: card.faceUp
                        ),
                        canFlip: !game.unsettled && !card.faceUp && !card.matched,
                        onFlip: { flip(card.id) }
                    )
                    .frame(width: width, height: height)
                }
            }
            // A new deal gets new card views, with nothing kept from the last
            .id(deal)
            .frame(width: geo.size.width, height: geo.size.height, alignment: .center)
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 14)
    }

    private func flip(_ id: Int) {
        guard var playing = game else { return }
        let result = playing.flip(id)
        game = playing
        switch result {
        case .ignored:
            break
        case .first:
            Haptics.tap()
        case .match:
            Haptics.success()
        case .finished:
            Haptics.success()
            confetti += 1
            if playing.players == 1 {
                newBest = OfflineBest.keep(playing.tries, under: OfflineMatchView.bestKey)
                best = OfflineBest.read(OfflineMatchView.bestKey)
            }
        case .miss:
            Haptics.tap()
            let dealt = deal
            Task {
                try? await Task.sleep(nanoseconds: OfflineMatchView.reveal)
                // Still the same game: a new deal in the meantime has nothing to turn back
                guard deal == dealt, var later = game else { return }
                later.settle()
                game = later
            }
        }
    }

    private func finished(_ game: OfflineMatch) -> some View {
        VStack(spacing: 14) {
            Spacer(minLength: 0)
            ChattoView(size: 96, hop: true)
            if game.players == 2 {
                if let winner = game.winner {
                    HStack(spacing: 10) {
                        LangBadge(lang: winner == 0 ? "en" : "ja", size: 36)
                        OutlinedText(L.t("WINS!", lang), size: 34, fill: EC.yellow, outline: 3)
                    }
                } else {
                    OutlinedText(L.t("IT'S A TIE!", lang), size: 30, fill: EC.yellow, outline: 3)
                }
                HStack(spacing: 12) {
                    ForEach(0..<2, id: \.self) { player in
                        HStack(spacing: 6) {
                            LangBadge(lang: player == 0 ? "en" : "ja", size: 24)
                            Text("\(game.scores[player]) \(L.t("pairs", lang))")
                                .font(.chunky(17))
                                .foregroundStyle(EC.ink)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .ecCard(fill: game.winner == player ? EC.yellow : .white, radius: 16, border: 3, shadow: 4)
                    }
                }
            } else {
                OutlinedText(L.t("ALL PAIRS!", lang), size: 32, fill: EC.yellow, outline: 3)
                Text("\(game.tries) \(L.t("tries", lang))")
                    .font(.chunky(22))
                    .foregroundStyle(EC.ink)
                if newBest {
                    ECChip(text: L.t("New best!", lang), fill: EC.pinkSoft)
                } else if let best {
                    ECChip(text: "\(L.t("Best", lang)): \(best) \(L.t("tries", lang))", fill: EC.yellowSoft)
                }
            }
            Button(L.t("Play Again", lang)) { start(players: game.players) }
                .buttonStyle(.chunky(EC.pink))
                .padding(.top, 6)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - Emoji Bingo

struct OfflineBingoView: View {
    let lang: String
    let onClose: () -> Void

    @State private var game = OfflineBingoView.deal()
    @State private var confetti = 0
    @State private var newBest = false
    @State private var best = OfflineBest.read(OfflineBingoView.bestKey)

    private static let bestKey = "enchatto_offlineBingoBest"

    private static func deal() -> OfflineBingo {
        var dice = SystemRandomNumberGenerator()
        return OfflineBingo(pool: OfflineGame.deck.map(\.emoji), using: &dice)
    }

    var body: some View {
        VStack(spacing: 10) {
            OfflineGameHeader(game: .bingo, lang: lang, onClose: onClose) {
                Button {
                    Haptics.tap()
                    again()
                } label: {
                    Image(systemName: "arrow.counterclockwise")
                }
                .buttonStyle(.roundIcon(.white, diameter: 40))
                .accessibilityLabel(L.t("Play Again", lang))
            }
            called
            rival
            GeometryReader { geo in
                card(fitting: geo.size)
                    .frame(width: geo.size.width, height: geo.size.height)
            }
            .padding(.horizontal, 14)
            if game.status == .playing {
                buttons
            } else {
                over
            }
        }
        .ecPaperBackground()
        .overlay { ConfettiBurst(trigger: confetti, count: 60).ignoresSafeArea().allowsHitTesting(false) }
    }

    private func again() {
        game = OfflineBingoView.deal()
        newBest = false
    }

    /// The emoji just called, by name in both languages, and the few before it
    private var called: some View {
        let latest = game.called.last
        let name = latest.flatMap { BingoEmojiNames.name(for: $0) }
        let earlier = Array(game.called.dropLast().reversed().prefix(6))
        return HStack(spacing: 14) {
            ZStack {
                if let latest {
                    BingoBall(emoji: latest).id(game.called.count)
                } else {
                    Circle()
                        .strokeBorder(EC.lineSoft, style: StrokeStyle(lineWidth: 3, dash: [6, 5]))
                        .frame(width: 84, height: 84)
                        .overlay(PackIcon("g-question", size: 44).opacity(0.5))
                }
            }
            .frame(width: 88, height: 92)
            VStack(alignment: .leading, spacing: 4) {
                if let name {
                    (Text(lang.hasPrefix("ja") ? name.ja : name.en) + Text("!  ")
                        + Text(lang.hasPrefix("ja") ? name.en : name.ja).font(.round(15, .black)).foregroundColor(EC.pink))
                        .font(.chunky(20))
                        .foregroundStyle(EC.ink)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                } else {
                    Text(L.t("Roll!", lang))
                        .font(.chunky(20))
                        .foregroundStyle(EC.ink)
                }
                Text("\(game.called.count)/\(game.deck.count) \(L.t("called", lang))")
                    .font(.round(12, .black))
                    .foregroundStyle(EC.ink.opacity(0.6))
                if !earlier.isEmpty {
                    HStack(spacing: 4) {
                        ForEach(Array(earlier.enumerated()), id: \.offset) { index, emoji in
                            EmojiArt(emoji: emoji, size: 20)
                                .padding(3)
                                .background(Circle().fill(.white))
                                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                                .opacity(max(0.45, 1 - Double(index) * 0.1))
                        }
                    }
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .ecCard(radius: 24, border: 3, shadow: 6)
        .padding(.horizontal, 14)
        .animation(.spring(response: 0.35, dampingFraction: 0.6), value: game.called.count)
    }

    /// Chatto, and how near its own card is to a line
    private var rival: some View {
        let needs = game.rivalNeeds
        return HStack(spacing: 8) {
            ChattoView(size: 30, bob: false)
            Text(needs == 0 ? L.t("Chatto has a line!", lang) : "\(L.t("Chatto needs", lang)) \(needs)")
                .font(.round(13, .black))
                .foregroundStyle(EC.ink)
            Spacer(minLength: 0)
            if let best {
                ECChip(text: "\(L.t("Best", lang)): \(best)", fill: EC.yellowSoft)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 5)
        .ecCard(fill: needs <= 1 ? EC.pinkSoft : .white, radius: 16, border: 2.5, shadow: 3)
        .padding(.horizontal, 14)
        .animation(.easeOut(duration: 0.2), value: needs)
    }

    private func card(fitting size: CGSize) -> some View {
        let gap: CGFloat = 6
        let side = max(36, min((size.width - 20 - gap * 4) / 5, (size.height - 20 - 30 - 8 - gap * 4) / 5))
        let waiting = game.waiting
        return VStack(spacing: 6) {
            HStack(spacing: gap) {
                ForEach(Array("BINGO"), id: \.self) { letter in
                    OutlinedText(String(letter), size: 22, fill: .white, outline: 2)
                        .frame(width: side)
                }
            }
            .accessibilityHidden(true)
            LazyVGrid(columns: Array(repeating: GridItem(.fixed(side), spacing: gap), count: 5), spacing: gap) {
                ForEach(0..<game.card.count, id: \.self) { index in
                    let emoji = game.card[index]
                    let hot = waiting.contains(index)
                    BingoCell(
                        emoji: emoji,
                        isMarked: game.marked.contains(index),
                        isHot: hot,
                        isFree: emoji == OfflineBingo.free,
                        isJustCalled: emoji == game.called.last
                    ) {
                        if game.mark(index) { Haptics.tap() }
                    }
                    .disabled(!hot || game.status != .playing)
                }
            }
        }
        .padding(10)
        .ecCard(fill: EC.blue, radius: 22, border: 3, shadow: 7)
    }

    private var buttons: some View {
        let canClaim = game.canClaim
        return HStack(spacing: 10) {
            Button {
                Haptics.thump()
                game.roll()
                if game.status == .lost { Haptics.error() }
            } label: {
                HStack(spacing: 6) {
                    PackIcon("g-arrows", size: 24)
                    Text(L.t("Roll!", lang))
                }
            }
            .buttonStyle(.chunky(EC.blue))
            .frame(width: 136)
            .disabled(canClaim)
            Button {
                guard game.claim() else { return }
                Haptics.success()
                confetti += 1
                newBest = OfflineBest.keep(game.called.count, under: OfflineBingoView.bestKey)
                best = OfflineBest.read(OfflineBingoView.bestKey)
            } label: {
                Text("BINGO!").font(.chunky(24))
            }
            .buttonStyle(.chunky(EC.pink))
            .disabled(!canClaim)
            .scaleEffect(canClaim ? 1.04 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.5), value: canClaim)
        }
        .padding(.horizontal, 16)
        .padding(.top, 6)
        .padding(.bottom, 10)
    }

    private var over: some View {
        let won = game.status == .won
        return VStack(spacing: 8) {
            OutlinedText(won ? L.t("BINGO!", lang) : L.t("Chatto got there first!", lang), size: won ? 34 : 22, fill: won ? EC.yellow : .white, outline: 3)
            if won {
                Text(newBest ? L.t("New best!", lang) : "\(game.called.count) \(L.t("called", lang))")
                    .font(.round(14, .black))
                    .foregroundStyle(EC.ink)
            }
            Button(L.t("Play Again", lang)) {
                Haptics.thump()
                again()
            }
            .buttonStyle(.chunky(EC.pink))
        }
        .padding(.horizontal, 16)
        .padding(.top, 4)
        .padding(.bottom, 10)
    }
}
