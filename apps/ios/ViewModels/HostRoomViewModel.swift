import Foundation
import SwiftUI
import UIKit
import Combine
import Network
import NaturalLanguage
import Translation

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
    }

    // MARK: - Observation

    func startObserving() {
        // Poll for room state and messages
        pollTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                await self.refresh()
                try? await Task.sleep(nanoseconds: 2_000_000_000)
            }
        }

        // Heartbeat every 15 seconds to keep presence alive
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

        // Poll for pending messages and process them
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
                try? await api.setParticipantOnline(participantId: hostId, online: true, presence: "online")
            }
            if pollTask == nil {
                startObserving()
            }
        case .background:
            Task {
                try? await api.setParticipantOnline(participantId: hostId, online: true, presence: "away")
            }
            stopObserving()
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

            isLoading = false
        } catch {
            // Only show errors when online — offline failures are expected
            if networkMonitor.isConnected {
                self.error = error.localizedDescription
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
        // TODO: Upload to storage, get permanent URL
        // For now, convert to data URL placeholder
        guard let data = image.jpegData(compressionQuality: 0.7) else { return }
        let base64 = data.base64EncodedString()
        let mediaUrl = "data:image/jpeg;base64,\(base64)"

        guard networkMonitor.isConnected else {
            enqueueMedia(kind: .image, mediaUrl: mediaUrl, replyToId: replyToId)
            return
        }
        do {
            _ = try await api.sendImageMessage(
                roomId: roomId,
                senderId: hostId,
                mediaUrl: mediaUrl,
                replyToId: replyToId
            )
            await refresh()
        } catch {
            enqueueMedia(kind: .image, mediaUrl: mediaUrl, replyToId: replyToId)
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
                    _ = try await api.sendImageMessage(
                        roomId: roomId,
                        senderId: hostId,
                        mediaUrl: queued.mediaUrl ?? "",
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

    func setTypingAction(_ action: String?) {
        let key = action ?? "nil"
        guard key != lastTypingAction else { return }
        lastTypingAction = key
        Task {
            try? await api.setTypingAction(participantId: hostId, action: action)
        }
    }
}
