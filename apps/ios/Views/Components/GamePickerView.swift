import SwiftUI

enum GamePickerTab: String, CaseIterable {
    case wordRush = "Word Rush"
    case lostInTranslation = "Lost in Translation"
    case emojiBingo = "Emoji Bingo"
    case emojiMatch = "Emoji Match"
    case truthOrDare = "Truth or Dare"

    var icon: String {
        switch self {
        case .wordRush: return "g-bolt"
        case .lostInTranslation: return "g-pencil"
        case .emojiBingo: return "g-clover"
        case .emojiMatch: return "o-cherry"
        case .truthOrDare: return "g-question"
        }
    }

    var tileFill: Color {
        switch self {
        case .wordRush: return EC.yellow
        case .lostInTranslation: return EC.blueSoft
        case .emojiBingo: return EC.mintSoft
        case .emojiMatch: return EC.violetSoft
        case .truthOrDare: return EC.pinkSoft
        }
    }

    var buttonFill: Color {
        switch self {
        case .wordRush: return EC.pink
        case .lostInTranslation: return EC.blue
        case .emojiBingo: return EC.mint
        case .emojiMatch: return EC.violet
        case .truthOrDare: return EC.pink
        }
    }

    var tagline: String {
        switch self {
        case .wordRush: return "Emoji drop in — race to pick the word!"
        case .lostInTranslation: return "draw & guess"
        case .emojiBingo: return "roll & stamp"
        case .emojiMatch: return "flip the pairs"
        case .truthOrDare: return "brave or honest?"
        }
    }
}

private struct WordRushPack: Identifiable {
    let id: String
    let en: String
    let ja: String
    let icon: String
}

private let wordRushPacks: [WordRushPack] = [
    WordRushPack(id: "mix", en: "Mix", ja: "ミックス", icon: "o-gift"),
    WordRushPack(id: "foodie", en: "Foodie", ja: "グルメ", icon: "o-cake"),
    WordRushPack(id: "travel", en: "Travel", ja: "旅行", icon: "o-train"),
    WordRushPack(id: "slang", en: "Slang", ja: "スラング", icon: "re-laugh"),
    WordRushPack(id: "anime", en: "Anime", ja: "アニメ", icon: "o-shootingstar"),
    WordRushPack(id: "feelings", en: "Feelings", ja: "気持ち", icon: "re-heart"),
    WordRushPack(id: "chat", en: "Chat", ja: "会話", icon: "re-wave"),
]

struct GamePickerView: View {
    let isHost: Bool
    let playerCount: Int
    var nextLevel: Int = 1
    let lang: String
    let onStartGame: (String, Int, Int) -> Void
    let onStartWordRush: (_ pack: String, _ sayIt: Bool) -> Void
    let onStartEmojiMatch: () -> Void
    let onStartEmojiBingo: () -> Void
    let onStartTruthOrDare: (String) -> Void
    let onDismiss: () -> Void

    @State private var timerSeconds: Int = 20
    @State private var selectedGame: GamePickerTab = .wordRush
    @State private var todMode: String = "normal"
    @State private var wordRushPack: String = "mix"
    @State private var wordRushSayIt = true

    private var isJA: Bool { lang.hasPrefix("ja") }

