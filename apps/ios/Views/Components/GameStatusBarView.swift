import SwiftUI

struct GameStatusBarView: View {
    let status: GameStatus
    let lang: String
    /// Countdown seconds from ViewModel (-1 = no countdown)
    var drawTimeLeft: Int = -1

    private var sortedScores: [(id: String, score: GameStatusScore)] {
        status.scores
            .map { (id: $0.key, score: $0.value) }
            .sorted { $0.score.correct > $1.score.correct }
    }

    private var phaseLabel: String {
        switch status.phase {
        case "drawing":
            let timerLabel = drawTimeLeft >= 0 ? " (\(drawTimeLeft)s)" : ""
            return "\(status.drawerName ?? "?") \(L.t("is drawing", lang))...\(timerLabel)"
        case "guessing":
            if status.guessesTotal > 0 {
                return "\(L.t("Guessing", lang))... (\(status.guessesSubmitted)/\(status.guessesTotal))"
            }
            return "\(L.t("Guessing", lang))..."
        default:
            return "\(L.t("Starting", lang))..."
        }
    }

    var body: some View {
        HStack(spacing: 10) {
            // Round indicator
            HStack(spacing: 3) {
                Text("R")
                    .opacity(0.8)
                Text("\(status.currentRound)/\(status.totalRounds)")
            }
            .font(.system(size: 12, weight: .bold))

            // Drawer avatar + phase
            HStack(spacing: 4) {
                if let avatarConfig = status.drawerAvatar {
                    let av = presetAvatar(for: avatarConfig.value)
                    ZStack {
                        Circle()
                            .fill(av.color)
                            .frame(width: 20, height: 20)
                        Text(av.emoji)
                            .font(.system(size: 11))
                    }
                }

                if status.phase == "drawing" {
                    Text("✏️")
                        .font(.system(size: 13))
                        .rotationEffect(.degrees(pencilRotation))
                        .onAppear { startPencilAnimation() }
                }

                Text(phaseLabel)
                    .font(.system(size: 12, weight: .medium))
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            // Top 3 scores
            HStack(spacing: 4) {
                ForEach(sortedScores.prefix(3), id: \.id) { entry in
                    let av = presetAvatar(for: entry.score.avatar.value)
                    HStack(spacing: 2) {
                        Text(av.emoji)
                            .font(.system(size: 10))
                        Text("\(entry.score.correct)")
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color.white.opacity(0.2))
                    .clipShape(Capsule())
                }
            }
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            LinearGradient(
                colors: [Color(red: 0.39, green: 0.40, blue: 0.95), Color(red: 0.55, green: 0.36, blue: 0.96)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }

    // MARK: - Pencil animation

    @State private var pencilRotation: Double = -15

    private func startPencilAnimation() {
        withAnimation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true)) {
            pencilRotation = 15
        }
    }
}
