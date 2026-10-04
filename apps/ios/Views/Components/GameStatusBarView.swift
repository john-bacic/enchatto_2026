import SwiftUI

struct GameStatusBarView: View {
    let status: GameStatus
    let lang: String
    /// Countdown seconds from ViewModel (-1 = no countdown)
    var drawTimeLeft: Int = -1
    /// The participant this device belongs to. In a team game their avatar sits on their team's points
    var myId: String? = nil

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
        VStack(spacing: 6) {
            statusRow

            if let teams = status.teamScores {
                teamRow(teams)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(EC.violetSoft)
        .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    private var statusRow: some View {
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

            // Top 3 scores. A team game shows its two teams under this row instead
            if status.teamScores == nil {
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
        }
    }

    /// Team game: each team's points next to its name, as the server sends them. They move when a round
    /// ends. The team with the drawing has the pencil, and the host's own team the host's avatar
    private func teamRow(_ teams: [GameTeamScore]) -> some View {
        HStack(spacing: 6) {
            ForEach(LITTeam.allCases) { team in
                let score = teams[team.rawValue]
                let mine = myId.map { score.memberIds.contains($0) } ?? false
                LITTeamPoints(
                    team: team,
                    points: score.points,
                    lang: lang,
                    isDrawing: status.drawingTeamIndex == team.rawValue,
                    drawingDone: status.phase != "drawing",
                    myAvatarId: mine ? myId.flatMap { status.scores[$0]?.avatar.value } : nil
                )
            }
        }
    }
}

#Preview("Team game") {
    let cat = AvatarConfig(type: .preset, value: "cat")
    let fox = AvatarConfig(type: .preset, value: "fox")
    return GameStatusBarView(
        status: GameStatus(
            gameType: "lost-in-translation", level: 1, currentRound: 4, totalRounds: 10, phase: "drawing",
            drawerName: "Aki", drawerAvatar: cat, guessesSubmitted: 0, guessesTotal: 0,
            scores: [
                "p0": GameStatusScore(correct: 2, total: 3, nickname: "Aki", avatar: cat),
                "p1": GameStatusScore(correct: 1, total: 3, nickname: "Ben", avatar: fox),
            ],
            timerSeconds: 20, drawStartedAt: nil,
            teams: Lenient([
                GameTeamScore(memberIds: ["p0", "p2", "p4"], points: 140),
                GameTeamScore(memberIds: ["p1", "p3"], points: 90),
            ]),
            drawingTeam: Lenient(0)
        ),
        lang: "ja",
        drawTimeLeft: 12,
        myId: "p1"
    )
}
