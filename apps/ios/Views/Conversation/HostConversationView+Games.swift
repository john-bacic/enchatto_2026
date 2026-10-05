import SwiftUI

extension HostConversationView {
    /// The game picker, Lost in Translation's task cover and replay, the two handlers that show them, and the End game alert
    func gamePickerAndLostInTranslation(_ content: some View) -> some View {
        content
            .sheet(isPresented: $showGamePicker) {
                GamePickerView(
                    isHost: true,
                    playerCount: viewModel.participants.filter { $0.online }.count,
                    players: viewModel.gamePlayers,
                    nextLevel: (viewModel.latestGameSession?.status == .complete && viewModel.latestGameSession?.cancelled != true ? (viewModel.latestGameSession?.level ?? 1) + 1 : 1),
                    lang: hostLanguage,
                    onStartGame: { gameType, level, timerSeconds, teams in
                        showGamePicker = false
                        Task { await viewModel.startGame(gameType: gameType, level: level, timerSeconds: timerSeconds, teams: teams) }
                    },
                    onDealTeams: { previous in
                        try await viewModel.dealTeams(previous: previous)
                    },
                    onStartWordRush: { pack, sayIt in
                        showGamePicker = false
                        minimizedWordRushGameId = nil
                        Task {
                            await viewModel.createWordRushLobby(pack: pack, sayIt: sayIt)
                            if viewModel.presentableWordRushGame != nil { showWordRushGame = true }
                        }
                    },
                    onStartEmojiMatch: {
                        showGamePicker = false
                        Task {
                            await viewModel.createEmojiMatchLobby()
                        }
                    },
                    onStartEmojiBingo: {
                        showGamePicker = false
                        Task {
                            await viewModel.createEmojiBingoLobby()
                        }
                    },
                    onStartTruthOrDare: { mode in
                        showGamePicker = false
                        Task {
                            await viewModel.createTruthOrDare(promptMode: mode)
                        }
                    },
                    onDismiss: { showGamePicker = false }
                )
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            }
            .fullScreenCover(isPresented: $showGameTask) {
                if let step = viewModel.presentedStep {
                    GameTaskOverlayView(
                        step: step,
                        lang: hostLanguage,
                        onSubmitDrawing: { image in
                            guard let data = image.pngData() else {
                                throw APIError.serverError("Drawing could not be encoded")
                            }
                            let base64 = data.base64EncodedString()
                            let mediaUrl = "data:image/png;base64,\(base64)"
                            try await viewModel.submitGameStep(stepId: step.id, outputText: nil, outputDrawingUrl: mediaUrl)
                            // .onChange normally closes or swaps the overlay when the refresh inside
                            // submitGameStep moves myActiveStep on. If that refresh failed, the step is
                            // still here although the server has closed it: close the overlay for this
                            // step only. An unconditional `showGameTask = false` would hide a next step
                            // that is already up.
                            if viewModel.myActiveStep?.id == step.id { showGameTask = false }
                        },
                        onSubmitGuess: { selectedOption in
                            try await viewModel.submitGameStep(stepId: step.id, outputText: selectedOption, outputDrawingUrl: nil, selectedOption: selectedOption)
                            if viewModel.myActiveStep?.id == step.id { showGameTask = false }
                        },
                        onCommitGuess: { selectedOption in
                            try await viewModel.commitGuess(stepId: step.id, selectedOption: selectedOption)
                        },
                        onHoldGuess: { seconds, awaitingReply in
                            viewModel.holdGuessStep(step, for: seconds, awaitingReply: awaitingReply)
                        },
                        onReleaseGuess: { answered in
                            viewModel.releaseGuessHold(stepId: step.id)
                            guard answered else { return }
                            // As for a drawing: .onChange closes or swaps the overlay when the refresh
                            // commitGuess started moves myActiveStep on, and if that refresh failed the
                            // overlay is closed for this step only.
                            Task {
                                await viewModel.guessRefresh?.value
                                if viewModel.presentedStep?.id == step.id { showGameTask = false }
                            }
                        },
                        onQuit: {
                            showQuitGameConfirm = true
                        },
                        team: LITTeam(index: viewModel.presentedStepTeam)
                    )
                    .id(step.id)
                    .environment(\.roomTextureIndex, shownTextureIndex)
                    .alert(L.t("Quit game?", hostLanguage), isPresented: $showQuitGameConfirm) {
                        Button(L.t("Cancel", hostLanguage), role: .cancel) {}
                        Button(L.t("Quit", hostLanguage), role: .destructive) {
                            showGameTask = false
                            quitOnStepId = viewModel.myActiveStep?.id
                            Task {
                                await viewModel.cancelGame()
                            }
                        }
                    } message: {
                        Text(L.t("Are you sure you want to quit the game?", hostLanguage))
                    }
                }
            }
            .sheet(isPresented: $showGameReplay) {
                if let replay = viewModel.gameReplay {
                    GameReplayView(
                        replay: replay,
                        lang: hostLanguage,
                        onDismiss: { showGameReplay = false },
                        onNextLevel: { timerSeconds in
                            let nextLevel = (viewModel.latestGameSession?.level ?? 1) + 1
                            showGameReplay = false
                            // The next level is played as this one was: by the same teams, or individually
                            let teams = replay.session.teams.map(GameTeamsRequest.split)
                            Task { await viewModel.startGame(gameType: "lost-in-translation", level: nextLevel, timerSeconds: timerSeconds, teams: teams) }
                        },
                        // As the picker counts (GamePickerView.teamsAvailable): under four the server plays individually
                        playersHere: viewModel.gamePlayers.count
                    )
                    .environment(\.roomTextureIndex, shownTextureIndex)
                }
            }
            .onChange(of: viewModel.presentedStep?.id) { newStepId in
                let uncoveredByQuit = newStepId != nil && newStepId == quitOnStepId
                if !uncoveredByQuit { quitOnStepId = nil }
                showGameTask = newStepId != nil && !uncoveredByQuit
            }
            .onChange(of: viewModel.isGameComplete) { complete in
                if complete {
                    showGameReplay = true
                }
            }
            .alert(L.t("End game?", hostLanguage), isPresented: $showEndGameConfirm) {
                Button(L.t("Cancel", hostLanguage), role: .cancel) {}
                Button(L.t("End Game", hostLanguage), role: .destructive) {
                    Task { await viewModel.cancelGame() }
                }
            } message: {
                Text(L.t("This will end the game for all players and show results.", hostLanguage))
            }
    }

