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

    private var isUrgent: Bool { status.phase == "drawing" && drawTimeLeft >= 0 && drawTimeLeft <= 3 }

    var body: some View {
        HStack(spacing: 8) {
            // Round indicator
            HStack(spacing: 3) {
                Text("R")
                    .opacity(0.6)
                Text("\(status.currentRound)/\(status.totalRounds)")
            }
            .font(.chunky(12))
            .foregroundStyle(EC.ink)
            .padding(.horizontal, 9)
            .padding(.vertical, 4)
            .background(Capsule().fill(EC.yellow))
            .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
            .rotationEffect(.degrees(-3))

            // Drawer avatar + phase
            HStack(spacing: 5) {
                if let avatarConfig = status.drawerAvatar {
                    AvatarDisc(avatarId: avatarConfig.value, size: 24)
                }

                if status.phase == "drawing" {
                    LoopClock { t in
                        PackIcon("g-pencil", size: 18)
                            .rotationEffect(.degrees(15 * loopWave(t, period: 1)))
                    }
                }

                Text(phaseLabel)
                    .font(.round(12, .black))
                    .foregroundStyle(isUrgent ? EC.red : EC.ink)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            // Top 3 scores
            HStack(spacing: 4) {
                ForEach(Array(sortedScores.prefix(3).enumerated()), id: \.element.id) { i, entry in
                    HStack(spacing: 3) {
                        AvatarDisc(avatarId: entry.score.avatar.value, size: 18)
                        Text("\(entry.score.correct)")
                            .font(.chunky(12))
                            .foregroundStyle(EC.ink)
                    }
                    .padding(.leading, 2)
                    .padding(.trailing, 7)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(i == 0 && entry.score.correct > 0 ? EC.yellowSoft : .white))
                    .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(EC.violetSoft)
        .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }
    }
}
