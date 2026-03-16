import SwiftUI

struct GameTaskOverlayView: View {
    let step: GameStep
    let lang: String
    let onSubmitDrawing: (UIImage) -> Void
    let onSubmitGuess: (String) -> Void
    var onQuit: (() -> Void)?

    private var timerSeconds: Int { step.timerEnabled ?? 20 }
    private var timerOn: Bool { timerSeconds > 0 }
    @State private var submitting = false
    @State private var selectedAnswer: String?
    @State private var showFeedback = false
    @State private var timeLeft: Int = 10
    @State private var countdownTimer: Timer?
    @State private var triggerAutoSubmit = false

    var body: some View {
        VStack(spacing: 0) {
            // Header
            ZStack {
                VStack(spacing: 2) {
                    Text("🎮 \(L.t("Level", lang)) \(step.level ?? 1)")
                        .font(.system(size: 14, weight: .bold))
                    Text("\(L.t("Round", lang)) \(step.round ?? 1) \(L.t("of", lang)) \(step.totalRounds ?? 10)")
                        .font(.system(size: 12))
                        .foregroundStyle(.secondary)
                }

                if let onQuit {
                    HStack {
                        Button {
                            onQuit()
                        } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(.secondary)
                                .frame(width: 28, height: 28)
                                .background(Color(.systemGray5))
                                .clipShape(Circle())
                        }
                        Spacer()
                    }
                    .padding(.leading, 12)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(Color(.systemBackground))
            .overlay(alignment: .bottom) {
                Divider()
            }

            // Content — no ScrollView for draw mode so canvas touch works
            if step.stepType == .draw {
                drawContent
                    .padding(16)
                    .onAppear {
                        timeLeft = timerSeconds
                        guard timerOn else { return }
                        countdownTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
                            Task { @MainActor in
                                if timeLeft > 0 {
                                    timeLeft -= 1
                                    if timeLeft == 0 && !submitting {
                                        triggerAutoSubmit = true
                                    }
                                }
                            }
                        }
                    }
                    .onDisappear {
                        countdownTimer?.invalidate()
                        countdownTimer = nil
                    }
            } else {
                ScrollView {
                    guessContent
                        .padding(16)
                }
            }
        }
        .background(Color(.systemBackground))
    }

    // MARK: - Draw mode

    private var drawContent: some View {
        VStack(spacing: 12) {
            // Prompt card
            VStack(spacing: 4) {
                Text(L.t("Draw this phrase:", lang))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(step.inputText ?? "")
                    .font(.title3.bold())
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(12)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 10))

            // Drawing canvas
            DrawingComposerView(
                lang: lang,
                onSend: { image in
                    guard !submitting else { return }
                    submitting = true
                    onSubmitDrawing(image)
                },
                onCancel: {
                    onQuit?()
                },
                gameMode: true,
                countdownSeconds: timerOn ? timeLeft : -1,
                triggerAutoSubmit: $triggerAutoSubmit
            )
        }
    }

    // MARK: - Guess mode (multiple choice)

    private var guessContent: some View {
        VStack(spacing: 12) {
            Text("🤔 \(L.t("What is this drawing?", lang))")
                .font(.system(size: 17, weight: .bold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .padding(.horizontal, 16)
                .background(
                    LinearGradient(
                        colors: [Color(red: 0.39, green: 0.40, blue: 0.95), Color(red: 0.55, green: 0.36, blue: 0.96)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 10))

            // Show the drawing to guess
            if let drawingUrl = step.inputDrawingUrl {
                AsyncImage(url: URL(string: drawingUrl)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFit()
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(Color(.separator), lineWidth: 0.5)
                            )
                    case .failure:
                        // Try as base64 data URL
                        if let uiImage = decodeBase64Image(drawingUrl) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFit()
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color(.separator), lineWidth: 0.5)
                                )
                        } else {
                            Color(.systemGray5)
                                .aspectRatio(1, contentMode: .fit)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    default:
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .aspectRatio(1, contentMode: .fit)
                    }
                }
            }

            // Feedback text
            if showFeedback {
                let isCorrect = selectedAnswer == step.correctOption
                Text(isCorrect ? L.t("Correct!", lang) : L.t("Wrong!", lang))
                    .font(.title3.bold())
                    .foregroundStyle(isCorrect ? .green : .red)
                    .padding(.vertical, 4)
            }

            // 2x2 grid of multiple-choice buttons
            if let options = step.options {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(options, id: \.self) { option in
                        Button {
                            handleOptionSelect(option)
                        } label: {
                            Text(option)
                                .font(.subheadline.weight(.semibold))
                                .multilineTextAlignment(.center)
                                .lineLimit(3)
                                .minimumScaleFactor(0.7)
                                .frame(maxWidth: .infinity, minHeight: 50)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 10)
                                .background(optionBackground(option))
                                .foregroundStyle(optionForeground(option))
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(optionBorder(option), lineWidth: showFeedback ? 2 : 1)
                                )
                        }
                        .disabled(showFeedback || submitting)
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private func handleOptionSelect(_ option: String) {
        guard !submitting, !showFeedback else { return }
        selectedAnswer = option
        showFeedback = true

        // Haptic feedback
        let isCorrect = option == step.correctOption
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(isCorrect ? .success : .error)

        // Wait 1.5s then submit
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            submitting = true
            onSubmitGuess(option)
        }
    }

    private func optionBackground(_ option: String) -> Color {
        guard showFeedback else {
            return Color(.systemGray6)
        }
        if option == step.correctOption {
            return Color.green.opacity(0.2)
        }
        if option == selectedAnswer && selectedAnswer != step.correctOption {
            return Color.red.opacity(0.2)
        }
        return Color(.systemGray6)
    }

    private func optionForeground(_ option: String) -> Color {
        guard showFeedback else {
            return .primary
        }
        if option == step.correctOption {
            return .green
        }
        if option == selectedAnswer && selectedAnswer != step.correctOption {
            return .red
        }
        return .secondary
    }

    private func optionBorder(_ option: String) -> Color {
        guard showFeedback else {
            return Color(.separator)
        }
        if option == step.correctOption {
            return .green
        }
        if option == selectedAnswer && selectedAnswer != step.correctOption {
            return .red
        }
        return Color(.separator)
    }

    private func decodeBase64Image(_ dataUrl: String) -> UIImage? {
        guard dataUrl.hasPrefix("data:image/") else { return nil }
        guard let commaIndex = dataUrl.firstIndex(of: ",") else { return nil }
        let base64 = String(dataUrl[dataUrl.index(after: commaIndex)...])
        guard let data = Data(base64Encoded: base64) else { return nil }
        return UIImage(data: data)
    }
}
