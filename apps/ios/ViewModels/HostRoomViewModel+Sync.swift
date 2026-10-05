import Foundation
import SwiftUI

extension HostRoomViewModel {
    /// 2 s normally and after one failure, then 4, 8 and 10 s
    private var pollDelayNanoseconds: UInt64 {
        let doublings = min(max(consecutivePollFailures - 1, 0), 3)
        return UInt64(min(2 << doublings, 10)) * 1_000_000_000
    }

    private func pollOnce() async -> UInt64 {
        // Retries whatever waits in the send queue once its backoff has passed
        kickFlush()
        await refresh(fromPollLoop: true)
        return pollDelayNanoseconds
    }

    private func clearPollFailures() {
        consecutivePollFailures = 0
        lastPollFailureLogged = nil
        if pollIssue != nil { pollIssue = nil }
    }

    private func notePollFailure(_ error: Error) {
        if error.isCancellation || Task.isCancelled { return }
        consecutivePollFailures += 1
        let description = error.localizedDescription
        if description != lastPollFailureLogged {
            lastPollFailureLogged = description
            DebugConsole.shared.trace(source: .network, action: "poll:room:error", detail: description, ok: false)
        }
        guard consecutivePollFailures >= 2 else { return }
        let issue: PollIssue = error.isRetryableNetworkFailure ? .reconnecting : .failing
        if pollIssue != issue { pollIssue = issue }
    }

    /// One game poll inside refresh(). The closure assigns its own result, so nothing is assigned when the request throws.
    /// Cancellation and network failures are rethrown (refresh stops the cycle instead of waiting out a timeout on each
    /// remaining request); any other failure is logged and the caller carries on with the previous value.
    private func pollGame(_ name: String, _ request: () async throws -> Void) async throws {
        do {
            try await request()
        } catch {
            if error.isCancellation || error.isRetryableNetworkFailure { throw error }
            DebugConsole.shared.trace(source: .network, action: "poll:\(name):error", detail: error.localizedDescription, ok: false)
        }
    }

    // MARK: - Observation

    private func registerForPushIfNeeded() {
        guard !pushRegistered else { return }
        pushRegistered = true
        Task {
            guard let token = await PushManager.shared.requestToken() else { return }
            try? await api.setHostPushToken(roomId: roomId, hostId: hostId, token: token)
        }
    }

    func startObserving() {
        registerForPushIfNeeded()

        // Poll for room state and messages. Self is held for one poll at a time, and the wait backs off while polls fail.
        if pollTask == nil {
            pollTask = Task { [weak self] in
                while !Task.isCancelled {
                    guard let delay = await self?.pollOnce() else { return }
                    try? await Task.sleep(nanoseconds: delay)
                }
            }
        }

        // Heartbeat every 15 seconds to keep presence alive
        if heartbeatTask == nil {
            heartbeatTask = Task { [weak self] in
                guard let self else { return }
                // Mark online immediately
                if self.networkMonitor.isConnected {
                    try? await self.api.setParticipantOnline(participantId: self.hostId, online: true, presence: "online")
                }
                while !Task.isCancelled {
                    try? await Task.sleep(nanoseconds: 15_000_000_000)
                    guard self.networkMonitor.isConnected else { continue }
                    try? await self.api.setParticipantOnline(participantId: self.hostId, online: true, presence: self.sceneInBackground ? "away" : "online")
                }
            }
        }

        // Poll for pending messages and process them
        if processingTask == nil {
            processingTask = Task { [weak self] in
                guard let self else { return }
                while !Task.isCancelled {
                    if self.networkMonitor.isConnected {
                        await self.processPendingMessages()
                    }
                    // Follows the room poll's backoff while the server is in trouble
                    try? await Task.sleep(nanoseconds: self.consecutivePollFailures < 2 ? 1_500_000_000 : self.pollDelayNanoseconds)
                }
            }
        }
    }

    func stopObserving() {
        pollTask?.cancel()
        pollTask = nil
        processingTask?.cancel()
        processingTask = nil
        heartbeatTask?.cancel()
        heartbeatTask = nil
        // Like the flush below, the task clears its own handle when it unwinds
        hostLanguageTask?.cancel()
        // So does this one. A background picked and not yet sent is not sent from outside the room
        backgroundTask?.cancel()
        // The pass clears isFlushing itself when it unwinds
        flushTask?.cancel()
        stopEmojiMatchFastPoll()
        stopWordRushFastPoll()
        dropGuessHold()
    }

