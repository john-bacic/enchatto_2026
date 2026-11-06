import Foundation

/// What Apple's on-device model is told when it writes replies to a chat message, and what of its answers is kept.
/// The writing is ReplyIdeaWriter's, on a phone that has the model
enum ReplyIdeas {
    /// A message of the chat as the model reads it
    struct Line: Equatable {
        let name: String
        let text: String
        /// Its translation, where it has one
        var translation: String? = nil
    }

    struct Reply: Equatable {
        let japanese: String
        let english: String
    }

    static let instructions = """
        You suggest replies in a friendly group chat where Japanese and English speakers practise each other's \
        language. A reply is what a friend would text back: a few words, warm and casual.
        Rules:
        - Each reply answers what the last message says. Mind its tense: something that already happened gets a \
        reaction to the past.
        - Anyone in the room could send any of them: prefer reactions and questions back to claims about oneself, \
        and keep an answer to a question general.
        - Japanese replies use casual speech and never use the word あなた.
        - Small talk only: nothing romantic, rude or too personal.
        - Use a person's name only as it appears in the chat.
        """

    /// The longest a message is shown to the model, in characters. It reads 4096 tokens in all, its answer included
    static let lineLimit = 200

    /// The chat, oldest first, and what is asked. The replies answer its last line
    static func prompt(_ chat: [Line]) -> String {
        let lines = chat.map { line in
            let text = oneLine(line.text, cutAt: lineLimit)
            let translation = oneLine(line.translation ?? "", cutAt: lineLimit)
            return translation.isEmpty || translation == text ? "\(line.name): \(text)" : "\(line.name): \(text) (\(translation))"
        }
        return "The chat, oldest first:\n\(lines.joined(separator: "\n"))\n\nSuggest replies to \(chat.last?.name ?? "the")'s last message."
    }

    /// The replies worth offering, three at most: a line in each language, the Japanese in Japanese and the English in
    /// English, neither said twice. The model now and then leaves a piece of its JSON in a reply, or writes あなた,
    /// which no friend would text
    static func tidy(_ replies: [Reply]) -> [Reply] {
        var kept: [Reply] = []
        var seen = Set<String>()
        for reply in replies {
            let japanese = cleaned(reply.japanese)
            let english = cleaned(reply.english)
            guard (1...40).contains(japanese.count), (1...80).contains(english.count),
                  japanese.unicodeScalars.contains(where: isJapanese), !english.unicodeScalars.contains(where: isJapanese),
                  !japanese.contains("あなた"), !(japanese + english).unicodeScalars.contains(where: leftovers.contains)
            else { continue }
            let keys = [ConversationStarters.plain(japanese), ConversationStarters.plain(english)]
            guard !keys.contains(where: { $0.isEmpty || seen.contains($0) }) else { continue }
            seen.formUnion(keys)
            kept.append(Reply(japanese: japanese, english: english))
            if kept.count == 3 { break }
        }
        return kept
    }

    /// One line, without the quotes the model sometimes puts round a reply or the full stop it ends one with: a full
    /// stop reads cold in a chat. An ellipsis stays
    static func cleaned(_ text: String) -> String {
        var line = oneLine(text, cutAt: .max)
        for (open, close) in [("\"", "\""), ("“", "”"), ("「", "」"), ("『", "』")]
        where line.count >= 2 && line.hasPrefix(open) && line.hasSuffix(close) {
            line = String(line.dropFirst().dropLast()).trimmingCharacters(in: .whitespaces)
        }
        if line.hasSuffix("。") || (line.hasSuffix(".") && !line.hasSuffix("..")) { line.removeLast() }
        return line
    }

    /// What is left of the model's JSON in a reply that went wrong: `」}, {"japanese": "`
    private static let leftovers = CharacterSet(charactersIn: "{}[]<>\"「」『』")

    private static func oneLine(_ text: String, cutAt limit: Int) -> String {
        let line = text.components(separatedBy: .newlines).joined(separator: " ").trimmingCharacters(in: .whitespaces)
        return line.count > limit ? String(line.prefix(limit)) + "…" : line
    }

    /// Hiragana, katakana or a kanji of the common block
    private static func isJapanese(_ scalar: Unicode.Scalar) -> Bool {
        (0x3040...0x309F).contains(scalar.value) || (0x30A0...0x30FF).contains(scalar.value) || (0x4E00...0x9FFF).contains(scalar.value)
    }
}
