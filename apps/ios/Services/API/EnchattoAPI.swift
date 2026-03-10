import Foundation

/// Result of creating a room
struct CreateRoomResult {
    let roomId: String
    let joinCode: String
    let hostId: String
}

/// Protocol defining all backend operations the host app needs
protocol EnchattoAPI {
    /// Create a new room with the given settings
    func createRoom(hostNickname: String, hostAvatarId: String, settings: RoomSettings) async throws -> CreateRoomResult

    /// Fetch the current room state (room + participants)
    func getRoomState(roomId: String) async throws -> (room: Room, participants: [Participant])

    /// Fetch all messages for a room
    func getRoomMessages(roomId: String) async throws -> [Message]

    /// Fetch pending messages that need processing
    func getPendingMessages(roomId: String) async throws -> [Message]

    /// Submit a processed message result
    func submitProcessedMessage(messageId: String, processing: ProcessingState) async throws

    /// Mark a message as failed
    func markMessageFailed(messageId: String, error: String) async throws

    /// Send a text message from the host
    func sendTextMessage(roomId: String, senderId: String, text: String, replyToId: String?) async throws -> String

    /// Send an image message
    func sendImageMessage(roomId: String, senderId: String, mediaUrl: String, replyToId: String?) async throws -> String

    /// Send a drawing message
    func sendDrawingMessage(roomId: String, senderId: String, mediaUrl: String, replyToId: String?) async throws -> String

    /// Close a room
    func closeRoom(roomId: String) async throws

    /// Kick a participant from the room
    func kickParticipant(participantId: String, roomId: String) async throws

    /// Add a reaction
    func addReaction(messageId: String, participantId: String, emoji: String) async throws

    /// Remove a reaction
    func removeReaction(messageId: String, participantId: String, emoji: String) async throws

    /// Delete a message for all users
    func deleteMessage(messageId: String) async throws

    /// Fetch reaction summaries for all messages in a room
    func getRoomReactions(roomId: String) async throws -> [MessageReactionSummary]

    /// Update participant online/offline status (heartbeat)
    func setParticipantOnline(participantId: String, online: Bool, presence: String?) async throws

    /// Update typing action (typing, drawing, or nil to clear)
    func setTypingAction(participantId: String, action: String?) async throws
}
