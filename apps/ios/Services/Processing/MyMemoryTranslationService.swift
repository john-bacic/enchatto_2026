import Foundation
import NaturalLanguage

/// Real translation service using MyMemory API (free, no API key)
/// Auto-detects language and translates between English and Japanese
class MyMemoryTranslationService: TranslationService {
    // Short phrases that the API struggles with
    private let shortPhraseMap: [String: [String: String]] = [
        "hi":    ["ja": "こんにちは", "en": "Hello"],
        "hello": ["ja": "こんにちは", "en": "Hello"],
        "hey":   ["ja": "やあ",       "en": "Hey"],
        "bye":   ["ja": "さようなら", "en": "Goodbye"],
        "thanks":["ja": "ありがとう", "en": "Thanks"],
        "yes":   ["ja": "はい",       "en": "Yes"],
        "no":    ["ja": "いいえ",     "en": "No"],
        "ok":    ["ja": "オーケー",   "en": "OK"],
    ]

    func translate(text: String, source: String, target: String) async throws -> String {
        // Auto-detect actual language of the text
        let detectedLang = detectLanguage(text)

        // Determine translation direction based on detected language
        let fromLang: String
        let toLang: String

        if detectedLang == "ja" {
            fromLang = "ja"
            toLang = "en"
        } else {
            fromLang = "en"
            toLang = "ja"
        }

        // Check short phrase map first
        let key = text.lowercased().trimmingCharacters(in: .punctuationCharacters)
        if let mapped = shortPhraseMap[key]?[toLang] {
            return mapped
        }

        // Build URL
        let langPair = "\(fromLang)|\(toLang)"
        var components = URLComponents(string: "https://api.mymemory.translated.net/get")!
        components.queryItems = [
            URLQueryItem(name: "q", value: text),
            URLQueryItem(name: "langpair", value: langPair),
        ]

        guard let url = components.url else {
            throw TranslationError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw TranslationError.serverError(code)
        }

        let result = try JSONDecoder().decode(MyMemoryResponse.self, from: data)

        // Check API-level errors (e.g. rate limiting, invalid language pair)
        if let status = result.responseStatus, status != 200 {
            throw TranslationError.apiError(result.responseDetails ?? "status \(status)")
        }

        guard let translated = result.responseData?.translatedText,
              !translated.isEmpty else {
            // Short/simple words may not get a translation — return original
            return text
        }

        return translated
    }

    private func detectLanguage(_ text: String) -> String {
        let recognizer = NLLanguageRecognizer()
        recognizer.processString(text)
        let lang = recognizer.dominantLanguage
        return lang == .japanese ? "ja" : "en"
    }
}

enum TranslationError: LocalizedError {
    case invalidURL
    case serverError(Int)
    case noTranslation
    case apiError(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid translation URL"
        case .serverError(let code):
            return "Translation server error (HTTP \(code))"
        case .noTranslation:
            return "No translation returned"
        case .apiError(let message):
            return "Translation API error: \(message)"
        }
    }
}

private struct MyMemoryResponse: Decodable {
    let responseData: ResponseData?
    let responseStatus: Int?
    let responseDetails: String?

    struct ResponseData: Decodable {
        let translatedText: String?
    }
}
