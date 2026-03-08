import Foundation

/// Protocol for converting Japanese text to romaji
protocol RomajiService {
    /// Convert Japanese text (hiragana/katakana/kanji) to romaji
    /// - Parameter text: Japanese text to transliterate
    /// - Returns: Romaji transliteration
    func transliterateJapaneseToRomaji(text: String) async throws -> String
}
