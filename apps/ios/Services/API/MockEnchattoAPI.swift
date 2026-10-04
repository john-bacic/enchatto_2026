import Foundation

/// Mock implementation for development and previews
class MockEnchattoAPI: EnchattoAPI {
    private var rooms: [String: Room] = [:]
    private var participants: [String: [Participant]] = [:]
    private var messages: [String: [Message]] = [:]

    func createRoom(hostNickname: String, hostAvatarId: String, hostLanguage: String, settings: RoomSettings, background: Int?) async throws -> CreateRoomResult {
        let roomId = UUID().uuidString
        let joinCode = String((0..<6).map { _ in "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".randomElement()! })
        let hostId = UUID().uuidString
        // As the server does: the background asked for when it is one, else its own pick
        let background = background.flatMap { RoomTexture.all.indices.contains($0) ? $0 : nil } ?? RoomTexture.randomIndex()

        let room = Room(
            id: roomId,
            joinCode: joinCode,
            status: .waiting,
            settings: settings,
            hostId: hostId,
            createdAt: Date(),
            background: background
        )

        let host = Participant(
            id: hostId,
            roomId: roomId,
            nickname: hostNickname,
            role: .host,
            platform: .ios,
            avatar: AvatarConfig(type: .preset, value: hostAvatarId),
            preferredLanguage: hostLanguage,
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

        return CreateRoomResult(roomId: roomId, joinCode: joinCode, hostId: hostId, hostToken: nil, background: background)
    }

    func setCaller(hostId: String?, token: String?) {}

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

    func sendTextMessage(roomId: String, senderId: String, text: String, replyToId: String?, clientId: String?) async throws -> String {
        if let clientId, let existing = messages[roomId]?.first(where: { $0.clientId == clientId }) { return existing.id }
        let messageId = UUID().uuidString
        let message = Message(
            id: messageId,
            roomId: roomId,
            senderId: senderId,
            kind: .text,
            status: .pending,
            text: text,
            replyToId: replyToId,
            createdAt: Date(),
            clientId: clientId
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

    func sendImageMessage(roomId: String, senderId: String, storageId: String, replyToId: String?, clientId: String?) async throws -> String {
        if let clientId, let existing = messages[roomId]?.first(where: { $0.clientId == clientId }) { return existing.id }
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
            processedAt: Date(),
            clientId: clientId
        )
        messages[roomId, default: []].append(message)
        return messageId
    }

    func transcribeDictation(roomId: String, senderId: String, storageId: String) async throws -> String? {
        "Mock dictation"
    }

    func sendAudioMessage(roomId: String, senderId: String, storageId: String, durationMs: Int, waveform: [Double], text: String?, replyToId: String?, clientId: String?) async throws -> String {
        if let clientId, let existing = messages[roomId]?.first(where: { $0.clientId == clientId }) { return existing.id }
        let messageId = UUID().uuidString
        let message = Message(
            id: messageId,
            roomId: roomId,
            senderId: senderId,
            kind: .audio,
            status: .processed,
            text: text,
            mediaUrl: "https://mock-audio-url.example.com/\(storageId)",
            replyToId: replyToId,
            createdAt: Date(),
            processedAt: Date(),
            durationMs: Double(durationMs),
            waveform: waveform,
            clientId: clientId
        )
        messages[roomId, default: []].append(message)
        return messageId
    }

    func sendDrawingMessage(roomId: String, senderId: String, mediaUrl: String, replyToId: String?, clientId: String?) async throws -> String {
        if let clientId, let existing = messages[roomId]?.first(where: { $0.clientId == clientId }) { return existing.id }
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
            processedAt: Date(),
            clientId: clientId
        )
        messages[roomId, default: []].append(message)
        return messageId
    }

    func closeRoom(roomId: String) async throws {
        rooms[roomId]?.status = .closed
        rooms[roomId]?.closedAt = Date()
    }

    func setHostPushToken(roomId: String, hostId: String, token: String) async throws {}

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

    func setParticipantLanguage(participantId: String, language: String) async throws {
        for roomId in participants.keys {
            if let index = participants[roomId]?.firstIndex(where: { $0.id == participantId }) {
                participants[roomId]?[index].preferredLanguage = language
                return
            }
        }
    }

    // MARK: - Games

    func cancelGame(roomId: String, participantId: String) async throws {
        // Mock: no-op
    }

    func startGame(roomId: String, participantId: String, gameType: String, level: Int, timerSeconds: Int = 20, customPrompts: [[String: Any]]? = nil, teams: GameTeamsRequest? = nil) async throws -> String {
        return UUID().uuidString
    }

    func dealTeams(roomId: String, participantId: String, previous: [[String]]?) async throws -> GameTeamDeal {
        // Mock: every other participant. Asked for another split, the second and third change places
        let playerIds = (participants[roomId] ?? []).map(\.id)
        guard playerIds.count >= LITTeams.minPlayers else { return GameTeamDeal(playerIds: playerIds, teams: nil) }
        var order = playerIds
        if let previous, previous.contains(where: { $0.contains(order[0]) && $0.contains(order[2]) }) {
            order.swapAt(1, 2)
        }
        let teams = [0, 1].map { team in order.enumerated().filter { $0.offset % 2 == team }.map(\.element) }
        return GameTeamDeal(playerIds: playerIds, teams: teams)
    }

    func submitGameStep(stepId: String, participantId: String, outputText: String?, outputDrawingUrl: String?, selectedOption: String?) async throws -> GameGuessAnswer? {
        // Mock: no-op
        return nil
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

    // MARK: - Word Rush

    func createWordRushLobby(roomId: String, hostParticipantId: String, pack: String, sayIt: Bool) async throws -> String {
        return UUID().uuidString
    }

    func joinWordRush(gameId: String, participantId: String) async throws {}

    func leaveWordRush(gameId: String, participantId: String) async throws {}

    func updateWordRushSettings(gameId: String, participantId: String, pack: String?, sayIt: Bool?) async throws {}

    func startWordRush(gameId: String, participantId: String) async throws {}

    func answerWordRush(gameId: String, participantId: String, choiceIndex: Int) async throws -> (correct: Bool, points: Int) {
        return (true, 300)
    }

    func wordRushHint(gameId: String, participantId: String) async throws -> String {
        return "s· · · ·"
    }

    func submitWordRushClip(gameId: String, participantId: String, storageId: String) async throws {}

    func skipWordRushMic(gameId: String, participantId: String) async throws {}

    func voteWordRush(gameId: String, participantId: String, vote: String) async throws {}

    func submitWordRushTeachClip(gameId: String, participantId: String, storageId: String) async throws {}

    func skipWordRushPhase(gameId: String, participantId: String, phaseSeq: Int) async throws {}

    func cancelWordRush(gameId: String, participantId: String) async throws {}

    func playAgainWordRush(gameId: String, participantId: String) async throws -> String {
        return UUID().uuidString
    }

    func getWordRushState(roomId: String) async throws -> WordRushGame? {
        return nil
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

    func createTruthOrDare(roomId: String, hostParticipantId: String, promptMode: String) async throws -> String {
        return UUID().uuidString
    }

    func submitTruthOrDareChoice(gameId: String, participantId: String, choice: String) async throws {}

    func submitTruthOrDareResponse(gameId: String, participantId: String, responseText: String?, responseMediaUrl: String?) async throws {}

    func advanceTruthOrDareTurn(gameId: String, participantId: String) async throws {}

    func skipTruthOrDareTurn(gameId: String, participantId: String) async throws {}

    func hostSkipTruthOrDareTurn(gameId: String, participantId: String, turnId: String) async throws {}

    func acknowledgeTruthOrDareRoundBreak(gameId: String, participantId: String, completedTurns: Int) async throws {}

    func endTruthOrDare(gameId: String, participantId: String) async throws {}

    func submitTruthOrDareTranslation(turnId: String, translatedText: String) async throws {}

    func submitTruthOrDareRating(turnId: String, participantId: String, score: Double) async throws {}

    func getActiveTruthOrDare(roomId: String) async throws -> TruthOrDareGame? {
        return nil
    }

    func createEmojiBingoLobby(roomId: String, hostParticipantId: String) async throws -> String {
        return "mock-bingo-\(UUID().uuidString.prefix(8))"
    }

    func startEmojiBingo(gameId: String, participantId: String) async throws {}

    func rollEmojiBingo(gameId: String, participantId: String) async throws {}

    func markEmojiBingoCell(gameId: String, participantId: String, cellIndex: Int) async throws {}

    func claimEmojiBingo(gameId: String, participantId: String) async throws {}

    func cancelEmojiBingo(gameId: String, participantId: String) async throws {}

    func playAgainEmojiBingo(gameId: String, participantId: String) async throws -> String {
        return "mock-bingo-\(UUID().uuidString.prefix(8))"
    }

    func getActiveEmojiBingo(roomId: String) async throws -> EmojiBingoGame? {
        return nil
    }

}

enum APIError: LocalizedError {
    case roomNotFound
    case networkError
    case serverError(String)
    /// The server answered with a status other than 200; `message` is its "error" text, or "HTTP <status>"
    case http(status: Int, message: String)

    var errorDescription: String? {
        switch self {
        case .roomNotFound: return "Room not found"
        case .networkError: return "Network error"
        case .serverError(let msg): return msg
        case .http(_, let message): return message
        }
    }
}
