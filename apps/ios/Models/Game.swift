import Foundation

// MARK: - Game Session

struct GameSession: Identifiable, Codable, Equatable {
    let id: String
    let roomId: String
    let gameType: String
    var status: GameSessionStatus
    let createdByParticipantId: String
    let playerIds: [String]
    let chainCount: Int
    var level: Int?
    var timerEnabled: Int?
    var cancelled: Bool?
    let createdAt: Date
    var completedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, gameType, status, createdByParticipantId, playerIds, chainCount, level, timerEnabled, cancelled
        case createdAt = "_creationTime"
        case completedAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        roomId = try container.decode(String.self, forKey: .roomId)
        gameType = try container.decode(String.self, forKey: .gameType)
        status = try container.decode(GameSessionStatus.self, forKey: .status)
        createdByParticipantId = try container.decode(String.self, forKey: .createdByParticipantId)
        playerIds = try container.decode([String].self, forKey: .playerIds)
        chainCount = try container.decode(Int.self, forKey: .chainCount)
        level = try container.decodeIfPresent(Int.self, forKey: .level)
        if let seconds = try? container.decodeIfPresent(Int.self, forKey: .timerEnabled) {
            timerEnabled = seconds
        } else if let enabled = try? container.decodeIfPresent(Bool.self, forKey: .timerEnabled) {
            timerEnabled = enabled ? 20 : 0
        } else {
            timerEnabled = nil
        }
        cancelled = try container.decodeIfPresent(Bool.self, forKey: .cancelled)
        let ts = try container.decode(Double.self, forKey: .createdAt)
        createdAt = Date(timeIntervalSince1970: ts / 1000)
        if let completedTs = try container.decodeIfPresent(Double.self, forKey: .completedAt) {
            completedAt = Date(timeIntervalSince1970: completedTs / 1000)
        } else {
            completedAt = nil
        }
    }

    init(id: String, roomId: String, gameType: String, status: GameSessionStatus, createdByParticipantId: String, playerIds: [String], chainCount: Int, level: Int? = nil, timerEnabled: Int? = nil, cancelled: Bool? = nil, createdAt: Date, completedAt: Date? = nil) {
        self.id = id
        self.roomId = roomId
        self.gameType = gameType
        self.status = status
        self.createdByParticipantId = createdByParticipantId
        self.playerIds = playerIds
        self.chainCount = chainCount
        self.level = level
        self.timerEnabled = timerEnabled
        self.cancelled = cancelled
        self.createdAt = createdAt
        self.completedAt = completedAt
    }
}

enum GameSessionStatus: String, Codable {
    case active
    case complete
}

// MARK: - Game Step

