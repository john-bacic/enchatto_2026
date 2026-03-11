import Foundation
import Mecab_Swift
import IPADic
import Dictionary

/// Converts polite/formal Japanese (です/ます form) to casual speech
/// using MeCab morphological analysis for accurate verb de-conjugation.
class MeCabCasualizer {
    private let tokenizer: Tokenizer

    init() {
        // IPADic bundles the dictionary with the SPM package
        self.tokenizer = try! Tokenizer(dictionary: IPADic())
    }

    /// Convert polite Japanese text to casual form
    func casualify(_ text: String) -> String {
        // Use .katakana so dictionaryForm preserves kanji from IPADic features[6] (原形)
        let annotations = tokenizer.tokenize(text: text, transliteration: .katakana)
        guard !annotations.isEmpty else { return text }

        var result = ""
        var cursor = text.startIndex
        var i = 0

        while i < annotations.count {
            let ann = annotations[i]

            // Emit any text between the previous token and this one
            if ann.range.lowerBound > cursor {
                result += text[cursor..<ann.range.lowerBound]
            }

            // Look for verb + polite auxiliary patterns
            if ann.partOfSpeech == .verb, i + 1 < annotations.count {
                let next = annotations[i + 1]
                let dictForm = ann.dictionaryForm // e.g., "行く", "食べる" (kanji preserved)

                // verb + ます (present polite) → dictionary form
                if next.base == "ます" {
                    result += dictForm
                    cursor = next.range.upperBound
                    i += 2
                    continue
                }

                // verb + まし + た (past polite) → ta-form
                if next.base == "まし" && i + 2 < annotations.count && annotations[i + 2].base == "た" {
                    result += makeTaForm(dictForm: dictForm)
                    cursor = annotations[i + 2].range.upperBound
                    i += 3
                    continue
                }

                // verb + ませ + ん (negative polite) → nai-form
                if next.base == "ませ" && i + 2 < annotations.count && annotations[i + 2].base == "ん" {
                    result += makeNaiForm(dictForm: dictForm)
                    cursor = annotations[i + 2].range.upperBound
                    i += 3
                    continue
                }

                // verb + ません (single token negative polite) → nai-form
                if next.base == "ません" {
                    result += makeNaiForm(dictForm: dictForm)
                    cursor = next.range.upperBound
                    i += 2
                    continue
                }
            }

            // Handle standalone です patterns
            if ann.base == "です" {
                // ですか → なの
                if i + 1 < annotations.count && annotations[i + 1].base == "か" {
                    result += "なの"
                    cursor = annotations[i + 1].range.upperBound
                    i += 2
                    continue
                }
                result += "だよ"
                cursor = ann.range.upperBound
                i += 1
                continue
            }

            // でした → だった
            if ann.base == "でし" && i + 1 < annotations.count && annotations[i + 1].base == "た" {
                result += "だった"
                cursor = annotations[i + 1].range.upperBound
                i += 2
                continue
            }

            // ください → ちょうだい
            if ann.base == "ください" || ann.base == "下さい" {
                result += "ちょうだい"
                cursor = ann.range.upperBound
                i += 1
                continue
            }

            // Default: keep original text
            result += text[ann.range]
            cursor = ann.range.upperBound
            i += 1
        }

        // Append any remaining text after the last token
        if cursor < text.endIndex {
            result += text[cursor..<text.endIndex]
        }

        return result
    }

    // MARK: - Verb conjugation helpers

    /// Make the casual past form (ta-form) from a dictionary form
    /// e.g., 食べる→食べた, 行く→行った, 飲む→飲んだ
    private func makeTaForm(dictForm: String) -> String {
        // Irregular verbs
        if dictForm.hasSuffix("する") {
            return String(dictForm.dropLast(2)) + "した"
        }
        if dictForm == "来る" || dictForm == "くる" {
            return dictForm.hasSuffix("来る") ? "来た" : "きた"
        }

        // Group 2 (一段): ends in る with え-dan or い-dan vowel before る
        if dictForm.hasSuffix("る") && isGroup2Verb(dictForm) {
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
    private func makeNaiForm(dictForm: String) -> String {
        // Irregular verbs
        if dictForm.hasSuffix("する") {
            return String(dictForm.dropLast(2)) + "しない"
        }
        if dictForm == "来る" || dictForm == "くる" {
            return dictForm.hasSuffix("来る") ? "来ない" : "こない"
        }

        // Group 2 (一段)
        if dictForm.hasSuffix("る") && isGroup2Verb(dictForm) {
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

    /// Heuristic: is this る-ending verb likely Group 2 (一段)?
    /// Group 2 verbs have an え-dan or い-dan vowel sound before る.
    private func isGroup2Verb(_ dictForm: String) -> Bool {
        guard dictForm.count >= 2 else { return false }

        // Known Group 2 kanji verbs where the char before る is kanji
        let group2Kanji: Set<String> = [
            "見る", "寝る", "出る", "着る", "似る", "煮る", "居る",
            "得る", "経る", "混じる", "感じる", "信じる", "生じる",
        ]
        if group2Kanji.contains(dictForm) { return true }

        // Known Group 1 る-verbs (exceptions to the heuristic)
        let group1Exceptions: Set<String> = [
            "切る", "知る", "入る", "走る", "帰る", "減る", "蹴る",
            "滑る", "握る", "練る", "参る", "限る", "渡る", "焦る",
            "きる", "しる", "はいる", "はしる", "かえる", "へる", "ける",
        ]
        if group1Exceptions.contains(dictForm) { return false }

        // Check the kana character before る
        let beforeRu = dictForm[dictForm.index(dictForm.endIndex, offsetBy: -2)]

        // Convert katakana to hiragana if needed
        let hira: Character
        if let scalar = beforeRu.unicodeScalars.first,
           scalar.value >= 0x30A1 && scalar.value <= 0x30F6 {
            hira = Character(Unicode.Scalar(scalar.value - 0x60)!)
        } else {
            hira = beforeRu
        }

        // If the character is kanji, we can't determine the group — default to Group 1 (safer)
        if let scalar = hira.unicodeScalars.first,
           scalar.value >= 0x4E00 && scalar.value <= 0x9FFF {
            return false
        }

        // え-dan: え,け,せ,て,ね,へ,べ,め,れ
        let eDan: Set<Character> = ["え", "け", "せ", "て", "ね", "へ", "べ", "め", "れ"]
        // い-dan: い,き,し,ち,に,ひ,び,み,り
        let iDan: Set<Character> = ["い", "き", "し", "ち", "に", "ひ", "び", "み", "り"]

        return eDan.contains(hira) || iDan.contains(hira)
    }
}
