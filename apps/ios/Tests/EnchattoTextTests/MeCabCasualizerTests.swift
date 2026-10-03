import XCTest
@testable import EnchattoText

/// `MeCabCasualizer`: polite Japanese (です / ます) to casual speech. The app runs it over
/// every translation into Japanese (`MyMemoryTranslationService`).
///
/// What it is written to do, from its own comments:
///   verb + ます           dictionary form        行きます   → 行く
///   verb + ました         casual past            行きました → 行った
///   verb + ません         casual negative        行きません → 行かない
///   です / ですか / でした   だよ / なの / だった
///   ください / 下さい       ちょうだい
/// and to leave everything else exactly as it was.
///
/// Two of those rules give one of several equally casual forms. Where a test below accepts more
/// than one output (`XCTAssertOneOf`), the first is what the code produces today:
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

    /// `isGroup2Verb` recognises an ichidan verb by the kana before る. One everyday verb for
    /// each kana in its two lists (へ, し, に and ひ have no everyday ichidan verb written
    /// that way).
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

    /// Ichidan verbs with a kanji straight before る cannot be recognised by their kana and
    /// come from a list (`group2Kanji`).
    func testIchidanVerbsWithAKanjiBeforeRu() {
        XCTAssertEqual(casual("見ました"), "見た")
        XCTAssertEqual(casual("寝ました"), "寝た")
        XCTAssertEqual(casual("寝ません"), "寝ない")
        XCTAssertEqual(casual("出ました"), "出た")
        XCTAssertEqual(casual("出ません"), "出ない")
        XCTAssertEqual(casual("着ました"), "着た")
        // じ is in neither kana list, so these are in the kanji list as whole words.
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
        // Spelled in kana they are told apart by a list (`group1Exceptions`).
        XCTAssertEqual(casual("かえりました"), "かえった")
        XCTAssertEqual(casual("しりません"), "しらない")
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
    // must make of it. The sentences it gets wrong are under "Known defects" below.

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
        ]
        for (input, accepted) in cases {
            XCTAssertOneOf(casual(input), accepted)
        }
    }

    func testCasualizingTwiceChangesNothingMore() {
        let inputs = [
            "明日学校に行きます。", "昨日映画を見ました。", "私はコーヒーを飲みません。",
            "学生です。", "これは何ですか？", "学生でした", "水をください", "食べています",
        ]
        for input in inputs {
            let once = casual(input)
            XCTAssertEqual(casual(once), once, "second pass changed the result for \(input)")
        }
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

    // MARK: - Known defects
    //
    // Each XCTExpectDefect line states the correct output and is an expected failure of its
    // own (see Support.swift).

    func testIchidanVerbsWithAVoicedKanaBeforeRu() {
        // DEFECT: `isGroup2Verb` decides ichidan vs godan from the kana before る, but its two
        // sets leave out most voiced kana: げ ぜ で are missing from the え row and ぎ じ from
        // the い row (べ and び are there). あげる, 逃げる, 過ぎる, 閉じる and 混ぜる are
        // therefore conjugated as godan verbs: 上げました → 上げった, あげません → あげらない.
        XCTExpectDefect(casual("上げました"), shouldBe: "上げた")
        XCTExpectDefect(casual("逃げました"), shouldBe: "逃げた")
        XCTExpectDefect(casual("食べすぎました"), shouldBe: "食べすぎた")
        XCTExpectDefect(casual("高すぎました"), shouldBe: "高すぎた")
        XCTExpectDefect(casual("閉じました"), shouldBe: "閉じた")
        XCTExpectDefect(casual("混ぜました"), shouldBe: "混ぜた")
        XCTExpectDefect(casual("あげません"), shouldBe: "あげない")
        XCTExpectDefect(casual("泳げません"), shouldBe: "泳げない")
    }

    func testGodanVerbsSpelledInKanaThatLookIchidan() {
        // DEFECT: the opposite mistake. しゃべる is godan, but spelled in kana it has an え
        // sound before る and is not in the exception list, so しゃべりました → しゃべた.
        // (喋りました is right, because a kanji before る counts as godan.) The same for
        // すべる (滑る) and まいる (参る).
        XCTExpectDefect(casual("しゃべりました"), shouldBe: "しゃべった")
        XCTExpectDefect(casual("すべりました"), shouldBe: "すべった")
        XCTExpectDefect(casual("まいりました"), shouldBe: "まいった")
    }

    func testMajiruIsGodan() {
        // DEFECT: 混じる is in the list of ichidan verbs (`group2Kanji`) next to 感じる and
        // 信じる, but it is a godan verb (混じらない, 混じった): 混じりました → 混じた.
        XCTExpectDefect(casual("混じりました"), shouldBe: "混じった")
    }

    func testNegativeOfAru() {
        // DEFECT: the negative of ある is ない, not あらない. ありません → あらない, and so
        // ではありません → ではあらない and 申し訳ありません → 申し訳あらない.
        XCTExpectDefect(casual("ありません"), shouldBe: "ない")
        XCTExpectDefect(casual("時間がありません"), shouldBe: "時間がない")
        XCTExpectDefect(casual("学生ではありません"), shouldBe: "学生ではない", "学生じゃない")
        XCTExpectDefect(casual("好きではありません"), shouldBe: "好きではない", "好きじゃない")
        XCTExpectDefect(casual("申し訳ありません"), shouldBe: "申し訳ない", "ごめん", "ごめんね", "申し訳ありません")
    }

    func testPoliteNegativePast() {
        // DEFECT: ませんでした is handled as ません followed by でした, which gives
        // 行きませんでした → 行かないだった.
        XCTExpectDefect(casual("行きませんでした"), shouldBe: "行かなかった")
        XCTExpectDefect(casual("食べませんでした"), shouldBe: "食べなかった")
        XCTExpectDefect(casual("わかりませんでした"), shouldBe: "わからなかった")
    }

    func testDesuAfterAnAdjectiveOrTaiOrNai() {
        // DEFECT: です always becomes だよ, but だ cannot follow an い-adjective, たい or ない:
        // おいしいです → おいしいだよ, 行きたいです → 行きたいだよ. The です has to be dropped.
        // Translations of "it is nice / hot / expensive / fun" all end this way.
        XCTExpectDefect(casual("おいしいです"), shouldBe: "おいしい", "おいしいよ")
        XCTExpectDefect(casual("高いです"), shouldBe: "高い", "高いよ")
        XCTExpectDefect(casual("行きたいです"), shouldBe: "行きたい", "行きたいよ")
        XCTExpectDefect(casual("ラーメンを食べたいです"), shouldBe: "ラーメンを食べたい", "ラーメンを食べたいよ")
        XCTExpectDefect(casual("行かないです"), shouldBe: "行かない", "行かないよ")
        XCTExpectDefect(casual("行かなくてもいいです"), shouldBe: "行かなくてもいい", "行かなくてもいいよ")
        XCTExpectDefect(casual("今日は暑いですね。"), shouldBe: "今日は暑いね。")
        XCTExpectDefect(casual("いいですね"), shouldBe: "いいね")
        XCTExpectDefect(
            casual("お会いできて嬉しいです。"),
            shouldBe: "お会いできて嬉しい。", "お会いできて嬉しいよ。", "会えて嬉しい。", "会えて嬉しいよ。"
        )
        // The past of an い-adjective, かった: 楽しかったです → 楽しかっただよ.
        XCTExpectDefect(casual("楽しかったです"), shouldBe: "楽しかった", "楽しかったよ")
        XCTExpectDefect(casual("とても楽しかったです。"), shouldBe: "とても楽しかった。", "とても楽しかったよ。")
        XCTExpectDefect(casual("おいしかったです"), shouldBe: "おいしかった", "おいしかったよ")
    }

    func testDesuKaAfterAnAdjectiveOrTai() {
        // DEFECT: the same in a question. ですか always becomes なの, but なの needs a noun or
        // a な-adjective in front of it; after an い-adjective or たい it is の or nothing:
        // いいですか → いいなの, 何を食べたいですか？ → 何を食べたいなの？
        XCTExpectDefect(casual("いいですか？"), shouldBe: "いい？", "いいの？")
        XCTExpectDefect(
            casual("写真を撮ってもいいですか？"),
            shouldBe: "写真を撮ってもいい？", "写真を撮ってもいいの？", "写真撮ってもいい？"
        )
        XCTExpectDefect(casual("おいしいですか？"), shouldBe: "おいしい？", "おいしいの？")
        XCTExpectDefect(
            casual("何を食べたいですか？"),
            shouldBe: "何を食べたい？", "何を食べたいの？", "何食べたい？", "何が食べたい？"
        )
        XCTExpectDefect(casual("楽しかったですか？"), shouldBe: "楽しかった？", "楽しかったの？")
    }

    func testNDesuKa() {
        // DEFECT: んですか is already な + ん + です + か, so replacing ですか with なの doubles
        // it: そうなんですか → そうなんなの, 学生なんですか？ → 学生なんなの？
        XCTExpectDefect(casual("そうなんですか"), shouldBe: "そうなの", "そうなんだ")
        XCTExpectDefect(casual("学生なんですか？"), shouldBe: "学生なの？", "学生なんだ？")
    }

    func testDesuYo() {
        // DEFECT: です becomes だよ even when よ already follows: 学生ですよ → 学生だよよ.
        XCTExpectDefect(casual("学生ですよ"), shouldBe: "学生だよ")
        XCTExpectDefect(casual("学生ですよね"), shouldBe: "学生だよね")
        XCTExpectDefect(casual("そうですよ"), shouldBe: "そうだよ")
        // After an い-adjective both defects meet: いいですよ → いいだよよ.
        XCTExpectDefect(casual("いいですよ"), shouldBe: "いいよ")
    }

    func testDesuInTheMiddleOfASentence() {
        // DEFECT: だよ only works at the end of a sentence. Before が, から and けど the result
        // is not Japanese: 学生ですが → 学生だよが, 学生ですから → 学生だよから.
        XCTExpectDefect(casual("学生ですが"), shouldBe: "学生だが", "学生だけど")
        XCTExpectDefect(casual("学生ですから"), shouldBe: "学生だから")
        XCTExpectDefect(casual("そうですけど"), shouldBe: "そうだけど")
        XCTExpectDefect(
            casual("行きたいのですが"),
            shouldBe: "行きたいんだけど", "行きたいのだけど", "行きたいんだが", "行きたいのだが"
        )
    }

    func testDeshitaAfterASetPhrase() {
        // DEFECT: でした → だった and です → だよ are also applied to fixed expressions, where
        // nobody says it: すみませんでした → すみませんだった, ごちそうさまでした →
        // ごちそうさまだった, お疲れ様です → お疲れ様だよ. Leaving the phrase alone would be
        // right; so would its casual form.
        XCTExpectDefect(
            casual("すみませんでした"),
            shouldBe: "すみませんでした", "すみません", "ごめん", "ごめんね", "ごめんなさい"
        )
        XCTExpectDefect(casual("ごちそうさまでした"), shouldBe: "ごちそうさまでした", "ごちそうさま")
        XCTExpectDefect(casual("お疲れ様でした"), shouldBe: "お疲れ様でした", "お疲れ様", "お疲れ")
        XCTExpectDefect(casual("お疲れ様です"), shouldBe: "お疲れ様です", "お疲れ様", "お疲れ")
    }

    func testSetPhrasesThatEndInMasu() {
        // DEFECT: the same for fixed expressions that end in ます. Their verb is put into the
        // dictionary form, which nobody says as a greeting: よろしくお願いします →
        // よろしくお願いする, いただきます → いただく. "Nice to meet you" and "please" are
        // translated with these phrases, so this is in almost every first message.
        XCTExpectDefect(
            casual("よろしくお願いします"),
            shouldBe: "よろしくお願いします", "よろしく", "よろしくね", "よろしくお願い"
        )
        XCTExpectDefect(
            casual("田中です。よろしくお願いします。"),
            shouldBe: "田中だよ。よろしくお願いします。", "田中だよ。よろしく。", "田中だよ。よろしくね。"
        )
        XCTExpectDefect(casual("お願いします"), shouldBe: "お願いします", "お願い", "お願いね")
        XCTExpectDefect(
            casual("水をお願いします"),
            shouldBe: "水をお願いします", "水をお願い", "水をちょうだい", "水ちょうだい"
        )
        XCTExpectDefect(casual("いただきます"), shouldBe: "いただきます")
    }

    func testHumbleAndHonorificVerbs() {
        // DEFECT: ございます is the polite ある and 申します the humble 言う. Their own
        // dictionary forms are the speech of a period drama: トイレはあちらにございます →
        // トイレはあちらにござる, ジョンと申します → ジョンと申す.
        XCTExpectDefect(
            casual("トイレはあちらにございます"),
            shouldBe: "トイレはあちらにある", "トイレはあっちにある", "トイレはあちらにあるよ", "トイレはあちらにございます"
        )
        XCTExpectDefect(
            casual("ジョンと申します"),
            shouldBe: "ジョンと申します", "ジョンという", "ジョンと言う", "ジョンっていうよ", "ジョンっていうんだ", "ジョンだよ"
        )
    }

    func testHonorificRequests() {
        // DEFECT: ください → ちょうだい is also applied to the honorific request お / ご + noun
        // + ください, where ちょうだい cannot stand: 少々お待ちください → 少々お待ちちょうだい.
        // Signs and service phrases are translated this way ("Please wait a moment").
        XCTExpectDefect(
            casual("少々お待ちください"),
            shouldBe: "少々お待ちください", "少々待って", "少し待って", "ちょっと待って", "ちょっと待ってね"
        )
        XCTExpectDefect(casual("ご注意ください"), shouldBe: "ご注意ください", "注意して", "注意してね", "気をつけて")
        XCTExpectDefect(casual("お座りください"), shouldBe: "お座りください", "座って", "座ってね")
    }

    func testPoliteQuestionWithMasuKa() {
        // DEFECT: ですか becomes なの, but ますか and ましたか only lose their ます, which leaves
        // plain form + か: 週末は何をしますか？ → 週末は何をするか？ Plain form + か is not a
        // casual question. Without a question word it is how a boss or a policeman asks
        // (飲むか？); with one (何, どこ) it reads as a heading or an indirect question
        // ("what to do at the weekend?"), not as something said to a guest. The casual question
        // drops か or ends in の.
        XCTExpectDefect(
            casual("週末は何をしますか？"),
            shouldBe: "週末は何をする？", "週末は何をするの？", "週末は何するの？", "週末は何する？"
        )
        XCTExpectDefect(casual("どこから来ましたか？"), shouldBe: "どこから来たの？", "どこから来た？")
        XCTExpectDefect(
            casual("どこに住んでいますか？"),
            shouldBe: "どこに住んでいるの？", "どこに住んでるの？", "どこに住んでいる？", "どこに住んでる？"
        )
        XCTExpectDefect(
            casual("日本語を話せますか？"),
            shouldBe: "日本語を話せる？", "日本語を話せるの？", "日本語話せる？", "日本語は話せる？"
        )
        XCTExpectDefect(
            casual("コーヒーを飲みますか？"),
            shouldBe: "コーヒーを飲む？", "コーヒーを飲むの？", "コーヒー飲む？"
        )
        // でしたか: どうでしたか？ → どうだったか？
        XCTExpectDefect(casual("どうでしたか？"), shouldBe: "どうだった？", "どうだったの？")
    }
}
