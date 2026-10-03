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
        sourceLanguage: "en",
        targetLanguage: "ja",
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
    /// Index into RoomTexture.all, assigned server-side at creation (older rooms: nil → hashed from joinCode)
    var background: Int?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case joinCode, status, settings, hostId, createdAt, closedAt, background
    }
}

/// The room this device is hosting, kept across launches so a relaunched app can get back into it
struct SavedHostRoom: Codable, Equatable {
    let roomId: String
    let hostId: String
    let joinCode: String
    /// AppConfig.convexDeploymentURL the room was made on: a Debug build's room does not exist on production
    let deployment: String

    private static let key = "enchatto_hostRoom"

    static func load() -> SavedHostRoom? {
        guard let data = UserDefaults.standard.data(forKey: key),
              let saved = try? JSONDecoder().decode(SavedHostRoom.self, from: data) else { return nil }
        guard saved.deployment == AppConfig.convexDeploymentURL else {
            UserDefaults.standard.removeObject(forKey: key)
            return nil
        }
        return saved
    }

    func save() {
        guard let data = try? JSONEncoder().encode(self) else { return }
        UserDefaults.standard.set(data, forKey: Self.key)
    }

    /// Forgets the record only if it is still about this room
    static func clear(roomId: String) {
        guard load()?.roomId == roomId else { return }
        UserDefaults.standard.removeObject(forKey: key)
    }
}
