import Foundation

/// The offline room's conversation, kept in a file on this phone between visits, and what the room knows of the
/// phone's translator. The screen is Views/OfflineRoomView.swift; the conversation's own rules are
/// Services/Processing/OfflineConversation.swift.
@MainActor
final class OfflineRoomStore: ObservableObject {
    /// Whether the phone can translate between English and Japanese by itself
    enum Translator: Equatable {
        case checking
        /// Both language packs are on the phone
        case ready
        /// The phone can, once the packs are downloaded (which needs a connection, once)
        case needsPacks
        /// This iPhone cannot translate between the two by itself (a system before iOS 18)
        case unavailable
    }

    @Published private(set) var conversation = OfflineConversation()
    @Published var translator: Translator = .checking
    /// Counted up whenever there is something new for the translator
    @Published private(set) var waitingVersion = 0
    /// Set to ask for Apple's download sheet for the language packs
    @Published var wantsPacks = false

    var lines: [OfflineConversation.Line] { conversation.lines }

    private let file: URL
    private let reading: (String) -> String = { MeCabRomajiService.shared.romaji($0) }

    init(file: URL? = nil) {
        self.file = file ?? OfflineRoomStore.defaultFile
        if let data = try? Data(contentsOf: self.file), let kept = try? JSONDecoder().decode(OfflineConversation.self, from: data) {
            conversation = kept
        }
    }

    private static var defaultFile: URL {
        let folder = (try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true))
            ?? FileManager.default.temporaryDirectory
        return folder.appendingPathComponent("offline-room.json")
    }

    func say(_ text: String, in lang: String) {
        guard conversation.say(text, in: lang, reading: reading) != nil else { return }
        changed(translate: true)
    }

    func waiting(from lang: String) -> [OfflineConversation.Line] {
        conversation.waiting(from: lang)
    }

    func translated(_ id: UUID, as text: String) {
        conversation.translated(id, as: text, reading: reading)
        changed(translate: false)
    }

    func failed(_ id: UUID) {
        conversation.failed(id)
        changed(translate: false)
    }

    func retry() {
        if conversation.retry() { changed(translate: true) }
    }

    func remove(_ id: UUID) {
        conversation.remove(id)
        changed(translate: false)
    }

    func clear() {
        conversation.clear()
        changed(translate: false)
    }

    /// The translator has just become ready: whatever was said without it is translated now
    func translateWaiting() {
        waitingVersion += 1
    }

    private func changed(translate: Bool) {
        if let data = try? JSONEncoder().encode(conversation) { try? data.write(to: file, options: .atomic) }
        if translate { waitingVersion += 1 }
    }
}
