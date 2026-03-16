import Foundation

/// Generates unique bilingual (English + Japanese) drawing prompts for the game.
/// Uses curated word banks so prompts are different every time.
struct PromptGenerator {

    struct GamePrompt {
        let text: String    // English
        let ja: String      // Japanese
        let hint: String?
        let hintJa: String?
    }

    // MARK: - Word Banks (English, Japanese)

    private static let adjectives: [(en: String, ja: String)] = [
        ("Angry", "怒った"), ("Happy", "幸せな"), ("Sleepy", "眠い"),
        ("Dancing", "踊る"), ("Flying", "飛ぶ"), ("Crying", "泣く"),
        ("Singing", "歌う"), ("Running", "走る"), ("Magic", "魔法の"),
        ("Ninja", "忍者"), ("Zombie", "ゾンビ"), ("Disco", "ディスコ"),
        ("Exploding", "爆発する"), ("Stinky", "臭い"), ("Muscle", "筋肉"),
        ("Screaming", "叫ぶ"), ("Surfing", "サーフィン"), ("Invisible", "透明な"),
        ("Giant", "巨大な"), ("Tiny", "小さな"), ("Frozen", "凍った"),
        ("Golden", "金色の"), ("Rainbow", "虹色の"), ("Pirate", "海賊"),
        ("Royal", "王様の"), ("Baby", "赤ちゃん"), ("Grumpy", "不機嫌な"),
        ("Fancy", "おしゃれな"), ("Spooky", "怖い"), ("Fluffy", "ふわふわの"),
        ("Electric", "電気の"), ("Hungry", "お腹すいた"), ("Shy", "恥ずかしい"),
        ("Brave", "勇敢な"), ("Dizzy", "めまいの"), ("Funky", "ファンキーな"),
    ]

    private static let nouns: [(en: String, ja: String)] = [
        ("Cat", "猫"), ("Dog", "犬"), ("Banana", "バナナ"),
        ("Pizza", "ピザ"), ("Robot", "ロボット"), ("Dragon", "ドラゴン"),
        ("Shark", "サメ"), ("Penguin", "ペンギン"), ("Frog", "カエル"),
        ("Snail", "カタツムリ"), ("Spider", "クモ"), ("Skeleton", "骸骨"),
        ("Burger", "バーガー"), ("Egg", "卵"), ("Cake", "ケーキ"),
        ("Toilet", "トイレ"), ("Taco", "タコス"), ("Donut", "ドーナツ"),
        ("Pineapple", "パイナップル"), ("Potato", "ジャガイモ"),
        ("Octopus", "タコ"), ("Flamingo", "フラミンゴ"), ("Cactus", "サボテン"),
        ("Unicorn", "ユニコーン"), ("Monkey", "サル"), ("Panda", "パンダ"),
        ("Chicken", "ニワトリ"), ("Whale", "クジラ"), ("Dinosaur", "恐竜"),
        ("Alien", "宇宙人"), ("Ghost", "お化け"), ("Snowman", "雪だるま"),
        ("Tornado", "竜巻"), ("Volcano", "火山"), ("Moon", "月"),
        ("Sandwich", "サンドイッチ"), ("Sushi", "寿司"), ("Truck", "トラック"),
    ]

    private static let actions: [(en: String, ja: String)] = [
        ("riding a skateboard", "スケボーに乗る"),
        ("eating ice cream", "アイスを食べる"),
        ("playing the piano", "ピアノを弾く"),
        ("wearing sunglasses", "サングラスをかけた"),
        ("lifting weights", "ウエイトを持ち上げる"),
        ("giving a hug", "ハグする"),
        ("doing karate", "空手をする"),
        ("using a phone", "スマホを使う"),
        ("taking a selfie", "自撮りする"),
        ("riding a bicycle", "自転車に乗る"),
        ("juggling balls", "ボールをジャグリングする"),
        ("reading a book", "本を読む"),
        ("cooking dinner", "夕飯を作る"),
        ("doing ballet", "バレエをする"),
        ("flying a plane", "飛行機を操縦する"),
        ("driving a car", "車を運転する"),
        ("swimming in a pool", "プールで泳ぐ"),
        ("climbing a mountain", "山を登る"),
        ("singing karaoke", "カラオケを歌う"),
        ("winning a race", "レースに勝つ"),
    ]

