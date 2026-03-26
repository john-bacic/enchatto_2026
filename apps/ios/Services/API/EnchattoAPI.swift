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

    /// Generate a presigned upload URL for Convex storage
    func generateUploadUrl() async throws -> String

    /// Upload raw data to a Convex storage upload URL, returns storageId
    func uploadData(_ data: Data, to uploadUrl: String, contentType: String) async throws -> String

    /// Send an image message (requires a Convex storageId from prior upload)
    func sendImageMessage(roomId: String, senderId: String, storageId: String, replyToId: String?) async throws -> String

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
    func setTypingAction(participantId: String, action: String?, drawingStartedAt: Double?) async throws

    // MARK: - Games

    /// Cancel any active game in a room (host only)
    func cancelGame(roomId: String, participantId: String) async throws

    /// Start a game in a room (host only)
    func startGame(roomId: String, participantId: String, gameType: String, level: Int, timerSeconds: Int, customPrompts: [[String: Any]]?) async throws -> String

    /// Submit a game step result
    func submitGameStep(stepId: String, participantId: String, outputText: String?, outputDrawingUrl: String?, selectedOption: String?) async throws

    /// Get the active game session for a room
    func getActiveGameSession(roomId: String) async throws -> GameSession?

    /// Get the current active step for a participant
    func getMyActiveStep(participantId: String) async throws -> GameStep?

    /// Get the latest game session for a room
    func getLatestGameSession(roomId: String) async throws -> GameSession?

    /// Get the replay data for a completed game
    func getGameReplay(gameSessionId: String) async throws -> GameReplay?

    /// Get live game status for the status bar
    func getGameStatus(roomId: String) async throws -> GameStatus?

    // MARK: - Emojifyr

    /// Start an Emojifyr game session
    func startEmojifyr(roomId: String, participantId: String) async throws -> String?

    /// Submit the writer's sentence for an Emojifyr round
    func submitEmojifyrSentence(roundId: String, sentence: String, isInitialism: Bool) async throws

    /// Update the sentence for an Emojifyr round (during preview/generating phase)
    func updateEmojifyrSentence(roundId: String, sentence: String) async throws

    /// Submit the emoji clue for an Emojifyr round
    func submitEmojifyrEmojiClue(roundId: String, emojiClue: String) async throws

    /// Submit a guess for an Emojifyr round
    func submitEmojifyrGuess(roundId: String, participantId: String, guessText: String) async throws

    /// Reveal the answer for an Emojifyr round
    func revealEmojifyrRound(roundId: String) async throws

    /// Advance to the next Emojifyr round
    func advanceEmojifyrRound(gameSessionId: String) async throws

    /// Cancel an Emojifyr game session
    func cancelEmojifyr(gameSessionId: String) async throws

    /// Get the active Emojifyr session for a room
    func getActiveEmojifyrSession(roomId: String) async throws -> GameSession?

    /// Get the current round for an Emojifyr game session
    func getCurrentEmojifyrRound(gameSessionId: String) async throws -> EmojifyrRound?

    /// Get all guesses for an Emojifyr round
    func getEmojifyrGuesses(roundId: String) async throws -> [EmojifyrGuess]

    /// Get the full Emojifyr game state for a room
    func getEmojifyrGameState(roomId: String) async throws -> EmojifyrGameState?

    /// Generate an emoji clue from a sentence using server-side AI
    func generateEmojiClueFromAI(sentence: String) async throws -> String

    // MARK: - Emoji Match

    /// Create an Emoji Match lobby
    func createEmojiMatchLobby(roomId: String, hostParticipantId: String) async throws -> String

    /// Join an Emoji Match lobby
    func joinEmojiMatchLobby(gameId: String, participantId: String) async throws

    /// Leave an Emoji Match lobby
    func leaveEmojiMatchLobby(gameId: String, participantId: String) async throws

    /// Start an Emoji Match game
    func startEmojiMatch(gameId: String, participantId: String) async throws

    /// Flip a card in Emoji Match
    func flipEmojiMatchCard(gameId: String, participantId: String, cardId: String) async throws

    /// Cancel an Emoji Match game
    func cancelEmojiMatch(gameId: String, participantId: String) async throws

    /// Play again after an Emoji Match game
    func playAgainEmojiMatch(gameId: String, participantId: String) async throws -> String

    /// Get the active Emoji Match game for a room
    func getActiveEmojiMatch(roomId: String) async throws -> EmojiMatchGame?

    // MARK: - Truth or Dare

    /// Create a Truth or Dare game
    func createTruthOrDare(roomId: String, hostParticipantId: String) async throws -> String

    /// Submit a truth/dare choice
    func submitTruthOrDareChoice(gameId: String, participantId: String, choice: String) async throws

    /// Submit a response
    func submitTruthOrDareResponse(gameId: String, participantId: String, responseText: String?, responseMediaUrl: String?) async throws

    /// Advance to next turn
    func advanceTruthOrDareTurn(gameId: String, participantId: String) async throws

    /// Skip current turn
    func skipTruthOrDareTurn(gameId: String, participantId: String) async throws

    /// End the game
    func endTruthOrDare(gameId: String, participantId: String) async throws

    /// Submit a rating for a turn
    func submitTruthOrDareRating(turnId: String, participantId: String, score: Double) async throws

    /// Get active Truth or Dare game state
    func getActiveTruthOrDare(roomId: String) async throws -> TruthOrDareGame?
}
