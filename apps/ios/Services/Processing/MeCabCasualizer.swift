import Foundation
import Mecab_Swift
import IPADic
import Dictionary

/// Converts polite/formal Japanese (です/ます form) to casual speech
/// using MeCab morphological analysis for accurate verb de-conjugation.
class MeCabCasualizer {
    private let tokenizer: Tokenizer
    // MeCab taggers aren't thread-safe; messages are processed concurrently
    private let lock = NSLock()

    /// Fixed expressions and what a friend says instead. They are not conjugated like ordinary
    /// sentences: nobody says よろしくお願いする or お疲れ様だった. A longer phrase comes before
    /// the phrase it starts with.
    private static let setPhrases: [(polite: String, casual: String)] = [
        ("よろしくお願いいたします", "よろしくね"),
        ("よろしくお願い致します", "よろしくね"),
        ("よろしくお願いします", "よろしくね"),
        ("お願いいたします", "お願い"),
        ("お願い致します", "お願い"),
        ("お願いします", "お願い"),
        ("お疲れ様でした", "お疲れ様"),
        ("お疲れ様です", "お疲れ様"),
        ("お疲れさまでした", "お疲れさま"),
        ("お疲れさまです", "お疲れさま"),
        ("ごちそうさまでした", "ごちそうさま"),
        ("ご馳走様でした", "ご馳走様"),
        ("すみませんでした", "ごめんね"),
        // As it is said. After an adverb or は MeCab cuts it into すい (吸う) + ませ + ん, and the
        // verb rule made "I did not smoke" of the apology (本当にすわなかった)
        ("すいませんでした", "ごめんね"),
        ("かしこまりました", "わかった"),
    ]
    /// Particles that end a sentence with a set phrase in it (よろしくお願いしますね), and the two
    /// that quote it (お願いしますと言った). After any other particle the phrase is part of a
    /// longer clause
    private static let sentenceEndingParticles: Set<String> = ["ね", "ねえ", "ねぇ", "よ", "な", "なあ", "なぁ"]
    private static let quotingParticles: Set<String> = ["と", "って"]
    /// Words that make a sentence a question whatever its last mark is (どうでしたか。)
    private static let questionWords: [String] = [
        "どこ", "いつ", "誰", "だれ", "どう", "どういう", "どうして", "なぜ", "なんで", "どれ", "どの", "どちら", "どっち",
        "いくら", "いくつ", "どんな", "いかが", "どなた", "なに", "なん",
    ]
    /// What 吸う takes. After one of these and its particle すいませんでした is the verb written in
    /// kana ("I did not smoke"), not the apology
    private static let smokedOrBreathed: Set<String> = ["タバコ", "たばこ", "煙草", "葉巻", "息", "空気", "煙"]
    /// Said before a meal, and never said any other way. Only as a sentence of its own:
    /// in コーヒーをいただきます it is an ordinary verb
    private static let mealGreeting = "いただきます"

    /// Humble and honorific verbs whose own plain form is the speech of a period drama
    /// (ございます → ござる), with the everyday verb that is said instead
    private static let plainVerbs: [String: (dictForm: String, ichidan: Bool)] = [
        "ござる": ("ある", false),
        "おる": ("いる", true),
        "いたす": ("する", false),
        "致す": ("する", false),
    ]
    /// Humble and honorific verbs of giving and receiving after a て form, with the everyday
    /// verb: 開けていただける？ and 閉めてくださらない？ are how a refined older woman asks. Only
    /// after a て form (て, or で after a verb stem or ない): ご確認いただけますか has no て form to
    /// hang もらえる on (ご確認もらえる is not Japanese), and コーヒーをいただきます is the verb "to have"
    private static let teFormPlainVerbs: [String: (dictForm: String, ichidan: Bool)] = [
        "いただける": ("もらえる", true),
        "頂ける": ("もらえる", true),
        "いただく": ("もらう", false),
        "頂く": ("もらう", false),
        "くださる": ("くれる", true),
        "下さる": ("くれる", true),
    ]

