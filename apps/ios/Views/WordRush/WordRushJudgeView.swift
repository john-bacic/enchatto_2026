import SwiftUI

struct WordRushJudgeView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let game: WordRushGame
    let lang: String
    @ObservedObject var clipPlayer: WordRushClipPlayer

    @State private var autoPlayed = false

    private var me: String { viewModel.hostId }
    private var performer: WordRushPerformer? { game.performer }
    private var performerPlayer: WordRushPlayer? { performer.flatMap { game.player($0.participantId) } }
    private var performerName: String { performerPlayer?.nickname ?? "?" }
    private var amPerformer: Bool { performer?.participantId == me }
    private var myPlayer: WordRushPlayer? { game.player(me) }
    private var amNative: Bool {
        guard let myPlayer, let performer, !amPerformer else { return false }
        return myPlayer.learning != performer.lang
    }
    private var myVote: WordRushVote? { viewModel.wordRushMyVotes[game.phaseKey] }
    private var hasVoted: Bool { myVote != nil || game.votedIds.contains(me) }
    private var clipURL: URL? { performer?.clipUrl.flatMap(URL.init(string:)) }
    private var judges: [WordRushPlayer] { game.players.filter { $0.participantId != performer?.participantId } }

    var body: some View {
        ZStack {
            WordRushSpotlight(color: EC.yellow)

            VStack(spacing: 12) {
                HStack {
                    Spacer()
                    WordRushCountdownRing(startMs: game.phaseStartedAt, endMs: game.phaseEndsAt, size: 50)
                }
                .padding(.top, 8)

                header

                if clipURL != nil {
                    WordRushClipBar(url: clipURL, player: clipPlayer, tint: EC.blue, lang: lang)
                } else {
                    Text(L.t("No clip came through", lang)).font(.round(14, .black)).foregroundStyle(EC.inkSoft)
                }

                if amPerformer || myPlayer == nil {
                    VStack(spacing: 6) {
                        Text(L.t("The room is judging…", lang)).font(.chunky(19)).foregroundStyle(EC.ink)
                        ProgressView().tint(EC.ink)
                    }
                    .padding(.top, 20)
                } else {
                    Text(wrT("How did {name} do?", lang, ["name": performerName]))
                        .font(.chunky(20))
                        .foregroundStyle(EC.ink)
                        .padding(.top, 4)
                    voteCards
                    if amNative {
                        WordRushTeachButton(viewModel: viewModel, game: game, lang: lang, performerName: performerName)
                    }
                }

                Spacer(minLength: 0)
                votedRow
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
        }
        .onAppear(perform: autoPlay)
        .onChange(of: performer?.clipUrl) { _ in autoPlay() }
    }

    private func autoPlay() {
        guard !autoPlayed, !amPerformer, let clipURL else { return }
        autoPlayed = true
        clipPlayer.play(clipURL)
    }

    private var header: some View {
        VStack(spacing: 8) {
            if let performerPlayer {
                AvatarDisc(avatarId: performerPlayer.avatarValue, size: 80)
                    .overlay(alignment: .bottom) {
                        WordRushTag(text: wrT("{name} said it!", lang, ["name": performerName]).uppercased())
                            .fixedSize()
                            .offset(y: 20)
                    }
                    .padding(.bottom, 18)
            }
            if let performer {
                OutlinedText(performer.word, size: 34, fill: .white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.4)
                    .shadow(color: EC.blue, radius: 0, x: 0, y: 3)
            }
        }
    }

    // MARK: - Votes

    private var voteCards: some View {
        VStack(spacing: 12) {
            HStack(spacing: 10) {
                voteCard(.huh, icon: "j-huh", title: L.t("Huh?", lang), sub: L.t("try again!", lang), fill: EC.pinkSoft, tilt: -3)
                voteCard(.close, icon: "j-close", title: L.t("Close!", lang), sub: L.t("almost there", lang), fill: EC.yellowSoft, tilt: 0)
                voteCard(.native, icon: "j-native", title: L.t("Native!", lang), sub: L.t("nailed it", lang), fill: EC.mintSoft, tilt: 3)
            }
            if amNative {
                Text(L.t("×2 NATIVE JUDGE", lang))
                    .font(.chunky(12))
                    .foregroundStyle(EC.ink)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(EC.yellow))
                    .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                    .rotationEffect(.degrees(-2))
                    .stampIn(delay: 0.3)
            }
        }
    }

    private func voteCard(_ vote: WordRushVote, icon: String, title: String, sub: String, fill: Color, tilt: Double) -> some View {
        let selected = myVote == vote
        let dim = hasVoted && !selected
        return Button {
            Task { await viewModel.voteWordRush(vote) }
        } label: {
            VStack(spacing: 4) {
                PackIcon(icon, size: 62)
                Text(title).font(.chunky(17)).foregroundStyle(EC.ink).lineLimit(1).minimumScaleFactor(0.6)
                Text(sub).font(.round(11, .black)).foregroundStyle(EC.inkSoft).lineLimit(1).minimumScaleFactor(0.6)
            }
            .padding(.vertical, 14)
            .padding(.horizontal, 6)
            .frame(maxWidth: .infinity)
            .ecCard(fill: fill, radius: 22, shadow: selected ? 3 : 6)
            .overlay(
                RoundedRectangle(cornerRadius: 26).strokeBorder(EC.pink, lineWidth: selected ? 4 : 0).padding(-5).padding(.bottom, 6)
            )
            .overlay(alignment: .topTrailing) {
                if amNative {
                    Text("×2")
                        .font(.chunky(12))
                        .foregroundStyle(EC.ink)
                        .frame(width: 32, height: 32)
                        .background(Circle().fill(EC.yellow))
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                        .offset(x: 8, y: -10)
                }
            }
            .rotationEffect(.degrees(selected ? 0 : tilt))
            .scaleEffect(selected ? 1.06 : 1)
            .opacity(dim ? 0.4 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.5), value: selected)
        }
        .buttonStyle(.pressable)
        .disabled(hasVoted)
    }

    private var votedRow: some View {
        HStack(spacing: 8) {
            HStack(spacing: -6) {
                ForEach(judges.prefix(6)) { j in
                    WordRushAvatar(player: j, size: 36, checked: game.votedIds.contains(j.participantId),
                                   dimmed: !game.votedIds.contains(j.participantId))
                }
            }
            Text(wrT("{a}/{b} voted", lang, ["a": "\(game.votedIds.count)", "b": "\(judges.count)"]))
                .font(.round(12, .black))
                .foregroundStyle(EC.inkSoft)
        }
    }
}

