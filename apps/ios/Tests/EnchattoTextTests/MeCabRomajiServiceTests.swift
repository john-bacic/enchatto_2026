import XCTest
@testable import EnchattoText

/// `MeCabRomajiService`: Japanese to romaji. MeCab (IPADic) gives each token a katakana
/// reading, CFStringTransform turns the reading into Latin letters, and the service decides
/// the spacing, the particle readings and the punctuation.
///
/// The spelling is Hepburn (shi, chi, tsu, fu, ji, n' before a vowel), but long vowels are
/// spelled "as written" (wapuro) instead of with the macrons of modified Hepburn: おう is "ou",
/// ー doubles the vowel, and no macrons are produced. That is the service's own choice (it
/// replaces the macrons CFStringTransform produces) and these tests follow it.
///
/// The app shows this romaji for Japanese a host typed or dictated AND for the casual Japanese
/// the casualizer produced from a translation, so casual forms (だよ, なの, 行った) matter as
/// much as polite ones.
///
/// What depends on the operating system: every letter comes from CFStringTransform
/// (`kCFStringTransformToLatin`), not from this code. MeCab and its dictionary are pinned by
/// Package.resolved, the transliteration tables are not. If a macOS release changes them, expect
/// it in the long vowels (ー as a macron), the apostrophe after ん, っ before ち ("tchi"), the
/// small-kana syllables (ティ, ディ, ファ, シェ) and in text it passes through (emoji, "…").
final class MeCabRomajiServiceTests: XCTestCase {
    private func romaji(_ text: String) -> String {
        MeCabRomajiService.shared.romaji(text)
    }

    // MARK: - Kana

    func testHiraganaAndKatakana() {
        XCTAssertEqual(romaji("あいうえお"), "aiueo")
        XCTAssertEqual(romaji("カタカナ"), "katakana")
        XCTAssertEqual(romaji("アメリカ"), "amerika")
        XCTAssertEqual(romaji("ジョン"), "jon")
    }

    func testHepburnSpelling() {
        // shi, chi, tsu, fu, ji
        XCTAssertEqual(romaji("寿司"), "sushi")
        XCTAssertEqual(romaji("地図"), "chizu")
        XCTAssertEqual(romaji("机"), "tsukue")
        XCTAssertEqual(romaji("船"), "fune")
        XCTAssertEqual(romaji("富士山"), "fujisan")
        // sha, cha, ja
        XCTAssertEqual(romaji("写真"), "shashin")
        XCTAssertEqual(romaji("しゃしん"), "shashin")
        XCTAssertEqual(romaji("お茶"), "ocha")
        XCTAssertEqual(romaji("自転車"), "jitensha")
        XCTAssertEqual(romaji("じゃ"), "ja")
    }

    // MARK: - Kanji

    /// CFStringTransform on its own reads kanji as Mandarin (今日 becomes "jin ri"), which is
    /// why the service asks MeCab for the reading first.
    func testKanjiUseTheirJapaneseReading() {
        XCTAssertEqual(romaji("今日"), "kyou")
        XCTAssertEqual(romaji("学校"), "gakkou")
        XCTAssertEqual(romaji("日本語"), "nihongo")
        XCTAssertEqual(romaji("先生"), "sensei")
        XCTAssertEqual(romaji("友達"), "tomodachi")
        // Readings that cannot be built from the single characters
        XCTAssertEqual(romaji("明日"), "ashita")
        XCTAssertEqual(romaji("昨日"), "kinou")
        XCTAssertEqual(romaji("今年"), "kotoshi")
        XCTAssertEqual(romaji("今朝"), "kesa")
        XCTAssertEqual(romaji("大人"), "otona")
        XCTAssertEqual(romaji("上手"), "jouzu")
    }

    func testNamesAreReadAndKeptApartFromTheirSuffix() {
        XCTAssertEqual(romaji("田中さん"), "tanaka san")
        XCTAssertEqual(romaji("山田太郎"), "yamada tarou")
        XCTAssertEqual(romaji("田中さんは先生です。"), "tanaka san wa sensei desu.")
    }

    // MARK: - Particles

    func testTopicParticleHaIsWrittenWa() {
        XCTAssertEqual(romaji("私は学生です。"), "watashi wa gakusei desu.")
        XCTAssertEqual(romaji("今日は"), "kyou wa")
        // After another particle
        XCTAssertEqual(romaji("東京には行きません"), "toukyou ni wa ikimasen")
        XCTAssertEqual(romaji("学生ではありません"), "gakusei de wa arimasen")
    }

    func testDirectionParticleHeIsWrittenE() {
        XCTAssertEqual(romaji("東京へ行きます。"), "toukyou e ikimasu.")
        XCTAssertEqual(romaji("どこへ行くの？"), "doko e iku no?")
    }

    func testObjectParticleWoIsWrittenO() {
        XCTAssertEqual(romaji("本を読む"), "hon o yomu")
        XCTAssertEqual(romaji("これをください"), "kore o kudasai")
    }

    func testHaAndHeInsideWordsKeepTheirOwnSound() {
        XCTAssertEqual(romaji("はし"), "hashi")
        XCTAssertEqual(romaji("はい"), "hai")
        XCTAssertEqual(romaji("部屋"), "heya")
        XCTAssertEqual(romaji("へや"), "heya")
        XCTAssertEqual(romaji("へえ"), "hee")
        // The same kana twice in one sentence: once inside a word, once as the particle.
        XCTAssertEqual(romaji("母は元気です"), "haha wa genki desu")
        XCTAssertEqual(romaji("花は赤い"), "hana wa akai")
    }

