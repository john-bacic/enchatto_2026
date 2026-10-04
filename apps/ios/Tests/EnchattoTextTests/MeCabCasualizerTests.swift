import XCTest
@testable import EnchattoText

/// `MeCabCasualizer`: polite Japanese (です / ます) to casual speech. The app runs it over
/// every translation into Japanese (`MyMemoryTranslationService`).
///
/// What it does:
///   verb + ます              dictionary form          行きます → 行く
///   verb + ました            casual past              行きました → 行った
///   verb + ません            casual negative          行きません → 行かない
///   verb + ませんでした       casual negative past     行きませんでした → 行かなかった
///   noun + です / ですか / でした   だよ / なの / だった   学生です → 学生だよ
///   noun + ですが            だけど                   学生ですが → 学生だけど
///   い-adjective, たい, ない, かった + です   the です is dropped   おいしいです → おいしい
///   a question that ends in か after any of these   the か is dropped, the question mark
///                           stays or is added        行きますか → 行く？  いいですか？ → いい？
///   ください / 下さい          ちょうだい, but not in an honorific request (お待ちください)
///   て + いただけます / くださいます   もらえる / くれる    開けていただけますか → 開けてもらえる？
///   fixed expressions        their casual form        よろしくお願いします → よろしくね
/// and it leaves everything else exactly as it was.
///
/// Two of those rules give one of several equally casual forms. Where a test below accepts more
/// than one output (`XCTAssertOneOf`), the first is what the code produced when the test was
/// written:
///   ですか → なの    駅はどこなの？ is fine; 駅はどこ？ is the neutral form, and after 何 the
///                   なの can sound impatient (これは何なの？).
///   〜てください → 〜てちょうだい    correct, but it is how a parent or an older woman
///                   speaks; most people just say 待って.
final class MeCabCasualizerTests: XCTestCase {
    private static let casualizer = MeCabCasualizer()

    private func casual(_ text: String) -> String {
        Self.casualizer.casualify(text)
    }

    // MARK: - ます → dictionary form

    func testMasuBecomesDictionaryForm_godanVerbs() {
        XCTAssertEqual(casual("行きます"), "行く")
        XCTAssertEqual(casual("飲みます"), "飲む")
        XCTAssertEqual(casual("思います"), "思う")
        XCTAssertEqual(casual("あります"), "ある")
    }

    func testMasuBecomesDictionaryForm_ichidanVerbs() {
        XCTAssertEqual(casual("食べます"), "食べる")
        XCTAssertEqual(casual("見ます"), "見る")
        XCTAssertEqual(casual("います"), "いる")
        XCTAssertEqual(casual("できます"), "できる")
    }

    func testMasuBecomesDictionaryForm_irregularVerbs() {
        XCTAssertEqual(casual("します"), "する")
        XCTAssertEqual(casual("勉強します"), "勉強する")
        XCTAssertEqual(casual("来ます"), "来る")
        XCTAssertEqual(casual("きます"), "くる")
    }

    // MARK: - ました → casual past

    func testMashita_godanVerbsEndingInU_Tsu_Ru() {
        XCTAssertEqual(casual("買いました"), "買った")
        XCTAssertEqual(casual("言いました"), "言った")
        XCTAssertEqual(casual("待ちました"), "待った")
        XCTAssertEqual(casual("ありました"), "あった")
    }

    func testMashita_godanVerbsEndingInMu_Bu_Nu() {
        XCTAssertEqual(casual("飲みました"), "飲んだ")
        XCTAssertEqual(casual("遊びました"), "遊んだ")
        XCTAssertEqual(casual("死にました"), "死んだ")
    }

    func testMashita_godanVerbsEndingInKu_Gu_Su() {
        XCTAssertEqual(casual("書きました"), "書いた")
        XCTAssertEqual(casual("聞きました"), "聞いた")
        XCTAssertEqual(casual("泳ぎました"), "泳いだ")
        XCTAssertEqual(casual("話しました"), "話した")
    }

    /// 行く is the one く verb whose past is った, not いた.
    func testMashita_ikuIsIrregular() {
        XCTAssertEqual(casual("行きました"), "行った")
        XCTAssertEqual(casual("歩いていきました"), "歩いていった")
        XCTAssertEqual(casual("連れて行きました"), "連れて行った")
    }

    func testMashita_ichidanVerbs() {
        XCTAssertEqual(casual("食べました"), "食べた")
        XCTAssertEqual(casual("見ました"), "見た")
        XCTAssertEqual(casual("起きました"), "起きた")
        XCTAssertEqual(casual("借りました"), "借りた")
        XCTAssertEqual(casual("できました"), "できた")
    }

    /// An ichidan verb has an い or え sound before its る. One everyday verb for most of those
    /// kana (へ, し, に and ひ have no everyday ichidan verb written that way).
    func testIchidanVerbsForEachKanaBeforeRu() {
        // え row: え け せ て ね べ め れ
        XCTAssertEqual(casual("教えました"), "教えた")
        XCTAssertEqual(casual("答えません"), "答えない")
        XCTAssertEqual(casual("出かけました"), "出かけた")
        XCTAssertEqual(casual("見せました"), "見せた")
        XCTAssertEqual(casual("話せません"), "話せない")
        XCTAssertEqual(casual("捨てました"), "捨てた")
        XCTAssertEqual(casual("尋ねました"), "尋ねた")
        XCTAssertEqual(casual("食べません"), "食べない")
        XCTAssertEqual(casual("始めました"), "始めた")
        XCTAssertEqual(casual("忘れました"), "忘れた")
        XCTAssertEqual(casual("疲れました"), "疲れた")
        XCTAssertEqual(casual("生まれました"), "生まれた")
        // い row: い き ち び み り
        XCTAssertEqual(casual("いました"), "いた")
        XCTAssertEqual(casual("起きません"), "起きない")
        XCTAssertEqual(casual("落ちました"), "落ちた")
        XCTAssertEqual(casual("浴びました"), "浴びた")
        XCTAssertEqual(casual("みました"), "みた")
        XCTAssertEqual(casual("借りません"), "借りない")
    }

    /// Ichidan verbs with a kanji straight before る: their kana do not show the verb class.
    func testIchidanVerbsWithAKanjiBeforeRu() {
        XCTAssertEqual(casual("見ました"), "見た")
        XCTAssertEqual(casual("寝ました"), "寝た")
        XCTAssertEqual(casual("寝ません"), "寝ない")
        XCTAssertEqual(casual("出ました"), "出た")
        XCTAssertEqual(casual("出ません"), "出ない")
        XCTAssertEqual(casual("着ました"), "着た")
        // じ before る
        XCTAssertEqual(casual("感じました"), "感じた")
        XCTAssertEqual(casual("信じません"), "信じない")
    }

    func testMashita_irregularVerbs() {
        XCTAssertEqual(casual("しました"), "した")
        XCTAssertEqual(casual("勉強しました"), "勉強した")
        XCTAssertEqual(casual("来ました"), "来た")
        XCTAssertEqual(casual("きました"), "きた")
        XCTAssertEqual(casual("持って来ました"), "持って来た")
    }

    /// Godan verbs that end in an い or え sound + る and so look like ichidan verbs.
    func testMashita_godanVerbsThatLookIchidan() {
        XCTAssertEqual(casual("帰りました"), "帰った")
        XCTAssertEqual(casual("入りました"), "入った")
        XCTAssertEqual(casual("走りました"), "走った")
        XCTAssertEqual(casual("切りました"), "切った")
        XCTAssertEqual(casual("分かりました"), "分かった")
        XCTAssertEqual(casual("わかりました"), "わかった")
        // The same verbs spelled in kana
        XCTAssertEqual(casual("かえりました"), "かえった")
        XCTAssertEqual(casual("しりません"), "しらない")
        // こする ends in する and is no する verb (see testGodanVerbsThatEndInSuru)
        XCTAssertEqual(casual("こすりました"), "こすった")
    }

    /// こする, 揺する and さする end in する and are godan verbs, not する verbs: their stem in front
    /// of ます ends in り, the stem of a する verb in し.
    func testGodanVerbsThatEndInSuru() {
        XCTAssertEqual(casual("こすりました。"), "こすった。")
        XCTAssertEqual(casual("揺すりました。"), "揺すった。")
        XCTAssertEqual(casual("背中をさすりました。"), "背中をさすった。")
        XCTAssertEqual(casual("目をこすりません。"), "目をこすらない。")
        // する verbs written as one word
        XCTAssertEqual(casual("愛しました"), "愛した")
        XCTAssertEqual(casual("察しました"), "察した")
    }

    // MARK: - ません → casual negative

