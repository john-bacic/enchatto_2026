/** Minimal i18n — keyed by English string, with Japanese translations. */

const translations: Record<string, Record<string, string>> = {
  // Home page
  "Enchatto": { ja: "Enchatto" },
  "Real-time multilingual conversation rooms.": { ja: "リアルタイム多言語会話ルーム" },
  "Scan QR Code": { ja: "QRコードをスキャン" },
  "or enter code": { ja: "またはコードを入力" },
  "e.g. ABC123": { ja: "例: ABC123" },
  "Join": { ja: "参加" },

  // QR Scanner
  "Camera access denied. Please allow camera permissions.": {
    ja: "カメラへのアクセスが拒否されました。カメラの権限を許可してください。",
  },
  "Close": { ja: "閉じる" },

  // Join page
  "Join Conversation": { ja: "会話に参加" },
  "Room code:": { ja: "ルームコード:" },
  "Nickname": { ja: "ニックネーム" },
  "Enter your name": { ja: "名前を入力" },
  "Choose an avatar": { ja: "アバターを選ぶ" },
  "Your language": { ja: "あなたの言語" },
  "Display languages": { ja: "表示言語" },
  "Joining...": { ja: "参加中…" },
  "Join as": { ja: "として参加" },
  "Looking up room...": { ja: "ルームを検索中…" },
  "Room not found": { ja: "ルームが見つかりません" },
  "Room closed": { ja: "ルーム終了" },
  "The room code is invalid or has expired.": {
    ja: "ルームコードが無効または期限切れです。",
  },
  "This conversation has ended. The host has closed the room.": {
    ja: "この会話は終了しました。ホストがルームを閉じました。",
  },
  "Please enter a nickname": { ja: "ニックネームを入力してください" },
  "This room has been closed": { ja: "このルームは閉鎖されました" },
  "Failed to join room": { ja: "ルームへの参加に失敗しました" },

  // Room page
  "Loading room...": { ja: "ルームを読み込み中…" },
  "This room may have been closed.": { ja: "このルームは閉鎖された可能性があります。" },
  "Join Required": { ja: "参加が必要です" },
  "You need to join this room first.": { ja: "まずこのルームに参加する必要があります。" },
  "Join Room": { ja: "ルームに参加" },
  "This room has been closed by the host.": {
    ja: "このルームはホストによって閉鎖されました。",
  },
  "Leave room?": { ja: "ルームを退出しますか？" },
  "You can rejoin later with the same room code.": {
    ja: "同じルームコードで後から再参加できます。",
  },
  "Stay": { ja: "残る" },
  "Leave": { ja: "退出" },
  "Something went wrong displaying messages.": {
    ja: "メッセージの表示中にエラーが発生しました。",
  },
  "Try again": { ja: "再試行" },

  // Message list
  "No messages yet. Start the conversation!": {
    ja: "まだメッセージがありません。会話を始めましょう！",
  },

  // Message item
  "React or reply": { ja: "リアクションまたは返信" },
  "Processing...": { ja: "処理中…" },
  "Processing failed": { ja: "処理に失敗しました" },
  "↩ Reply": { ja: "↩ 返信" },

  // Message input
  "Cancel": { ja: "キャンセル" },
  "Type a message...": { ja: "メッセージを入力…" },
  "📷 Take Photo": { ja: "📷 写真を撮る" },
  "🖼️ Photo Library": { ja: "🖼️ フォトライブラリ" },
  "✏️ Draw": { ja: "✏️ 描く" },
  "🎤 Voice": { ja: "🎤 音声" },
  "Listening...": { ja: "聞いています…" },

  // Drawing
  "Draw something": { ja: "何か描いてみよう" },
  "Clear": { ja: "消去" },
  "Send": { ja: "送信" },

  // Typing indicator
  "is typing": { ja: "が入力中" },
  "is drawing": { ja: "が描画中" },
  "is speaking": { ja: "が話し中" },

  // Game status bar
  "Guessing": { ja: "推測中" },
  "Starting": { ja: "開始中" },

  // Participant list
  "(you)": { ja: "(あなた)" },
  "· host": { ja: "· ホスト" },
  "· away": { ja: "· 離席中" },
  "online": { ja: "オンライン" },
  "away": { ja: "離席" },
  "offline": { ja: "オフライン" },
  "· offline": { ja: "· オフライン" },
  "Leave room": { ja: "ルームを退出" },

  // Display settings
  "Room": { ja: "ルーム" },
  "Display": { ja: "表示" },
  "Display for": { ja: "表示設定：" },
  "English": { ja: "英語" },
  "Japanese": { ja: "日本語" },
  "Romaji": { ja: "ローマ字" },
  "Done": { ja: "完了" },

  // System messages
  "has joined": { ja: "が参加しました" },
  "has left": { ja: "が退出しました" },
  "is away": { ja: "は離席中です" },
  "is back": { ja: "が戻りました" },

  // Reply preview
  "Photo": { ja: "写真" },
  "Drawing": { ja: "お絵描き" },

  // Offline mode
  "You're offline": { ja: "オフラインです" },
  "queued": { ja: "件待ち" },

  // Game
  "🎮 Games": { ja: "🎮 ゲーム" },
  "Games": { ja: "ゲーム" },
  "Only the host can start a game.": { ja: "ゲームを開始できるのはホストだけです。" },
  "Got it": { ja: "了解" },
  "Lost in Translation": { ja: "ロスト・イン・トランスレーション" },
  "players": { ja: "人のプレイヤー" },
  "Need at least 2 players to start.": { ja: "開始するには2人以上のプレイヤーが必要です。" },
  "Start Game": { ja: "ゲーム開始" },
  "Step": { ja: "ステップ" },
  "of": { ja: "/" },
  "Draw this phrase:": { ja: "このフレーズを描いてください：" },
  "What is this drawing?": { ja: "この絵は何ですか？" },
  "Type your guess...": { ja: "答えを入力…" },
  "Submit": { ja: "送信" },
  "Game Results": { ja: "ゲーム結果" },
  "Chain": { ja: "チェーン" },
  "Original:": { ja: "元の言葉：" },
  "drew": { ja: "が描いた" },
  "guessed": { ja: "が当てた" },
  "Game complete! View Results": { ja: "ゲーム完了！結果を見る" },
  "Game Started: Lost in Translation": { ja: "ゲーム開始：ロスト・イン・トランスレーション" },
  "Game ended": { ja: "ゲーム終了" },
  "Game Started: Match Emoji": { ja: "ゲーム開始：マッチ絵文字" },
  "Game ended early": { ja: "ゲーム途中終了" },
  "Game Complete": { ja: "ゲーム完了" },
  "It's a tie!": { ja: "引き分け！" },
  "played": { ja: "プレイ" },
  "End Game": { ja: "ゲーム終了" },
  "Round Complete!": { ja: "ラウンド完了！" },
  "turns played": { ja: "ターンプレイ済み" },
  "Keep Playing": { ja: "続ける" },
  "End game?": { ja: "ゲームを終了しますか？" },
  "This will end the game for all players and show results.": { ja: "全プレイヤーのゲームを終了し、結果を表示します。" },
  "🛑 End Game": { ja: "🛑 ゲーム終了" },
  "Quit game?": { ja: "ゲームをやめますか？" },
  "Are you sure you want to quit the game?": { ja: "本当にゲームをやめますか？" },
  "Quit": { ja: "やめる" },
  "can we play \"Lost in Translation\"? 🎮": { ja: "「ロスト・イン・トランスレーション」やりませんか？🎮" },
  "Ask to play!": { ja: "遊ぼう！" },
  "Waiting for other players...": { ja: "他のプレイヤーを待っています…" },

  // Game levels
  "Level": { ja: "レベル" },
  "Hint:": { ja: "ヒント：" },
  "Next Level": { ja: "次のレベル" },
  "1 word with hint": { ja: "1単語＋ヒント" },
  "2 words": { ja: "2単語" },
  "words": { ja: "単語" },

  // Dynamic game flow
  "Round": { ja: "ラウンド" },
  "guessed correctly!": { ja: "正解！" },
  "guessed wrong": { ja: "不正解" },

  // Multiple-choice game
  "Correct!": { ja: "正解!" },
  "Wrong!": { ja: "不正解!" },
  "Scores": { ja: "スコア" },
  "picked": { ja: "を選んだ" },
  "10 rounds": { ja: "10ラウンド" },
  "A drawing guessing game: one player draws, everyone else picks from 4 choices. 10 rounds, rotating drawer!": {
    ja: "お絵描き当てゲーム：1人が描き、他の全員が4択から選ぶ。10ラウンド、描く人は交代！",
  },
  "correct": { ja: "正解" },

  // Emojifyr game
  "Emojifyr": { ja: "Emojifyr" },
  "Write something for Emojifyr": { ja: "Emojifyrに何か書こう" },
  "Write something short and visual that can be turned into emojis.": { ja: "絵文字に変換できる短くてビジュアルなものを書いてください。" },
  "e.g. A cat riding a skateboard": { ja: "例：スケボーに乗る猫" },
  "Generate Emojis": { ja: "絵文字を生成" },
  "Submitting...": { ja: "送信中…" },
  "What does this mean?": { ja: "これはどういう意味？" },
  "What is this init?": { ja: "この略語の意味は？" },
  "What is this phrase?": { ja: "このフレーズの意味は？" },
  "Submit Guess": { ja: "推測を送信" },
  "guesses submitted": { ja: "件の推測が送信済み" },
  "Emojifyr Result": { ja: "Emojifyr結果" },
  "Original": { ja: "元の言葉" },
  "Guesses": { ja: "推測" },
  "Next Round": { ja: "次のラウンド" },
  "is writing...": { ja: "が書いています…" },
  "is generating emojis...": { ja: "が絵文字を生成中…" },
  "Generating emojis...": { ja: "絵文字を生成中…" },
  "Guessing...": { ja: "推測中…" },
  "Revealing answer!": { ja: "答えを発表！" },
  "Waiting for writer...": { ja: "ライターを待っています…" },
  "Players are guessing...": { ja: "プレイヤーが推測中…" },
  "Reveal": { ja: "答えを見る" },
  "Waiting for host...": { ja: "ホストを待っています…" },
  "Submitted!": { ja: "送信しました！" },
  "Write something, turn it into emojis, and guess!": { ja: "何か書いて、絵文字に変えて、当てよう！" },
  "How it works": { ja: "遊び方" },
  "One player writes something": { ja: "1人が何かを書く" },
  "Host converts it to emojis": { ja: "ホストが絵文字に変換" },
  "Everyone guesses the original": { ja: "みんなが元の文を当てる" },
  "min per round": { ja: "分/ラウンド" },
  "can we play \"Emojifyr\"? 🔥": { ja: "「Emojifyr」やりませんか？🔥" },
  "Random": { ja: "ランダム" },
  "I don't know": { ja: "わからない" },
  "Use": { ja: "使う" },
  "Regenerate": { ja: "再生成" },
  "Generated emoji clue:": { ja: "生成された絵文字：" },
  "Failed to generate. Try again.": { ja: "生成に失敗しました。もう一度お試しください。" },
  "Game Starting...": { ja: "ゲーム開始中…" },
  "Off": { ja: "オフ" },

  // Truth or Dare
  "Truth or Dare": { ja: "どっちする？" },
  "Game Started: Truth or Dare": { ja: "ゲーム開始：どっちする？" },
  "Game ended: Truth or Dare": { ja: "ゲーム終了：どっちする？" },
  "Truth or Dare?": { ja: "どっちする？" },
  "Truth": { ja: "ほんとのこと" },
  "Dare": { ja: "チャレンジ" },
  "A social game: answer a question or complete a challenge! Take turns with your group.": {
    ja: "みんなで順番に質問に答えたり、チャレンジしたりするゲームです！",
  },
  "It's your turn!": { ja: "あなたの番です！" },
  "'s turn!": { ja: "さんの番です！" },
  "Waiting for": { ja: "待っています：" },
  "to choose...": { ja: "が選んでいます…" },
  "to respond...": { ja: "が答えています…" },
  "Skip": { ja: "スキップ" },
  "Next Turn": { ja: "次の人へ" },
  "Type your answer...": { ja: "答えを入力…" },
  "Take a photo": { ja: "写真を撮る" },
  "Draw your answer": { ja: "絵で答える" },
  "Send Answer": { ja: "答えを送信" },
  "Skipped!": { ja: "スキップしました！" },
  "answered:": { ja: "の答え：" },
  "can we play \"Truth or Dare\"? 🎲": { ja: "「どっちする？」やりませんか？🎲" },
  "Rotates through all players": { ja: "全員が順番にプレイ" },
  "Works solo or multiplayer": { ja: "ソロでもマルチでも" },
  "One player writes a sentence": { ja: "1人が何かを書く" },
  "Rate this answer": { ja: "この答えを評価" },
  "Ratings": { ja: "評価" },
  "Submit Rating": { ja: "評価を送信" },
  "Waiting for others to rate...": { ja: "他の人の評価を待っています…" },
  "Waiting for all ratings...": { ja: "全員の評価を待っています…" },
  "Skip ratings": { ja: "評価をスキップ" },
  "Done Dare": { ja: "チャレンジ完了" },
  "Normal": { ja: "ノーマル" },
  "Deep": { ja: "ディープ" },

  // Emoji Bingo
  "Emoji Bingo": { ja: "絵文字ビンゴ" },
  "Mark emojis on your card as they're called. First to complete the pattern wins!": {
    ja: "呼ばれた絵文字をカードにマーク。パターンを最初に完成させた人の勝ち！",
  },
  "Emojis are called automatically": { ja: "絵文字が自動で呼ばれます" },
  "Tap matching emojis on your card": { ja: "カードの絵文字をタップ" },
  "Complete the pattern and hit BINGO!": { ja: "パターンを完成してBINGO！" },
  'can we play "Emoji Bingo"? 🎰': { ja: '「絵文字ビンゴ」で遊びませんか？🎰' },
  "Win Pattern": { ja: "勝利パターン" },
  "Speed": { ja: "スピード" },
  "Join Game": { ja: "参加する" },
  "Leave Lobby": { ja: "ロビーを出る" },
  "host": { ja: "ホスト" },
  "called": { ja: "コール済み" },
  "remaining": { ja: "残り" },
  "Game in progress": { ja: "ゲーム中" },
  "End": { ja: "終了" },
  "Not yet!": { ja: "まだです！" },
  "Game Canceled": { ja: "ゲーム中止" },
  "No Winner": { ja: "勝者なし" },
  "min": { ja: "分" },
  "Game Started: Emoji Bingo": { ja: "ゲーム開始：絵文字ビンゴ" },
  "Roll!": { ja: "ロール！" },
  "is rolling...": { ja: "がロール中…" },
  "Waiting for first roll...": { ja: "最初のロールを待っています…" },
};

/**
 * Translate a UI string. Returns the original key for English or missing translations.
 */
export function t(key: string, lang?: string): string {
  if (!lang || lang === "en") return key;
  return translations[key]?.[lang] ?? key;
}
