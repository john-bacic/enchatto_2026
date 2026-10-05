import Foundation
import SwiftUI
import UIKit
import Combine
import Network
import NaturalLanguage
import Translation
import AVFoundation

@MainActor
class HostRoomViewModel: ObservableObject {
    @Published var room: Room? {
        // The saved record keeps the background the room is drawn on: the start screen shows it on the way back out
        didSet {
            guard let texture = textureIndex, texture != Self.textureIndex(of: oldValue) else { return }
            SavedHostRoom.setBackground(texture, roomId: roomId)
        }
    }
    @Published var participants: [Participant] = []
    @Published var messages: [Message] = []
    @Published var reactionSummaries: [String: [ReactionSummaryEntry]] = [:]
    @Published var isLoading = true
    @Published var error: String?
    @Published var showParticipantSheet = false
    @Published var selectedParticipant: Participant?
    @Published var processingCount = 0
    @Published var activeGameSession: GameSession?
    @Published var myActiveStep: GameStep?
    @Published var latestGameSession: GameSession?
    @Published var gameReplay: GameReplay?
    @Published var gameStatus: GameStatus?
    @Published var drawCountdownTimeLeft: Int = -1

    // MARK: - Word Rush state
    @Published var activeWordRushGame: WordRushGame?
    /// Short-lived error toast for the Word Rush UI ("Already answered", upload failures…)
    @Published var wordRushError: String?
    /// Keyed by `cardKey` — the server hides my pick/result until reveal
    @Published var wordRushMyChoices: [String: Int] = [:]
    @Published var wordRushMyResults: [String: WordRushResult] = [:]
    @Published var wordRushHints: [String: String] = [:]
    /// Keyed by `phaseKey`
    @Published var wordRushMyVotes: [String: WordRushVote] = [:]
    @Published var wordRushDismissedId: String?
    /// Set by the Word Rush cover while it's on screen so polling stays fast even with no live game
    var wordRushCoverOpen = false {
        didSet { if wordRushCoverOpen { startWordRushFastPoll() } }
    }
    var wordRushSeenLiveIds: Set<String> = []
    var wordRushPollTask: Task<Void, Never>?

    // MARK: - Emoji Match state
    @Published var activeEmojiMatchGame: EmojiMatchGame?
    var emojiMatchPollTask: Task<Void, Never>?
    /// Emoji Match flips the host has sent that the server has not answered yet, with when each was tapped.
    /// On a clock that only goes forward: the device's own can be set back while a flip is out
    var emojiMatchFlipsInFlight: [UUID: ContinuousClock.Instant] = [:]
    /// Goes up when a flip is sent and again when it is answered or fails. A board fetched before either may
    /// not show it
    var emojiMatchEpoch = 0

    // MARK: - Emoji Bingo state
    @Published var activeEmojiBingoGame: EmojiBingoGame?
    var emojiBingoPollTask: Task<Void, Never>?

    // MARK: - Truth or Dare state
    @Published var activeTruthOrDareGame: TruthOrDareGame?
    @Published var isTruthOrDareSubmitting = false
    var truthOrDarePollTask: Task<Void, Never>?

    // MARK: - Draw countdown beep state
    var drawCountdownTimer: Timer?
    var trackedDrawStartMs: Double?
    /// Holds strong reference to AVAudioPlayer so it doesn't deallocate mid-playback.
    var beepPlayer: AVAudioPlayer?

    let roomId: String
    let hostId: String
    let api: EnchattoAPI
    private let processor: MessageProcessor
    private var pollTask: Task<Void, Never>?
    private var processingTask: Task<Void, Never>?
    private var heartbeatTask: Task<Void, Never>?
    /// The heartbeat outlives backgrounding by a few seconds; it must not report the host as back
    private var sceneInBackground = false
    /// Track message IDs currently being processed to avoid duplicates
    private var processingMessageIds: Set<String> = []

    // MARK: - Offline support
    let networkMonitor = NetworkMonitor()
    @Published var isOffline: Bool = false
    private var offlineQueue: [QueuedMessage] = []
    private var isFlushing = false
    /// The pass over the send queue that is running, kept so it can be cancelled
    private var flushTask: Task<Void, Never>?
    /// Id of the queued message that pass is sending right now
    private var sendingId: String?
    /// Local "queued-…" id → server id once delivered; a reply, reaction or delete that still holds the local id goes through this
    private var sentIds: [String: String] = [:] {
        didSet { deliveredIds = Set(sentIds.values) }
    }
    /// Server ids of the messages this device sent through its queue
    private var deliveredIds = Set<String>()
    private var cancellables = Set<AnyCancellable>()