    /// One verb for each godan ending except る.
    func testMasen_godanVerbs() {
        XCTAssertEqual(casual("買いません"), "買わない")
        XCTAssertEqual(casual("待ちません"), "待たない")
        XCTAssertEqual(casual("飲みません"), "飲まない")
        XCTAssertEqual(casual("遊びません"), "遊ばない")
        XCTAssertEqual(casual("死にません"), "死なない")
        XCTAssertEqual(casual("行きません"), "行かない")
        XCTAssertEqual(casual("泳ぎません"), "泳がない")
        XCTAssertEqual(casual("話しません"), "話さない")
    }

    func testMasen_godanVerbsEndingInRu() {
        XCTAssertEqual(casual("帰りません"), "帰らない")
        XCTAssertEqual(casual("知りません"), "知らない")
        XCTAssertEqual(casual("分かりません"), "分からない")
        XCTAssertEqual(casual("入りません"), "入らない")
        XCTAssertEqual(casual("要りません"), "要らない")
        XCTAssertEqual(casual("走りません"), "走らない")
    }

    func testMasen_ichidanVerbs() {
        XCTAssertEqual(casual("食べません"), "食べない")
        XCTAssertEqual(casual("見ません"), "見ない")
        XCTAssertEqual(casual("いません"), "いない")
        XCTAssertEqual(casual("できません"), "できない")
    }

    func testMasen_irregularVerbs() {
        XCTAssertEqual(casual("しません"), "しない")
        XCTAssertEqual(casual("勉強しません"), "勉強しない")
        XCTAssertEqual(casual("来ません"), "来ない")
        XCTAssertEqual(casual("きません"), "こない")
    }

    // MARK: - Verb chains

    func testProgressive() {
        XCTAssertEqual(casual("食べています"), "食べている")
        XCTAssertEqual(casual("食べていました"), "食べていた")
        XCTAssertEqual(casual("食べていません"), "食べていない")
        XCTAssertEqual(casual("雨が降っています"), "雨が降っている")
        XCTAssertEqual(casual("覚えていません"), "覚えていない")
    }

    func testPotentialAndPassive() {
        XCTAssertEqual(casual("行けます"), "行ける")
        XCTAssertEqual(casual("読めません"), "読めない")
        XCTAssertEqual(casual("食べられます"), "食べられる")
    }

    func testCompoundEndings() {
        XCTAssertEqual(casual("食べてしまいました"), "食べてしまった")
        XCTAssertEqual(casual("見てみます"), "見てみる")
        XCTAssertEqual(casual("行かなければなりません"), "行かなければならない")
        XCTAssertEqual(casual("入ってはいけません"), "入ってはいけない")
        XCTAssertEqual(casual("いいと思います"), "いいと思う")
    }

    /// ます in front of a sentence-final particle or a conjunction: only the ます changes.
    func testMasuBeforeAParticle() {
        XCTAssertEqual(casual("食べますね"), "食べるね")
        XCTAssertEqual(casual("食べますよ"), "食べるよ")
        XCTAssertEqual(casual("行きますから"), "行くから")
        XCTAssertEqual(casual("行きますが"), "行くが")
        XCTAssertEqual(casual("行きますので"), "行くので")
    }

    func testMasuBeforeTheParticleNa() {
        // DEFECT: after ます, な is ね as an older man says it (行きますな, "I'm going, then").
        // After the dictionary form it is a prohibition: 行くな is "do not go". Rare in a
        // translation; the set phrases already keep their な (お願いしますな → お願いな).
        XCTExpectDefect(casual("行きますな"), shouldBe: "行くね", "行くよ", "行くなあ", "行きますな")
    }

    // MARK: - です

    func testDesuBecomesDaYo() {
        XCTAssertEqual(casual("学生です"), "学生だよ")
        XCTAssertEqual(casual("学生です。"), "学生だよ。")
        XCTAssertEqual(casual("そうです"), "そうだよ")
        XCTAssertEqual(casual("行くんです"), "行くんだよ")
        XCTAssertEqual(casual("好きなんです"), "好きなんだよ")
    }

    func testDesuKaBecomesNano() {
        XCTAssertEqual(casual("学生ですか"), "学生なの")
        XCTAssertEqual(casual("そうですか"), "そうなの")
        XCTAssertEqual(casual("駅はどこですか"), "駅はどこなの")
        XCTAssertEqual(casual("何が好きですか？"), "何が好きなの？")
        // With a question mark the bare question word is just as right.
        XCTAssertOneOf(casual("これは何ですか？"), ["これは何なの？", "これは何？"])
    }

    /// ですね is だね. The casualizer writes だよね, which is also said but asks for agreement a
    /// little more strongly ("it is, isn't it?").
    func testDesuNeAfterANoun() {
        XCTAssertOneOf(casual("いい天気ですね"), ["いい天気だよね", "いい天気だね"])
        XCTAssertOneOf(casual("きれいですね"), ["きれいだよね", "きれいだね"])
        XCTAssertOneOf(casual("学生ですね。"), ["学生だよね。", "学生だね。"])
    }

    func testDeshitaBecomesDatta() {
        XCTAssertEqual(casual("学生でした"), "学生だった")
        XCTAssertEqual(casual("きれいでした。"), "きれいだった。")
    }

    // MARK: - ください

    func testKudasaiAfterANounBecomesChoudai() {
        XCTAssertEqual(casual("水をください"), "水をちょうだい")
        XCTAssertEqual(casual("水を下さい"), "水をちょうだい")
        XCTAssertEqual(casual("メニューをください"), "メニューをちょうだい")
        XCTAssertEqual(casual("これを二つください"), "これを二つちょうだい")
        XCTAssertEqual(casual("水をください！"), "水をちょうだい！")
    }

    /// After a て form the casual request is the て form on its own; てちょうだい is the
    /// casualizer's choice (see the note at the top of the file).
    func testKudasaiAfterATeForm() {
        XCTAssertOneOf(casual("待ってください"), ["待ってちょうだい", "待って"])
        XCTAssertOneOf(casual("教えて下さい"), ["教えてちょうだい", "教えて"])
        XCTAssertOneOf(casual("ちょっと待ってください。"), ["ちょっと待ってちょうだい。", "ちょっと待って。"])
        XCTAssertOneOf(casual("飲んでください"), ["飲んでちょうだい", "飲んで"])
        XCTAssertOneOf(casual("行かないでください"), ["行かないでちょうだい", "行かないで"])
    }

    // MARK: - Whole sentences

    func testOnlyTheEndingOfASentenceChanges() {
        XCTAssertEqual(casual("明日学校に行きます。"), "明日学校に行く。")
        XCTAssertEqual(casual("昨日映画を見ました。"), "昨日映画を見た。")
        XCTAssertEqual(casual("私はコーヒーを飲みません。"), "私はコーヒーを飲まない。")
        XCTAssertEqual(casual("日本に行ったことがあります"), "日本に行ったことがある")
    }

    func testEverySentenceInAMessageIsConverted() {
        XCTAssertEqual(casual("今日は月曜日です。明日学校に行きます。"), "今日は月曜日だよ。明日学校に行く。")
        XCTAssertEqual(casual("これはペンです。あれは本です。"), "これはペンだよ。あれは本だよ。")
        XCTAssertEqual(casual("行きます。でも、食べません。"), "行く。でも、食べない。")
    }

    func testEverythingAroundTheEndingIsKept() {
        // Line breaks and spaces, between sentences and at the very end
        XCTAssertEqual(casual("行きます。\n食べます。"), "行く。\n食べる。")
        XCTAssertEqual(casual("はい、 そうです"), "はい、 そうだよ")
        XCTAssertEqual(casual("行きます。\n"), "行く。\n")
        XCTAssertEqual(casual("行きます "), "行く ")
        XCTAssertEqual(casual("食べます　"), "食べる　")
        // Latin text, digits and emoji
        XCTAssertEqual(casual("OK、行きます"), "OK、行く")
        XCTAssertEqual(casual("今は3時です"), "今は3時だよ")
        XCTAssertEqual(casual("行きます😀"), "行く😀")
    }

    // MARK: - A conversation with a visitor
    //
    // What a translation of an everyday English sentence looks like, and what the casualizer
    // must make of it.

    func testConversation_introductions() {
        XCTAssertEqual(casual("はじめまして、ジョンです。"), "はじめまして、ジョンだよ。")
        XCTAssertEqual(casual("私の名前はジョンです。"), "私の名前はジョンだよ。")
        XCTAssertEqual(casual("マイケルさんはアメリカ人です。"), "マイケルさんはアメリカ人だよ。")
        XCTAssertEqual(casual("ジョン・スミスさんはカナダ人です。"), "ジョン・スミスさんはカナダ人だよ。")
        XCTAssertEqual(casual("カナダから来ました。"), "カナダから来た。")
        XCTAssertEqual(casual("東京に住んでいます。"), "東京に住んでいる。")
        XCTAssertEqual(casual("私はエンジニアです"), "私はエンジニアだよ")
        XCTAssertEqual(casual("お寿司が好きです。"), "お寿司が好きだよ。")
    }

