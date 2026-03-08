import Foundation

/// Converts Japanese text (hiragana/katakana/kanji) to romaji using CFStringTransform
class StubRomajiService: RomajiService {
    func transliterateJapaneseToRomaji(text: String) async throws -> String {
        let mutable = NSMutableString(string: text)
        // Convert kanji → hiragana first, then hiragana/katakana → latin
        CFStringTransform(mutable, nil, kCFStringTransformToLatin, false)
        CFStringTransform(mutable, nil, kCFStringTransformStripDiacritics, false)
        return mutable as String
    }
}
