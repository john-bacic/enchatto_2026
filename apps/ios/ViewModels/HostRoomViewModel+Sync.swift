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
        stopGameFastPolls()
        // A refresh from the snapshot that is still out is not shown when it is answered: nothing is assigned
        // on a screen that has been left, and no game's fast poll starts again
        shownRefreshTicket = refreshTicket
        dropGuessHold()
    }

    /// Stops the fast poll of each of the four games. A refresh asks for each game that has none running, and
    /// the answer starts the game's fast poll again when it calls for one
    private func stopGameFastPolls() {
        stopWordRushFastPoll()
        stopEmojiMatchFastPoll()
        stopEmojiBingoFastPoll()
        stopTruthOrDareFastPoll()
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
            // The games' fast polls stop too: the first refresh after the return starts them again
            stopGameFastPolls()
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
        #if DEBUG
        // One line in the debug console for each refresh: whether it read the snapshot or made the requests the
        // snapshot stands for, and how many requests it sent in all
        var route = "snapshot"
        ConvexHTTPClient.startRequestCount()
        defer {
            let requests = ConvexHTTPClient.endRequestCount()
            DebugConsole.shared.trace(source: .network, action: "refresh:\(route)", detail: requests == 1 ? "1 request" : "\(requests) requests")
        }
        #endif
        do {
            // One request where the server has the snapshot route. Where it has none, the requests below
            if try await refreshFromSnapshot() { return }
            #if DEBUG
            route = "fallback"
            #endif
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

            if isLoading { isLoading = false }
            // A poll counts as healthy only when the whole cycle completed
            clearPollFailures()
        } catch {
            if fromPollLoop { notePollFailure(error) }
            if isLoading { isLoading = false }
        }
    }

    // MARK: - Refresh from the snapshot

    /// The refresh in one request: the room, its messages and every game as the snapshot route read them, shown
    /// together. False when the server has no such route, which its first 404 says and the view model remembers:
    /// the caller then makes the requests the route stands for. Any other failure is the refresh's own and is
    /// thrown, with nothing assigned.
    ///
    /// Refreshes overlap: the poll loop's, one after each action, one for each processed message. Each takes the
    /// next ticket as it starts, and an answer is shown only if no refresh that started later has been shown
    /// already. So the screen never goes back to an older state of the room, and once a refresh has been
    /// answered the screen holds a state that was asked for when that refresh was, or later. A refresh that
    /// is out when the room screen is left (stopObserving) is not shown either
    private func refreshFromSnapshot() async throws -> Bool {
        guard !snapshotRouteMissing else { return false }
        refreshTicket += 1
        let ticket = refreshTicket
        #if DEBUG
        DebugConsole.shared.trace(source: .network, action: "refresh:\(ticket):start")
        #endif
        // Read before the request leaves: each section is shown under the rule its own poll has for an answer
        // that an action of the host's has overtaken
        let asked = (background: backgroundEpoch, emojiMatch: emojiMatchEpoch, truthOrDare: truthOrDareEpoch)
        // Left out: a game whose own fast poll runs, which shows that game meanwhile, and Truth or Dare while
        // an action is under way
        var skip: Set<RoomSnapshot.Section> = []
        if wordRushPollTask != nil { skip.insert(.wordRush) }
        if emojiMatchPollTask != nil { skip.insert(.emojiMatch) }
        if emojiBingoPollTask != nil { skip.insert(.emojiBingo) }
        if isTruthOrDareSubmitting { skip.insert(.truthOrDare) }
        // Truth or Dare is asked for all the same while its fast poll runs. That poll does not send a finished
        // answer to be translated, and a refresh does: from a game that it then does not show
        let truthOrDareFastPolled = truthOrDarePollTask != nil

        let snapshot: RoomSnapshot
        do {
            snapshot = try await api.getRoomSnapshot(roomId: roomId, participantId: hostId, skip: skip)
        } catch APIError.http(status: 404, message: _) {
            // What a server answers for a path it has no route at. The route itself never answers 404
            snapshotRouteMissing = true
            DebugConsole.shared.trace(source: .network, action: "refresh:noSnapshotRoute")
            return false
        }
        try Task.checkCancellation()

        guard ticket > shownRefreshTicket else {
            #if DEBUG
            DebugConsole.shared.trace(source: .network, action: "refresh:\(ticket):drop", detail: "\(shownRefreshTicket) is on screen, or the room was left")
            #endif
            // Nothing is assigned. The server answered, so the poll is a healthy one all the same
            clearPollFailures()
            return true
        }
        shownRefreshTicket = ticket
        #if DEBUG
        DebugConsole.shared.trace(source: .network, action: "refresh:\(ticket):apply")
        #endif
        let after = show(snapshot, askedAt: asked, skipped: skip, truthOrDareFastPolled: truthOrDareFastPolled)

        // The two requests a refresh makes besides, once everything else is on screen
        if let typing = after.typing {
            try? await api.setTypingAction(participantId: hostId, action: typing.action, drawingStartedAt: typing.drawingStartedAt)
        }
        if let latest = after.replayOf {
            try await pollGame("replay") {
                let replay = try await api.getGameReplay(gameSessionId: latest.id)
                if latestGameSession?.id == latest.id { gameReplay = replay }
            }
        }
        // A poll counts as healthy only when the whole cycle completed
        clearPollFailures()
        return true
    }

    /// What showing a snapshot leaves to be asked for
    private struct SnapshotFollowUp {
        /// The typing action to send: the host has come onto a drawing step, or has left one
        var typing: (action: String?, drawingStartedAt: Double?)?
        /// The finished session whose replay is not here
        var replayOf: GameSession?
    }

    /// Shows a snapshot: every assignment of a refresh, in the order the requests one by one make them. Not
    /// async, so they are all made in one turn and nothing else runs between two of them. `asked` holds the
    /// epochs read before the request left, `skipped` the sections it left out, and `truthOrDareFastPolled`
    /// says whether Truth or Dare's fast poll ran as it left
    private func show(_ snapshot: RoomSnapshot, askedAt asked: (background: Int, emojiMatch: Int, truthOrDare: Int), skipped: Set<RoomSnapshot.Section>, truthOrDareFastPolled: Bool) -> SnapshotFollowUp {
        /// A game section the server answered is assigned: nil means the server says there is no game. One it
        /// left out keeps its value, as after a game request that failed, and unless the request asked for it
        /// to be left out it is logged as one
        func take<Value>(_ part: RoomSnapshot.Part<Value>, _ section: RoomSnapshot.Section, _ assign: (Value?) -> Void) {
            switch part {
            case .answered(let value):
                assign(value)
            case .missing:
                guard !skipped.contains(section) else { return }
                DebugConsole.shared.trace(source: .network, action: "poll:\(section.rawValue):error", detail: "Not in the snapshot", ok: false)
            }
        }
        var after = SnapshotFollowUp()

        room = roomOnScreen(snapshot.room, askedAt: asked.background)
        // Closed is final: this device has nothing to come back to
        if snapshot.room.status == .closed { SavedHostRoom.clear(roomId: roomId) }
        participants = snapshot.participants
        syncHostLanguage()
        messages = snapshot.messages.sorted { $0.createdAt < $1.createdAt }

        // Re-merge any remaining queued messages so they stay visible
        if !offlineQueue.isEmpty {
            mergeQueueIntoMessages()
        }

        var map: [String: [ReactionSummaryEntry]] = [:]
        for summary in snapshot.reactions {
            map[summary.messageId] = summary.reactions
        }
        reactionSummaries = map

        take(snapshot.activeSession, .activeSession) { activeGameSession = $0 }
        if activeGameSession != nil {
            take(snapshot.gameStatus, .gameStatus) { gameStatus = $0 }
        } else {
            gameStatus = nil
        }
        updateDrawCountdown()
        let previousStepType = myActiveStep?.stepType
        take(snapshot.myActiveStep, .myActiveStep) { myActiveStep = $0 }
        // The server has moved on from a guess whose reply is still out. The reply, or a retry's, gets 3 s more to
        // bring the answer, and no longer: a lost reply costs the stamp, not the host's next round
        if guessHoldAwaitsReply, let held = heldGuessStep, myActiveStep?.id != held.id {
            holdGuessStep(held, for: 3, awaitingReply: false)
        }

        // The typing action is "drawing" while on a draw step. The change is seen here, by this refresh only,
        // and sent once everything is assigned
        let currentStepType = myActiveStep?.stepType
        if currentStepType != previousStepType {
            if currentStepType == .draw {
                let timerSecs = myActiveStep?.timerEnabled ?? 20
                after.typing = ("drawing", timerSecs > 0 ? Date().timeIntervalSince1970 * 1000 : nil)
            } else if previousStepType == .draw {
                after.typing = (nil, nil)
            }
        }
        take(snapshot.latestSession, .latestSession) { latestGameSession = $0 }
        if let latest = latestGameSession, latest.status == .complete {
            // A complete session does not change on the server, so its replay is asked for until it is here and
            // not again
            if gameReplay?.session.id != latest.id { after.replayOf = latest }
        } else {
            gameReplay = nil
        }

        // A game is not shown while its own fast poll runs, which it may have begun to do since the request
        // left. Its answers are the newer ones
        if wordRushPollTask == nil {
            take(snapshot.wordRush, .wordRush) { applyWordRushState($0) }
        }
        if emojiMatchPollTask == nil {
            take(snapshot.emojiMatch, .emojiMatch) { applyEmojiMatchState($0, askedAt: asked.emojiMatch) }
        }
        if emojiBingoPollTask == nil {
            take(snapshot.emojiBingo, .emojiBingo) { applyEmojiBingoState($0) }
        }
        // Nor is Truth or Dare when its fast poll ran as the request left or runs now: a finished answer in
        // the game is then sent to be translated, and that is all. Nothing is done with a game that an action
        // is under way for, or has been since the request left
        let translationOnly = truthOrDareFastPolled || truthOrDarePollTask != nil
        take(snapshot.truthOrDare, .truthOrDare) {
            applyTruthOrDareState($0, askedAt: asked.truthOrDare, translationOnly: translationOnly)
        }

        if isLoading { isLoading = false }
        return after
    }
}
