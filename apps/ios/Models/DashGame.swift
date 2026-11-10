import Foundation

// MARK: - Chatto Dash

/// Chatto Dash as the app needs to know it: that a game is on, and who is in it. The race itself is the web's
/// (apps/web/lib/dash), shown in a web view (DashGameView), and that page reads everything else for itself.
/// Only what is declared here is compared, so a game that changes in some other way (a racer crossing the line)
/// is the same game to the room screen and publishes nothing
struct DashGame: Codable, Identifiable, Equatable {
    let id: String
    let roomId: String
    var status: DashStatus
    let hostParticipantId: String
    var players: [DashPlayer]
    var round: Int
    var endedAt: Double?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, status, hostParticipantId, players, round, endedAt
    }

    /// A finished tournament's podium is offered for this long; after that the room is just a room again
    /// (the web's lib/dash/on-screen.ts)
    static let podiumSeconds: TimeInterval = 5 * 60

    /// Under way, its lobby too
    var isOn: Bool {
        status == .lobby || status == .racing || status == .results
    }

    /// Worth showing: under way, or finished a moment ago
    func isLive(now: Date = Date()) -> Bool {
        if isOn { return true }
        guard status == .completed, let endedAt else { return false }
        return now.timeIntervalSince1970 - endedAt / 1000 < DashGame.podiumSeconds
    }
}

enum DashStatus: String, Codable {
    case lobby, racing, results, completed, canceled
}

struct DashPlayer: Codable, Equatable {
    let participantId: String
    let nickname: String
    let avatarValue: String
    var score: Int
}