    func testGreetingsThatEndInTheParticleHa() {
        XCTAssertEqual(romaji("こんにちは"), "konnichiwa")
        XCTAssertEqual(romaji("こんばんは"), "konbanwa")
        XCTAssertEqual(romaji("みなさん、こんにちは"), "minasan, konnichiwa")
        // The spelling people type by ear
        XCTAssertEqual(romaji("こんにちわ"), "konnichiwa")
    }

    // MARK: - Long vowels

    func testLongVowelsAreSpelledAsWritten() {
        XCTAssertEqual(romaji("東京"), "toukyou")
        XCTAssertEqual(romaji("ありがとう"), "arigatou")
        XCTAssertEqual(romaji("お父さん"), "otousan")
        XCTAssertEqual(romaji("お母さん"), "okaasan")
        XCTAssertEqual(romaji("大きい"), "ookii")
        XCTAssertEqual(romaji("大阪"), "oosaka")
        XCTAssertEqual(romaji("いいえ"), "iie")
    }

    func testKatakanaLongVowelMarkDoublesTheVowel() {
        XCTAssertEqual(romaji("コーヒー"), "koohii")
        XCTAssertEqual(romaji("ラーメン"), "raamen")
        XCTAssertEqual(romaji("ビール"), "biiru")
        XCTAssertEqual(romaji("ケーキ"), "keeki")
        XCTAssertEqual(romaji("コンピューター"), "konpyuutaa")
        // Interjections that are in the dictionary with their long-vowel mark
        XCTAssertEqual(romaji("えー"), "ee")
        XCTAssertEqual(romaji("うーん"), "uun")
    }

    func testOutputIsPlainASCIIWithoutMacrons() {
        let sentences = [
            "私は日本語を勉強しています。",
            "東京へ行きます。",
            "コーヒーを飲みません。",
            "こんにちは、元気ですか？",
            "今日はいい天気ですね。",
            "お父さんとお母さんは大阪にいます。",
            "「はい」と（東京）：『大阪』！",
        ]
        for sentence in sentences {
            let result = romaji(sentence)
            XCTAssertTrue(result.unicodeScalars.allSatisfy { $0.isASCII }, "\(sentence) became \(result)")
            XCTAssertFalse(result.isEmpty)
        }
    }

    // MARK: - Small tsu

    func testSmallTsuDoublesTheFollowingConsonant() {
        XCTAssertEqual(romaji("学校"), "gakkou")
        XCTAssertEqual(romaji("切手"), "kitte")
        XCTAssertEqual(romaji("雑誌"), "zasshi")
        XCTAssertEqual(romaji("一緒に"), "issho ni")
        XCTAssertEqual(romaji("いっぱい"), "ippai")
        XCTAssertEqual(romaji("ちょっと"), "chotto")
        XCTAssertEqual(romaji("やっぱり"), "yappari")
        XCTAssertEqual(romaji("ゆっくり"), "yukkuri")
        // Katakana loanwords
        XCTAssertEqual(romaji("サッカー"), "sakkaa")
        XCTAssertEqual(romaji("ベッド"), "beddo")
        XCTAssertEqual(romaji("マッチ"), "matchi")
    }

    func testSmallTsuAtTheEndOfAVerbOrAdjectiveStem() {
        // DEFECT: MeCab splits 行って into 行っ + て, and the service transliterates each token
        // on its own. A reading that ends in ッ has no consonant to double, so
        // CFStringTransform writes its placeholder "~tsu": 行って comes out as "i~tsute".
        // This hits the て and た forms of every godan verb in う, つ and る and of 行く, which
        // is also what the casualizer produces for ました (分かりました → 分かった).
        XCTExpectDefect(romaji("行って"), shouldBe: "itte")
        XCTExpectDefect(romaji("行った"), shouldBe: "itta")
        XCTExpectDefect(romaji("買った"), shouldBe: "katta")
        XCTExpectDefect(romaji("わかった"), shouldBe: "wakatta")
        XCTExpectDefect(romaji("分かった"), shouldBe: "wakatta")
        XCTExpectDefect(romaji("やった！"), shouldBe: "yatta!")
        XCTExpectDefect(romaji("頑張って"), shouldBe: "ganbatte")
        XCTExpectDefect(romaji("ちょっと待って"), shouldBe: "chotto matte")
        XCTExpectDefect(romaji("待ってください"), shouldBe: "matte kudasai")
        XCTExpectDefect(romaji("もう一度言ってください"), shouldBe: "mou ichido itte kudasai", "mouichido itte kudasai")
        XCTExpectDefect(romaji("持っている"), shouldBe: "motte iru")
        XCTExpectDefect(romaji("雨が降っています"), shouldBe: "ame ga futte imasu")
        XCTExpectDefect(romaji("行ってきます"), shouldBe: "itte kimasu")
        XCTExpectDefect(romaji("京都に行った"), shouldBe: "kyouto ni itta")
        // The same in かった and だった (MeCab: 楽しかっ + た, だっ + た), which is the
        // casual past tense of every adjective and of だ: だった comes out as "da~tsu ta".
        // After だっ and an adjective the た is also split off as a word of its own (see the
        // auxiliaries test below), so these need both fixes before they pass.
        XCTExpectDefect(romaji("だった"), shouldBe: "datta")
        XCTExpectDefect(romaji("学生だった"), shouldBe: "gakusei datta")
        XCTExpectDefect(romaji("楽しかった"), shouldBe: "tanoshikatta")
        XCTExpectDefect(romaji("よかった"), shouldBe: "yokatta")
        XCTExpectDefect(romaji("行かなかった"), shouldBe: "ikanakatta")
        // Interjections that end in っ
        XCTExpectDefect(romaji("そっか"), shouldBe: "sokka")
    }

