import Foundation

/// Stub implementation that returns a placeholder translation
class StubTranslationService: TranslationService {
    func translate(text: String, source: String, target: String) async throws -> String {
        // Simulate processing delay
        try await Task.sleep(nanoseconds: 500_000_000)

        // Return a placeholder indicating the direction
        return "[Translated \(source)→\(target)] \(text)"
    }
}