    /// Endings that conjugate like an い-adjective (食べたい, 行かない, 学生らしい), and the past
    /// た, which only stands in front of です after one (楽しかった)
    private static let adjectiveLikeEndings: Set<String> = ["たい", "ない", "らしい", "た"]
    /// Adverbs that end in い. The tokenizer reports い-adjectives as adverbs too, so the two
    /// are told apart by name
    private static let adverbsEndingInI: Set<String> = [
        "いっぱい", "せいいっぱい", "めいっぱい", "たいてい", "あんがい", "せいぜい", "いったい", "とうてい",
    ]
    /// The kana a verb stem can end in (待ち, 休み, 任せ): the い and え rows
    private static let verbStemEndings: Set<Character> = [
        "い", "き", "ぎ", "し", "じ", "ち", "に", "び", "み", "り",
        "え", "け", "げ", "せ", "ぜ", "て", "で", "ね", "べ", "め", "れ",
    ]

    init() {
        // IPADic bundles the dictionary with the SPM package
        self.tokenizer = try! Tokenizer(dictionary: IPADic())
    }

    /// Convert polite Japanese text to casual form
    func casualify(_ text: String) -> String {
        // A message is one piece; see `tokenizerPieces`
        let pieces = text.tokenizerPieces
        guard pieces.count > 1 else { return casualify(piece: text) }
        return pieces.map { casualify(piece: String($0)) }.joined()
    }

