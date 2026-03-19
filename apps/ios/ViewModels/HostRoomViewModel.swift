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

    // MARK: - Emojifyr state
    @Published var activeEmojifyrSession: GameSession?
    @Published var currentEmojifyrRound: EmojifyrRound?
    @Published var emojifyrGuesses: [EmojifyrGuess] = []
    @Published var emojifyrEmojiClue: String?
    @Published var isGeneratingEmoji: Bool = false

    private let heuristicEmojiService: EmojiClueGenerationService = HeuristicEmojiClueService()

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

        // Close room when app is terminated (swipe-up to kill)
        NotificationCenter.default.publisher(for: UIApplication.willTerminateNotification)
            .sink { [weak self] _ in
                guard let self else { return }
                let roomId = self.roomId
                let api = self.api
                Task { try? await api.closeRoom(roomId: roomId) }
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

            // Poll Emojifyr state
            await pollEmojifyrState()

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
                guard message.kind == .text,
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
            print("Error fetching pending messages: \(error)")
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
                print("Error marking message as failed: \(error)")
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

    func startEmojifyr() async {
        guard networkMonitor.isConnected else { return }
        do {
            // Cancel any lingering active game first
            try? await api.cancelGame(roomId: roomId, participantId: hostId)

            _ = try await api.startEmojifyr(roomId: roomId, participantId: hostId)
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

    // MARK: - Emojifyr

    func pollEmojifyrState() async {
        do {
            // Use individual API calls instead of composite getEmojifyrGameState
            // (the composite endpoint returns participants as a dict which breaks decoding)
            let session = try await api.getActiveEmojifyrSession(roomId: roomId)
            activeEmojifyrSession = session

            if let session = session {
                currentEmojifyrRound = try await api.getCurrentEmojifyrRound(gameSessionId: session.id)
                if let round = currentEmojifyrRound {
                    emojifyrGuesses = try await api.getEmojifyrGuesses(roundId: round.id)

                    // Only auto-generate emoji clue when the HOST is the writer.
                    // When a web participant is the writer, they generate and
                    // preview the emoji clue on their own device before submitting.
                    if round.status == .generating,
                       isEmojifyrWriter,
                       !isGeneratingEmoji,
                       emojifyrEmojiClue == nil,
                       let sentence = round.originalSentence {
                        await generateEmojiClue(for: sentence)
                    }
                } else {
                    emojifyrGuesses = []
                }
            } else {
                currentEmojifyrRound = nil
                emojifyrGuesses = []
            }
        } catch {
            // Don't surface polling errors
            print("Error polling Emojifyr state: \(error)")
        }
    }

    func submitEmojifyrSentence(_ sentence: String) async {
        guard let round = currentEmojifyrRound else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.submitEmojifyrSentence(roundId: round.id, sentence: sentence)
            await generateEmojiClue(for: sentence)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func updateEmojifyrSentence(_ sentence: String) async {
        guard let round = currentEmojifyrRound else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.updateEmojifyrSentence(roundId: round.id, sentence: sentence)
        } catch {
            self.error = error.localizedDescription
        }
    }

    func generateEmojiClue(for sentence: String) async {
        isGeneratingEmoji = true
        emojifyrEmojiClue = nil

        // Primary: server-side AI (Anthropic Claude) via Convex action
        do {
            let clue = try await api.generateEmojiClueFromAI(sentence: sentence)
            emojifyrEmojiClue = clue
            isGeneratingEmoji = false
            return
        } catch {
            print("Server AI emoji generation failed, falling back to heuristic: \(error.localizedDescription)")
        }

        // Heuristic fallback (offline or if API fails)
        do {
            let clue = try await heuristicEmojiService.generateEmojiClue(from: sentence)
            emojifyrEmojiClue = clue
        } catch {
            emojifyrEmojiClue = "\u{2753}"
        }
        isGeneratingEmoji = false
    }

    func submitEmojifyrEmojiClue(_ clue: String) async {
        guard let round = currentEmojifyrRound else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.submitEmojifyrEmojiClue(roundId: round.id, emojiClue: clue)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func submitEmojifyrGuess(_ text: String) async {
        guard let round = currentEmojifyrRound else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.submitEmojifyrGuess(roundId: round.id, participantId: hostId, guessText: text)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func revealEmojifyrRound() async {
        guard let round = currentEmojifyrRound else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.revealEmojifyrRound(roundId: round.id)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func advanceEmojifyrRound() async {
        guard let session = activeEmojifyrSession else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.advanceEmojifyrRound(gameSessionId: session.id)
            emojifyrEmojiClue = nil
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func cancelEmojifyr() async {
        guard let session = activeEmojifyrSession else { return }
        guard networkMonitor.isConnected else { return }
        do {
            try await api.cancelEmojifyr(gameSessionId: session.id)
            activeEmojifyrSession = nil
            currentEmojifyrRound = nil
            emojifyrGuesses = []
            emojifyrEmojiClue = nil
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    var isEmojifyrWriter: Bool {
        currentEmojifyrRound?.writerParticipantId == hostId
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
        let romajiService = StubRomajiService()

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
                print("Offline translation error: \(error)")
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
                case .system:
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
}
