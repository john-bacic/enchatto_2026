import Foundation

/// A conversation held on one phone with no connection: two people passing it back and forth, each saying
/// things in their own language. Everything is kept on the device and nothing is ever sent anywhere.
///
/// This is the conversation's own record and rules, with no screen and no translator in it: the offline room's
/// screen (Views/OfflineRoomView.swift) shows it, and the phone's own translator fills in each line's
/// translation when it has one. Japanese is given its reading as it arrives, by whoever is handed in as
/// `reading` (the app's MeCab romaji).
struct OfflineConversation: Codable, Equatable {
    struct Line: Codable, Equatable, Identifiable {
        let id: UUID
        /// The language it was said in: "en" or "ja"
        let lang: String
        let text: String
        /// In the other language. Nil until the phone has translated it
        var translation: String?
        /// How the Japanese of the two is read, whichever side that is
        var romaji: String?
        /// The phone tried to translate it and could not
        var failed = false
        let at: Date

        /// The language its translation is in
        var otherLang: String { lang == "ja" ? "en" : "ja" }
    }

    /// Lines kept. A conversation that outgrows it loses its oldest
    static let capacity = 400
    static let languages = ["en", "ja"]

    private(set) var lines: [Line] = []

    /// Adds what someone said. Returns nil for nothing but spaces, or a language this is not for
    @discardableResult
    mutating func say(_ text: String, in lang: String, at: Date = Date(), id: UUID = UUID(), reading: (String) -> String) -> Line? {
        let said = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !said.isEmpty, OfflineConversation.languages.contains(lang) else { return nil }
        let line = Line(id: id, lang: lang, text: said, translation: nil, romaji: lang == "ja" ? reading(said) : nil, at: at)
        lines.append(line)
        if lines.count > OfflineConversation.capacity { lines.removeFirst(lines.count - OfflineConversation.capacity) }
        return line
    }

    /// What is still to be translated out of one language, oldest first. A line that failed waits to be asked for again
    func waiting(from lang: String) -> [Line] {
        lines.filter { $0.lang == lang && $0.translation == nil && !$0.failed }
    }

    /// The phone's translation of a line. An English line's Japanese gets its reading here
    mutating func translated(_ id: UUID, as text: String, reading: (String) -> String) {
        guard let i = lines.firstIndex(where: { $0.id == id }) else { return }
        let got = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !got.isEmpty else { return failed(id) }
        lines[i].translation = got
        lines[i].failed = false
        if lines[i].lang == "en" { lines[i].romaji = reading(got) }
    }

    mutating func failed(_ id: UUID) {
        guard let i = lines.firstIndex(where: { $0.id == id }), lines[i].translation == nil else { return }
        lines[i].failed = true
    }

    /// Every line that failed is waiting again. Returns whether there were any
    @discardableResult
    mutating func retry() -> Bool {
        var any = false
        for i in lines.indices where lines[i].failed {
            lines[i].failed = false
            any = true
        }
        return any
    }

    mutating func remove(_ id: UUID) {
        lines.removeAll { $0.id == id }
    }

    mutating func clear() {
        lines = []
    }
}
