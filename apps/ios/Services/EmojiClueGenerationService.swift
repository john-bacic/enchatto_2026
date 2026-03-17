import Foundation

// MARK: - Protocol

protocol EmojiClueGenerationService {
    func generateEmojiClue(from sentence: String) async throws -> String
}

// MARK: - Errors

enum EmojiClueError: Error {
    case invalidOutput
    case generationFailed
}

// MARK: - Foundation Models (iOS 26+)

#if canImport(FoundationModels)
import FoundationModels

@available(iOS 26.0, *)
class FoundationModelsEmojiClueService: EmojiClueGenerationService {

    /// Check if the on-device model is available before attempting generation
    static var isAvailable: Bool {
        SystemLanguageModel.default.isAvailable
    }

    func generateEmojiClue(from sentence: String) async throws -> String {
        guard Self.isAvailable else {
            throw EmojiClueError.generationFailed
        }

        let session = LanguageModelSession()
        let prompt = """
        Convert this sentence into 3–6 emojis.
        Output emojis only.
        Do not output words.
        Preserve the core meaning.
        Make it fun and guessable for a group.
        Prefer common, recognizable emojis.
        Do not explain your answer.

        Sentence: \(sentence)
        """
        let response = try await session.respond(to: prompt)
        let clue = response.content.trimmingCharacters(in: .whitespacesAndNewlines)
        // Validate
        guard !clue.isEmpty, clue.unicodeScalars.contains(where: { $0.properties.isEmoji }) else {
            throw EmojiClueError.invalidOutput
        }
        return clue
    }
}
#endif

// MARK: - Heuristic Fallback

class HeuristicEmojiClueService: EmojiClueGenerationService {
    private let emojiMap: [String: String] = [
        "cat": "\u{1F431}", "dog": "\u{1F436}", "sleep": "\u{1F4A4}", "sleeping": "\u{1F4A4}",
        "sofa": "\u{1F6CB}\u{FE0F}", "couch": "\u{1F6CB}\u{FE0F}", "pizza": "\u{1F355}", "robot": "\u{1F916}",
        "dance": "\u{1F483}", "dancing": "\u{1F483}", "beach": "\u{1F3D6}\u{FE0F}", "park": "\u{1F333}",
        "shoe": "\u{1F45F}", "hungry": "\u{1F60B}", "eat": "\u{1F37D}\u{FE0F}", "love": "\u{2764}\u{FE0F}",
        "sun": "\u{2600}\u{FE0F}", "rain": "\u{1F327}\u{FE0F}", "happy": "\u{1F60A}", "sad": "\u{1F622}",
        "house": "\u{1F3E0}", "car": "\u{1F697}", "book": "\u{1F4D6}", "phone": "\u{1F4F1}",
        "music": "\u{1F3B5}", "fire": "\u{1F525}", "water": "\u{1F4A7}", "tree": "\u{1F332}",
        "flower": "\u{1F338}", "star": "\u{2B50}", "moon": "\u{1F319}", "fish": "\u{1F41F}",
        "bird": "\u{1F426}", "run": "\u{1F3C3}", "swim": "\u{1F3CA}", "cook": "\u{1F468}\u{200D}\u{1F373}",
        "kitchen": "\u{1F373}", "school": "\u{1F3EB}", "work": "\u{1F4BC}", "play": "\u{1F3AE}",
        "sushi": "\u{1F363}", "coffee": "\u{2615}", "tea": "\u{1F375}", "baby": "\u{1F476}",
        "family": "\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}", "friend": "\u{1F91D}",
        "night": "\u{1F319}", "morning": "\u{1F305}",
        "snow": "\u{2744}\u{FE0F}", "hot": "\u{1F525}", "cold": "\u{1F976}", "airplane": "\u{2708}\u{FE0F}",
        "fly": "\u{2708}\u{FE0F}", "mountain": "\u{26F0}\u{FE0F}", "ocean": "\u{1F30A}", "lost": "\u{1F630}",
        "tomorrow": "\u{1F4C5}", "today": "\u{1F4C5}", "go": "\u{1F6B6}",
    ]

    func generateEmojiClue(from sentence: String) async throws -> String {
        let words = sentence.lowercased().split(separator: " ").map(String.init)
        var emojis: [String] = []
        for word in words {
            // Strip common punctuation
            let cleaned = word.trimmingCharacters(in: .punctuationCharacters)
            if let emoji = emojiMap[cleaned] {
                emojis.append(emoji)
            }
        }
        if emojis.isEmpty {
            emojis = ["\u{2753}"]
        }
        // Limit to 6
        return Array(emojis.prefix(6)).joined()
    }
}

// MARK: - Stub (for testing)

class StubEmojiClueService: EmojiClueGenerationService {
    var stubbedResult: String = "\u{1F431}\u{1F4A4}\u{1F6CB}\u{FE0F}"

    func generateEmojiClue(from sentence: String) async throws -> String {
        return stubbedResult
    }
}
