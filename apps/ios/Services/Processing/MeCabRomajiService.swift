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

    /// What a token adds to the output
    private enum Piece {
        /// Kana, transliterated together with the kana it is glued to
        case kana(String)
        /// A reading that is fixed, already in Latin letters
        case romaji(String)
        /// Punctuation, already in Latin letters
        case mark(String)
        /// A break between two words that is not written (the dot in ジョン・スミス)
        case wordBreak
    }

    private static let particleReadings = ["は": "wa", "へ": "e", "を": "o"]
    /// Words the dictionary has as one token and reads by their spelling (the は of では is
    /// "wa") or with a reading nobody means (笑 in a chat is not "emi", and 何分 is "how many
    /// minutes", not the adverb なにぶん)
    private static let fixedPhrases = [
        "こんにちは": "konnichiwa", "こんばんは": "konbanwa",
        "では": "dewa", "それでは": "sore dewa", "または": "mata wa", "又は": "mata wa",
        "あるいは": "aruiwa", "或いは": "aruiwa", "もしくは": "moshikuwa",
        "実は": "jitsu wa", "じつは": "jitsu wa",
        "そうですね": "sou desu ne", "何時": "nan ji", "何分": "nan pun", "笑": "wara",
    ]
    /// Everyday phrases the dictionary cuts in the wrong places (初め + まして, じゃ + あまた)
    private static let splitPhrases: [(text: String, romaji: String)] = [
        ("初めまして", "hajimemashite"), ("じゃあまた", "jaa mata"),
        ("おはよー", "ohayoo"), ("えっと", "etto"),
    ]
    private static let gluedParticles: Set<String> = ["て", "で", "ば", "たり", "だり"]
    /// The endings a verb takes, by dictionary form (ました is ます + た). MeCab has no part of
    /// speech for them that this code can see: they share "unknown" with every interjection
    /// and conjunction, and 遅れてごめん is not "okuretegomen"
    private static let gluedEndings: Set<String> = [
        "ます", "た", "だ", "たい", "ない", "ん", "ぬ", "へん", "う", "よう", "まい", "っす",
    ]
    /// Endings that MeCab reports as verbs of their own: the passive and the causative
    /// (食べ + られる, 待た + せる), and ている, でいる, てしまう, でしまう and ておく as they are
    /// said (食べ + てる, 食べ + ちゃう, 買っ + とく)
    private static let verbEndings: Set<String> = [
        "れる", "られる", "せる", "させる", "てる", "でる", "ちゃう", "じゃう", "とく", "どく",
    ]
    /// Stems that take an ending of their own without being a verb:
    /// でし + た, でしょ + う, だっ + た, だろ + う, ござい + ます
    private static let auxiliaryStems: Set<String> = ["でし", "でしょ", "だっ", "だろ", "ござい"]
    /// Suffixes that make one word with the noun before them, with the reading they have
    /// there: アメリカ人 is "amerikajin", but 三人 stays "san nin"
    private static let nounSuffixes = ["人": "ジン", "日": "ビ", "たち": "タチ", "達": "タチ"]
    /// What 何 is read なん in front of (これは何ですか, 何の本, 何でもない, 何曜日)
    private static let nanFollowers: Set<String> = [
        "です", "でし", "でしょ", "だ", "だっ", "だろ", "な", "の", "と", "という", "て", "って", "で", "でも",
        "曜日", "月",
    ]
    /// A number with its counter where the two have a reading of their own. MeCab reads the
    /// number and the counter as two unrelated words (二 + 人 = "ni nin")
    private static let counterWords = [
        "一人": "ヒトリ", "二人": "フタリ", "1人": "ヒトリ", "2人": "フタリ",
        "四時": "ヨジ", "九時": "クジ",
        "三百": "サンビャク", "六百": "ロッピャク", "八百": "ハッピャク",
        "三千": "サンゼン", "八千": "ハッセン",
        "一回": "イッカイ", "六回": "ロッカイ", "八回": "ハッカイ", "十回": "ジュッカイ",
        "一歳": "イッサイ", "八歳": "ハッサイ", "十歳": "ジュッサイ", "二十歳": "ハタチ",
    ]
    private static let numerals = Set("0123456789〇一二三四五六七八九十百千万")
    /// Marks that carry a number on to the next one (1、2人, 1.2人, 1〜2人)
    private static let numberJoiners: Set<String> = [".", ",", "-", "/", "~", "、", "・", "〜", "～", "．", "，"]
    /// Kana that only lengthen or close the syllable before them
    private static let smallKana = Set("ぁぃぅぇぉっゃゅょァィゥェォッャュョ")
    /// Katakana syllables of foreign names that CFStringTransform has no reading for
    /// (ウィリアム comes out as "u~iriamu"). They are spelled out before the transform
    private static let foreignSyllables: [(kana: String, romaji: String)] = [
        ("ウィ", "wi"), ("ウェ", "we"), ("ウォ", "wo"),
        ("ヴァ", "va"), ("ヴィ", "vi"), ("ヴェ", "ve"), ("ヴォ", "vo"), ("ヴュ", "vyu"),
        ("トゥ", "tu"), ("ドゥ", "du"), ("テュ", "tyu"), ("デュ", "dyu"), ("フュ", "fyu"),
        ("ツァ", "tsa"), ("ツィ", "tsi"), ("ツェ", "tse"), ("ツォ", "tso"),
        ("クァ", "kwa"), ("クィ", "kwi"), ("クェ", "kwe"), ("クォ", "kwo"), ("グァ", "gwa"),
        ("イェ", "ye"), ("スィ", "si"), ("ズィ", "zi"),
    ]
    /// Marks that belong to the word after them, not to the one before
    private static let openingMarks = Set("「『（【〈《［｛“‘([{")
    /// Marks after which a sentence starts again
    private static let sentenceBreaks = Set("。、！？…「『（!?,.(")
    private static let punctuation: [Character: String] = [
        "。": ".", "、": ",", "！": "!", "？": "?", "「": "\"", "」": "\"", "『": "\"", "』": "\"",
        "（": "(", "）": ")", "：": ":", "～": "~", "〜": "~", "ー": "-", "　": " ", "・": " ",
    ]
    private static let longVowels: [Character: String] = ["ā": "aa", "ī": "ii", "ū": "uu", "ē": "ee", "ō": "oo"]

    private init() {
        self.tokenizer = try! Tokenizer(dictionary: IPADic())
    }

    func transliterateJapaneseToRomaji(text: String) async throws -> String {
        romaji(text)
    }

    func romaji(_ source: String) -> String {
        // MeCab reads full-width digits one at a time (１０ is "ichi zero"); ASCII digits stay one number
        let text = Self.withASCIIDigits(source)
        // A message is one piece; see `tokenizerPieces`
        let pieces = text.tokenizerPieces
        guard pieces.count > 1 else { return romaji(piece: text) }
        var out = ""
        var afterSentence = false
        for piece in pieces {
            let part = romaji(piece: String(piece))
            // A word that follows the mark that ended a sentence starts after a space, and so
            // does the bracket or quote that opens one (not the 」 of 。」, which closes)
            if afterSentence, let first = part.first,
               first.isLetter || first.isNumber || piece.first.map(Self.openingMarks.contains) == true { out += " " }
            out += part
            afterSentence = piece.last.map { "。！？".contains($0) } ?? false
        }
        return out
    }

    private func romaji(piece text: String) -> String {
        // In the order of the text, which `tokenize` alone does not promise (see `tokensInOrder`)
        lock.lock()
        let annotations = tokenizer.tokensInOrder(of: text)
        lock.unlock()
        guard !annotations.isEmpty else { return Self.latin(text) }

        var out = ""
        // The kana of the word being written. A word is transliterated in one piece, so that a
        // small tsu at the end of one token doubles the consonant of the next (行っ + て → itte)
        var word = ""
        var cursor = text.startIndex
        var prevGluable = false
        var afterOpeningMark = false
        var straightQuoteIsOpen = false
        var index = 0

        func endWord() {
            out += Self.latin(word)
            word = ""
        }

        /// The token before (`step` -1) or after (+1) the one at `index`, unless there is none or
        /// something that is no token stands between the two (a space, a line break).
        func neighbour(of index: Int, step: Int) -> TextToken? {
            let other = index + step
            guard annotations.indices.contains(index), annotations.indices.contains(other) else { return nil }
            let (first, second) = step < 0 ? (other, index) : (index, other)
            return annotations[first].range.upperBound == annotations[second].range.lowerBound ? annotations[other] : nil
        }

        /// The tokens from `index` on spell `phrase`: the index of the token after it, or nil.
        func tokens(from index: Int, spell phrase: String) -> Int? {
            let start = annotations[index].range.lowerBound
            guard text[start...].hasPrefix(phrase),
                  let end = text.index(start, offsetBy: phrase.count, limitedBy: text.endIndex),
                  // The phrase has to end where a token ends, not inside a longer word
                  let last = annotations[index...].firstIndex(where: { $0.range.upperBound >= end }),
                  annotations[last].range.upperBound == end
            else { return nil }
            return last + 1
        }

        /// The number at `index` and its counter, when the two are read as one word.
        func counterWord(at index: Int) -> (kana: String, next: Int)? {
            // Only a number on its own: the 二人 in 十二人 is not "futari"
            guard Self.isNumber(annotations[index].base),
                  neighbour(of: index, step: -1).map({ !Self.isNumber($0.base) }) ?? true
            else { return nil }
            // The 2人 of 1、2人, 1.2人 and 1〜2人 goes on from the number before the mark and is
            // "ni nin". Only 人 changes with what stands before the number: 三、四時 is still "yoji"
            let continuesNumber = neighbour(of: index, step: -1).map({ Self.numberJoiners.contains($0.base) }) == true
                && neighbour(of: index - 1, step: -1).map({ Self.isNumber($0.base) }) == true
            var surface = annotations[index].base
            var found: (kana: String, next: Int)?
            // The counter is the next token, or the one after it (二 + 十 + 歳)
            for last in (index + 1)...(index + 2) {
                guard let part = neighbour(of: last - 1, step: 1) else { break }
                surface += part.base
                if let kana = Self.counterWords[surface], !(continuesNumber && part.base == "人") {
                    found = (kana, last + 1)
                }
            }
            return found
        }

        /// は as laughter or as "huh?", not as the topic particle: it follows no word (は？), or
        /// stands next to another は (ははは).
        func isLaughter(_ index: Int) -> Bool {
            guard annotations[index].base == "は" else { return false }
            if neighbour(of: index, step: 1)?.base == "は" || neighbour(of: index, step: -1)?.base == "は" {
                return true
            }
            // What is written in front of it, read from the text and not from the token before:
            // MeCab has no token for ❤️ or 1️⃣, and the は after one is the particle all the same.
            // It follows no word after nothing, a line break, or a mark that ends a sentence
            let head = text[..<annotations[index].range.lowerBound]
            guard let before = head.last(where: { !$0.isWhitespace || $0.isNewline }) else { return true }
            return before.isNewline || Self.sentenceBreaks.contains(before)
        }

        /// 何分 as the formal adverb なにぶん ("in any case"), which is the reading MeCab gives it:
        /// 何分よろしく, 何分、よろしく and 何分にも. Anywhere else it is "how many minutes".
        func isNanibun(_ index: Int) -> Bool {
            guard let next = neighbour(of: index, step: 1) else { return false }
            let second = neighbour(of: index + 1, step: 1)?.base
            return next.base == "よろしく" || (next.base == "、" && second == "よろしく") || (next.base == "に" && second == "も")
        }

        /// The kana of the token at `index`, with the readings MeCab gets wrong for a word that
        /// changes with its neighbour.
        func reading(at index: Int) -> String {
            let ann = annotations[index]
            let before = neighbour(of: index, step: -1)?.base
            let after = neighbour(of: index, step: 1)?.base
            let afterDigits = before.map { $0.allSatisfy(\.isNumber) && $0.allSatisfy(\.isASCII) } ?? false
            switch (ann.base, ann.reading) {
            case ("何", "ナニ") where after.map(Self.nanFollowers.contains) ?? false:
                return "ナン"
            // 10月 is the month (gatsu), not a moon; 何月 too
            case ("月", "ツキ") where afterDigits || before == "何":
                return "ガツ"
            // 1, 3, 4, 6, 8 and 10 minutes are "pun" (juppun), the others "fun"; 何分 is "nan pun"
            case ("分", "フン") where (afterDigits && "134680".contains(before?.last ?? " ")) || before == "何":
                return "プン"
            default:
                return ann.reading == "*" || ann.reading.isEmpty ? ann.base : ann.reading
            }
        }

        while index < annotations.count {
            let ann = annotations[index]
            let previous = neighbour(of: index, step: -1)
            let gap = ann.range.lowerBound > cursor ? String(text[cursor..<ann.range.lowerBound]) : ""
            if !gap.isEmpty {
                endWord()
                out += Self.latin(gap)
            }

            let isHiragana = ann.base.unicodeScalars.allSatisfy { (0x3040...0x309F).contains($0.value) }
            let isLongMark = ann.base.allSatisfy { $0 == "ー" }
            let laughter = ann.partOfSpeech == .particle && isLaughter(index)

            // What the token is written as
            let piece: Piece
            var next = index + 1
            if let phrase = Self.splitPhrases.lazy
                .compactMap({ phrase in tokens(from: index, spell: phrase.text).map { (phrase.romaji, $0) } }).first {
                (piece, next) = (.romaji(phrase.0), phrase.1)
            } else if let counter = counterWord(at: index) {
                (piece, next) = (.kana(counter.kana), counter.next)
            } else if let fixed = Self.fixedPhrases[ann.base], !(ann.base == "何分" && isNanibun(index)) {
                piece = .romaji(fixed)
            } else if ann.partOfSpeech == .particle, let particle = Self.particleReadings[ann.base], !laughter {
                piece = .romaji(particle)
            } else if ann.base == "・" {
                // Between the words of a name (ジョン・スミス) it is a space; a row of them is an ellipsis
                let inRow = previous?.base == "・" || neighbour(of: index, step: 1)?.base == "・"
                piece = inRow ? .mark(".") : .wordBreak
            } else if isLongMark, previous != nil, word.isEmpty, let vowel = out.last, "aeiou".contains(vowel) {
                // こんにちはー: the mark stretches a word that is already in Latin letters
                piece = .mark(String(repeating: vowel, count: ann.base.count))
            } else if ann.partOfSpeech == .symbol || Self.isASCIIPunctuation(ann.base)
                        || ann.base.allSatisfy({ $0 == "～" || $0 == "〜" }) {
                piece = .mark(Self.latin(ann.base))
            } else {
                piece = .kana(reading(at: index))
            }

            // Text that is not Japanese keeps its own spacing: 1,000 / 10:30 / http://example.com
            let insideASCII = previous?.base.last?.isASCII == true && ann.base.first?.isASCII == true
            let attached = insideASCII || (afterOpeningMark && previous != nil)
            afterOpeningMark = false
            var chained = false

            switch piece {
            case .wordBreak:
                // The word after it puts the space in: none is left at the end of the text or of
                // a line (はい・), or in front of a line that starts with a bullet (・りんご)
                endWord()

            case .mark(let mark):
                endWord()
                let opens: Bool
                switch ann.base {
                case "\"":
                    // A straight quote opens every other time
                    straightQuoteIsOpen.toggle()
                    opens = straightQuoteIsOpen
                case "#", "@":
                    // #nihongo and @john, but not inside Latin text (C#, john@example.com)
                    opens = !insideASCII
                default:
                    opens = ann.base.last.map(Self.openingMarks.contains) == true
                }
                if opens {
                    // An opening bracket or quote starts a word and hugs what follows: (hai), not ( hai)
                    if !attached, let last = out.last, !last.isWhitespace { out += " " }
                    out += mark
                    afterOpeningMark = true
                } else {
                    out += mark
                }

            case .romaji(let romaji):
                endWord()
                if !attached, gap.isEmpty, let last = out.last, !last.isWhitespace { out += " " }
                out += romaji

            case .kana(let kana):
                // Does it belong to the word before it?
                var join = false
                if let previous = previous, !word.isEmpty {
                    let afterSmallTsu = previous.reading.hasSuffix("ッ")
                        && (previous.partOfSpeech == .verb || previous.partOfSpeech == .noun)
                    // A copula starts a word of its own (食べたい desu, 行く darou). The だ after
                    // 飲ん or 泳い is not one: it is the past tense (飲んだ)
                    let pastDa = previous.partOfSpeech == .verb && (previous.base.hasSuffix("ん") || previous.base.hasSuffix("い"))
                    let startsWord = ann.dictionaryForm == "です" || ann.dictionaryForm == "ござる"
                        || (ann.dictionaryForm == "だ" && !pastDa)

                    if isHiragana, prevGluable || afterSmallTsu, !startsWord {
                        chained = afterSmallTsu
                            // A single kana is no word of its own (the え and お of あいうえお)
                            || (ann.partOfSpeech == .unknown
                                && (Self.gluedEndings.contains(ann.dictionaryForm) || ann.base.count == 1))
                            || (ann.partOfSpeech == .particle && Self.gluedParticles.contains(ann.base))
                            || (ann.partOfSpeech == .verb && Self.verbEndings.contains(ann.dictionaryForm)
                                && !(previous.partOfSpeech == .verb && previous.base == previous.dictionaryForm))
                    }
                    join = chained
                        // すごーい, すげぇ: the mark and the small kana stretch the word before them
                        || isLongMark || ann.base.allSatisfy(Self.smallKana.contains)
                        || (ann.base == "い" && previous.base.last == "ー")
                        // ははは, あはは
                        || (laughter && (previous.base == "は" || (previous.partOfSpeech == .unknown && previous.base.count == 1)))
                        // アメリカ人, 誕生日, 私たち. Not the verb in 3年たちました (経つ)
                        || (previous.partOfSpeech == .noun && previous.dictionaryForm != "*"
                            && Self.nounSuffixes[ann.base] == ann.reading && ann.partOfSpeech != .verb)
                }
                if join {
                    word += kana
                } else {
                    endWord()
                    if !attached, gap.isEmpty, let last = out.last, !last.isWhitespace { out += " " }
                    word = kana
                }
            }

            // What an ending can be glued to: a verb, the stem of an adjective (楽しかっ + た),
            // the stems of the copula, and an ending that was glued itself
            let adjectiveStem = (ann.partOfSpeech == .adjective || ann.partOfSpeech == .adverb)
                && ann.dictionaryForm != "*" && ann.base != ann.dictionaryForm
            prevGluable = next == index + 1 && !laughter
                && (ann.partOfSpeech == .verb || adjectiveStem || chained || Self.auxiliaryStems.contains(ann.base))

            cursor = annotations[next - 1].range.upperBound
            index = next
        }
        endWord()
        if cursor < text.endIndex { out += Self.latin(String(text[cursor...])) }
        return out
    }

    private static func isNumber(_ base: String) -> Bool {
        !base.isEmpty && base.allSatisfy(numerals.contains)
    }

    /// MeCab tags ASCII punctuation (? ! , :) as a noun, not as a symbol.
    private static func isASCIIPunctuation(_ base: String) -> Bool {
        !base.isEmpty && base.unicodeScalars.allSatisfy {
            $0.isASCII && !CharacterSet.alphanumerics.contains($0) && !CharacterSet.whitespacesAndNewlines.contains($0)
        }
    }

    private static func withASCIIDigits(_ text: String) -> String {
        var scalars = String.UnicodeScalarView()
        for scalar in text.unicodeScalars {
            // ０ … ９
            if (0xFF10...0xFF19).contains(scalar.value), let digit = Unicode.Scalar(scalar.value - 0xFF10 + 0x30) {
                scalars.append(digit)
            } else {
                scalars.append(scalar)
            }
        }
        return String(scalars)
    }

    private static func latin(_ s: String) -> String {
        var kana = s
        for syllable in foreignSyllables {
            // With its long vowel mark, which the transform only understands after kana
            kana = kana
                .replacingOccurrences(of: syllable.kana + "ー", with: syllable.romaji + syllable.romaji.suffix(1))
                .replacingOccurrences(of: syllable.kana, with: syllable.romaji)
        }
        let mutable = NSMutableString(string: kana)
        CFStringTransform(mutable, nil, kCFStringTransformToLatin, false)
        // "~" is the transform's mark for a small kana it could not attach. A small tsu with
        // nothing after it has no sound (えっ); a small vowel just lengthens (ねぇ → nee), and
        // with ー after it the transform writes it with a macron (ねぇー is "ne~ē")
        let attached = (mutable as String)
            .replacingOccurrences(of: "~tsu", with: "")
            .replacingOccurrences(of: "~(?=[a-zāīūēō])", with: "", options: .regularExpression)
        let lengthened = attached.map { character -> String in
            if let long = longVowels[character] { return long }
            // ーー: the transform writes every mark after the first as one more macron on the
            // same letter (ā + U+0304), and each of them is one more vowel. A letter with
            // anything else on it (a joiner, a skin tone) stays as it is
            let scalars = character.unicodeScalars
            guard let first = scalars.first, let long = longVowels[Character(first)],
                  scalars.dropFirst().allSatisfy({ $0.value == 0x304 }) else { return String(character) }
            return long + String(repeating: String(long.suffix(1)), count: scalars.count - 1)
        }.joined()
        let stripped = NSMutableString(string: lengthened)
        CFStringTransform(stripped, nil, kCFStringTransformStripDiacritics, false)
        var result = ""
        for ch in stripped as String {
            result += punctuation[ch] ?? String(ch)
        }
        return result.replacingOccurrences(of: "n'(?![aeiouy])", with: "n", options: .regularExpression)
    }
}