    func testConversation_questions() {
        XCTAssertOneOf(casual("元気ですか？"), ["元気なの？", "元気？"])
        XCTAssertOneOf(casual("大丈夫ですか？"), ["大丈夫なの？", "大丈夫？"])
        XCTAssertOneOf(casual("トイレはどこですか？"), ["トイレはどこなの？", "トイレはどこ？"])
        XCTAssertOneOf(casual("日本は初めてですか？"), ["日本は初めてなの？", "日本は初めて？"])
        XCTAssertOneOf(casual("出身はどこですか？"), ["出身はどこなの？", "出身はどこ？"])
        // 行かないか？ is a real invitation, though a gruff one; 行かない？ is the usual form.
        XCTAssertOneOf(casual("一緒に行きませんか？"), ["一緒に行かないか？", "一緒に行かない？"])
    }

    func testConversation_answers() {
        XCTAssertEqual(casual("はい、元気です。"), "はい、元気だよ。")
        XCTAssertEqual(casual("大丈夫です"), "大丈夫だよ")
        XCTAssertEqual(casual("いいえ、違います"), "いいえ、違う")
        XCTAssertEqual(casual("わかりました。"), "わかった。")
        XCTAssertEqual(casual("日本語は少しだけ話せます。"), "日本語は少しだけ話せる。")
        XCTAssertEqual(casual("日本語が分かりません"), "日本語が分からない")
        XCTAssertEqual(casual("英語は話せません"), "英語は話せない")
        XCTAssertEqual(casual("ごめんなさい、わかりません。"), "ごめんなさい、わからない。")
        XCTAssertEqual(casual("疲れました"), "疲れた")
        XCTAssertEqual(casual("お腹がすきました"), "お腹がすいた")
    }

    func testConversation_requests() {
        XCTAssertOneOf(casual("もう一度言ってください"), ["もう一度言ってちょうだい", "もう一度言って"])
        XCTAssertOneOf(casual("ゆっくり話してください"), ["ゆっくり話してちょうだい", "ゆっくり話して"])
        XCTAssertOneOf(casual("左に曲がってください"), ["左に曲がってちょうだい", "左に曲がって"])
        XCTAssertOneOf(casual("写真を撮りましょう"), ["写真を撮りましょう", "写真を撮ろう"])
    }

    func testConversation_timesAndPrices() {
        XCTAssertOneOf(casual("今何時ですか？"), ["今何時なの？", "今何時？"])
        XCTAssertEqual(casual("今は午後3時です。"), "今は午後3時だよ。")
        XCTAssertEqual(casual("10時30分です"), "10時30分だよ")
        XCTAssertEqual(casual("9時から5時まで働きます。"), "9時から5時まで働く。")
        XCTAssertOneOf(casual("7時に会いましょう"), ["7時に会いましょう", "7時に会おう"])
        XCTAssertOneOf(casual("これはいくらですか？"), ["これはいくらなの？", "これはいくら？"])
        XCTAssertEqual(casual("1000円です。"), "1000円だよ。")
        XCTAssertEqual(casual("2,500円です。"), "2,500円だよ。")
        XCTAssertEqual(casual("全部で3000円になります。"), "全部で3000円になる。")
    }

    // MARK: - What must be left alone

    func testCasualTextIsUnchanged() {
        for text in ["行く", "食べた", "行かない", "学生だよ", "そうだね", "うん、行くよ", "元気？", "寿司を食べたことがない"] {
            XCTAssertEqual(casual(text), text)
        }
    }

    func testGreetingsWithoutAPoliteEndingAreUnchanged() {
        let greetings = [
            "こんにちは", "こんばんは", "おはよう", "はじめまして", "ありがとう", "どういたしまして",
            "ごめんなさい", "ごめんね", "さようなら", "またね", "じゃあまたね", "ただいま",
            "いってらっしゃい", "お帰りなさい", "おめでとう", "乾杯",
        ]
        for text in greetings {
            XCTAssertEqual(casual(text), text)
        }
    }

    func testNamesAndWordsThatOnlySoundPoliteAreUnchanged() {
        for text in ["田中", "田中さん", "山田太郎", "ますだ", "デスクトップ", "ジョン・スミス", "マイケル"] {
            XCTAssertEqual(casual(text), text)
        }
        // 増田 is read "masuda": the ます in a name is not the polite ending.
        XCTAssertEqual(casual("増田さんに会いました"), "増田さんに会った")
    }

    func testNonJapaneseTextIsUnchanged() {
        for text in ["Hello", "Hello, how are you?", "I am fine.", "12345", "😀", "http://example.com", "@john こんにちは"] {
            XCTAssertEqual(casual(text), text)
        }
    }

    func testEmptyAndBlankInputIsUnchanged() {
        for text in ["", " ", "　", "\n"] {
            XCTAssertEqual(casual(text), text)
        }
    }

    /// Polite forms the casualizer has no rule for come back as they were (the first form in
    /// each list), not half-converted. The other forms are what a rule for them should give.
    func testPoliteFormsWithoutARulePassThrough() {
        let cases: [(String, [String])] = [
            ("行きましょう", ["行きましょう", "行こう"]),
            ("一緒に行きましょう", ["一緒に行きましょう", "一緒に行こう"]),
            ("そうでしょう", ["そうでしょう", "そうだろう", "そうでしょ"]),
            ("そうですね", ["そうですね", "そうだね"]),
            ("ありがとうございます", ["ありがとうございます", "ありがとう"]),
            ("ありがとうございました", ["ありがとうございました", "ありがとう"]),
            ("おはようございます", ["おはようございます", "おはよう"]),
            ("お誕生日おめでとうございます", ["お誕生日おめでとうございます", "お誕生日おめでとう", "誕生日おめでとう"]),
            ("すみません", ["すみません", "ごめん", "ごめんね"]),
            ("申し訳ございません", ["申し訳ございません", "ごめん", "ごめんね", "申し訳ない"]),
            ("おやすみなさい", ["おやすみなさい", "おやすみ"]),
            ("学生じゃありません", ["学生じゃありません", "学生じゃない"]),
            // ませんでした after a stem MeCab does not tag as a verb: not ませんだった
            ("申し訳ございませんでした", ["申し訳ございませんでした", "申し訳なかった", "ごめん", "ごめんね"]),
            ("問題はございませんでした。", ["問題はございませんでした。", "問題はなかった。"]),
            ("お変わりございませんでしたか？", ["お変わりございませんでしたか？", "変わりなかった？"]),
            ("学生じゃありませんでした", ["学生じゃありませんでした", "学生じゃなかった"]),
            // MeCab cuts this いただけ into い + た + だけ, so the verb rule does not see it
            ("ペンを貸していただけませんか？", ["ペンを貸していただけませんか？", "ペンを貸してもらえない？", "ペンを貸してくれない？"]),
        ]
        for (input, accepted) in cases {
            XCTAssertOneOf(casual(input), accepted)
        }
    }

    func testCasualizingTwiceChangesNothingMore() {
        let inputs = [
            "明日学校に行きます。", "昨日映画を見ました。", "私はコーヒーを飲みません。",
            "学生です。", "これは何ですか？", "学生でした", "水をください", "食べています",
            "おいしいです", "いいですか？", "どこから来ましたか", "学生ではありません", "行きませんでした",
            "よろしくお願いします", "すみませんでした", "学生ですよ", "学生ですから", "少々お待ちください",
            "予約をしたいんですが。", "窓を開けていただけますか？", "そうでしたか。", "誰にお願いしますか？",
            "お願いしますから、やめてください。", "申し訳ございませんでした", "ここに座ってもよろしいですか？",
            "行きますか…？", "じかんですか？", "こすりました", "❤️が好きです❤", "すみませんでしたが、もう大丈夫です。",
            "早く治るといいですね。", "ちょっといいですか？", "本当にすいませんでした。", "店内でいただきます。",
            "あるんですか？", "2️⃣趣味は何ですか？答えは2つお願いします",
        ]
        for input in inputs {
            let once = casual(input)
            XCTAssertEqual(casual(once), once, "second pass changed the result for \(input)")
        }
    }

    // MARK: - Tokens the tokenizer cannot place
    //
    // Mecab-Swift finds the place of each token by searching the text for it. It cannot find
    // the 2 inside the keycap 2️⃣ or the ❤ inside ❤️, and places such a token on the next bare
    // copy of that character: at the very end of the text in front of the tokens that follow it
    // (the casualizer leaves that token out), anywhere else past every token between the two,
    // which it does not return (they are tokenized again). See `tokensInOrder`.

