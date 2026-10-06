import Foundation
import NaturalLanguage

extension HostRoomViewModel {
    // MARK: - Truth or Dare

    func pollTruthOrDareState() async {
        await pollTruthOrDareState(afterOwnAction: false)
    }

    /// Asks for the game and shows it under the rule of `applyTruthOrDareState(_:askedAt:afterOwnAction:)`
    private func pollTruthOrDareState(afterOwnAction: Bool) async {
        do {
            let epoch = truthOrDareEpoch
            let game = try await api.getActiveTruthOrDare(roomId: roomId)
            applyTruthOrDareState(game, askedAt: epoch, afterOwnAction: afterOwnAction)
        } catch {
            DebugConsole.shared.trace(source: .network, action: "poll:truthOrDare:error", detail: error.localizedDescription, ok: false)
        }
    }

    /// Shows a game that was asked for at `epoch`, unless it may be from before an action of the host's: a game
    /// asked for before the latest action was sent or answered, and any game that arrives while an action is
    /// under way. `afterOwnAction` marks the poll an action makes once it is answered: the action is still
    /// under way then, which does not keep its own poll from showing
    func applyTruthOrDareState(_ game: TruthOrDareGame?, askedAt epoch: Int, afterOwnAction: Bool = false) {
        guard epoch == truthOrDareEpoch, afterOwnAction || !isTruthOrDareSubmitting else {
            DebugConsole.shared.trace(source: .network, action: "poll:truthOrDare:notCurrent")
            return
        }
        applyTruthOrDareState(game)
    }

    private func applyTruthOrDareState(_ game: TruthOrDareGame?) {
        activeTruthOrDareGame = game
        let needsFastPoll = game != nil && game!.status == .active
        if needsFastPoll && truthOrDarePollTask == nil {
            startTruthOrDareFastPoll()
        } else if !needsFastPoll && truthOrDarePollTask != nil {
            stopTruthOrDareFastPoll()
        }

        // Auto-translate completed turn responses that lack a translation
        if let turn = game?.currentTurn,
           turn.status == .completed,
           let text = turn.responseText,
           !text.isEmpty,
           text != "✅ Done!",
           turn.translatedResponseText == nil {
            Task {
                await translateTruthOrDareResponse(text: text, turnId: turn.id)
            }
        }
    }

