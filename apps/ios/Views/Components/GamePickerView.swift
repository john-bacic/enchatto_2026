import SwiftUI

enum GamePickerTab: String, CaseIterable {
    case lostInTranslation = "Lost in Translation"
    case emojifyr = "Emojifyr"
    case emojiMatch = "Emoji Match"
    case truthOrDare = "Truth or Dare"
}

struct GamePickerView: View {
    let isHost: Bool
    let playerCount: Int
    var nextLevel: Int = 1
    let lang: String
    let onStartGame: (String, Int, Int) -> Void
    let onStartEmojifyr: () -> Void
    let onStartEmojiMatch: () -> Void
    let onStartTruthOrDare: () -> Void
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

            // Game selector — vertical list
            gameSelector

            switch selectedGame {
            case .lostInTranslation:
                lostInTranslationContent
            case .emojifyr:
                emojifyrContent
            case .emojiMatch:
                emojiMatchContent
            case .truthOrDare:
                truthOrDareContent
            }
        }
    }

    private var gameSelector: some View {
        VStack(spacing: 4) {
            ForEach(GamePickerTab.allCases, id: \.self) { tab in
                Button {
                    withAnimation(.easeInOut(duration: 0.15)) { selectedGame = tab }
                } label: {
                    HStack {
                        Text(gameTabIcon(tab))
                        Text(L.t(tab.rawValue, lang))
                            .font(.subheadline)
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(selectedGame == tab
                        ? gameTabGradient(tab)
                        : LinearGradient(colors: [Color(.systemBackground), Color(.systemBackground)], startPoint: .leading, endPoint: .trailing))
                    .foregroundColor(selectedGame == tab ? .white : .primary)
                    .fontWeight(selectedGame == tab ? .bold : .regular)
                    .cornerRadius(8)
                }
            }
        }
        .padding(4)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(10)
    }

    private func gameTabIcon(_ tab: GamePickerTab) -> String {
        switch tab {
        case .lostInTranslation: return "🎨"
        case .emojifyr: return "🔥"
        case .emojiMatch: return "🃏"
        case .truthOrDare: return "🎲"
        }
    }

    private func gameTabGradient(_ tab: GamePickerTab) -> LinearGradient {
        switch tab {
        case .lostInTranslation:
            return LinearGradient(colors: [Color(red: 0.23, green: 0.51, blue: 0.96), Color(red: 0.15, green: 0.39, blue: 0.93)], startPoint: .leading, endPoint: .trailing)
        case .emojifyr:
            return LinearGradient(colors: [Color(red: 0.94, green: 0.27, blue: 0.27), Color(red: 0.86, green: 0.15, blue: 0.15)], startPoint: .leading, endPoint: .trailing)
        case .emojiMatch:
            return LinearGradient(colors: [Color(red: 0.55, green: 0.36, blue: 0.96), Color(red: 0.49, green: 0.23, blue: 0.93)], startPoint: .leading, endPoint: .trailing)
        case .truthOrDare:
            return LinearGradient(colors: [Color(red: 0.92, green: 0.35, blue: 0.05), Color(red: 0.85, green: 0.47, blue: 0.02)], startPoint: .leading, endPoint: .trailing)
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

    // MARK: - Truth or Dare

    private var truthOrDareContent: some View {
        VStack(spacing: 8) {
            Text(L.t("Truth or Dare", lang))
                .font(.headline)

            Text(L.t("A social game: answer a question or complete a challenge! Take turns with your group.", lang))
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Text("\(playerCount) \(L.t("players", lang))")
                .font(.caption)
                .foregroundStyle(.secondary)

            Text(L.t("Rotates through all players", lang))
                .font(.caption)
                .foregroundStyle(.secondary)

            if playerCount < 2 {
                Text(L.t("Need at least 2 players to start.", lang))
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            Button(L.t("Start Game", lang)) {
                onStartTruthOrDare()
            }
            .buttonStyle(.borderedProminent)
            .frame(maxWidth: .infinity)
            .disabled(playerCount < 2)
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
