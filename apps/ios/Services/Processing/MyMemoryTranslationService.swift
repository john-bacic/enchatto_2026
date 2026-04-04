import Foundation
import NaturalLanguage

/// Real translation service using MyMemory API (free, no API key)
/// Auto-detects language and translates between English and Japanese
class MyMemoryTranslationService: TranslationService {
    private let casualizer = MeCabCasualizer()
    // Short phrases that the API struggles with — casual Japanese
    private let shortPhraseMap: [String: [String: String]] = [
        "hi":       ["ja": "やあ",         "en": "Hi"],
        "hello":    ["ja": "こんにちは",   "en": "Hello"],
        "hey":      ["ja": "ねえ",         "en": "Hey"],
        "bye":      ["ja": "じゃあね",     "en": "Bye"],
        "goodbye":  ["ja": "じゃあね",     "en": "Bye"],
        "thanks":   ["ja": "ありがとう",   "en": "Thanks"],
        "thank you":["ja": "ありがとう",   "en": "Thanks"],
        "yes":      ["ja": "うん",         "en": "Yes"],
        "yeah":     ["ja": "うん",         "en": "Yeah"],
        "no":       ["ja": "ううん",       "en": "No"],
        "nope":     ["ja": "ううん",       "en": "Nope"],
        "ok":       ["ja": "オッケー",     "en": "OK"],
        "okay":     ["ja": "オッケー",     "en": "OK"],
        "sorry":    ["ja": "ごめんね",     "en": "Sorry"],
        "really":   ["ja": "まじで",       "en": "Really"],
        "nice":     ["ja": "いいね",       "en": "Nice"],
        "cool":     ["ja": "いいね",       "en": "Cool"],
        "good morning":  ["ja": "おはよう",     "en": "Good morning"],
        "good night":    ["ja": "おやすみ",     "en": "Good night"],
        "good evening":  ["ja": "こんばんは",   "en": "Good evening"],
        "i see":    ["ja": "なるほどね",   "en": "I see"],
        "let's go": ["ja": "行こう",       "en": "Let's go"],
        "wait":     ["ja": "ちょっと待って", "en": "Wait"],
        "what":     ["ja": "なに",         "en": "What"],
        "why":      ["ja": "なんで",       "en": "Why"],
        "how":      ["ja": "どうやって",   "en": "How"],
        "i love you":   ["ja": "大好きだよ",   "en": "I love you"],
        "i like you":   ["ja": "好きだよ",     "en": "I like you"],
        "i'm sorry":    ["ja": "ごめんね",     "en": "I'm sorry"],
        "i'm fine":     ["ja": "大丈夫だよ",   "en": "I'm fine"],
        "i'm tired":    ["ja": "疲れた",       "en": "I'm tired"],
        "i'm hungry":   ["ja": "お腹すいた",   "en": "I'm hungry"],
        "i don't know": ["ja": "わかんない",   "en": "I don't know"],
        "i understand": ["ja": "わかった",     "en": "I understand"],
        "no problem":   ["ja": "大丈夫だよ",   "en": "No problem"],
        "of course":    ["ja": "もちろん",     "en": "Of course"],
        "me too":       ["ja": "私も",         "en": "Me too"],
        "same":         ["ja": "同じく",       "en": "Same"],
        "boring":       ["ja": "つまんない",   "en": "Boring"],
        "fun":          ["ja": "楽しい",       "en": "Fun"],
        "cute":         ["ja": "かわいい",     "en": "Cute"],
        "scary":        ["ja": "こわい",       "en": "Scary"],
        "tired":        ["ja": "疲れた",       "en": "Tired"],
        "hungry":       ["ja": "お腹すいた",   "en": "Hungry"],
        "happy":        ["ja": "うれしい",     "en": "Happy"],
        "sad":          ["ja": "悲しい",       "en": "Sad"],
        "angry":        ["ja": "むかつく",     "en": "Angry"],
        "funny":        ["ja": "ウケる",       "en": "Funny"],
        "amazing":      ["ja": "すごい",       "en": "Amazing"],
        "awesome":      ["ja": "すごい",       "en": "Awesome"],
        "delicious":    ["ja": "おいしい",     "en": "Delicious"],
        "yummy":        ["ja": "おいしい",     "en": "Yummy"],
        "gross":        ["ja": "きもい",       "en": "Gross"],
        "impossible":   ["ja": "ありえない",   "en": "Impossible"],
        "seriously":    ["ja": "マジで",       "en": "Seriously"],
        "whatever":     ["ja": "どうでもいい", "en": "Whatever"],
        "nevermind":    ["ja": "なんでもない", "en": "Nevermind"],
        "hurry":        ["ja": "急いで",       "en": "Hurry"],
        "help":         ["ja": "助けて",       "en": "Help"],
        "stop":         ["ja": "やめて",       "en": "Stop"],
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
            return matchEndingPunctuation(from: text, to: mapped)
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

        // Convert polite Japanese to casual using MeCab morphological analysis
        if toLang == "ja" {
            var result = casualizer.casualify(translated)
            result = matchEndingPunctuation(from: text, to: result)
            return result
        }
        return translated
    }

    /// Carry ending punctuation (! ? .) from source text to translated text
    private func matchEndingPunctuation(from source: String, to translated: String) -> String {
        guard let srcLast = source.last else { return translated }

        // Map English punctuation to Japanese full-width equivalents
        let punctMap: [Character: Character] = [
            "!": "！", "?": "？", ".": "。",
            "！": "！", "？": "？", "。": "。",
        ]
        guard let jpPunct = punctMap[srcLast] else { return translated }

        // Already ends with matching punctuation
        if let tgtLast = translated.last,
           punctMap[tgtLast] != nil {
            return translated
        }

        return translated + String(jpPunct)
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
