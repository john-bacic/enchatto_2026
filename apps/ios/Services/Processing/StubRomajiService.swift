import Foundation

/// Stub implementation that returns a placeholder romaji transliteration
class StubRomajiService: RomajiService {
    func transliterateJapaneseToRomaji(text: String) async throws -> String {
        // Simulate processing delay
        try await Task.sleep(nanoseconds: 300_000_000)

        // Return a placeholder
        return "[Romaji] \(text)"
    }
}
