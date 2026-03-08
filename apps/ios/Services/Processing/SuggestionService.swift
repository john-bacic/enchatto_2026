import Foundation

/// Protocol for generating suggested replies
protocol SuggestionService {
    /// Generate short suggested replies based on the conversation context
    /// - Parameters:
    ///   - original: The original message text
    ///   - translated: The translated version of the message
    /// - Returns: Array of 2-4 short suggestion strings
    func generateSuggestions(original: String, translated: String) async throws -> [String]
}
