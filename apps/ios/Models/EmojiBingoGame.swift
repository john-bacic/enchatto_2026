import Foundation

// MARK: - Emoji Bingo Game

struct EmojiBingoGame: Codable, Identifiable, Equatable {
    let id: String
    let roomId: String
    var status: EmojiBingoStatus
    let hostParticipantId: String
    var winPattern: String
    var callIntervalMs: Int
    var turnOrder: [String]?
    var currentTurnParticipantId: String?
    var turnStartedAt: Double?
    var turnTimeoutMs: Int?
    var players: [EmojiBingoPlayer]
    var drawDeck: [String]
    var calledEmojis: [String]
    var drawIndex: Int
    let createdAt: Double
    var startedAt: Double?
    var endedAt: Double?
    var firstBingoAt: Double?
    var nextDrawScheduledAt: Double?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, status, hostParticipantId, winPattern, callIntervalMs
        case turnOrder, currentTurnParticipantId, turnStartedAt, turnTimeoutMs
        case players, drawDeck, calledEmojis, drawIndex
        case createdAt = "_creationTime"
        case startedAt, endedAt, firstBingoAt, nextDrawScheduledAt
    }
}

enum EmojiBingoStatus: String, Codable {
    case lobby, active, won, completed, canceled
}

struct EmojiBingoPlayer: Codable, Identifiable, Equatable {
    let participantId: String
    let nickname: String
    let avatarValue: String
    var joinedAt: Double
    var card: [String]
    var markedCells: [Int]
    var placement: Int

    var id: String { participantId }
}
