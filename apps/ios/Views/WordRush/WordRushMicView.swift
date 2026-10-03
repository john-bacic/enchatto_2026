import SwiftUI

struct WordRushMicView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let game: WordRushGame
    let lang: String
    @ObservedObject var clipPlayer: WordRushClipPlayer

    @StateObject private var recorder = WordRushRecorder()
    @State private var sending = false

    private var me: String { viewModel.hostId }
    private var performer: WordRushPerformer? { game.performer }
    private var performerPlayer: WordRushPlayer? { performer.flatMap { game.player($0.participantId) } }
    private var amPerformer: Bool { performer?.participantId == me }
    private var isHost: Bool { viewModel.canControlWordRush }

    var body: some View {
        ZStack {
            WordRushSpotlight()

            VStack(spacing: 12) {
                HStack {
                    Spacer()
                    WordRushCountdownRing(startMs: game.phaseStartedAt, endMs: game.phaseEndsAt, size: 50)
                }
                .padding(.top, 8)

                stage

                if amPerformer {
                    recordControls
                } else {
                    waiting
                }

                Spacer(minLength: 0)
                judgesPanel
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
        }
        .onAppear {
            if amPerformer { Haptics.thump() }
        }
        .onDisappear { recorder.discardTake() }
    }

    // MARK: - Stage

    private var stage: some View {
        VStack(spacing: 10) {
            if let performerPlayer {
                ZStack {
                    if !amPerformer || recorder.isRecording {
                        LoopClock { t in
                            let p = t.truncatingRemainder(dividingBy: 1.4) / 1.4
                            Circle()
                                .stroke(EC.red.opacity(0.35), lineWidth: 6)
                                .frame(width: 120, height: 120)
                                .scaleEffect(1 + 0.3 * p)
                                .opacity(1 - p)
                        }
                    }
                    AvatarDisc(avatarId: performerPlayer.avatarValue, size: 104)
                }
                .overlay(alignment: .bottom) {
                    WordRushTag(text: amPerformer ? L.t("YOUR TURN ON THE MIC!", lang) : L.t("ON THE MIC!", lang))
                        .fixedSize()
                        .offset(y: 22)
                }
                .padding(.bottom, 20)
            }

            OutlinedText(L.t("Say it!", lang), size: 34, fill: EC.yellow)
                .shadow(color: EC.pink, radius: 0, x: 0, y: 3)
                .stampIn(delay: 0.1)

            if let performer {
                HStack(spacing: 8) {
                    OutlinedText(performer.word, size: 38, fill: .white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.4)
                        .shadow(color: EC.blue, radius: 0, x: 0, y: 4)
                    WordRushHearButton(text: performer.word, lang: performer.lang, size: 40)
                }
                if !performer.kana.isEmpty {
                    Text(performer.kana == performer.word ? performer.romaji : "\(performer.kana) · \(performer.romaji)")
                        .font(.round(17, .black))
                        .foregroundStyle(EC.pink)
                }
            }
        }
    }

    // MARK: - Performer

    @ViewBuilder
    private var recordControls: some View {
        if let url = recorder.recordedURL, !recorder.isRecording {
            VStack(spacing: 12) {
                WordRushClipBar(url: url, player: clipPlayer, tint: EC.pink, caption: L.t("Your take", lang), lang: lang)
                HStack(spacing: 10) {
                    Button(L.t("Retake", lang)) {
                        clipPlayer.stop()
                        recorder.discardTake()
                    }
                    .buttonStyle(.chunky(.white))
                    Button(sending ? L.t("Sending…", lang) : L.t("SEND!", lang)) { send(url) }
                        .buttonStyle(.chunky(EC.pink))
                        .disabled(sending)
                }
            }
            .padding(.top, 6)
            .popIn()
        } else {
            VStack(spacing: 8) {
                Button {
                    Task { await recorder.toggle() }
                } label: {
                    ZStack {
                        Circle()
                            .stroke(EC.red.opacity(0.3), lineWidth: 10)
                            .frame(width: 168, height: 168)
                            .scaleEffect(recorder.isRecording ? 1 + recorder.level * 0.25 : 1)
                            .animation(.easeOut(duration: 0.08), value: recorder.level)
                        Circle()
                            .fill(EC.red)
                            .frame(width: 132, height: 132)
                            .overlay(Circle().strokeBorder(EC.ink, lineWidth: 4))
                            .background(Circle().fill(EC.ink).offset(y: 7))
                        Image(systemName: recorder.isRecording ? "stop.fill" : "mic.fill")
                            .font(.system(size: 52, weight: .black))
                            .foregroundStyle(.white)
                    }
                }
                .buttonStyle(.pressable)
                .accessibilityLabel(recorder.isRecording ? L.t("Stop", lang) : L.t("Record", lang))
                .accessibilityIdentifier("wordrush-record")

                if recorder.permissionDenied {
                    Text(L.t("Mic access is blocked. Allow the microphone in Settings, or skip this one.", lang))
                        .font(.round(13, .black))
                        .foregroundStyle(EC.red)
                        .multilineTextAlignment(.center)
                } else if recorder.isRecording {
                    Text(wrT("● REC {t} · tap to stop", lang, ["t": String(format: "0:%02d", Int(recorder.elapsed))]))
                        .font(.chunky(15))
                        .foregroundStyle(EC.red)
                } else {
                    Text(L.t("Tap to record (5s max)", lang))
                        .font(.round(13, .black))
                        .foregroundStyle(EC.inkSoft)
                }
            }
        }

        Button(L.t("Skip", lang)) {
            recorder.discardTake()
            Task { await viewModel.skipWordRushMic() }
        }
        .font(.round(14, .black))
        .foregroundStyle(EC.inkSoft)
        .disabled(sending)
    }

    private func send(_ url: URL) {
        guard !sending else { return }
        sending = true
        clipPlayer.stop()
        Task {
            await viewModel.submitWordRushClip(url)
            sending = false
        }
    }

    // MARK: - Audience

    private var waiting: some View {
        VStack(spacing: 10) {
            HStack(spacing: 8) {
                LoopClock { t in
                    HStack(spacing: 8) {
                        ForEach(0..<3, id: \.self) { i in
                            Circle()
                                .fill([EC.pink, EC.yellow, EC.blue][i])
                                .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))
                                .frame(width: 16, height: 16)
                                .offset(y: -3 - 7 * loopWave(t, period: 0.9, delay: Double(i) * 0.15))
                        }
                    }
                }
            }
            .padding(.top, 16)
            Text(wrT("{name}'s on the mic!", lang, ["name": performerPlayer?.nickname ?? "?"]))
                .font(.chunky(19))
                .foregroundStyle(EC.ink)
            Text(L.t("Get your judging thumbs ready…", lang))
                .font(.round(14, .bold))
                .foregroundStyle(EC.inkSoft)
            if isHost {
                Button(L.t("Skip", lang)) { Task { await viewModel.skipWordRushMic() } }
                    .font(.round(13, .black))
                    .foregroundStyle(EC.inkSoft)
            }
        }
    }

    private var judgesPanel: some View {
        let judges = game.players.filter { $0.participantId != performer?.participantId }
        let target = performer?.lang ?? "en"
        return VStack(spacing: 10) {
            HStack(spacing: 8) {
                Text(L.t("Judges", lang)).font(.chunky(15)).foregroundStyle(EC.ink)
                Text(target == "en" ? L.t("English natives' votes count ×2", lang) : L.t("Japanese natives' votes count ×2", lang))
                    .font(.round(11, .black))
                    .foregroundStyle(EC.inkSoft)
            }
            HStack(spacing: 14) {
                ForEach(judges.prefix(5)) { j in
                    VStack(spacing: 4) {
                        WordRushAvatar(player: j, size: 52)
                            .overlay(alignment: .top) {
                                if j.learning != target {
                                    Text(L.t("NATIVE ×2", lang))
                                        .font(.chunky(10))
                                        .foregroundStyle(EC.ink)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Capsule().fill(EC.yellow))
                                        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                                        .rotationEffect(.degrees(-6))
                                        .fixedSize()
                                        .offset(y: -12)
                                }
                            }
                        Text(j.participantId == me ? L.t("you", lang) : j.nickname)
                            .font(.round(12, .black))
                            .foregroundStyle(EC.ink)
                            .lineLimit(1)
                    }
                }
            }
        }
        .padding(.vertical, 14)
        .padding(.horizontal, 12)
        .frame(maxWidth: .infinity)
        .ecCard(radius: 24, shadow: 6)
    }
}
