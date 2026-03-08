import Foundation

enum RoomStatus: String, Codable {
    case waiting
    case active
    case closed
}

struct RoomSettings: Codable {
    var sourceLanguage: String
    var targetLanguage: String
    var romajiEnabled: Bool
    var suggestionsEnabled: Bool
    var maxParticipants: Int

    static let defaults = RoomSettings(
        sourceLanguage: "ja",
        targetLanguage: "en",
        romajiEnabled: true,
        suggestionsEnabled: true,
        maxParticipants: 10
    )
}

struct Room: Identifiable, Codable {
    let id: String
    let joinCode: String
    var status: RoomStatus
    var settings: RoomSettings
    let hostId: String
    let createdAt: Date
    var closedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case joinCode, status, settings, hostId, createdAt, closedAt
    }
}
