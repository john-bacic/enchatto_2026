import Foundation
import FoundationModels
import Translation

/// Replies to a chat message, written on this phone by Apple's on-device model (Apple Intelligence, iOS 26): nothing
/// is sent anywhere to write them and nothing is paid for them. The model writes the Japanese first, which it does
/// more reliably than the other way round. The English is Apple's translation of that Japanese where the language
/// packs are installed, which keeps the two lines saying the same thing, and the model's own otherwise
@available(iOS 26.0, *)
@MainActor
enum ReplyIdeaWriter {
    /// Apple Intelligence is on, and the model is on the phone
    static var isAvailable: Bool { SystemLanguageModel.default.isAvailable }

    /// The session the model was loaded for, kept for the first message: loading stops when its session is let go
    private static var warm: LanguageModelSession?

    /// Loads the model before the first message needs it
    static func prewarm() {
        guard warm == nil else { return }
        let session = LanguageModelSession(instructions: ReplyIdeas.instructions)
        session.prewarm()
        warm = session
    }

    /// Up to three replies to the last line of `chat`. None where the model is not there, refuses, or takes too long
    static func replies(to chat: [ReplyIdeas.Line]) async -> [StarterPhrase] {
        guard !chat.isEmpty else { return [] }
        let prompt = ReplyIdeas.prompt(chat)
        // A session of its own each time: one session's context grows with each answer, and the model reads 4096 tokens
        let session = warm ?? LanguageModelSession(instructions: ReplyIdeas.instructions)
        warm = nil
        let writing = Task {
            try await session.respond(
                to: prompt,
                generating: Written.self,
                options: GenerationOptions(temperature: 0.5, maximumResponseTokens: 220)
            ).content.replies.map { ReplyIdeas.Reply(japanese: $0.japanese, english: $0.english) }
        }
        let deadline = Task {
            try await Task.sleep(nanoseconds: 20_000_000_000)
            writing.cancel()
        }
        defer { deadline.cancel() }
        guard let written = try? await writing.value else { return [] }
        let kept = ReplyIdeas.tidy(written)
        let translations = await english(of: kept.map(\.japanese))
        // Tidied again: two of the Japanese can come back as one English
        let replies = ReplyIdeas.tidy(kept.enumerated().map { i, reply in
            ReplyIdeas.Reply(japanese: reply.japanese, english: translations.flatMap { $0[i] } ?? reply.english)
        })
        return replies.map { StarterPhrase(en: $0.english, ja: $0.japanese, romaji: MeCabRomajiService.shared.romaji($0.japanese)) }
    }

    /// Apple's English for each of `japanese`, or nil where the en↔ja packs are not installed. One that comes back
    /// empty is nil, and the model's own English stands for it
    private static func english(of japanese: [String]) async -> [String?]? {
        guard !japanese.isEmpty else { return [] }
        let session = TranslationSession(installedSource: Locale.Language(identifier: "ja"), target: Locale.Language(identifier: "en"))
        let requests = japanese.enumerated().map { TranslationSession.Request(sourceText: $1, clientIdentifier: String($0)) }
        guard let responses = try? await session.translations(from: requests) else { return nil }
        var english = [String?](repeating: nil, count: japanese.count)
        for response in responses {
            guard let i = response.clientIdentifier.flatMap(Int.init), english.indices.contains(i) else { continue }
            let text = ReplyIdeas.cleaned(response.targetText)
            english[i] = text.isEmpty ? nil : text
        }
        return english
    }
}

@available(iOS 26.0, *)
@Generable
private struct Written {
    @Guide(description: "Three different replies to the last message: a reaction, a comment, and a question back", .count(3))
    var replies: [WrittenReply]
}

@available(iOS 26.0, *)
@Generable
private struct WrittenReply {
    @Guide(description: "A casual reply in Japanese, under twenty characters")
    var japanese: String
    @Guide(description: "The same reply in casual English, under eight words")
    var english: String
}
