import SwiftUI

struct GameTaskOverlayView: View {
    let step: GameStep
    let lang: String
    /// Both return once the server has answered the submit (it took the answer, or had already
    /// closed the step) and throw when it did not get through.
    let onSubmitDrawing: (UIImage) async throws -> Void
    let onSubmitGuess: (String) async throws -> Void
    /// A guess on a step that does not say which option is right goes through these three instead of
    /// `onSubmitGuess`. `onCommitGuess` returns and throws like it, with what the reply said about the
    /// guess: nil when it said nothing. The server closes the step as it takes the guess, so the step has
    /// to be kept on screen: `onHoldGuess` asks for so many seconds from now (`true` while the reply is
    /// still out), and `onReleaseGuess` gives the step back (`true` once the server has answered the guess).
    let onCommitGuess: (String) async throws -> GameGuessAnswer?
    let onHoldGuess: (TimeInterval, Bool) -> Void
    let onReleaseGuess: (Bool) -> Void
    var onQuit: (() -> Void)?
    /// The player's team in a team game: named in the header of the drawing and of the guess
    var team: LITTeam? = nil

    private var timerSeconds: Int { step.timerEnabled ?? 20 }
    private var timerOn: Bool { timerSeconds > 0 }
    @State private var submitting = false
    @State private var selectedAnswer: String?
    @State private var showFeedback = false
    /// What the reply to the guess said, on a step that does not say which option is right
    @State private var guessAnswer: GameGuessAnswer?
    @State private var timeLeft: Int = 10
    @State private var countdownTimer: Timer?
    @State private var triggerAutoSubmit = false
    @State private var confetti = 0
    /// What the player sent, kept so a failed submit is retried without asking again.
    /// A new value (new id) restarts the submit task.
    @State private var pendingSubmit: PendingSubmit?
    @State private var submitNote: SubmitNote?

    private struct PendingSubmit {
        let id = UUID()
        var image: UIImage?
        var option: String?
        /// The guess goes out before its answer is known: the step did not say which option is right
        var commitsFirst = false
    }

    private enum SubmitNote { case retrying, failed }

    /// Waits before tries 2 to 5. When each try fails at once, the last one starts about 15 s after the
    /// first, inside the 25 s the server keeps a timed draw step open after its timer (DRAW_GRACE_MS in
    /// games.ts). A try that hangs runs to its timeout first (10 s for a guess, 15 s for a drawing, set in
    /// RealEnchattoAPI.submitGameStep): short enough for one retry of a drawing to start inside those 25 s.
    private static let submitRetryDelays: [UInt64] = [1_000_000_000, 2_000_000_000, 4_000_000_000, 8_000_000_000]

    /// How long a try of a guess keeps its step on screen: the request's timeout, and 2 s more for its reply
    private static let guessSendHoldSeconds: TimeInterval = ConvexHTTPClient.defaultTimeout + 2
    /// How long Correct! / Wrong! stays up when it comes with the reply to the guess
    private static let replyStampSeconds: TimeInterval = 1.5

    /// Whether the pick is right, once `showFeedback` is set. The step says so when it carries the right
    /// option; when it does not, the reply to the guess does
    private var pickIsCorrect: Bool {
        if let correctOption = step.correctOption { return selectedAnswer == correctOption }
        return guessAnswer?.correct == true
    }

    /// The option shown as the right one, once `showFeedback` is set
    private var rightOption: String? {
        if let correctOption = step.correctOption { return correctOption }
        guard let answer = guessAnswer else { return nil }
        // A right pick is shown as right even when the reply words the answer like none of the options
        if answer.correct, step.options?.contains(answer.correctOption) != true { return selectedAnswer }
        return answer.correctOption
    }

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

