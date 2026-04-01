import Foundation

// MARK: - Truth or Dare Game

struct TruthOrDareGame: Codable, Identifiable, Equatable {
    let id: String
    let roomId: String
    var status: TruthOrDareStatus
    let hostParticipantId: String
    var promptMode: String?
    var playerOrder: [String]
    var currentTurnIndex: Int
    var currentTurnParticipantId: String?
    let createdAt: Double
    var completedAt: Double?

    // Joined data from query
    var currentTurn: TruthOrDareTurn?
    var completedTurns: Int?
    var completedTurnsList: [TruthOrDareCompletedTurn]?
    var totalTurns: Int?
    var playerInfo: [TruthOrDarePlayerInfo]?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, status, hostParticipantId, promptMode, playerOrder
        case currentTurnIndex, currentTurnParticipantId
        case createdAt = "_creationTime"
        case completedAt, currentTurn, completedTurns, completedTurnsList, totalTurns, playerInfo
    }
}

enum TruthOrDareStatus: String, Codable {
    case active, completed, canceled
}

struct TruthOrDareTurn: Codable, Identifiable, Equatable {
    let id: String
    let gameId: String
    var turnIndex: Int
    let participantId: String
    var choice: TruthOrDareChoice?
    var promptId: String?
    var promptText: String?
    var promptResponseType: TruthOrDareResponseType?
    var responseText: String?
    var translatedResponseText: String?
    var responseMediaUrl: String?
    var ratings: [TruthOrDareRating]?
    var status: TruthOrDareTurnStatus
    let createdAt: Double
    var completedAt: Double?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case gameId, turnIndex, participantId, choice
        case promptId, promptText, promptResponseType
        case responseText, translatedResponseText, responseMediaUrl, ratings, status
        case createdAt = "_creationTime"
        case completedAt
    }

    /// Parse the prompt text JSON to get localized text
    func localizedPrompt(lang: String) -> String {
        guard let text = promptText,
              let data = text.data(using: .utf8),
              let parsed = try? JSONSerialization.jsonObject(with: data) as? [String: String] else {
            return promptText ?? ""
        }
        return parsed[lang] ?? parsed["en"] ?? promptText ?? ""
    }
}

enum TruthOrDareChoice: String, Codable {
    case truth, dare
}

enum TruthOrDareResponseType: String, Codable {
    case text, photo, drawing
}

enum TruthOrDareTurnStatus: String, Codable {
    case waiting_for_choice
    case waiting_for_response
    case completed
    case skipped
}

struct TruthOrDareRating: Codable, Equatable {
    let participantId: String
    let score: Double
}

struct TruthOrDareCompletedTurn: Codable, Identifiable, Equatable {
    let id: String
    let participantId: String
    var choice: TruthOrDareChoice?
    var promptText: String?
    var responseText: String?
    var responseMediaUrl: String?
    var ratings: [TruthOrDareRating]

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case participantId, choice, promptText
        case responseText, responseMediaUrl, ratings
    }
}

struct TruthOrDarePlayerInfo: Codable, Identifiable, Equatable {
    let participantId: String
    let nickname: String
    let avatarValue: String
    var online: Bool

    var id: String { participantId }
}
