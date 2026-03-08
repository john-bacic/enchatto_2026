import Foundation

enum MessageKind: String, Codable {
    case text
    case image
    case drawing
    case system
}

enum MessageStatus: String, Codable {
    case pending
    case processed
    case failed
}

struct ProcessingState: Codable {
    var translatedText: String?
    var romaji: String?
    var suggestions: [String]?
    var error: String?
}

struct Message: Identifiable, Codable {
    let id: String
    let roomId: String
    let senderId: String
    let kind: MessageKind
    var status: MessageStatus
    var text: String?
    var mediaUrl: String?
    var processing: ProcessingState?
    var replyToId: String?
    let createdAt: Date
    var processedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, senderId, kind, status, text, mediaUrl
        case processing, replyToId, createdAt, processedAt
    }
}

// MARK: - Reactions

let supportedReactions: [String] = ["👍", "❤️", "😂", "😮", "🎉", "👀"]

struct Reaction: Identifiable, Codable {
    let id: String
    let messageId: String
    let participantId: String
    let emoji: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case messageId, participantId, emoji, createdAt
    }
}