    private func casualify(piece text: String) -> String {
        lock.lock()
        let annotations = tokenizer.tokensInOrder(of: text)
        lock.unlock()
        guard !annotations.isEmpty else { return text }

        var result = ""
        var cursor = text.startIndex
        var i = 0

        /// Go on from the token at `index`: everything before it has been dealt with.
        func advance(to index: Int) {
            cursor = annotations[index - 1].range.upperBound
            i = index
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

        /// The `count` tokens from `index` on stand in the text one after the other, with at
        /// most spaces between them. An ending is only an ending when its tokens do (行き + ます):
        /// where MeCab's token for a character could not be placed there is a hole in the list,
        /// and the tokens on its two sides are not one word, nor are those of two lines. A rule
        /// that took them for one would also drop whatever stands in the hole.
        func inARow(from index: Int, count: Int) -> Bool {
            guard index >= 0, count >= 1, index + count <= annotations.count else { return false }
            for k in (index + 1)..<(index + count) {
                let (end, start) = (annotations[k - 1].range.upperBound, annotations[k].range.lowerBound)
                // By scalar: a space with a combining mark or a skin tone on it is one Character
                // that still counts as whitespace
                guard end <= start, text[end..<start].unicodeScalars.allSatisfy({
                    $0.properties.isWhitespace && !CharacterSet.newlines.contains($0)
                }) else { return false }
            }
            return true
        }

        /// The first word of the text, or the first after a punctuation mark, a space or a line break.
        func startsSentence(_ index: Int) -> Bool {
            guard index > 0 else { return true }
            let before = annotations[index - 1]
            return before.partOfSpeech == .symbol || before.range.upperBound < annotations[index].range.lowerBound
        }

        /// A polite question ends in か. Plain form + か is not a casual question (何をするか？
        /// reads as a heading, 飲むか？ as an order), so when the か at `i` ends its sentence it is
        /// dropped and a question mark takes its place, unless one follows anyway.
        /// `afterPastCopula`: the か follows でした.
        func closeQuestion(afterPastCopula: Bool = false) {
            guard i < annotations.count, annotations[i].base == "か", inARow(from: i - 1, count: 2) else { return }
            let ka = annotations[i]
            // 行きますか…？, 食べますか！？: the question mark is already there, behind other marks
            var j = i + 1
            while j < annotations.count, annotations[j].range.lowerBound == annotations[j - 1].range.upperBound,
                  annotations[j].partOfSpeech == .symbol || Self.isASCIIPunctuation(annotations[j].base) {
                if annotations[j].base.contains("？") || annotations[j].base.contains("?") {
                    advance(to: i + 1)
                    return
                }
                j += 1
            }
            // The last word of the text or of its line
            guard i + 1 < annotations.count, annotations[i + 1].range.lowerBound == ka.range.upperBound else {
                result += "？"
                advance(to: i + 1)
                return
            }
            let after = annotations[i + 1].base
            if after.hasPrefix("？") || after.hasPrefix("?") {
                advance(to: i + 1)
            } else if after == "。" || after == "." {
                // そうでしたか。 with a full stop is "I see", not a question, and だったか。 says the
                // same. With a question word in the sentence it does ask (どうでしたか。)
                if afterPastCopula {
                    var k = i - 1
                    var asks = false
                    // Back to the start of the sentence: a mark other than a comma, or a line break
                    while k >= 0, !asks, inARow(from: k, count: 2) {
                        let word = annotations[k]
                        let isMark = word.partOfSpeech == .symbol || Self.isASCIIPunctuation(word.base)
                        if isMark, word.base != "、", word.base != "," { break }
                        // Spelled by the tokens from here on, not one token: MeCab cuts the いつ of
                        // いつでしたか into い + つ
                        asks = word.base.hasPrefix("何")
                            || Self.questionWords.contains { tokens(from: k, spell: $0) != nil }
                        k -= 1
                    }
                    // The か and the full stop are kept by the rule for everything else
                    if !asks { return }
                }
                // The question mark replaces the full stop
                result += "？"
                advance(to: i + 2)
            } else if after != "、", after != ",",
                      annotations[i + 1].partOfSpeech == .symbol || Self.isASCIIPunctuation(after) {
                result += "？"
                advance(to: i + 1)
            }
            // Otherwise the sentence goes on (行きますか、それとも…, 行きますかね) and the か stays
        }

        /// What です becomes after a noun, by what follows the token at `index` (the last token
        /// of the polite copula), and how many of the tokens after it that takes the place of.
        /// だよ ends a sentence. In front of a particle that goes on from it the copula is plain
        /// だ (学生だから, and 学生だよ for 学生ですよ), and な before ので and のに. ですが is だけど,
        /// which stands for the が as well: だが is how a man in a film speaks, and 〜んですが is
        /// the softener of every polite request (予約をしたいんですが).
        func casualCopula(endingAt index: Int) -> (form: String, particles: Int) {
            guard index + 1 < annotations.count, annotations[index + 1].partOfSpeech == .particle,
                  annotations[index + 1].range.lowerBound == annotations[index].range.upperBound
            else { return ("だよ", 0) }
            switch annotations[index + 1].base {
            case "ね": return ("だよ", 0)
            case "ので", "のに", "の": return ("な", 0)
            case "が": return ("だけど", 1)
            default: return ("だ", 0)
            }
        }

        /// お座りください, ご注意ください, お待ちください: the request in front of the ください at
        /// `index` is the honorific お / ご + verb stem or action noun, not a thing or a て form.
        func isHonorificRequest(endingAt index: Int) -> Bool {
            guard index > 0 else { return false }
            let word = annotations[index - 1]
            // An ordinary request goes through the て form (待ってください), and that て is a token
            // of its own: a bare verb stem in front of ください is the honorific one
            if word.partOfSpeech == .verb || word.base == "ご覧" { return true }
            let prefix = index > 1 && annotations[index - 2].partOfSpeech == .prefix ? annotations[index - 2].base : nil
            if let prefix = prefix, prefix != "お" { return true }
            // お + a noun is a verb stem used as a noun (お待ち, お知らせ) or a thing (お水, お茶)
            guard prefix == "お" || (word.base.hasPrefix("お") && word.base.count > 1),
                  let last = word.base.last
            else { return false }
            return Self.verbStemEndings.contains(last)
        }

        while i < annotations.count {
            let ann = annotations[i]

            // Emit any text between the previous token and this one
            if ann.range.lowerBound > cursor {
                result += text[cursor..<ann.range.lowerBound]
            }

            // Fixed expressions come before the rules for ordinary sentences
            if startsSentence(i), let next = tokens(from: i, spell: Self.mealGreeting) {
                result += Self.mealGreeting
                advance(to: next)
                continue
            }
            if let (phrase, next) = Self.setPhrases.lazy
                .compactMap({ phrase in tokens(from: i, spell: phrase.polite).map { (phrase, $0) } }).first,
               !(phrase.polite == "すいませんでした" && i > 1 && annotations[i - 1].partOfSpeech == .particle
                 && Self.smokedOrBreathed.contains(annotations[i - 2].base)) {
                // A phrase that runs on into its clause is not the greeting: お願い cannot take
                // から, ので, が or か (お願いしますから, 誰にお願いしますか). わかった is an ordinary past
                // form and takes any particle. The test is for a particle and not for "no mark":
                // MeCab tags !, ー and some emoji as nouns
                let follower = next < annotations.count
                    && annotations[next].range.lowerBound == annotations[next - 1].range.upperBound
                    ? annotations[next] : nil
                let goesOn = follower?.partOfSpeech == .particle
                    && !Self.sentenceEndingParticles.contains(follower?.base ?? "")
                    && !Self.quotingParticles.contains(follower?.base ?? "")
                    && !phrase.casual.hasSuffix("た")
                if !goesOn {
                    var casual = phrase.casual
                    // よろしくお願いしますね: the ね is already there
                    if casual.hasSuffix("ね"), next < annotations.count,
                       Self.sentenceEndingParticles.contains(annotations[next].base) {
                        casual.removeLast()
                    }
                    result += casual
                    advance(to: next)
                    continue
                }
                if !phrase.polite.hasSuffix("ます") {
                    // すみませんでしたが, お疲れ様ですが: でした after a set phrase is not だった, and
                    // the phrase is left as it is
                    result += phrase.polite
                    advance(to: next)
                    continue
                }
                // A ます phrase goes on to the verb rule below: お願いするから, 誰にお願いする？
            }

            // 学生ではありません → 学生じゃない: the casual negative of the copula is じゃない
            if ann.base == "で", inARow(from: i, count: 4),
               annotations[i + 1].base == "は", annotations[i + 2].dictionaryForm == "ある",
               annotations[i + 3].base == "ませ" {
                result += "じゃ"
                advance(to: i + 2)
                continue
            }

            // ジョンと申します → ジョンだよ: among friends the humble "I am called" is the copula
            if ann.base == "と", ann.partOfSpeech == .particle, i > 0, inARow(from: i, count: 3),
               annotations[i + 1].dictionaryForm == "申す", annotations[i + 2].base == "ます" {
                let copula = casualCopula(endingAt: i + 2)
                result += copula.form
                advance(to: i + 3 + copula.particles)
                continue
            }

            // Look for verb + polite auxiliary patterns
            if ann.partOfSpeech == .verb, i + 1 < annotations.count {
                let next = annotations[i + 1]
                var dictForm = ann.dictionaryForm // e.g., "行く", "食べる" (kanji preserved)
                // 一段 or 五段? The stem in front of ます tells: an ichidan verb only loses its る
                // (食べ + る = 食べる), a godan verb changes its last kana (帰り + る ≠ 帰る)
                var ichidan = ann.base + "る" == dictForm
                // する and its compounds (勉強する, 愛する) have a stem that ends in し. こする, 揺する
                // and さする only end in する: they are godan (こすり + ます, こすった)
                var suru = dictForm.hasSuffix("する") && ann.base.hasSuffix("し")
                if let plain = Self.plainVerbs[dictForm] {
                    (dictForm, ichidan) = plain
                    suru = dictForm.hasSuffix("する")
                }
                // いただく after the case particle で is "to eat" as often as "to receive" (店内でいただきます):
                // only after a て form is it the favour, that is て, or で after a verb stem (読ん + で)
                // or after ない (行かない + で)
                let eats = (dictForm == "いただく" || dictForm == "頂く") && i > 0 && annotations[i - 1].base == "で"
                    && !(i > 1 && (annotations[i - 2].partOfSpeech == .verb || annotations[i - 2].base == "ない"))
                if i > 0, !eats, ["て", "で"].contains(annotations[i - 1].base), annotations[i - 1].partOfSpeech == .particle,
                   let plain = Self.teFormPlainVerbs[dictForm] {
                    (dictForm, ichidan) = plain
                }
                // The plain form of the verb with its polite ending, and how many tokens that takes
                var plain: (form: String, length: Int)?

                if next.base == "ます" {
                    // verb + ます (present polite) → dictionary form
                    plain = (dictForm, 2)
                } else if next.base == "まし" && i + 2 < annotations.count && annotations[i + 2].base == "た" {
                    // verb + まし + た (past polite) → ta-form
                    plain = (makeTaForm(dictForm: dictForm, ichidan: ichidan, suru: suru), 3)
                } else if next.base == "ませ" && i + 2 < annotations.count && annotations[i + 2].base == "ん" {
                    let negative = makeNaiForm(dictForm: dictForm, ichidan: ichidan, suru: suru)
                    if i + 4 < annotations.count && annotations[i + 3].base == "でし" && annotations[i + 4].base == "た" {
                        // verb + ませ + ん + でし + た (negative past polite) → 〜なかった
                        plain = (String(negative.dropLast()) + "かった", 5)
                    } else {
                        // verb + ませ + ん (negative polite) → nai-form
                        plain = (negative, 3)
                    }
                }

                if let plain = plain, inARow(from: i, count: plain.length) {
                    result += plain.form
                    advance(to: i + plain.length)
                    // 行きますか → 行く？
                    closeQuestion()
                    continue
                }
            }

            // そうなんですか → そうなの, 行くんですか → 行くの: the ん is already the の of なの.
            // (The ん of ません is an ending, which MeCab does not give a part of speech.)
            // That ん follows a verb, な / だ, an い-adjective or た / たい / ない. After anything
            // else it is the last kana of a word MeCab does not know (じかんですか is じ + か + ん)
            let explanatory = ann.base == "の" || i == 0
                || annotations[i - 1].partOfSpeech == .verb
                || annotations[i - 1].dictionaryForm == "だ"
                // At the start of a clause MeCab takes ある, かかる and 去る for the adnominals
                // ("a certain", "such", "last"), which have no part of speech here
                || (annotations[i - 1].partOfSpeech == .unknown && ["ある", "かかる", "去る"].contains(annotations[i - 1].base))
                || Self.endsLikeAdjective(annotations[i - 1], after: i > 1 ? annotations[i - 2] : nil)
            if explanatory, ann.base == "ん" || ann.base == "の", ann.partOfSpeech != .unknown, inARow(from: i, count: 3),
               annotations[i + 1].base == "です", annotations[i + 2].base == "か" {
                result += "の"
                advance(to: i + 3)
                continue
            }

            // よろしいですか → いい？: よろしい is the polite いい, and on its own it is as ladylike
            // as いただける. The です after it then follows an い-adjective
            if ann.base == "よろしい", inARow(from: i, count: 2), annotations[i + 1].base == "です" {
                result += "いい"
                advance(to: i + 1)
                continue
            }

            // Handle standalone です patterns
            if ann.base == "です" {
                let isQuestion = inARow(from: i, count: 2) && annotations[i + 1].base == "か"

                if i > 0, Self.endsLikeAdjective(annotations[i - 1], after: i > 1 ? annotations[i - 2] : nil) {
                    // An い-adjective, たい, ない and かった are complete without a copula, and だ
                    // cannot follow them (おいしいだよ is not Japanese): the です is dropped
                    advance(to: i + 1)
                    // おいしいですか → おいしい？
                    closeQuestion()
                } else if isQuestion {
                    // ですか → なの
                    result += "なの"
                    advance(to: i + 2)
                } else {
                    let copula = casualCopula(endingAt: i)
                    result += copula.form
                    advance(to: i + 1 + copula.particles)
                }
                continue
            }

            // でした → だった. Not straight after ません: a verb's ませんでした is taken whole by
            // the verb rule above (行かなかった), and what is left is ございませんでした and
            // じゃありませんでした, whose stems MeCab does not tag as verbs. ませんだった is not
            // Japanese: they stay as they are, like ございません and じゃありません
            if ann.base == "でし", inARow(from: i, count: 2), annotations[i + 1].base == "た",
               !(i >= 2 && annotations[i - 2].base == "ませ" && annotations[i - 1].base == "ん") {
                result += "だった"
                advance(to: i + 2)
                // どうでしたか → どうだった？
                closeQuestion(afterPastCopula: true)
                continue
            }

            // ください → ちょうだい. Not in お待ちください or ご注意ください: ちょうだい asks for a
            // thing or a favour (水をちょうだい, 待ってちょうだい) and cannot end an honorific request
            if (ann.base == "ください" || ann.base == "下さい") && !isHonorificRequest(endingAt: i) {
                result += "ちょうだい"
                advance(to: i + 1)
                continue
            }

            // Default: keep original text
            result += text[ann.range]
            advance(to: i + 1)
        }

        // Append any remaining text after the last token
        if cursor < text.endIndex {
            result += text[cursor..<text.endIndex]
        }

        return result
    }

    // MARK: - Token helpers

    /// 高い, 食べたい, 行かない, 楽しかった: an い-adjective, or an ending that behaves like one.
    /// `before` is the token in front of `ann`.
    private static func endsLikeAdjective(_ ann: TextToken, after before: TextToken?) -> Bool {
        switch ann.partOfSpeech {
        case .adjective, .adverb:
            // In its dictionary form: 高く and 高かっ are followed by other things than です
            return ann.base == ann.dictionaryForm && ann.base.hasSuffix("い") && !adverbsEndingInI.contains(ann.base)
        case .verb:
            // After と and でも MeCab reads いい as the stem of 言う, which never stands in front of です
            return ann.base == "いい"
        case .unknown:
            return adjectiveLikeEndings.contains(ann.base)
        case .noun:
            // 行ってみたい is みる + たい ("want to try"). MeCab takes it for the みたい of
            // 学生みたい ("like a student"), which cannot follow a て form
            return ann.base == "みたい" && before?.partOfSpeech == .particle && (before?.base == "て" || before?.base == "で")
        default:
            return false
        }
    }

    /// MeCab tags ASCII punctuation (? ! .) as a noun, not as a symbol.
    private static func isASCIIPunctuation(_ base: String) -> Bool {
        !base.isEmpty && base.unicodeScalars.allSatisfy {
            $0.isASCII && !CharacterSet.alphanumerics.contains($0) && !CharacterSet.whitespacesAndNewlines.contains($0)
        }
    }

    // MARK: - Verb conjugation helpers

    /// Make the casual past form (ta-form) from a dictionary form
    /// e.g., 食べる→食べた, 行く→行った, 飲む→飲んだ
    /// `suru`: the verb is する or a compound of it, not a godan verb that ends in する.
    private func makeTaForm(dictForm: String, ichidan: Bool, suru: Bool) -> String {
        // Irregular verbs
        if suru {
            return String(dictForm.dropLast(2)) + "した"
        }
        if dictForm == "来る" || dictForm == "くる" {
            return dictForm.hasSuffix("来る") ? "来た" : "きた"
        }

        // Group 2 (一段): る → た
        if ichidan {
            return String(dictForm.dropLast()) + "た"
        }

        // Group 1 (五段)
        let stem = String(dictForm.dropLast())
        guard let lastChar = dictForm.last else { return dictForm }

        switch lastChar {
        case "う", "つ", "る":
            return stem + "った"
        case "む", "ぬ", "ぶ":
            return stem + "んだ"
        case "く":
            // Exception: 行く → 行った
            if dictForm == "行く" || dictForm == "いく" {
                return stem + "った"
            }
            return stem + "いた"
        case "ぐ":
            return stem + "いだ"
        case "す":
            return stem + "した"
        default:
            return dictForm + "た"
        }
    }

    /// Make the casual negative form (nai-form) from a dictionary form
    /// e.g., 食べる→食べない, 行く→行かない, 飲む→飲まない
    /// `suru`: as for `makeTaForm`.
    private func makeNaiForm(dictForm: String, ichidan: Bool, suru: Bool) -> String {
        // Irregular verbs
        if suru {
            return String(dictForm.dropLast(2)) + "しない"
        }
        if dictForm == "来る" || dictForm == "くる" {
            return dictForm.hasSuffix("来る") ? "来ない" : "こない"
        }
        // The negative of ある is the adjective ない (there is no あらない)
        if dictForm == "ある" || dictForm == "有る" {
            return "ない"
        }

        // Group 2 (一段): る → ない
        if ichidan {
            return String(dictForm.dropLast()) + "ない"
        }

        // Group 1 (五段): change last char to あ-dan + ない
        let stem = String(dictForm.dropLast())
        guard let lastChar = dictForm.last else { return dictForm }

        let aDanMap: [Character: String] = [
            "う": "わ", "く": "か", "ぐ": "が", "す": "さ",
            "つ": "た", "ぬ": "な", "ぶ": "ば", "む": "ま", "る": "ら",
        ]

        if let aDan = aDanMap[lastChar] {
            return stem + aDan + "ない"
        }

        return dictForm + "ない"
    }
}

extension Tokenizer {
    /// The tokens of `text`, each at its own place and in the order they are written. The
    /// casualizer and the romaji service walk the text along this list, never along what
    /// `tokenize` returns.
    ///
    /// `tokenize` finds the place of every token by searching the text for it. A token it cannot
    /// find where it stands (the 2 inside the keycap 2️⃣, the ❤ inside ❤️) is placed on the next
    /// bare copy of that character, wherever that is.
    ///
    /// - At the very end of the text the search does not move on, and the tokens that follow
    ///   lie in front of the misplaced one. Walking the text along such a list writes text
    ///   twice (❤️は❤ became ❤️は❤は❤), and a slice from one token to the next is a runtime trap
    ///   ("Range requires lowerBound <= upperBound"), which no message a guest sends may cause
    ///   on the host's phone. So a token that ends after a later one starts is left out, and so
    ///   is one with no text (`placedTokens`).
    /// - Anywhere else the search moves past it, and every token between the two is missing
    ///   from the list: in 1️⃣ 明日は10時に the 1 lands on the 1 of 10, and 明日, は and 10 are
    ///   gone. Passed on as text between two tokens, kanji are read as Chinese ("ming riha"),
    ///   polite forms stay polite and 12人 after 2️⃣ is "1futari". So where a letter or a digit
    ///   is left without a token, the list is dropped and the text is tokenized in the runs
    ///   between its characters of more than one scalar. Only inside such a character can a
    ///   token not be found, so every run comes back whole and in order.
    ///
    /// A text with more than 200 scalars in such characters is tokenized in its runs straight
    /// away. `tokenize` looks for every token it cannot find through the whole rest of the text,
    /// and each of those scalars can be one: a message of 2,000 letters that composition takes
    /// apart (क़ is given to MeCab as क + ़) took three seconds, and six with a second pass.
    ///
    /// What is left between two tokens (spaces, such characters) both services pass on as it is.
    /// In a text tokenized in its runs that is every character of more than one scalar, also
    /// one that MeCab has a token for (👍🏻, 🇯🇵, the ｶﾞ of half-width katakana).
    /// The readings are katakana, which keeps the kanji of the dictionary form (IPADic's 原形).
    ///
    /// MeCab taggers are not thread-safe: the caller holds its lock.
    func tokensInOrder(of text: String) -> [TextToken] {
        /// More than one scalar when composed, which is how MeCab is given the text: 2️⃣, ❤️,
        /// あ゙, and the few letters that are one scalar only until they are composed (क़)
        func isCluster(_ character: Character) -> Bool {
            let scalars = character.unicodeScalars
            guard scalars.count > 1 || scalars.first?.properties.isFullCompositionExclusion == true else { return false }
            return String(character).precomposedStringWithCanonicalMapping.unicodeScalars.count > 1
        }
        func hasWord(_ part: Substring) -> Bool {
            part.contains { ($0.isLetter || $0.isNumber) && !isCluster($0) }
        }
        // The scalars that `tokenize` may look for in vain. Counting stops once there are too many
        var clusterScalars = 0
        for character in text where clusterScalars <= 200 && isCluster(character) {
            clusterScalars += character.unicodeScalars.count
        }
        if clusterScalars <= 200 {
            let placed = placedTokens(of: text)
            var cursor = text.startIndex
            var wordLeftOut = false
            for annotation in placed where !wordLeftOut {
                wordLeftOut = hasWord(text[cursor..<annotation.range.lowerBound])
                cursor = annotation.range.upperBound
            }
            guard wordLeftOut || hasWord(text[cursor...]) else { return placed.map { TextToken($0, range: $0.range) } }
        }

        var tokens: [TextToken] = []
        var start = text.startIndex
        func tokenizeRun(upTo end: String.Index) {
            guard start < end else { return }
            // The run is a string of its own: its ranges are moved to the text by UTF-16 offset
            let run = String(text[start..<end])
            for token in placedTokens(of: run) {
                let lower = run.utf16.distance(from: run.startIndex, to: token.range.lowerBound)
                let upper = run.utf16.distance(from: run.startIndex, to: token.range.upperBound)
                tokens.append(TextToken(token, range: text.utf16.index(start, offsetBy: lower)..<text.utf16.index(start, offsetBy: upper)))
            }
        }
        for index in text.indices where isCluster(text[index]) {
            tokenizeRun(upTo: index)
            start = text.index(after: index)
        }
        tokenizeRun(upTo: text.endIndex)
        return tokens
    }

