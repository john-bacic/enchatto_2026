import Foundation

/// Stub implementation that returns generic suggestions
class StubSuggestionService: SuggestionService {
    func generateSuggestions(original: String, translated: String) async throws -> [String] {
        // Simulate processing delay
        try await Task.sleep(nanoseconds: 200_000_000)

        return [
            "Thank you!",
            "I see",
            "Tell me more",
        ]
    }
}