    func testOutputNeverContainsTheTransformPlaceholder() {
        // DEFECT: "~" is CFStringTransform's marker for a small kana it could not attach to
        // anything. It should never reach the screen. Besides the verb and adjective forms
        // above it appears for words typed in hiragana that MeCab splits (がっこう) and for
        // interjections that end in っ (えっ).
        let inputs = [
            "行って", "待って", "あった", "もう帰った", "彼は医者になった", "すごかったね", "がっこう",
            "えっ？", "あっ", "知ってる", "いってらっしゃい", "写真を撮ってもいいですか？",
        ]
        for input in inputs {
            let result = romaji(input)
            XCTExpectDefect(fixedWhen: !result.contains("~"), "\(input) became \(result)")
        }
    }

    func testKatakanaSyllablesWithASmallVowel() {
        // The newer katakana syllables (a consonant kana + a small vowel) that work.
        XCTAssertEqual(romaji("パーティー"), "paatii")
        XCTAssertEqual(romaji("ティッシュ"), "tisshu")
        XCTAssertEqual(romaji("ディズニー"), "dizunii")
        XCTAssertEqual(romaji("ファン"), "fan")
        XCTAssertEqual(romaji("フィリピン"), "firipin")
        XCTAssertEqual(romaji("フォーク"), "fooku")
        XCTAssertEqual(romaji("シェフ"), "shefu")
        XCTAssertEqual(romaji("チェック"), "chekku")
        XCTAssertEqual(romaji("ジェット"), "jetto")
    }

    func testKatakanaSyllablesTheTransformDoesNotKnow() {
        // DEFECT: for ウィ ウェ ウォ, ヴァ ヴィ and デュ (and トゥ, ドゥ, ツァ, クォ)
        // CFStringTransform has no syllable and writes the same "~" placeholder in front of
        // the small vowel: ウィリアム comes out as "u~iriamu". Foreign names are full of these.
        XCTExpectDefect(romaji("ウィリアム"), shouldBe: "wiriamu", "uiriamu")
        XCTExpectDefect(romaji("ウェンディ"), shouldBe: "wendi", "uendi")
        XCTExpectDefect(romaji("ウォーカー"), shouldBe: "wookaa", "uookaa")
        XCTExpectDefect(romaji("ヴィクトリア"), shouldBe: "vikutoria", "bikutoria")
        XCTExpectDefect(romaji("ヴァイオリン"), shouldBe: "vaiorin", "baiorin")
        XCTExpectDefect(romaji("デューク"), shouldBe: "dyuuku")
    }

    // MARK: - ん

    func testNBeforeAVowelOrYIsMarkedWithAnApostropheAndNowhereElse() {
        XCTAssertEqual(romaji("禁煙"), "kin'en")
        XCTAssertEqual(romaji("原因"), "gen'in")
        XCTAssertEqual(romaji("全員"), "zen'in")
        XCTAssertEqual(romaji("恋愛"), "ren'ai")
        XCTAssertEqual(romaji("本屋"), "hon'ya")
        XCTAssertEqual(romaji("今夜"), "kon'ya")
        // No apostrophe before a consonant, including another n
        XCTAssertEqual(romaji("案内"), "annai")
        XCTAssertEqual(romaji("みんな"), "minna")
        XCTAssertEqual(romaji("女"), "onna")
        XCTAssertEqual(romaji("反応"), "hannou")
        XCTAssertEqual(romaji("散歩"), "sanpo")
        XCTAssertEqual(romaji("新聞"), "shinbun")
        XCTAssertEqual(romaji("新幹線"), "shinkansen")
        XCTAssertEqual(romaji("乾杯"), "kanpai")
    }

    // MARK: - Verb endings and word spacing

    func testPoliteEndingsAttachToTheVerb() {
        XCTAssertEqual(romaji("行きます"), "ikimasu")
        XCTAssertEqual(romaji("行きました"), "ikimashita")
        XCTAssertEqual(romaji("食べません"), "tabemasen")
        XCTAssertEqual(romaji("わかりません"), "wakarimasen")
        XCTAssertEqual(romaji("英語を話せますか"), "eigo o hanasemasu ka")
        XCTAssertEqual(romaji("会いましょう"), "aimashou")
    }

    func testPlainEndingsAndAuxiliariesAttachToTheVerb() {
        XCTAssertEqual(romaji("食べて"), "tabete")
        XCTAssertEqual(romaji("食べた"), "tabeta")
        XCTAssertEqual(romaji("飲んで"), "nonde")
        XCTAssertEqual(romaji("飲んだ"), "nonda")
        XCTAssertEqual(romaji("行けば"), "ikeba")
        XCTAssertEqual(romaji("食べたり飲んだり"), "tabetari nondari")
        // たい, ない and the volitional
        XCTAssertEqual(romaji("食べたい"), "tabetai")
        XCTAssertEqual(romaji("食べない"), "tabenai")
        XCTAssertEqual(romaji("行きたくない"), "ikitakunai")
        XCTAssertEqual(romaji("行こう"), "ikou")
        XCTAssertEqual(romaji("食べよう"), "tabeyou")
    }

    /// Only hiragana endings are attached. A conjunction written in kanji that follows a verb
    /// is a word of its own.
    func testAWordInKanjiAfterAVerbIsNotAttached() {
        XCTAssertEqual(romaji("食べる及び飲む"), "taberu oyobi nomu")
    }

    func testProgressiveIsWrittenAsTwoWords() {
        XCTAssertEqual(romaji("食べている"), "tabete iru")
        XCTAssertEqual(romaji("読んでいる"), "yonde iru")
        XCTAssertEqual(romaji("彼女は東京に住んでいます。"), "kanojo wa toukyou ni sunde imasu.")
    }

