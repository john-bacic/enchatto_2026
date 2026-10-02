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
    /// Track message IDs currently being processed to avoid duplicates
    private var processingMessageIds: Set<String> = []

    // MARK: - Offline support
    let networkMonitor = NetworkMonitor()
    @Published var isOffline: Bool = false
    private var offlineQueue: [QueuedMessage] = []
    private var isFlushing = false
    private var cancellables = Set<AnyCancellable>()

    var pendingQueueCount: Int { offlineQueue.count }

    /// Incremented each time a text message is enqueued, so the
    /// OfflineTranslator view can call `invalidate()` on its configs.
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

    // MARK: - Observation

    func startObserving() {
        // Poll for room state and messages
        if pollTask == nil {
            pollTask = Task { [weak self] in
                guard let self else { return }
                while !Task.isCancelled {
                    await self.refresh()
                    try? await Task.sleep(nanoseconds: 2_000_000_000)
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
                    try? await self.api.setParticipantOnline(participantId: self.hostId, online: true, presence: "online")
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
                    try? await Task.sleep(nanoseconds: 1_500_000_000)
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
        stopEmojiMatchFastPoll()
        stopWordRushFastPoll()
    }

    func handleScenePhase(_ phase: ScenePhase) {
        switch phase {
        case .active:
            Task {
                // Brief delay to let the network reconnect after backgrounding
                try? await Task.sleep(nanoseconds: 500_000_000)
                try? await api.setParticipantOnline(participantId: hostId, online: true, presence: "online")
            }
            if pollTask == nil {
                startObserving()
            }
        case .background:
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

    func refresh() async {
        guard networkMonitor.isConnected else { return }
        do {
            let state = try await api.getRoomState(roomId: roomId)
            let msgs = try await api.getRoomMessages(roomId: roomId)
            let rxSummaries = try await api.getRoomReactions(roomId: roomId)

            room = state.room
            participants = state.participants
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

            // Poll game state
            activeGameSession = try? await api.getActiveGameSession(roomId: roomId)
            gameStatus = activeGameSession != nil ? (try? await api.getGameStatus(roomId: roomId)) : nil
            updateDrawCountdown()
            let previousStepType = myActiveStep?.stepType
            myActiveStep = try? await api.getMyActiveStep(participantId: hostId)
            latestGameSession = try? await api.getLatestGameSession(roomId: roomId)

            // Set typing action to "drawing" while on a draw step
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
            if let latest = latestGameSession, latest.status == .complete {
                gameReplay = try? await api.getGameReplay(gameSessionId: latest.id)
            } else {
                gameReplay = nil
            }

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
        } catch {
            // Only show errors when online and not a transient network issue
            if networkMonitor.isConnected && !isLoading {
                let desc = error.localizedDescription
                // Suppress transient connection errors (e.g. resuming from background)
                let transient = desc.contains("cancelled")
                    || desc.contains("canceled")
                    || desc.contains("network connection was lost")
                    || desc.contains("not connected to the internet")
                    || desc.contains("timed out")
                if !transient {
                    self.error = desc
                }
            }
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
            try await api.submitProcessedMessage(messageId: message.id, processing: result)
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

    func sendMessage(_ text: String, replyToId: String? = nil) async {
        guard networkMonitor.isConnected else {
            enqueueMessage(text: text, replyToId: replyToId)
            return
        }
        do {
            _ = try await api.sendTextMessage(
                roomId: roomId,
                senderId: hostId,
                text: text,
                replyToId: replyToId
            )
            await refresh()
        } catch {
            // Network may have dropped mid-request — enqueue instead of showing error
            enqueueMessage(text: text, replyToId: replyToId)
        }
    }

    /// Uploads a recorded clip as a voice message. Audio can't wait in the offline queue,
    /// so if it can't go out the transcript is sent as a text message instead.
    func sendVoice(_ clip: VoiceClipFile, text: String, replyToId: String? = nil) async {
        defer { try? FileManager.default.removeItem(at: clip.url) }
        let transcript = text.trimmingCharacters(in: .whitespacesAndNewlines)
        do {
            guard networkMonitor.isConnected else { throw APIError.serverError("Offline") }
            let data = try Data(contentsOf: clip.url)
            let uploadUrl = try await api.generateUploadUrl()
            let storageId = try await api.uploadData(data, to: uploadUrl, contentType: "audio/mp4")
            _ = try await api.sendAudioMessage(
                roomId: roomId,
                senderId: hostId,
                storageId: storageId,
                durationMs: clip.durationMs,
                waveform: clip.waveform,
                text: transcript.isEmpty ? nil : transcript,
                replyToId: replyToId
            )
            await refresh()
        } catch {
            DebugConsole.shared.trace(source: .network, action: "sendVoice:error", detail: error.localizedDescription, ok: false)
            if !transcript.isEmpty { await sendMessage(transcript, replyToId: replyToId) }
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

    func kickParticipant(_ participantId: String) async {
        do {
            try await api.kickParticipant(participantId: participantId, roomId: roomId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func sendImage(_ image: UIImage, replyToId: String? = nil) async {
        guard let data = image.jpegData(compressionQuality: 0.7) else { return }

        guard networkMonitor.isConnected else {
            let base64 = data.base64EncodedString()
            enqueueMedia(kind: .image, mediaUrl: "data:image/jpeg;base64,\(base64)", replyToId: replyToId)
            return
        }
        do {
            let uploadUrl = try await api.generateUploadUrl()
            let storageId = try await api.uploadData(data, to: uploadUrl, contentType: "image/jpeg")
            _ = try await api.sendImageMessage(
                roomId: roomId,
                senderId: hostId,
                storageId: storageId,
                replyToId: replyToId
            )
            await refresh()
        } catch {
            let base64 = data.base64EncodedString()
            enqueueMedia(kind: .image, mediaUrl: "data:image/jpeg;base64,\(base64)", replyToId: replyToId)
        }
    }

    func sendDrawing(_ image: UIImage, replyToId: String? = nil) async {
        guard let data = image.pngData() else { return }
        let base64 = data.base64EncodedString()
        let mediaUrl = "data:image/png;base64,\(base64)"

        guard networkMonitor.isConnected else {
            enqueueMedia(kind: .drawing, mediaUrl: mediaUrl, replyToId: replyToId)
            return
        }
        do {
            _ = try await api.sendDrawingMessage(
                roomId: roomId,
                senderId: hostId,
                mediaUrl: mediaUrl,
                replyToId: replyToId
            )
            await refresh()
        } catch {
            enqueueMedia(kind: .drawing, mediaUrl: mediaUrl, replyToId: replyToId)
        }
    }

    func addReaction(messageId: String, emoji: String) async {
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

    func startGame(gameType: String, level: Int = 1, timerSeconds: Int = 20) async {
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

            _ = try await api.startGame(roomId: roomId, participantId: hostId, gameType: gameType, level: level, timerSeconds: timerSeconds, customPrompts: customPrompts)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func submitGameStep(stepId: String, outputText: String?, outputDrawingUrl: String?, selectedOption: String? = nil) async {
        guard networkMonitor.isConnected else { return }
        do {
            try await api.submitGameStep(stepId: stepId, participantId: hostId, outputText: outputText, outputDrawingUrl: outputDrawingUrl, selectedOption: selectedOption)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func cancelGame() async {
        guard networkMonitor.isConnected else { return }
        do {
            try await api.cancelGame(roomId: roomId, participantId: hostId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    var isGameComplete: Bool {
        latestGameSession?.status == .complete && activeGameSession == nil
    }

    // MARK: - Word Rush

    struct WordRushResult: Equatable {
        let correct: Bool
        let points: Int
    }

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
            if case let .serverError(msg) = err { return msg }
            return nil
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

    private func enqueueMessage(text: String, replyToId: String?) {
        let queued = QueuedMessage(text: text, replyToId: replyToId)
        offlineQueue.append(queued)
        mergeQueueIntoMessages()
        // Signal OfflineTranslator to re-trigger .translationTask via invalidate()
        offlineQueueVersion += 1
    }

    private func enqueueMedia(kind: MessageKind, mediaUrl: String, replyToId: String?) {
        let queued = QueuedMessage(kind: kind, mediaUrl: mediaUrl, replyToId: replyToId)
        offlineQueue.append(queued)
        mergeQueueIntoMessages()
    }

    private func mergeQueueIntoMessages() {
        // Remove old placeholders
        messages.removeAll { $0.id.hasPrefix("queued-") }
        // Append current queue as placeholder messages
        let placeholders = offlineQueue.map {
            $0.toPlaceholderMessage(roomId: roomId, senderId: hostId)
        }
        messages.append(contentsOf: placeholders)
        messages.sort { $0.createdAt < $1.createdAt }
    }

    /// Called by the view's `.translationTask` with the session for a given direction.
    @available(iOS 18.0, *)
    func translateQueueBatch(session: TranslationSession, fromLang: String) async {
        var didTranslate = false
        let romajiService = MeCabRomajiService.shared

        for i in 0..<offlineQueue.count {
            guard !offlineQueue[i].processingAttempted else { continue }
            guard offlineQueue[i].kind == .text,
                  let text = offlineQueue[i].text, !text.isEmpty else {
                offlineQueue[i].processingAttempted = true
                continue
            }
            let detected = detectLanguage(text)
            guard detected == fromLang else { continue }

            do {
                let response = try await session.translate(text)
                let translatedText = response.targetText
                let isJapanese = (fromLang == "ja")
                let romajiSource = isJapanese ? text : translatedText
                let romaji = try? await romajiService.transliterateJapaneseToRomaji(text: romajiSource)

                offlineQueue[i].processing = ProcessingState(
                    translatedText: translatedText,
                    romaji: romaji,
                    suggestions: nil
                )
                offlineQueue[i].processingAttempted = true
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
        Task { [weak self] in
            guard let self else { return }
            await self.flushQueue()
            await self.refresh()
        }
    }

    private func flushQueue() async {
        guard !isFlushing else { return }
        isFlushing = true
        defer { isFlushing = false }

        while !offlineQueue.isEmpty {
            let queued = offlineQueue[0]
            do {
                switch queued.kind {
                case .text:
                    let messageId = try await api.sendTextMessage(
                        roomId: roomId,
                        senderId: hostId,
                        text: queued.text ?? "",
                        replyToId: queued.replyToId
                    )
                    if let processing = queued.processing {
                        try? await api.submitProcessedMessage(messageId: messageId, processing: processing)
                    }
                case .image:
                    // Decode base64 data URL back to raw data for Convex storage upload
                    let base64 = (queued.mediaUrl ?? "")
                        .replacingOccurrences(of: "data:image/jpeg;base64,", with: "")
                        .replacingOccurrences(of: "data:image/png;base64,", with: "")
                    guard let imageData = Data(base64Encoded: base64) else { break }
                    let contentType = queued.mediaUrl?.contains("image/png") == true ? "image/png" : "image/jpeg"
                    let uploadUrl = try await api.generateUploadUrl()
                    let storageId = try await api.uploadData(imageData, to: uploadUrl, contentType: contentType)
                    _ = try await api.sendImageMessage(
                        roomId: roomId,
                        senderId: hostId,
                        storageId: storageId,
                        replyToId: queued.replyToId
                    )
                case .drawing:
                    _ = try await api.sendDrawingMessage(
                        roomId: roomId,
                        senderId: hostId,
                        mediaUrl: queued.mediaUrl ?? "",
                        replyToId: queued.replyToId
                    )
                case .system, .audio, .unknown:
                    break
                }
                offlineQueue.removeFirst()
            } catch {
                // Stop on first failure — will retry on next reconnect
                break
            }
        }
        mergeQueueIntoMessages()
    }

    // MARK: - Helpers

    func participant(for id: String) -> Participant? {
        participants.first { $0.id == id }
    }

    func replyTarget(for message: Message) -> Message? {
        guard let replyToId = message.replyToId else { return nil }
        return messages.first { $0.id == replyToId }
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

    func pollEmojiMatchState() async {
        do {
            let game = try await api.getActiveEmojiMatch(roomId: roomId)
            // Always trust server state — optimistic updates in flipEmojiMatchCard
            // give instant local feedback, server catches up within 500ms
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
                    let game = try await self.api.getActiveEmojiMatch(roomId: self.roomId)
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

        // Optimistic update: immediately reveal the card locally for instant feedback
        if let idx = game.board.firstIndex(where: { $0.cardId == cardId }) {
            game.board[idx].isRevealed = true
            activeEmojiMatchGame = game
        }

        do {
            try await api.flipEmojiMatchCard(gameId: gameId, participantId: hostId, cardId: cardId)
            // Immediately fetch authoritative state — server has processed the flip
            // This replaces local state entirely, so mismatch resolution will
            // correctly flip cards back when the server sets isRevealed=false
            await pollEmojiMatchState()
        } catch {
            DebugConsole.shared.trace(source: .client, action: "emojiMatch:flip:error", detail: error.localizedDescription, ok: false)
            await pollEmojiMatchState()
        }
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
