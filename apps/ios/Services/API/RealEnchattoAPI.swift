import Foundation

/// Real implementation that communicates with Convex via HTTP actions
class RealEnchattoAPI: EnchattoAPI {
    private let client: ConvexHTTPClient

    init(deploymentURL: String) {
        self.client = ConvexHTTPClient(deploymentURL: deploymentURL)
    }

    // MARK: - Rooms

    func createRoom(hostNickname: String, hostAvatarId: String, hostLanguage: String, settings: RoomSettings, background: Int?) async throws -> CreateRoomResult {
        struct Response: Decodable {
            let roomId: String
            let joinCode: String
            let hostId: String
            let background: Background?

            /// Decodes from any value, to nil unless it is a whole number: the room exists whatever the reply says
            /// of its background, so that field never fails the reply
            struct Background: Decodable {
                let index: Int?

                init(from decoder: Decoder) throws {
                    index = try? decoder.singleValueContainer().decode(Int.self)
                }
            }
        }

        // Made here, kept by the server for the host it creates, and expected back with every request made as the
        // host. A server that predates tokens ignores the field, and the host stays one it accepts by id alone
        let hostToken = ConvexHTTPClient.makeToken()

        var body: [String: Any] = [
            "hostNickname": hostNickname,
            "hostAvatarId": hostAvatarId,
            "hostLanguage": hostLanguage,
            "hostToken": hostToken,
            "settings": [
                "sourceLanguage": settings.sourceLanguage,
                "targetLanguage": settings.targetLanguage,
                "romajiEnabled": settings.romajiEnabled,
                "suggestionsEnabled": settings.suggestionsEnabled,
                "maxParticipants": settings.maxParticipants,
            ] as [String: Any],
        ]
        // A server that takes no request for a background ignores the field and makes its own pick
        if let background { body["background"] = background }

        let response: Response = try await client.post("/api/rooms/create", body: body)
        return CreateRoomResult(roomId: response.roomId, joinCode: response.joinCode, hostId: response.hostId, hostToken: hostToken, background: response.background?.index)
    }

    func setCaller(hostId: String?, token: String?) {
        ConvexHTTPClient.caller = hostId.map { (id: $0, token: token) }
    }

    func getRoomState(roomId: String) async throws -> (room: Room, participants: [Participant]) {
        struct Response: Decodable {
            let room: Room
            let participants: [Participant]
        }

        let response: Response = try await client.post("/api/rooms/state", body: ["roomId": roomId])
        return (response.room, response.participants)
    }

    /// The path the snapshot is asked at. A Debug build started with the launch argument
    /// `-enchatto_noSnapshotRoute YES` asks a path the server has no route for, and is answered as a server from
    /// before the route answers: with its own 404
    private static var snapshotPath: String {
        #if DEBUG
        if UserDefaults.standard.bool(forKey: "enchatto_noSnapshotRoute") { return "/api/rooms/no-snapshot-route" }
        #endif
        return "/api/rooms/snapshot"
    }

    func getRoomSnapshot(roomId: String, participantId: String, skip: Set<RoomSnapshot.Section>) async throws -> RoomSnapshot {
        /// The answer, section by section. Each is the result of the query its own route runs, and is read as
        /// the getter for that route in this file reads its body
        struct Answer: Decodable {
            let snapshot: RoomSnapshot

            enum CodingKeys: String, CodingKey {
                case room, participants, messages, reactions
                case activeSession, gameStatus, myActiveStep, latestSession, wordRush, emojiMatch, emojiBingo, truthOrDare
            }

            init(from decoder: Decoder) throws {
                let sections = try decoder.container(keyedBy: CodingKeys.self)

                /// A game section. One that is not there is not null: null says there is no game. One that does
                /// not decode reads as no game too, as on its own route, whose {"ok":true} for none does not decode
                func part<Value: Decodable>(_ key: CodingKeys) -> RoomSnapshot.Part<Value> {
                    guard sections.contains(key) else { return .missing }
                    return .answered(try? sections.decode(Value.self, forKey: key))
                }

                // Word Rush is the game itself or null, where its own route wraps it ({"game": …}). There a game
                // that does not decode fails the request, and nothing is known of the game: the same here
                let wordRush: RoomSnapshot.Part<WordRushGame>
                do {
                    wordRush = sections.contains(.wordRush) ? .answered(try sections.decodeIfPresent(WordRushGame.self, forKey: .wordRush)) : .missing
                } catch {
                    wordRush = .missing
                }

                snapshot = RoomSnapshot(
                    // Missing, null or unreadable, any one of these four fails the whole answer
                    room: try sections.decode(Room.self, forKey: .room),
                    participants: try sections.decode([Participant].self, forKey: .participants),
                    messages: try sections.decode([Message].self, forKey: .messages),
                    reactions: try sections.decode([MessageReactionSummary].self, forKey: .reactions),
                    activeSession: part(.activeSession),
                    gameStatus: part(.gameStatus),
                    myActiveStep: part(.myActiveStep),
                    latestSession: part(.latestSession),
                    wordRush: wordRush,
                    emojiMatch: part(.emojiMatch),
                    emojiBingo: part(.emojiBingo),
                    truthOrDare: part(.truthOrDare)
                )
            }
        }

        var body: [String: Any] = ["roomId": roomId, "participantId": participantId]
        if !skip.isEmpty { body["skip"] = skip.map(\.rawValue).sorted() }
        let answer: Answer = try await client.post(RealEnchattoAPI.snapshotPath, body: body)
        return answer.snapshot
    }

