import Foundation

extension HostRoomViewModel {
    func createEmojiBingoLobby() async {
        do {
            _ = try await api.createEmojiBingoLobby(roomId: roomId, hostParticipantId: hostId)
            await pollEmojiBingoState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiBingo:createLobby:error", detail: error.localizedDescription, ok: false)
        }
    }

    func pollEmojiBingoState() async {
        do {
            let game = try await api.getActiveEmojiBingo(roomId: roomId)
            applyEmojiBingoState(game)
        } catch {
            DebugConsole.shared.trace(source: .network, action: "poll:emojiBingo:error", detail: error.localizedDescription, ok: false)
        }
    }

    private func applyEmojiBingoState(_ game: EmojiBingoGame?) {
        activeEmojiBingoGame = game
        let needsFastPoll = game != nil &&
            (game!.status == .active || game!.status == .won || game!.status == .lobby)
        if needsFastPoll && emojiBingoPollTask == nil {
            startEmojiBingoFastPoll()
        } else if !needsFastPoll && emojiBingoPollTask != nil {
            stopEmojiBingoFastPoll()
        }
    }

    private func startEmojiBingoFastPoll() {
        guard emojiBingoPollTask == nil else { return }
        emojiBingoPollTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 500_000_000)
                guard !Task.isCancelled else { break }
                do {
                    let game = try await self.api.getActiveEmojiBingo(roomId: self.roomId)
                    self.activeEmojiBingoGame = game
                    if game == nil || game!.status == .completed || game!.status == .canceled {
                        break
                    }
                } catch {}
            }
            self.emojiBingoPollTask = nil
        }
    }

    func stopEmojiBingoFastPoll() {
        emojiBingoPollTask?.cancel()
        emojiBingoPollTask = nil
    }

    func startEmojiBingo() async {
        guard let game = activeEmojiBingoGame else { return }
        do {
            try await api.startEmojiBingo(gameId: game.id, participantId: hostId)
            await pollEmojiBingoState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiBingo:start:error", detail: error.localizedDescription, ok: false)
        }
    }

    func rollEmojiBingo() async {
        guard let game = activeEmojiBingoGame else { return }
        do {
            try await api.rollEmojiBingo(gameId: game.id, participantId: hostId)
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiBingo:roll:error", detail: error.localizedDescription, ok: false)
        }
    }

    func markEmojiBingoCell(cellIndex: Int) async {
        guard let game = activeEmojiBingoGame else { return }
        do {
            try await api.markEmojiBingoCell(gameId: game.id, participantId: hostId, cellIndex: cellIndex)
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiBingo:mark:error", detail: error.localizedDescription, ok: false)
        }
    }

    func claimEmojiBingo() async {
        guard let game = activeEmojiBingoGame else { return }
        do {
            try await api.claimEmojiBingo(gameId: game.id, participantId: hostId)
            await pollEmojiBingoState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiBingo:claim:error", detail: error.localizedDescription, ok: false)
        }
    }

    func cancelEmojiBingo() async {
        guard let game = activeEmojiBingoGame else { return }
        do {
            try await api.cancelEmojiBingo(gameId: game.id, participantId: hostId)
            await pollEmojiBingoState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiBingo:cancel:error", detail: error.localizedDescription, ok: false)
        }
    }

    func playAgainEmojiBingo() async {
        guard let game = activeEmojiBingoGame else { return }
        do {
            _ = try await api.playAgainEmojiBingo(gameId: game.id, participantId: hostId)
            await pollEmojiBingoState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiBingo:playAgain:error", detail: error.localizedDescription, ok: false)
        }
    }
}
