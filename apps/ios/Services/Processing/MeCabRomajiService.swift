import Foundation
import Mecab_Swift
import IPADic
import Dictionary

/// Hepburn-ish romaji from MeCab readings. CFStringTransform alone reads kanji
/// as Mandarin (今日 → "jin ri"), so kanji must be resolved to kana first.
final class MeCabRomajiService: RomajiService {
    static let shared = MeCabRomajiService()

    private let tokenizer: Tokenizer
    // MeCab taggers aren't thread-safe
    private let lock = NSLock()

    private static let particleReadings = ["は": "wa", "へ": "e", "を": "o"]
    private static let fixedPhrases = ["こんにちは": "konnichiwa", "こんばんは": "konbanwa"]
    private static let gluedParticles: Set<String> = ["て", "で", "ば", "たり", "だり"]
    private static let punctuation: [Character: String] = [
        "。": ".", "、": ",", "！": "!", "？": "?", "「": "\"", "」": "\"", "『": "\"", "』": "\"",
        "（": "(", "）": ")", "：": ":", "～": "~", "ー": "-", "　": " ",
    ]
    private static let longVowels: [Character: String] = ["ā": "aa", "ī": "ii", "ū": "uu", "ē": "ee", "ō": "oo"]

    private init() {
        self.tokenizer = try! Tokenizer(dictionary: IPADic())
    }

    func transliterateJapaneseToRomaji(text: String) async throws -> String {
        romaji(text)
    }

    func romaji(_ text: String) -> String {
        lock.lock()
        let annotations = tokenizer.tokenize(text: text, transliteration: .katakana)
        lock.unlock()
        guard !annotations.isEmpty else { return Self.latin(text) }

        var out = ""
        var cursor = text.startIndex
        var prevGluable = false

        for ann in annotations {
            let gap = ann.range.lowerBound > cursor ? String(text[cursor..<ann.range.lowerBound]) : ""
            cursor = ann.range.upperBound

            let word: String
            if let fixed = Self.fixedPhrases[ann.base] {
                word = fixed
            } else if ann.partOfSpeech == .particle, let p = Self.particleReadings[ann.base] {
                word = p
            } else if ann.partOfSpeech == .symbol || ann.reading == "*" || ann.reading.isEmpty {
                word = Self.latin(ann.base)
            } else {
                word = Self.latin(ann.reading)
            }

            let isHiragana = ann.base.unicodeScalars.allSatisfy { (0x3040...0x309F).contains($0.value) }
            let glue =
                ann.partOfSpeech == .symbol
                || (prevGluable && isHiragana
                    && (ann.partOfSpeech == .unknown
                        || (ann.partOfSpeech == .particle && Self.gluedParticles.contains(ann.base))))

            if !gap.isEmpty {
                out += Self.latin(gap)
            } else if !out.isEmpty, !glue, out.last != " " {
                out += " "
            }
            out += word
            prevGluable = ann.partOfSpeech == .verb || (glue && ann.partOfSpeech != .symbol)
        }
        if cursor < text.endIndex { out += Self.latin(String(text[cursor...])) }
        return out
    }

    private static func latin(_ s: String) -> String {
        let mutable = NSMutableString(string: s)
        CFStringTransform(mutable, nil, kCFStringTransformToLatin, false)
        let lengthened = (mutable as String).map { longVowels[$0] ?? String($0) }.joined()
        let stripped = NSMutableString(string: lengthened)
        CFStringTransform(stripped, nil, kCFStringTransformStripDiacritics, false)
        var result = ""
        for ch in stripped as String {
            result += punctuation[ch] ?? String(ch)
        }
        return result.replacingOccurrences(of: "n'(?![aeiouy])", with: "n", options: .regularExpression)
    }
}