    func testWordsInASentenceAreSeparatedBySingleSpaces() {
        XCTAssertEqual(romaji("私の名前はジョンです。"), "watashi no namae wa jon desu.")
        XCTAssertEqual(romaji("私は日本語を勉強しています。"), "watashi wa nihongo o benkyou shite imasu.")
        XCTAssertEqual(romaji("トイレはどこですか"), "toire wa doko desu ka")
        XCTAssertEqual(romaji("よろしくお願いします"), "yoroshiku onegai shimasu")
    }

    func testPoliteCopulaPastAndGozaimasuAreSingleWords() {
        // DEFECT: an auxiliary is only attached to the token before it when that token is a
        // verb, so でし + た, でしょ + う and ござい + ます are split: 学生でした comes out as
        // "gakusei deshi ta", そうでしょう as "sou desho u" and ありがとうございます as
        // "arigatou gozai masu".
        XCTExpectDefect(romaji("学生でした"), shouldBe: "gakusei deshita")
        XCTExpectDefect(romaji("どうでしたか"), shouldBe: "dou deshita ka")
        XCTExpectDefect(romaji("そうでしょう"), shouldBe: "sou deshou")
        XCTExpectDefect(romaji("明日は雨でしょう"), shouldBe: "ashita wa ame deshou")
        XCTExpectDefect(romaji("ありがとうございます"), shouldBe: "arigatou gozaimasu")
        XCTExpectDefect(romaji("おはようございます"), shouldBe: "ohayou gozaimasu")
        XCTExpectDefect(romaji("ありがとうございました"), shouldBe: "arigatou gozaimashita")
        XCTExpectDefect(romaji("申し訳ございません"), shouldBe: "moushiwake gozaimasen")
    }

    func testCopulaAfterAVerbEndingIsASeparateWord() {
        // DEFECT: the opposite mistake. Once a verb has an ending attached, every hiragana
        // auxiliary after it is attached too, including the copula, which is a word of its
        // own: 食べたいです comes out as "tabetaidesu", 行くだろう as "ikudarou" and
        // わかりませんでした as "wakarimasendeshita".
        XCTExpectDefect(romaji("食べたいです"), shouldBe: "tabetai desu")
        XCTExpectDefect(romaji("何を食べたいですか？"), shouldBe: "nani o tabetai desu ka?")
        XCTExpectDefect(romaji("行かないです"), shouldBe: "ikanai desu")
        XCTExpectDefect(romaji("行くでしょう"), shouldBe: "iku deshou")
        XCTExpectDefect(romaji("行くだろう"), shouldBe: "iku darou")
        XCTExpectDefect(romaji("わかりませんでした"), shouldBe: "wakarimasen deshita")
    }

    func testContractedProgressiveStaysOneWord() {
        // DEFECT: the casual てる (for ている) and ちゃった (for てしまった) are verbs of their
        // own to MeCab, so they are split off the verb they belong to: 食べてる comes out as
        // "tabe teru", 何してるの？ as "nani shi teru no?".
        XCTExpectDefect(romaji("食べてる"), shouldBe: "tabeteru")
        XCTExpectDefect(romaji("何してるの？"), shouldBe: "nani shiteru no?")
        XCTExpectDefect(romaji("雨が降ってる"), shouldBe: "ame ga futteru")
        XCTExpectDefect(romaji("食べちゃった"), shouldBe: "tabechatta")
    }

    func testHaInsideAWordThatEndsInTheParticle() {
        // DEFECT: は is only read "wa" when MeCab tags it as a particle. In では, それでは,
        // または, あるいは and 実は it is the last kana of a single token, so the kana
        // spelling leaks through: "deha", "soredeha", "mataha", "aruiha", "jitsuha".
        XCTExpectDefect(romaji("では"), shouldBe: "dewa")
        XCTExpectDefect(romaji("ではまた"), shouldBe: "dewa mata")
        XCTExpectDefect(romaji("それでは"), shouldBe: "soredewa", "sore dewa")
        XCTExpectDefect(romaji("または"), shouldBe: "matawa", "mata wa")
        XCTExpectDefect(romaji("あるいは"), shouldBe: "aruiwa")
        XCTExpectDefect(romaji("実は"), shouldBe: "jitsu wa", "jitsuwa")
        XCTExpectDefect(romaji("実は学生です"), shouldBe: "jitsu wa gakusei desu", "jitsuwa gakusei desu")
    }

    func testHaThatIsNotTheParticle() {
        // DEFECT: and the reverse. A は that MeCab cannot place is tagged as the particle, so
        // laughter and "huh?" are read "wa": ははは comes out as "wa wa wa", は？ as "wa?".
        XCTExpectDefect(romaji("ははは"), shouldBe: "hahaha", "ha ha ha")
        XCTExpectDefect(romaji("あはは"), shouldBe: "ahaha", "a ha ha")
        XCTExpectDefect(romaji("は？"), shouldBe: "ha?")
    }

    func testNaniBeforeDesuAndNoIsReadNan() {
        // DEFECT: 何 is read なん before です, の, と and a counter, and なに elsewhere. MeCab
        // gets the counters right (何時, 何人, 何歳) but gives なに before です and の:
        // これは何ですか comes out as "kore wa nani desu ka".
        XCTExpectDefect(romaji("これは何ですか？"), shouldBe: "kore wa nan desu ka?")
        XCTExpectDefect(romaji("仕事は何ですか？"), shouldBe: "shigoto wa nan desu ka?")
        XCTExpectDefect(romaji("何の本ですか"), shouldBe: "nan no hon desu ka")
        XCTExpectDefect(romaji("何曜日ですか"), shouldBe: "nan'youbi desu ka", "nan youbi desu ka", "nanyoubi desu ka")
    }