    /// Word Rush, Emoji Match, Emoji Bingo and Truth or Dare: each one's cover, and the handler that shows and hides it
    func fullScreenGames(_ content: some View) -> some View {
        content
            // MARK: - Word Rush full-screen game
            .fullScreenCover(isPresented: $showWordRushGame) {
                WordRushGameView(
                    viewModel: viewModel,
                    lang: hostLanguage,
                    onClose: {
                        viewModel.dismissWordRushResults()
                        showWordRushGame = false
                    },
                    onMinimize: {
                        minimizedWordRushGameId = viewModel.activeWordRushGame?.id
                        showWordRushGame = false
                    }
                )
                .overlay { DebugConsoleView() }
            }
            .onChange(of: viewModel.presentableWordRushGame.map { "\($0.id)|\($0.status.rawValue)" }) { _ in
                if let g = viewModel.presentableWordRushGame {
                    if !showWordRushGame && minimizedWordRushGameId != g.id {
                        showWordRushGame = true
                    }
                } else {
                    showWordRushGame = false
                    minimizedWordRushGameId = nil
                }
            }
            // MARK: - Emoji Match full-screen game
            .fullScreenCover(isPresented: $showEmojiMatchGame) {
                EmojiMatchGameView(
                    viewModel: viewModel,
                    lang: hostLanguage,
                    onDismiss: { showEmojiMatchGame = false },
                    onMinimize: {
                        if let g = viewModel.activeEmojiMatchGame {
                            minimizedEmojiMatchGameId = g.id
                        }
                        showEmojiMatchGame = false
                    }
                )
                .overlay { DebugConsoleView() }
                .onTapGesture(count: 3) { DebugConsole.shared.isEnabled.toggle() }
            }
            .onChange(of: viewModel.activeEmojiMatchGame) { game in
                if let g = game, g.status != .canceled, g.status != .completed {
                    if !showEmojiMatchGame && minimizedEmojiMatchGameId != g.id {
                        showEmojiMatchGame = true
                    }
                } else if game == nil || game?.status == .canceled {
                    showEmojiMatchGame = false
                    minimizedEmojiMatchGameId = nil
                }
            }
            // MARK: - Emoji Bingo full-screen game
            .fullScreenCover(isPresented: $showEmojiBingoGame) {
                EmojiBingoGameView(
                    viewModel: viewModel,
                    lang: hostLanguage,
                    onDismiss: { showEmojiBingoGame = false },
                    onMinimize: {
                        if let g = viewModel.activeEmojiBingoGame {
                            minimizedEmojiBingoGameId = g.id
                        }
                        showEmojiBingoGame = false
                    }
                )
                .overlay { DebugConsoleView() }
                .onTapGesture(count: 3) { DebugConsole.shared.isEnabled.toggle() }
            }
            .onChange(of: viewModel.activeEmojiBingoGame) { game in
                if let g = game, g.status != .canceled, g.status != .completed {
                    if !showEmojiBingoGame && minimizedEmojiBingoGameId != g.id {
                        showEmojiBingoGame = true
                    }
                } else if game == nil || game?.status == .canceled {
                    showEmojiBingoGame = false
                    minimizedEmojiBingoGameId = nil
                }
            }
            // MARK: - Truth or Dare full-screen game
            .fullScreenCover(isPresented: $showTruthOrDareGame) {
                TruthOrDareGameView(
                    viewModel: viewModel,
                    lang: hostLanguage,
                    onDismiss: { showTruthOrDareGame = false },
                    onMinimize: {
                        if let g = viewModel.activeTruthOrDareGame {
                            minimizedTruthOrDareGameId = g.id
                        }
                        showTruthOrDareGame = false
                    }
                )
                .overlay { DebugConsoleView() }
                .onTapGesture(count: 3) { DebugConsole.shared.isEnabled.toggle() }
                // The game hands it on to the cover an answer is drawn on
                .environment(\.roomTextureIndex, shownTextureIndex)
            }
            .onChange(of: viewModel.activeTruthOrDareGame) { game in
                if let g = game, g.status == .active {
                    if !showTruthOrDareGame && minimizedTruthOrDareGameId != g.id {
                        showTruthOrDareGame = true
                    }
                } else if game == nil || game?.status == .completed || game?.status == .canceled {
                    showTruthOrDareGame = false
                    minimizedTruthOrDareGameId = nil
                }
            }
    }