    var body: some View {
        Group {
            if isHost {
                hostContent
            } else {
                nonHostContent
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(EC.paper.ignoresSafeArea())
    }

    private var nonHostContent: some View {
        VStack(spacing: 14) {
            ChattoView(size: 80)
            Text(L.t("Games", lang))
                .font(.chunky(24))
                .foregroundStyle(EC.ink)
            Text(L.t("Only the host can start a game.", lang))
                .font(.round(15, .bold))
                .foregroundStyle(EC.ink.opacity(0.7))
                .multilineTextAlignment(.center)
            Button(L.t("Got it", lang)) { onDismiss() }
                .buttonStyle(.chunky(EC.blue, size: .small))
                .padding(.horizontal, 40)
                .padding(.top, 4)
        }
        .padding(24)
    }

    // MARK: - Host

    private var hostContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 14) {
                Text(L.t("Pick a game!", lang).uppercased())
                    .font(.chunky(26))
                    .foregroundStyle(EC.ink)
                    .shadow(color: EC.yellow, radius: 0, y: 3)
                    .padding(.top, 22)
                    .accessibilityAddTraits(.isHeader)

                selectedCard
                    .id(selectedGame)
                    .transition(.asymmetric(
                        insertion: .scale(scale: 0.92).combined(with: .opacity),
                        removal: .opacity
                    ))

                LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                    ForEach(GamePickerTab.allCases.filter { $0 != selectedGame }, id: \.self) { tab in
                        gameTile(tab)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 12)
        }
        .safeAreaInset(edge: .bottom) {
            startButton
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 6)
                .background(EC.paper.ignoresSafeArea())
        }
    }

    private func gameTile(_ tab: GamePickerTab) -> some View {
        Button {
            Haptics.tap()
            withAnimation(.spring(response: 0.4, dampingFraction: 0.72)) { selectedGame = tab }
        } label: {
            HStack(spacing: 8) {
                PackIcon(tab.icon, size: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text(tab == .lostInTranslation && lang == "ja" ? "ロスト・イン・\nトランスレーション" : L.t(tab.rawValue, lang))
                        .font(.chunky(14, relativeTo: .headline))
                        .foregroundStyle(EC.ink)
                        .lineLimit(2)
                        .minimumScaleFactor(0.8)
                        .multilineTextAlignment(.leading)
                    Text(L.t(tab.tagline, lang))
                        .font(.round(10.5, .black))
                        .foregroundStyle(EC.ink.opacity(0.65))
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
            }
            .padding(.leading, 6)
            .padding(.trailing, 8)
            .frame(maxWidth: .infinity, minHeight: 62)
            .ecCard(fill: tab.tileFill, radius: 18, border: 3, shadow: 5)
        }
        .buttonStyle(.pressable)
        .accessibilityHint(L.t(tab.tagline, lang))
    }

    // MARK: - Expanded card

    private var selectedCard: some View {
        let tab = selectedGame
        return VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                PackIcon(tab.icon, size: 52)
                    .popIn()
                VStack(alignment: .leading, spacing: 3) {
                    Text(L.t(tab.rawValue, lang))
                        .font(.chunky(20, relativeTo: .title2))
                        .foregroundStyle(EC.ink)
                    Text(L.t(tab.tagline, lang))
                        .font(.round(13, .black))
                        .foregroundStyle(EC.ink.opacity(0.7))
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
            }

            switch tab {
            case .wordRush: wordRushDetails
            case .lostInTranslation: lostInTranslationDetails
            case .emojiBingo: emojiBingoDetails
            case .emojiMatch: emojiMatchDetails
            case .truthOrDare: truthOrDareDetails
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 27, style: .continuous)
                .strokeBorder(EC.pink, lineWidth: 4)
                .padding(-6)
        )
        .ecCard(fill: tab.tileFill, radius: 22, border: 3, shadow: 7)
        .overlay(alignment: .topTrailing) {
            if tab == .wordRush {
                Text(L.t("NEW!", lang))
                    .font(.chunky(12))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 3)
                    .background(RoundedRectangle(cornerRadius: 8).fill(EC.red))
                    .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(EC.ink, lineWidth: 2.5))
                    .rotationEffect(.degrees(10))
                    .gkWiggle(angle: 4)
                    .offset(x: 8, y: -12)
            }
        }
        .rotationEffect(.degrees(-1))
        .padding(.top, 6)
    }

    private func infoChips(_ items: [String]) -> some View {
        GKFlowLayout(spacing: 6, lineSpacing: 6) {
            ForEach(items, id: \.self) { ECChip(text: $0) }
        }
    }

    private func warning(_ text: String) -> some View {
        HStack(spacing: 6) {
            PackIcon("g-bang", size: 20)
            Text(text)
                .font(.round(12.5, .black))
                .foregroundStyle(EC.red)
        }
    }

    private var needsMorePlayers: Bool { playerCount < 2 }

    // MARK: Word Rush

    private var wordRushDetails: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                ECLabel(L.t("Pack", lang))
                GKFlowLayout(spacing: 6, lineSpacing: 6) {
                    ForEach(wordRushPacks) { pack in
                        GKChoiceChip(
                            text: isJA ? pack.ja : pack.en,
                            icon: pack.icon,
                            selected: wordRushPack == pack.id,
                            selectedFill: EC.pink
                        ) {
                            wordRushPack = pack.id
                        }
                    }
                }
            }

            Toggle(isOn: $wordRushSayIt) {
                HStack(alignment: .top, spacing: 8) {
                    PackIcon("g-ear", size: 30)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(L.t("Say it!", lang))
                            .font(.chunky(15))
                            .foregroundStyle(EC.ink)
                        Text(L.t("Every 2nd card, one player says the word out loud — everyone else judges! Native speakers count double.", lang))
                            .font(.round(11.5, .bold))
                            .foregroundStyle(EC.ink.opacity(0.7))
                            .fixedSize(horizontal: false, vertical: true)
                            .multilineTextAlignment(.leading)
                    }
                }
            }
            .toggleStyle(GKPopToggleStyle())
            .padding(10)
            .ecOutline(fill: .white.opacity(0.85), radius: 16, border: 2.5)

            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 6) {
                    directionPill("日本語の人 →", "English")
                    directionPill("English speakers →", "日本語")
                }
                Text(L.t("Works both ways: English speakers learn Japanese (with romaji), Japanese speakers learn English.", lang))
                    .font(.round(11.5, .bold))
                    .foregroundStyle(EC.ink.opacity(0.7))
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private func directionPill(_ from: String, _ to: String) -> some View {
        (Text(from + " ").font(.round(11.5, .bold)) + Text(to).font(.round(12, .black)))
            .foregroundStyle(EC.ink)
            .lineLimit(1)
            .minimumScaleFactor(0.75)
            .padding(.vertical, 5)
            .padding(.horizontal, 8)
            .frame(maxWidth: .infinity)
            .ecOutline(fill: .white.opacity(0.75), radius: 10, border: 2)
    }

    // MARK: Lost in Translation

    private var lostInTranslationDetails: some View {
        VStack(alignment: .leading, spacing: 10) {
            infoChips(["\(L.t("Level", lang)) \(nextLevel)", levelDescription, "\(playerCount) \(L.t("players", lang))"])

            VStack(alignment: .leading, spacing: 6) {
                ECLabel(L.t("Timer", lang))
                HStack(spacing: 6) {
                    ForEach([10, 20, 30, 0], id: \.self) { secs in
                        GKChoiceChip(text: secs == 0 ? L.t("Off", lang) : "\(secs)s", selected: timerSeconds == secs) {
                            timerSeconds = secs
                        }
                    }
                }
            }

            if needsMorePlayers {
                warning(L.t("Need at least 2 players to start.", lang))
            }
        }
    }

    // MARK: Emoji Bingo

    private var emojiBingoDetails: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(L.t("Mark emojis on your card as they're called. First to complete the pattern wins!", lang))
                .font(.round(13, .bold))
                .foregroundStyle(EC.ink.opacity(0.75))
                .fixedSize(horizontal: false, vertical: true)
            infoChips(["\(playerCount) \(L.t("players", lang))", "~3–5 min"])
        }
    }

    // MARK: Emoji Match

    private var emojiMatchDetails: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(L.t("Find matching emoji pairs! Take turns flipping cards.", lang))
                .font(.round(13, .bold))
                .foregroundStyle(EC.ink.opacity(0.75))
                .fixedSize(horizontal: false, vertical: true)
            infoChips(["\(playerCount) \(L.t("players", lang))", L.t("Works solo or multiplayer", lang)])
        }
    }

    // MARK: Truth or Dare

    private var truthOrDareDetails: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(L.t("A social game: answer a question or complete a challenge! Take turns with your group.", lang))
                .font(.round(13, .bold))
                .foregroundStyle(EC.ink.opacity(0.75))
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 6) {
                GKChoiceChip(text: L.t("Normal", lang), icon: "re-laugh", selected: todMode == "normal") { todMode = "normal" }
                GKChoiceChip(text: L.t("Deep", lang), icon: "o-whale", selected: todMode == "deep") { todMode = "deep" }
                Spacer(minLength: 0)
                ECChip(text: "\(playerCount) \(L.t("players", lang))")
            }

            if needsMorePlayers {
                warning(L.t("Need at least 2 players to start.", lang))
            }
        }
    }

    // MARK: - Start

    private var startDisabled: Bool {
        switch selectedGame {
        case .lostInTranslation, .truthOrDare: return needsMorePlayers
        case .wordRush, .emojiBingo, .emojiMatch: return false
        }
    }

    private var startLabel: String {
        switch selectedGame {
        case .wordRush: return L.t("Start Word Rush!", lang)
        case .lostInTranslation: return nextLevel > 1 ? "\(L.t("Level", lang)) \(nextLevel)" : L.t("Start Game", lang)
        case .emojiBingo: return L.t("Start Bingo!", lang)
        case .emojiMatch: return L.t("Start Match!", lang)
        case .truthOrDare: return L.t("Start Truth or Dare!", lang)
        }
    }

    private var startButton: some View {
        Button {
            Haptics.thump()
            switch selectedGame {
            case .wordRush: onStartWordRush(wordRushPack, wordRushSayIt)
            case .lostInTranslation: onStartGame("lost-in-translation", nextLevel, timerSeconds)
            case .emojiBingo: onStartEmojiBingo()
            case .emojiMatch: onStartEmojiMatch()
            case .truthOrDare: onStartTruthOrDare(todMode)
            }
        } label: {
            Text(startLabel.uppercased())
                .font(.chunky(22))
        }
        .buttonStyle(.chunky(selectedGame.buttonFill, size: .large))
        .disabled(startDisabled)
        .gkWiggle(!startDisabled, angle: 0.8, duration: 0.45)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: selectedGame)
    }

    private var levelDescription: String {
        let difficulty: String
        if nextLevel == 1 {
            difficulty = L.t("1 word with hint", lang)
        } else if nextLevel == 2 {
            difficulty = L.t("2 words", lang)
        } else {
            difficulty = "\(min(nextLevel, 4))+ \(L.t("words", lang))"
        }
        return "\(difficulty) · \(L.t("10 rounds", lang))"
    }
}

#Preview {
    GamePickerView(
        isHost: true,
        playerCount: 3,
        lang: "en",
        onStartGame: { _, _, _ in },
        onStartWordRush: { _, _ in },
        onStartEmojiMatch: {},
        onStartEmojiBingo: {},
        onStartTruthOrDare: { _ in },
        onDismiss: {}
    )
}