    func testEverydayWordsThatMeCabSplits() {
        // DEFECT: a word that is not in the dictionary in the spelling used is cut into
        // pieces, and the pieces are read on their own. 初めまして (the spelling the keyboard
        // offers first) comes out as "hajime mashite", and じゃあまたね is cut into じゃ + あまた
        // + ね: "ja amata ne". そうですね is one dictionary entry and gets no spaces at all.
        XCTExpectDefect(romaji("初めまして"), shouldBe: "hajimemashite")
        XCTExpectDefect(romaji("初めまして、ジョンです。"), shouldBe: "hajimemashite, jon desu.")
        XCTExpectDefect(romaji("じゃあまたね"), shouldBe: "jaa mata ne")
        XCTExpectDefect(romaji("そうですね"), shouldBe: "sou desu ne")
    }

    func testNounSuffixesAttachToTheirNoun() {
        // DEFECT: a suffix is a token of its own and so becomes a word of its own:
        // 誕生日 comes out as "tanjou bi", 私たち as "watashi tachi", アメリカ人 as
        // "amerika jin". (さん after a name is rightly kept apart, see the names test.)
        XCTExpectDefect(romaji("誕生日"), shouldBe: "tanjoubi")
        XCTExpectDefect(romaji("私たち"), shouldBe: "watashitachi")
        XCTExpectDefect(romaji("アメリカ人"), shouldBe: "amerikajin")
        XCTExpectDefect(romaji("マイケルさんはアメリカ人です。"), shouldBe: "maikeru san wa amerikajin desu.")
    }

    func testHonorificPrefixAttachesToItsNoun() {
        // DEFECT: (a matter of style, lower confidence) the same for the prefixes お and ご.
        // Words the dictionary has whole are joined (お茶 "ocha", お金 "okane", ご飯 "gohan");
        // the rest get a space: お名前 comes out as "o namae", お元気ですか as "o genki desu ka".
        // The usual spellings are joined or hyphenated.
        XCTExpectDefect(romaji("お名前"), shouldBe: "onamae", "o-namae")
        XCTExpectDefect(romaji("お元気ですか"), shouldBe: "ogenki desu ka", "o-genki desu ka")
        XCTExpectDefect(romaji("お寿司が好きです。"), shouldBe: "osushi ga suki desu.", "o-sushi ga suki desu.")
    }

    func testNihonIsTheEverydayReadingOfJapan() {
        // DEFECT: (lower confidence) 日本 has two correct readings. The dictionary gives
        // ニッポン, the formal one, for 日本 and 日本人, and ニホン for 日本語. In conversation
        // it is "nihon" and "nihonjin"; at the least the three should agree.
        XCTExpectDefect(romaji("日本"), shouldBe: "nihon")
        XCTExpectDefect(romaji("日本に行きたい"), shouldBe: "nihon ni ikitai")
        XCTExpectDefect(romaji("日本人です"), shouldBe: "nihonjin desu")
    }

    // MARK: - Punctuation and whitespace

    func testJapanesePunctuationBecomesASCIIAndStaysAttached() {
        XCTAssertEqual(romaji("こんにちは、元気ですか？"), "konnichiwa, genki desu ka?")
        XCTAssertEqual(romaji("今日はいい天気ですね。"), "kyou wa ii tenki desu ne.")
        XCTAssertEqual(romaji("東京：大阪"), "toukyou: oosaka")
        XCTAssertEqual(romaji("すごい！！"), "sugoi!!")
        XCTAssertEqual(romaji("え？"), "e?")
        XCTAssertEqual(romaji("行きます。でも、食べません。"), "ikimasu. demo, tabemasen.")
        // Punctuation with no word next to it
        XCTAssertEqual(romaji("！？"), "!?")
        XCTAssertEqual(romaji("。"), ".")
        XCTAssertEqual(romaji("、"), ",")
        XCTAssertEqual(romaji("～"), "~")
        XCTAssertEqual(romaji("ー"), "-")
        XCTAssertEqual(romaji("…"), "…")
    }

    func testQuotesAndParenthesesBecomeASCII() {
        XCTAssertEqual(romaji("「"), "\"")
        XCTAssertEqual(romaji("」"), "\"")
        XCTAssertEqual(romaji("『"), "\"")
        XCTAssertEqual(romaji("』"), "\"")
        XCTAssertEqual(romaji("（"), "(")
        XCTAssertEqual(romaji("）"), ")")
        // A closing quote or parenthesis stays on the word before it.
        XCTAssertEqual(romaji("東京」"), "toukyou\"")
        XCTAssertEqual(romaji("東京）"), "toukyou)")
    }

    func testSpacesBecomeOneSpaceAndLineBreaksAreKept() {
        XCTAssertEqual(romaji("日本語　英語"), "nihongo eigo")
        XCTAssertEqual(romaji("日本語 英語"), "nihongo eigo")
        XCTAssertEqual(romaji("はい、 そうです"), "hai, sou desu")
        XCTAssertEqual(romaji("こんにちは。 元気？"), "konnichiwa. genki?")
        // Line breaks are kept
        XCTAssertEqual(romaji("こんにちは\n元気？"), "konnichiwa\ngenki?")
        XCTAssertEqual(romaji("行きます。\n食べます。"), "ikimasu.\ntabemasu.")
    }

    /// Whatever follows the last word (a line break, a space) is kept, not dropped.
    func testTextAfterTheLastWordIsKept() {
        XCTAssertEqual(romaji("東京\n"), "toukyou\n")
        XCTAssertEqual(romaji("行きます。\n"), "ikimasu.\n")
        XCTAssertEqual(romaji("行きます "), "ikimasu ")
        XCTAssertEqual(romaji("食べます　"), "tabemasu ")
    }

