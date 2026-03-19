import SwiftUI

struct EmojifyrGameView: View {
    @ObservedObject var viewModel: HostRoomViewModel
    let lang: String
    let onDismiss: () -> Void

    @State private var sentenceText = ""
    @State private var guessText = ""
    @State private var hasSubmittedGuess = false
    @State private var editableSentence = ""
    @FocusState private var isInputFocused: Bool

    private let maxCharacters = 80

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.indigo.opacity(0.9), Color.purple.opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                topBar
                    .padding(.top, 8)

                ScrollView {
                    phaseContent
                        .padding()
                        .animation(.easeInOut(duration: 0.3), value: viewModel.currentEmojifyrRound?.status)
                }
            }
        }
        .onChange(of: viewModel.currentEmojifyrRound?.status) { newStatus in
            if newStatus == .writing {
                sentenceText = ""
                guessText = ""
                hasSubmittedGuess = false
            }
            if newStatus == .guessing {
                guessText = ""
                hasSubmittedGuess = false
            }
            if newStatus == .complete {
                onDismiss()
            }
        }
        .onChange(of: viewModel.activeEmojifyrSession) { session in
            if session == nil {
                onDismiss()
            }
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            // Title
            HStack(spacing: 6) {
                Text("\u{1F525}")
                    .font(.title2)
                Text(L.t("Emojifyr", lang))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
            }

            Spacer()

            // Round number
            if let round = viewModel.currentEmojifyrRound {
                Text(L.t("Round", lang) + " \(round.roundIndex + 1)")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.white.opacity(0.8))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color.white.opacity(0.15))
                    .clipShape(Capsule())
            }

            // End Game button (host only)
            Button {
                Task { await viewModel.cancelEmojifyr() }
            } label: {
                Text(L.t("End Game", lang))
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.red.opacity(0.7))
                    .clipShape(Capsule())
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    // MARK: - Phase Content

    @ViewBuilder
    private var phaseContent: some View {
        if let round = viewModel.currentEmojifyrRound {
            switch round.status {
            case .writing:
                if viewModel.isEmojifyrWriter {
                    writingPhaseWriter
                } else {
                    writingPhaseWaiting(round: round)
                }
            case .generating, .preview:
                if viewModel.isEmojifyrWriter {
                    // Host is the writer — show preview with Use/Regenerate
                    previewPhase(round: round)
                } else {
                    // Web player is the writer — iOS generates silently in background
                    // Show passive waiting screen (auto-submit happens in ViewModel)
                    waitingForEmojiGeneration
                }
            case .guessing:
                if viewModel.isEmojifyrWriter {
                    guessingPhaseWriter
                } else {
                    guessingPhaseGuesser(round: round)
                }
            case .reveal:
                revealPhase(round: round)
            case .complete:
                EmptyView()
            }
        } else {
            // Waiting/lobby state
            waitingLobby
        }
    }

    // MARK: - Waiting/Lobby

    private var waitingLobby: some View {
        VStack(spacing: 24) {
            Spacer(minLength: 60)

            Text("\u{1F3AE}")
                .font(.system(size: 64))

            Text(L.t("Game Starting...", lang))
                .font(.title)
                .fontWeight(.bold)
                .foregroundStyle(.white)

            Text("\(viewModel.participants.filter { $0.online }.count) " + L.t("players", lang))
                .font(.title3)
                .foregroundStyle(.white.opacity(0.7))

            ProgressView()
                .tint(.white)
                .scaleEffect(1.2)

            Spacer(minLength: 60)
        }
    }

    // MARK: - Writing Phase (Writer)

    private var writingPhaseWriter: some View {
        VStack(spacing: 20) {
            Spacer(minLength: 20)

            Text(L.t("Write a sentence for Emojifyr", lang))
                .font(.title2)
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)

            Text(L.t("Use a short, visual sentence that can be turned into emojis.", lang))
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            VStack(alignment: .trailing, spacing: 6) {
                TextEditor(text: $sentenceText)
                    .focused($isInputFocused)
                    .frame(minHeight: 100, maxHeight: 160)
                    .padding(8)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .onChange(of: sentenceText) { newValue in
                        if newValue.count > maxCharacters {
                            sentenceText = String(newValue.prefix(maxCharacters))
                        }
                    }

                Text("\(sentenceText.count) / \(maxCharacters)")
                    .font(.caption)
                    .foregroundStyle(sentenceText.count >= maxCharacters ? .red : .white.opacity(0.6))
            }
            .padding(.horizontal)

            Button {
                let trimmed = sentenceText.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !trimmed.isEmpty else { return }
                Task { await viewModel.submitEmojifyrSentence(trimmed) }
            } label: {
                Text(L.t("Generate Emojis", lang))
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(canSubmitSentence ? Color.white : Color.white.opacity(0.3))
                    .foregroundStyle(canSubmitSentence ? Color.purple : Color.white.opacity(0.5))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(!canSubmitSentence)
            .padding(.horizontal)

            Spacer(minLength: 40)
        }
        .onAppear { isInputFocused = true }
    }

    private var canSubmitSentence: Bool {
        let trimmed = sentenceText.trimmingCharacters(in: .whitespacesAndNewlines)
        return !trimmed.isEmpty && sentenceText.count <= maxCharacters
    }

    // MARK: - Writing Phase (Waiting)

    private func writingPhaseWaiting(round: EmojifyrRound) -> some View {
        VStack(spacing: 24) {
            Spacer(minLength: 60)

            Text("\u{270D}\u{FE0F}")
                .font(.system(size: 64))

            let writerName = viewModel.participant(for: round.writerParticipantId)?.nickname ?? L.t("Someone", lang)
            Text(L.t("Waiting for", lang) + " " + writerName + " " + L.t("to write a sentence...", lang))
                .font(.title3)
                .fontWeight(.medium)
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            ProgressView()
                .tint(.white)
                .scaleEffect(1.2)

            Spacer(minLength: 60)
        }
    }

    // MARK: - Waiting for Emoji Generation (web player's turn)

    private var waitingForEmojiGeneration: some View {
        VStack(spacing: 24) {
            Spacer(minLength: 80)

            Text("\u{2728}")
                .font(.system(size: 64))

            Text(L.t("Generating emojis...", lang))
                .font(.title2)
                .fontWeight(.bold)
                .foregroundStyle(.white)

            ProgressView()
                .tint(.white)
                .scaleEffect(1.5)

            Text(L.t("Sending to players...", lang))
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.6))

            Spacer(minLength: 80)
        }
    }

    // MARK: - Preview Phase

    private func previewPhase(round: EmojifyrRound) -> some View {
        VStack(spacing: 24) {
            Spacer(minLength: 20)

            // Editable sentence
            if viewModel.isEmojifyrWriter {
                VStack(spacing: 8) {
                    Text(L.t("Original sentence:", lang))
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.7))

                    TextEditor(text: $editableSentence)
                        .frame(minHeight: 60, maxHeight: 100)
                        .padding(8)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .onChange(of: editableSentence) { newValue in
                            if newValue.count > maxCharacters {
                                editableSentence = String(newValue.prefix(maxCharacters))
                            }
                        }

                    Text("\(editableSentence.count) / \(maxCharacters)")
                        .font(.caption)
                        .foregroundStyle(editableSentence.count >= maxCharacters ? .red : .white.opacity(0.6))
                }
                .padding(.horizontal)
            }

            VStack(spacing: 8) {
                Text(L.t("Generated emoji clue:", lang))
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.7))

                if viewModel.isGeneratingEmoji {
                    ProgressView(L.t("Generating emojis...", lang))
                        .tint(.white)
                        .foregroundStyle(.white)
                        .padding()
                } else if let clue = viewModel.emojifyrEmojiClue {
                    Text(clue)
                        .font(.system(size: 56))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
            }

            Spacer(minLength: 20)

            if !viewModel.isGeneratingEmoji {
                VStack(spacing: 12) {
                    Button {
                        if let clue = viewModel.emojifyrEmojiClue {
                            // If sentence was edited, update it on the server before submitting
                            let trimmed = editableSentence.trimmingCharacters(in: .whitespacesAndNewlines)
                            if trimmed != round.originalSentence, !trimmed.isEmpty {
                                Task {
                                    await viewModel.updateEmojifyrSentence(trimmed)
                                    await viewModel.submitEmojifyrEmojiClue(clue)
                                }
                            } else {
                                Task { await viewModel.submitEmojifyrEmojiClue(clue) }
                            }
                        }
                    } label: {
                        Text(L.t("Use", lang))
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(viewModel.emojifyrEmojiClue != nil ? Color.white : Color.white.opacity(0.3))
                            .foregroundStyle(viewModel.emojifyrEmojiClue != nil ? Color.purple : Color.white.opacity(0.5))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(viewModel.emojifyrEmojiClue == nil)

                    Button {
                        let trimmed = editableSentence.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        Task {
                            // Update sentence on server if edited
                            if trimmed != round.originalSentence {
                                await viewModel.updateEmojifyrSentence(trimmed)
                            }
                            await viewModel.generateEmojiClue(for: trimmed)
                        }
                    } label: {
                        Text(L.t("Regenerate", lang))
                            .fontWeight(.medium)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.white.opacity(0.2))
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(editableSentence.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .padding(.horizontal)
                .padding(.bottom, 16)
            }
        }
        .onAppear {
            if editableSentence.isEmpty {
                editableSentence = round.originalSentence ?? ""
            }
        }
    }

    // MARK: - Guessing Phase (Writer - waiting)

    private var guessingPhaseWriter: some View {
        VStack(spacing: 24) {
            Spacer(minLength: 60)

            Text("\u{1F914}")
                .font(.system(size: 64))

            Text(L.t("Players are guessing...", lang))
                .font(.title2)
                .fontWeight(.bold)
                .foregroundStyle(.white)

            if !viewModel.emojifyrGuesses.isEmpty {
                Text("\(viewModel.emojifyrGuesses.count) " + (viewModel.emojifyrGuesses.count == 1 ? L.t("guess", lang) : L.t("guesses", lang)))
                    .font(.title3)
                    .foregroundStyle(.white.opacity(0.7))
            }

            if let round = viewModel.currentEmojifyrRound, let clue = round.emojiClue {
                Text(clue)
                    .font(.system(size: 48))
                    .padding(.top, 8)
            }

            // Reveal button for host/writer
            Button {
                Task { await viewModel.revealEmojifyrRound() }
            } label: {
                Text(L.t("Reveal Answers", lang))
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.white)
                    .foregroundStyle(Color.purple)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .padding(.horizontal)

            Spacer(minLength: 60)
        }
    }

    // MARK: - Guessing Phase (Guesser)

    private func guessingPhaseGuesser(round: EmojifyrRound) -> some View {
        VStack(spacing: 20) {
            Spacer(minLength: 20)

            Text(L.t("What does this mean?", lang))
                .font(.title3)
                .fontWeight(.bold)
                .foregroundStyle(.white)

            if let clue = round.emojiClue {
                Text(clue)
                    .font(.system(size: 56))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            if viewModel.emojifyrGuesses.count > 0 {
                Text("\(viewModel.emojifyrGuesses.count) " + (viewModel.emojifyrGuesses.count == 1 ? L.t("guess", lang) : L.t("guesses", lang)))
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.6))
            }

            if hasSubmittedGuess {
                VStack(spacing: 8) {
                    Text("\u{2705}")
                        .font(.system(size: 36))
                    Text(L.t("Guess submitted!", lang))
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text(L.t("Waiting for reveal...", lang))
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.7))
                }
                .padding(.top, 12)
            } else {
                HStack(spacing: 10) {
                    TextField(L.t("Type your guess...", lang), text: $guessText)
                        .focused($isInputFocused)
                        .textFieldStyle(.roundedBorder)

                    Button {
                        let trimmed = guessText.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        hasSubmittedGuess = true
                        Task { await viewModel.submitEmojifyrGuess(trimmed) }
                    } label: {
                        Text(L.t("Submit Guess", lang))
                            .fontWeight(.semibold)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(guessText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? Color.white.opacity(0.3) : Color.white)
                            .foregroundStyle(guessText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? Color.white.opacity(0.5) : Color.purple)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    .disabled(guessText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .padding(.horizontal)
            }

            Spacer(minLength: 40)
        }
        .onAppear { isInputFocused = true }
    }

    // MARK: - Reveal Phase

    private func revealPhase(round: EmojifyrRound) -> some View {
        VStack(spacing: 24) {
            // Header
            HStack(spacing: 6) {
                Text("\u{1F3AE}")
                Text(L.t("Emojifyr Result", lang))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
            }
            .padding(.top, 12)

            // Emoji clue
            VStack(spacing: 6) {
                Text(L.t("Emoji clue:", lang))
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.7))
                Text(round.emojiClue ?? "")
                    .font(.system(size: 48))
                    .multilineTextAlignment(.center)
            }

            // Original sentence revealed
            VStack(spacing: 6) {
                Text(L.t("Original sentence", lang))
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.7))
                Text(round.originalSentence ?? "")
                    .font(.title3)
                    .fontWeight(.medium)
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.white.opacity(0.15))
            .clipShape(RoundedRectangle(cornerRadius: 12))

            // Guesses
            if !viewModel.emojifyrGuesses.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Text(L.t("Guesses:", lang))
                        .font(.headline)
                        .foregroundStyle(.white)

                    ForEach(viewModel.emojifyrGuesses) { guess in
                        HStack(spacing: 10) {
                            let participant = viewModel.participant(for: guess.participantId)
                            Text(participant?.avatarEmoji ?? "\u{1F464}")
                                .font(.title3)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(participant?.nickname ?? L.t("Unknown", lang))
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.6))
                                Text(guess.guessText)
                                    .font(.body)
                                    .foregroundStyle(.white)
                            }
                            Spacer()
                        }
                        .padding(.vertical, 6)
                    }
                }
                .padding(.horizontal, 4)
            }

            Spacer(minLength: 20)

            // Buttons
            VStack(spacing: 12) {
                Button {
                    Task { await viewModel.advanceEmojifyrRound() }
                } label: {
                    Text(L.t("Next Round", lang))
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.white)
                        .foregroundStyle(Color.purple)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding(.bottom, 20)
        }
    }
}