    func closeRoom(roomId: String) async throws {
        try await client.postVoid("/api/rooms/close", body: ["roomId": roomId], retriesOn5xx: 1)
    }

    func setRoomBackground(roomId: String, background: Int) async throws {
        try await client.postVoid("/api/rooms/background", body: ["roomId": roomId, "background": background], retriesOn5xx: 1)
    }

    func setHostPushToken(roomId: String, hostId: String, token: String) async throws {
        try await client.postVoid("/api/rooms/push-token", body: ["roomId": roomId, "hostId": hostId, "token": token], retriesOn5xx: 1)
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

    func sendTextMessage(roomId: String, senderId: String, text: String, replyToId: String?, clientId: String?) async throws -> String {
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
        if let clientId { body["clientId"] = clientId }

        let response: Response = try await client.post("/api/messages/send-text", body: body)
        return response.messageId
    }

    func generateUploadUrl() async throws -> String {
        struct Response: Decodable { let uploadUrl: String }
        let response: Response = try await client.post("/api/storage/generate-upload-url", body: [:], retriesOn5xx: 1)
        return response.uploadUrl
    }

    // Not through client.post: the upload URL is its own credential, and the caller's token must not be sent to it
    func uploadData(_ data: Data, to uploadUrl: String, contentType: String) async throws -> String {
        guard let url = URL(string: uploadUrl) else {
            throw APIError.serverError("Invalid upload URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = ConvexHTTPClient.longTimeout
        request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        request.httpBody = data

        let (responseData, response) = try await ConvexHTTPClient.session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else { throw APIError.networkError }
        guard httpResponse.statusCode == 200 else {
            throw APIError.http(status: httpResponse.statusCode, message: "Upload failed")
        }
        guard let json = try JSONSerialization.jsonObject(with: responseData) as? [String: Any],
              let storageId = json["storageId"] as? String else {
            throw APIError.serverError("No storageId in upload response")
        }
        return storageId
    }

    func sendImageMessage(roomId: String, senderId: String, storageId: String, replyToId: String?, clientId: String?) async throws -> String {
        struct Response: Decodable { let messageId: String }
        var body: [String: Any] = [
            "roomId": roomId,
            "senderId": senderId,
            "storageId": storageId,
        ]
        if let replyToId { body["replyToId"] = replyToId }
        if let clientId { body["clientId"] = clientId }
        let response: Response = try await client.post("/api/messages/send-image", body: body)
        return response.messageId
    }

    func sendAudioMessage(roomId: String, senderId: String, storageId: String, durationMs: Int, waveform: [Double], text: String?, replyToId: String?, clientId: String?) async throws -> String {
        struct Response: Decodable { let messageId: String }
        var body: [String: Any] = [
            "roomId": roomId,
            "senderId": senderId,
            "storageId": storageId,
            "durationMs": durationMs,
            "waveform": waveform,
        ]
        if let text, !text.isEmpty { body["text"] = text }
        if let replyToId { body["replyToId"] = replyToId }
        if let clientId { body["clientId"] = clientId }
        // Sent once, outside the send queue, so it gets the long wait and one repeat of a 5xx (clientId makes the repeat the same message)
        let response: Response = try await client.post("/api/messages/send-audio", body: body, timeout: ConvexHTTPClient.longTimeout, retriesOn5xx: 1)
        return response.messageId
    }

    func transcribeDictation(roomId: String, senderId: String, storageId: String) async throws -> String? {
        struct Response: Decodable { let text: String? }
        let response: Response = try await client.post("/api/messages/transcribe", body: [
            "roomId": roomId,
            "senderId": senderId,
            "storageId": storageId,
        ], timeout: ConvexHTTPClient.longTimeout)
        return response.text
    }

    func sendDrawingMessage(roomId: String, senderId: String, mediaUrl: String, replyToId: String?, clientId: String?) async throws -> String {
        struct Response: Decodable { let messageId: String }
        var body: [String: Any] = [
            "roomId": roomId,
            "senderId": senderId,
            "mediaUrl": mediaUrl,
        ]
        if let replyToId { body["replyToId"] = replyToId }
        if let clientId { body["clientId"] = clientId }
        let response: Response = try await client.post("/api/messages/send-drawing", body: body, timeout: ConvexHTTPClient.longTimeout)
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

    func setParticipantLanguage(participantId: String, language: String) async throws {
        try await client.postVoid("/api/participants/set-language", body: [
            "participantId": participantId,
            "language": language,
        ])
    }

    // MARK: - Reactions

    func addReaction(messageId: String, participantId: String, emoji: String) async throws {
        try await client.postVoid("/api/reactions/add", body: [
            "messageId": messageId,
            "participantId": participantId,
            "emoji": emoji,
        ], retriesOn5xx: 1)
    }

    func removeReaction(messageId: String, participantId: String, emoji: String) async throws {
        try await client.postVoid("/api/reactions/remove", body: [
            "messageId": messageId,
            "participantId": participantId,
            "emoji": emoji,
        ], retriesOn5xx: 1)
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

    func startGame(roomId: String, participantId: String, gameType: String, level: Int, timerSeconds: Int = 20, customPrompts: [[String: Any]]? = nil, teams: GameTeamsRequest? = nil) async throws -> String {
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
        // Left out for individual play, which is also what a server from before teams makes of it
        switch teams {
        case .auto: body["teams"] = "auto"
        case .split(let split): body["teams"] = split
        case nil: break
        }
        let response: Response = try await client.post("/api/games/start", body: body)
        return response.sessionId
    }

    func dealTeams(roomId: String, participantId: String, previous: [[String]]?) async throws -> GameTeamDeal {
        var body: [String: Any] = [
            "roomId": roomId,
            "participantId": participantId,
        ]
        if let previous {
            body["previous"] = previous
        }
        return try await client.post("/api/games/deal-teams", body: body)
    }

    func submitGameStep(stepId: String, participantId: String, outputText: String?, outputDrawingUrl: String?, selectedOption: String?) async throws -> GameGuessAnswer? {
        var body: [String: Any] = [
            "stepId": stepId,
            "participantId": participantId,
        ]
        if let outputText { body["outputText"] = outputText }
        if let outputDrawingUrl { body["outputDrawingUrl"] = outputDrawingUrl }
        if let selectedOption { body["selectedOption"] = selectedOption }
        // A guess is a few bytes; a drawing carries the PNG. A request that hangs must fail while the server still has
        // the step open, so the overlay's retry can land. The timeout is an idle one: an upload that keeps moving is not cut off.
        let timeout: TimeInterval = outputDrawingUrl == nil ? ConvexHTTPClient.defaultTimeout : 15
        // {"ok":true} when the server has nothing to say about a guess. Any 200 means it has dealt with the step, so
        // a field that is missing or of another type is no answer, never a failed send. A body that is not JSON
        // still throws
        struct Reply: Decodable {
            var correct: Bool?
            var correctOption: String?
            var selectedOption: String?
            enum CodingKeys: String, CodingKey { case correct, correctOption, selectedOption }
            init(from decoder: Decoder) throws {
                guard let fields = try? decoder.container(keyedBy: CodingKeys.self) else { return }
                correct = try? fields.decodeIfPresent(Bool.self, forKey: .correct)
                correctOption = try? fields.decodeIfPresent(String.self, forKey: .correctOption)
                selectedOption = try? fields.decodeIfPresent(String.self, forKey: .selectedOption)
            }
        }
        let reply: Reply = try await client.post("/api/games/submit-step", body: body, timeout: timeout)
        guard let correct = reply.correct, let correctOption = reply.correctOption else { return nil }
        return GameGuessAnswer(correct: correct, correctOption: correctOption, selectedOption: reply.selectedOption)
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

    // MARK: - Word Rush

    func createWordRushLobby(roomId: String, hostParticipantId: String, pack: String, sayIt: Bool) async throws -> String {
        struct Response: Decodable { let gameId: String }
        let response: Response = try await client.post("/api/word-rush/create-lobby", body: [
            "roomId": roomId,
            "hostParticipantId": hostParticipantId,
            "pack": pack,
            "sayIt": sayIt,
        ] as [String: Any])
        return response.gameId
    }

    func joinWordRush(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/word-rush/join", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func leaveWordRush(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/word-rush/leave", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func updateWordRushSettings(gameId: String, participantId: String, pack: String?, sayIt: Bool?) async throws {
        var body: [String: Any] = [
            "gameId": gameId,
            "participantId": participantId,
        ]
        if let pack { body["pack"] = pack }
        if let sayIt { body["sayIt"] = sayIt }
        try await client.postVoid("/api/word-rush/update-settings", body: body)
    }

    func startWordRush(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/word-rush/start", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func answerWordRush(gameId: String, participantId: String, choiceIndex: Int) async throws -> (correct: Bool, points: Int) {
        struct Response: Decodable {
            let correct: Bool
            let points: Double
        }
        let response: Response = try await client.post("/api/word-rush/answer", body: [
            "gameId": gameId,
            "participantId": participantId,
            "choiceIndex": choiceIndex,
        ] as [String: Any])
        return (response.correct, Int(response.points.rounded()))
    }

    func wordRushHint(gameId: String, participantId: String) async throws -> String {
        struct Response: Decodable { let hint: String }
        let response: Response = try await client.post("/api/word-rush/hint", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
        return response.hint
    }

    func submitWordRushClip(gameId: String, participantId: String, storageId: String) async throws {
        try await client.postVoid("/api/word-rush/submit-clip", body: [
            "gameId": gameId,
            "participantId": participantId,
            "storageId": storageId,
        ])
    }

    func skipWordRushMic(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/word-rush/skip-mic", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func voteWordRush(gameId: String, participantId: String, vote: String) async throws {
        try await client.postVoid("/api/word-rush/vote", body: [
            "gameId": gameId,
            "participantId": participantId,
            "vote": vote,
        ])
    }

    func submitWordRushTeachClip(gameId: String, participantId: String, storageId: String) async throws {
        try await client.postVoid("/api/word-rush/submit-teach-clip", body: [
            "gameId": gameId,
            "participantId": participantId,
            "storageId": storageId,
        ])
    }

    func skipWordRushPhase(gameId: String, participantId: String, phaseSeq: Int) async throws {
        try await client.postVoid("/api/word-rush/skip", body: [
            "gameId": gameId,
            "participantId": participantId,
            "phaseSeq": phaseSeq,
        ] as [String: Any])
    }

    func cancelWordRush(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/word-rush/cancel", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func playAgainWordRush(gameId: String, participantId: String) async throws -> String {
        struct Response: Decodable { let gameId: String }
        let response: Response = try await client.post("/api/word-rush/play-again", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
        return response.gameId
    }

    func getWordRushState(roomId: String) async throws -> WordRushGame? {
        struct Response: Decodable { let game: WordRushGame? }
        let response: Response = try await client.post("/api/word-rush/state", body: ["roomId": roomId])
        return response.game
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

    // These routes answer {"ok": true}, which does not decode as [String: String]: postVoid, or
    // every successful call throws and skips the poll that follows it.
    func joinEmojiMatchLobby(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/emoji-match/join", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func leaveEmojiMatchLobby(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/emoji-match/leave", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func startEmojiMatch(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/emoji-match/start", body: [
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
        try await client.postVoid("/api/emoji-match/cancel", body: [
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

    // MARK: - Truth or Dare

    func createTruthOrDare(roomId: String, hostParticipantId: String, promptMode: String) async throws -> String {
        struct Response: Decodable { let gameId: String }
        let response: Response = try await client.post("/api/truth-or-dare/create", body: [
            "roomId": roomId,
            "hostParticipantId": hostParticipantId,
            "promptMode": promptMode,
        ])
        return response.gameId
    }

    func submitTruthOrDareChoice(gameId: String, participantId: String, choice: String) async throws {
        try await client.postVoid("/api/truth-or-dare/submit-choice", body: [
            "gameId": gameId,
            "participantId": participantId,
            "choice": choice,
        ])
    }

    func submitTruthOrDareResponse(gameId: String, participantId: String, responseText: String?, responseMediaUrl: String?) async throws {
        var body: [String: Any] = [
            "gameId": gameId,
            "participantId": participantId,
        ]
        if let responseText { body["responseText"] = responseText }
        if let responseMediaUrl { body["responseMediaUrl"] = responseMediaUrl }
        try await client.postVoid("/api/truth-or-dare/submit-response", body: body, timeout: ConvexHTTPClient.longTimeout)
    }

    func advanceTruthOrDareTurn(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/truth-or-dare/advance-turn", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func skipTruthOrDareTurn(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/truth-or-dare/skip-turn", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func hostSkipTruthOrDareTurn(gameId: String, participantId: String, turnId: String) async throws {
        try await client.postVoid("/api/truth-or-dare/host-skip-turn", body: [
            "gameId": gameId,
            "participantId": participantId,
            "turnId": turnId,
        ])
    }

    func acknowledgeTruthOrDareRoundBreak(gameId: String, participantId: String, completedTurns: Int) async throws {
        try await client.postVoid("/api/truth-or-dare/ack-round-break", body: [
            "gameId": gameId,
            "participantId": participantId,
            "completedTurns": completedTurns,
        ] as [String : Any])
    }

    func endTruthOrDare(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/truth-or-dare/end", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func submitTruthOrDareTranslation(turnId: String, translatedText: String) async throws {
        try await client.postVoid("/api/truth-or-dare/submit-translation", body: [
            "turnId": turnId,
            "translatedText": translatedText,
        ])
    }

    func submitTruthOrDareRating(turnId: String, participantId: String, score: Double) async throws {
        try await client.postVoid("/api/truth-or-dare/submit-rating", body: [
            "turnId": turnId,
            "participantId": participantId,
            "score": score,
        ] as [String : Any])
    }

    func getActiveTruthOrDare(roomId: String) async throws -> TruthOrDareGame? {
        do {
            let game: TruthOrDareGame = try await client.post("/api/truth-or-dare/active", body: [
                "roomId": roomId,
            ])
            return game
        } catch is DecodingError {
            return nil
        }
    }

    // MARK: - Emoji Bingo

    func createEmojiBingoLobby(roomId: String, hostParticipantId: String) async throws -> String {
        struct Response: Decodable { let gameId: String }
        let response: Response = try await client.post("/api/emoji-bingo/create-lobby", body: [
            "roomId": roomId,
            "hostParticipantId": hostParticipantId,
        ])
        return response.gameId
    }

    func startEmojiBingo(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/emoji-bingo/start", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func rollEmojiBingo(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/emoji-bingo/roll", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func markEmojiBingoCell(gameId: String, participantId: String, cellIndex: Int) async throws {
        try await client.postVoid("/api/emoji-bingo/mark-cell", body: [
            "gameId": gameId,
            "participantId": participantId,
            "cellIndex": cellIndex,
        ] as [String: Any])
    }

    func claimEmojiBingo(gameId: String, participantId: String) async throws {
        // Response varies ({valid, placement} or {valid, reason}) — just fire-and-forget, polling picks up state
        try await client.postVoid("/api/emoji-bingo/claim-bingo", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func cancelEmojiBingo(gameId: String, participantId: String) async throws {
        try await client.postVoid("/api/emoji-bingo/cancel", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
    }

    func playAgainEmojiBingo(gameId: String, participantId: String) async throws -> String {
        struct Response: Decodable { let gameId: String }
        let response: Response = try await client.post("/api/emoji-bingo/play-again", body: [
            "gameId": gameId,
            "participantId": participantId,
        ])
        return response.gameId
    }

    func getActiveEmojiBingo(roomId: String) async throws -> EmojiBingoGame? {
        do {
            let game: EmojiBingoGame = try await client.post("/api/emoji-bingo/active", body: [
                "roomId": roomId,
            ])
            return game
        } catch is DecodingError {
            return nil
        }
    }

}
