import SwiftUI

struct WordRushResultsView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let game: WordRushGame
    let lang: String
    let onClose: () -> Void

    @State private var burst = 0
    @State private var busy = false

    private var ranked: [WordRushPlayer] {
        game.players.sorted { $0.score != $1.score ? $0.score > $1.score : $0.correct > $1.correct }
    }

    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                OutlinedText(L.t("BRAIN JUICE!!", lang), size: 40, fill: EC.yellow)
                    .shadow(color: EC.pink, radius: 0, x: 0, y: 4)
                    .rotationEffect(.degrees(-3))
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
                    .stampIn()
                    .padding(.top, 16)

                podium
                    .padding(.top, 10)

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 8) {
                        ForEach(Array(ranked.enumerated()), id: \.element.id) { i, p in
                            row(rank: i + 1, p)
                                .popIn(delay: 0.5 + Double(i) * 0.06)
                        }
                    }
                    .padding(14)
                }
                .frame(maxHeight: 280)
                .ecCard(radius: 26, shadow: 7)
                .padding(.horizontal, 16)

                Spacer(minLength: 12)

                HStack(spacing: 12) {
                    Button(L.t("BACK TO CHAT", lang)) {
                        viewModel.dismissWordRushResults()
                        onClose()
                    }
                    .buttonStyle(.chunky(EC.blue))
                    Button(L.t("AGAIN!", lang)) {
                        guard !busy else { return }
                        busy = true
                        Task {
                            await viewModel.playAgainWordRush()
                            busy = false
                        }
                    }
                    .buttonStyle(.chunky(EC.pink))
                    .disabled(busy)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 10)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            ConfettiBurst(trigger: burst, count: 80).ignoresSafeArea()
        }
        .background {
            RaysView(color: EC.yellow.opacity(0.4), rays: 22)
                .frame(width: 1000, height: 1000)
                .offset(y: -200)
                .allowsHitTesting(false)
        }
        .onAppear {
            Haptics.success()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { burst += 1 }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) { burst += 1 }
        }
    }

    // MARK: - Podium

    private var podium: some View {
        let top = Array(ranked.prefix(3))
        // visual order: 2nd, 1st, 3rd
        let order = top.count == 3 ? [1, 0, 2] : top.count == 2 ? [1, 0] : [0]
        let heights: [CGFloat] = [130, 96, 72]
        let fills = [EC.yellow, EC.blue, EC.pink]
        return HStack(alignment: .bottom, spacing: 8) {
            ForEach(order, id: \.self) { rank in
                if let p = top[wrSafe: rank] {
                    VStack(spacing: 4) {
                        AvatarDisc(avatarId: p.avatarValue, size: rank == 0 ? 76 : 62)
                            .overlay(alignment: .top) {
                                if rank == 0 && p.score > 0 {
                                    PackIcon("g-crown", size: 40).offset(y: -30).rotationEffect(.degrees(8))
                                }
                            }
                        Text(p.nickname).font(.round(13, .black)).foregroundStyle(EC.ink).lineLimit(1)
                        Text(p.score.formatted()).font(.chunky(18)).foregroundStyle(EC.ink)
                        ZStack {
                            UnevenTopRect().fill(fills[rank])
                            UnevenTopRect().stroke(EC.ink, lineWidth: 3.5)
                            OutlinedText("\(rank + 1)", size: 36, fill: .white)
                        }
                        .frame(height: heights[rank])
                    }
                    .frame(maxWidth: 120)
                    .popIn(delay: rank == 0 ? 0.35 : rank == 1 ? 0.2 : 0.1)
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 30)
    }

    private func row(rank: Int, _ p: WordRushPlayer) -> some View {
        HStack(spacing: 10) {
            Text("\(rank)").font(.chunky(16)).foregroundStyle(EC.inkSoft).frame(width: 22)
            AvatarDisc(avatarId: p.avatarValue, size: 38)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 4) {
                    Text(p.nickname).font(.round(15, .black)).foregroundStyle(EC.ink).lineLimit(1)
                    if p.participantId == viewModel.hostId {
                        ECChip(text: L.t("you", lang), fill: EC.blueSoft)
                    }
                }
                HStack(spacing: 10) {
                    stat("✓ \(p.correct)/\(game.totalCards)")
                    stat("🔥 \(p.bestStreak)")
                    if game.sayIt {
                        stat("🎤 +\(p.sayItBonus)")
                    }
                }
            }
            .layoutPriority(1)
            Spacer(minLength: 4)
            VStack(alignment: .trailing, spacing: 0) {
                Text("\(p.score.formatted())")
                    .font(.chunky(18))
                    .foregroundStyle(EC.ink)
                Text(L.t("pts", lang)).font(.round(10, .black)).foregroundStyle(EC.inkSoft)
            }
            .fixedSize()
        }
    }

    private func stat(_ value: String) -> some View {
        Text(value)
            .font(.round(12, .black))
            .foregroundStyle(EC.inkSoft)
            .lineLimit(1)
            .fixedSize()
    }
}

private struct UnevenTopRect: Shape {
    func path(in rect: CGRect) -> Path {
        let r: CGFloat = 16
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + r))
        p.addQuadCurve(to: CGPoint(x: rect.minX + r, y: rect.minY), control: CGPoint(x: rect.minX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX - r, y: rect.minY))
        p.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.minY + r), control: CGPoint(x: rect.maxX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        return p
    }
}
