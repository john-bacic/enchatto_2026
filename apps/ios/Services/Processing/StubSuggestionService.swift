import Foundation

/// Stub implementation that returns generic suggestions
class StubSuggestionService: SuggestionService {
    func generateSuggestions(original: String, translated: String) async throws -> [String] {
        return []
    }
}