    private func startTruthOrDareFastPoll() {
        guard truthOrDarePollTask == nil else { return }
        truthOrDarePollTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 1_000_000_000) // 1s
                guard !Task.isCancelled else { break }
                // Skip poll if an action is in progress to avoid stale overwrites
                guard !self.isTruthOrDareSubmitting else { continue }
                do {
                    let game = try await self.api.getActiveTruthOrDare(roomId: self.roomId)
                    // Double-check submitting flag after await (action may have started during the API call)
                    guard !self.isTruthOrDareSubmitting else { continue }
                    self.activeTruthOrDareGame = game
                    if game == nil || game!.status != .active {
                        break
                    }
                } catch {}
            }
            self.truthOrDarePollTask = nil
        }
    }

    func stopTruthOrDareFastPoll() {
        truthOrDarePollTask?.cancel()
        truthOrDarePollTask = nil
    }

    func createTruthOrDare(promptMode: String = "normal") async {
        do {
            _ = try await api.createTruthOrDare(roomId: roomId, hostParticipantId: hostId, promptMode: promptMode)
            await pollTruthOrDareState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:create:error", detail: error.localizedDescription, ok: false)
        }
    }

    /// Pause the fast poll, run an action, poll once, then resume.
    /// Prevents stale poll data from overwriting fresh state after an action.
    private func withTruthOrDarePollPause<T>(_ action: () async throws -> T) async rethrows -> T {
        isTruthOrDareSubmitting = true
        stopTruthOrDareFastPoll()
        defer {
            isTruthOrDareSubmitting = false
            if activeTruthOrDareGame?.status == .active && truthOrDarePollTask == nil {
                startTruthOrDareFastPoll()
            }
        }
        // A poll that left before the action is sent, or before it is answered, does not show its game
        truthOrDareEpoch += 1
        let result: T
        do {
            defer { truthOrDareEpoch += 1 }
            result = try await action()
        }
        await pollTruthOrDareState(afterOwnAction: true)
        return result
    }

    func submitTruthOrDareChoice(choice: String) async {
        guard let game = activeTruthOrDareGame else { return }
        guard !isTruthOrDareSubmitting else { return }
        do {
            try await withTruthOrDarePollPause {
                try await api.submitTruthOrDareChoice(gameId: game.id, participantId: hostId, choice: choice)
            }
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:choice:error", detail: error.localizedDescription, ok: false)
        }
    }

    func submitTruthOrDareResponse(responseText: String?, responseMediaUrl: String?) async {
        guard let game = activeTruthOrDareGame else { return }
        guard !isTruthOrDareSubmitting else { return }
        do {
            try await withTruthOrDarePollPause {
                try await api.submitTruthOrDareResponse(gameId: game.id, participantId: hostId, responseText: responseText, responseMediaUrl: responseMediaUrl)
            }

            // Translate text response if present
            if let text = responseText, !text.isEmpty, text != "✅ Done!",
               let currentTurn = activeTruthOrDareGame?.currentTurn {
                Task {
                    await translateTruthOrDareResponse(text: text, turnId: currentTurn.id)
                }
            }
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:response:error", detail: error.localizedDescription, ok: false)
        }
    }

    /// Detect language and translate to the other language (en↔ja)
    private func translateTruthOrDareResponse(text: String, turnId: String) async {
        do {
            // Detect language
            let recognizer = NLLanguageRecognizer()
            recognizer.processString(text)
            let detectedLang = recognizer.dominantLanguage

            let sourceLang: String
            let targetLang: String
            if detectedLang == .japanese {
                sourceLang = "ja"
                targetLang = "en"
            } else {
                sourceLang = "en"
                targetLang = "ja"
            }

            let translationService = MyMemoryTranslationService()
            let translated = try await translationService.translate(text: text, source: sourceLang, target: targetLang)
            if !translated.isEmpty && translated != text {
                try await api.submitTruthOrDareTranslation(turnId: turnId, translatedText: translated)
                await pollTruthOrDareState()
            }
        } catch {
            DebugConsole.shared.trace(source: .processing, action: "truthOrDare:translate:error", detail: error.localizedDescription, ok: false)
        }
    }

    func advanceTruthOrDareTurn() async {
        guard let game = activeTruthOrDareGame else { return }
        guard !isTruthOrDareSubmitting else { return }
        do {
            try await withTruthOrDarePollPause {
                try await api.advanceTruthOrDareTurn(gameId: game.id, participantId: hostId)
            }
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:advance:error", detail: error.localizedDescription, ok: false)
        }
    }

    /// Tells the server the host continued past the round break, which is what releases the guests.
    /// Returns false when nothing reached the server, so the view can offer Keep Playing again.
    @discardableResult
    func acknowledgeTruthOrDareRoundBreak(completedTurns: Int) async -> Bool {
        guard let game = activeTruthOrDareGame else { return false }
        guard !isTruthOrDareSubmitting else { return false }
        do {
            try await withTruthOrDarePollPause {
                do {
                    try await api.acknowledgeTruthOrDareRoundBreak(gameId: game.id, participantId: hostId, completedTurns: completedTurns)
                } catch is APIError {
                    // The server answered with an error, e.g. a deployment without this route yet.
                    // Advance-turn records the acknowledgement there. A transport error is not retried
                    // this way: if the first request did land, advance-turn could deal the next turn.
                    try await api.advanceTruthOrDareTurn(gameId: game.id, participantId: hostId)
                }
            }
            return true
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:roundBreak:error", detail: error.localizedDescription, ok: false)
            return false
        }
    }

    func skipTruthOrDareTurn() async {
        guard let game = activeTruthOrDareGame else { return }
        guard !isTruthOrDareSubmitting else { return }
        do {
            try await withTruthOrDarePollPause {
                try await api.skipTruthOrDareTurn(gameId: game.id, participantId: hostId)
            }
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:skip:error", detail: error.localizedDescription, ok: false)
        }
    }

    /// Host moves the game past another player's turn. `turnId` is the turn on screen, so a second tap cannot skip the next player too.
    func hostSkipTruthOrDareTurn(turnId: String) async {
        guard let game = activeTruthOrDareGame else { return }
        guard !isTruthOrDareSubmitting else { return }
        do {
            try await withTruthOrDarePollPause {
                try await api.hostSkipTruthOrDareTurn(gameId: game.id, participantId: hostId, turnId: turnId)
            }
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:hostSkip:error", detail: error.localizedDescription, ok: false)
        }
    }

    func submitTruthOrDareRating(turnId: String, score: Double) async {
        guard !isTruthOrDareSubmitting else { return }
        do {
            try await withTruthOrDarePollPause {
                try await api.submitTruthOrDareRating(turnId: turnId, participantId: hostId, score: score)
            }
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:rating:error", detail: error.localizedDescription, ok: false)
        }
    }

    func endTruthOrDare() async {
        guard let game = activeTruthOrDareGame else { return }
        do {
            try await withTruthOrDarePollPause {
                try await api.endTruthOrDare(gameId: game.id, participantId: hostId)
            }
        } catch {
            DebugConsole.shared.trace(source: .client, action: "truthOrDare:end:error", detail: error.localizedDescription, ok: false)
        }
    }
}
