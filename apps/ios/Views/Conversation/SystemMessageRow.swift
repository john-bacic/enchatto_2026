import SwiftUI

// MARK: - System message (join/leave divider)

struct SystemMessageRow: View {
    let text: String
    var lang: String = "en"

    private var localizedText: String {
        let parts = text.split(separator: ":", maxSplits: 1)
        guard parts.count == 2 else { return text }
        let action = String(parts[0])
        let name = String(parts[1])
        if action == "join" {
            return lang == "ja" ? "\(name)\(L.t("has joined", lang))" : "\(name) \(L.t("has joined", lang))"
        } else if action == "leave" {
            return lang == "ja" ? "\(name)\(L.t("has left", lang))" : "\(name) \(L.t("has left", lang))"
        } else if action == "game" {
            // name is like "Lost in Translation Level 2" or "Word Rush" or "Emoji Match"
            if name.hasPrefix("Emoji Bingo") {
                return "🎰 \(L.t("Game Started: Emoji Bingo", lang))"
            }
            if name.hasPrefix("Word Rush") {
                return "⚡ \(L.t("Game Started: Word Rush", lang))"
            }
            if name.hasPrefix("Emoji Match") {
                return "🃏 \(L.t("Game Started: Match Emoji", lang))"
            }
            if name.hasPrefix("Truth or Dare") {
                return "🎲 \(L.t("Game Started: Truth or Dare", lang))"
            }
            if let range = name.range(of: "Level "), let levelNum = Int(name[range.upperBound...].trimmingCharacters(in: .whitespaces)) {
                return "🎮 \(L.t("Game Started: Lost in Translation", lang)) — \(L.t("Level", lang)) \(levelNum)"
            }
            return "🎮 \(L.t("Game Started: Lost in Translation", lang))"
        } else if action == "game_cancelled" {
            return "🎮 \(L.t("Game ended", lang))"
        } else if action == "game_ended" {
            return "🎲 \(L.t("Game ended", lang))"
        } else if action == "game_correct" {
            let parts = name.split(separator: "|", maxSplits: 1)
            let guesserName = parts.count > 0 ? String(parts[0]) : "?"
            let prompt = parts.count > 1 ? String(parts[1]) : ""
            return "🎉 \(guesserName) \(L.t("guessed correctly!", lang)) (\(prompt))"
        } else if action == "game_wrong" {
            let parts = name.split(separator: "|", maxSplits: 1)
            let guesserName = parts.count > 0 ? String(parts[0]) : "?"
            let prompt = parts.count > 1 ? String(parts[1]) : ""
            return "❌ \(guesserName) \(L.t("guessed wrong", lang)) (\(prompt))"
        }
        return text
    }

    private static let iconOverrides: [String: String] = [
        "🎮": "ui-game", "❌": "g-no", "🎉": "g-ok", "🎲": "g-question", "🃏": "o-diamond", "🎰": "g-clover",
    ]

    /// Splits a leading "<emoji> " off the localized text so it can be drawn as pack art
    private var parts: (icon: String?, text: String) {
        let full = localizedText
        guard let first = full.first,
              let scalar = first.unicodeScalars.first,
              scalar.value > 0x2000, scalar.properties.isEmoji,
              full.dropFirst().first == " " else { return (nil, full) }
        return (String(first), String(full.dropFirst(2)))
    }

    private var fill: Color {
        if text.hasPrefix("game_correct:") { return EC.mintSoft }
        if text.hasPrefix("game_wrong:") { return EC.pinkSoft }
        if text.hasPrefix("game:") { return EC.yellowSoft }
        if text.hasPrefix("leave:") { return EC.paper }
        return .white
    }

    var body: some View {
        let p = parts
        HStack(spacing: 6) {
            if text.hasPrefix("join:") {
                PackIcon("re-wave", size: 18)
            } else if let icon = p.icon {
                if let asset = Self.iconOverrides[icon] {
                    PackIcon(asset, size: 18)
                } else {
                    EmojiArt(emoji: icon, size: 18)
                }
            }
            Text(p.text)
                .font(.round(12, .black))
                .foregroundStyle(text.hasPrefix("leave:") ? EC.inkSoft : EC.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 5)
        .background(Capsule().fill(fill))
        .overlay(Capsule().strokeBorder(EC.ink, lineWidth: 2.5))
        .background(Capsule().fill(EC.ink).offset(y: 3))
        .padding(.bottom, 3)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 2)
    }
}