    func testASCIIPunctuationAfterJapaneseStaysAttached() {
        // DEFECT: MeCab tags ASCII punctuation as a noun, not as a symbol, so the service puts
        // a space in front of it: 元気? comes out as "genki ?". People type ASCII ? and ! after
        // Japanese all the time, and a price with a thousands separator comes apart:
        // 1,000円 is "1 , 000 en".
        XCTExpectDefect(romaji("元気?"), shouldBe: "genki?")
        XCTExpectDefect(romaji("こんにちは!"), shouldBe: "konnichiwa!")
        XCTExpectDefect(romaji("学生です."), shouldBe: "gakusei desu.")
        XCTExpectDefect(romaji("1,000円"), shouldBe: "1,000 en")
        XCTExpectDefect(romaji("2,500円です。"), shouldBe: "2,500 en desu.")
    }

    func testOpeningQuoteHugsTheNextWord() {
        // DEFECT: a symbol is attached to the word before it but the word after it is still
        // separated, so an opening quote or parenthesis is followed by a space: 「はい」 comes
        // out as "\" hai\"" and （はい） as "( hai)".
        XCTExpectDefect(romaji("「はい」"), shouldBe: "\"hai\"")
        XCTExpectDefect(romaji("「はい」と言いました"), shouldBe: "\"hai\" to iimashita")
        XCTExpectDefect(romaji("（はい）"), shouldBe: "(hai)")
        XCTExpectDefect(romaji("（東京）"), shouldBe: "(toukyou)")
    }

    func testMiddleDotBetweenTheWordsOfAName() {
        // DEFECT: foreign full names are written with a middle dot, ジョン・スミス. The dot is
        // not in the punctuation table, so it stays in the romaji, with a space after it only:
        // "jon・ sumisu".
        XCTExpectDefect(romaji("ジョン・スミス"), shouldBe: "jon sumisu", "jon-sumisu")
        let sentence = romaji("ジョン・スミスさんはカナダから来ました。")
        XCTExpectDefect(
            fixedWhen: sentence.unicodeScalars.allSatisfy { $0.isASCII },
            "the middle dot is still in the romaji: \(sentence)"
        )
    }

    func testLongVowelMarkAfterHiragana() {
        // DEFECT: ー after hiragana, the way people stretch a word in chat. MeCab makes the ー
        // (and what follows it) a token of its own, and a ー on its own becomes a hyphen with
        // spaces around it: すごーい comes out as "sugo - i", ありがとー as "arigato -".
        // (Stretched words that are in the dictionary are fine: えー "ee", うーん "uun".)
        XCTExpectDefect(romaji("すごーい"), shouldBe: "sugooi")
        XCTExpectDefect(romaji("ありがとー"), shouldBe: "arigatoo")
        XCTExpectDefect(romaji("よろしくー"), shouldBe: "yoroshikuu")
    }

    // MARK: - Mixed scripts and non-Japanese text

    func testLatinWordsDigitsAndEmojiInsideJapanesePassThrough() {
        XCTAssertEqual(romaji("私はJohnです"), "watashi wa John desu")
        XCTAssertEqual(romaji("iPhoneを買いました"), "iPhone o kaimashita")
        XCTAssertEqual(romaji("Johnさん"), "John san")
        // Digits
        XCTAssertEqual(romaji("100円"), "100 en")
        XCTAssertEqual(romaji("今は3時です"), "ima wa 3 ji desu")
        XCTAssertEqual(romaji("3時に会いましょう"), "3 ji ni aimashou")
        // Emoji
        XCTAssertEqual(romaji("😀"), "😀")
        XCTAssertEqual(romaji("楽しい😀"), "tanoshii😀")
    }

    func testPlainLatinWordsAreUnchanged() {
        XCTAssertEqual(romaji("Hello"), "Hello")
        XCTAssertEqual(romaji("OK"), "OK")
        XCTAssertEqual(romaji("wwww"), "wwww")
    }

    func testEmptyAndBlankInput() {
        XCTAssertEqual(romaji(""), "")
        XCTAssertEqual(romaji(" "), " ")
        XCTAssertEqual(romaji("　"), " ")
        XCTAssertEqual(romaji("\n"), "\n")
    }

    func testNonJapaneseTextIsLeftExactlyAsItWas() {
        // DEFECT: the same ASCII punctuation problem takes apart text that has no Japanese in
        // it at all: "Hello, world!" comes out as "Hello , world !", 10:30 as "10 : 30" and a
        // link as "http :// example . com".
        XCTExpectDefect(romaji("Hello, world!"), shouldBe: "Hello, world!")
        XCTExpectDefect(romaji("10:30"), shouldBe: "10:30")
        XCTExpectDefect(romaji("3.14"), shouldBe: "3.14")
        XCTExpectDefect(romaji("http://example.com"), shouldBe: "http://example.com")
        XCTExpectDefect(romaji("@john こんにちは"), shouldBe: "@john konnichiwa")
    }

