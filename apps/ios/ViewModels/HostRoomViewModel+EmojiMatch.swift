import Foundation

extension HostRoomViewModel {
    // MARK: - Emoji Match

    /// Whether a board that was asked for at `epoch` is sure to hold every flip the host has made. One asked for
    /// before the host's latest flip was sent or answered can be missing that flip, and so can any board that
    /// arrives while a flip is still on its way: two taps in a row are not always answered in the order they were
    /// made. A flip that gets no answer stops counting after two seconds, so a lost flip cannot keep a card
    /// the server never took face up while boards still arrive. The server can still take a flip that is
    /// slower than that; its card turns back and then up again
    private func emojiMatchBoardIsCurrent(askedAt epoch: Int) -> Bool {
        guard epoch == emojiMatchEpoch else { return false }
        let now = ContinuousClock.now
        return !emojiMatchFlipsInFlight.values.contains { now - $0 < .seconds(2) }
    }

    /// The server's board as it is shown. A board that is not current (see emojiMatchBoardIsCurrent) can be
    /// missing a flip the host has made, and showing it as it is turned the tapped card back over until the
    /// next answer. So such a board does not turn a face-up card back; the rest of it is shown (cards turned
    /// up, pairs, whose turn, a miss being resolved, the game ending), and the screen keeps up with the server
    /// while the host goes on tapping
    private func emojiMatchBoard(_ server: EmojiMatchGame?, askedAt epoch: Int) -> EmojiMatchGame? {
        guard var game = server, let local = activeEmojiMatchGame, local.id == game.id else { return server }
        // A game does not lose pairs, go back to its lobby, or start again once it is over: such a board is
        // older than the one on screen
        if game.matchedPairCount < local.matchedPairCount { return local }
        let over: (EmojiMatchGame) -> Bool = { $0.status == .completed || $0.status == .canceled }
        if over(local) && !over(game) { return local }
        if game.status == .lobby && local.status != .lobby { return local }
        guard !emojiMatchBoardIsCurrent(askedAt: epoch) else { return server }
        for i in game.board.indices where !game.board[i].isRevealed && !game.board[i].isMatched {
            if let mine = local.board.first(where: { $0.cardId == game.board[i].cardId }), mine.isRevealed || mine.isMatched {
                game.board[i] = mine
            }
        }
        return game
    }

    func pollEmojiMatchState() async {
        do {
            let epoch = emojiMatchEpoch
            applyEmojiMatchState(try await api.getActiveEmojiMatch(roomId: roomId), askedAt: epoch)
        } catch {
            DebugConsole.shared.trace(source: .network, action: "poll:emojiMatch:error", detail: error.localizedDescription, ok: false)
        }
    }

    func applyEmojiMatchState(_ server: EmojiMatchGame?, askedAt epoch: Int) {
        // The board to show: the server's, except that one which may be missing a flip leaves face-up
        // cards up, and one older than the screen's is not shown
        let game = emojiMatchBoard(server, askedAt: epoch)
        activeEmojiMatchGame = game

        // Start or stop fast polling based on game state
        let needsFastPoll = game != nil &&
            (game!.status == .active || game!.status == .resolving || game!.status == .lobby)
        if needsFastPoll && emojiMatchPollTask == nil {
            startEmojiMatchFastPoll()
        } else if !needsFastPoll && emojiMatchPollTask != nil {
            stopEmojiMatchFastPoll()
        }
    }

    private func startEmojiMatchFastPoll() {
        guard emojiMatchPollTask == nil else { return }
        emojiMatchPollTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 500_000_000) // 500ms
                guard !Task.isCancelled else { break }
                do {
                    let epoch = self.emojiMatchEpoch
                    let game = self.emojiMatchBoard(try await self.api.getActiveEmojiMatch(roomId: self.roomId), askedAt: epoch)
                    self.activeEmojiMatchGame = game
                    // Stop fast polling if game ended
                    if game == nil || game!.status == .completed || game!.status == .canceled {
                        break
                    }
                } catch {
                    // Continue polling on transient errors
                }
            }
            self.emojiMatchPollTask = nil
        }
    }

    func stopEmojiMatchFastPoll() {
        emojiMatchPollTask?.cancel()
        emojiMatchPollTask = nil
    }

    func createEmojiMatchLobby() async {
        do {
            _ = try await api.createEmojiMatchLobby(roomId: roomId, hostParticipantId: hostId)
            await pollEmojiMatchState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiMatch:createLobby:error", detail: error.localizedDescription, ok: false)
        }
    }

    func joinEmojiMatchLobby() async {
        guard let game = activeEmojiMatchGame else { return }
        do {
            try await api.joinEmojiMatchLobby(gameId: game.id, participantId: hostId)
            await pollEmojiMatchState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiMatch:joinLobby:error", detail: error.localizedDescription, ok: false)
        }
    }

    func leaveEmojiMatchLobby() async {
        guard let game = activeEmojiMatchGame else { return }
        do {
            try await api.leaveEmojiMatchLobby(gameId: game.id, participantId: hostId)
            await pollEmojiMatchState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiMatch:leaveLobby:error", detail: error.localizedDescription, ok: false)
        }
    }

    func startEmojiMatch() async {
        guard let game = activeEmojiMatchGame else { return }
        do {
            try await api.startEmojiMatch(gameId: game.id, participantId: hostId)
            await pollEmojiMatchState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiMatch:start:error", detail: error.localizedDescription, ok: false)
        }
    }

    func flipEmojiMatchCard(cardId: String) async {
        guard var game = activeEmojiMatchGame else { return }
        let gameId = game.id

        // Optimistic update: immediately reveal the card locally for instant feedback, when its face is
        // here to show. A server that hides face-down cards sends them with an empty content value, and
        // turning one over now would draw a blank face: that card is turned by the first board that has it,
        // which brings its face in the same answer.
        if let idx = game.board.firstIndex(where: { $0.cardId == cardId }), !game.board[idx].content.value.isEmpty {
            game.board[idx].isRevealed = true
            activeEmojiMatchGame = game
        }

        // While this flip is unanswered, for two seconds at most, no board turns a face-up card back:
        // see emojiMatchBoard
        let flip = UUID()
        emojiMatchFlipsInFlight[flip] = .now
        emojiMatchEpoch += 1
        do {
            try await api.flipEmojiMatchCard(gameId: gameId, participantId: hostId, cardId: cardId)
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiMatch:flip:error", detail: error.localizedDescription, ok: false)
        }
        emojiMatchFlipsInFlight[flip] = nil
        emojiMatchEpoch += 1
        // The flip has been answered, or has failed without an answer. The next current board is the
        // server's as it is, so a refused card turns back, and a miss turns back when the server sets
        // isRevealed to false. That board is this poll's unless another flip is unanswered or the poll fails
        await pollEmojiMatchState()
    }

    func cancelEmojiMatch() async {
        guard let game = activeEmojiMatchGame else { return }
        do {
            try await api.cancelEmojiMatch(gameId: game.id, participantId: hostId)
            await pollEmojiMatchState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiMatch:cancel:error", detail: error.localizedDescription, ok: false)
        }
    }

    func playAgainEmojiMatch() async {
        guard let game = activeEmojiMatchGame else { return }
        do {
            _ = try await api.playAgainEmojiMatch(gameId: game.id, participantId: hostId)
            await pollEmojiMatchState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiMatch:playAgain:error", detail: error.localizedDescription, ok: false)
        }
    }
}
