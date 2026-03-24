import SwiftUI

enum GamePickerTab: String, CaseIterable {
    case lostInTranslation = "Lost in Translation"
    case emojifyr = "Emojifyr"
    case emojiMatch = "Emoji Match"
}

struct GamePickerView: View {
    let isHost: Bool
    let playerCount: Int
    var nextLevel: Int = 1
    let lang: String
    let onStartGame: (String, Int, Int) -> Void
    let onStartEmojifyr: () -> Void
    let onStartEmojiMatch: () -> Void
    let onDismiss: () -> Void

    @State private var timerSeconds: Int = 20
    @State private var selectedGame: GamePickerTab = .lostInTranslation

    var body: some View {
        VStack(spacing: 8) {
            if !isHost {
                nonHostContent
            } else {
                hostContent
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
    }

    private var nonHostContent: some View {
        VStack(spacing: 12) {
            Text("🎮")
                .font(.system(size: 40))
            Text(L.t("Games", lang))
                .font(.headline)
            Text(L.t("Only the host can start a game.", lang))
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button(L.t("Got it", lang)) {
                onDismiss()
            }
            .buttonStyle(.borderedProminent)
            .padding(.top, 4)
        }
    }

    private var hostContent: some View {
        VStack(spacing: 8) {
            Text("🎮")
                .font(.system(size: 28))

            // Game selector
            Picker("", selection: $selectedGame) {
                ForEach(GamePickerTab.allCases, id: \.self) { tab in
                    Text(tab.rawValue).tag(tab)
                }
            }
            .pickerStyle(.segmented)

            switch selectedGame {
            case .lostInTranslation:
                lostInTranslationContent
            case .emojifyr:
                emojifyrContent
            case .emojiMatch:
                emojiMatchContent
            }
        }
    }

    // MARK: - Lost in Translation

    private var lostInTranslationContent: some View {
        VStack(spacing: 8) {
            Text(L.t("Lost in Translation", lang))
                .font(.headline)

            // Level + player count on one line
            HStack {
                Text("\(L.t("Level", lang)) \(nextLevel)")
                    .font(.subheadline.bold())
                Text("·")
                    .foregroundStyle(.secondary)
                Text(levelDescription)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("·")
                    .foregroundStyle(.secondary)
                Text("\(playerCount) \(L.t("players", lang))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // Timer picker
            Picker("", selection: $timerSeconds) {
                Text("10s").tag(10)
                Text("20s").tag(20)
                Text("30s").tag(30)
                Text(L.t("Off", lang)).tag(0)
            }
            .pickerStyle(.segmented)
            .padding(.top, 4)

            if playerCount < 2 {
                Text(L.t("Need at least 2 players to start.", lang))
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            Button(nextLevel > 1 ? "\(L.t("Level", lang)) \(nextLevel)" : L.t("Start Game", lang)) {
                onStartGame("lost-in-translation", nextLevel, timerSeconds)
            }
            .buttonStyle(.borderedProminent)
            .frame(maxWidth: .infinity)
            .disabled(playerCount < 2)
            .padding(.top, 8)
        }
    }

    // MARK: - Emojifyr

    private var emojifyrContent: some View {
        VStack(spacing: 8) {
            Text(L.t("Emojifyr", lang))
                .font(.headline)

            Text(L.t("Write a sentence, turn it into emojis, and guess!", lang))
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Text("\(playerCount) \(L.t("players", lang))")
                .font(.caption)
                .foregroundStyle(.secondary)

            if playerCount < 2 {
                Text(L.t("Need at least 2 players to start.", lang))
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            Button(L.t("Start Game", lang)) {
                onStartEmojifyr()
            }
            .buttonStyle(.borderedProminent)
            .frame(maxWidth: .infinity)
            .disabled(playerCount < 2)
            .padding(.top, 8)
        }
    }

    // MARK: - Emoji Match

    private var emojiMatchContent: some View {
        VStack(spacing: 8) {
            Text(L.t("Emoji Match", lang))
                .font(.headline)

            Text(L.t("Find matching emoji pairs! Take turns flipping cards.", lang))
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Text("\(playerCount) \(L.t("players", lang))")
                .font(.caption)
                .foregroundStyle(.secondary)

            Text(L.t("Works solo or multiplayer", lang))
                .font(.caption)
                .foregroundStyle(.secondary)

            Button(L.t("Start Game", lang)) {
                onStartEmojiMatch()
            }
            .buttonStyle(.borderedProminent)
            .frame(maxWidth: .infinity)
            .padding(.top, 8)
        }
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