    private static let hints: [(en: String, ja: String)] = [
        ("Furious creature", "怒りの生き物"),
        ("Tiny and cute", "小さくてかわいい"),
        ("Bathroom disaster", "トイレの大惨事"),
        ("Gassy machine", "ガスの出る機械"),
        ("Sad food", "悲しい食べ物"),
        ("Eight-legged groover", "8本足のダンサー"),
        ("Smelly royalty", "臭い王族"),
        ("Undead creature", "アンデッドの生き物"),
        ("Super strong", "超強い"),
        ("Space visitor", "宇宙の訪問者"),
        ("Spooky animal", "怖い動物"),
        ("Giant with teeth", "歯のある巨大なもの"),
        ("Loud breakfast", "うるさい朝ごはん"),
        ("Enchanted clothing", "魔法の服"),
        ("Volcanic dessert", "火山のデザート"),
        ("Stealthy elder", "こっそり動くお年寄り"),
        ("Fast slow thing", "速い遅いもの"),
        ("Dancing bones", "踊る骨"),
        ("Ocean predator", "海の捕食者"),
        ("Famous brown swirl", "有名な茶色の渦巻き"),
    ]

    // MARK: - Generation

    /// Generate unique prompts for a game.
    /// - Parameters:
    ///   - count: Number of prompts to generate (default 10)
    ///   - level: Difficulty level (1-4)
    /// - Returns: Array of bilingual prompts
    static func generate(count: Int = 10, level: Int) -> [GamePrompt] {
        var results: [GamePrompt] = []
        var usedTexts = Set<String>()

        let shuffledAdj = adjectives.shuffled()
        let shuffledNouns = nouns.shuffled()
        let shuffledActions = actions.shuffled()
        var adjIdx = 0
        var nounIdx = 0
        var actionIdx = 0

        for _ in 0..<count {
            let adj = shuffledAdj[adjIdx % shuffledAdj.count]
            let noun = shuffledNouns[nounIdx % shuffledNouns.count]
            adjIdx += 1
            nounIdx += 1

            let prompt: GamePrompt

            switch level {
            case 1:
                // Single noun only
                prompt = GamePrompt(text: noun.en, ja: noun.ja, hint: nil, hintJa: nil)

            case 2:
                // "Adjective Noun"
                let text = "\(adj.en) \(noun.en)"
                let ja = "\(adj.ja)\(noun.ja)"
                prompt = GamePrompt(text: text, ja: ja, hint: nil, hintJa: nil)

            case 3:
                // "Noun + action"
                let action = shuffledActions[actionIdx % shuffledActions.count]
                actionIdx += 1
                let text = "\(noun.en) \(action.en)"
                let ja = "\(action.ja)\(noun.ja)"
                prompt = GamePrompt(text: text, ja: ja, hint: nil, hintJa: nil)

            default:
                // Level 4+: "Adjective Noun + action"
                let action = shuffledActions[actionIdx % shuffledActions.count]
                actionIdx += 1
                let text = "\(adj.en) \(noun.en) \(action.en)"
                let ja = "\(adj.ja)\(noun.ja)が\(action.ja)"
                prompt = GamePrompt(text: text, ja: ja, hint: nil, hintJa: nil)
            }

            // Ensure uniqueness
            if usedTexts.contains(prompt.text) {
                nounIdx += 1
                continue
            }
            usedTexts.insert(prompt.text)
            results.append(prompt)

            if results.count >= count { break }
        }

        // If we didn't get enough (unlikely), pad with remaining combos
        while results.count < count {
            let adj = adjectives.randomElement()!
            let noun = nouns.randomElement()!
            let text = "\(adj.en) \(noun.en)"
            guard !usedTexts.contains(text) else { continue }
            usedTexts.insert(text)
            results.append(GamePrompt(text: text, ja: "\(adj.ja)\(noun.ja)", hint: nil, hintJa: nil))
        }

        return results
    }
}
