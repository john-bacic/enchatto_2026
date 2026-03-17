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
        // Emotions & States
        ("Angry", "怒った"), ("Happy", "幸せな"), ("Sleepy", "眠い"),
        ("Crying", "泣く"), ("Grumpy", "不機嫌な"), ("Shy", "恥ずかしい"),
        ("Brave", "勇敢な"), ("Dizzy", "めまいの"), ("Confused", "混乱した"),
        ("Nervous", "緊張した"), ("Excited", "ワクワクした"), ("Bored", "退屈な"),
        ("Scared", "怖がった"), ("Proud", "誇らしい"), ("Jealous", "嫉妬した"),
        ("Lonely", "寂しい"), ("Cheerful", "陽気な"), ("Grouchy", "機嫌の悪い"),
        ("Shocked", "ショックを受けた"), ("Furious", "激怒した"), ("Calm", "穏やかな"),
        ("Gloomy", "憂鬱な"), ("Panicking", "パニックの"), ("Dreamy", "夢見がちな"),
        ("Lovesick", "恋煩いの"), ("Terrified", "おびえた"), ("Embarrassed", "恥ずかしがった"),
        ("Relieved", "ほっとした"), ("Suspicious", "怪しげな"), ("Amazed", "驚嘆した"),
        ("Cranky", "イライラした"), ("Hyper", "ハイテンションの"), ("Moody", "気まぐれな"),
        ("Peaceful", "平和な"), ("Worried", "心配した"), ("Delighted", "大喜びの"),
        // Actions & Movement
        ("Dancing", "踊る"), ("Flying", "飛ぶ"), ("Singing", "歌う"),
        ("Running", "走る"), ("Surfing", "サーフィン"), ("Swimming", "泳ぐ"),
        ("Climbing", "登る"), ("Jumping", "ジャンプする"), ("Spinning", "回転する"),
        ("Crawling", "這う"), ("Bouncing", "弾む"), ("Sliding", "滑る"),
        ("Falling", "落ちる"), ("Rolling", "転がる"), ("Floating", "浮かぶ"),
        ("Sprinting", "全力で走る"), ("Tiptoeing", "つま先で歩く"), ("Waddling", "よちよち歩く"),
        ("Galloping", "駆ける"), ("Stomping", "足踏みする"), ("Twirling", "くるくる回る"),
        ("Leaping", "跳び上がる"), ("Swinging", "ブランコに乗る"), ("Somersaulting", "宙返りする"),
        ("Sleepwalking", "夢遊病の"), ("Marching", "行進する"), ("Skipping", "スキップする"),
        ("Tumbling", "転げ落ちる"), ("Wobbling", "ふらふら歩く"), ("Flipping", "回転する"),
        // Appearance & Style
        ("Magic", "魔法の"), ("Ninja", "忍者"), ("Zombie", "ゾンビ"),
        ("Disco", "ディスコ"), ("Pirate", "海賊"), ("Royal", "王様の"),
        ("Fancy", "おしゃれな"), ("Funky", "ファンキーな"), ("Cowboy", "カウボーイ"),
        ("Superhero", "スーパーヒーロー"), ("Viking", "バイキング"), ("Samurai", "侍"),
        ("Wizard", "魔法使い"), ("Princess", "お姫様"), ("Astronaut", "宇宙飛行士"),
        ("Pharaoh", "ファラオ"), ("Chef", "シェフ"), ("Detective", "探偵"),
        ("Rock Star", "ロックスター"), ("Gangster", "ギャングの"), ("Clown", "ピエロ"),
        ("Knight", "騎士"), ("Monk", "修行僧"), ("Gladiator", "剣闘士"),
        ("Sumo", "相撲"), ("Punk", "パンクの"), ("Gothic", "ゴシックの"),
        ("Hippie", "ヒッピー"), ("Military", "軍隊の"), ("Safari", "サファリの"),
        ("Steampunk", "スチームパンクの"), ("Tropical", "トロピカルな"), ("Arctic", "北極の"),
        // Physical
        ("Giant", "巨大な"), ("Tiny", "小さな"), ("Fluffy", "ふわふわの"),
        ("Muscle", "筋肉"), ("Chubby", "ぽっちゃりした"), ("Stretchy", "伸びる"),
        ("Spiky", "トゲトゲの"), ("Slimy", "ヌルヌルの"), ("Hairy", "毛深い"),
        ("Flat", "ぺちゃんこの"), ("Round", "丸い"), ("Wobbly", "グラグラの"),
        ("Wrinkly", "しわしわの"), ("Puffed-up", "膨らんだ"), ("Skinny", "ガリガリの"),
        ("Lumpy", "ゴツゴツした"), ("Curly", "クルクルの"), ("Bald", "ハゲの"),
        ("Muscular", "筋肉質の"), ("Lanky", "ひょろ長い"), ("Stocky", "ずんぐりした"),
        ("Towering", "そびえ立つ"), ("Pocket-sized", "ポケットサイズの"), ("Inflatable", "膨らませた"),
        ("Transparent", "半透明の"), ("Metallic", "メタリックな"), ("Wooden", "木製の"),
        ("Paper-thin", "紙のように薄い"), ("Rubber", "ゴムの"), ("Stuffed", "ぬいぐるみの"),
        // Descriptive
        ("Exploding", "爆発する"), ("Stinky", "臭い"), ("Screaming", "叫ぶ"),
        ("Invisible", "透明な"), ("Frozen", "凍った"), ("Golden", "金色の"),
        ("Rainbow", "虹色の"), ("Baby", "赤ちゃん"), ("Spooky", "怖い"),
        ("Electric", "電気の"), ("Hungry", "お腹すいた"), ("Glowing", "光る"),
        ("Burning", "燃えている"), ("Melting", "溶ける"), ("Sparkling", "キラキラの"),
        ("Striped", "縞模様の"), ("Polka-dot", "水玉の"), ("Upside-down", "逆さまの"),
        ("Backwards", "後ろ向きの"), ("Miniature", "ミニチュアの"), ("Enormous", "巨大な"),
        ("Rusty", "錆びた"), ("Shiny", "ピカピカの"), ("Foggy", "霧の"),
        ("Bubbly", "泡だらけの"), ("Crunchy", "カリカリの"), ("Soggy", "びしょびしょの"),
        ("Windy", "風の強い"), ("Stormy", "嵐の"), ("Sunny", "晴れの"),
        ("Toxic", "毒の"), ("Radioactive", "放射能の"), ("Magnetic", "磁石の"),
        ("Volcanic", "火山の"), ("Underwater", "水中の"), ("Underground", "地下の"),
        ("Camouflaged", "迷彩の"), ("Neon", "ネオンの"), ("Holographic", "ホログラムの"),
        ("Pixelated", "ピクセルの"), ("Cardboard", "段ボールの"), ("Diamond", "ダイヤモンドの"),
        ("Inflated", "膨張した"), ("Deflated", "しぼんだ"), ("Overloaded", "積み過ぎの"),
        ("Haunted", "呪われた"), ("Blessed", "祝福された"), ("Enchanted", "魔法にかかった"),
        ("Cursed", "呪われた"), ("Possessed", "取り憑かれた"), ("Hypnotized", "催眠術にかかった"),
        // Funny
        ("Dramatic", "ドラマチックな"), ("Clumsy", "ドジな"), ("Sassy", "生意気な"),
        ("Sneaky", "こっそりした"), ("Silly", "おバカな"), ("Wild", "ワイルドな"),
        ("Crazy", "クレイジーな"), ("Mysterious", "ミステリアスな"), ("Famous", "有名な"),
        ("Secret", "秘密の"), ("Legendary", "伝説の"), ("Ancient", "古代の"),
        ("Hangry", "空腹で怒った"), ("Sarcastic", "皮肉な"), ("Awkward", "気まずい"),
        ("Chaotic", "カオスな"), ("Ridiculous", "バカバカしい"), ("Absurd", "不条理な"),
        ("Overly-dramatic", "大げさな"), ("Photobombing", "写真に割り込む"), ("Lost", "迷子の"),
        ("Overconfident", "自信過剰な"), ("Clueless", "手がかりのない"), ("Mischievous", "いたずらな"),
        ("Rebellious", "反抗的な"), ("Grumbling", "ぶつぶつ言う"), ("Snoring", "いびきをかく"),
        ("Hiccupping", "しゃっくりする"), ("Yawning", "あくびする"), ("Winking", "ウインクする"),
        // Temperature & Weather
        ("Boiling", "沸騰した"), ("Freezing", "凍える"), ("Steaming", "湯気の出る"),
        ("Sweaty", "汗だくの"), ("Frosty", "霜のついた"), ("Dripping", "滴る"),
        ("Soaking", "ずぶ濡れの"), ("Dusty", "ほこりだらけの"), ("Muddy", "泥だらけの"),
        ("Sandy", "砂まみれの"), ("Snowy", "雪まみれの"), ("Dewy", "朝露の"),
    ]

    private static let nouns: [(en: String, ja: String)] = [
        // Animals - Common
        ("Cat", "猫"), ("Dog", "犬"), ("Frog", "カエル"),
        ("Rabbit", "うさぎ"), ("Duck", "アヒル"), ("Pig", "ブタ"),
        ("Horse", "馬"), ("Sheep", "ひつじ"), ("Cow", "牛"),
        ("Mouse", "ネズミ"), ("Hamster", "ハムスター"), ("Goldfish", "金魚"),
        ("Goat", "ヤギ"), ("Donkey", "ロバ"), ("Rooster", "雄鶏"),
        ("Goose", "ガチョウ"), ("Turkey", "七面鳥"), ("Ferret", "フェレット"),
        // Animals - Wild
        ("Shark", "サメ"), ("Penguin", "ペンギン"), ("Snail", "カタツムリ"),
        ("Spider", "クモ"), ("Octopus", "タコ"), ("Flamingo", "フラミンゴ"),
        ("Monkey", "サル"), ("Panda", "パンダ"), ("Chicken", "ニワトリ"),
        ("Whale", "クジラ"), ("Dinosaur", "恐竜"), ("Dragon", "ドラゴン"),
        ("Elephant", "象"), ("Giraffe", "キリン"), ("Lion", "ライオン"),
        ("Tiger", "トラ"), ("Bear", "クマ"), ("Owl", "フクロウ"),
        ("Bee", "ハチ"), ("Butterfly", "蝶"), ("Dolphin", "イルカ"),
        ("Parrot", "オウム"), ("Turtle", "カメ"), ("Crocodile", "ワニ"),
        ("Jellyfish", "クラゲ"), ("Lobster", "ロブスター"), ("Koala", "コアラ"),
        ("Sloth", "ナマケモノ"), ("Peacock", "クジャク"), ("Chameleon", "カメレオン"),
        ("Hedgehog", "ハリネズミ"), ("Bat", "コウモリ"), ("Eagle", "ワシ"),
        ("Gorilla", "ゴリラ"), ("Kangaroo", "カンガルー"), ("Zebra", "シマウマ"),
        ("Hippo", "カバ"), ("Rhino", "サイ"), ("Scorpion", "サソリ"),
        ("Otter", "カワウソ"), ("Fox", "キツネ"), ("Wolf", "オオカミ"),
        ("Raccoon", "アライグマ"), ("Skunk", "スカンク"), ("Moose", "ヘラジカ"),
        ("Seal", "アザラシ"), ("Walrus", "セイウチ"), ("Polar Bear", "シロクマ"),
        ("Stingray", "エイ"), ("Porcupine", "ヤマアラシ"), ("Armadillo", "アルマジロ"),
        ("Platypus", "カモノハシ"), ("Narwhal", "イッカク"), ("Axolotl", "ウーパールーパー"),
        ("Capybara", "カピバラ"), ("Llama", "ラマ"), ("Alpaca", "アルパカ"),
        ("Yak", "ヤク"), ("Vulture", "ハゲタカ"), ("Pelican", "ペリカン"),
        ("Toucan", "オオハシ"), ("Crane", "鶴"), ("Swan", "白鳥"),
        // Food
        ("Banana", "バナナ"), ("Pizza", "ピザ"), ("Burger", "バーガー"),
        ("Egg", "卵"), ("Cake", "ケーキ"), ("Taco", "タコス"),
        ("Donut", "ドーナツ"), ("Pineapple", "パイナップル"), ("Potato", "ジャガイモ"),
        ("Sandwich", "サンドイッチ"), ("Sushi", "寿司"), ("Ice Cream", "アイスクリーム"),
        ("Watermelon", "スイカ"), ("Broccoli", "ブロッコリー"), ("Cheese", "チーズ"),
        ("Cookie", "クッキー"), ("Popcorn", "ポップコーン"), ("Noodles", "ラーメン"),
        ("Pancake", "パンケーキ"), ("Cupcake", "カップケーキ"), ("Hot Dog", "ホットドッグ"),
        ("Avocado", "アボカド"), ("Mushroom", "きのこ"), ("Corn", "とうもろこし"),
        ("Pretzel", "プレッツェル"), ("Waffle", "ワッフル"), ("Lollipop", "ペロペロキャンディ"),
        ("Onion", "たまねぎ"), ("Garlic", "にんにく"), ("Chili Pepper", "唐辛子"),
        ("Steak", "ステーキ"), ("Fried Chicken", "フライドチキン"), ("Pie", "パイ"),
        ("Baguette", "バゲット"), ("Croissant", "クロワッサン"), ("Muffin", "マフィン"),
        ("Burrito", "ブリトー"), ("Dumpling", "餃子"), ("Spring Roll", "春巻き"),
        ("Curry", "カレー"), ("Tempura", "天ぷら"), ("Onigiri", "おにぎり"),
        ("Mochi", "餅"), ("Macaron", "マカロン"), ("Churro", "チュロス"),
        ("Candy", "キャンディ"), ("Chocolate", "チョコレート"), ("Gummy Bear", "グミベア"),
        ("Jelly", "ゼリー"), ("Pudding", "プリン"), ("Toast", "トースト"),
        ("Cereal", "シリアル"), ("Smoothie", "スムージー"), ("Milkshake", "ミルクシェイク"),
        // Objects & Things
        ("Robot", "ロボット"), ("Skeleton", "骸骨"), ("Toilet", "トイレ"),
        ("Cactus", "サボテン"), ("Alien", "宇宙人"), ("Ghost", "お化け"),
        ("Snowman", "雪だるま"), ("Truck", "トラック"), ("Rocket", "ロケット"),
        ("Umbrella", "傘"), ("Guitar", "ギター"), ("Crown", "王冠"),
        ("Sword", "剣"), ("Lamp", "ランプ"), ("Clock", "時計"),
        ("Balloon", "風船"), ("Treasure", "宝物"), ("Anchor", "錨"),
        ("Telescope", "望遠鏡"), ("Skateboard", "スケートボード"), ("Bicycle", "自転車"),
        ("Candle", "ろうそく"), ("Key", "鍵"), ("Ladder", "はしご"),
        ("Backpack", "リュックサック"), ("Camera", "カメラ"), ("Drum", "太鼓"),
        ("Unicorn", "ユニコーン"), ("Pirate Ship", "海賊船"), ("Train", "電車"),
        ("Helicopter", "ヘリコプター"), ("Submarine", "潜水艦"), ("Spaceship", "宇宙船"),
        ("Tank", "戦車"), ("Boat", "ボート"), ("Hot Air Balloon", "気球"),
        ("Trophy", "トロフィー"), ("Medal", "メダル"), ("Shield", "盾"),
        ("Bow and Arrow", "弓矢"), ("Wand", "杖"), ("Potion", "ポーション"),
        ("Bomb", "爆弾"), ("Dynamite", "ダイナマイト"), ("Boomerang", "ブーメラン"),
        ("Magnet", "磁石"), ("Compass", "コンパス"), ("Hourglass", "砂時計"),
        ("Dice", "サイコロ"), ("Puzzle Piece", "パズルピース"), ("Yo-Yo", "ヨーヨー"),
        ("Trampoline", "トランポリン"), ("Hammock", "ハンモック"), ("Tent", "テント"),
        ("Fishing Rod", "釣り竿"), ("Binoculars", "双眼鏡"), ("Megaphone", "メガホン"),
        ("Chainsaw", "チェーンソー"), ("Plunger", "ラバーカップ"), ("Vacuum", "掃除機"),
        // Nature & Places
        ("Tornado", "竜巻"), ("Volcano", "火山"), ("Moon", "月"),
        ("Sun", "太陽"), ("Rainbow", "虹"), ("Cloud", "雲"),
        ("Mountain", "山"), ("Island", "島"), ("Waterfall", "滝"),
        ("Tree", "木"), ("Flower", "花"), ("Star", "星"),
        ("Lightning", "稲妻"), ("Snowflake", "雪の結晶"), ("Wave", "波"),
        ("Castle", "城"), ("Bridge", "橋"), ("Lighthouse", "灯台"),
        ("Palm Tree", "ヤシの木"), ("Mushroom Cloud", "きのこ雲"), ("Iceberg", "氷山"),
        ("Desert", "砂漠"), ("Jungle", "ジャングル"), ("Cave", "洞窟"),
        ("Pyramid", "ピラミッド"), ("Igloo", "イグルー"), ("Treehouse", "ツリーハウス"),
        ("Windmill", "風車"), ("Fountain", "噴水"), ("Campfire", "焚き火"),
        ("Comet", "彗星"), ("Black Hole", "ブラックホール"), ("Saturn", "土星"),
        ("Aurora", "オーロラ"), ("Earthquake", "地震"), ("Tidal Wave", "津波"),
        // People & Characters
        ("Mummy", "ミイラ"), ("Vampire", "吸血鬼"), ("Werewolf", "狼男"),
        ("Frankenstein", "フランケンシュタイン"), ("Genie", "魔神"),
        ("Mermaid", "人魚"), ("Cyclops", "サイクロプス"), ("Yeti", "雪男"),
        ("Bigfoot", "ビッグフット"), ("Gnome", "ノーム"), ("Troll", "トロール"),
        ("Fairy", "妖精"), ("Elf", "エルフ"), ("Ogre", "鬼"),
        ("Centaur", "ケンタウロス"), ("Minotaur", "ミノタウロス"), ("Phoenix", "不死鳥"),
        ("Kraken", "クラーケン"), ("Griffin", "グリフィン"), ("Sphinx", "スフィンクス"),
    ]

    private static let actions: [(en: String, ja: String)] = [
        // Sports & Activities
        ("riding a skateboard", "スケボーに乗る"),
        ("riding a bicycle", "自転車に乗る"),
        ("doing karate", "空手をする"),
        ("doing ballet", "バレエをする"),
        ("lifting weights", "ウエイトを持ち上げる"),
        ("swimming in a pool", "プールで泳ぐ"),
        ("climbing a mountain", "山を登る"),
        ("winning a race", "レースに勝つ"),
        ("juggling balls", "ボールをジャグリングする"),
        ("surfing a wave", "波に乗る"),
        ("skiing downhill", "スキーで滑る"),
        ("playing basketball", "バスケをする"),
        ("doing yoga", "ヨガをする"),
        ("boxing", "ボクシングをする"),
        ("ice skating", "アイススケートをする"),
        ("riding a horse", "馬に乗る"),
        ("playing soccer", "サッカーをする"),
        ("throwing a frisbee", "フリスビーを投げる"),
        ("doing a handstand", "逆立ちをする"),
        ("hula hooping", "フラフープをする"),
        ("snowboarding", "スノーボードをする"),
        ("rock climbing", "ロッククライミングをする"),
        ("bungee jumping", "バンジージャンプをする"),
        ("playing tennis", "テニスをする"),
        ("playing golf", "ゴルフをする"),
        ("doing gymnastics", "体操をする"),
        ("wrestling", "レスリングをする"),
        ("fencing", "フェンシングをする"),
        ("playing cricket", "クリケットをする"),
        ("doing push-ups", "腕立て伏せをする"),
        ("skydiving", "スカイダイビングをする"),
        ("scuba diving", "スキューバダイビングをする"),
        ("water skiing", "水上スキーをする"),
        ("pole vaulting", "棒高跳びをする"),
        ("playing ping pong", "卓球をする"),
        ("bowling", "ボウリングをする"),
        ("archery", "アーチェリーをする"),
        ("playing volleyball", "バレーボールをする"),
        ("figure skating", "フィギュアスケートをする"),
        ("doing a backflip", "バク転をする"),
        // Music & Entertainment
        ("playing the piano", "ピアノを弾く"),
        ("singing karaoke", "カラオケを歌う"),
        ("playing the guitar", "ギターを弾く"),
        ("playing the drums", "ドラムを叩く"),
        ("doing magic tricks", "マジックをする"),
        ("telling jokes", "ジョークを言う"),
        ("breakdancing", "ブレイクダンスをする"),
        ("rapping", "ラップをする"),
        ("playing the violin", "バイオリンを弾く"),
        ("conducting an orchestra", "オーケストラを指揮する"),
        ("playing the trumpet", "トランペットを吹く"),
        ("playing the flute", "フルートを吹く"),
        ("playing the ukulele", "ウクレレを弾く"),
        ("DJing", "DJをする"),
        ("beatboxing", "ビートボックスをする"),
        ("tap dancing", "タップダンスをする"),
        ("line dancing", "ラインダンスをする"),
        ("belly dancing", "ベリーダンスをする"),
        ("miming", "パントマイムをする"),
        ("stand-up comedy", "漫才をする"),
        // Daily Life
        ("eating ice cream", "アイスを食べる"),
        ("wearing sunglasses", "サングラスをかけた"),
        ("giving a hug", "ハグする"),
        ("using a phone", "スマホを使う"),
        ("taking a selfie", "自撮りする"),
        ("reading a book", "本を読む"),
        ("cooking dinner", "夕飯を作る"),
        ("flying a plane", "飛行機を操縦する"),
        ("driving a car", "車を運転する"),
        ("washing dishes", "皿を洗う"),
        ("walking a dog", "犬の散歩をする"),
        ("brushing teeth", "歯を磨く"),
        ("watering plants", "植物に水をやる"),
        ("baking a cake", "ケーキを焼く"),
        ("wrapping a present", "プレゼントを包む"),
        ("writing a letter", "手紙を書く"),
        ("painting a picture", "絵を描く"),
        ("building a sandcastle", "砂の城を作る"),
        ("doing laundry", "洗濯をする"),
        ("mowing the lawn", "芝を刈る"),
        ("shoveling snow", "雪かきをする"),
        ("ironing clothes", "アイロンをかける"),
        ("vacuuming", "掃除機をかける"),
        ("grocery shopping", "買い物をする"),
        ("waiting for a bus", "バスを待つ"),
        ("stuck in traffic", "渋滞にはまった"),
        ("taking out trash", "ゴミ出しをする"),
        ("making the bed", "ベッドを整える"),
        ("feeding a baby", "赤ちゃんに食べさせる"),
        ("changing a lightbulb", "電球を交換する"),
        // Funny & Unusual
        ("fighting a dragon", "ドラゴンと戦う"),
        ("riding a rocket", "ロケットに乗る"),
        ("walking on the moon", "月を歩く"),
        ("catching butterflies", "蝶を捕まえる"),
        ("chasing a tornado", "竜巻を追いかける"),
        ("taming a lion", "ライオンを手懐ける"),
        ("arm wrestling", "腕相撲をする"),
        ("doing a cartwheel", "側転をする"),
        ("blowing bubbles", "シャボン玉を吹く"),
        ("wearing a cape", "マントを着た"),
        ("holding an umbrella", "傘を持っている"),
        ("flying a kite", "凧を揚げる"),
        ("digging for treasure", "宝探しをする"),
        ("sleeping on a cloud", "雲の上で寝る"),
        ("eating with chopsticks", "箸で食べる"),
        ("wrestling a bear", "クマと格闘する"),
        ("riding a whale", "クジラに乗る"),
        ("dancing on a volcano", "火山の上で踊る"),
        ("brushing a dinosaur's teeth", "恐竜の歯を磨く"),
        ("teaching a fish to walk", "魚に歩き方を教える"),
        ("knitting a sweater", "セーターを編む"),
        ("playing chess", "チェスをする"),
        ("solving a mystery", "謎を解く"),
        ("inventing a machine", "機械を発明する"),
        ("building a robot", "ロボットを作る"),
        ("tightrope walking", "綱渡りをする"),
        ("sword fighting", "剣で戦う"),
        ("walking a tightrope", "綱を渡る"),
        ("escaping a maze", "迷路を脱出する"),
        ("opening a treasure chest", "宝箱を開ける"),
        ("casting a spell", "呪文を唱える"),
        ("brewing a potion", "ポーションを調合する"),
        ("riding a rainbow", "虹に乗る"),
        ("sliding down a rainbow", "虹を滑り降りる"),
        ("catching a shooting star", "流れ星を捕まえる"),
        ("hugging a cactus", "サボテンをハグする"),
        ("eating a cloud", "雲を食べる"),
        ("tickling a dragon", "ドラゴンをくすぐる"),
        ("racing a snail", "カタツムリと競走する"),
        ("arm wrestling an octopus", "タコと腕相撲する"),
        ("teaching yoga to a cat", "猫にヨガを教える"),
        ("giving a speech", "スピーチをする"),
        ("winning the lottery", "宝くじに当たる"),
        ("getting struck by lightning", "雷に打たれる"),
        ("discovering a new planet", "新しい惑星を発見する"),
        ("time traveling", "タイムトラベルする"),
        ("shrinking to ant size", "アリのサイズに縮む"),
        ("growing to giant size", "巨大サイズに成長する"),
        ("turning invisible", "透明になる"),
        ("hatching from an egg", "卵から孵化する"),
        ("being chased by bees", "ハチに追いかけられる"),
        ("stuck in quicksand", "流砂にはまった"),
        ("walking through a wall", "壁を通り抜ける"),
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

        for _ in 0..<(count * 2) {
            let adj = shuffledAdj[adjIdx % shuffledAdj.count]
            let noun = shuffledNouns[nounIdx % shuffledNouns.count]
            adjIdx += 1
            nounIdx += 1

            let prompt: GamePrompt

            switch level {
            case 1:
                prompt = GamePrompt(text: noun.en, ja: noun.ja, hint: nil, hintJa: nil)
            case 2:
                let text = "\(adj.en) \(noun.en)"
                let ja = "\(adj.ja)\(noun.ja)"
                prompt = GamePrompt(text: text, ja: ja, hint: nil, hintJa: nil)
            case 3:
                let action = shuffledActions[actionIdx % shuffledActions.count]
                actionIdx += 1
                let text = "\(noun.en) \(action.en)"
                let ja = "\(action.ja)\(noun.ja)"
                prompt = GamePrompt(text: text, ja: ja, hint: nil, hintJa: nil)
            default:
                let action = shuffledActions[actionIdx % shuffledActions.count]
                actionIdx += 1
                let text = "\(adj.en) \(noun.en) \(action.en)"
                let ja = "\(adj.ja)\(noun.ja)が\(action.ja)"
                prompt = GamePrompt(text: text, ja: ja, hint: nil, hintJa: nil)
            }

            if usedTexts.contains(prompt.text) {
                nounIdx += 1
                continue
            }
            usedTexts.insert(prompt.text)
            results.append(prompt)

            if results.count >= count { break }
        }

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