    /// Incremented when a text message is going to wait in the queue (offline, or a send failed
    /// and will be retried), so the OfflineTranslator view can call `invalidate()` on its configs.
    @Published var offlineQueueVersion = 0

    /// Whether the on-device en↔ja translation packs are installed.
    @Published var translationPacksInstalled = true
    /// Set to true from the download banner; the OfflineTranslator observes this.
    @Published var requestTranslationDownload = false

    init(
        roomId: String,
        hostId: String,
        api: EnchattoAPI = AppConfig.makeAPI(),
        processor: MessageProcessor = MessageProcessor()
    ) {
        self.roomId = roomId
        self.hostId = hostId
        self.api = api
        self.processor = processor

        // Bind isOffline to inverse of networkMonitor.isConnected
        networkMonitor.$isConnected
            .map { !$0 }
            .assign(to: &$isOffline)

        // Fire reconnect handler
        networkMonitor.onReconnect = { [weak self] in
            Task { @MainActor [weak self] in
                self?.handleReconnect()
            }
        }

        // Close room when the app is killed while still running. iOS usually kills a suspended app
        // without this notification; the server closes those rooms once the host's heartbeat stops.
        NotificationCenter.default.publisher(for: UIApplication.willTerminateNotification)
            .sink { [weak self] _ in
                guard let self else { return }
                let roomId = self.roomId
                let api = self.api
                // The process ends when this returns, so wait (briefly) for the request to go out
                let done = DispatchSemaphore(value: 0)
                Task.detached {
                    try? await api.closeRoom(roomId: roomId)
                    done.signal()
                }
                _ = done.wait(timeout: .now() + 2)
            }
            .store(in: &cancellables)
    }

    // MARK: - Poll health

    enum PollIssue: Equatable {
        case reconnecting   // server unreachable or busy; polling goes on, more slowly
        case failing        // server answers with something a retry won't fix (4xx, unreadable reply)
    }

    /// Set when two polls in a row have failed, cleared by the next complete poll. Drives a banner, never the alert.
    @Published private(set) var pollIssue: PollIssue?
    private var consecutivePollFailures = 0
    /// Last poll failure written to the debug console, so one that repeats is logged once
    private var lastPollFailureLogged: String?

    private var pushRegistered = false

    /// Sends the background the host picked in Settings, and then whatever the host has picked meanwhile
    private var backgroundTask: Task<Void, Never>?
    /// Goes up when a background is sent and again when the request is answered or fails. A state asked for
    /// before either may be from before the server took the change
    private var backgroundEpoch = 0

    /// Language picked on this device. The server's copy sets the host's Word Rush direction, the language of
    /// Lost in Translation prompts and of the join push, and the badge guests see.
    private var hostLanguage = UserDefaults.standard.string(forKey: "enchatto_lastLanguage") ?? "en"
    private var hostLanguageTask: Task<Void, Never>?
    /// Earliest next send: never again after a server that refused (one without the route), 30 s after any other failure
    private var hostLanguageRetryAfter = Date.distantPast

    /// The refresh the last `commitGuess` started: the one that moves `myActiveStep` on from that guess
    var guessRefresh: Task<Void, Never>?

    /// A guess the host has sent whose Correct! / Wrong! has yet to be seen. The server closes a guess step as it
    /// takes the guess, so the next poll finds no step, or the host's next drawing; the game cover goes on showing
    /// this one. Presentation only: `myActiveStep` and the polls are what they are without it
    @Published var heldGuessStep: GameStep?
    /// Ends the hold when nothing else has: every hold has a deadline
    var guessHoldTimer: Task<Void, Never>?
    /// The guess is on its way and its reply is not in yet
    var guessHoldAwaitsReply = false

    // MARK: - Helpers

    func participant(for id: String) -> Participant? {
        participants.first { $0.id == id }
    }

    var onlineCount: Int {
        participants.filter { $0.online && !$0.isAway }.count
    }

    var awayCount: Int {
        participants.filter(\.isAway).count
    }

    var guestParticipants: [Participant] {
        participants.filter { $0.role != .host }
    }

    var isClosed: Bool {
        room?.status == .closed
    }

    var isProcessing: Bool {
        processingCount > 0
    }

