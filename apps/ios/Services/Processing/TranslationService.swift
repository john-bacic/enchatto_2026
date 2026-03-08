import Foundation

/// Protocol for text translation between languages
protocol TranslationService {
    /// Translate text from source language to target language
    /// - Parameters:
    ///   - text: The text to translate
    ///   - source: Source language code (e.g. "ja", "en")
    ///   - target: Target language code (e.g. "en", "ja")
    /// - Returns: The translated text
    func translate(text: String, source: String, target: String) async throws -> String
}