    /// Nothing is written twice. This used to come back as ❤️が好きです❤が好きだよ❤.
    func testTextAroundAnEmojiIsNotWrittenTwice() {
        XCTAssertEqual(casual("❤️が好きです❤"), "❤️が好きだよ❤")
        XCTAssertEqual(casual("私は❤️が好きです。あなたは❤"), "私は❤️が好きだよ。あなたは❤")
        XCTAssertEqual(casual("1️⃣は寿司です、2️⃣はラーメンです。私は2"), "1️⃣は寿司だよ、2️⃣はラーメンだよ。私は2")
        for text in ["❤️は❤", "2️⃣は2", "1️⃣ は 1", "👨‍👩‍👧は👨", "好き❤️\nは？❤", "#️⃣は#", "今日は☀️、明日は☀"] {
            XCTAssertEqual(casual(text), text)
        }
    }

    /// The bare character in the middle of the text: the sentences between the emoji and it
    /// have no token of the first pass, and used to stay polite (2️⃣趣味は何ですか？).
    func testTextBetweenAnEmojiAndItsBareCharacterIsCasualized() {
        XCTAssertEqual(
            casual("質問です。1️⃣好きな食べ物は何ですか？2️⃣趣味は何ですか？答えは2つお願いします"),
            "質問だよ。1️⃣好きな食べ物は何なの？2️⃣趣味は何なの？答えは2つお願い"
        )
        XCTAssertEqual(casual("1️⃣番は私です。私は21歳です"), "1️⃣番は私だよ。私は21歳だよ")
        XCTAssertEqual(casual("3️⃣ 夕食は19時からです。場所は3階です"), "3️⃣ 夕食は19時からだよ。場所は3階だよ")
        XCTAssertEqual(casual("☺️ 嬉しいです ☺ ありがとう"), "☺️ 嬉しい ☺ ありがとう")
        // あ゙ as it is written in manga: the あ lands on the あ of ありません
        XCTAssertEqual(casual("あ゙あ゙あ゙、時間がありません"), "あ゙あ゙あ゙、時間がない")
        // A string as Foundation hands it over (UTF-16 inside) is walked the same way
        let bridged = NSString(string: "3️⃣ 夕食は19時からです。場所は3階です") as String
        XCTAssertEqual(casual(bridged), "3️⃣ 夕食は19時からだよ。場所は3階だよ")
        let composed = "1️⃣番は私です。私は21歳です".precomposedStringWithCanonicalMapping
        XCTAssertEqual(casual(composed), "1️⃣番は私だよ。私は21歳だよ")
    }

    /// A text with many such characters is tokenized in its runs straight away
    /// (`tokensInOrder`), and comes out as its sentences do.
    func testATextFullOfEmojiIsCasualizedLikeItsSentences() {
        XCTAssertEqual(
            casual(String(repeating: "1️⃣明日学校に行きます。", count: 80)),
            String(repeating: "1️⃣明日学校に行く。", count: 80)
        )
        let hearts = String(repeating: "❤️", count: 300)
        XCTAssertEqual(casual(hearts + "これは何ですか？"), hearts + "これは何なの？")
    }

    func testAdjectiveStraightAfterABareEmoji() {
        // DEFECT: straight after a bare emoji MeCab cuts もういい into も + うい + い: it takes the
        // emoji for a noun and the も for its particle. The い-adjective is not seen and its です
        // becomes だよ.
        XCTExpectDefect(casual("✌もういいです。"), shouldBe: "✌もういい。")
    }

    /// An ending is an ending only when its tokens stand next to each other. Where a token is
    /// missing between two of them (the 1 of 1️⃣), or a line ends, they are not one word, and
    /// taking them for one would drop what stands between them.
    func testTokensOfAnEndingMustStandTogether() {
        XCTAssertEqual(casual("食べ1️⃣ます1"), "食べ1️⃣ます1")
        XCTAssertEqual(casual("行き\nます"), "行き\nます")
        XCTAssertEqual(casual("学生で\nした"), "学生で\nした")
        XCTAssertEqual(casual("行きます\nか"), "行く\nか")
    }

    // MARK: - Texts longer than a message
    //
    // The tokenizer searches the whole rest of the text for every token it cannot place: 5,000
    // hearts took three seconds. A message (2,000 UTF-16 units at most) is tokenized whole; a
    // longer text is cut into pieces first (`tokenizerPieces`).

    func testAMessageIsOnePiece() {
        let longest = String(repeating: "明日学校に行きます。", count: 200)
        XCTAssertEqual(longest.utf16.count, 2000)
        for text in ["", "行きます", "行きます。\n食べます。", longest] {
            XCTAssertEqual(text.tokenizerPieces.map(String.init), [text])
        }
    }

    func testALongTextIsCutAfterALineBreakOrASentence() {
        let sentences = String(repeating: "明日学校に行きます。昨日映画を見ましたか？", count: 150)
        let lines = String(repeating: "お願いします\n", count: 400)
        let hearts = String(repeating: "❤️", count: 5000) + "❤"
        let families = String(repeating: "👨‍👩‍👧", count: 5000) + "👨"
        // One character each to Swift: thousands of joiners, or of accents on one kana
        let chain = String(repeating: "👨\u{200D}", count: 5000) + "👨"
        let accents = "は" + String(repeating: "\u{301}", count: 5000) + "は"
        for text in [sentences, lines, hearts, families, chain, accents] {
            let pieces = text.tokenizerPieces
            XCTAssertGreaterThan(pieces.count, 1)
            XCTAssertEqual(pieces.joined(), text)
            XCTAssertEqual(pieces.map(\.unicodeScalars.count).reduce(0, +), text.unicodeScalars.count)
            // A piece is 1,000 units at most, give or take its last character
            XCTAssertTrue(pieces.allSatisfy { !$0.isEmpty && $0.utf16.count < 1010 })
        }
        XCTAssertTrue(sentences.tokenizerPieces.dropLast().allSatisfy { $0.hasSuffix("。") || $0.hasSuffix("？") })
        XCTAssertTrue(lines.tokenizerPieces.allSatisfy { $0.hasSuffix("\n") })
    }

    func testALongTextIsCasualizedLikeItsSentences() {
        XCTAssertEqual(
            casual(String(repeating: "明日学校に行きます。昨日映画を見ましたか？", count: 150)),
            String(repeating: "明日学校に行く。昨日映画を見た？", count: 150)
        )
        XCTAssertEqual(
            casual(String(repeating: "お願いします\n", count: 400)),
            String(repeating: "お願い\n", count: 400)
        )
        // Nothing to cut at, and nothing to change
        let hearts = String(repeating: "❤️", count: 5000) + "❤"
        XCTAssertEqual(casual(hearts), hearts)
        let chain = String(repeating: "👨\u{200D}", count: 5000) + "👨"
        XCTAssertEqual(Array(casual(chain).unicodeScalars), Array(chain.unicodeScalars))
    }

    /// The app translates several messages at once and MeCab taggers are not thread-safe.
    func testConcurrentCallsGiveTheSameAnswers() {
        let cases: [(String, String)] = [
            ("明日学校に行きます。", "明日学校に行く。"),
            ("昨日映画を見ました。", "昨日映画を見た。"),
            ("私はコーヒーを飲みません。", "私はコーヒーを飲まない。"),
            ("これは何ですか？", "これは何なの？"),
        ]
        let mismatches = MismatchLog()
        DispatchQueue.concurrentPerform(iterations: 400) { i in
            let (input, expected) = cases[i % cases.count]
            let result = Self.casualizer.casualify(input)
            if result != expected {
                mismatches.add("\(input) became \(result)")
            }
        }
        XCTAssertEqual(mismatches.all, [])
    }

    // MARK: - Verb classes
    //
    // A verb is ichidan exactly when its stem in front of ます, plus る, is its dictionary form
    // (食べ + る = 食べる); a godan verb changes its last kana (帰り + る ≠ 帰る). The casualizer
    // used to guess the class from the kana before る and from two word lists, and got the
    // verbs below wrong.

    func testIchidanVerbsWithAVoicedKanaBeforeRu() {
        // げ, ぜ, ぎ and じ before る
        XCTAssertEqual(casual("上げました"), "上げた")
        XCTAssertEqual(casual("逃げました"), "逃げた")
        XCTAssertEqual(casual("食べすぎました"), "食べすぎた")
        XCTAssertEqual(casual("高すぎました"), "高すぎた")
        XCTAssertEqual(casual("閉じました"), "閉じた")
        XCTAssertEqual(casual("混ぜました"), "混ぜた")
        XCTAssertEqual(casual("あげません"), "あげない")
        XCTAssertEqual(casual("泳げません"), "泳げない")
    }

    /// しゃべる, すべる (滑る) and まいる (参る) have an い or え sound before る and are godan.
    func testGodanVerbsSpelledInKanaThatLookIchidan() {
        XCTAssertEqual(casual("しゃべりました"), "しゃべった")
        XCTAssertEqual(casual("すべりました"), "すべった")
        XCTAssertEqual(casual("まいりました"), "まいった")
        XCTAssertEqual(casual("あせりました"), "あせった")
    }

    /// 混じる looks like 感じる and 信じる but is godan (混じらない, 混じった).
    func testMajiruIsGodan() {
        XCTAssertEqual(casual("混じりました"), "混じった")
        XCTAssertEqual(casual("感じました"), "感じた")
    }

