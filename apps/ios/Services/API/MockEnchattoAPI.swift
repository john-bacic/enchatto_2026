import Foundation

/// Mock implementation for development and previews
class MockEnchattoAPI: EnchattoAPI {
    private var rooms: [String: Room] = [:]
    private var participants: [String: [Participant]] = [:]
    private var messages: [String: [Message]] = [:]

    func createRoom(hostNickname: String, hostAvatarId: String, settings: RoomSettings) async throws -> CreateRoomResult {
        let roomId = UUID().uuidString
        let joinCode = String((0..<6).map { _ in "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".randomElement()! })
        let hostId = UUID().uuidString

        let room = Room(
            id: roomId,
            joinCode: joinCode,
            status: .waiting,
            settings: settings,
            hostId: hostId,
            createdAt: Date()
        )

        let host = Participant(
            id: hostId,
            roomId: roomId,
            nickname: hostNickname,
            role: .host,
            platform: .ios,
            avatar: AvatarConfig(type: .preset, value: hostAvatarId),
            preferredLanguage: settings.sourceLanguage,
            online: true,
            lastSeenAt: Date(),
            joinedAt: Date()
        )

        rooms[roomId] = room
        participants[roomId] = [host]
        messages[roomId] = []

        // Add a mock participant after a short delay
        Task {
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            let mockParticipant = Participant(
                id: UUID().uuidString,
                roomId: roomId,
                nickname: "Alice",
                role: .participant,
                platform: .web,
                avatar: AvatarConfig(type: .preset, value: "cat"),
                preferredLanguage: "en",
                online: true,
                lastSeenAt: Date(),
                joinedAt: Date()
            )
            self.participants[roomId]?.append(mockParticipant)

            // Add a mock pending message
            let mockMessage = Message(
                id: UUID().uuidString,
                roomId: roomId,
                senderId: mockParticipant.id,
                kind: .text,
                status: .pending,
                text: "Hello! Nice to meet you!",
                createdAt: Date()
            )
            self.messages[roomId]?.append(mockMessage)
        }

        return CreateRoomResult(roomId: roomId, joinCode: joinCode, hostId: hostId)
    }

    func getRoomState(roomId: String) async throws -> (room: Room, participants: [Participant]) {
        guard let room = rooms[roomId] else {
            throw APIError.roomNotFound
        }
        return (room, participants[roomId] ?? [])
    }

    func getRoomMessages(roomId: String) async throws -> [Message] {
        return messages[roomId] ?? []
    }

    func getPendingMessages(roomId: String) async throws -> [Message] {
        return (messages[roomId] ?? []).filter { $0.status == .pending }
    }

    func submitProcessedMessage(messageId: String, processing: ProcessingState) async throws {
        for roomId in messages.keys {
            if let index = messages[roomId]?.firstIndex(where: { $0.id == messageId }) {
                messages[roomId]?[index].status = .processed
                messages[roomId]?[index].processing = processing
                messages[roomId]?[index].processedAt = Date()
                return
            }
        }
    }

    func markMessageFailed(messageId: String, error: String) async throws {
        for roomId in messages.keys {
            if let index = messages[roomId]?.firstIndex(where: { $0.id == messageId }) {
                messages[roomId]?[index].status = .failed
                messages[roomId]?[index].processing = ProcessingState(error: error)
                messages[roomId]?[index].processedAt = Date()
                return
            }
        }
    }

    func sendTextMessage(roomId: String, senderId: String, text: String, replyToId: String?) async throws -> String {
        let messageId = UUID().uuidString
        let message = Message(
            id: messageId,
            roomId: roomId,
            senderId: senderId,
            kind: .text,
            status: .pending,
            text: text,
            replyToId: replyToId,
            createdAt: Date()
        )
        messages[roomId, default: []].append(message)
        return messageId
    }

    func generateUploadUrl() async throws -> String {
        return "https://mock-upload-url.example.com/upload"
    }

    func uploadData(_ data: Data, to uploadUrl: String, contentType: String) async throws -> String {
        return "mock-storage-id-\(UUID().uuidString)"
    }

    func sendImageMessage(roomId: String, senderId: String, storageId: String, replyToId: String?) async throws -> String {
        let messageId = UUID().uuidString
        let message = Message(
            id: messageId,
            roomId: roomId,
            senderId: senderId,
            kind: .image,
            status: .processed,
            mediaUrl: "https://mock-image-url.example.com/\(storageId)",
            replyToId: replyToId,
            createdAt: Date(),
            processedAt: Date()
        )
        messages[roomId, default: []].append(message)
        return messageId
    }

    func sendDrawingMessage(roomId: String, senderId: String, mediaUrl: String, replyToId: String?) async throws -> String {
        let messageId = UUID().uuidString
        let message = Message(
            id: messageId,
            roomId: roomId,
            senderId: senderId,
            kind: .drawing,
            status: .processed,
            mediaUrl: mediaUrl,
            replyToId: replyToId,
            createdAt: Date(),
            processedAt: Date()
        )
        messages[roomId, default: []].append(message)
        return messageId
    }

    func closeRoom(roomId: String) async throws {
        rooms[roomId]?.status = .closed
        rooms[roomId]?.closedAt = Date()
    }