    /// Participants (other than host) who are currently typing or drawing
    var typingParticipants: [Participant] {
        participants.filter { $0.id != hostId && $0.typingAction != nil }
    }

    private var lastTypingAction: String?

}

// MARK: - Sync

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
                try await pollGame("replay") {
                    let replay = try await api.getGameReplay(gameSessionId: latest.id)
                    if latestGameSession?.id == latest.id { gameReplay = replay }
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

// MARK: - Room

extension HostRoomViewModel {
    func closeRoom() async {
        do {
            try await api.closeRoom(roomId: roomId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func kickParticipant(_ participantId: String) async {
        do {
            try await api.kickParticipant(participantId: participantId, roomId: roomId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Background

    /// Index into RoomTexture.all the room is drawn on; nil until the room's state is here
    var textureIndex: Int? { Self.textureIndex(of: room) }

    private static func textureIndex(of room: Room?) -> Int? {
        room.map { RoomTexture.index(background: $0.background, joinCode: $0.joinCode) }
    }

    /// Gives the room another background, picked at random, for everyone in it. It is drawn here at once
    func randomizeBackground() {
        guard let current = textureIndex, !isClosed else { return }
        let before = room?.background
        room?.background = RoomTexture.randomIndex(not: current)
        guard backgroundTask == nil else { return }
        // No request was out, so the background the room had until this tap is the one the server has
        backgroundTask = Task { [weak self] in
            await self?.sendBackground(onServer: before)
        }
    }

    /// One request at a time, until the server has the background on screen. A pick made while a request is out
    /// is not sent on its own: the next request carries the latest. No state changes the background while this
    /// runs (see roomOnScreen), so the room's is the latest pick. `onServer` is the background the server has,
    /// kept up with its answers: the one that comes back when a request fails
    private func sendBackground(onServer: Int?) async {
        var onServer = onServer
        defer { backgroundTask = nil }
        while let picked = room?.background, picked != onServer {
            backgroundEpoch += 1
            defer { backgroundEpoch += 1 }
            do {
                try Task.checkCancellation()
                try await api.setRoomBackground(roomId: roomId, background: picked)
                onServer = picked
            } catch {
                // The host has left the room. Whether the server took the pick is not known here; the next
                // state says what the room has
                if Task.isCancelled || error.isCancellation { return }
                // The background the server has comes back, whatever was picked meanwhile
                room?.background = onServer
                self.error = error.localizedDescription
                return
            }
        }
    }

    /// The server's room as it is shown. A state asked for at `epoch` is the server's word on the background only
    /// if no pick has been sent or answered since and none is waiting: any other may be from before the server
    /// took a pick, and showing it as it is would put an earlier background back until the next state. So such
    /// a state leaves the background on screen; the rest of it is shown
    private func roomOnScreen(_ server: Room, askedAt epoch: Int) -> Room {
        guard backgroundTask != nil || epoch != backgroundEpoch, let shown = room else { return server }
        var room = server
        room.background = shown.background
        return room
    }

    // MARK: - Host language

    /// Called when the host switches language in Settings; the switch has already applied on this device
    func setHostLanguage(_ language: String) {
        guard language != hostLanguage else { return }
        hostLanguage = language
        hostLanguageRetryAfter = .distantPast
        syncHostLanguage()
    }

    /// Sends this device's language when the server's copy differs. Runs after every poll, so a room made on a server
    /// that ignored the language at creation, or a switch made offline, catches up on its own.
    private func syncHostLanguage() {
        let wanted = hostLanguage
        guard hostLanguageTask == nil, Date() >= hostLanguageRetryAfter,
              networkMonitor.isConnected, !isClosed,
              let host = participant(for: hostId), host.preferredLanguage != wanted else { return }
        let api = self.api
        let hostId = self.hostId
        hostLanguageTask = Task { [weak self] in
            var failure: Error?
            do {
                try await api.setParticipantLanguage(participantId: hostId, language: wanted)
            } catch {
                failure = error
            }
            guard let self else { return }
            self.hostLanguageTask = nil
            // Cancelled, or another language was picked meanwhile: the next poll starts over
            guard let failure, !Task.isCancelled, !failure.isCancellation, self.hostLanguage == wanted else { return }
            // Giving up for good takes the server's own refusal; an error that never reached it says nothing about the route
            self.hostLanguageRetryAfter = failure.isServerRefusal ? .distantFuture : Date().addingTimeInterval(30)
            DebugConsole.shared.trace(source: .network, action: "setLanguage:error", detail: failure.localizedDescription, ok: false)
        }
    }

    func setTypingAction(_ action: String?, drawingStartedAt: Double? = nil) {
        let key = action ?? "nil"
        guard key != lastTypingAction else { return }
        lastTypingAction = key
        Task {
            try? await api.setTypingAction(participantId: hostId, action: action, drawingStartedAt: drawingStartedAt)
        }
    }
}

// MARK: - MessagePipeline

extension HostRoomViewModel {
    // MARK: - Processing loop

    private func processPendingMessages() async {
        guard let settings = room?.settings else { return }
        guard !isClosed else { return }

        do {
            let pending = try await api.getPendingMessages(roomId: roomId)

            for message in pending {
                // Skip if already being processed or not a text message
                guard message.kind == .text || message.kind == .audio,
                      !processingMessageIds.contains(message.id) else { continue }

                guard let text = message.text, !text.isEmpty else { continue }

                processingMessageIds.insert(message.id)
                processingCount += 1

                // Process in a child task so we can handle multiple messages
                Task { [weak self] in
                    guard let self else { return }
                    await self.processMessage(message, settings: settings)
                }
            }
        } catch {
            // Don't surface polling errors to the user
            DebugConsole.shared.trace(source: .network, action: "poll:pending:error", detail: error.localizedDescription, ok: false)
        }
    }

    private func processMessage(_ message: Message, settings: RoomSettings) async {
        let config = ProcessingConfig(from: settings)

        do {
            let result = try await processor.process(text: message.text ?? "", config: config)
            do {
                try await api.submitProcessedMessage(messageId: message.id, processing: result)
            } catch let error where error.isRetryableNetworkFailure || error.isCancellation {
                // The result could not be delivered, which is not the message's fault: it stays pending and the next pending poll processes it again
                DebugConsole.shared.trace(source: .network, action: "submitProcessed:retryLater", detail: error.localizedDescription, ok: false)
            }
        } catch {
            do {
                try await api.markMessageFailed(messageId: message.id, error: error.localizedDescription)
            } catch {
                DebugConsole.shared.trace(source: .processing, action: "markFailed:error", detail: error.localizedDescription, ok: false)
            }
        }

        // Clean up tracking
        await MainActor.run {
            processingMessageIds.remove(message.id)
            processingCount = max(0, processingCount - 1)
        }

        // Refresh to show updated state
        await refresh()
    }
}

// MARK: - Messages

extension HostRoomViewModel {
    // MARK: - Actions

    /// Queues a text message and starts sending. The bubble is in `messages` when this returns
    func sendMessage(_ text: String, replyToId: String? = nil, clientId: String = UUID().uuidString) {
        // The server trims too; trimming here keeps a newline-only text from becoming a refused message
        let text = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        enqueue(QueuedMessage(text: text, replyToId: replyToId, clientId: clientId))
    }

    /// Uploads a recorded clip as a voice message. Audio can't wait in the offline queue,
    /// so if it can't go out the transcript is sent as a text message instead; with no transcript the host is told.
    func sendVoice(_ clip: VoiceClipFile, text: String, replyToId: String? = nil) async {
        defer { try? FileManager.default.removeItem(at: clip.url) }
        let transcript = text.trimmingCharacters(in: .whitespacesAndNewlines)
        // One id for the clip and for the text that replaces it: if the clip did arrive, the text is not a second message
        let clientId = UUID().uuidString
        // Set once send-audio is on its way: from then on a failure does not say whether the message was made
        var audioRequestOut = false
        do {
            guard networkMonitor.isConnected else { throw APIError.serverError("Offline") }
            let data = try Data(contentsOf: clip.url)
            func upload() async throws -> String {
                let uploadUrl = try await api.generateUploadUrl()
                return try await api.uploadData(data, to: uploadUrl, contentType: "audio/mp4")
            }
            let storageId: String
            do {
                storageId = try await upload()
            } catch let error where error.isRetryableNetworkFailure {
                // No message exists before send-audio, so the upload can be repeated whatever became of the first try.
                // send-audio itself is not repeated here: its request may have arrived (the client repeats a 5xx answer once)
                try await Task.sleep(nanoseconds: 1_000_000_000)
                storageId = try await upload()
            }
            audioRequestOut = true
            _ = try await api.sendAudioMessage(
                roomId: roomId,
                senderId: hostId,
                storageId: storageId,
                durationMs: clip.durationMs,
                waveform: clip.waveform,
                text: transcript.isEmpty ? nil : transcript,
                replyToId: serverMessageId(replyToId),
                clientId: clientId
            )
            await refresh()
        } catch {
            DebugConsole.shared.trace(source: .network, action: "sendVoice:error", detail: error.localizedDescription, ok: false)
            if !transcript.isEmpty {
                sendMessage(transcript, replyToId: replyToId, clientId: clientId)
            } else if !Task.isCancelled, !error.isCancellation {
                // The answer may be what was lost: look for the clip before telling the host to record it again
                if audioRequestOut {
                    await refresh()
                    if messages.contains(where: { $0.clientId == clientId && $0.senderId == hostId }) { return }
                }
                // Nothing to send in its place and the recording is gone: say so instead of dropping it without a sign
                self.error = L.t("Couldn't send. Try again.", hostLanguage)
            }
        }
    }

    /// Dictation text made on the server from the recording (device recognizer unusable); nil on failure
    func transcribeDictation(_ clip: VoiceClipFile) async -> String? {
        defer { try? FileManager.default.removeItem(at: clip.url) }
        do {
            guard networkMonitor.isConnected else { throw APIError.serverError("Offline") }
            let data = try Data(contentsOf: clip.url)
            let uploadUrl = try await api.generateUploadUrl()
            let storageId = try await api.uploadData(data, to: uploadUrl, contentType: "audio/mp4")
            let text = try await api.transcribeDictation(roomId: roomId, senderId: hostId, storageId: storageId)
            return text?.trimmingCharacters(in: .whitespacesAndNewlines)
        } catch {
            DebugConsole.shared.trace(source: .network, action: "transcribeDictation:error", detail: error.localizedDescription, ok: false)
            return nil
        }
    }

    func sendImage(_ image: UIImage, replyToId: String? = nil) {
        guard let data = image.jpegData(compressionQuality: 0.7) else { return }
        let base64 = data.base64EncodedString()
        let queued = QueuedMessage(kind: .image, mediaUrl: "data:image/jpeg;base64,\(base64)", replyToId: replyToId)
        // The bubble draws from this, as a placeholder and as the server's copy, instead of loading the picture again
        SentPictures.store(image, clientId: queued.clientId)
        enqueue(queued)
    }

    func sendDrawing(_ image: UIImage, replyToId: String? = nil) {
        guard let data = image.pngData() else { return }
        let base64 = data.base64EncodedString()
        let queued = QueuedMessage(kind: .drawing, mediaUrl: "data:image/png;base64,\(base64)", replyToId: replyToId)
        SentPictures.store(image, clientId: queued.clientId)
        enqueue(queued)
    }

    func addReaction(messageId: String, emoji: String) async {
        // A message that has not reached the server cannot be reacted to
        guard let messageId = serverMessageId(messageId) else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.addReaction(messageId: messageId, participantId: hostId, emoji: emoji)
            await refresh()
        } catch {
            if networkMonitor.isConnected {
                self.error = error.localizedDescription
            }
        }
    }

    func removeReaction(messageId: String, emoji: String) async {
        guard let messageId = serverMessageId(messageId) else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.removeReaction(messageId: messageId, participantId: hostId, emoji: emoji)
            await refresh()
        } catch {
            if networkMonitor.isConnected {
                self.error = error.localizedDescription
            }
        }
    }

    func deleteMessage(messageId: String) async {
        // A queued message is dropped here; the request is only needed once the server has it
        if messageId.hasPrefix("queued-") {
            // A photo still uploading keeps the pass, and every message behind it, waiting for that request to end.
            // Only then: once send-image (or a text or drawing send) is out, the request may already have made the
            // message, and the pass has to hear the answer to take it back
            let uploading = sendingId == messageId
                && offlineQueue.contains { $0.id == messageId && $0.kind == .image && $0.storageId == nil }
            offlineQueue.removeAll { $0.id == messageId }
            mergeQueueIntoMessages()
            // The next poll starts a new pass for what is left
            if uploading { flushTask?.cancel() }
        }
        guard let messageId = serverMessageId(messageId) else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.deleteMessage(messageId: messageId)
            await refresh()
        } catch {
            if networkMonitor.isConnected {
                self.error = error.localizedDescription
            }
        }
    }

    func replyTarget(for message: Message) -> Message? {
        guard let replyToId = message.replyToId else { return nil }
        return self.message(withId: replyToId)
    }

    /// A message by id; a local "queued-…" id still resolves after the server's copy has replaced the placeholder
    func message(withId id: String) -> Message? {
        if let found = messages.first(where: { $0.id == id }) { return found }
        guard let sent = sentIds[id] else { return nil }
        return messages.first { $0.id == sent }
    }

    /// Whether the server's copy of a message replaced a placeholder that was already on this screen. Known from
    /// the send's own answer, so it does not depend on the server echoing the clientId (one from before
    /// clientId existed does not)
    func wasSentFromThisDevice(_ messageId: String) -> Bool {
        deliveredIds.contains(messageId)
    }

    /// The id the server knows a message by; nil for one that has not been delivered. A local id is never sent to the server
    private func serverMessageId(_ id: String?) -> String? {
        guard let id, id.hasPrefix("queued-") else { return id }
        return sentIds[id]
    }
}

// MARK: - SendQueue

extension HostRoomViewModel {
    // MARK: - Offline queue

    /// Messages waiting to go out. One the server refused is not waiting: it says so on its bubble
    var pendingQueueCount: Int { offlineQueue.filter(\.isWaiting).count }
    /// A waiting message has already failed once: sending is held up although the phone reports a connection
    var isSendDelayed: Bool { offlineQueue.contains { $0.isWaiting && $0.attempts > 0 } }

    private func enqueue(_ queued: QueuedMessage) {
        offlineQueue.append(queued)
        mergeQueueIntoMessages()
        // On-device translation is for a message that has to wait (offline, or behind one being retried).
        // One that goes straight out is translated by the server and the host pipeline, as before.
        if queued.kind == .text, !networkMonitor.isConnected || isSendDelayed {
            // Signal OfflineTranslator to re-trigger .translationTask via invalidate()
            offlineQueueVersion += 1
        }
        kickFlush()
    }

    private func mergeQueueIntoMessages() {
        // Remove old placeholders
        var merged = messages.filter { !$0.isQueuedPlaceholder }
        // Drop queued messages the server's list now contains: from here on the server's copy is the row
        if !offlineQueue.isEmpty {
            let serverIds = Set(merged.map(\.id))
            var realIdByClientId: [String: String] = [:]
            for message in merged {
                // Only the host's own: the server tells repeats apart by sender too, so another sender may carry the same clientId
                if let clientId = message.clientId, message.senderId == hostId { realIdByClientId[clientId] = message.id }
            }
            var delivered = Set<String>()
            for queued in offlineQueue {
                if let sent = queued.sentMessageId, serverIds.contains(sent) {
                    delivered.insert(queued.id)
                } else if let real = realIdByClientId[queued.clientId] {
                    // The send's answer was lost but the message is there
                    sentIds[queued.id] = real
                    delivered.insert(queued.id)
                }
            }
            if !delivered.isEmpty { offlineQueue.removeAll { delivered.contains($0.id) } }
        }
        // Append current queue as placeholder messages
        let placeholders = offlineQueue.map {
            $0.toPlaceholderMessage(roomId: roomId, senderId: hostId)
        }
        // Every placeholder goes last, in the order it was sent. One still on its way will be stamped by the server later
        // than everything listed, and sorting it by the phone's clock could put it above a message it follows. A refused
        // one stays there too: moved to its place in time when it turns "Not sent", it would leave the screen unnoticed
        merged.sort { $0.createdAt < $1.createdAt }
        merged.append(contentsOf: placeholders)
        // One assignment, so the list is published once per merge
        messages = merged
    }

    /// Called by the view's `.translationTask` with the session for a given direction.
    @available(iOS 18.0, *)
    func translateQueueBatch(session: TranslationSession, fromLang: String) async {
        var didTranslate = false
        let romajiService = MeCabRomajiService.shared

        // A snapshot of ids, not indices: the queue changes during the awaits below (a send finishes, a bubble is deleted)
        let candidates: [(id: String, text: String)] = offlineQueue.compactMap { queued in
            guard queued.kind == .text, queued.sentMessageId == nil, !queued.processingAttempted,
                  let text = queued.text, !text.isEmpty else { return nil }
            return (id: queued.id, text: text)
        }
        for candidate in candidates {
            let text = candidate.text
            guard detectLanguage(text) == fromLang else { continue }

            do {
                let response = try await session.translate(text)
                let translatedText = response.targetText
                let isJapanese = (fromLang == "ja")
                let romajiSource = isJapanese ? text : translatedText
                let romaji = try? await romajiService.transliterateJapaneseToRomaji(text: romajiSource)

                // Find the message again by id; skip it if it was sent or deleted meanwhile
                guard let index = offlineQueue.firstIndex(where: { $0.id == candidate.id }),
                      offlineQueue[index].sentMessageId == nil else { continue }
                offlineQueue[index].processing = ProcessingState(
                    translatedText: translatedText,
                    romaji: romaji,
                    suggestions: nil
                )
                offlineQueue[index].processingAttempted = true
                didTranslate = true
            } catch {
                // Translation failed — leave processingAttempted false so it retries
                DebugConsole.shared.trace(source: .processing, action: "offline:translate:error", detail: error.localizedDescription, ok: false)
            }
        }
        if didTranslate {
            mergeQueueIntoMessages()
        }
    }

    private func detectLanguage(_ text: String) -> String {
        let recognizer = NLLanguageRecognizer()
        recognizer.processString(text)
        return recognizer.dominantLanguage == .japanese ? "ja" : "en"
    }

    private func handleReconnect() {
        // Back online: do not sit out a backoff earned while the connection was bad
        for index in offlineQueue.indices { offlineQueue[index].nextAttemptAt = .distantPast }
        kickFlush()
        Task { [weak self] in await self?.refresh() }
    }

    private enum FlushStep { case sent, skipped, stop }

    /// Blamed failures before a message is marked failed and the queue moves on. Blamed are the ones that can be about
    /// this one message, which would otherwise hold up everything behind it: a retryable status the server answered
    /// with, and a photo or drawing that does not get through while the room's own polls do. A text that fails in
    /// transit is never blamed, so an outage does not mark it failed.
    private static let maxServerAttempts = 5
    /// Timed-out attempts at a photo or drawing before it is marked failed: each one has already held the
    /// queue for up to a minute
    private static let maxMediaTimeouts = 2
    /// Refusals for sending too fast before a message is marked failed. The server's allowance is per minute and
    /// the sixth attempt comes a minute after the first, so a throttled message goes out once the minute is over.
    /// A ceiling all the same: a server that never stops refusing must not hold the queue for good
    private static let maxThrottledAttempts = 7

    /// 2, 4, 8, 16, then 30 s; checked on the poll, so a retry lands up to one poll later
    private static func retryDelay(afterAttempts attempts: Int) -> TimeInterval {
        min(30, pow(2, Double(attempts)))
    }

    /// Starts a pass over the send queue unless one is running
    private func kickFlush() {
        guard !isFlushing, networkMonitor.isConnected,
              let next = offlineQueue.first(where: { $0.isWaiting }), next.nextAttemptAt <= Date() else { return }
        // Set here, synchronously, so two kicks in one turn cannot start two passes
        isFlushing = true
        flushTask = Task { [weak self] in
            var delivered = false
            while !Task.isCancelled, let step = await self?.sendNextQueued(), step != .stop {
                if step == .sent { delivered = true }
            }
            self?.isFlushing = false
            if delivered, !Task.isCancelled { await self?.refresh() }
        }
    }

    /// Sends the oldest waiting message. `.stop` ends the pass: nothing is due, offline, cancelled, or a failure worth
    /// retrying (nothing behind it may go first)
    private func sendNextQueued() async -> FlushStep {
        guard networkMonitor.isConnected,
              let queued = offlineQueue.first(where: { $0.isWaiting }),
              queued.nextAttemptAt <= Date() else { return .stop }
        // Lets deleteMessage tell whether the bubble it removes is the one in flight
        sendingId = queued.id
        defer { if sendingId == queued.id { sendingId = nil } }
        do {
            let messageId = try await send(queued)
            guard let index = offlineQueue.firstIndex(where: { $0.id == queued.id }) else {
                // Gone during the request. If a poll already saw it on the server it is in sentIds;
                // otherwise the host deleted it: take it back
                if sentIds[queued.id] == nil { try? await api.deleteMessage(messageId: messageId) }
                return .sent
            }
            offlineQueue[index].sentMessageId = messageId
            offlineQueue[index].attempts = 0
            sentIds[queued.id] = messageId
            let processing = offlineQueue[index].processing
            mergeQueueIntoMessages()
            if queued.kind == .text, let processing {
                try? await api.submitProcessedMessage(messageId: messageId, processing: processing)
            }
            return .sent
        } catch {
            // Stopping the pass is not a failure of the message
            if Task.isCancelled || error.isCancellation { return .stop }
            DebugConsole.shared.trace(source: .network, action: "send:error", detail: error.localizedDescription, ok: false)
            guard let index = offlineQueue.firstIndex(where: { $0.id == queued.id }) else { return .skipped }
            var serverAnswered = false
            // The wording the server's limits use (messages.ts: TOO_FAST)
            var throttled = false
            if let apiError = error as? APIError, case .http(let status, let message) = apiError {
                serverAnswered = true
                throttled = status == 503 && message.contains("rate limit")
            }
            let attempts = offlineQueue[index].attempts + 1
            // Counted apart from `attempts`: timeouts in a dead spot must not use up the allowance, or the first 5xx
            // after them would mark the message failed
            let roomReachable = networkMonitor.isConnected && consecutivePollFailures == 0
            let mediaBlamed = queued.kind != .text && roomReachable
            let blamed = offlineQueue[index].blamedFailures + ((serverAnswered || mediaBlamed) ? 1 : 0)
            let slow = mediaBlamed && !serverAnswered && (error as? URLError)?.code == .timedOut
            let allowed = slow ? Self.maxMediaTimeouts : (throttled ? Self.maxThrottledAttempts : Self.maxServerAttempts)
            if error.isRetryableNetworkFailure, blamed < allowed {
                offlineQueue[index].attempts = attempts
                offlineQueue[index].blamedFailures = blamed
                offlineQueue[index].nextAttemptAt = Date().addingTimeInterval(Self.retryDelay(afterAttempts: attempts))
                // It is going to wait: translate it on the device meanwhile, as for a message queued offline
                if attempts == 1 { offlineQueueVersion += 1 }
                mergeQueueIntoMessages()
                return .stop
            }
            offlineQueue[index].sendFailed = true
            mergeQueueIntoMessages()
            return .skipped
        }
    }

    /// One attempt at one queued message; returns the server's message id
    private func send(_ queued: QueuedMessage) async throws -> String {
        // A reply to a bubble that was itself queued: its server id by now, or no reply if it never went out
        let replyToId = serverMessageId(queued.replyToId)
        switch queued.kind {
        case .text:
            return try await api.sendTextMessage(
                roomId: roomId,
                senderId: hostId,
                text: queued.text ?? "",
                replyToId: replyToId,
                clientId: queued.clientId
            )
        case .image:
            let storageId: String
            if let uploaded = queued.storageId {
                storageId = uploaded
            } else {
                // Decode base64 data URL back to raw data for Convex storage upload
                let mediaUrl = queued.mediaUrl ?? ""
                guard let comma = mediaUrl.firstIndex(of: ","),
                      let imageData = Data(base64Encoded: String(mediaUrl[mediaUrl.index(after: comma)...])) else {
                    throw APIError.serverError("Invalid image data")
                }
                let contentType = mediaUrl.hasPrefix("data:image/png") ? "image/png" : "image/jpeg"
                let uploadUrl = try await api.generateUploadUrl()
                storageId = try await api.uploadData(imageData, to: uploadUrl, contentType: contentType)
                // Deleted while it uploaded: do not post a photo only to take it back
                guard let index = offlineQueue.firstIndex(where: { $0.id == queued.id }) else {
                    throw APIError.serverError("Deleted before it was sent")
                }
                offlineQueue[index].storageId = storageId
            }
            return try await api.sendImageMessage(
                roomId: roomId,
                senderId: hostId,
                storageId: storageId,
                replyToId: replyToId,
                clientId: queued.clientId
            )
        case .drawing:
            return try await api.sendDrawingMessage(
                roomId: roomId,
                senderId: hostId,
                mediaUrl: queued.mediaUrl ?? "",
                replyToId: replyToId,
                clientId: queued.clientId
            )
        case .system, .audio, .unknown:
            throw APIError.serverError("Unsupported queued message")
        }
    }

    /// Retry on a failed bubble: back in line, same clientId
    func retrySend(id: String) {
        guard let index = offlineQueue.firstIndex(where: { $0.id == id }), offlineQueue[index].sendFailed else { return }
        offlineQueue[index].sendFailed = false
        offlineQueue[index].attempts = 0
        offlineQueue[index].blamedFailures = 0
        offlineQueue[index].nextAttemptAt = .distantPast
        offlineQueue[index].storageId = nil
        mergeQueueIntoMessages()
        kickFlush()
    }
}
