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

        // Drawing composer
        "Clear": ["ja": "消去"],
        "Send": ["ja": "送信"],
    ]

    /// Translate a UI string. Returns the key unchanged for English or missing translations.
    static func t(_ key: String, _ lang: String) -> String {
        if lang == "en" { return key }
        return translations[key]?[lang] ?? key
    }
}
