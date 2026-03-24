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

    func generateUploadUrl() async throws -> String {
        struct Response: Decodable { let uploadUrl: String }
        let response: Response = try await client.post("/api/storage/generate-upload-url", body: [:])
        return response.uploadUrl
    }

    func uploadData(_ data: Data, to uploadUrl: String, contentType: String) async throws -> String {
        guard let url = URL(string: uploadUrl) else {
            throw APIError.serverError("Invalid upload URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        request.httpBody = data

        let (responseData, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw APIError.serverError("Upload failed")
        }
        guard let json = try JSONSerialization.jsonObject(with: responseData) as? [String: Any],
              let storageId = json["storageId"] as? String else {
            throw APIError.serverError("No storageId in upload response")
        }
        return storageId
    }

    func sendImageMessage(roomId: String, senderId: String, storageId: String, replyToId: String?) async throws -> String {
        struct Response: Decodable { let messageId: String }
        var body: [String: Any] = [
            "roomId": roomId,
            "senderId": senderId,
            "storageId": storageId,
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

    func deleteMessage(messageId: String) async throws {
        try await client.postVoid("/api/messages/delete", body: [
            "messageId": messageId,
        ])
    }

    func getRoomReactions(roomId: String) async throws -> [MessageReactionSummary] {
        let summaries: [MessageReactionSummary] = try await client.post("/api/reactions/room-summaries", body: ["roomId": roomId])
        return summaries
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

    func setTypingAction(participantId: String, action: String?, drawingStartedAt: Double? = nil) async throws {
        var body: [String: Any] = ["participantId": participantId]
        if let action {
            body["action"] = action
        }
        if let drawingStartedAt {
            body["drawingStartedAt"] = drawingStartedAt
        }
        try await client.postVoid("/api/participants/set-typing", body: body)
    }

    // MARK: - Games

    func cancelGame(roomId: String, participantId: String) async throws {
        try await client.postVoid("/api/games/cancel", body: [
            "roomId": roomId,
            "participantId": participantId,
        ])
    }

    func startGame(roomId: String, participantId: String, gameType: String, level: Int, timerSeconds: Int = 20, customPrompts: [[String: Any]]? = nil) async throws -> String {
        struct Response: Decodable { let sessionId: String }
        var body: [String: Any] = [
            "roomId": roomId,
            "participantId": participantId,
            "gameType": gameType,
            "level": level,
            "timerEnabled": timerSeconds,
        ]
        if let customPrompts {
            body["customPrompts"] = customPrompts
        }
        let response: Response = try await client.post("/api/games/start", body: body)
        return response.sessionId
    }

    func submitGameStep(stepId: String, participantId: String, outputText: String?, outputDrawingUrl: String?, selectedOption: String?) async throws {
        var body: [String: Any] = [
            "stepId": stepId,
            "participantId": participantId,
        ]
        if let outputText { body["outputText"] = outputText }
        if let outputDrawingUrl { body["outputDrawingUrl"] = outputDrawingUrl }
        if let selectedOption { body["selectedOption"] = selectedOption }
        try await client.postVoid("/api/games/submit-step", body: body)
    }

    func getActiveGameSession(roomId: String) async throws -> GameSession? {
        // Query returns null → jsonAction sends {"ok":true}; catch decode error → nil
        do {
            let session: GameSession = try await client.post("/api/games/active-session", body: ["roomId": roomId])
            return session
        } catch is DecodingError {
            return nil
        }
    }

    func getMyActiveStep(participantId: String) async throws -> GameStep? {
        do {
            let step: GameStep = try await client.post("/api/games/my-active-step", body: ["participantId": participantId])
            return step
        } catch is DecodingError {
            return nil
        }
    }

    func getLatestGameSession(roomId: String) async throws -> GameSession? {
        do {
            let session: GameSession = try await client.post("/api/games/latest-session", body: ["roomId": roomId])
            return session
        } catch is DecodingError {
            return nil
        }
    }

    func getGameReplay(gameSessionId: String) async throws -> GameReplay? {
        do {
            let replay: GameReplay = try await client.post("/api/games/replay", body: ["gameSessionId": gameSessionId])
            return replay
        } catch is DecodingError {
            return nil
        }
    }

    func getGameStatus(roomId: String) async throws -> GameStatus? {
        do {
            let status: GameStatus = try await client.post("/api/games/status", body: ["roomId": roomId])
            return status
        } catch is DecodingError {
            return nil
        }
    }

    // MARK: - Emojifyr

    func startEmojifyr(roomId: String, participantId: String) async throws -> String? {
        struct Response: Decodable { let sessionId: String }
        do {
            let response: Response = try await client.post("/api/emojifyr/start", body: [
                "roomId": roomId,
                "createdByParticipantId": participantId,
            ])
            return response.sessionId
        } catch is DecodingError {
            return nil
        }
    }

    func submitEmojifyrSentence(roundId: String, sentence: String, isInitialism: Bool) async throws {
        var body: [String: Any] = [
            "roundId": roundId,
            "sentence": sentence,
        ]
        if isInitialism {
            body["isInitialism"] = true
        }
        try await client.postVoid("/api/emojifyr/submit-sentence", body: body)
    }

    func updateEmojifyrSentence(roundId: String, sentence: String) async throws {
        try await client.postVoid("/api/emojifyr/update-sentence", body: [
            "roundId": roundId,
            "sentence": sentence,
        ])
    }

    func submitEmojifyrEmojiClue(roundId: String, emojiClue: String) async throws {
        try await client.postVoid("/api/emojifyr/submit-emoji-clue", body: [
            "roundId": roundId,
            "emojiClue": emojiClue,
        ])
    }

    func submitEmojifyrGuess(roundId: String, participantId: String, guessText: String) async throws {
        try await client.postVoid("/api/emojifyr/submit-guess", body: [
            "roundId": roundId,
            "participantId": participantId,
            "guessText": guessText,
        ])
    }

    func revealEmojifyrRound(roundId: String) async throws {
        try await client.postVoid("/api/emojifyr/reveal", body: [
            "roundId": roundId,
        ])
    }

    func advanceEmojifyrRound(gameSessionId: String) async throws {
        try await client.postVoid("/api/emojifyr/advance-round", body: [
            "gameSessionId": gameSessionId,
        ])
    }

    func cancelEmojifyr(gameSessionId: String) async throws {
        try await client.postVoid("/api/emojifyr/cancel", body: [
            "gameSessionId": gameSessionId,
        ])
    }

    func getActiveEmojifyrSession(roomId: String) async throws -> GameSession? {
        do {
            let session: GameSession = try await client.post("/api/emojifyr/active-session", body: ["roomId": roomId])
            return session
        } catch is DecodingError {
            return nil
        }
    }

    func getCurrentEmojifyrRound(gameSessionId: String) async throws -> EmojifyrRound? {
        do {
            let round: EmojifyrRound = try await client.post("/api/emojifyr/current-round", body: ["gameSessionId": gameSessionId])
            return round
        } catch is DecodingError {
            return nil
        }
    }

    func getEmojifyrGuesses(roundId: String) async throws -> [EmojifyrGuess] {
        do {
            let guesses: [EmojifyrGuess] = try await client.post("/api/emojifyr/guesses", body: ["roundId": roundId])
            return guesses
        } catch is DecodingError {
            return []
        }
    }

    func getEmojifyrGameState(roomId: String) async throws -> EmojifyrGameState? {
        do {
            let state: EmojifyrGameState = try await client.post("/api/emojifyr/game-state", body: ["roomId": roomId])
            return state
        } catch is DecodingError {
            return nil
        }
    }

    func generateEmojiClueFromAI(sentence: String) async throws -> String {
        struct Response: Decodable { let emojiClue: String }
        let response: Response = try await client.post("/api/emojifyr/generate-emoji-clue", body: [
            "sentence": sentence,
        ])
        return response.emojiClue
    }

    // MARK: - Emoji Match

    func createEmojiMatchLobby(roomId: String, hostParticipantId: String) async throws -> String {
        struct Response: Decodable { let gameId: String }
        let response: Response = try await client.post("/api/emoji-match/create-lobby", body: [
            "roomId": roomId,
            "hostParticipantId": hostParticipantId,
        ])
        return response.gameId
    }

    func joinEmojiMatchLobby(gameId: String, participantId: String) async throws {
        let _: [String: String] = try await client.post("/api/emoji-match/join", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func leaveEmojiMatchLobby(gameId: String, participantId: String) async throws {
        let _: [String: String] = try await client.post("/api/emoji-match/leave", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func startEmojiMatch(gameId: String, participantId: String) async throws {
        let _: [String: String] = try await client.post("/api/emoji-match/start", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func flipEmojiMatchCard(gameId: String, participantId: String, cardId: String) async throws {
        let _: [String: String] = try await client.post("/api/emoji-match/flip-card", body: [
            "gameId": gameId,
            "participantId": participantId,
            "cardId": cardId,
        ])
    }

    func cancelEmojiMatch(gameId: String, participantId: String) async throws {
        let _: [String: String] = try await client.post("/api/emoji-match/cancel", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func playAgainEmojiMatch(gameId: String, participantId: String) async throws -> String {
        struct Response: Decodable { let gameId: String }
        let response: Response = try await client.post("/api/emoji-match/play-again", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
        return response.gameId
    }

    func getActiveEmojiMatch(roomId: String) async throws -> EmojiMatchGame? {
        do {
            let game: EmojiMatchGame = try await client.post("/api/emoji-match/active", body: [
                "roomId": roomId,
            ])
            return game
        } catch is DecodingError {
            return nil
        }
    }

}
