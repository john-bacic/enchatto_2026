import Foundation

enum MessageKind: String, Codable {
    case text
    case image
    case drawing
    case system
    case audio
    /// A kind this build doesn't know; decoding it as an error would drop the whole message list
    case unknown

    init(from decoder: Decoder) throws {
        let raw = try decoder.singleValueContainer().decode(String.self)
        self = MessageKind(rawValue: raw) ?? .unknown
    }
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
    var durationMs: Double? = nil
    /// Peak levels (0...1) across a voice message
    var waveform: [Double]? = nil

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, senderId, kind, status, text, mediaUrl
        case processing, replyToId, createdAt, processedAt
        case durationMs, waveform
    }
}

// MARK: - Queued (offline) message

struct QueuedMessage {
    let id: String
    let kind: MessageKind
    let text: String?
    let mediaUrl: String?
    let replyToId: String?
    let createdAt: Date
    var processing: ProcessingState?
    var processingAttempted: Bool = false

    init(text: String, replyToId: String? = nil) {
        self.id = "queued-\(UUID().uuidString)"
        self.kind = .text
        self.text = text
        self.mediaUrl = nil
        self.replyToId = replyToId
        self.createdAt = Date()
    }

    init(kind: MessageKind, mediaUrl: String, replyToId: String? = nil) {
        self.id = "queued-\(UUID().uuidString)"
        self.kind = kind
        self.text = nil
        self.mediaUrl = mediaUrl
        self.replyToId = replyToId
        self.createdAt = Date()
    }

    func toPlaceholderMessage(roomId: String, senderId: String) -> Message {
        Message(
            id: id,
            roomId: roomId,
            senderId: senderId,
            kind: kind,
            status: (kind == .text && processing == nil) ? .pending : .processed,
            text: text,
            mediaUrl: mediaUrl,
            processing: processing,
            replyToId: replyToId,
            createdAt: createdAt,
            processedAt: nil
        )
    }
}

// MARK: - Reactions

let supportedReactions: [String] = ["👍", "❤️", "😂", "😮", "😢", "🔥"]

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

struct ReactionSummaryEntry: Codable {
    let emoji: String
    let count: Int
    let participantIds: [String]
}

struct MessageReactionSummary: Codable {
    let messageId: String
    let reactions: [ReactionSummaryEntry]
}