    func kickParticipant(participantId: String, roomId: String) async throws {
        participants[roomId]?.removeAll { $0.id == participantId }
    }

    func deleteMessage(messageId: String) async throws {
        for roomId in messages.keys {
            messages[roomId]?.removeAll { $0.id == messageId }
        }
    }

    func addReaction(messageId: String, participantId: String, emoji: String) async throws {
        // Mock: no-op for now
    }

    func removeReaction(messageId: String, participantId: String, emoji: String) async throws {
        // Mock: no-op for now
    }

    func getRoomReactions(roomId: String) async throws -> [MessageReactionSummary] {
        return []
    }

    func setParticipantOnline(participantId: String, online: Bool, presence: String?) async throws {
        // Mock: no-op for now
    }

    func setTypingAction(participantId: String, action: String?, drawingStartedAt: Double? = nil) async throws {
        // Mock: no-op
    }

    // MARK: - Games

    func cancelGame(roomId: String, participantId: String) async throws {
        // Mock: no-op
    }

    func startGame(roomId: String, participantId: String, gameType: String, level: Int, timerSeconds: Int = 20, customPrompts: [[String: Any]]? = nil) async throws -> String {
        return UUID().uuidString
    }

    func submitGameStep(stepId: String, participantId: String, outputText: String?, outputDrawingUrl: String?, selectedOption: String?) async throws {
        // Mock: no-op
    }

    func getActiveGameSession(roomId: String) async throws -> GameSession? {
        return nil
    }

    func getMyActiveStep(participantId: String) async throws -> GameStep? {
        return nil
    }

    func getLatestGameSession(roomId: String) async throws -> GameSession? {
        return nil
    }

    func getGameReplay(gameSessionId: String) async throws -> GameReplay? {
        return nil
    }

    func getGameStatus(roomId: String) async throws -> GameStatus? {
        return nil
    }

    // MARK: - Emojifyr

    func startEmojifyr(roomId: String, participantId: String) async throws -> String? {
        return UUID().uuidString
    }

    func submitEmojifyrSentence(roundId: String, sentence: String, isInitialism: Bool) async throws {
        // Mock: no-op
    }

    func updateEmojifyrSentence(roundId: String, sentence: String) async throws {}

    func submitEmojifyrEmojiClue(roundId: String, emojiClue: String) async throws {
        // Mock: no-op
    }

    func submitEmojifyrGuess(roundId: String, participantId: String, guessText: String) async throws {
        // Mock: no-op
    }

    func revealEmojifyrRound(roundId: String) async throws {
        // Mock: no-op
    }

    func advanceEmojifyrRound(gameSessionId: String) async throws {
        // Mock: no-op
    }

    func cancelEmojifyr(gameSessionId: String) async throws {
        // Mock: no-op
    }

    func getActiveEmojifyrSession(roomId: String) async throws -> GameSession? {
        return nil
    }

    func getCurrentEmojifyrRound(gameSessionId: String) async throws -> EmojifyrRound? {
        return nil
    }

    func getEmojifyrGuesses(roundId: String) async throws -> [EmojifyrGuess] {
        return []
    }

    func getEmojifyrGameState(roomId: String) async throws -> EmojifyrGameState? {
        return nil
    }

    func generateEmojiClueFromAI(sentence: String) async throws -> String {
        return "🐱💤🛋️"
    }

    // MARK: - Emoji Match

    func createEmojiMatchLobby(roomId: String, hostParticipantId: String) async throws -> String {
        return UUID().uuidString
    }

    func joinEmojiMatchLobby(gameId: String, participantId: String) async throws {}

    func leaveEmojiMatchLobby(gameId: String, participantId: String) async throws {}

    func startEmojiMatch(gameId: String, participantId: String) async throws {}

    func flipEmojiMatchCard(gameId: String, participantId: String, cardId: String) async throws {}

    func cancelEmojiMatch(gameId: String, participantId: String) async throws {}

    func playAgainEmojiMatch(gameId: String, participantId: String) async throws -> String {
        return UUID().uuidString
    }

    func getActiveEmojiMatch(roomId: String) async throws -> EmojiMatchGame? {
        return nil
    }

    // MARK: - Truth or Dare

    func createTruthOrDare(roomId: String, hostParticipantId: String) async throws -> String {
        return UUID().uuidString
    }

    func submitTruthOrDareChoice(gameId: String, participantId: String, choice: String) async throws {}

    func submitTruthOrDareResponse(gameId: String, participantId: String, responseText: String?, responseMediaUrl: String?) async throws {}

    func advanceTruthOrDareTurn(gameId: String, participantId: String) async throws {}

    func skipTruthOrDareTurn(gameId: String, participantId: String) async throws {}

    func endTruthOrDare(gameId: String, participantId: String) async throws {}

    func submitTruthOrDareRating(turnId: String, participantId: String, score: Double) async throws {}

    func getActiveTruthOrDare(roomId: String) async throws -> TruthOrDareGame? {
        return nil
    }

}

enum APIError: LocalizedError {
    case roomNotFound
    case networkError
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .roomNotFound: return "Room not found"
        case .networkError: return "Network error"
        case .serverError(let msg): return msg
        }
    }
}