struct GameStep: Identifiable, Codable {
    let id: String
    let gameSessionId: String
    let chainId: String
    let stepIndex: Int
    let stepType: GameStepType
    let assignedParticipantId: String
    var inputText: String?
    var hintText: String?
    var inputDrawingUrl: String?
    var outputText: String?
    var outputDrawingUrl: String?
    var selectedOption: String?
    var correct: Bool?
    var status: GameStepStatus
    let createdAt: Date
    var submittedAt: Date?
    var chainMaxSteps: Int?
    var level: Int?
    var round: Int?
    var totalRounds: Int?
    var options: [String]?
    var correctOption: String?
    var timerEnabled: Int?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case gameSessionId, chainId, stepIndex, stepType, assignedParticipantId
        case inputText, hintText, inputDrawingUrl, outputText, outputDrawingUrl
        case selectedOption, correct, status
        case createdAt = "_creationTime"
        case submittedAt, chainMaxSteps, level, round, totalRounds, options, correctOption, timerEnabled
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        gameSessionId = try container.decode(String.self, forKey: .gameSessionId)
        chainId = try container.decode(String.self, forKey: .chainId)
        stepIndex = try container.decode(Int.self, forKey: .stepIndex)
        stepType = try container.decode(GameStepType.self, forKey: .stepType)
        assignedParticipantId = try container.decode(String.self, forKey: .assignedParticipantId)
        inputText = try container.decodeIfPresent(String.self, forKey: .inputText)
        hintText = try container.decodeIfPresent(String.self, forKey: .hintText)
        inputDrawingUrl = try container.decodeIfPresent(String.self, forKey: .inputDrawingUrl)
        outputText = try container.decodeIfPresent(String.self, forKey: .outputText)
        outputDrawingUrl = try container.decodeIfPresent(String.self, forKey: .outputDrawingUrl)
        selectedOption = try container.decodeIfPresent(String.self, forKey: .selectedOption)
        correct = try container.decodeIfPresent(Bool.self, forKey: .correct)
        status = try container.decode(GameStepStatus.self, forKey: .status)
        let ts = try container.decode(Double.self, forKey: .createdAt)
        createdAt = Date(timeIntervalSince1970: ts / 1000)
        if let submittedTs = try container.decodeIfPresent(Double.self, forKey: .submittedAt) {
            submittedAt = Date(timeIntervalSince1970: submittedTs / 1000)
        } else {
            submittedAt = nil
        }
        chainMaxSteps = try container.decodeIfPresent(Int.self, forKey: .chainMaxSteps)
        level = try container.decodeIfPresent(Int.self, forKey: .level)
        round = try container.decodeIfPresent(Int.self, forKey: .round)
        totalRounds = try container.decodeIfPresent(Int.self, forKey: .totalRounds)
        options = try container.decodeIfPresent([String].self, forKey: .options)
        correctOption = try container.decodeIfPresent(String.self, forKey: .correctOption)
        if let seconds = try? container.decodeIfPresent(Int.self, forKey: .timerEnabled) {
            timerEnabled = seconds
        } else if let enabled = try? container.decodeIfPresent(Bool.self, forKey: .timerEnabled) {
            timerEnabled = enabled ? 20 : 0
        } else {
            timerEnabled = nil
        }
    }

    init(id: String, gameSessionId: String, chainId: String, stepIndex: Int, stepType: GameStepType, assignedParticipantId: String, inputText: String? = nil, hintText: String? = nil, inputDrawingUrl: String? = nil, outputText: String? = nil, outputDrawingUrl: String? = nil, selectedOption: String? = nil, correct: Bool? = nil, status: GameStepStatus, createdAt: Date, submittedAt: Date? = nil, chainMaxSteps: Int? = nil, level: Int? = nil, round: Int? = nil, totalRounds: Int? = nil, options: [String]? = nil, correctOption: String? = nil, timerEnabled: Int? = nil) {
        self.id = id
        self.gameSessionId = gameSessionId
        self.chainId = chainId
        self.stepIndex = stepIndex
        self.stepType = stepType
        self.assignedParticipantId = assignedParticipantId
        self.inputText = inputText
        self.hintText = hintText
        self.inputDrawingUrl = inputDrawingUrl
        self.outputText = outputText
        self.outputDrawingUrl = outputDrawingUrl
        self.selectedOption = selectedOption
        self.correct = correct
        self.status = status
        self.createdAt = createdAt
        self.submittedAt = submittedAt
        self.chainMaxSteps = chainMaxSteps
        self.level = level
        self.round = round
        self.totalRounds = totalRounds
        self.options = options
        self.correctOption = correctOption
        self.timerEnabled = timerEnabled
    }
}

enum GameStepType: String, Codable {
    case draw
    case guess
}

enum GameStepStatus: String, Codable {
    case waiting
    case active
    case submitted
}

// MARK: - Game Replay

struct GameReplay: Codable {
    let session: GameSession
    let chains: [GameChainReplay]
    let participants: [String: GameParticipantInfo]
    var scores: [String: ScoreInfo]?
    var promptTranslations: [String: String]?
}

struct ScoreInfo: Codable {
    let correct: Int
    let total: Int
}

struct GameChainReplay: Identifiable, Codable {
    let id: String
    let chainIndex: Int
    let originalPrompt: String
    var options: [String]?
    var drawerParticipantId: String?
    let status: String
    let steps: [GameStep]

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case chainIndex, originalPrompt, options, drawerParticipantId, status, steps
    }
}

struct GameParticipantInfo: Codable {
    let nickname: String
    let avatar: AvatarConfig
}

// MARK: - Game Status (live status bar data)

struct GameStatus: Codable {
    let gameType: String
    let level: Int
    let currentRound: Int
    let totalRounds: Int
    let phase: String // "drawing", "guessing", "waiting"
    let drawerName: String?
    let drawerAvatar: AvatarConfig?
    let guessesSubmitted: Int
    let guessesTotal: Int
    let scores: [String: GameStatusScore]
    let timerSeconds: Int?
    let drawStartedAt: Double? // ms timestamp
}

struct GameStatusScore: Codable {
    let correct: Int
    let total: Int
    let nickname: String
    let avatar: AvatarConfig
}

// MARK: - Emojifyr

struct EmojifyrRound: Codable, Identifiable {
    let id: String  // _id from Convex
    let gameSessionId: String
    let roundIndex: Int
    let writerParticipantId: String
    var originalSentence: String?
    var emojiClue: String?
    var status: EmojifyrRoundStatus
    let maxCharacters: Int
    let startedAt: Double
    var revealedAt: Double?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case gameSessionId, roundIndex, writerParticipantId
        case originalSentence, emojiClue, status, maxCharacters
        case startedAt, revealedAt
    }
}

enum EmojifyrRoundStatus: String, Codable {
    case writing, generating, preview, guessing, reveal, complete
}

struct EmojifyrGuess: Codable, Identifiable {
    let id: String
    let roundId: String
    let participantId: String
    let guessText: String
    let createdAt: Double

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roundId, participantId, guessText, createdAt
    }
}

struct EmojifyrGameState: Codable {
    let session: GameSession?
    let currentRound: EmojifyrRound?
    let guesses: [EmojifyrGuess]?
    let participants: [Participant]?
}
