import SwiftUI

struct WordRushVerdictView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let game: WordRushGame
    let lang: String
    @ObservedObject var clipPlayer: WordRushClipPlayer

    @State private var burst = 0
    @State private var flipped = 0

    private var me: String { viewModel.hostId }
    private var performer: WordRushPerformer? { game.performer }
    private var performerPlayer: WordRushPlayer? { performer.flatMap { game.player($0.participantId) } }
    private var verdict: WordRushVerdict? { game.verdict }
    private var isHost: Bool { viewModel.canControlWordRush }
    private var amNative: Bool {
        guard let p = game.player(me), let performer, performer.participantId != me else { return false }
        return p.learning != performer.lang
    }

    var body: some View {
        ZStack {
            VStack(spacing: 14) {
                if let performerPlayer {
                    AvatarDisc(avatarId: performerPlayer.avatarValue, size: 96)
                        .overlay(alignment: .bottom) {
                            WordRushTag(text: performerPlayer.nickname.uppercased(), fill: EC.blue, dot: false)
                                .fixedSize()
                                .offset(y: 18)
                        }
                        .padding(.top, 16)
                        .padding(.bottom, 14)
                }

                if let verdict {
                    CutInBanner(text: bannerText(verdict.label), fill: bannerColor, icon: bannerIcon(verdict.label))
                        .padding(.vertical, 4)

                    if verdict.votes.isEmpty {
                        Text(L.t("Nobody voted this time", lang)).font(.round(15, .black)).foregroundStyle(EC.inkSoft)
                    } else {
                        voteCards(verdict)
                    }

                    Text(wrT("+{n} BONUS", lang, ["n": "\(verdict.bonus)"]))
                        .font(.chunky(22))
                        .foregroundStyle(EC.ink)
                        .padding(.horizontal, 22)
                        .padding(.vertical, 10)
                        .background(Capsule().fill(EC.yellow))
                        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 3))
                        .background(Capsule().fill(EC.ink).offset(y: 5))
                        .stampIn(delay: 0.25 + Double(verdict.votes.count) * 0.25)
                }

                Spacer(minLength: 0)

                if let teach = game.teachClip, let url = URL(string: teach.url) {
                    let name = game.player(teach.byParticipantId)?.nickname ?? "?"
                    WordRushClipBar(url: url, player: clipPlayer, tint: EC.mint, caption: wrT("{name}'s version", lang, ["name": name]), lang: lang)
                        .popIn()
                } else if amNative {
                    WordRushTeachButton(viewModel: viewModel, game: game, lang: lang, performerName: performerPlayer?.nickname ?? "?")
                }

                if isHost {
                    Button(L.t("NEXT WORD ➜", lang)) { Task { await viewModel.skipWordRushPhase() } }
                        .buttonStyle(.chunky(EC.pink))
                } else {
                    WordRushSecondsLeft(endMs: game.phaseEndsAt) { wrT("Next word in {n}s", lang, ["n": "\($0)"]) }
                        .font(.round(14, .black))
                        .foregroundStyle(EC.inkSoft)
                        .padding(.bottom, 8)
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            ConfettiBurst(trigger: burst, count: 70).ignoresSafeArea()
        }
        .background {
            RaysView(color: bannerColor.opacity(0.35), rays: 20)
                .frame(width: 900, height: 900)
                .offset(y: -140)
                .allowsHitTesting(false)
        }
        .onAppear {
            guard let verdict else { return }
            if verdict.label == .native {
                Haptics.success()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { burst += 1 }
            } else {
                Haptics.thump()
            }
            for i in 0..<verdict.votes.count {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35 + Double(i) * 0.25) {
                    withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) { flipped = i + 1 }
                    Haptics.tap()
                }
            }
        }
    }

    private var bannerColor: Color {
        switch verdict?.label {
        case .native: return EC.mint
        case .close: return EC.yellow
        default: return EC.pink
        }
    }

    private func bannerText(_ label: WordRushVote) -> String {
        switch label {
        case .native: return L.t("NATIVE!", lang)
        case .close: return L.t("CLOSE!", lang)
        case .huh: return L.t("HUH?", lang)
        }
    }

    private func bannerIcon(_ label: WordRushVote) -> String {
        switch label {
        case .native: return "j-native"
        case .close: return "j-close"
        case .huh: return "j-huh"
        }
    }

    private func voteCards(_ verdict: WordRushVerdict) -> some View {
        HStack(spacing: 10) {
            ForEach(Array(verdict.votes.prefix(5).enumerated()), id: \.element.id) { i, v in
                let judge = game.player(v.judgeId)
                VStack(spacing: 8) {
                    WordRushFlipCard(vote: v, lang: lang, flipped: flipped > i)
                    if let judge {
                        AvatarDisc(avatarId: judge.avatarValue, size: 44)
                        Text(judge.participantId == me ? L.t("you", lang) : judge.nickname)
                            .font(.round(12, .black))
                            .foregroundStyle(EC.ink)
                            .lineLimit(1)
                    }
                }
                .frame(maxWidth: 110)
            }
        }
    }
}

private struct WordRushFlipCard: View {
    let vote: WordRushVerdictVote
    let lang: String
    let flipped: Bool

    var body: some View {
        ZStack {
            back.opacity(flipped ? 0 : 1)
            front
                .opacity(flipped ? 1 : 0)
                .rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0))
        }
        .frame(height: 112)
        .rotation3DEffect(.degrees(flipped ? 180 : 0), axis: (x: 0, y: 1, z: 0), perspective: 0.5)
    }

    private var back: some View {
        Text("?")
            .font(.chunky(36))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .ecCard(fill: EC.violet, radius: 20, shadow: 5)
    }

    private var front: some View {
        let (icon, title, fill): (String, String, Color) = {
            switch vote.vote {
            case .native: return ("j-native", L.t("Native!", lang), EC.mintSoft)
            case .close: return ("j-close", L.t("Close!", lang), EC.yellowSoft)
            case .huh: return ("j-huh", L.t("Huh?", lang), EC.pinkSoft)
            }
        }()
        return VStack(spacing: 4) {
            PackIcon(icon, size: 52)
            Text(title).font(.chunky(15)).foregroundStyle(EC.ink).lineLimit(1).minimumScaleFactor(0.6)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .ecCard(fill: fill, radius: 20, shadow: 5)
        .overlay(alignment: .topLeading) {
            if vote.weight > 1 {
                Text("×\(vote.weight)")
                    .font(.chunky(11))
                    .foregroundStyle(EC.ink)
                    .frame(width: 30, height: 30)
                    .background(Circle().fill(EC.yellow))
                    .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                    .offset(x: -8, y: -10)
            }
        }
    }
}
