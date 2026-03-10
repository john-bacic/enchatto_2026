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
  "📷 Photo": { ja: "📷 写真" },
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

  // Participant list
  "(you)": { ja: "(あなた)" },
  "· host": { ja: "· ホスト" },
  "· away": { ja: "· 離席中" },
  "online": { ja: "オンライン" },
  "away": { ja: "離席" },
  "Leave room": { ja: "ルームを退出" },

  // Display settings
  "Display": { ja: "表示" },
  "English": { ja: "英語" },
  "Japanese": { ja: "日本語" },
  "Romaji": { ja: "ローマ字" },
  "Done": { ja: "完了" },

  // System messages
  "has joined": { ja: "が参加しました" },
  "has left": { ja: "が退出しました" },

  // Reply preview
  "Photo": { ja: "写真" },
  "Drawing": { ja: "お絵描き" },
};

/**
 * Translate a UI string. Returns the original key for English or missing translations.
 */
export function t(key: string, lang?: string): string {
  if (!lang || lang === "en") return key;
  return translations[key]?.[lang] ?? key;
}
