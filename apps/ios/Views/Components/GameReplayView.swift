import SwiftUI

struct GameReplayView: View {
    let replay: GameReplay
    let lang: String
    let onDismiss: () -> Void
    var onNextLevel: ((Int) -> Void)?
    @State private var timerSeconds: Int = 20

    init(replay: GameReplay, lang: String, onDismiss: @escaping () -> Void, onNextLevel: ((Int) -> Void)? = nil) {
        self.replay = replay
        self.lang = lang
        self.onDismiss = onDismiss
        self.onNextLevel = onNextLevel
        self._timerSeconds = State(initialValue: replay.session.timerEnabled ?? 20)
    }

    /// Translate a game prompt to the viewer's preferred language
    private func translatePrompt(_ text: String) -> String {
        guard let translations = replay.promptTranslations else { return text }
        if lang == "ja" {
            // English → Japanese
            return translations[text] ?? text
        }
        // Japanese → English (reverse lookup)
        if let entry = translations.first(where: { $0.value == text }) {
            return entry.key
        }
        return text
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    // Score summary
                    if let scores = replay.scores, !scores.isEmpty {
                        scoreSummary(scores)
                    }

                    // Round-by-round breakdown
                    ForEach(replay.chains) { chain in
                        roundView(chain)
                    }
                }
                .padding(16)
            }

            if let onNextLevel {
                VStack(spacing: 10) {
                    // Timer picker (host only, when next level available)
                    HStack(spacing: 8) {
                        PackIcon("g-bolt", size: 20)
                        ForEach([10, 20, 30, 0], id: \.self) { secs in
                            Button {
                                Haptics.tap()
                                timerSeconds = secs
                            } label: {
                                Text(secs == 0 ? L.t("Off", lang) : "\(secs)s")
                            }
                            .buttonStyle(.chunky(timerSeconds == secs ? EC.yellow : .white, size: .mini))
                        }
                    }

                    Button {
                        onNextLevel(timerSeconds)
                    } label: {
                        Text("\(L.t("Next Level", lang)) →")
                    }
                    .buttonStyle(.chunky(EC.pink))
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)
                .padding(.bottom, 8)
                .background(Color.white.opacity(0.94).ignoresSafeArea(edges: .bottom))
                .overlay(alignment: .top) { Rectangle().fill(EC.ink).frame(height: 3) }
            }
        }
        .ecPaperBackground()
    }

    private var header: some View {
        ZStack {
            VStack(spacing: 2) {
                OutlinedText(L.t("Game Results", lang), size: 22, fill: EC.yellow, outline: 3)
                Text("\(L.t("Level", lang)) \(replay.session.level ?? 1)")
                    .font(.round(12, .black))
                    .foregroundStyle(EC.inkSoft)
            }
            HStack {
                Spacer()
                Button {
                    onDismiss()
                } label: {
                    Image(systemName: "xmark")
                }
                .buttonStyle(.roundIcon(diameter: 34))
                .accessibilityLabel(L.t("Close", lang))
            }
            .padding(.trailing, 14)
        }
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(Color.white.opacity(0.92).ignoresSafeArea(edges: .top))
        .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }
    }

    // MARK: - Score Summary

    @ViewBuilder
    private func scoreSummary(_ scores: [String: ScoreInfo]) -> some View {
        let sorted = scores.sorted { $0.value.correct > $1.value.correct }

        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                PackIcon("g-crown", size: 22)
                Text(L.t("Scores", lang))
                    .font(.round(16, .black))
                    .foregroundStyle(EC.ink)
            }

            ForEach(Array(sorted.enumerated()), id: \.element.key) { index, entry in
                let participant = replay.participants[entry.key]

                HStack(spacing: 10) {
                    Text("\(index + 1)")
                        .font(.chunky(13))
                        .foregroundStyle(EC.ink)
                        .frame(width: 24, height: 24)
                        .background(Circle().fill(index == 0 ? EC.yellow : .white))
                        .overlay(Circle().strokeBorder(EC.ink, lineWidth: 2))

                    AvatarDisc(avatarId: participant?.avatar.value ?? "", size: 32)

                    Text(participant?.nickname ?? "?")
                        .font(.round(15, .black))
                        .foregroundStyle(EC.ink)
                        .lineLimit(1)

                    Spacer()

                    Text("\(entry.value.correct)/\(entry.value.total)")
                        .font(.chunky(16))
                        .foregroundStyle(EC.ink)
                    Text(L.t("correct", lang))
                        .font(.round(11, .bold))
                        .foregroundStyle(EC.inkSoft)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .ecCard(fill: index == 0 ? EC.yellowSoft : .white, radius: 16, border: 2.5, shadow: index == 0 ? 5 : 3)
                .rotationEffect(.degrees(index == 0 ? -1 : 0))
            }
        }
    }

    // MARK: - Round View

    @ViewBuilder
    private func roundView(_ chain: GameChainReplay) -> some View {
        let drawStep = chain.steps.first(where: { $0.stepType == .draw && $0.status == .submitted })
        let guessSteps = chain.steps.filter { $0.stepType == .guess && $0.status == .submitted }
        let drawerPid = chain.drawerParticipantId
        let drawer = drawerPid.flatMap { replay.participants[$0] }

        VStack(alignment: .leading, spacing: 10) {
            // Round header
            HStack(spacing: 8) {
                ECChip(text: "\(L.t("Round", lang)) \(chain.chainIndex + 1)", fill: EC.violetSoft)
                Spacer()
            }

            // Drawer + prompt
            HStack(spacing: 8) {
                AvatarDisc(avatarId: drawer?.avatar.value ?? "", size: 28)
                Text("\(drawer?.nickname ?? "?") \(L.t("drew", lang)):")
                    .font(.round(12, .bold))
                    .foregroundStyle(EC.inkSoft)
                Text(translatePrompt(chain.originalPrompt))
                    .font(.round(15, .black))
                    .foregroundStyle(EC.ink)
            }

            // Drawing
            if let drawingUrl = drawStep?.outputDrawingUrl {
                Group {
                    if let uiImage = decodeBase64Image(drawingUrl) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFit()
                    } else {
                        AsyncImage(url: URL(string: drawingUrl)) { phase in
                            if let image = phase.image {
                                image
                                    .resizable()
                                    .scaledToFit()
                            } else {
                                Color.white.aspectRatio(1, contentMode: .fit)
                            }
                        }
                    }
                }
                .frame(maxWidth: 200)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(EC.ink, lineWidth: 2.5))
                .frame(maxWidth: .infinity)
            }

            // Guesser results
            ForEach(guessSteps) { step in
                guesserResultView(step)
            }
        }
        .padding(14)
        .ecCard(radius: 20, border: 3, shadow: 5)
    }

    @ViewBuilder
    private func guesserResultView(_ step: GameStep) -> some View {
        let participant = replay.participants[step.assignedParticipantId]
        let rawPicked = step.selectedOption ?? step.outputText ?? "?"
        let picked = translatePrompt(rawPicked)
        let correct = step.correct == true

        HStack(spacing: 8) {
            AvatarDisc(avatarId: participant?.avatar.value ?? "", size: 24)

            let name = participant?.nickname ?? "?"
            let pickedText = Text(picked).font(.round(13, .black)).foregroundColor(EC.ink)
            Group {
                if lang == "ja" {
                    Text("\(name)が「") + pickedText + Text("」を選んだ")
                } else {
                    Text("\(name) \(L.t("picked", lang)) ") + pickedText
                }
            }
            .font(.round(12, .bold))
            .foregroundColor(EC.inkSoft)
            .lineLimit(2)

            Spacer(minLength: 4)

            PackIcon(correct ? "g-ok" : "g-no", size: 20)
                .accessibilityLabel(correct ? L.t("Correct!", lang) : L.t("Wrong!", lang))
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(RoundedRectangle(cornerRadius: 12).fill(correct ? EC.mintSoft : EC.pinkSoft))
    }

    private func decodeBase64Image(_ dataUrl: String) -> UIImage? {
        guard dataUrl.hasPrefix("data:image/") else { return nil }
        guard let commaIndex = dataUrl.firstIndex(of: ",") else { return nil }
        let base64 = String(dataUrl[dataUrl.index(after: commaIndex)...])
        guard let data = Data(base64Encoded: base64) else { return nil }
        return UIImage(data: data)
    }
}
