import Foundation

/// Minimal i18n — keyed by English string, with Japanese translations.
enum L {
    private static let translations: [String: [String: String]] = [
        // Start room
        "Enchatto": ["ja": "Enchatto"],
        "Create a conversation room": ["ja": "会話ルームを作成"],
        "Your nickname": ["ja": "ニックネーム"],
        "Enter your name": ["ja": "名前を入力"],
        "Choose your avatar": ["ja": "アバターを選ぶ"],
        "Your language": ["ja": "あなたの言語"],
        "English": ["ja": "英語"],
        "Japanese": ["ja": "日本語"],
        "Create Room": ["ja": "ルームを作成"],

        // Conversation
        "Loading...": ["ja": "読み込み中…"],
        "Processing...": ["ja": "処理中…"],
        "No messages yet": ["ja": "まだメッセージがありません"],
        "Waiting for participants to start chatting": ["ja": "参加者がチャットを始めるのを待っています"],
        "Type a message...": ["ja": "メッセージを入力…"],
        "Camera": ["ja": "カメラ"],
        "Draw": ["ja": "描く"],
        "Voice": ["ja": "音声"],

        // Reply
        "Replying to": ["ja": "返信先:"],
        "Unknown": ["ja": "不明"],

        // Close room
        "Close this room?": ["ja": "このルームを閉じますか？"],
        "Close Room": ["ja": "ルームを閉じる"],
        "All participants will be disconnected. This cannot be undone.": [
            "ja": "すべての参加者が切断されます。この操作は元に戻せません。"
        ],

        // Closed banner
        "This room has been closed": ["ja": "このルームは閉鎖されました"],
        "Back to Home": ["ja": "ホームに戻る"],

        // Participants
        "Participants": ["ja": "参加者"],
        "Settings": ["ja": "設定"],
        "Done": ["ja": "完了"],
        "host": ["ja": "ホスト"],
        "Online": ["ja": "オンライン"],
        "Offline": ["ja": "オフライン"],
        "Away": ["ja": "離席中"],
        "Remove": ["ja": "削除"],
        "Max participants:": ["ja": "最大参加者数:"],
        "Language": ["ja": "言語"],

        // QR panel
        "Room Code": ["ja": "ルームコード"],
        "Scan or enter code to join": ["ja": "QRコードをスキャンまたはコードを入力して参加"],
        "Tap to copy link": ["ja": "タップしてリンクをコピー"],
        "Copied!": ["ja": "コピーしました！"],

        // Message row
        "Reply": ["ja": "返信"],
        "Save": ["ja": "保存"],
        "Cancel": ["ja": "キャンセル"],
        "Photo": ["ja": "写真"],
        "Drawing": ["ja": "お絵描き"],
        "Processing failed": ["ja": "処理に失敗しました"],

        // Status
        "online": ["ja": "オンライン"],
        "away": ["ja": "離席"],

        // Context menu
        "Copy": ["ja": "コピー"],
        "Delete": ["ja": "削除"],
        "Delete this message?": ["ja": "このメッセージを削除しますか？"],
        "This will remove the message for everyone.": ["ja": "全員のメッセージが削除されます。"],

        // System messages
        "has joined": ["ja": "が参加しました"],
        "has left": ["ja": "が退出しました"],

        // Language toggles
        "Romaji": ["ja": "ローマ字"],

        // Typing indicator
        "is typing": ["ja": "が入力中"],
        "is drawing": ["ja": "が描画中"],
        "is speaking": ["ja": "が話し中"],

        // Game status bar
        "Guessing": ["ja": "推測中"],
        "Starting": ["ja": "開始中"],

        // Drawing composer
        "Clear": ["ja": "消去"],
        "Send": ["ja": "送信"],

        // Game
        "Game": ["ja": "ゲーム"],
        "Games": ["ja": "ゲーム"],
        "Only the host can start a game.": ["ja": "ゲームを開始できるのはホストだけです。"],
        "Got it": ["ja": "了解"],
        "Lost in Translation": ["ja": "ロスト・イン・トランスレーション"],
        "A drawing guessing game: one player draws, everyone else picks from 4 choices. 10 rounds, rotating drawer!": [
            "ja": "お絵描き当てゲーム：1人が描き、他の全員が4択から選ぶ。10ラウンド、描く人は交代！",
        ],
        "players": ["ja": "人のプレイヤー"],
        "Need at least 2 players to start.": ["ja": "開始するには2人以上のプレイヤーが必要です。"],
        "Start Game": ["ja": "ゲーム開始"],
        "Step": ["ja": "ステップ"],
        "of": ["ja": "/"],
        "Draw this phrase:": ["ja": "このフレーズを描いてください："],
        "What is this drawing?": ["ja": "この絵は何ですか？"],
        "Type your guess...": ["ja": "答えを入力…"],
        
        "Submit": ["ja": "送信"],
        "Game Results": ["ja": "ゲーム結果"],
        "Chain": ["ja": "チェーン"],
        "Original:": ["ja": "元のフレーズ："],
        "drew": ["ja": "が描いた"],
        "guessed": ["ja": "が当てた"],
        "Game complete! View Results": ["ja": "ゲーム完了！結果を見る"],
        "Game Started: Lost in Translation": ["ja": "ゲーム開始：ロスト・イン・トランスレーション"],
        "Game ended": ["ja": "ゲーム終了"],
        "End Game": ["ja": "ゲーム終了"],
        "End game?": ["ja": "ゲームを終了しますか？"],
        "This will end the game for all players and show results.": ["ja": "全プレイヤーのゲームを終了し、結果を表示します。"],
        "Quit game?": ["ja": "ゲームをやめますか？"],
        "Are you sure you want to quit the game?": ["ja": "本当にゲームをやめますか？"],
        "Quit": ["ja": "やめる"],
        "Waiting for other players...": ["ja": "他のプレイヤーを待っています…"],
        "Close": ["ja": "閉じる"],

        // Game levels
        "Level": ["ja": "レベル"],
        "Hint:": ["ja": "ヒント："],
        "Next Level": ["ja": "次のレベル"],
        "1 word with hint": ["ja": "1単語＋ヒント"],
        "2 words": ["ja": "2単語"],
        "words": ["ja": "単語"],

        // Dynamic game flow
        "Round": ["ja": "ラウンド"],
        "guessed correctly!": ["ja": "正解！"],
        "guessed wrong": ["ja": "不正解"],

        // Multiple-choice game
        "Correct!": ["ja": "正解!"],
        "Wrong!": ["ja": "不正解!"],
        "Scores": ["ja": "スコア"],
        "picked": ["ja": "を選んだ"],
        "10 rounds": ["ja": "10ラウンド"],
        "correct": ["ja": "正解"],

        // Emojifyr
        "Emojifyr": ["ja": "Emojifyr"],
        "Write something, turn it into emojis, and guess!": ["ja": "何か書いて、絵文字に変えて、当てよう！"],
        "Write something for Emojifyr": ["ja": "Emojifyrに何か書こう"],
        "Write something short and visual that can be turned into emojis.": ["ja": "絵文字に変換できる短くてビジュアルなものを書いてください。"],
        "Generate Emojis": ["ja": "絵文字を生成"],
        "Original:": ["ja": "元の言葉："],
        "Generated emoji clue:": ["ja": "生成された絵文字ヒント："],
        "Random": ["ja": "ランダム"],
        "I don't know": ["ja": "わからない"],
        "is generating emojis...": ["ja": "が絵文字を生成中…"],
        "Use": ["ja": "使う"],
        "Regenerate": ["ja": "再生成"],
        "What does this mean?": ["ja": "これはどういう意味？"],
        "Submit Guess": ["ja": "回答する"],
        "Emojifyr Result": ["ja": "Emojifyr 結果"],
        "Emoji clue:": ["ja": "絵文字ヒント："],
        "Original": ["ja": "元の言葉"],
        "Guesses:": ["ja": "回答："],
        "Continue": ["ja": "続ける"],
        "Waiting for writer...": ["ja": "書き手を待っています…"],
        "Generating emojis...": ["ja": "絵文字を生成中…"],
        "Game Started: Emojifyr": ["ja": "ゲーム開始：Emojifyr"],
        "Your turn to write!": ["ja": "あなたの番です！"],
        "is writing...": ["ja": "が文を書いています…"],
        "Reveal": ["ja": "答えを見る"],
        "Next Round": ["ja": "次のラウンド"],
        "Off": ["ja": "オフ"],
        "Sending to players...": ["ja": "プレイヤーに送信中…"],
        "Reveal Answers": ["ja": "答えを公開"],
        "Guess submitted!": ["ja": "回答送信済み！"],
        "Waiting for reveal...": ["ja": "公開を待っています…"],
        "guess": ["ja": "回答"],
        "guesses": ["ja": "回答"],
        "Waiting for": ["ja": "待っています"],
        "to write something...": ["ja": "が何か書くのを…"],
        "Someone": ["ja": "誰か"],
        "Game Starting...": ["ja": "ゲーム開始中…"],
    ]

    /// Translate a UI string. Returns the key unchanged for English or missing translations.
    static func t(_ key: String, _ lang: String) -> String {
        if lang == "en" { return key }
        return translations[key]?[lang] ?? key
    }
}