    // MARK: - ありません and ませんでした

    /// The negative of ある is ない, not あらない.
    func testNegativeOfAru() {
        XCTAssertEqual(casual("ありません"), "ない")
        XCTAssertEqual(casual("時間がありません"), "時間がない")
        XCTAssertEqual(casual("問題ありません。"), "問題ない。")
        XCTAssertEqual(casual("何でもありません"), "何でもない")
        XCTAssertEqual(casual("日本に行ったことがありません。"), "日本に行ったことがない。")
        XCTAssertEqual(casual("寒くありません"), "寒くない")
        XCTAssertEqual(casual("食べたくありません"), "食べたくない")
        XCTAssertOneOf(casual("申し訳ありません"), ["申し訳ない", "ごめん", "ごめんね", "申し訳ありません"])
    }

    /// ではありません is the negative of the copula. Its casual form is じゃない.
    func testDewaArimasenBecomesJanai() {
        XCTAssertOneOf(casual("学生ではありません"), ["学生じゃない", "学生ではない"])
        XCTAssertOneOf(casual("好きではありません"), ["好きじゃない", "好きではない"])
        XCTAssertEqual(casual("納豆は好きではありません。"), "納豆は好きじゃない。")
        XCTAssertEqual(casual("学生ではありませんでした"), "学生じゃなかった")
        XCTAssertEqual(casual("静かではありませんでした。"), "静かじゃなかった。")
        // で + は that is not the copula: something else stands between it and ありません
        XCTAssertEqual(casual("東京では雪がありません"), "東京では雪がない")
    }

    /// ませんでした is one ending, the negative past: 〜なかった.
    func testPoliteNegativePast() {
        XCTAssertEqual(casual("行きませんでした"), "行かなかった")
        XCTAssertEqual(casual("食べませんでした"), "食べなかった")
        XCTAssertEqual(casual("わかりませんでした"), "わからなかった")
        XCTAssertEqual(casual("来ませんでした"), "来なかった")
        XCTAssertEqual(casual("しませんでした"), "しなかった")
        XCTAssertEqual(casual("ありませんでした"), "なかった")
        XCTAssertEqual(casual("それは知りませんでした。"), "それは知らなかった。")
        XCTAssertEqual(casual("眠れませんでした。"), "眠れなかった。")
    }

    // MARK: - です after an い-adjective, たい, ない and かった

    /// だ cannot follow an い-adjective, たい or ない (おいしいだよ is not Japanese), so their
    /// です is dropped. Translations of "it is nice / hot / expensive / fun" all end this way.
    func testDesuAfterAnAdjectiveOrTaiOrNai() {
        XCTAssertOneOf(casual("おいしいです"), ["おいしい", "おいしいよ"])
        XCTAssertOneOf(casual("高いです"), ["高い", "高いよ"])
        XCTAssertOneOf(casual("行きたいです"), ["行きたい", "行きたいよ"])
        XCTAssertOneOf(casual("ラーメンを食べたいです"), ["ラーメンを食べたい", "ラーメンを食べたいよ"])
        XCTAssertOneOf(casual("行かないです"), ["行かない", "行かないよ"])
        XCTAssertOneOf(casual("行かなくてもいいです"), ["行かなくてもいい", "行かなくてもいいよ"])
        XCTAssertEqual(casual("今日は暑いですね。"), "今日は暑いね。")
        XCTAssertEqual(casual("いいですね"), "いいね")
        XCTAssertOneOf(
            casual("お会いできて嬉しいです。"),
            ["お会いできて嬉しい。", "お会いできて嬉しいよ。", "会えて嬉しい。", "会えて嬉しいよ。"]
        )
        // The past of an い-adjective, かった
        XCTAssertOneOf(casual("楽しかったです"), ["楽しかった", "楽しかったよ"])
        XCTAssertOneOf(casual("とても楽しかったです。"), ["とても楽しかった。", "とても楽しかったよ。"])
        XCTAssertOneOf(casual("おいしかったです"), ["おいしかった", "おいしかったよ"])
        // Everyday translations
        XCTAssertEqual(casual("頭が痛いです。"), "頭が痛い。")
        XCTAssertEqual(casual("日本語は難しいです。"), "日本語は難しい。")
        XCTAssertEqual(casual("眠いです。"), "眠い。")
        XCTAssertEqual(casual("京都に行きたいです。"), "京都に行きたい。")
        XCTAssertEqual(casual("好きじゃないです。"), "好きじゃない。")
        XCTAssertEqual(casual("寒くないです。"), "寒くない。")
        XCTAssertEqual(casual("行ったほうがいいです。"), "行ったほうがいい。")
        XCTAssertEqual(casual("会えてよかったです。"), "会えてよかった。")
        XCTAssertEqual(casual("学生らしいです"), "学生らしい")
        // After と, でも, とても and ちょっと MeCab reads いい as the stem of 言う
        XCTAssertEqual(casual("早く治るといいですね。"), "早く治るといいね。")
        XCTAssertEqual(casual("何でもいいですよ。"), "何でもいいよ。")
        XCTAssertEqual(casual("とてもいいですね。"), "とてもいいね。")
        XCTAssertEqual(casual("どちらでもいいです。"), "どちらでもいい。")
        XCTAssertEqual(casual("間に合うといいですが。"), "間に合うといいが。")
        // The real 言う keeps its verb forms
        XCTAssertEqual(casual("田中といいます。"), "田中という。")
        XCTAssertEqual(casual("そういいました。"), "そういった。")
    }

    /// 〜てみたい is みる + たい ("want to try"). MeCab takes its みたい for the one in
    /// 学生みたい ("like a student"), which keeps its だよ.
    func testDesuAfterTeMitai() {
        XCTAssertEqual(casual("試してみたいです。"), "試してみたい。")
        XCTAssertEqual(casual("祭りに行ってみたいです。"), "祭りに行ってみたい。")
        XCTAssertEqual(casual("食べてみたいですか？"), "食べてみたい？")
        XCTAssertEqual(casual("学生みたいです"), "学生みたいだよ")
    }

    /// Words that end in い without being an い-adjective keep their だよ: な-adjectives
    /// (きれい, 嫌い) and the adverb いっぱい. So does そう after an adjective stem.
    func testDesuAfterAWordThatOnlyLooksLikeAnAdjective() {
        XCTAssertEqual(casual("きれいです"), "きれいだよ")
        XCTAssertEqual(casual("嫌いです"), "嫌いだよ")
        XCTAssertEqual(casual("お腹がいっぱいです。"), "お腹がいっぱいだよ。")
        XCTAssertEqual(casual("美味しそうです"), "美味しそうだよ")
    }

    /// なの needs a noun or a な-adjective in front of it. After an い-adjective or たい the
    /// casual question is the bare form (or the form + の).
    func testDesuKaAfterAnAdjectiveOrTai() {
        XCTAssertOneOf(casual("いいですか？"), ["いい？", "いいの？"])
        XCTAssertOneOf(
            casual("写真を撮ってもいいですか？"),
            ["写真を撮ってもいい？", "写真を撮ってもいいの？", "写真撮ってもいい？"]
        )
        XCTAssertOneOf(casual("おいしいですか？"), ["おいしい？", "おいしいの？"])
        XCTAssertOneOf(
            casual("何を食べたいですか？"),
            ["何を食べたい？", "何を食べたいの？", "何食べたい？", "何が食べたい？"]
        )
        XCTAssertOneOf(casual("楽しかったですか？"), ["楽しかった？", "楽しかったの？"])
        XCTAssertEqual(casual("遠いですか？"), "遠い？")
        XCTAssertEqual(casual("今日は忙しいですか？"), "今日は忙しい？")
        XCTAssertEqual(casual("どれがいいですか？"), "どれがいい？")
        XCTAssertEqual(casual("ここに座ってもいいですか？"), "ここに座ってもいい？")
        // いい read as the stem of 言う (after ちょっと, でも)
        XCTAssertEqual(casual("ちょっといいですか？"), "ちょっといい？")
        XCTAssertEqual(casual("明日でもいいですか？"), "明日でもいい？")
        XCTAssertEqual(casual("何といいますか？"), "何という？")
    }

