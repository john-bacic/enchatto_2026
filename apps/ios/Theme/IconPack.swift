import SwiftUI

/// Emoji → icon-pack asset. Game data stays as emoji strings; views swap in art when mapped.
/// Keep in sync with apps/web/lib/icons.ts.
enum IconPack {
    static let emojiIcons: [String: String] = [
        // objects
        "☀️": "o-sun", "🌞": "o-sun", "☁️": "o-cloud", "☂️": "o-umbrella", "⛄": "o-snowman",
        "🌙": "o-moon", "🏠": "o-house", "☕": "o-coffee", "🌷": "o-tulip", "🍒": "o-cherry",
        "🍞": "o-bread", "🍺": "o-beer", "🍰": "o-cake", "🚗": "o-car", "🐳": "o-whale",
        "🍦": "o-icecream", "🍉": "o-watermelon", "💎": "o-diamond", "🦋": "o-butterfly",
        "⛱️": "o-parasol", "📷": "o-camera", "📺": "o-tv", "🚃": "o-train", "🥨": "o-pretzel",
        "🌠": "o-shootingstar", "🌸": "o-flower", "⭐": "o-star", "🎁": "o-gift", "🎀": "o-bow",
        // animals
        "🐰": "av-bunny", "🐼": "av-panda", "🐻": "av-bear", "👻": "av-ghost", "🐥": "av-chick",
        "🪼": "av-jelly", "🐶": "av-puppy", "🐹": "av-hamster", "🐱": "av-cat", "🐈": "av-bluecat",
        "🐢": "av-turtle", "🦭": "av-seal", "🐝": "av-bee", "🐑": "av-sheep", "🐷": "av-pig",
        "🐕": "av-chihuahua",
        // symbols
        "💡": "g-bulb", "✏️": "g-pencil", "👑": "g-crown", "⚡": "g-bolt", "❓": "g-question",
        "❗": "g-bang", "🍀": "g-clover", "👂": "g-ear", "🎵": "g-music", "🎶": "g-music",
        // reactions
        "👍": "re-thumbs", "❤️": "re-heart", "😂": "re-laugh", "😮": "re-wow", "😢": "re-cry",
        "🔥": "re-star", "✌️": "re-peace", "👋": "re-wave",
    ]

    static func icon(for emoji: String) -> String? {
        emojiIcons[emoji] ?? emojiIcons[emoji.replacingOccurrences(of: "\u{FE0F}", with: "")]
    }
}

/// Icon-pack art for an emoji, falling back to the system emoji glyph.
struct EmojiArt: View {
    let emoji: String
    var size: CGFloat = 32

    var body: some View {
        if let icon = IconPack.icon(for: emoji) {
            Image(icon).resizable().interpolation(.high).scaledToFit().frame(width: size, height: size)
        } else {
            Text(emoji).font(.system(size: size * 0.82)).frame(width: size, height: size)
        }
    }
}

/// Icon asset at a fixed square size
struct PackIcon: View {
    let name: String
    var size: CGFloat = 28

    init(_ name: String, size: CGFloat = 28) {
        self.name = name
        self.size = size
    }

    var body: some View {
        Image(name).resizable().interpolation(.high).scaledToFit().frame(width: size, height: size)
    }
}

/// Coloured ink-ringed disc with the avatar's icon art
struct AvatarDisc: View {
    let avatarId: String
    var size: CGFloat = 40
    var ring: Color? = nil

    var body: some View {
        let avatar = presetAvatar(for: avatarId)
        Image(avatar.icon)
            .resizable()
            .interpolation(.high)
            .scaledToFit()
            .padding(size * 0.1)
            .frame(width: size, height: size)
            .background(Circle().fill(avatar.color))
            .overlay(Circle().strokeBorder(EC.ink, lineWidth: max(2, size * 0.065)))
            .overlay {
                if let ring {
                    Circle().strokeBorder(ring, lineWidth: 3).padding(-5)
                }
            }
    }
}

/// The Chatto speech-bubble mascot
struct ChattoView: View {
    var size: CGFloat = 96
    var bob = true

    var body: some View {
        LoopClock(active: bob) { t in
            let w = loopWave(t, period: 2.2)
            Image("chatto")
                .resizable()
                .interpolation(.high)
                .scaledToFit()
                .frame(width: size, height: size * 140 / 132)
                .offset(y: -size * 0.03 * (w + 1))
                .rotationEffect(.degrees(-3 * w))
        }
    }
}
