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
        NavigationView {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
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

                // Footer
                VStack(spacing: 8) {
                    // Timer picker (host only, when next level available)
                    if onNextLevel != nil {
                        Picker("", selection: $timerSeconds) {
                            Text("10s").tag(10)
                            Text("20s").tag(20)
                            Text("30s").tag(30)
                            Text(L.t("Off", lang)).tag(0)
                        }
                        .pickerStyle(.segmented)
                    }

                    if let onNextLevel {
                        Button {
                            onNextLevel(timerSeconds)
                        } label: {
                            Text("\(L.t("Next Level", lang)) →")
                                .fontWeight(.semibold)
                        }
                        .buttonStyle(.borderedProminent)
                        .frame(maxWidth: .infinity)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color(.systemBackground))
                .overlay(alignment: .top) { Divider() }
            }
            .navigationTitle("🎮 \(L.t("Game Results", lang)) — \(L.t("Level", lang)) \(replay.session.level ?? 1)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        onDismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(.secondary)
                            .frame(width: 28, height: 28)
                            .background(Color(.systemGray5))
                            .clipShape(Circle())
                    }
                }
            }
        }
    }

    // MARK: - Score Summary

    @ViewBuilder
    private func scoreSummary(_ scores: [String: ScoreInfo]) -> some View {
        let sorted = scores.sorted { $0.value.correct > $1.value.correct }

        VStack(alignment: .leading, spacing: 6) {
            Text("🏆 \(L.t("Scores", lang))")
                .font(.subheadline.bold())

            ForEach(Array(sorted.enumerated()), id: \.element.key) { index, entry in
                let participant = replay.participants[entry.key]
                let avatarValue = participant?.avatar.value
                let avatar = avatarValue.flatMap { val in presetAvatars.first(where: { $0.id == val }) }

                HStack(spacing: 8) {
                    Circle()
                        .fill(avatar?.color ?? Color(.systemGray4))
                        .frame(width: 22, height: 22)
                        .overlay {
                            Text(avatar?.emoji ?? "?")
                                .font(.system(size: 11))
                        }

                    Text(participant?.nickname ?? "?")
                        .font(.subheadline.weight(.semibold))

                    Spacer()

                    Text("\(entry.value.correct)/\(entry.value.total) \(L.t("correct", lang))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(index == 0 ? Color.yellow.opacity(0.15) : Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 6))
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(index == 0 ? Color.yellow : Color.clear, lineWidth: 1)
                )
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

        VStack(alignment: .leading, spacing: 8) {
            // Round header
            Text("\(L.t("Round", lang)) \(chain.chainIndex + 1)")
                .font(.caption.bold())
                .foregroundStyle(.secondary)

            // Drawer + prompt
            HStack {
                Text("\(drawer?.nickname ?? "?") \(L.t("drew", lang)):")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(translatePrompt(chain.originalPrompt))
                    .font(.subheadline.bold())
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 8))

            // Drawing
            if let drawingUrl = drawStep?.outputDrawingUrl {
                if let uiImage = decodeBase64Image(drawingUrl) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFit()
                        .frame(maxWidth: 200)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(Color(.separator), lineWidth: 0.5)
                        )
                } else {
                    AsyncImage(url: URL(string: drawingUrl)) { phase in
                        if let image = phase.image {
                            image
                                .resizable()
                                .scaledToFit()
                                .frame(maxWidth: 200)
                                .clipShape(RoundedRectangle(cornerRadius: 6))
                        }
                    }
                }
            }

            // Guesser results
            ForEach(guessSteps) { step in
                guesserResultView(step)
            }
        }
    }

    @ViewBuilder
    private func guesserResultView(_ step: GameStep) -> some View {
        let participant = replay.participants[step.assignedParticipantId]
        let avatarValue = participant?.avatar.value
        let avatar = avatarValue.flatMap { val in presetAvatars.first(where: { $0.id == val }) }
        let rawPicked = step.selectedOption ?? step.outputText ?? "?"
        let picked = translatePrompt(rawPicked)

        HStack(spacing: 8) {
            Circle()
                .fill(avatar?.color ?? Color(.systemGray4))
                .frame(width: 22, height: 22)
                .overlay {
                    Text(avatar?.emoji ?? "?")
                        .font(.system(size: 11))
                }

            Text("\(participant?.nickname ?? "?") \(L.t("picked", lang))")
                .font(.caption)
                .foregroundStyle(.secondary)

            Text(picked)
                .font(.caption.bold())

            Text(step.correct == true ? "✅" : "❌")
                .font(.caption)
        }
    }

    private func decodeBase64Image(_ dataUrl: String) -> UIImage? {
        guard dataUrl.hasPrefix("data:image/") else { return nil }
        guard let commaIndex = dataUrl.firstIndex(of: ",") else { return nil }
        let base64 = String(dataUrl[dataUrl.index(after: commaIndex)...])
        guard let data = Data(base64Encoded: base64) else { return nil }
        return UIImage(data: data)
    }
}
