import Foundation

extension HostRoomViewModel {
    // MARK: - Word Rush

    struct WordRushResult: Equatable {
        let correct: Bool
        let points: Int
    }

    /// This app only ever runs as the room host, and the server lets the room host start, skip and end
    /// any Word Rush game in its room, whoever the game host is.
    var canControlWordRush: Bool { true }

    /// Word Rush game the full-screen cover should show: a live game, or a finished one this
    /// device watched live, played in, and hasn't closed yet.
    var presentableWordRushGame: WordRushGame? {
        guard let game = activeWordRushGame else { return nil }
        if game.isLive { return game }
        if game.status == .completed,
           wordRushSeenLiveIds.contains(game.id),
           game.player(hostId) != nil,
           wordRushDismissedId != game.id {
            return game
        }
        return nil
    }

    func pollWordRushState() async {
        do {
            applyWordRushState(try await api.getWordRushState(roomId: roomId))
        } catch {
            DebugConsole.shared.trace(source: .network, action: "poll:wordRush:error", detail: error.localizedDescription, ok: false)
        }
    }

    func applyWordRushState(_ game: WordRushGame?) {
        if let game, game.isLive { wordRushSeenLiveIds.insert(game.id) }
        if game != activeWordRushGame { activeWordRushGame = game }
        if wordRushNeedsFastPoll { startWordRushFastPoll() }
    }

    private var wordRushNeedsFastPoll: Bool {
        wordRushCoverOpen || activeWordRushGame?.isLive == true
    }

    func startWordRushFastPoll() {
        guard wordRushPollTask == nil else { return }
        wordRushPollTask = Task { [weak self] in
            while let self, !Task.isCancelled, self.wordRushNeedsFastPoll {
                try? await Task.sleep(nanoseconds: 500_000_000)
                guard !Task.isCancelled else { break }
                do {
                    self.applyWordRushState(try await self.api.getWordRushState(roomId: self.roomId))
                } catch {
                    // keep polling through transient errors
                }
            }
            self?.wordRushPollTask = nil
        }
    }

    func stopWordRushFastPoll() {
        wordRushPollTask?.cancel()
        wordRushPollTask = nil
    }

    private func wordRushFail(_ error: Error, _ action: String) {
        let message = Self.cleanConvexError(error)
        wordRushError = message
        DebugConsole.shared.trace(source: .client, action: "wordRush:\(action):error", detail: message, ok: false)
        Haptics.error()
    }

    /// Convex errors arrive as "[CONVEX M(...)] [Request ID: …] Server Error\nUncaught Error: Already answered\n at …"
    static func cleanConvexError(_ error: Error) -> String {
        var text = (error as? APIError).flatMap { err -> String? in
            switch err {
            case .serverError(let msg), .http(_, let msg): return msg
            default: return nil
            }
        } ?? error.localizedDescription
        if let range = text.range(of: "Uncaught Error: ") {
            text = String(text[range.upperBound...])
        }
        if let newline = text.firstIndex(of: "\n") {
            text = String(text[..<newline])
        }
        return text.trimmingCharacters(in: .whitespaces)
    }

    func createWordRushLobby(pack: String, sayIt: Bool) async {
        do {
            _ = try await api.createWordRushLobby(roomId: roomId, hostParticipantId: hostId, pack: pack, sayIt: sayIt)
            wordRushDismissedId = nil
        } catch {
            wordRushFail(error, "createLobby")
        }
        await pollWordRushState()
    }

    func joinWordRush() async {
        guard let game = activeWordRushGame else { return }
        do {
            try await api.joinWordRush(gameId: game.id, participantId: hostId)
            Haptics.tap()
        } catch { wordRushFail(error, "join") }
        await pollWordRushState()
    }

    func leaveWordRush() async {
        guard let game = activeWordRushGame else { return }
        do {
            try await api.leaveWordRush(gameId: game.id, participantId: hostId)
        } catch { wordRushFail(error, "leave") }
        await pollWordRushState()
    }

    func updateWordRushSettings(pack: String? = nil, sayIt: Bool? = nil) async {
        guard let game = activeWordRushGame else { return }
        do {
            try await api.updateWordRushSettings(gameId: game.id, participantId: hostId, pack: pack, sayIt: sayIt)
        } catch { wordRushFail(error, "settings") }
        await pollWordRushState()
    }

