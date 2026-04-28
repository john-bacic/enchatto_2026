import Foundation

// MARK: - Emoji Match Game

struct EmojiMatchGame: Codable, Identifiable, Equatable {
    let id: String
    let roomId: String
    var status: EmojiMatchStatus
    let hostParticipantId: String
    var players: [EmojiMatchPlayer]
    var turnOrder: [String]
    var currentTurnParticipantId: String?
    var board: [EmojiMatchCard]
    var selectedCardIds: [String]
    var matchedPairCount: Int
    var totalPairs: Int
    var boardRows: Int
    var boardCols: Int
    var turnTimeoutMs: Int?
    var mismatchRevealMs: Int
    var result: EmojiMatchResult?
    let createdAt: Double
    var startedAt: Double?
    var endedAt: Double?
    var turnStartedAt: Double?
    var resolveAt: Double?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, status, hostParticipantId, players, turnOrder
        case currentTurnParticipantId, board, selectedCardIds
        case matchedPairCount, totalPairs, boardRows, boardCols
        case turnTimeoutMs, mismatchRevealMs, result
        case createdAt = "_creationTime"
        case startedAt, endedAt, turnStartedAt, resolveAt
    }
}

enum EmojiMatchStatus: String, Codable {
    case lobby, active, resolving, completed, canceled
}

struct EmojiMatchPlayer: Codable, Identifiable, Equatable {
    let participantId: String
    let nickname: String
    let avatarValue: String
    var joinedAt: Double
    var isActive: Bool
    var score: Int
    var turns: Int?

    var id: String { participantId }
}

struct EmojiMatchCard: Codable, Identifiable, Equatable {
    let cardId: String
    let pairKey: String
    let content: EmojiMatchContent
    var isMatched: Bool
    var isRevealed: Bool

    var id: String { cardId }
}

struct EmojiMatchContent: Codable, Equatable {
    let kind: String
    let value: String
    let label: String?
}

struct EmojiMatchResult: Codable, Equatable {
    let winnerParticipantIds: [String]
    let isTie: Bool
    let endReason: String
}