    // MARK: - Minimized game resume buttons

    @ViewBuilder
    var minimizedGameResumeButtons: some View {
        VStack(alignment: .trailing, spacing: 8) {
            if let game = viewModel.activeTruthOrDareGame,
               game.status == .active,
               minimizedTruthOrDareGameId == game.id,
               !showTruthOrDareGame {
                resumePill(
                    emoji: "❓",
                    colors: [EC.yellow],
                    accessibility: L.t("Resume Truth or Dare", hostLanguage)
                ) {
                    minimizedTruthOrDareGameId = nil
                    showTruthOrDareGame = true
                }
            }
            if let game = viewModel.activeEmojiMatchGame,
               game.status != .canceled, game.status != .completed,
               minimizedEmojiMatchGameId == game.id,
               !showEmojiMatchGame {
                resumePill(
                    emoji: "⭐",
                    colors: [EC.violet],
                    accessibility: L.t("Resume Emoji Match", hostLanguage)
                ) {
                    minimizedEmojiMatchGameId = nil
                    showEmojiMatchGame = true
                }
            }
            if let game = viewModel.activeEmojiBingoGame,
               game.status != .canceled, game.status != .completed,
               minimizedEmojiBingoGameId == game.id,
               !showEmojiBingoGame {
                resumePill(
                    emoji: "🍀",
                    colors: [EC.mint],
                    accessibility: L.t("Resume Emoji Bingo", hostLanguage)
                ) {
                    minimizedEmojiBingoGameId = nil
                    showEmojiBingoGame = true
                }
            }
            if let game = viewModel.presentableWordRushGame,
               minimizedWordRushGameId == game.id,
               !showWordRushGame {
                resumePill(
                    emoji: "⚡",
                    colors: [EC.pink],
                    accessibility: L.t("Resume Word Rush", hostLanguage)
                ) {
                    minimizedWordRushGameId = nil
                    showWordRushGame = true
                }
            }
        }
        .padding(.top, 72)
        .padding(.trailing, 12)
    }

    private func resumePill(
        emoji: String,
        colors: [Color],
        accessibility: String,
        action: @escaping () -> Void
    ) -> some View {
        let fill = colors.first ?? EC.yellow
        return Button(action: action) {
            HStack(spacing: 6) {
                EmojiArt(emoji: emoji, size: 22)
                Text(L.t("Resume", hostLanguage))
                    .font(.chunky(13))
                    .foregroundStyle(EC.textOn(fill))
                Image(systemName: "play.fill")
                    .font(.system(size: 10, weight: .black))
                    .foregroundStyle(EC.textOn(fill))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Capsule().fill(fill))
            .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 3))
            .background(Capsule().fill(EC.ink).offset(y: 4))
            .padding(.bottom, 4)
        }
        .buttonStyle(.pressable)
        .transition(.scale(scale: 0.4, anchor: .trailing).combined(with: .opacity))
        .accessibilityLabel(accessibility)
    }
}
