import Foundation
import SwiftUI

enum ParticipantRole: String, Codable {
    case host
    case participant
}

enum ParticipantPlatform: String, Codable {
    case ios
    case web
}

enum AvatarType: String, Codable {
    case preset
    case custom
}

struct AvatarConfig: Codable, Equatable {
    let type: AvatarType
    let value: String
}

enum PresenceState: String, Codable {
    case online
    case away
}

struct Participant: Identifiable, Codable, Equatable {
    let id: String
    let roomId: String
    let nickname: String
    let role: ParticipantRole
    let platform: ParticipantPlatform
    let avatar: AvatarConfig
    let preferredLanguage: String
    var online: Bool
    var presence: PresenceState?
    var typingAction: String?
    var lastSeenAt: Date
    let joinedAt: Date

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, nickname, role, platform, avatar
        case preferredLanguage, online, presence, typingAction, lastSeenAt, joinedAt
    }

    var isAway: Bool {
        online && (presence ?? .online) == .away
    }
}

// MARK: - Preset avatar data

struct PresetAvatar {
    let id: String
    let emoji: String
    let color: Color
}

let presetAvatars: [PresetAvatar] = [
    PresetAvatar(id: "cat",       emoji: "🐱", color: Color(hex: "fde68a")),
    PresetAvatar(id: "dog",       emoji: "🐶", color: Color(hex: "fed7aa")),
    PresetAvatar(id: "bear",      emoji: "🐻", color: Color(hex: "d4c4a8")),
    PresetAvatar(id: "panda",     emoji: "🐼", color: Color(hex: "e5e7eb")),
    PresetAvatar(id: "fox",       emoji: "🦊", color: Color(hex: "fdba74")),
    PresetAvatar(id: "rabbit",    emoji: "🐰", color: Color(hex: "fecaca")),
    PresetAvatar(id: "koala",     emoji: "🐨", color: Color(hex: "c7d2fe")),
    PresetAvatar(id: "tiger",     emoji: "🐯", color: Color(hex: "fcd34d")),
    PresetAvatar(id: "penguin",   emoji: "🐧", color: Color(hex: "bfdbfe")),
    PresetAvatar(id: "owl",       emoji: "🦉", color: Color(hex: "d9c9a5")),
    PresetAvatar(id: "unicorn",   emoji: "🦄", color: Color(hex: "e9d5ff")),
    PresetAvatar(id: "octopus",   emoji: "🐙", color: Color(hex: "fca5a5")),
    PresetAvatar(id: "dolphin",   emoji: "🐬", color: Color(hex: "93c5fd")),
    PresetAvatar(id: "butterfly", emoji: "🦋", color: Color(hex: "a5f3fc")),
    PresetAvatar(id: "dragon",    emoji: "🐲", color: Color(hex: "86efac")),
    PresetAvatar(id: "alien",     emoji: "👽", color: Color(hex: "bbf7d0")),
]

func presetAvatar(for id: String) -> PresetAvatar {
    presetAvatars.first { $0.id == id } ?? PresetAvatar(id: "default", emoji: "👤", color: Color(.systemGray5))
}

extension Participant {
    var avatarEmoji: String {
        presetAvatar(for: avatar.value).emoji
    }

    var avatarColor: Color {
        presetAvatar(for: avatar.value).color
    }
}

// MARK: - Color hex extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: Double
        switch hex.count {
        case 6:
            r = Double((int >> 16) & 0xFF) / 255
            g = Double((int >> 8) & 0xFF) / 255
            b = Double(int & 0xFF) / 255
        default:
            r = 0; g = 0; b = 0
        }
        self.init(red: r, green: g, blue: b)
    }
}
