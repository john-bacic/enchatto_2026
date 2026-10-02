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
    var drawingStartedAt: Double?
    var lastSeenAt: Date
    let joinedAt: Date

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, nickname, role, platform, avatar
        case preferredLanguage, online, presence, typingAction, drawingStartedAt, lastSeenAt, joinedAt
    }

    var isAway: Bool {
        online && (presence ?? .online) == .away
    }
}

// MARK: - Preset avatar data

struct PresetAvatar {
    let id: String
    let label: String
    /// Asset name of the icon-pack art (Assets.xcassets/Icons/av-*)
    let icon: String
    let emoji: String
    let color: Color
}

// Ids are what's stored in Convex; art/labels mirror apps/web/lib/types.ts PRESET_AVATARS.
let presetAvatars: [PresetAvatar] = [
    PresetAvatar(id: "rabbit",    label: "Bunny",     icon: "av-bunny",     emoji: "🐰", color: Color(hex: "ffd0e4")),
    PresetAvatar(id: "panda",     label: "Panda",     icon: "av-panda",     emoji: "🐼", color: Color(hex: "e5e7eb")),
    PresetAvatar(id: "bear",      label: "Bear",      icon: "av-bear",      emoji: "🐻", color: Color(hex: "f3dcc8")),
    PresetAvatar(id: "owl",       label: "Ghost",     icon: "av-ghost",     emoji: "👻", color: Color(hex: "d9e4ff")),
    PresetAvatar(id: "penguin",   label: "Chick",     icon: "av-chick",     emoji: "🐥", color: Color(hex: "fff4c4")),
    PresetAvatar(id: "octopus",   label: "Jelly",     icon: "av-jelly",     emoji: "🪼", color: Color(hex: "dcfaef")),
    PresetAvatar(id: "dog",       label: "Puppy",     icon: "av-puppy",     emoji: "🐶", color: Color(hex: "fed7aa")),
    PresetAvatar(id: "fox",       label: "Hamster",   icon: "av-hamster",   emoji: "🐹", color: Color(hex: "fde68a")),
    PresetAvatar(id: "cat",       label: "Cat",       icon: "av-cat",       emoji: "🐱", color: Color(hex: "d9e4ff")),
    PresetAvatar(id: "tiger",     label: "Blue Cat",  icon: "av-bluecat",   emoji: "😺", color: Color(hex: "fff4c4")),
    PresetAvatar(id: "dolphin",   label: "Turtle",    icon: "av-turtle",    emoji: "🐢", color: Color(hex: "efe6ff")),
    PresetAvatar(id: "koala",     label: "Seal",      icon: "av-seal",      emoji: "🦭", color: Color(hex: "c7d2fe")),
    PresetAvatar(id: "butterfly", label: "Bee",       icon: "av-bee",       emoji: "🐝", color: Color(hex: "a5f3fc")),
    PresetAvatar(id: "unicorn",   label: "Sheep",     icon: "av-sheep",     emoji: "🐑", color: Color(hex: "e9d5ff")),
    PresetAvatar(id: "dragon",    label: "Piggy",     icon: "av-pig",       emoji: "🐷", color: Color(hex: "dcfaef")),
    PresetAvatar(id: "alien",     label: "Chihuahua", icon: "av-chihuahua", emoji: "🐕", color: Color(hex: "fecaca")),
]

func presetAvatar(for id: String) -> PresetAvatar {
    presetAvatars.first { $0.id == id } ?? presetAvatars[0]
}

extension Participant {
    var avatarEmoji: String {
        presetAvatar(for: avatar.value).emoji
    }

    var avatarColor: Color {
        presetAvatar(for: avatar.value).color
    }

    /// Very light avatar colour (60% colour, 40% white) for this guest's bubbles; web `avatarTint`
    var tint: Color {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        UIColor(avatarColor).getRed(&r, green: &g, blue: &b, alpha: &a)
        return Color(red: r * 0.6 + 0.4, green: g * 0.6 + 0.4, blue: b * 0.6 + 0.4)
    }

    var avatarIcon: String {
        presetAvatar(for: avatar.value).icon
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
