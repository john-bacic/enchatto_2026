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
    @Published var room: Room?
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
    private var wordRushSeenLiveIds: Set<String> = []
    private var wordRushPollTask: Task<Void, Never>?

    // MARK: - Emoji Match state
    @Published var activeEmojiMatchGame: EmojiMatchGame?
    private var emojiMatchPollTask: Task<Void, Never>?
    /// Emoji Match flips the host has sent that the server has not answered yet, with when each was tapped.
    /// On a clock that only goes forward: the device's own can be set back while a flip is out
    private var emojiMatchFlipsInFlight: [UUID: ContinuousClock.Instant] = [:]
    /// Goes up when a flip is sent and again when it is answered or fails. A board fetched before either may
    /// not show it
    private var emojiMatchEpoch = 0

    // MARK: - Emoji Bingo state
    @Published var activeEmojiBingoGame: EmojiBingoGame?
    private var emojiBingoPollTask: Task<Void, Never>?

    // MARK: - Truth or Dare state
    @Published var activeTruthOrDareGame: TruthOrDareGame?
    @Published var isTruthOrDareSubmitting = false
    private var truthOrDarePollTask: Task<Void, Never>?

    // MARK: - Draw countdown beep state
    private var drawCountdownTimer: Timer?
    private var trackedDrawStartMs: Double?
    /// Holds strong reference to AVAudioPlayer so it doesn't deallocate mid-playback.
    private var beepPlayer: AVAudioPlayer?

    let roomId: String
    let hostId: String
    private let api: EnchattoAPI
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

    /// Messages waiting to go out. One the server refused is not waiting: it says so on its bubble
    var pendingQueueCount: Int { offlineQueue.filter(\.isWaiting).count }
    /// A waiting message has already failed once: sending is held up although the phone reports a connection
    var isSendDelayed: Bool { offlineQueue.contains { $0.isWaiting && $0.attempts > 0 } }

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

    private var pushRegistered = false

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
            let state = try await api.getRoomState(roomId: roomId)
            let msgs = try await api.getRoomMessages(roomId: roomId)
            let rxSummaries = try await api.getRoomReactions(roomId: roomId)
            try Task.checkCancellation()

            room = state.room
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

    func closeRoom() async {
        do {
            try await api.closeRoom(roomId: roomId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Host language

    /// Language picked on this device. The server's copy sets the host's Word Rush direction, the language of
    /// Lost in Translation prompts and of the join push, and the badge guests see.
    private var hostLanguage = UserDefaults.standard.string(forKey: "enchatto_lastLanguage") ?? "en"
    private var hostLanguageTask: Task<Void, Never>?
    /// Earliest next send: never again after a server that refused (one without the route), 30 s after any other failure
    private var hostLanguageRetryAfter = Date.distantPast

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

    func kickParticipant(_ participantId: String) async {
        do {
            try await api.kickParticipant(participantId: participantId, roomId: roomId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
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

    /// The refresh the last `commitGuess` started: the one that moves `myActiveStep` on from that guess
    private(set) var guessRefresh: Task<Void, Never>?

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

    /// A guess the host has sent whose Correct! / Wrong! has yet to be seen. The server closes a guess step as it
    /// takes the guess, so the next poll finds no step, or the host's next drawing; the game cover goes on showing
    /// this one. Presentation only: `myActiveStep` and the polls are what they are without it
    @Published private(set) var heldGuessStep: GameStep?
    /// Ends the hold when nothing else has: every hold has a deadline
    private var guessHoldTimer: Task<Void, Never>?
    /// The guess is on its way and its reply is not in yet
    private var guessHoldAwaitsReply = false

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

    private func dropGuessHold() {
        guessHoldTimer?.cancel()
        guessHoldTimer = nil
        guessHoldAwaitsReply = false
        if heldGuessStep != nil { heldGuessStep = nil }
    }

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

    private func applyWordRushState(_ game: WordRushGame?) {
        if let game, game.isLive { wordRushSeenLiveIds.insert(game.id) }
        if game != activeWordRushGame { activeWordRushGame = game }
        if wordRushNeedsFastPoll { startWordRushFastPoll() }
    }

    private var wordRushNeedsFastPoll: Bool {
        wordRushCoverOpen || activeWordRushGame?.isLive == true
    }

    private func startWordRushFastPoll() {
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

    private func stopWordRushFastPoll() {
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

    // MARK: - Offline queue

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

    // MARK: - Helpers

    func participant(for id: String) -> Participant? {
        participants.first { $0.id == id }
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

    func setTypingAction(_ action: String?, drawingStartedAt: Double? = nil) {
        let key = action ?? "nil"
        guard key != lastTypingAction else { return }
        lastTypingAction = key
        Task {
            try? await api.setTypingAction(participantId: hostId, action: action, drawingStartedAt: drawingStartedAt)
        }
    }

    // MARK: - Draw countdown beeps

    /// Called after each poll to start/stop the countdown timer for draw phase beeps.
    private func updateDrawCountdown() {
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
            // The board to show: the server's, except that one which may be missing a flip leaves face-up
            // cards up, and one older than the screen's is not shown
            let game = emojiMatchBoard(try await api.getActiveEmojiMatch(roomId: roomId), askedAt: epoch)
            activeEmojiMatchGame = game

            // Start or stop fast polling based on game state
            let needsFastPoll = game != nil &&
                (game!.status == .active || game!.status == .resolving || game!.status == .lobby)
            if needsFastPoll && emojiMatchPollTask == nil {
                startEmojiMatchFastPoll()
            } else if !needsFastPoll && emojiMatchPollTask != nil {
                stopEmojiMatchFastPoll()
            }
        } catch {
            DebugConsole.shared.trace(source: .network, action: "poll:emojiMatch:error", detail: error.localizedDescription, ok: false)
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

    private func stopEmojiMatchFastPoll() {
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
            activeEmojiBingoGame = game
            let needsFastPoll = game != nil &&
                (game!.status == .active || game!.status == .won || game!.status == .lobby)
            if needsFastPoll && emojiBingoPollTask == nil {
                startEmojiBingoFastPoll()
            } else if !needsFastPoll && emojiBingoPollTask != nil {
                stopEmojiBingoFastPoll()
            }
        } catch {
            DebugConsole.shared.trace(source: .network, action: "poll:emojiBingo:error", detail: error.localizedDescription, ok: false)
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

    private func stopEmojiBingoFastPoll() {
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

    // MARK: - Truth or Dare

    func pollTruthOrDareState() async {
        do {
            let game = try await api.getActiveTruthOrDare(roomId: roomId)
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
        } catch {
            DebugConsole.shared.trace(source: .network, action: "poll:truthOrDare:error", detail: error.localizedDescription, ok: false)
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

    private func stopTruthOrDareFastPoll() {
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
        let result = try await action()
        await pollTruthOrDareState()
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