    func startWordRush() async {
        guard let game = activeWordRushGame else { return }
        do {
            try await api.startWordRush(gameId: game.id, participantId: hostId)
            Haptics.thump()
        } catch { wordRushFail(error, "start") }
        await pollWordRushState()
    }

    func answerWordRush(choiceIndex: Int) async {
        guard let game = activeWordRushGame, game.phase == .clues else { return }
        let key = game.cardKey
        guard wordRushMyChoices[key] == nil else { return }
        wordRushMyChoices[key] = choiceIndex
        Haptics.thump()
        do {
            let result = try await api.answerWordRush(gameId: game.id, participantId: hostId, choiceIndex: choiceIndex)
            wordRushMyResults[key] = WordRushResult(correct: result.correct, points: result.points)
        } catch {
            if !Self.cleanConvexError(error).contains("Already answered") {
                wordRushMyChoices[key] = nil
            }
            wordRushFail(error, "answer")
        }
        await pollWordRushState()
    }

    func takeWordRushHint() async {
        guard let game = activeWordRushGame, game.phase == .clues else { return }
        let key = game.cardKey
        guard wordRushHints[key] == nil else { return }
        do {
            wordRushHints[key] = try await api.wordRushHint(gameId: game.id, participantId: hostId)
            Haptics.tap()
        } catch { wordRushFail(error, "hint") }
    }

    private func uploadWordRushAudio(_ fileURL: URL) async throws -> String {
        let data = try Data(contentsOf: fileURL)
        let uploadUrl = try await api.generateUploadUrl()
        return try await api.uploadData(data, to: uploadUrl, contentType: "audio/mp4")
    }

    /// Uploads the performer's take and moves the game to judging. Returns false on failure.
    @discardableResult
    func submitWordRushClip(_ fileURL: URL) async -> Bool {
        guard let game = activeWordRushGame else { return false }
        do {
            let storageId = try await uploadWordRushAudio(fileURL)
            try await api.submitWordRushClip(gameId: game.id, participantId: hostId, storageId: storageId)
            Haptics.success()
            await pollWordRushState()
            return true
        } catch {
            wordRushFail(error, "submitClip")
            return false
        }
    }

    func skipWordRushMic() async {
        guard let game = activeWordRushGame else { return }
        do {
            try await api.skipWordRushMic(gameId: game.id, participantId: hostId)
        } catch { wordRushFail(error, "skipMic") }
        await pollWordRushState()
    }

    func voteWordRush(_ vote: WordRushVote) async {
        guard let game = activeWordRushGame, game.phase == .judging else { return }
        let key = game.phaseKey
        guard wordRushMyVotes[key] == nil else { return }
        wordRushMyVotes[key] = vote
        Haptics.thump()
        do {
            try await api.voteWordRush(gameId: game.id, participantId: hostId, vote: vote.rawValue)
        } catch {
            if !Self.cleanConvexError(error).contains("Already voted") {
                wordRushMyVotes[key] = nil
            }
            wordRushFail(error, "vote")
        }
        await pollWordRushState()
    }

    @discardableResult
    func submitWordRushTeachClip(_ fileURL: URL) async -> Bool {
        guard let game = activeWordRushGame else { return false }
        do {
            let storageId = try await uploadWordRushAudio(fileURL)
            try await api.submitWordRushTeachClip(gameId: game.id, participantId: hostId, storageId: storageId)
            Haptics.success()
            await pollWordRushState()
            return true
        } catch {
            wordRushFail(error, "teach")
            return false
        }
    }

    func skipWordRushPhase() async {
        guard let game = activeWordRushGame else { return }
        do {
            try await api.skipWordRushPhase(gameId: game.id, participantId: hostId, phaseSeq: game.phaseSeq)
        } catch { wordRushFail(error, "skip") }
        await pollWordRushState()
    }

    func cancelWordRush() async {
        guard let game = activeWordRushGame else { return }
        do {
            try await api.cancelWordRush(gameId: game.id, participantId: hostId)
            wordRushDismissedId = game.id
        } catch { wordRushFail(error, "cancel") }
        await pollWordRushState()
    }

    func playAgainWordRush() async {
        guard let game = activeWordRushGame else { return }
        do {
            _ = try await api.playAgainWordRush(gameId: game.id, participantId: hostId)
            Haptics.thump()
        } catch { wordRushFail(error, "playAgain") }
        await pollWordRushState()
    }

    /// Close the results screen for good
    func dismissWordRushResults() {
        wordRushDismissedId = activeWordRushGame?.id
    }
}
