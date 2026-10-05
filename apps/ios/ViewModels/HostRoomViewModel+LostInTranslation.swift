import Foundation
import AVFoundation

extension HostRoomViewModel {
    // MARK: - Games

    /// `teams`: what a Lost in Translation team game is asked for, nil for individual play
    func startGame(gameType: String, level: Int = 1, timerSeconds: Int = 20, teams: GameTeamsRequest? = nil) async {
        guard networkMonitor.isConnected else { return }
        do {
            // Cancel any lingering active game first
            try? await api.cancelGame(roomId: roomId, participantId: hostId)

            // Generate unique prompts from word banks on the iOS device
            let generated = PromptGenerator.generate(count: 40, level: level)
            let customPrompts: [[String: Any]] = generated.map { p in
                var dict: [String: Any] = ["text": p.text, "ja": p.ja]
                if let hint = p.hint { dict["hint"] = hint }
                if let hintJa = p.hintJa { dict["hintJa"] = hintJa }
                return dict
            }

            _ = try await api.startGame(roomId: roomId, participantId: hostId, gameType: gameType, level: level, timerSeconds: timerSeconds, customPrompts: customPrompts, teams: teams)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    /// Sends the host's drawing or guess. Returns once the server has answered 200: it took the
    /// answer, or it had already closed the step (a late answer is dropped without an error).
    /// Throws when the answer did not get through; the overlay retries or shows it, so `error`
    /// is not set here.
    func submitGameStep(stepId: String, outputText: String?, outputDrawingUrl: String?, selectedOption: String? = nil) async throws {
        try await sendGameStep(stepId: stepId, outputText: outputText, outputDrawingUrl: outputDrawingUrl, selectedOption: selectedOption)
        // In its own task: the caller is the overlay's task, which is cancelled as soon as this
        // refresh makes the overlay go away, and a cancelled refresh would skip clearing the
        // "drawing" indicator.
        await Task { await self.refresh() }.value
    }

    /// Sends the host's guess on a step that does not say which option is right, and returns what the
    /// reply says about the guess: nil when it says nothing. Returns and throws as `submitGameStep` does,
    /// but does not wait for the refresh: the overlay stamps the answer at once, and the step is held on
    /// screen meanwhile (see "Guess hold").
    func commitGuess(stepId: String, selectedOption: String) async throws -> GameGuessAnswer? {
        let answer = try await sendGameStep(stepId: stepId, outputText: selectedOption, outputDrawingUrl: nil, selectedOption: selectedOption)
        guessRefresh = Task { await self.refresh() }
        return answer
    }

    /// The request behind both. A guess returns what the reply says about it
    @discardableResult
    private func sendGameStep(stepId: String, outputText: String?, outputDrawingUrl: String?, selectedOption: String?) async throws -> GameGuessAnswer? {
        guard networkMonitor.isConnected else { throw URLError(.notConnectedToInternet) }
        do {
            return try await api.submitGameStep(stepId: stepId, participantId: hostId, outputText: outputText, outputDrawingUrl: outputDrawingUrl, selectedOption: selectedOption)
        } catch {
            DebugConsole.shared.trace(source: .network, action: "submitGameStep:error", detail: error.localizedDescription, ok: false)
            throw error
        }
    }

    func cancelGame() async {
        // The game is being ended from this device: a held guess has nothing left to wait for
        dropGuessHold()
        guard networkMonitor.isConnected else { return }
        do {
            try await api.cancelGame(roomId: roomId, participantId: hostId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    /// Who is here for a game, as this device sees the room: everyone online, and the host. The server decides
    /// who a game deals in (games.startGame): this tells the picker whether to offer teams and when to ask for
    /// a new deal, and gives it the names and faces for the split the server sends
    var gamePlayers: [Participant] {
        participants.filter { $0.online || $0.id == hostId }
    }

    /// Two teams for the game picker, dealt by the server. `previous` is the split on screen, to get another one.
    /// Throws when there is no deal to show; `error` is not set, the picker says the teams are dealt at Start
    func dealTeams(previous: [[String]]?) async throws -> GameTeamDeal {
        guard networkMonitor.isConnected else { throw URLError(.notConnectedToInternet) }
        return try await api.dealTeams(roomId: roomId, participantId: hostId, previous: previous)
    }

    /// The host's team (0 or 1) in the game the cover's step belongs to; nil in an individual game. The last
    /// guess of a game is still on the cover when its session is no longer the active one
    var presentedStepTeam: Int? {
        guard let step = presentedStep else { return nil }
        let session = [activeGameSession, latestGameSession].compactMap { $0 }.first { $0.id == step.gameSessionId }
        return LITTeams.index(of: hostId, in: session?.teams)
    }

    /// Not while a guess is held: the replay waits until the game cover has let the last guess of the game go
    var isGameComplete: Bool {
        latestGameSession?.status == .complete && activeGameSession == nil && heldGuessStep == nil
    }

    // MARK: - Guess hold

    /// The step the game cover shows
    var presentedStep: GameStep? { heldGuessStep ?? myActiveStep }

    /// Keeps `step` on the game cover for `seconds` from now, whatever the polls say. A hold already on gets this
    /// deadline in place of its own, except that a try of the guess (`awaitingReply`) does not extend a hold once a
    /// poll has shown the server moved on from the step. Only the step the cover is showing can be held: one it has
    /// left is not brought back.
    func holdGuessStep(_ step: GameStep, for seconds: TimeInterval, awaitingReply: Bool) {
        guard presentedStep?.id == step.id else { return }
        // Once a poll has shown the server moved on from this guess, a retry does not buy the hold more time
        if awaitingReply, heldGuessStep?.id == step.id, myActiveStep?.id != step.id { return }
        if heldGuessStep?.id != step.id { heldGuessStep = step }
        guessHoldAwaitsReply = awaitingReply
        guessHoldTimer?.cancel()
        let stepId = step.id
        guessHoldTimer = Task { [weak self] in
            try? await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
            guard !Task.isCancelled else { return }
            self?.releaseGuessHold(stepId: stepId)
        }
    }

    /// Lets the game cover show `myActiveStep` again. Does nothing unless `stepId` is the step that is held
    func releaseGuessHold(stepId: String) {
        guard heldGuessStep?.id == stepId else { return }
        dropGuessHold()
    }

    func dropGuessHold() {
        guessHoldTimer?.cancel()
        guessHoldTimer = nil
        guessHoldAwaitsReply = false
        if heldGuessStep != nil { heldGuessStep = nil }
    }

    // MARK: - Draw countdown beeps

    /// Called after each poll to start/stop the countdown timer for draw phase beeps.
    func updateDrawCountdown() {
        guard let status = gameStatus,
              status.phase == "drawing",
              let startMs = status.drawStartedAt,
              let timerSecs = status.timerSeconds,
              timerSecs > 0 else {
            stopDrawCountdown()
            return
        }

        // Already tracking this exact draw step
        if trackedDrawStartMs == startMs { return }

        // New draw step — start fresh countdown
        stopDrawCountdown()
        trackedDrawStartMs = startMs

        let startDate = Date(timeIntervalSince1970: startMs / 1000)

        // Compute initial time left (ceil so 3.1s shows as 4, beep fires when truly ≤3)
        let elapsed = Date().timeIntervalSince(startDate)
        let remaining = max(0, Int(ceil(Double(timerSecs) - elapsed)))
        drawCountdownTimeLeft = remaining

        drawCountdownTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                guard let self else { return }
                let elapsed = Date().timeIntervalSince(startDate)
                let remaining = max(0, Int(ceil(Double(timerSecs) - elapsed)))
                let previous = self.drawCountdownTimeLeft
                self.drawCountdownTimeLeft = remaining

                // Play chimes as we cross each second: 3, 2, 1, 0
                if remaining != previous {
                    if remaining == 3 || remaining == 2 || remaining == 1 {
                        self.playBeep(frequency: 523, duration: 0.25) // C5 soft chime
                    } else if remaining == 0 {
                        self.playBeep(frequency: 784, duration: 0.5)  // G5 higher final chime
                        self.stopDrawCountdown()
                    }
                }
            }
        }
    }

    /// Play a generated tone at the given frequency/duration through AVAudioPlayer,
    /// so the volume is controlled by the device's media volume buttons.
    private func playBeep(frequency: Double, duration: Double) {
        let sampleRate: Double = 44100
        let frameCount = Int(sampleRate * duration)

        // Build a 16-bit PCM WAV in memory
        let dataSize = frameCount * 2 // 16-bit mono
        let headerSize = 44
        var wav = Data(count: headerSize + dataSize)

        // WAV header
        wav.replaceSubrange(0..<4, with: "RIFF".data(using: .ascii)!)
        var fileSize = UInt32(headerSize + dataSize - 8)
        wav.replaceSubrange(4..<8, with: Data(bytes: &fileSize, count: 4))
        wav.replaceSubrange(8..<12, with: "WAVE".data(using: .ascii)!)
        wav.replaceSubrange(12..<16, with: "fmt ".data(using: .ascii)!)
        var fmtSize: UInt32 = 16; wav.replaceSubrange(16..<20, with: Data(bytes: &fmtSize, count: 4))
        var audioFormat: UInt16 = 1; wav.replaceSubrange(20..<22, with: Data(bytes: &audioFormat, count: 2))
        var channels: UInt16 = 1; wav.replaceSubrange(22..<24, with: Data(bytes: &channels, count: 2))
        var sr: UInt32 = UInt32(sampleRate); wav.replaceSubrange(24..<28, with: Data(bytes: &sr, count: 4))
        var byteRate: UInt32 = UInt32(sampleRate) * 2; wav.replaceSubrange(28..<32, with: Data(bytes: &byteRate, count: 4))
        var blockAlign: UInt16 = 2; wav.replaceSubrange(32..<34, with: Data(bytes: &blockAlign, count: 2))
        var bitsPerSample: UInt16 = 16; wav.replaceSubrange(34..<36, with: Data(bytes: &bitsPerSample, count: 2))
        wav.replaceSubrange(36..<40, with: "data".data(using: .ascii)!)
        var ds: UInt32 = UInt32(dataSize); wav.replaceSubrange(40..<44, with: Data(bytes: &ds, count: 4))

        // Generate soft chime tone: exponential decay envelope with gentle amplitude
        for i in 0..<frameCount {
            let t = Double(i) / sampleRate
            let progress = Double(i) / Double(frameCount)
            // Smooth attack (first 5%) + exponential decay — sounds like a soft chime
            let attack = min(1.0, progress / 0.05)
            let decay = exp(-4.0 * progress)
            let envelope = attack * decay
            let sample = sin(2.0 * .pi * frequency * t) * 0.2 * envelope
            var s = Int16(max(-32767, min(32767, sample * 32767)))
            wav.replaceSubrange((headerSize + i * 2)..<(headerSize + i * 2 + 2), with: Data(bytes: &s, count: 2))
        }

        do {
            // Use .ambient so it mixes with other audio and follows media volume
            try AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
            let player = try AVAudioPlayer(data: wav)
            player.volume = 1.0 // Full volume — actual loudness controlled by system media volume
            player.play()
            beepPlayer = player // keep strong reference
        } catch {}
    }

    private func stopDrawCountdown() {
        drawCountdownTimer?.invalidate()
        drawCountdownTimer = nil
        drawCountdownTimeLeft = -1
        trackedDrawStartMs = nil
    }
}
