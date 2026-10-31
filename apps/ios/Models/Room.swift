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
    /// The host's participant id. Changes when the host hands the room over
    var hostId: String
    let createdAt: Date
    var closedAt: Date?
    /// Index into RoomTexture.all, assigned server-side at creation (older rooms: nil → hashed from joinCode)
    var background: Int?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case joinCode, status, settings, hostId, createdAt, closedAt, background
    }
}

/// The room this device is in, kept across launches so a relaunched app can get back into it: one it created, or one
/// it joined as a guest
struct SavedRoom: Codable, Equatable {
    let roomId: String
    /// This device's participant in the room
    let participantId: String
    let joinCode: String
    /// AppConfig.convexDeploymentURL the room was made on: a Debug build's room does not exist on production
    let deployment: String
    /// What this device registered for its participant when it created or joined the room. nil for a room saved by
    /// a build that registered none. In UserDefaults with the rest of the record: it is good for this one room only,
    /// and the record is dropped when the room closes
    let token: String?
    /// Index into RoomTexture.all of the room's background, which the start screen shows for it: the one the room
    /// was created with, then whatever the room screen has drawn it on since. nil for a room saved by a build
    /// that stored none: the index is then worked out from the join code
    let background: Int?
    /// Whether this device hosts the room, as the room screen last saw: the host can hand the room over, and be
    /// handed it. nil in a record from before guests joined from the app, when every record was a host's
    let hosting: Bool?

    var isHost: Bool { hosting ?? true }

    enum CodingKeys: String, CodingKey {
        // The names a record was saved under when only a host kept one
        case participantId = "hostId"
        case token = "hostToken"
        case roomId, joinCode, deployment, background, hosting
    }

    private static let key = "enchatto_hostRoom"

    static func load() -> SavedRoom? {
        guard let data = UserDefaults.standard.data(forKey: key),
              let saved = try? JSONDecoder().decode(SavedRoom.self, from: data) else { return nil }
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

    /// Stores the background the room is drawn on now, only if the record is still about this room. The record
    /// of a room that has closed is kept up where it was set aside
    static func setBackground(_ background: Int, roomId: String) {
        let saved = load()
        guard let record = saved ?? dropped, record.roomId == roomId, record.background != background else { return }
        let drawn = SavedRoom(roomId: record.roomId, participantId: record.participantId, joinCode: record.joinCode, deployment: record.deployment, token: record.token, background: background, hosting: record.hosting)
        if saved == nil { dropped = drawn } else { drawn.save() }
    }

    /// Stores whether this device hosts the room now, only if the record is still about this room
    static func setHosting(_ hosting: Bool, roomId: String) {
        guard let record = load(), record.roomId == roomId, record.hosting != hosting else { return }
        SavedRoom(roomId: record.roomId, participantId: record.participantId, joinCode: record.joinCode, deployment: record.deployment, token: record.token, background: record.background, hosting: hosting).save()
    }

    /// The record `clear` last forgot, kept while the app runs: the start screen reads the background a room had
    /// last from it when the room closed with this device inside
    private(set) static var dropped: SavedRoom?

    /// Forgets the record only if it is still about this room
    static func clear(roomId: String) {
        guard let saved = load(), saved.roomId == roomId else { return }
        dropped = saved
        UserDefaults.standard.removeObject(forKey: key)
    }
}