    /// んですか is already な + ん + です + か: the ん becomes the の of なの, once.
    func testNDesuKa() {
        XCTAssertOneOf(casual("そうなんですか"), ["そうなの", "そうなんだ"])
        XCTAssertOneOf(casual("学生なんですか？"), ["学生なの？", "学生なんだ？"])
        XCTAssertEqual(casual("行くんですか？"), "行くの？")
        XCTAssertEqual(casual("どうしたんですか？"), "どうしたの？")
        XCTAssertEqual(casual("これは誰のですか？"), "これは誰の？")
        XCTAssertEqual(casual("高いんですか？"), "高いの？")
        XCTAssertEqual(casual("行きたいんですか？"), "行きたいの？")
        XCTAssertEqual(casual("行かないんですか？"), "行かないの？")
        // At the start of a clause MeCab takes ある, かかる and 去る for adnominals, not verbs
        XCTAssertEqual(casual("あるんですか？"), "あるの？")
        XCTAssertEqual(casual("え、あるんですか？"), "え、あるの？")
        XCTAssertEqual(casual("お金、かかるんですか？"), "お金、かかるの？")
        XCTAssertEqual(casual("去るんですか？"), "去るの？")
        XCTAssertEqual(casual("時間があるんですか？"), "時間があるの？")
        // Not the ん of んです: the last kana of a word (see the next test)
        XCTAssertEqual(casual("じかんですか？"), "じかんなの？")
        XCTAssertEqual(casual("ふとんですか？"), "ふとんなの？")
    }

    func testNDesuKaAfterAVerbThatEndsInKu() {
        // DEFECT: at the start of a sentence MeCab reads 歩く + ん as 歩 + くん, a name with the
        // suffix くん. There is no ん token, and the question gets the なの of a noun.
        XCTExpectDefect(casual("歩くんですか？"), shouldBe: "歩くの？")
        XCTExpectDefect(casual("咲くんですか？"), shouldBe: "咲くの？")
    }

    /// MeCab cuts a word it does not know in kana and makes a token of its last ん (じ + か + ん).
    /// That ん is not the ん of んです: the word is a noun and its question ends in なの.
    func testDesuKaAfterAKanaWordThatEndsInN() {
        XCTAssertEqual(casual("いまはなんじかんですか？"), "いまはなんじかんなの？")
        XCTAssertEqual(casual("しけんですか？"), "しけんなの？")
        XCTAssertEqual(casual("がいこくじんですか？"), "がいこくじんなの？")
        XCTAssertEqual(casual("れすとらんですか？"), "れすとらんなの？")
        // DEFECT: two kana words still lose their ん, because MeCab reads what stands before it
        // as a verb + た (かん + た + ん) or as an adjective (た + いい + ん), after which the ん
        // of んです is at home.
        XCTExpectDefect(casual("かんたんですか？"), shouldBe: "かんたんなの？")
        XCTExpectDefect(casual("たいいんですか？"), shouldBe: "たいいんなの？")
    }

    /// です before よ is だ: the よ is already there.
    func testDesuYo() {
        XCTAssertEqual(casual("学生ですよ"), "学生だよ")
        XCTAssertEqual(casual("学生ですよね"), "学生だよね")
        XCTAssertEqual(casual("そうですよ"), "そうだよ")
        XCTAssertEqual(casual("大丈夫ですよ。"), "大丈夫だよ。")
        // After an い-adjective the です goes and the よ stays
        XCTAssertEqual(casual("いいですよ"), "いいよ")
        XCTAssertEqual(casual("もう帰ってもいいですよ。"), "もう帰ってもいいよ。")
    }

    /// だよ only works at the end of a sentence. Before から, けど and し the copula is plain
    /// だ, and before ので and のに it is な. ですが is だけど: だが is correct but is how a man in
    /// a film speaks, and 〜んですが opens every polite request.
    func testDesuInTheMiddleOfASentence() {
        XCTAssertEqual(casual("学生ですが"), "学生だけど")
        XCTAssertEqual(casual("学生ですから"), "学生だから")
        XCTAssertEqual(casual("そうですけど"), "そうだけど")
        XCTAssertOneOf(casual("行きたいのですが"), ["行きたいのだけど", "行きたいんだけど"])
        XCTAssertEqual(casual("予約をしたいんですが。"), "予約をしたいんだけど。")
        XCTAssertEqual(casual("すみません、注文をお願いしたいんですが。"), "すみません、注文をお願いしたいんだけど。")
        XCTAssertEqual(casual("せっかくですが、遠慮します。"), "せっかくだけど、遠慮する。")
        XCTAssertEqual(
            casual("私はマイクと申しますが、田中さんはいらっしゃいますか？"),
            "私はマイクだけど、田中さんはいらっしゃる？"
        )
        XCTAssertEqual(casual("学生ですし"), "学生だし")
        XCTAssertEqual(casual("学生ですので"), "学生なので")
        XCTAssertEqual(casual("学生ですのに"), "学生なのに")
        XCTAssertEqual(casual("好きですけど、高いです。"), "好きだけど、高い。")
        // After an い-adjective there is no copula at all
        XCTAssertEqual(casual("高いですが、買います。"), "高いが、買う。")
        XCTAssertEqual(casual("忙しいですので、行けません。"), "忙しいので、行けない。")
    }

    // MARK: - Polite questions

    /// Plain form + か is not a casual question. Without a question word it is how a boss or a
    /// policeman asks (飲むか？); with one (何, どこ) it reads as a heading or an indirect
    /// question ("what to do at the weekend?"). The casual question drops the か.
    func testPoliteQuestionWithMasuKa() {
        XCTAssertOneOf(
            casual("週末は何をしますか？"),
            ["週末は何をする？", "週末は何をするの？", "週末は何するの？", "週末は何する？"]
        )
        XCTAssertOneOf(casual("どこから来ましたか？"), ["どこから来た？", "どこから来たの？"])
        XCTAssertOneOf(
            casual("どこに住んでいますか？"),
            ["どこに住んでいる？", "どこに住んでいるの？", "どこに住んでるの？", "どこに住んでる？"]
        )
        XCTAssertOneOf(
            casual("日本語を話せますか？"),
            ["日本語を話せる？", "日本語を話せるの？", "日本語話せる？", "日本語は話せる？"]
        )
        XCTAssertOneOf(
            casual("コーヒーを飲みますか？"),
            ["コーヒーを飲む？", "コーヒーを飲むの？", "コーヒー飲む？"]
        )
        XCTAssertOneOf(casual("どうでしたか？"), ["どうだった？", "どうだったの？"])
        // ませんか and ませんでしたか
        XCTAssertEqual(casual("教えてくれませんか？"), "教えてくれない？")
        XCTAssertEqual(casual("食べませんでしたか？"), "食べなかった？")
        // Everyday translations
        XCTAssertEqual(casual("英語を話せますか？"), "英語を話せる？")
        XCTAssertEqual(casual("駅はどこにありますか？"), "駅はどこにある？")
        XCTAssertEqual(casual("いつ帰りますか？"), "いつ帰る？")
        XCTAssertEqual(casual("届きましたか？"), "届いた？")
        XCTAssertEqual(casual("来週の土曜日にパーティーがあります。来ませんか？"), "来週の土曜日にパーティーがある。来ない？")
    }

    /// The か carried the question. Where no question mark follows it, one takes its place,
    /// also in place of a full stop.
    func testQuestionMarkTakesThePlaceOfKa() {
        XCTAssertEqual(casual("どこから来ましたか"), "どこから来た？")
        XCTAssertEqual(casual("食べますか。"), "食べる？")
        XCTAssertEqual(casual("いいですか"), "いい？")
        XCTAssertEqual(casual("おいしいですか。"), "おいしい？")
        XCTAssertEqual(casual("どうでしたか"), "どうだった？")
        XCTAssertEqual(casual("行きますか\n食べますか"), "行く？\n食べる？")
        XCTAssertEqual(casual("「行きますか」と聞きました"), "「行く？」と聞いた")
        // ASCII question marks are kept as they are
        XCTAssertEqual(casual("行きますか??"), "行く??")
        // A plain polite question with a full stop is still a question
        XCTAssertEqual(casual("さあ、そろそろ行きますか。"), "さあ、そろそろ行く？")
        XCTAssertEqual(casual("学生でしたか"), "学生だった？")
    }

    /// A question mark that stands behind other marks is the question mark: none is added.
    func testQuestionMarkBehindOtherMarksIsNotDoubled() {
        XCTAssertEqual(casual("行きますか…？"), "行く…？")
        XCTAssertEqual(casual("いいですか…？"), "いい…？")
        XCTAssertEqual(casual("食べますか！？"), "食べる！？")
        XCTAssertEqual(casual("行きますか!?"), "行く!?")
        XCTAssertEqual(casual("行きますか...?"), "行く...?")
        // The next sentence's question mark is not this one's
        XCTAssertEqual(casual("食べますか。本当？"), "食べる？本当？")
    }

    func testQuestionMarkNextToAnEmojiOrAWaveDash() {
        // DEFECT: (cosmetic) only marks are looked through for a question mark that is already
        // there, and the one that is added goes straight after the verb. With an emoji or a wave
        // dash after か the mark is doubled or lands in front of them, and before an emoji that
        // MeCab tags as a noun (✨) the か stays.
        XCTExpectDefect(casual("行きますか🤷‍♀️？"), shouldBe: "行く🤷‍♀️？")
        XCTExpectDefect(casual("行きますか〜"), shouldBe: "行く〜？", "行く？")
        XCTExpectDefect(casual("行きますか✨"), shouldBe: "行く？✨", "行く✨？")
    }

