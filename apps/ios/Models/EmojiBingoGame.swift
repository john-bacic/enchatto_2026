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

/// EN/JA names for the bingo pool (apps/convex/convex/emojiBingo.ts BINGO_EMOJI_POOL), shown when a ball is called.
enum BingoEmojiNames {
    static let names: [String: (en: String, ja: String)] = [
        "☀️": ("Sun", "たいよう"), "☁️": ("Cloud", "くも"), "☂️": ("Umbrella", "かさ"),
        "⛄": ("Snowman", "ゆきだるま"), "🌙": ("Moon", "つき"), "🏠": ("House", "いえ"),
        "☕": ("Coffee", "コーヒー"), "🌷": ("Tulip", "チューリップ"), "🍒": ("Cherry", "さくらんぼ"),
        "🍞": ("Bread", "パン"), "🍰": ("Cake", "ケーキ"), "🚗": ("Car", "くるま"),
        "🍦": ("Ice cream", "アイス"), "🍉": ("Watermelon", "すいか"), "💎": ("Diamond", "ダイヤ"),
        "🦋": ("Butterfly", "ちょうちょ"), "📷": ("Camera", "カメラ"), "📺": ("TV", "テレビ"),
        "🚃": ("Train", "でんしゃ"), "🥨": ("Pretzel", "プレッツェル"), "🌠": ("Shooting star", "ながれぼし"),
        "🌸": ("Flower", "はな"), "🐈": ("Kitty", "ねこちゃん"), "🎁": ("Gift", "プレゼント"),
        "🐰": ("Bunny", "うさぎ"), "🐼": ("Panda", "パンダ"), "🐻": ("Bear", "くま"),
        "👻": ("Ghost", "おばけ"), "🐥": ("Chick", "ひよこ"), "🪼": ("Jellyfish", "くらげ"),
        "🐶": ("Dog", "いぬ"), "🐹": ("Hamster", "ハムスター"), "🐱": ("Cat", "ねこ"),
        "🐢": ("Turtle", "かめ"), "🦭": ("Seal", "アザラシ"), "🐝": ("Bee", "はち"),
        "🐑": ("Sheep", "ひつじ"), "🐷": ("Pig", "ぶた"), "🐳": ("Whale", "くじら"),
        "🐕": ("Chihuahua", "チワワ"), "💡": ("Idea", "ひらめき"), "✏️": ("Pencil", "えんぴつ"),
        "👑": ("Crown", "おうかん"), "⚡": ("Lightning", "かみなり"), "❓": ("Question", "しつもん"),
        "🍀": ("Clover", "クローバー"), "🎵": ("Music", "おんがく"), "🎀": ("Ribbon", "リボン"),
        "⭐": ("Star", "ほし"),
    ]

    static func name(for emoji: String) -> (en: String, ja: String)? {
        names[emoji] ?? names[emoji.replacingOccurrences(of: "\u{FE0F}", with: "")]
    }
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
