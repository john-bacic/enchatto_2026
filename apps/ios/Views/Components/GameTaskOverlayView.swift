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
    @State private var confetti = 0

    var body: some View {
        VStack(spacing: 0) {
            // Header
            ZStack {
                VStack(spacing: 2) {
                    HStack(spacing: 6) {
                        PackIcon(step.stepType == .draw ? "g-pencil" : "g-question", size: 22)
                        Text("\(L.t("Level", lang)) \(step.level ?? 1)")
                            .font(.chunky(17))
                            .foregroundStyle(EC.ink)
                    }
                    Text("\(L.t("Round", lang)) \(step.round ?? 1) \(L.t("of", lang)) \(step.totalRounds ?? 10)")
                        .font(.round(12, .bold))
                        .foregroundStyle(EC.inkSoft)
                }

                if let onQuit {
                    HStack {
                        Button {
                            onQuit()
                        } label: {
                            Image(systemName: "xmark")
                        }
                        .buttonStyle(.roundIcon(diameter: 36))
                        .accessibilityLabel(L.t("Quit", lang))
                        Spacer()
                    }
                    .padding(.leading, 12)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(Color.white.opacity(0.92).ignoresSafeArea(edges: .top))
            .overlay(alignment: .bottom) { Rectangle().fill(EC.ink).frame(height: 3) }

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
        .ecPaperBackground()
        .overlay { ConfettiBurst(trigger: confetti).ignoresSafeArea() }
    }

    // MARK: - Draw mode

    private var drawContent: some View {
        VStack(spacing: 12) {
            // Prompt card
            VStack(spacing: 6) {
                ECLabel(L.t("Draw this phrase:", lang))
                Text(step.inputText ?? "")
                    .font(.chunky(22))
                    .foregroundStyle(EC.ink)
                    .multilineTextAlignment(.center)
                    .minimumScaleFactor(0.6)
            }
            .frame(maxWidth: .infinity)
            .padding(14)
            .ecCard(fill: EC.yellowSoft, radius: 20, border: 3, shadow: 5)
            .rotationEffect(.degrees(-1))

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
        VStack(spacing: 14) {
            HStack(spacing: 8) {
                PackIcon("g-question", size: 28)
                OutlinedText(L.t("What is this drawing?", lang), size: 19, fill: .white, outline: 2.5)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .padding(.horizontal, 14)
            .ecCard(fill: EC.violet, radius: 18, border: 3, shadow: 5)

            // Show the drawing to guess
            if let drawingUrl = step.inputDrawingUrl {
                Group {
                    AsyncImage(url: URL(string: drawingUrl)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFit()
                        case .failure:
                            // Try as base64 data URL
                            if let uiImage = decodeBase64Image(drawingUrl) {
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .scaledToFit()
                            } else {
                                Color.white
                                    .aspectRatio(1, contentMode: .fit)
                            }
                        default:
                            ProgressView()
                                .tint(EC.pink)
                                .frame(maxWidth: .infinity)
                                .aspectRatio(1, contentMode: .fit)
                        }
                    }
                }
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                .ecCard(radius: 20, border: 3, shadow: 6)
                .overlay(alignment: .topTrailing) {
                    if showFeedback {
                        let isCorrect = selectedAnswer == step.correctOption
                        OutlinedText(isCorrect ? L.t("Correct!", lang) : L.t("Wrong!", lang), size: 30, fill: isCorrect ? EC.mint : EC.red, outline: 3)
                            .rotationEffect(.degrees(10))
                            .stampIn()
                            .offset(x: 6, y: -14)
                    }
                }
            }

            // Feedback text (when there's no drawing to stamp over)
            if showFeedback, step.inputDrawingUrl == nil {
                let isCorrect = selectedAnswer == step.correctOption
                OutlinedText(isCorrect ? L.t("Correct!", lang) : L.t("Wrong!", lang), size: 28, fill: isCorrect ? EC.mint : EC.red)
                    .stampIn()
            }

            // 2x2 grid of multiple-choice buttons
            if let options = step.options {
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                    ForEach(Array(options.enumerated()), id: \.element) { index, option in
                        Button {
                            handleOptionSelect(option)
                        } label: {
                            Text(option)
                                .font(.chunky(17))
                                .multilineTextAlignment(.center)
                                .lineLimit(3)
                                .minimumScaleFactor(0.6)
                                .foregroundStyle(EC.textOn(optionBackground(option, index: index)))
                                .frame(maxWidth: .infinity, minHeight: 56)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 10)
                                .ecCard(fill: optionBackground(option, index: index), radius: 18, border: 3, shadow: 5)
                                .overlay(alignment: .topLeading) {
                                    Text(Self.letters[index % Self.letters.count])
                                        .font(.chunky(12))
                                        .foregroundStyle(EC.ink)
                                        .frame(width: 24, height: 24)
                                        .background(RoundedRectangle(cornerRadius: 7).fill(.white))
                                        .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(EC.ink, lineWidth: 2))
                                        .rotationEffect(.degrees(-8))
                                        .offset(x: -5, y: -8)
                                }
                                .opacity(optionDimmed(option) ? 0.5 : 1)
                                .scaleEffect(showFeedback && option == step.correctOption ? 1.05 : 1)
                                .animation(.spring(response: 0.35, dampingFraction: 0.5), value: showFeedback)
                        }
                        .buttonStyle(.pressable)
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
        if isCorrect { confetti += 1 }

        // Wait 1.5s then submit
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            submitting = true
            onSubmitGuess(option)
        }
    }

    private static let letters = ["A", "B", "C", "D"]
    private static let tints = [EC.pinkSoft, EC.yellowSoft, EC.mintSoft, EC.blueSoft]

    private func optionBackground(_ option: String, index: Int) -> Color {
        let tint = Self.tints[index % Self.tints.count]
        guard showFeedback else { return tint }
        if option == step.correctOption {
            return EC.mint
        }
        if option == selectedAnswer && selectedAnswer != step.correctOption {
            return EC.red
        }
        return tint
    }

    private func optionDimmed(_ option: String) -> Bool {
        showFeedback && option != step.correctOption && option != selectedAnswer
    }

    private func decodeBase64Image(_ dataUrl: String) -> UIImage? {
        guard dataUrl.hasPrefix("data:image/") else { return nil }
        guard let commaIndex = dataUrl.firstIndex(of: ",") else { return nil }
        let base64 = String(dataUrl[dataUrl.index(after: commaIndex)...])
        guard let data = Data(base64Encoded: base64) else { return nil }
        return UIImage(data: data)
    }
}