    func testCountersAfterNumbersUseTheirSpokenReading() {
        // DEFECT: MeCab reads a number and its counter as two unrelated words, so each gets
        // its stand-alone reading and the sound changes of counting are lost: 二人 comes out as
        // "ni nin", 10月 as "10 tsuki", 九時 as "kyuu ji", 三百円 as "san hyaku en".
        XCTExpectDefect(romaji("一人"), shouldBe: "hitori")
        XCTExpectDefect(romaji("二人で行きます"), shouldBe: "futari de ikimasu")
        XCTExpectDefect(romaji("2人"), shouldBe: "futari")
        XCTExpectDefect(romaji("10月"), shouldBe: "10 gatsu", "10gatsu", "juugatsu")
        XCTExpectDefect(romaji("四時"), shouldBe: "yoji", "yo ji")
        XCTExpectDefect(romaji("九時"), shouldBe: "kuji", "ku ji")
        XCTExpectDefect(romaji("10分"), shouldBe: "10 pun", "10pun", "juppun", "jippun")
        XCTExpectDefect(romaji("三百円"), shouldBe: "sanbyaku en", "sanbyakuen")
        XCTExpectDefect(romaji("もう一回"), shouldBe: "mou ikkai")
        XCTExpectDefect(romaji("二十歳"), shouldBe: "hatachi", "nijussai", "nijissai")
    }

    func testFullWidthDigitsAreReadAsOneNumber() {
        // DEFECT: a number typed in full-width digits is read digit by digit:
        // １０時です comes out as "ichi zero ji desu", １０００円 as "ichi zero zero zero en".
        // (A single full-width digit is fine: ３時 is "san ji".)
        XCTExpectDefect(romaji("１０時です"), shouldBe: "10 ji desu", "juu ji desu", "juuji desu")
        XCTExpectDefect(romaji("１０００円"), shouldBe: "1000 en", "sen en")
    }

    func testWordsTypedInHiraganaStayWhole() {
        // DEFECT: IPADic often has no entry for a word spelled only in hiragana, MeCab then
        // cuts it into fragments, and each fragment becomes its own "word": ひらがな comes out
        // as "hi ra ga na" and とうきょう as "tou kyou".
        XCTExpectDefect(romaji("ひらがな"), shouldBe: "hiragana")
        XCTExpectDefect(romaji("とうきょう"), shouldBe: "toukyou")
    }

    // MARK: - A conversation with a visitor
    //
    // Sentences a host really types or dictates, and the casual Japanese the casualizer makes
    // of a translation. The ones the service gets wrong are in the DEFECT tests above.

    func testConversation_greetings() {
        XCTAssertEqual(romaji("おはよう"), "ohayou")
        XCTAssertEqual(romaji("はじめまして"), "hajimemashite")
        XCTAssertEqual(romaji("はじめまして、ジョンです。"), "hajimemashite, jon desu.")
        XCTAssertEqual(romaji("さようなら"), "sayounara")
        XCTAssertEqual(romaji("おやすみなさい"), "oyasuminasai")
        XCTAssertEqual(romaji("またね"), "mata ne")
        XCTAssertEqual(romaji("じゃあね"), "jaa ne")
        XCTAssertEqual(romaji("また明日"), "mata ashita")
        XCTAssertEqual(romaji("ただいま"), "tadaima")
        XCTAssertEqual(romaji("おめでとう"), "omedetou")
    }

    func testConversation_thanksAndApologies() {
        XCTAssertEqual(romaji("ありがとう"), "arigatou")
        XCTAssertEqual(romaji("どうもありがとう"), "doumo arigatou")
        XCTAssertOneOf(romaji("どういたしまして"), ["douitashimashite", "dou itashimashite"])
        XCTAssertEqual(romaji("すみません"), "sumimasen")
        XCTAssertOneOf(romaji("ごめんなさい"), ["gomennasai", "gomen nasai"])
        XCTAssertEqual(romaji("ごめんね"), "gomen ne")
        XCTAssertEqual(romaji("あの、すみません"), "ano, sumimasen")
        XCTAssertEqual(romaji("すみません、英語は話せますか？"), "sumimasen, eigo wa hanasemasu ka?")
        XCTAssertEqual(romaji("大丈夫です"), "daijoubu desu")
    }

    func testConversation_questions() {
        XCTAssertEqual(romaji("元気ですか？"), "genki desu ka?")
        XCTAssertEqual(romaji("トイレはどこですか？"), "toire wa doko desu ka?")
        XCTAssertEqual(romaji("駅はどこですか？"), "eki wa doko desu ka?")
        XCTAssertEqual(romaji("どこから来ましたか？"), "doko kara kimashita ka?")
        XCTAssertEqual(romaji("日本語を話せますか？"), "nihongo o hanasemasu ka?")
        XCTAssertEqual(romaji("何が好きですか？"), "nani ga suki desu ka?")
        XCTAssertEqual(romaji("一緒に行きませんか？"), "issho ni ikimasen ka?")
        XCTAssertEqual(romaji("どこに住んでいますか？"), "doko ni sunde imasu ka?")
    }

    func testConversation_requests() {
        XCTAssertEqual(romaji("ゆっくり話してください"), "yukkuri hanashite kudasai")
        XCTAssertEqual(romaji("教えてください"), "oshiete kudasai")
        XCTAssertEqual(romaji("見てください"), "mite kudasai")
        XCTAssertEqual(romaji("水をください"), "mizu o kudasai")
        XCTAssertEqual(romaji("メニューをください"), "menyuu o kudasai")
        XCTAssertEqual(romaji("これを二つください"), "kore o futatsu kudasai")
        XCTAssertOneOf(romaji("もう一度お願いします"), ["mouichido onegai shimasu", "mou ichido onegai shimasu"])
        XCTAssertEqual(romaji("写真を撮りましょう"), "shashin o torimashou")
    }