                if let team {
                    HStack {
                        Spacer()
                        // No wider than the room beside the title: a longer name is set smaller
                        LITTeamChip(team: team, lang: lang)
                            .frame(maxWidth: 110, alignment: .trailing)
                            .accessibilityLabel("\(L.t("Your team", lang)): \(team.name(lang))")
                    }
                    .padding(.trailing, 12)
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
        .task(id: pendingSubmit?.id) { await runPendingSubmit() }
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
                    submitNote = nil
                    pendingSubmit = PendingSubmit(image: image)
                },
                onCancel: {
                    onQuit?()
                },
                gameMode: true,
                countdownSeconds: timerOn ? timeLeft : -1,
                triggerAutoSubmit: $triggerAutoSubmit
            )
            // An overlay, not a row: a row would shrink the canvas, and its strokes are in absolute points
            .overlay(alignment: .top) { submitNoteView.offset(y: -13) }
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
                        let isCorrect = pickIsCorrect
                        OutlinedText(isCorrect ? L.t("Correct!", lang) : L.t("Wrong!", lang), size: 30, fill: isCorrect ? EC.mint : EC.red, outline: 3)
                            .rotationEffect(.degrees(10))
                            .stampIn()
                            .offset(x: 6, y: -14)
                    }
                }
            }

            // Feedback text (when there's no drawing to stamp over)
            if showFeedback, step.inputDrawingUrl == nil {
                let isCorrect = pickIsCorrect
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
                                .scaleEffect(showFeedback && option == rightOption ? 1.05 : 1)
                                .animation(.spring(response: 0.35, dampingFraction: 0.5), value: showFeedback)
                        }
                        .buttonStyle(.pressable)
                        .disabled(showFeedback || submitting)
                    }
                }
            }

            submitNoteView
        }
    }

    // MARK: - Helpers

    private func handleOptionSelect(_ option: String) {
        guard !submitting, !showFeedback else { return }
        selectedAnswer = option
        submitNote = nil

        guard step.correctOption != nil else {
            // The step does not say which option is right, so there is nothing to stamp yet: the pick stands
            // out, the guess goes out at once and its reply brings the answer. The hold starts here, before
            // the request: a poll already on its way can report the step closed before the reply arrives
            submitting = true
            onHoldGuess(Self.guessSendHoldSeconds, true)
            pendingSubmit = PendingSubmit(option: option, commitsFirst: true)
            return
        }
        showFeedback = true

        // Haptic feedback
        let isCorrect = option == step.correctOption
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(isCorrect ? .success : .error)
        if isCorrect { confetti += 1 }

        // The submit task shows the stamp for 1.5s, then sends (and retries)
        pendingSubmit = PendingSubmit(option: option)
    }

    /// Sends `pendingSubmit`, retrying when the network failed. Runs in `.task(id:)`, so it is
    /// cancelled when the overlay goes away (the step changed or the cover closed). `submitting`
    /// stays true for the whole run, so neither the send button nor the countdown starts a second one.
    @MainActor
    private func runPendingSubmit() async {
        guard let pending = pendingSubmit else { return }

        // A guess sent before its answer is known has its step held on screen. The step is given back on
        // every way out of here, a cancelled task included; `answered` once the server has replied
        var answered = false
        defer { if pending.commitsFirst { onReleaseGuess(answered) } }

        if pending.option != nil, !pending.commitsFirst {
            // Let the Correct!/Wrong! stamp show before the overlay can close
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            guard !Task.isCancelled, pendingSubmit?.id == pending.id else { return }
            submitting = true
        }

        var retries = 0
        var failure: Error?
        while failure == nil {
            do {
                if let image = pending.image {
                    try await onSubmitDrawing(image)
                } else if let option = pending.option, pending.commitsFirst {
                    // Each try holds the step for as long as its own reply can take, unless a poll has already said
                    // the server moved on from it: then the 3 s that poll set stand
                    onHoldGuess(Self.guessSendHoldSeconds, true)
                    let answer = try await onCommitGuess(option)
                    answered = true
                    // The overlay has gone (quit, or the hold ran out): no stamp and no haptic
                    guard !Task.isCancelled else { return }
                    submitNote = nil
                    if let answer { await stampGuessAnswer(answer) }
                } else if let option = pending.option {
                    try await onSubmitGuess(option)
                }
                // Answered by the server. Leave `submitting` set: the overlay closes when the step goes away.
                return
            } catch {
                guard !Task.isCancelled else { return }
                if error.isRetryableNetworkFailure, retries < Self.submitRetryDelays.count {
                    submitNote = .retrying
                    try? await Task.sleep(nanoseconds: Self.submitRetryDelays[retries])
                    guard !Task.isCancelled else { return }
                    retries += 1
                } else {
                    failure = error
                }
            }
        }

        // Did not get through: give the control back so the player can send or answer again
        guard pendingSubmit?.id == pending.id else { return }
        submitting = false
        showFeedback = false
        selectedAnswer = nil
        // A cancelled request is not a failure to show
        let wasCancelled = failure?.isCancellation == true
        submitNote = wasCancelled ? nil : .failed
        if !wasCancelled { Haptics.error() }
    }

    /// Stamps what the reply said about the guess, and returns when the stamp has had its time
    @MainActor
    private func stampGuessAnswer(_ answer: GameGuessAnswer) async {
        // The pick the server holds is the one it judged. After a send whose reply was lost, that can be
        // an earlier pick than the one on screen
        if let held = answer.selectedOption, step.options?.contains(held) == true { selectedAnswer = held }
        guessAnswer = answer
        showFeedback = true
        if answer.correct {
            Haptics.success()
            confetti += 1
        } else {
            Haptics.error()
        }
        onHoldGuess(Self.replyStampSeconds, false)
        try? await Task.sleep(nanoseconds: UInt64(Self.replyStampSeconds * 1_000_000_000))
    }

    /// "Sending…" while a failed submit is retried, then the failure once the overlay has given up
    @ViewBuilder
    private var submitNoteView: some View {
        if let note = submitNote {
            Text(L.t(note == .failed ? "Couldn't send. Try again." : "Sending…", lang))
                .font(.round(13, .black))
                .foregroundStyle(note == .failed ? EC.red : EC.inkSoft)
                .padding(.horizontal, 12)
                .padding(.vertical, 5)
                .background(Capsule().fill(.white))
                .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2))
                .allowsHitTesting(false)
        }
    }

    private static let letters = ["A", "B", "C", "D"]
    private static let tints = [EC.pinkSoft, EC.yellowSoft, EC.mintSoft, EC.blueSoft]

    private func optionBackground(_ option: String, index: Int) -> Color {
        let tint = Self.tints[index % Self.tints.count]
        guard showFeedback else { return tint }
        if option == rightOption {
            return EC.mint
        }
        if option == selectedAnswer && !pickIsCorrect {
            return EC.red
        }
        return tint
    }

    /// A pick whose answer is still out stands out alone; once the answer shows, the right option stands
    /// out with it
    private func optionDimmed(_ option: String) -> Bool {
        guard selectedAnswer != nil, option != selectedAnswer else { return false }
        return !showFeedback || option != rightOption
    }

    private func decodeBase64Image(_ dataUrl: String) -> UIImage? {
        guard dataUrl.hasPrefix("data:image/") else { return nil }
        guard let commaIndex = dataUrl.firstIndex(of: ",") else { return nil }
        let base64 = String(dataUrl[dataUrl.index(after: commaIndex)...])
        guard let data = Data(base64Encoded: base64) else { return nil }
        return UIImage(data: data)
    }
}
