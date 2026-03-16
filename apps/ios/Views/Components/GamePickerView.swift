import SwiftUI

struct GamePickerView: View {
    let isHost: Bool
    let playerCount: Int
    var nextLevel: Int = 1
    let lang: String
    let onStartGame: (String, Int, Int) -> Void
    let onDismiss: () -> Void

    @State private var timerSeconds: Int = 20

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
