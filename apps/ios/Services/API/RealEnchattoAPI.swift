import Foundation

/// Real implementation that communicates with Convex via HTTP actions
class RealEnchattoAPI: EnchattoAPI {
    private let client: ConvexHTTPClient

    init(deploymentURL: String) {
        self.client = ConvexHTTPClient(deploymentURL: deploymentURL)
    }

    // MARK: - Rooms

    func createRoom(hostNickname: String, hostAvatarId: String, settings: RoomSettings) async throws -> CreateRoomResult {
        struct Response: Decodable {
            let roomId: String
            let joinCode: String
            let hostId: String
        }

        let body: [String: Any] = [
            "hostNickname": hostNickname,
            "hostAvatarId": hostAvatarId,
            "settings": [
                "sourceLanguage": settings.sourceLanguage,
                "targetLanguage": settings.targetLanguage,
                "romajiEnabled": settings.romajiEnabled,
                "suggestionsEnabled": settings.suggestionsEnabled,
                "maxParticipants": settings.maxParticipants,
            ] as [String: Any],
        ]

        let response: Response = try await client.post("/api/rooms/create", body: body)
        return CreateRoomResult(roomId: response.roomId, joinCode: response.joinCode, hostId: response.hostId)
    }

    func getRoomState(roomId: String) async throws -> (room: Room, participants: [Participant]) {
        struct Response: Decodable {
            let room: Room
            let participants: [Participant]
        }

        let response: Response = try await client.post("/api/rooms/state", body: ["roomId": roomId])
        return (response.room, response.participants)
    }

    func closeRoom(roomId: String) async throws {
        try await client.postVoid("/api/rooms/close", body: ["roomId": roomId])
    }

    // MARK: - Messages

    func getRoomMessages(roomId: String) async throws -> [Message] {
        let messages: [Message] = try await client.post("/api/messages/list", body: ["roomId": roomId])
        return messages
    }

    func getPendingMessages(roomId: String) async throws -> [Message] {
        let messages: [Message] = try await client.post("/api/messages/pending", body: ["roomId": roomId])
        return messages
    }

    func sendTextMessage(roomId: String, senderId: String, text: String, replyToId: String?) async throws -> String {
        struct Response: Decodable {
            let messageId: String
        }

        var body: [String: Any] = [
            "roomId": roomId,
            "senderId": senderId,
            "text": text,
        ]
        if let replyToId {
            body["replyToId"] = replyToId
        }

        let response: Response = try await client.post("/api/messages/send-text", body: body)
        return response.messageId
    }

    func sendImageMessage(roomId: String, senderId: String, mediaUrl: String, replyToId: String?) async throws -> String {
        struct Response: Decodable { let messageId: String }
        var body: [String: Any] = [
            "roomId": roomId,
            "senderId": senderId,
            "mediaUrl": mediaUrl,
        ]
        if let replyToId { body["replyToId"] = replyToId }
        let response: Response = try await client.post("/api/messages/send-image", body: body)
        return response.messageId
    }

    func sendDrawingMessage(roomId: String, senderId: String, mediaUrl: String, replyToId: String?) async throws -> String {
        struct Response: Decodable { let messageId: String }
        var body: [String: Any] = [
            "roomId": roomId,
            "senderId": senderId,
            "mediaUrl": mediaUrl,
        ]
        if let replyToId { body["replyToId"] = replyToId }
        let response: Response = try await client.post("/api/messages/send-drawing", body: body)
        return response.messageId
    }

    func submitProcessedMessage(messageId: String, processing: ProcessingState) async throws {
        var processingDict: [String: Any] = [:]
        if let translatedText = processing.translatedText {
            processingDict["translatedText"] = translatedText
        }
        if let romaji = processing.romaji {
            processingDict["romaji"] = romaji
        }
        if let suggestions = processing.suggestions {
            processingDict["suggestions"] = suggestions
        }
        if let error = processing.error {
            processingDict["error"] = error
        }

        try await client.postVoid("/api/messages/submit-processed", body: [
            "messageId": messageId,
            "processing": processingDict,
        ])
    }

    func markMessageFailed(messageId: String, error: String) async throws {
        try await client.postVoid("/api/messages/mark-failed", body: [
            "messageId": messageId,
            "error": error,
        ])
    }

    // MARK: - Participants

    func kickParticipant(participantId: String, roomId: String) async throws {
        try await client.postVoid("/api/participants/kick", body: [
            "participantId": participantId,
            "roomId": roomId,
        ])
    }

    // MARK: - Reactions

    func addReaction(messageId: String, participantId: String, emoji: String) async throws {
        try await client.postVoid("/api/reactions/add", body: [
            "messageId": messageId,
            "participantId": participantId,
            "emoji": emoji,
        ])
    }

    func removeReaction(messageId: String, participantId: String, emoji: String) async throws {
        try await client.postVoid("/api/reactions/remove", body: [
            "messageId": messageId,
            "participantId": participantId,
            "emoji": emoji,
        ])
    }

    // MARK: - Presence

    func setParticipantOnline(participantId: String, online: Bool, presence: String?) async throws {
        var body: [String: Any] = [
            "participantId": participantId,
            "online": online,
        ]
        if let presence {
            body["presence"] = presence
        }
        try await client.postVoid("/api/participants/set-online", body: body)
    }
}
