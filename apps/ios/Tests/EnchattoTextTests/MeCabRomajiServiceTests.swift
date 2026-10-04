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

    /// MeCab splits 行って into 行っ + て. A reading that ends in ッ has no consonant to double
    /// on its own (CFStringTransform then writes its placeholder, "i~tsute"), so the service
    /// transliterates a word in one piece. This is the て and た form of every godan verb in
    /// う, つ and る and of 行く, and what the casualizer produces for ました (分かりました →
    /// 分かった).
    func testSmallTsuAtTheEndOfAVerbOrAdjectiveStem() {
        XCTAssertEqual(romaji("行って"), "itte")
        XCTAssertEqual(romaji("行った"), "itta")
        XCTAssertEqual(romaji("買った"), "katta")
        XCTAssertEqual(romaji("わかった"), "wakatta")
        XCTAssertEqual(romaji("分かった"), "wakatta")
        XCTAssertEqual(romaji("やった！"), "yatta!")
        XCTAssertEqual(romaji("頑張って"), "ganbatte")
        XCTAssertEqual(romaji("ちょっと待って"), "chotto matte")
        XCTAssertEqual(romaji("待ってください"), "matte kudasai")
        XCTAssertOneOf(romaji("もう一度言ってください"), ["mouichido itte kudasai", "mou ichido itte kudasai"])
        XCTAssertEqual(romaji("持っている"), "motte iru")
        XCTAssertEqual(romaji("雨が降っています"), "ame ga futte imasu")
        XCTAssertEqual(romaji("行ってきます"), "itte kimasu")
        XCTAssertEqual(romaji("京都に行った"), "kyouto ni itta")
        // The same in かった and だった (MeCab: 楽しかっ + た, だっ + た), the casual past tense
        // of every adjective and of だ
        XCTAssertEqual(romaji("だった"), "datta")
        XCTAssertEqual(romaji("学生だった"), "gakusei datta")
        XCTAssertEqual(romaji("楽しかった"), "tanoshikatta")
        XCTAssertEqual(romaji("よかった"), "yokatta")
        XCTAssertEqual(romaji("行かなかった"), "ikanakatta")
        // A word that the dictionary cuts after its small tsu
        XCTAssertEqual(romaji("そっか"), "sokka")
        XCTAssertEqual(romaji("がっこう"), "gakkou")
    }

    /// "~" is CFStringTransform's marker for a small kana it could not attach to anything. It
    /// must never reach the screen.
    func testOutputNeverContainsTheTransformPlaceholder() {
        let inputs = [
            "行って", "待って", "あった", "もう帰った", "彼は医者になった", "すごかったね", "がっこう",
            "えっ？", "あっ", "知ってる", "いってらっしゃい", "写真を撮ってもいいですか？",
            "ねぇ", "すげぇ", "うわぁ", "ちょっ", "わっ！", "ウィリアム", "ヴァイオリン", "クォーター",
            // A small vowel with ー after it
            "ねぇー", "えぇー", "はぁー", "うぇーい", "ねぇー、聞いて", "まぁーいいか", "すげぇー", "うわぁー",
        ]
        for input in inputs {
            let result = romaji(input)
            XCTAssertFalse(result.contains("~"), "\(input) became \(result)")
        }
    }

    /// A small tsu with nothing after it has no sound of its own; a small vowel lengthens the
    /// kana before it.
    func testSmallKanaAtTheEndOfAWord() {
        XCTAssertEqual(romaji("えっ？"), "e?")
        XCTAssertEqual(romaji("あっ"), "a")
        XCTAssertEqual(romaji("えっと"), "etto")
        XCTAssertEqual(romaji("ねぇ"), "nee")
        XCTAssertEqual(romaji("すげぇ"), "sugee")
        // Stretched further with ー
        XCTAssertEqual(romaji("ねぇー、聞いて"), "neee, kiite")
        XCTAssertEqual(romaji("えぇー！"), "eee!")
        XCTAssertEqual(romaji("はぁー疲れた"), "haaa tsukareta")
    }

    func testSmallTsuBeforeALongVowelMark() {
        // DEFECT: a small tsu with ー after it is spelled out as a syllable of its own, "tsu":
        // えっー！ comes out as "etsuu!". The small tsu has no sound there; the ー stretches the え.
        XCTExpectDefect(romaji("えっー！"), shouldBe: "ee!", "e!")
        XCTExpectDefect(romaji("あっー"), shouldBe: "aa", "a")
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

    /// For ウィ ウェ ウォ, ヴァ ヴィ and デュ (and トゥ, ドゥ, ツァ, クォ) CFStringTransform has
    /// no syllable (ウィリアム was "u~iriamu"); the service spells them out itself. Foreign
    /// names are full of these.
    func testKatakanaSyllablesTheTransformDoesNotKnow() {
        XCTAssertOneOf(romaji("ウィリアム"), ["wiriamu", "uiriamu"])
        XCTAssertOneOf(romaji("ウェンディ"), ["wendi", "uendi"])
        XCTAssertOneOf(romaji("ウォーカー"), ["wookaa", "uookaa"])
        XCTAssertOneOf(romaji("ヴィクトリア"), ["vikutoria", "bikutoria"])
        XCTAssertOneOf(romaji("ヴァイオリン"), ["vaiorin", "baiorin"])
        XCTAssertEqual(romaji("デューク"), "dyuuku")
        XCTAssertEqual(romaji("ウィスキー"), "wisukii")
        XCTAssertEqual(romaji("ウェブサイト"), "webusaito")
        XCTAssertEqual(romaji("トゥデイ"), "tudei")
        // With a long vowel mark straight after the syllable
        XCTAssertEqual(romaji("ツァー"), "tsaa")
        XCTAssertEqual(romaji("クォーター"), "kwootaa")
        XCTAssertEqual(romaji("ウィリアムさんはカナダ人です。"), "wiriamu san wa kanadajin desu.")
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

    /// でし + た, でしょ + う and ござい + ます are one word each, although none of them
    /// follows a verb.
    func testPoliteCopulaPastAndGozaimasuAreSingleWords() {
        XCTAssertEqual(romaji("学生でした"), "gakusei deshita")
        XCTAssertEqual(romaji("どうでしたか"), "dou deshita ka")
        XCTAssertEqual(romaji("そうでしょう"), "sou deshou")
        XCTAssertEqual(romaji("明日は雨でしょう"), "ashita wa ame deshou")
        XCTAssertEqual(romaji("ありがとうございます"), "arigatou gozaimasu")
        XCTAssertEqual(romaji("おはようございます"), "ohayou gozaimasu")
        XCTAssertEqual(romaji("ありがとうございました"), "arigatou gozaimashita")
        XCTAssertEqual(romaji("申し訳ございません"), "moushiwake gozaimasen")
        XCTAssertEqual(romaji("すみませんでした"), "sumimasen deshita")
        XCTAssertEqual(romaji("大変でしたね。"), "taihen deshita ne.")
        XCTAssertEqual(romaji("こちらでございます"), "kochira de gozaimasu")
    }

    /// The copula is a word of its own, also after a verb with its endings: "tabetai desu",
    /// not "tabetaidesu".
    func testCopulaAfterAVerbEndingIsASeparateWord() {
        XCTAssertEqual(romaji("食べたいです"), "tabetai desu")
        XCTAssertEqual(romaji("何を食べたいですか？"), "nani o tabetai desu ka?")
        XCTAssertEqual(romaji("行かないです"), "ikanai desu")
        XCTAssertEqual(romaji("行くでしょう"), "iku deshou")
        XCTAssertEqual(romaji("行くだろう"), "iku darou")
        XCTAssertEqual(romaji("行くなら"), "iku nara")
        XCTAssertEqual(romaji("わかりませんでした"), "wakarimasen deshita")
        // The だ after 飲ん is not the copula but the past tense
        XCTAssertEqual(romaji("飲んだら"), "nondara")
        XCTAssertEqual(romaji("飲んだだろう"), "nonda darou")
    }

    /// Only the endings of a verb are attached to it. A greeting or a conjunction that follows
    /// a て form without a comma is a word of its own.
    func testAWordAfterAVerbIsNotTakenForAnEnding() {
        XCTAssertEqual(romaji("遅れてすみません"), "okurete sumimasen")
        XCTAssertEqual(romaji("遅れてごめん"), "okurete gomen")
        XCTAssertEqual(romaji("手伝ってくれてありがとうございます。"), "tetsudatte kurete arigatou gozaimasu.")
        XCTAssertEqual(romaji("あけましておめでとうございます"), "akemashite omedetou gozaimasu")
        XCTAssertEqual(romaji("食べるそして飲む"), "taberu soshite nomu")
        XCTAssertEqual(romaji("行くらしい"), "iku rashii")
    }

    /// The endings of an い-adjective are attached to its stem like those of a verb.
    func testAdjectiveEndingsAttachToTheStem() {
        XCTAssertEqual(romaji("高くない"), "takakunai")
        XCTAssertEqual(romaji("高くて"), "takakute")
        XCTAssertEqual(romaji("安ければ買います"), "yasukereba kaimasu")
        XCTAssertEqual(romaji("寒くなかったです"), "samukunakatta desu")
        XCTAssertEqual(romaji("すごかったね"), "sugokatta ne")
    }

    /// The casual てる (for ている) and ちゃった (for てしまった) are verbs of their own to
    /// MeCab, and so are the passive and the causative. They are endings of the verb before
    /// them.
    func testContractedProgressiveStaysOneWord() {
        XCTAssertEqual(romaji("食べてる"), "tabeteru")
        XCTAssertEqual(romaji("何してるの？"), "nani shiteru no?")
        XCTAssertEqual(romaji("雨が降ってる"), "ame ga futteru")
        XCTAssertEqual(romaji("食べちゃった"), "tabechatta")
        XCTAssertEqual(romaji("飲んでる"), "nonderu")
        XCTAssertEqual(romaji("待ってて"), "mattete")
        XCTAssertEqual(romaji("見てた"), "miteta")
        XCTAssertEqual(romaji("買っとく"), "kattoku")
        XCTAssertEqual(romaji("読んじゃった"), "yonjatta")
        // でる as the verb 出る is a word of its own
        XCTAssertEqual(romaji("部屋をでる"), "heya o deru")
    }

    func testPassiveAndCausativeEndingsAttachToTheVerb() {
        XCTAssertEqual(romaji("食べられます"), "taberaremasu")
        XCTAssertEqual(romaji("これは食べられますか？"), "kore wa taberaremasu ka?")
        XCTAssertEqual(romaji("信じられません"), "shinjiraremasen")
    }

    /// In では, それでは, または, あるいは and 実は the particle は is the last kana of a single
    /// token. It is still read "wa".
    func testHaInsideAWordThatEndsInTheParticle() {
        XCTAssertEqual(romaji("では"), "dewa")
        XCTAssertEqual(romaji("ではまた"), "dewa mata")
        XCTAssertOneOf(romaji("それでは"), ["sore dewa", "soredewa"])
        XCTAssertOneOf(romaji("または"), ["mata wa", "matawa"])
        XCTAssertEqual(romaji("あるいは"), "aruiwa")
        XCTAssertOneOf(romaji("実は"), ["jitsu wa", "jitsuwa"])
        XCTAssertOneOf(romaji("実は学生です"), ["jitsu wa gakusei desu", "jitsuwa gakusei desu"])
        XCTAssertEqual(romaji("もしくは"), "moshikuwa")
        XCTAssertEqual(romaji("それでは、始めましょう。"), "sore dewa, hajimemashou.")
    }

    /// And the reverse. A は that MeCab cannot place is tagged as the particle, but は after no
    /// word, or next to another は, is laughter or "huh?".
    func testHaThatIsNotTheParticle() {
        XCTAssertOneOf(romaji("ははは"), ["hahaha", "ha ha ha"])
        XCTAssertOneOf(romaji("あはは"), ["ahaha", "a ha ha"])
        XCTAssertEqual(romaji("は？"), "ha?")
        XCTAssertEqual(romaji("ははは、うける"), "hahaha, ukeru")
        XCTAssertEqual(romaji("こんにちは\nは？"), "konnichiwa\nha?")
    }

    // Mecab-Swift finds the place of each token by searching the text for it. It cannot find the
    // 2 inside the keycap 2️⃣ or the ❤ inside ❤️, and places the token on the next bare copy of
    // that character: at the very end of the text in front of the tokens that follow it, and
    // anywhere else past every token between the two, which it then does not return.

    /// These used to end the process: the は test sliced the text from the misplaced token to
    /// the は "after" it ("Range requires lowerBound <= upperBound"). A trap cannot be caught,
    /// so the test for it is that the call returns.
    func testATokenPlacedAtTheEndOfTheTextDoesNotTrap() {
        let inputs = [
            "❤️は❤", "2️⃣は2", "1️⃣ は 1", "👨‍👩‍👧は👨", "好き❤️\nは？❤", "#️⃣は#",
            "1️⃣は寿司、2️⃣はラーメン。私は2", "1️⃣はカレー、2️⃣はラーメン。どっちがいい？私は2",
            "今日は☀️、明日は☀", "私は❤️が好き。あなたは❤", "❤️が好きです❤",
        ]
        for input in inputs {
            XCTAssertFalse(romaji(input).isEmpty, input)
        }
    }

    /// The misplaced token is left out, and nothing is written twice: this used to be
    /// "watashi wa❤️ga haoki.anataha❤ ga suki. anata wa ❤".
    func testTextAroundAnEmojiIsNotWrittenTwice() {
        // With or without the spaces around the emoji, which are a defect of their own
        // (testSpacesAroundAnEmojiWithoutAToken)
        XCTAssertOneOf(romaji("私は❤️が好き。あなたは❤"), [
            "watashi wa❤️ga suki. anata wa ❤", "watashi wa ❤️ga suki. anata wa ❤", "watashi wa ❤️ ga suki. anata wa ❤",
        ])
        XCTAssertOneOf(romaji("今日は☀️、明日は☀"), ["kyou wa☀️, ashita wa ☀", "kyou wa ☀️, ashita wa ☀"])
        let menu = romaji("1️⃣は寿司、2️⃣はラーメン。私は2")
        XCTAssertEqual(menu.components(separatedBy: "raamen").count, 2, menu)
        XCTAssertEqual(menu.components(separatedBy: "sushi").count, 2, menu)
        XCTAssertTrue(menu.hasSuffix("raamen. watashi wa 2"), menu)
    }

    /// The bare character in the middle of the text: the words between the emoji and it have no
    /// token of the first pass, and used to be read as Chinese
    /// ("1️⃣ ming riha10ji ni eki de aimashou", "2️⃣ 1futari de ikimasu").
    func testTextBetweenAnEmojiAndItsBareCharacterIsRead() {
        XCTAssertEqual(romaji("1️⃣ 明日は10時に駅で会いましょう"), "1️⃣ ashita wa 10 ji ni eki de aimashou")
        XCTAssertEqual(romaji("2️⃣ 昼ご飯は12時です"), "2️⃣ hiru gohan wa 12 ji desu")
        XCTAssertEqual(romaji("1️⃣ 寿司 2️⃣ ラーメン どっち？ 私は1がいい"), "1️⃣ sushi 2️⃣ raamen dotchi? watashi wa 1 ga ii")
        XCTAssertEqual(romaji("3️⃣ 夕食は19時からです。場所は3階です"), "3️⃣ yuushoku wa 19 ji kara desu. basho wa 3 kai desu")
        // The number the token landed on is read as one number
        XCTAssertEqual(romaji("2️⃣ 12人で行きます"), "2️⃣ 12 nin de ikimasu")
        XCTAssertEqual(romaji("1️⃣ 10月15日"), "1️⃣ 10 gatsu 15 nichi")
        XCTAssertEqual(romaji("1️⃣ 10分かかります"), "1️⃣ 10 pun kakarimasu")
        // Also a heart, a sun and a family
        XCTAssertTrue(romaji("❤️大好きです。本当に❤です").contains("daisuki desu."))
        XCTAssertTrue(romaji("☀️今日は晴れです。明日は☀かな").contains("kyou wa hare desu. ashita wa"))
        XCTAssertTrue(romaji("家族👨‍👩‍👧は元気です。お父さん👨も元気").contains("genki desu. otousan"))
    }

    /// は after an emoji is the particle, whether or not MeCab has a token for the emoji.
    func testTopicParticleAfterAnEmoji() {
        XCTAssertOneOf(romaji("❤️は好き"), ["❤️wa suki", "❤️ wa suki"])
        XCTAssertOneOf(romaji("❤️は❤"), ["❤️wa ❤", "❤️ wa ❤"])
        XCTAssertOneOf(romaji("2️⃣は2"), ["2️⃣wa 2", "2️⃣ wa 2"])
        XCTAssertEqual(romaji("1️⃣ は 1"), "1️⃣ wa 1")
        // After a line break it follows no word
        XCTAssertTrue(romaji("好き❤️\nは？❤").hasPrefix("suki❤️\nha"), romaji("好き❤️\nは？❤"))
        XCTAssertEqual(romaji("こんにちは\r\nは？"), "konnichiwa\r\nha?")
    }

    func testSpacesAroundAnEmojiWithoutAToken() {
        // DEFECT: (cosmetic) an emoji MeCab has no token for is text between two tokens, and the
        // word after it is written without its space: "1️⃣wa sushi,2️⃣wa raamen".
        XCTExpectDefect(
            romaji("1️⃣は寿司、2️⃣はラーメン"),
            shouldBe: "1️⃣ wa sushi, 2️⃣ wa raamen", "1️⃣wa sushi, 2️⃣wa raamen"
        )
        // DEFECT: (cosmetic) where a text is tokenized in its runs (`tokensInOrder`: the 1 of 1️⃣
        // comes again later), a character of several scalars that MeCab does have a token for
        // (👍🏻, 🇯🇵, the ｶﾞ of half-width katakana) is text between two tokens as well. On its own
        // the first sentence is "ii ne👍🏻 desu" and the second "watashi wa gakkou ni ikimasu."
        XCTExpectDefect(romaji("1️⃣ いいね👍🏻です 1番"), shouldBe: "1️⃣ ii ne👍🏻 desu 1 ban")
        XCTExpectDefect(
            romaji("1️⃣ 私はｶﾞｯｺｳに行きます。1時です"),
            shouldBe: "1️⃣ watashi wa gakkou ni ikimasu. 1 ji desu"
        )
        XCTAssertEqual(romaji("いいね👍🏻です"), "ii ne👍🏻 desu")
        XCTAssertEqual(romaji("私はｶﾞｯｺｳに行きます。"), "watashi wa gakkou ni ikimasu.")
    }

    /// `tokenize` looks for every token it cannot find through the whole rest of the text. A
    /// message full of characters whose tokens are never found is tokenized in its runs straight
    /// away: 2,000 letters that composition takes apart (क़ is given to MeCab as क + ़) took
    /// three seconds in each service.
    func testAMessageFullOfCharactersWithoutATokenIsQuick() {
        let letters = String(repeating: "\u{0958}", count: 2000)
        let presentationForms = String(repeating: "\u{FB2C}", count: 2000)
        let marks = "は" + String(repeating: "\u{301}", count: 1998) + "は"
        let started = Date()
        for text in [letters, presentationForms, marks] {
            XCTAssertEqual(text.utf16.count, 2000)
            XCTAssertFalse(romaji(text).isEmpty)
        }
        // A few hundredths of a second; it was nine seconds
        XCTAssertLessThan(Date().timeIntervalSince(started), 3)
        // A letter between such characters is still read
        XCTAssertTrue(romaji(String(repeating: "❤️", count: 300) + "明日は休みです").hasSuffix("ashita wa yasumi desu"))
        // With or without the spaces around the keycap, which are a defect of their own
        // (testSpacesAroundAnEmojiWithoutAToken)
        XCTAssertOneOf(romaji(String(repeating: "1️⃣明日は休みです。", count: 80)), [
            String(repeating: "1️⃣ashita wa yasumi desu.", count: 80),
            Array(repeating: "1️⃣ashita wa yasumi desu.", count: 80).joined(separator: " "),
            Array(repeating: "1️⃣ ashita wa yasumi desu.", count: 80).joined(separator: " "),
        ])
    }

    /// は after a word is the particle, also after a space, a comma or a closing quote.
    func testTopicParticleAfterASpaceOrAQuote() {
        XCTAssertEqual(romaji("わたし は ジョン です"), "watashi wa jon desu")
        XCTAssertEqual(romaji("「ありがとう」は英語で何ですか？"), "\"arigatou\" wa eigo de nan desu ka?")
        XCTAssertEqual(romaji("私は、はい"), "watashi wa, hai")
    }

    /// 何 is read なん before です, の, と, で and a counter, and なに elsewhere. MeCab gets the
    /// counters right (何人, 何歳) and gives なに for the rest.
    func testNaniBeforeDesuAndNoIsReadNan() {
        XCTAssertEqual(romaji("これは何ですか？"), "kore wa nan desu ka?")
        XCTAssertEqual(romaji("仕事は何ですか？"), "shigoto wa nan desu ka?")
        XCTAssertEqual(romaji("何の本ですか"), "nan no hon desu ka")
        XCTAssertOneOf(romaji("何曜日ですか"), ["nan youbi desu ka", "nan'youbi desu ka", "nanyoubi desu ka"])
        XCTAssertEqual(romaji("これは何なの？"), "kore wa nan na no?")
        XCTAssertEqual(romaji("何でもない"), "nan de mo nai")
        XCTAssertEqual(romaji("今日は何月何日ですか？"), "kyou wa nan gatsu nan nichi desu ka?")
        XCTAssertEqual(romaji("ここから駅まで歩いて何分ですか？"), "koko kara eki made aruite nan pun desu ka?")
        // MeCab has 何分 before a verb or a particle as one word, the adverb なにぶん
        XCTAssertEqual(romaji("何分かかりますか？"), "nan pun kakarimasu ka?")
        XCTAssertEqual(romaji("駅から何分かかりますか"), "eki kara nan pun kakarimasu ka")
        XCTAssertEqual(romaji("何分に出発しますか"), "nan pun ni shuppatsu shimasu ka")
        // なに stays where it is right
        XCTAssertEqual(romaji("何が好き？"), "nani ga suki?")
        XCTAssertEqual(romaji("何か"), "nani ka")
    }

    /// On its own or at the start of a sentence MeCab takes 何時 for an old spelling of いつ.
    func testNanjiAtTheStartOfASentence() {
        XCTAssertEqual(romaji("何時がいいですか？"), "nan ji ga ii desu ka?")
        XCTAssertEqual(romaji("何時まで"), "nan ji made")
    }

    func testNanibunTheAdverbWrittenInKanji() {
        // The formal adverb なにぶん ("please, in any case") keeps MeCab's reading in its set
        // phrases: 何分よろしく and 何分にも
        XCTAssertEqual(romaji("何分よろしくお願いします"), "nanibun yoroshiku onegai shimasu")
        XCTAssertEqual(romaji("何分、よろしくお願いします"), "nanibun, yoroshiku onegai shimasu")
        XCTAssertEqual(romaji("何分にも初めてなので"), "nanibun ni mo hajimete na node")
        XCTAssertEqual(romaji("何分に出発しますか"), "nan pun ni shuppatsu shimasu ka")
        XCTAssertEqual(romaji("何分も待ちました。"), "nan pun mo machimashita.")
        XCTAssertEqual(romaji("何分お待ちしますか？"), "nan pun omachi shimasu ka?")
        // DEFECT: anywhere else the adverb is still read as minutes
        XCTExpectDefect(romaji("何分、初めてなので。"), shouldBe: "nanibun, hajimete na node.")
        XCTAssertEqual(romaji("なにぶんよろしく"), "nanibun yoroshiku")
    }

    func testVerbThatEndsInKuBeforeNDesu() {
        // DEFECT: at the start of a sentence MeCab reads 歩く + ん as 歩 + くん, a name with the
        // suffix くん: "ayumi kun desu ka?".
        XCTExpectDefect(romaji("歩くんですか？"), shouldBe: "aruku n desu ka?")
    }

    /// A word that is not in the dictionary in the spelling used is cut into pieces: 初めまして
    /// (the spelling the keyboard offers first) into 初め + まして, じゃあまたね into じゃ +
    /// あまた + ね. そうですね is one dictionary entry and would get no spaces at all.
    func testEverydayWordsThatMeCabSplits() {
        XCTAssertEqual(romaji("初めまして"), "hajimemashite")
        XCTAssertEqual(romaji("初めまして、ジョンです。"), "hajimemashite, jon desu.")
        XCTAssertEqual(romaji("じゃあまたね"), "jaa mata ne")
        XCTAssertEqual(romaji("そうですね"), "sou desu ne")
        XCTAssertEqual(romaji("おはよー"), "ohayoo")
    }

    /// 笑 in a chat is "lol", read わら. The dictionary only has the name Emi.
    func testWaraInAChat() {
        XCTAssertEqual(romaji("笑"), "wara")
        XCTAssertEqual(romaji("（笑）"), "(wara)")
        XCTAssertEqual(romaji("すごい(笑)"), "sugoi (wara)")
    }

    /// 人 (じん), 日 (び) and たち make one word with the noun before them. さん after a name is
    /// kept apart (see the names test), and so is a counter after a number.
    func testNounSuffixesAttachToTheirNoun() {
        XCTAssertEqual(romaji("誕生日"), "tanjoubi")
        XCTAssertEqual(romaji("私たち"), "watashitachi")
        XCTAssertEqual(romaji("アメリカ人"), "amerikajin")
        XCTAssertEqual(romaji("マイケルさんはアメリカ人です。"), "maikeru san wa amerikajin desu.")
        XCTAssertEqual(romaji("フランス人の友達"), "furansujin no tomodachi")
        XCTAssertEqual(romaji("私たちは学生です"), "watashitachi wa gakusei desu")
        XCTAssertEqual(romaji("俺達"), "oretachi")
        // 人 with another reading is no suffix
        XCTAssertEqual(romaji("三人"), "san nin")
        XCTAssertEqual(romaji("あの人"), "ano hito")
        // たち as the verb 経つ ("three years have passed") is a word of its own
        XCTAssertEqual(romaji("3年たちました"), "3 nen tachimashita")
        XCTAssertEqual(romaji("もう10分たちました"), "mou 10 pun tachimashita")
        // DEFECT: where the verb is not followed by ます, MeCab itself tags it as the suffix.
        XCTExpectDefect(romaji("1年たち、2年たち"), shouldBe: "1 nen tachi, 2 nen tachi")
    }

    func testHonorificPrefixAttachesToItsNoun() {
        // DEFECT: (a matter of style, lower confidence) the prefixes お and ご are tokens of
        // their own and so become words of their own. Words the dictionary has whole are joined
        // (お茶 "ocha", お金 "okane", ご飯 "gohan"); the rest get a space: お名前 comes out as
        // "o namae", お元気ですか as "o genki desu ka". The usual spellings are joined or
        // hyphenated.
        XCTExpectDefect(romaji("お名前"), shouldBe: "onamae", "o-namae")
        XCTExpectDefect(romaji("お元気ですか"), shouldBe: "ogenki desu ka", "o-genki desu ka")
        XCTExpectDefect(romaji("お寿司が好きです。"), shouldBe: "osushi ga suki desu.", "o-sushi ga suki desu.")
    }

    func testJaArimasenIsWrittenAsItsWords() {
        // DEFECT: after じゃ MeCab does not tag the あり of ありません as a verb, so its endings
        // are not attached to it: じゃありません comes out as "ja ari mase n". (ではありません is
        // right: "de wa arimasen".) The casualizer leaves じゃありません and じゃありませんでした
        // as they are, so this is what the guest reads under them.
        XCTExpectDefect(romaji("学生じゃありません"), shouldBe: "gakusei ja arimasen")
        XCTExpectDefect(romaji("学生じゃありませんでした"), shouldBe: "gakusei ja arimasen deshita")
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

    /// MeCab tags ASCII punctuation as a noun, not as a symbol. People type ASCII ? and ! after
    /// Japanese all the time, and a price has a thousands separator.
    func testASCIIPunctuationAfterJapaneseStaysAttached() {
        XCTAssertEqual(romaji("元気?"), "genki?")
        XCTAssertEqual(romaji("こんにちは!"), "konnichiwa!")
        XCTAssertEqual(romaji("学生です."), "gakusei desu.")
        XCTAssertEqual(romaji("1,000円"), "1,000 en")
        XCTAssertEqual(romaji("2,500円です。"), "2,500 en desu.")
        XCTAssertEqual(romaji("すごい!!"), "sugoi!!")
        // The next word still starts after a space
        XCTAssertEqual(romaji("え?本当?"), "e? hontou?")
        XCTAssertEqual(romaji("A: こんにちは"), "A: konnichiwa")
    }

    /// An opening quote or parenthesis belongs to the word after it, a closing one to the word
    /// before it.
    func testOpeningQuoteHugsTheNextWord() {
        XCTAssertEqual(romaji("「はい」"), "\"hai\"")
        XCTAssertEqual(romaji("「はい」と言いました"), "\"hai\" to iimashita")
        XCTAssertEqual(romaji("（はい）"), "(hai)")
        XCTAssertEqual(romaji("（東京）"), "(toukyou)")
        XCTAssertEqual(romaji("「（はい）」"), "\"(hai)\"")
        XCTAssertEqual(romaji("東京（トウキョウ）"), "toukyou (toukyou)")
        // A straight quote opens every other time
        XCTAssertEqual(romaji("\"はい\"と言った"), "\"hai\" to itta")
        XCTAssertEqual(romaji("これは\"ペン\"です"), "kore wa \"pen\" desu")
    }

    /// # and @ start a word (a hashtag, a mention), except inside Latin text.
    func testHashAndAtSignStartAWord() {
        XCTAssertEqual(romaji("#日本語"), "#nihongo")
        XCTAssertEqual(romaji("彼は@johnです"), "kare wa @john desu")
        XCTAssertEqual(romaji("C#は難しい"), "C# wa muzukashii")
        XCTAssertEqual(romaji("john@example.com"), "john@example.com")
    }

    /// Foreign full names are written with a middle dot, ジョン・スミス. In romaji it is a
    /// space. A row of dots is an ellipsis.
    func testMiddleDotBetweenTheWordsOfAName() {
        XCTAssertOneOf(romaji("ジョン・スミス"), ["jon sumisu", "jon-sumisu"])
        let sentence = romaji("ジョン・スミスさんはカナダから来ました。")
        XCTAssertEqual(sentence, "jon sumisu san wa kanada kara kimashita.")
        XCTAssertTrue(sentence.unicodeScalars.allSatisfy { $0.isASCII })
        XCTAssertEqual(romaji("はい・いいえ"), "hai iie")
        XCTAssertEqual(romaji("えっと・・・"), "etto...")
        XCTAssertEqual(romaji("A・B"), "A B")
    }

    /// A middle dot with no word on one side of it is a bullet or a stray mark. It is dropped,
    /// and leaves no space behind at the start or the end of a line.
    func testMiddleDotAsABulletLeavesNoSpace() {
        XCTAssertEqual(romaji("・りんご\n・みかん\n・バナナ"), "ringo\nmikan\nbanana")
        XCTAssertEqual(romaji("買い物リスト：\n・牛乳\n・卵"), "kaimono risuto:\ngyuunyuu\ntamago")
        XCTAssertEqual(romaji("はい・"), "hai")
        XCTAssertEqual(romaji("りんご・\nみかん"), "ringo\nmikan")
        // DEFECT: the space typed after a bullet is kept, at the start of the line.
        XCTExpectDefect(romaji("・ りんご"), shouldBe: "ringo")
    }

    /// ー after hiragana, the way people stretch a word in chat. MeCab makes the ー (and what
    /// follows it) a token of its own; it lengthens the word before it all the same.
    /// (Stretched words that are in the dictionary: えー "ee", うーん "uun".)
    func testLongVowelMarkAfterHiragana() {
        XCTAssertEqual(romaji("すごーい"), "sugooi")
        XCTAssertEqual(romaji("ありがとー"), "arigatoo")
        XCTAssertEqual(romaji("よろしくー"), "yoroshikuu")
        XCTAssertEqual(romaji("やったー"), "yattaa")
        // One vowel more for every mark
        XCTAssertEqual(romaji("やったーー"), "yattaaa")
        XCTAssertEqual(romaji("すごーーい"), "sugoooi")
        XCTAssertEqual(romaji("えーーー"), "eeee")
        XCTAssertEqual(romaji("こんにちはー"), "konnichiwaa")
        XCTAssertEqual(romaji("マジかー"), "maji kaa")
        // The wave dash people end a word with stays a mark
        XCTAssertEqual(romaji("かわいい〜"), "kawaii~")
        XCTAssertEqual(romaji("そうだね～"), "sou da ne~")
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

    /// Text with no Japanese in it comes back as it was, punctuation and all.
    func testNonJapaneseTextIsLeftExactlyAsItWas() {
        XCTAssertEqual(romaji("Hello, world!"), "Hello, world!")
        XCTAssertEqual(romaji("10:30"), "10:30")
        XCTAssertEqual(romaji("3.14"), "3.14")
        XCTAssertEqual(romaji("http://example.com"), "http://example.com")
        XCTAssertEqual(romaji("@john こんにちは"), "@john konnichiwa")
        XCTAssertEqual(romaji("I'm from Canada."), "I'm from Canada.")
        XCTAssertEqual(romaji("100%"), "100%")
    }

    /// Latin text inside a Japanese sentence keeps its own punctuation too.
    func testLatinTextInsideJapaneseKeepsItsPunctuation() {
        XCTAssertEqual(romaji("Wi-Fiはありますか？"), "Wi-Fi wa arimasu ka?")
        XCTAssertEqual(romaji("https://example.com を見てください"), "https://example.com o mite kudasai")
        XCTAssertEqual(romaji("電話番号は090-1234-5678です"), "denwa bangou wa 090-1234-5678 desu")
        XCTAssertEqual(romaji("john@example.com にメールしてください"), "john@example.com ni meeru shite kudasai")
    }

    /// MeCab reads a number and its counter as two unrelated words, each with its stand-alone
    /// reading (二人 as "ni nin", 10月 as "10 tsuki"). The service knows the common pairs whose
    /// sound changes.
    func testCountersAfterNumbersUseTheirSpokenReading() {
        XCTAssertEqual(romaji("一人"), "hitori")
        XCTAssertEqual(romaji("二人で行きます"), "futari de ikimasu")
        XCTAssertEqual(romaji("2人"), "futari")
        XCTAssertOneOf(romaji("10月"), ["10 gatsu", "10gatsu", "juugatsu"])
        XCTAssertOneOf(romaji("四時"), ["yoji", "yo ji"])
        XCTAssertOneOf(romaji("九時"), ["kuji", "ku ji"])
        XCTAssertOneOf(romaji("10分"), ["10 pun", "10pun", "juppun", "jippun"])
        XCTAssertOneOf(romaji("三百円"), ["sanbyaku en", "sanbyakuen"])
        XCTAssertEqual(romaji("もう一回"), "mou ikkai")
        XCTAssertOneOf(romaji("二十歳"), ["hatachi", "nijussai", "nijissai"])
        XCTAssertEqual(romaji("六百円"), "roppyaku en")
        XCTAssertEqual(romaji("八百円"), "happyaku en")
        XCTAssertEqual(romaji("三千円"), "sanzen en")
        XCTAssertEqual(romaji("姉妹が二人います。"), "shimai ga futari imasu.")
        XCTAssertEqual(romaji("2026年10月15日"), "2026 nen 10 gatsu 15 nichi")
        XCTAssertEqual(romaji("誕生日は5月15日です。"), "tanjoubi wa 5 gatsu 15 nichi desu.")
        XCTAssertEqual(romaji("午後2時30分"), "gogo 2 ji 30 pun")
    }

    func testDaysOfTheMonthUseTheirOwnReading() {
        // DEFECT: the first ten days of the month, the 14th, the 20th and the 24th are not read
        // "nichi" (3日 is みっか, 5日 is いつか). The counter table has no days, so the digit is
        // followed by a counter nobody says: "3 nichi", "5 nichi".
        XCTExpectDefect(romaji("2026年10月3日"), shouldBe: "2026 nen 10 gatsu mikka")
        XCTExpectDefect(romaji("誕生日は5月5日です。"), shouldBe: "tanjoubi wa 5 gatsu itsuka desu.")
    }

    /// 一人 and 二人 are "hitori" and "futari" for a number that stands alone. After a number and
    /// a mark that carries it on (1、2人, 1.2人, 1〜2人) the 2 is read "ni", like the 2 of 12人.
    func testHitoriAndFutariOnlyForANumberThatStandsAlone() {
        XCTAssertEqual(romaji("あと1、2人来る"), "ato 1, 2 nin kuru")
        XCTAssertEqual(romaji("平均1.2人"), "heikin 1.2 nin")
        XCTAssertEqual(romaji("一、二人"), "ichi, ni nin")
        XCTAssertEqual(romaji("1,2人で行く"), "1,2 nin de iku")
        // After a comma that follows a word the pair is still read as one
        XCTAssertEqual(romaji("明日、2人で行く"), "ashita, futari de iku")
        XCTAssertEqual(romaji("大人2人、子供1人"), "otona futari, kodomo hitori")
        // The other counters keep their sound whatever stands before the number
        XCTAssertEqual(romaji("三、四時"), "san, yoji")
        XCTAssertEqual(romaji("十九、二十歳"), "juu kyuu, hatachi")
        // DEFECT: with a space after the comma the 2 is taken to stand alone again.
        XCTExpectDefect(romaji("あと1, 2人来る"), shouldBe: "ato 1, 2 nin kuru")
    }

    /// The pairs that do not change keep the plain reading.
    func testCountersThatKeepTheirPlainReading() {
        XCTAssertEqual(romaji("5分"), "5 fun")
        XCTAssertEqual(romaji("4時"), "4 ji")
        XCTAssertEqual(romaji("20歳"), "20 sai")
        XCTAssertEqual(romaji("12人"), "12 nin")
        // 十二人 is not 十 + 二人
        XCTAssertEqual(romaji("十二人"), "juu ni nin")
    }

    /// MeCab reads full-width digits one at a time (１０ as "ichi zero"). They are written as
    /// the number they are, like ASCII digits.
    func testFullWidthDigitsAreReadAsOneNumber() {
        XCTAssertOneOf(romaji("１０時です"), ["10 ji desu", "juu ji desu", "juuji desu"])
        XCTAssertOneOf(romaji("１０００円"), ["1000 en", "sen en"])
        XCTAssertEqual(romaji("３時"), "3 ji")
        XCTAssertEqual(romaji("１２３"), "123")
    }

    func testWordsTypedInHiraganaStayWhole() {
        // DEFECT: IPADic often has no entry for a word spelled only in hiragana, MeCab then
        // cuts it into fragments, and each fragment becomes its own "word": ひらがな comes out
        // as "hi ra ga na" and とうきょう as "tou kyou".
        XCTExpectDefect(romaji("ひらがな"), shouldBe: "hiragana")
        XCTExpectDefect(romaji("とうきょう"), shouldBe: "toukyou")
        XCTExpectDefect(romaji("東京（とうきょう）"), shouldBe: "toukyou (toukyou)")
    }

    // MARK: - A conversation with a visitor
    //
    // Sentences a host really types or dictates, and the casual Japanese the casualizer makes
    // of a translation.

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
        // The casual past of a godan verb in う, つ or る (and of 行く) ends in った
        XCTAssertEqual(pipeline("わかりました。"), "wakatta.")
        XCTAssertEqual(pipeline("京都に行きました"), "kyouto ni itta")
        XCTAssertEqual(pipeline("学生でした"), "gakusei datta")
        // What the casualizer makes of the commonest polite sentences
        XCTAssertEqual(pipeline("おいしかったです。"), "oishikatta.")
        XCTAssertEqual(pipeline("写真を撮ってもいいですか？"), "shashin o totte mo ii?")
        XCTAssertEqual(pipeline("これは何ですか？"), "kore wa nan na no?")
        XCTAssertEqual(pipeline("行きませんでした。"), "ikanakatta.")
        XCTAssertEqual(pipeline("学生ではありません。"), "gakusei ja nai.")
        XCTAssertEqual(pipeline("よろしくお願いします。"), "yoroshiku ne.")
        XCTAssertEqual(pipeline("すみませんでした。"), "gomen ne.")
        XCTAssertEqual(pipeline("予約をしたいんですが。"), "yoyaku o shitai n da kedo.")
        XCTAssertEqual(pipeline("窓を開けていただけますか？"), "mado o akete moraeru?")
        XCTAssertEqual(pipeline("そうでしたか。"), "sou datta ka.")
        XCTAssertEqual(pipeline("ここに座ってもよろしいですか？"), "koko ni suwatte mo ii?")
        XCTAssertEqual(pipeline("誰にお願いしますか？"), "dare ni onegai suru?")
    }

    /// A text longer than a message is transliterated in pieces (`tokenizerPieces`), and reads
    /// as if it had been done in one.
    func testALongTextIsTransliteratedLikeItsSentences() {
        XCTAssertEqual(
            romaji(String(repeating: "明日学校に行きます。昨日映画を見ましたか？", count: 150)),
            Array(repeating: "ashita gakkou ni ikimasu. kinou eiga o mimashita ka?", count: 150).joined(separator: " ")
        )
        XCTAssertEqual(
            romaji(String(repeating: "お願いします\n", count: 400)),
            String(repeating: "onegai shimasu\n", count: 400)
        )
        // A quote or bracket that opens after the end of a piece keeps its space; one that
        // closes there gets none
        XCTAssertEqual(
            romaji(String(repeating: "行きますよ！「はい」と言った。", count: 200)),
            Array(repeating: "ikimasu yo! \"hai\" to itta.", count: 200).joined(separator: " ")
        )
        XCTAssertEqual(
            romaji(String(repeating: "（明日は休みです。）そして『本当ですか？』と聞いた！", count: 100)),
            Array(repeating: "(ashita wa yasumi desu.) soshite \"hontou desu ka?\" to kiita!", count: 100).joined(separator: " ")
        )
        // Nothing to cut at: no space appears where a piece ends
        XCTAssertEqual(romaji(String(repeating: "は", count: 5000)), String(repeating: "ha", count: 5000))
        let hearts = String(repeating: "❤️", count: 5000) + "❤"
        XCTAssertEqual(romaji(hearts), hearts)
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