    /// What `tokenize` returns, without a token that ends after a later one starts and without
    /// one that has no text.
    private func placedTokens(of text: String) -> [Annotation] {
        var kept: [Annotation] = []
        var nextStart = text.endIndex
        for annotation in tokenize(text: text, transliteration: .katakana).reversed() {
            guard !annotation.range.isEmpty, annotation.range.upperBound <= nextStart else { continue }
            kept.append(annotation)
            nextStart = annotation.range.lowerBound
        }
        kept.reverse()
        return kept
    }
}

/// A MeCab token at its place in the text. An `Annotation` cannot be made outside Mecab-Swift,
/// and a token found by tokenizing a part of the text again needs its range in the whole text.
struct TextToken {
    let base: String
    let reading: String
    let partOfSpeech: PartOfSpeech
    let dictionaryForm: String
    let range: Range<String.Index>

    init(_ annotation: Annotation, range: Range<String.Index>) {
        base = annotation.base
        reading = annotation.reading
        partOfSpeech = annotation.partOfSpeech
        dictionaryForm = annotation.dictionaryForm
        self.range = range
    }
}

extension String {
    /// The text in pieces that `Tokenizer.tokenize` is quick with. A message is one piece.
    ///
    /// `tokenize` searches the whole rest of the text for every token it cannot place, so on a
    /// text full of characters it cannot place (❤️, 👨‍👩‍👧, keycaps) its time grows with the square
    /// of the length: 5,000 × ❤️ took three seconds and 5,000 × 👨‍👩‍👧 ten, in each service. A
    /// message is at most 2,000 UTF-16 units, which the server enforces, and takes 0.2 seconds at
    /// the worst. Only a longer text is cut: after a line break or the mark that ends a sentence
    /// once a piece has 500 units, so that no word or ending is cut in two, and wherever it has
    /// 1,000 when there is no such place.
    var tokenizerPieces: [Substring] {
        guard utf16.count > 2000 else { return [self[...]] }
        var pieces: [Substring] = []
        var start = startIndex
        var length = 0
        func cut(at end: Index) {
            pieces.append(self[start..<end])
            start = end
            length = 0
        }
        for index in indices {
            let character = self[index]
            let next = self.index(after: index)
            let units = character.utf16.count
            if units > 1000 {
                // One "character" made of thousands of joiners or combining marks is as slow as
                // a text of that length: it is cut inside, between any two of its scalars
                var scalar = index
                while scalar < next {
                    length += unicodeScalars[scalar].utf16.count
                    scalar = unicodeScalars.index(after: scalar)
                    if length >= 1000 { cut(at: scalar) }
                }
                continue
            }
            length += units
            if length >= 1000 || (length >= 500 && (character.isNewline || "。！？".contains(character))) {
                cut(at: next)
            }
        }
        if start < endIndex { pieces.append(self[start...]) }
        return pieces
    }
}
