import Foundation
import NaturalLanguage

/// Configuration for which processing steps to run
struct ProcessingConfig {
    let sourceLanguage: String
    let targetLanguage: String
    let romajiEnabled: Bool
    let suggestionsEnabled: Bool

    init(from settings: RoomSettings) {
        self.sourceLanguage = settings.sourceLanguage
        self.targetLanguage = settings.targetLanguage
        self.romajiEnabled = settings.romajiEnabled
        self.suggestionsEnabled = settings.suggestionsEnabled
    }
}

/// Composes translation, romaji, and suggestion services to process a message
class MessageProcessor {
    private let translationService: TranslationService
    private let romajiService: RomajiService
    private let suggestionService: SuggestionService

    init(
        translationService: TranslationService = MyMemoryTranslationService(),
        romajiService: RomajiService = StubRomajiService(),
        suggestionService: SuggestionService = StubSuggestionService()
    ) {
        self.translationService = translationService
        self.romajiService = romajiService
        self.suggestionService = suggestionService
    }

    /// Process a text message through all enabled services
    /// - Parameters:
    ///   - text: The original message text
    ///   - config: Processing configuration from room settings
    /// - Returns: Complete processing result
    func process(text: String, config: ProcessingConfig) async throws -> ProcessingState {
        // Detect actual language of the text
        let recognizer = NLLanguageRecognizer()
        recognizer.processString(text)
        let isJapanese = recognizer.dominantLanguage == .japanese

        // Run translation first since suggestions depend on it
        let translatedText = try await translationService.translate(
            text: text,
            source: config.sourceLanguage,
            target: config.targetLanguage
        )

        // Run romaji and suggestions concurrently
        // If Japanese text: romaji of the original
        // If English text: romaji of the Japanese translation
        let romajiSource = isJapanese ? text : translatedText
        async let romajiResult = config.romajiEnabled
            ? romajiService.transliterateJapaneseToRomaji(text: romajiSource)
            : nil

        async let suggestionsResult = suggestionsEnabled(config)
            ? suggestionService.generateSuggestions(original: text, translated: translatedText)
            : nil

        let romaji = try await romajiResult
        let suggestions = try await suggestionsResult

        return ProcessingState(
            translatedText: translatedText,
            romaji: romaji,
            suggestions: suggestions
        )
    }

    /// Check if suggestions should run
    private func suggestionsEnabled(_ config: ProcessingConfig) -> Bool {
        config.suggestionsEnabled
    }
}