    func handleScenePhase(_ phase: ScenePhase) {
        switch phase {
        case .active:
            sceneInBackground = false
            Task {
                // Brief delay to let the network reconnect after backgrounding
                try? await Task.sleep(nanoseconds: 500_000_000)
                // Left again within the delay: the "away" already sent must stand
                guard !sceneInBackground else { return }
                try? await api.setParticipantOnline(participantId: hostId, online: true, presence: "online")
            }
            if pollTask == nil {
                startObserving()
            }
        case .background:
            sceneInBackground = true
            Task {
                try? await api.setParticipantOnline(participantId: hostId, online: true, presence: "away")
            }
            // Stop polling and processing but keep heartbeat alive
            // so the server doesn't mark host as offline/left
            pollTask?.cancel()
            pollTask = nil
            processingTask?.cancel()
            processingTask = nil
        default:
            break
        }
    }

    /// `fromPollLoop`: only the poll loop's own call counts a failure toward the banner and the backoff. The other
    /// callers (after an action, one per processed message) can fail several at once in a single blip.
    func refresh(fromPollLoop: Bool = false) async {
        guard networkMonitor.isConnected else {
            // The offline banner covers this state; counting starts afresh when the network returns
            clearPollFailures()
            return
        }
        do {
            let epoch = backgroundEpoch
            let state = try await api.getRoomState(roomId: roomId)
            let msgs = try await api.getRoomMessages(roomId: roomId)
            let rxSummaries = try await api.getRoomReactions(roomId: roomId)
            try Task.checkCancellation()

            room = roomOnScreen(state.room, askedAt: epoch)
            // Closed is final: this device has nothing to come back to
            if state.room.status == .closed { SavedHostRoom.clear(roomId: roomId) }
            participants = state.participants
            syncHostLanguage()
            messages = msgs.sorted { $0.createdAt < $1.createdAt }

            // Re-merge any remaining queued messages so they stay visible
            if !offlineQueue.isEmpty {
                mergeQueueIntoMessages()
            }

            var map: [String: [ReactionSummaryEntry]] = [:]
            for summary in rxSummaries {
                map[summary.messageId] = summary.reactions
            }
            reactionSummaries = map

            // Poll game state. nil means the server says there is no game, and the views close the drawing cover
            // on it, so a value is assigned only when its request succeeded.
            try await pollGame("activeSession") { activeGameSession = try await api.getActiveGameSession(roomId: roomId) }
            if activeGameSession != nil {
                try await pollGame("gameStatus") { gameStatus = try await api.getGameStatus(roomId: roomId) }
            } else {
                gameStatus = nil
            }
            updateDrawCountdown()
            let previousStepType = myActiveStep?.stepType
            try await pollGame("myActiveStep") { myActiveStep = try await api.getMyActiveStep(participantId: hostId) }
            // The server has moved on from a guess whose reply is still out. The reply, or a retry's, gets 3 s more to
            // bring the answer, and no longer: a lost reply costs the stamp, not the host's next round
            if guessHoldAwaitsReply, let held = heldGuessStep, myActiveStep?.id != held.id {
                holdGuessStep(held, for: 3, awaitingReply: false)
            }

            // Set typing action to "drawing" while on a draw step. Nothing that can throw may sit between the poll above
            // and this comparison: the change is seen by one refresh only, and one that left in between would lose it
            let currentStepType = myActiveStep?.stepType
            if currentStepType != previousStepType {
                if currentStepType == .draw {
                    let timerSecs = myActiveStep?.timerEnabled ?? 20
                    let startedAt: Double? = timerSecs > 0 ? Date().timeIntervalSince1970 * 1000 : nil
                    try? await api.setTypingAction(participantId: hostId, action: "drawing", drawingStartedAt: startedAt)
                } else if previousStepType == .draw {
                    try? await api.setTypingAction(participantId: hostId, action: nil, drawingStartedAt: nil)
                }
            }
            try await pollGame("latestSession") { latestGameSession = try await api.getLatestGameSession(roomId: roomId) }
            if let latest = latestGameSession, latest.status == .complete {
                // A complete session does not change on the server, so its replay is asked for until it is here and
                // not again: a request that fails leaves no replay, or another game's, and the next refresh asks
                if gameReplay?.session.id != latest.id {
                    try await pollGame("replay") {
                        let replay = try await api.getGameReplay(gameSessionId: latest.id)
                        if latestGameSession?.id == latest.id { gameReplay = replay }
                    }
                }
            } else {
                gameReplay = nil
            }

            // The helpers below swallow their own errors, so a cancelled refresh must not start them
            try Task.checkCancellation()

            // Word Rush (the fast poll covers it while a game is live)
            if wordRushPollTask == nil {
                await pollWordRushState()
            }

            // Poll Emoji Match state
            await pollEmojiMatchState()

            // Bingo started from web was never picked up without this
            if emojiBingoPollTask == nil {
                await pollEmojiBingoState()
            }

            // Poll Truth or Dare state (skip if an action is in progress to avoid stale overwrites)
            if !isTruthOrDareSubmitting {
                await pollTruthOrDareState()
            }

            isLoading = false
            // A poll counts as healthy only when the whole cycle completed
            clearPollFailures()
        } catch {
            if fromPollLoop { notePollFailure(error) }
            isLoading = false
        }
    }
}
