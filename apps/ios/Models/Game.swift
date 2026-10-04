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
    /// A team game's two teams, each in the order its members take the drawing; a team is known by its place
    /// here, 0 or 1. nil in an individual game, and from a server that knows nothing of teams
    var teams: [[String]]?
    let createdAt: Date
    var completedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, gameType, status, createdByParticipantId, playerIds, chainCount, level, timerEnabled, cancelled, teams
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
        // Never throws: a session that does not decode is taken for "no game" (RealEnchattoAPI.getActiveGameSession)
        teams = LITTeams.pair(try? container.decodeIfPresent([[String]].self, forKey: .teams))
        let ts = try container.decode(Double.self, forKey: .createdAt)
        createdAt = Date(timeIntervalSince1970: ts / 1000)
        if let completedTs = try container.decodeIfPresent(Double.self, forKey: .completedAt) {
            completedAt = Date(timeIntervalSince1970: completedTs / 1000)
        } else {
            completedAt = nil
        }
    }

    init(id: String, roomId: String, gameType: String, status: GameSessionStatus, createdByParticipantId: String, playerIds: [String], chainCount: Int, level: Int? = nil, timerEnabled: Int? = nil, cancelled: Bool? = nil, teams: [[String]]? = nil, createdAt: Date, completedAt: Date? = nil) {
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
        self.teams = teams
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

// MARK: - Guess answer

/// What the reply to a guess says about it. An open step may not say which option is right; the reply does,
/// once the server has taken the guess
struct GameGuessAnswer: Equatable {
    /// Whether the pick the server holds for the step is right
    let correct: Bool
    /// The right option, worded as this player's options are
    let correctOption: String
    /// The pick the server holds for the step. Not always the one just sent: an earlier send can have landed
    /// although its reply was lost
    let selectedOption: String?
}

// MARK: - Game Replay

struct GameReplay: Codable {
    let session: GameSession
    let chains: [GameChainReplay]
    let participants: [String: GameParticipantInfo]
    var scores: [String: ScoreInfo]?
    var promptTranslations: [String: String]?
    /// A team game's teams with their final points. Read it through `teamScores`
    var teams: Lenient<[GameTeamScore]>?

    /// The two teams and their points; nil for an individual game
    var teamScores: [GameTeamScore]? { LITTeams.pair(teams?.value) }
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
    /// What this round gave each team, in the order of the replay's `teams`. Read it through `roundPoints`
    var teamPoints: Lenient<[Int]>?

    /// The two teams' points for this round. nil in an individual game, and for a round that gave neither
    /// team points: one with nobody to count on a team, with no drawing, or cut short
    var roundPoints: [Int]? { LITTeams.pair(teamPoints?.value) }

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case chainIndex, originalPrompt, options, drawerParticipantId, status, steps, teamPoints
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
    /// A team game's teams with their points so far: finished rounds only, so they do not move while a
    /// round is open. Read it through `teamScores`
    var teams: Lenient<[GameTeamScore]>?
    /// Which of `teams` has the drawing this round. Read it through `drawingTeamIndex`
    var drawingTeam: Lenient<Int>?

    /// The two teams and their points; nil for an individual game
    var teamScores: [GameTeamScore]? { LITTeams.pair(teams?.value) }

    /// 0 or 1 in a team game whose round has a drawer, else nil
    var drawingTeamIndex: Int? {
        guard teamScores != nil, let index = drawingTeam?.value, index == 0 || index == 1 else { return nil }
        return index
    }
}

struct GameStatusScore: Codable {
    let correct: Int
    let total: Int
    let nickname: String
    let avatar: AvatarConfig
}

// MARK: - Teams

/// One team of a team game: who is on it, in the order they take the drawing, and its points. The server
/// counts the points: a round gives a team the share of its counted guessers who were right, out of 60, and
/// a team's points are the sum over its rounds. Nothing is added up here
struct GameTeamScore: Codable, Equatable {
    let memberIds: [String]
    let points: Int
}

/// A field newer than the first builds that decode its parent. A value of another shape reads as nil
/// instead of failing the parent: a session, status or replay that does not decode is taken for "no game"
struct Lenient<Value: Codable>: Codable {
    let value: Value?

    init(_ value: Value?) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        value = try? Value(from: decoder)
    }

    func encode(to encoder: Encoder) throws {
        try value.encode(to: encoder)
    }
}

/// The server's deal for the game picker (/api/games/deal-teams): who a game started now would deal in,
/// and their two teams
struct GameTeamDeal: Decodable, Equatable {
    let playerIds: [String]
    /// Each team in the order its members take the drawing. nil with fewer than four players dealt in:
    /// such a game is individual
    let teams: [[String]]?

    enum CodingKeys: String, CodingKey {
        case playerIds, teams
    }

    init(playerIds: [String], teams: [[String]]?) {
        self.playerIds = playerIds
        self.teams = teams
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        playerIds = try container.decode([String].self, forKey: .playerIds)
        teams = try container.decodeIfPresent([[String]].self, forKey: .teams)
        // Anything but two teams is no deal. It throws, and the picker leaves the deal to Start
        if let teams, teams.count != 2 {
            throw DecodingError.dataCorruptedError(forKey: .teams, in: container, debugDescription: "Expected two teams, got \(teams.count)")
        }
    }
}

/// What Start asks for when the game is to be played in teams
enum GameTeamsRequest: Equatable {
    /// The server deals the teams as it starts the game
    case auto
    /// The split the picker showed. The server keeps it where it still fits who it deals in
    case split([[String]])
}

/// Lost in Translation team play: from four players a room can play as two teams
enum LITTeams {
    /// A room with fewer players plays individually
    static let minPlayers = 4

    /// `teams` when it is exactly two teams, else nil. Every screen shows individual play on nil
    static func pair<Team>(_ teams: [Team]?) -> [Team]? {
        guard let teams, teams.count == 2 else { return nil }
        return teams
    }

    /// Which team (0 or 1) a player is on
    static func index(of playerId: String, in teams: [[String]]?) -> Int? {
        pair(teams)?.firstIndex { $0.contains(playerId) }
    }

    /// Whether the level after a game is played by that game's `teams`: it was a team game, and `playersHere`
    /// are enough for one. The server plays fewer than four individually whatever split it is sent
    static func keptForNextLevel(_ teams: [[String]]?, playersHere: Int) -> Bool {
        pair(teams) != nil && playersHere >= minPlayers
    }

    /// The teams of a game_summary message: {"teams":[{"memberIds":[…],"points":180},{…}]}. nil for a
    /// summary without them or with anything else there, which is shown as an individual game
    static func summaryTeams(_ summary: [String: Any]) -> [GameTeamScore]? {
        guard let entries = pair(summary["teams"] as? [[String: Any]]) else { return nil }
        let teams = entries.compactMap { entry -> GameTeamScore? in
            guard let memberIds = entry["memberIds"] as? [String], let points = entry["points"] as? Int else { return nil }
            return GameTeamScore(memberIds: memberIds, points: points)
        }
        return pair(teams)
    }

    /// What each round of a game_summary message gave the two teams: {"rounds":[{"round":1,"teamPoints":[60,30]},…]}.
    /// A round that gave neither team points carries none and is left out
    static func summaryRounds(_ summary: [String: Any]) -> [(round: Int, points: [Int])] {
        let rounds = summary["rounds"] as? [[String: Any]] ?? []
        return rounds.compactMap { entry in
            guard let round = entry["round"] as? Int, let points = pair(entry["teamPoints"] as? [Int]) else { return nil }
            return (round: round, points: points)
        }
    }
}
