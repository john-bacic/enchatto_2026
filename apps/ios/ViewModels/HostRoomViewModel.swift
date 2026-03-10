import Foundation
import SwiftUI
import UIKit

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
            try? await self.api.setParticipantOnline(participantId: self.hostId, online: true, presence: "online")
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 15_000_000_000)
                try? await self.api.setParticipantOnline(participantId: self.hostId, online: true, presence: "online")
            }
        }

        // Poll for pending messages and process them
        processingTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                await self.processPendingMessages()
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
        do {
            let state = try await api.getRoomState(roomId: roomId)
            let msgs = try await api.getRoomMessages(roomId: roomId)
            let rxSummaries = try await api.getRoomReactions(roomId: roomId)

            room = state.room
            participants = state.participants
            messages = msgs.sorted { $0.createdAt < $1.createdAt }

            var map: [String: [ReactionSummaryEntry]] = [:]
            for summary in rxSummaries {
                map[summary.messageId] = summary.reactions
            }
            reactionSummaries = map

            isLoading = false
        } catch {
            self.error = error.localizedDescription
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
        do {
            _ = try await api.sendTextMessage(
                roomId: roomId,
                senderId: hostId,
                text: text,
                replyToId: replyToId
            )
            await refresh()
        } catch {
            self.error = error.localizedDescription
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

        do {
            _ = try await api.sendImageMessage(
                roomId: roomId,
                senderId: hostId,
                mediaUrl: mediaUrl,
                replyToId: replyToId
            )
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func sendDrawing(_ image: UIImage, replyToId: String? = nil) async {
        guard let data = image.pngData() else { return }
        let base64 = data.base64EncodedString()
        let mediaUrl = "data:image/png;base64,\(base64)"

        do {
            _ = try await api.sendDrawingMessage(
                roomId: roomId,
                senderId: hostId,
                mediaUrl: mediaUrl,
                replyToId: replyToId
            )
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func addReaction(messageId: String, emoji: String) async {
        do {
            try await api.addReaction(messageId: messageId, participantId: hostId, emoji: emoji)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func removeReaction(messageId: String, emoji: String) async {
        do {
            try await api.removeReaction(messageId: messageId, participantId: hostId, emoji: emoji)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func deleteMessage(messageId: String) async {
        do {
            try await api.deleteMessage(messageId: messageId)
            await refresh()
        } catch {
            self.error = error.localizedDescription
        }
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