/// Native judges record their own take for the performer
struct WordRushTeachButton: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let game: WordRushGame
    let lang: String
    let performerName: String

    @StateObject private var recorder = WordRushRecorder()
    @State private var sending = false

    private var teachClip: WordRushTeachClip? { game.teachClip }

    var body: some View {
        Group {
            if let teachClip {
                let mine = teachClip.byParticipantId == viewModel.hostId
                let name = game.player(teachClip.byParticipantId)?.nickname ?? "?"
                Label(mine ? L.t("Sent! They'll hear your version", lang) : wrT("{name} already taught this one", lang, ["name": name]),
                      systemImage: mine ? "checkmark.circle.fill" : "person.wave.2.fill")
                    .font(.round(13, .black))
                    .foregroundStyle(EC.ink)
                    .frame(maxWidth: .infinity, minHeight: 52)
                    .ecOutline(fill: EC.mintSoft, radius: 20, border: 2.5)
            } else {
                Button {
                    guard !sending else { return }
                    Task { await recorder.toggle() }
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: recorder.isRecording ? "stop.circle.fill" : "mic.fill")
                            .font(.system(size: 20, weight: .black))
                            .foregroundStyle(recorder.isRecording ? EC.red : EC.ink)
                        Text(wrT("Teach {name}", lang, ["name": performerName]))
                            .font(.chunky(16))
                            .foregroundStyle(EC.ink)
                        Text(sending ? L.t("Sending…", lang)
                             : recorder.isRecording ? wrT("● REC {t} · tap to stop", lang, ["t": String(format: "0:%02d", Int(recorder.elapsed))])
                             : L.t("record how you say it", lang))
                            .font(.round(11, .black))
                            .foregroundStyle(recorder.isRecording ? EC.red : EC.inkSoft)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                    .frame(maxWidth: .infinity, minHeight: 52)
                    .padding(.horizontal, 10)
                    .background(RoundedRectangle(cornerRadius: 20).fill(recorder.isRecording ? EC.pinkSoft : .white.opacity(0.85)))
                    .overlay(RoundedRectangle(cornerRadius: 20).strokeBorder(EC.ink, style: StrokeStyle(lineWidth: 2.5, dash: [7, 5])))
                }
                .buttonStyle(.pressable)
            }
        }
        .onAppear {
            recorder.onFinish = { url in
                sending = true
                Task {
                    await viewModel.submitWordRushTeachClip(url)
                    sending = false
                }
            }
        }
        .onDisappear { recorder.discardTake() }
    }
}