    /// でしたか。 with a full stop is not a question: it says "I see, so that is how it was",
    /// and the casual form of that is だったか。 A question word in the sentence makes it one.
    ///
    /// A yes/no question written with a full stop (お元気でしたか。) has no question word either.
    /// The casualizer cannot tell it from "I see" and keeps だったか。; the translation service,
    /// which knows whether the source asked, turns that ending into a question
    /// (`testAQuestionInTheSourceStaysAQuestion` in MyMemoryTranslationServiceTests).
    func testDeshitaKaWithAFullStopIsARealization() {
        XCTAssertEqual(casual("そうでしたか。"), "そうだったか。")
        XCTAssertEqual(casual("なるほど、そういうことでしたか。"), "なるほど、そういうことだったか。")
        XCTAssertEqual(casual("ああ、ここでしたか。やっと見つけました。"), "ああ、ここだったか。やっと見つけた。")
        XCTAssertEqual(casual("そうでしたか。大変でしたね。"), "そうだったか。大変だったね。")
        XCTAssertEqual(
            casual("あなたが田中さんでしたか。お会いできて嬉しいです。"),
            "あなたが田中さんだったか。お会いできて嬉しい。"
        )
        // With a question word it asks
        XCTAssertEqual(casual("どうでしたか。"), "どうだった？")
        XCTAssertEqual(casual("旅行はいかがでしたか。"), "旅行はいかがだった？")
        XCTAssertEqual(casual("あの人は誰でしたか。"), "あの人は誰だった？")
        XCTAssertEqual(casual("何時でしたか。"), "何時だった？")
        // MeCab cuts this いつ into い + つ
        XCTAssertEqual(casual("いつでしたか。"), "いつだった？")
        // The question word of the sentence before does not count
        XCTAssertEqual(casual("誰でしたか。そうでしたか。"), "誰だった？そうだったか。")
        XCTAssertEqual(casual("どこですか? そうでしたか。"), "どこなの? そうだったか。")
        // With a question mark, or with no mark at all, it is a question as before
        XCTAssertEqual(casual("そうでしたか？"), "そうだった？")
        XCTAssertEqual(casual("そうでしたか"), "そうだった？")
    }

    func testDeshitaKaAsARealizationThatIsTakenForAQuestion() {
        // DEFECT: the なん of なんだ、 ("oh, is that all") counts as a question word, and the
        // realization after it becomes a question.
        XCTExpectDefect(casual("なんだ、そうでしたか。"), shouldBe: "なんだ、そうだったか。")
        // DEFECT: only a full stop marks the realization. With … or ！ after it the か is taken
        // for a question's and replaced: ああ、そうだった？…
        XCTExpectDefect(casual("ああ、そうでしたか…"), shouldBe: "ああ、そうだったか…")
        XCTExpectDefect(casual("ああ、そういうことでしたか！"), shouldBe: "ああ、そういうことだったか！")
    }

    /// A か that does not end its sentence stays: plain form + か is right in "A or B?".
    func testKaInTheMiddleOfASentenceStays() {
        XCTAssertEqual(casual("行きますか、それとも帰りますか？"), "行くか、それとも帰る？")
        XCTAssertEqual(casual("おいしいですか、それともまずいですか？"), "おいしいか、それともまずい？")
        XCTAssertEqual(casual("行きますかね"), "行くかね")
    }

    // MARK: - Fixed expressions
    //
    // Greetings and set phrases are not conjugated like ordinary sentences: nobody says
    // よろしくお願いする, お疲れ様だった or いただく. "Nice to meet you" and "please" are
    // translated with these phrases, so they are in almost every first message.

    func testDeshitaAfterASetPhrase() {
        XCTAssertOneOf(
            casual("すみませんでした"),
            ["ごめんね", "すみませんでした", "すみません", "ごめん", "ごめんなさい"]
        )
        XCTAssertOneOf(casual("ごちそうさまでした"), ["ごちそうさま", "ごちそうさまでした"])
        XCTAssertOneOf(casual("お疲れ様でした"), ["お疲れ様", "お疲れ様でした", "お疲れ"])
        XCTAssertOneOf(casual("お疲れ様です"), ["お疲れ様", "お疲れ様です", "お疲れ"])
        XCTAssertEqual(casual("お疲れさまでした"), "お疲れさま")
        XCTAssertEqual(casual("遅れてすみませんでした"), "遅れてごめんね")
        XCTAssertEqual(casual("とても美味しかったです、ごちそうさまでした。"), "とても美味しかった、ごちそうさま。")
        // すいません is how すみません is said; after an adverb or は MeCab reads it as 吸う, and
        // the apology used to become "I did not smoke" (本当にすわなかった)
        XCTAssertEqual(casual("すいませんでした。"), "ごめんね。")
        XCTAssertEqual(casual("本当にすいませんでした。"), "本当にごめんね。")
        XCTAssertEqual(casual("昨日はすいませんでした。"), "昨日はごめんね。")
        XCTAssertEqual(casual("遅れてすいませんでした。"), "遅れてごめんね。")
        XCTAssertEqual(casual("すいませんでしたが、もう大丈夫です。"), "すいませんでしたが、もう大丈夫だよ。")
    }

    func testSetPhrasesThatEndInMasu() {
        XCTAssertOneOf(
            casual("よろしくお願いします"),
            ["よろしくね", "よろしくお願いします", "よろしく", "よろしくお願い"]
        )
        XCTAssertOneOf(
            casual("田中です。よろしくお願いします。"),
            ["田中だよ。よろしくね。", "田中だよ。よろしくお願いします。", "田中だよ。よろしく。"]
        )
        XCTAssertOneOf(casual("お願いします"), ["お願い", "お願いします", "お願いね"])
        XCTAssertOneOf(
            casual("水をお願いします"),
            ["水をお願い", "水をお願いします", "水をちょうだい", "水ちょうだい"]
        )
        XCTAssertEqual(casual("どうぞよろしくお願いいたします。"), "どうぞよろしくね。")
        XCTAssertEqual(casual("こちらこそ、よろしくお願いします。"), "こちらこそ、よろしくね。")
        XCTAssertEqual(casual("はじめまして、田中です。よろしくお願いします。"), "はじめまして、田中だよ。よろしくね。")
        // The ね is not doubled
        XCTAssertEqual(casual("よろしくお願いしますね"), "よろしくね")
        XCTAssertEqual(casual("ビールをお願いします。"), "ビールをお願い。")
        XCTAssertEqual(casual("もう一度お願いします"), "もう一度お願い")
        XCTAssertOneOf(casual("かしこまりました。"), ["わかった。", "了解。", "かしこまりました。"])
    }

    /// お願い on its own is a bare noun: it cannot take か, から, ので or が. A set phrase with a
    /// particle after it that goes on with the clause is conjugated like any other verb, and one
    /// that ends in でした or です is left as it is (すみませんだったが is not Japanese).
    func testSetPhraseThatGoesOnIntoItsClause() {
        XCTAssertEqual(casual("誰にお願いしますか？"), "誰にお願いする？")
        XCTAssertEqual(casual("お願いしますから、やめてください。"), "お願いするから、やめてちょうだい。")
        XCTAssertEqual(
            casual("私からもお願いしますので、もう一度考えてください。"),
            "私からもお願いするので、もう一度考えてちょうだい。"
        )
        XCTAssertEqual(
            casual("すみません、お願いしますが、少し手伝ってください。"),
            "すみません、お願いするが、少し手伝ってちょうだい。"
        )
        XCTAssertEqual(casual("すみませんでしたが、もう大丈夫です。"), "すみませんでしたが、もう大丈夫だよ。")
        XCTAssertEqual(casual("お疲れ様ですが、もう少し頑張りましょう。"), "お疲れ様ですが、もう少し頑張りましょう。")
        XCTAssertEqual(casual("ごちそうさまでしたか？"), "ごちそうさまでしたか？")
        // わかった is an ordinary past form and takes any particle
        XCTAssertEqual(casual("かしこまりましたが、少し時間がかかります。"), "わかったが、少し時間がかかる。")
    }

    /// What ends the sentence after a set phrase, or quotes it, leaves it the set phrase: a
    /// mark, an emoji, ー (MeCab tags these as nouns as often as symbols), ね, よ, な, と.
    func testSetPhraseBeforeAMarkOrASentenceEndingParticle() {
        XCTAssertEqual(casual("お願いします!"), "お願い!")
        XCTAssertEqual(casual("よろしくお願いしますー"), "よろしくねー")
        XCTAssertEqual(casual("よろしくお願いします✨"), "よろしくね✨")
        XCTAssertEqual(casual("お願いしますと言った"), "お願いと言った")
        XCTAssertEqual(casual("昨日はすみませんでした。"), "昨日はごめんね。")
        // After ます, な is ね as an older man says it. お願いするな would be "do not ask"
        XCTAssertEqual(casual("お願いしますな"), "お願いな")
        XCTAssertEqual(casual("よろしくお願いしますな"), "よろしくな")
        XCTAssertEqual(casual("お願いしますねえ"), "お願いねえ")
    }