    func testConversation_timesAndPrices() {
        XCTAssertOneOf(romaji("今何時ですか？"), ["ima nan ji desu ka?", "ima nanji desu ka?"])
        XCTAssertEqual(romaji("今は午後3時です。"), "ima wa gogo 3 ji desu.")
        XCTAssertEqual(romaji("午前10時"), "gozen 10 ji")
        XCTAssertOneOf(romaji("7時半に会いましょう。"), ["7 jihan ni aimashou.", "7 ji han ni aimashou."])
        XCTAssertEqual(romaji("9時から5時まで働きます。"), "9 ji kara 5 ji made hatarakimasu.")
        XCTAssertEqual(romaji("1時間"), "1 jikan")
        XCTAssertEqual(romaji("これはいくらですか？"), "kore wa ikura desu ka?")
        XCTAssertEqual(romaji("1000円です。"), "1000 en desu.")
        XCTAssertEqual(romaji("千円です"), "sen en desu")
        XCTAssertOneOf(romaji("一万円"), ["ichi man en", "ichiman en"])
        XCTAssertEqual(romaji("全部で3000円になります。"), "zenbu de 3000 en ni narimasu.")
    }

    func testConversation_namesInKatakana() {
        XCTAssertEqual(romaji("マイケル"), "maikeru")
        XCTAssertEqual(romaji("デイビッド"), "deibiddo")
        XCTAssertEqual(romaji("キャサリン"), "kyasarin")
        XCTAssertEqual(romaji("アンドリュー"), "andoryuu")
        XCTAssertEqual(romaji("エミリーです。"), "emirii desu.")
        XCTAssertEqual(romaji("ジョンさん"), "jon san")
        XCTAssertEqual(romaji("スミスさんはどこですか"), "sumisu san wa doko desu ka")
        XCTAssertEqual(romaji("カナダから来ました。"), "kanada kara kimashita.")
        XCTAssertEqual(romaji("ロンドン"), "rondon")
        XCTAssertEqual(romaji("ニューヨーク"), "nyuuyooku")
    }

    /// The forms the casualizer produces.
    func testConversation_casualForms() {
        XCTAssertEqual(romaji("学生だよ"), "gakusei da yo")
        XCTAssertEqual(romaji("そうだね"), "sou da ne")
        XCTAssertEqual(romaji("うん、元気だよ"), "un, genki da yo")
        XCTAssertEqual(romaji("大丈夫だよ"), "daijoubu da yo")
        XCTAssertEqual(romaji("駅はどこなの？"), "eki wa doko na no?")
        XCTAssertEqual(romaji("元気？"), "genki?")
        XCTAssertEqual(romaji("行くよ"), "iku yo")
        XCTAssertEqual(romaji("行くの？"), "iku no?")
        XCTAssertEqual(romaji("行かない"), "ikanai")
        XCTAssertEqual(romaji("カナダから来た。"), "kanada kara kita.")
        XCTAssertEqual(romaji("東京に住んでいる。"), "toukyou ni sunde iru.")
        XCTAssertEqual(romaji("水をちょうだい"), "mizu o choudai")
        XCTAssertEqual(romaji("食べてもいい？"), "tabete mo ii?")
    }

    // MARK: - The service as the app uses it

    /// The two services in the order the app runs them on a translation into Japanese:
    /// polite translation → casualizer → romaji.
    func testRomajiOfACasualizedTranslation() {
        let casualizer = MeCabCasualizer()
        func pipeline(_ polite: String) -> String {
            romaji(casualizer.casualify(polite))
        }
        XCTAssertEqual(pipeline("私の名前はジョンです。"), "watashi no namae wa jon da yo.")
        XCTAssertEqual(pipeline("カナダから来ました。"), "kanada kara kita.")
        XCTAssertEqual(pipeline("東京に住んでいます。"), "toukyou ni sunde iru.")
        XCTAssertEqual(pipeline("日本語が分かりません"), "nihongo ga wakaranai")
        XCTAssertEqual(pipeline("水をください"), "mizu o choudai")
        XCTAssertEqual(pipeline("今は午後3時です。"), "ima wa gogo 3 ji da yo.")
        XCTAssertEqual(pipeline("1000円です。"), "1000 en da yo.")
        XCTAssertOneOf(pipeline("駅はどこですか？"), ["eki wa doko na no?", "eki wa doko?"])
        // DEFECT: the casual past of a godan verb in う, つ or る (and of 行く) ends in った,
        // which is where the small-tsu defect above strikes: わかりました。 becomes わかった。
        // and then "waka~tsuta."
        XCTExpectDefect(pipeline("わかりました。"), shouldBe: "wakatta.")
        XCTExpectDefect(pipeline("京都に行きました"), shouldBe: "kyouto ni itta")
        XCTExpectDefect(pipeline("学生でした"), shouldBe: "gakusei datta")
    }

    func testProtocolMethodReturnsTheSameRomaji() async throws {
        let service: RomajiService = MeCabRomajiService.shared
        let result = try await service.transliterateJapaneseToRomaji(text: "私は学生です。")
        XCTAssertEqual(result, "watashi wa gakusei desu.")
    }

    /// The app transliterates several messages at once and MeCab taggers are not thread-safe.
    func testConcurrentCallsGiveTheSameAnswers() {
        let cases: [(String, String)] = [
            ("私は学生です。", "watashi wa gakusei desu."),
            ("東京へ行きます。", "toukyou e ikimasu."),
            ("コーヒー", "koohii"),
            ("こんにちは、元気ですか？", "konnichiwa, genki desu ka?"),
            ("本を読む", "hon o yomu"),
        ]
        let mismatches = MismatchLog()
        DispatchQueue.concurrentPerform(iterations: 400) { i in
            let (input, expected) = cases[i % cases.count]
            let result = MeCabRomajiService.shared.romaji(input)
            if result != expected {
                mismatches.add("\(input) became \(result)")
            }
        }
        XCTAssertEqual(mismatches.all, [])
    }
}