    func testSumimasenDeshitaOfTheVerbSumu() {
        // DEFECT: 気がすみません is the verb 済む ("I was not satisfied"), not the apology. MeCab
        // gives both the same tokens, so the set phrase takes it: 気がごめんね。
        XCTExpectDefect(casual("気がすみませんでした。"), shouldBe: "気がすまなかった。", "気が済まなかった。", "気がすみませんでした。")
        // すいませんでした is also the verb 吸う written in kana ("I did not smoke"). After what is
        // smoked or breathed in it stays the verb
        XCTAssertEqual(casual("タバコはすいませんでした。"), "タバコはすわなかった。")
        XCTAssertEqual(casual("私はタバコをすいませんでした。"), "私はタバコをすわなかった。")
        XCTAssertEqual(casual("彼はタバコをすいませんでしたか？"), "彼はタバコをすわなかった？")
        XCTAssertEqual(casual("昨日はすいませんでした。"), "昨日はごめんね。")
        // DEFECT: after anything else the set phrase takes it
        XCTExpectDefect(casual("何もすいませんでした。"), shouldBe: "何もすわなかった。", "何も吸わなかった。")
    }

    func testSuimasenWithoutDeshita() {
        // DEFECT: only すいませんでした is a set phrase. Without でした, after は or an adverb,
        // MeCab reads すい + ませ + ん as the verb 吸う and the apology becomes "I do not smoke":
        // 昨日はすわない。
        XCTExpectDefect(casual("昨日はすいません。"), shouldBe: "昨日はすいません。", "昨日はごめんね。", "昨日はごめん。")
    }

    /// いただきます before a meal has no casual form. As a verb in a sentence it is conjugated
    /// like any other.
    func testItadakimasuIsKeptAsAGreetingOnly() {
        XCTAssertEqual(casual("いただきます"), "いただきます")
        XCTAssertEqual(casual("いただきます。"), "いただきます。")
        XCTAssertEqual(casual("では、いただきます！"), "では、いただきます！")
        XCTAssertEqual(casual("コーヒーをいただきます"), "コーヒーをいただく")
    }

    /// ございます is the polite ある, おります the humble いる, いたします the humble する and
    /// と申します the humble "I am called". Their own dictionary forms (ござる, おる, 申す) are
    /// the speech of a period drama.
    func testHumbleAndHonorificVerbs() {
        XCTAssertOneOf(
            casual("トイレはあちらにございます"),
            ["トイレはあちらにある", "トイレはあっちにある", "トイレはあちらにあるよ", "トイレはあちらにございます"]
        )
        XCTAssertOneOf(
            casual("ジョンと申します"),
            ["ジョンだよ", "ジョンと申します", "ジョンという", "ジョンと言う", "ジョンっていうよ", "ジョンっていうんだ"]
        )
        XCTAssertEqual(casual("私は田中と申します。"), "私は田中だよ。")
        XCTAssertEqual(casual("英語のメニューはございますか？"), "英語のメニューはある？")
        XCTAssertEqual(casual("お待ちしております"), "お待ちしている")
        XCTAssertEqual(casual("おりません"), "いない")
        XCTAssertEqual(casual("ご案内いたします"), "ご案内する")
        // でございます and ありがとうございます are not the verb ござる: left as they are
        XCTAssertEqual(casual("こちらでございます"), "こちらでございます")
    }

    /// 〜ていただけますか and 〜てくださいますか are how "Could you ...?" is translated. Their own
    /// plain forms (開けていただける？, 閉めてくださらない？) are the speech of a refined older
    /// woman; friends say もらえる and くれる.
    func testHumbleAndHonorificVerbsAfterATeForm() {
        XCTAssertEqual(casual("窓を開けていただけますか？"), "窓を開けてもらえる？")
        XCTAssertEqual(casual("写真を撮っていただけますか？"), "写真を撮ってもらえる？")
        XCTAssertEqual(casual("タクシーを呼んでいただけますか？"), "タクシーを呼んでもらえる？")
        XCTAssertEqual(casual("教えてくださいますか？"), "教えてくれる？")
        XCTAssertEqual(casual("ドアを閉めてくださいませんか？"), "ドアを閉めてくれない？")
        XCTAssertEqual(casual("手伝ってくださいました。"), "手伝ってくれた。")
        XCTAssertEqual(casual("来ていただきました"), "来てもらった")
        // Written with their kanji
        XCTAssertEqual(casual("教えて頂けますか？"), "教えてもらえる？")
        XCTAssertEqual(casual("教えて下さいますか？"), "教えてくれる？")
        // Not after お / ご + noun, which has no て form to hang もらえる on (ご確認もらえる is
        // not Japanese), and not as the verb "to have"
        XCTAssertEqual(casual("ご確認いただけますか？"), "ご確認いただける？")
        XCTAssertEqual(casual("お待ちいただけますか？"), "お待ちいただける？")
        XCTAssertEqual(casual("領収書をいただけますか？"), "領収書をいただける？")
        // で after a noun is the case particle, and いただく there is "to eat" as often as "to
        // receive": it stays. で after a verb stem is the て form
        XCTAssertEqual(casual("店内でいただきます。"), "店内でいただく。")
        XCTAssertEqual(casual("家族でいただきました"), "家族でいただいた")
        XCTAssertEqual(casual("あとでいただきます。"), "あとでいただく。")
        XCTAssertEqual(casual("店内で頂きます。"), "店内で頂く。")
        XCTAssertEqual(casual("読んでいただきました。"), "読んでもらった。")
        XCTAssertEqual(casual("泳いでいただきました。"), "泳いでもらった。")
        // ないで is a て form too
        XCTAssertEqual(casual("行かないでいただきました。"), "行かないでもらった。")
        // The potential asks for something, after any で
        XCTAssertEqual(casual("メールでいただけますか？"), "メールでもらえる？")
        // Received by mail: either verb is right
        XCTAssertOneOf(casual("メールでいただきました。"), ["メールでいただいた。", "メールでもらった。"])
    }

    func testItadakuAfterATeFormThatIsNotAFavour() {
        // DEFECT: 喜んで is a real て form ("gladly"), and the いただきます after it is "I will
        // have it", not a favour received. It cannot be told from 喜んでいただきました ("they were
        // kind enough to be pleased"), and becomes 喜んでもらう ("I will have them be pleased").
        XCTExpectDefect(casual("喜んでいただきます。"), shouldBe: "喜んでいただく。")
    }

    func testItadakeruAfterNaide() {
        // DEFECT: in front of いただけます MeCab takes the で of ないで for the copula (だ), not for
        // the particle, so "Could you not ...?" keeps the humble verb: 触らないでいただける？
        XCTExpectDefect(casual("触らないでいただけますか？"), shouldBe: "触らないでもらえる？", "触らないでくれる？")
    }

    /// よろしい is the polite いい.
    func testYoroshiiDesuBecomesIi() {
        XCTAssertEqual(casual("ここに座ってもよろしいですか？"), "ここに座ってもいい？")
        XCTAssertEqual(casual("こちらでよろしいですか？"), "こちらでいい？")
        XCTAssertEqual(casual("よろしいですよ。"), "いいよ。")
        // よろしく and よろしければ are other words
        XCTAssertEqual(casual("よろしくね"), "よろしくね")
        XCTAssertEqual(casual("もしよろしければ、連絡先を教えていただけますか？"), "もしよろしければ、連絡先を教えてもらえる？")
    }

    /// ちょうだい cannot stand in the honorific request お / ご + noun + ください. Signs and
    /// service phrases are translated this way ("Please wait a moment").
    func testHonorificRequests() {
        XCTAssertOneOf(
            casual("少々お待ちください"),
            ["少々お待ちください", "少々待って", "少し待って", "ちょっと待って", "ちょっと待ってね"]
        )
        XCTAssertOneOf(casual("ご注意ください"), ["ご注意ください", "注意して", "注意してね", "気をつけて"])
        XCTAssertOneOf(casual("お座りください"), ["お座りください", "座って", "座ってね"])
        XCTAssertEqual(casual("どうぞお入りください。"), "どうぞお入りください。")
        XCTAssertEqual(casual("ご覧ください"), "ご覧ください")
        XCTAssertEqual(casual("お気をつけください"), "お気をつけください")
        XCTAssertEqual(casual("お知らせください"), "お知らせください")
        // お + a thing is an ordinary request
        XCTAssertEqual(casual("お水をください"), "お水をちょうだい")
        XCTAssertEqual(casual("お水ください"), "お水ちょうだい")
        XCTAssertEqual(casual("ビールください"), "ビールちょうだい")
    }
}
