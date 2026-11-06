import Foundation

// The things to say over the message box: the rules of apps/web/lib/conversation-starters.ts, kept alike by the cases
// in Tests/EnchattoTextTests/StarterCases.jsonl, which the web's test writes from its own rules. A change goes there
// first. The deck is ConversationDeck.swift, written from the web's deck by the same test.

/// A phrase in both languages: one of the deck's, or a reply the host's phone wrote
struct StarterPhrase: Codable, Equatable, Hashable {
    let en: String
    let ja: String
    /// The Japanese as the app writes romaji: lowercase Hepburn, particles as spoken, no macrons. Empty when unknown
    let romaji: String
}

/// A reaction to a picture, some of them for a photo only or a drawing only
struct PicturePhrase {
    let phrase: StarterPhrase
    /// "image" or "drawing"; nil for one that fits both
    let only: String?
}

/// A topic of the months it is in season, 1 to 12
struct SeasonalPhrase {
    let phrase: StarterPhrase
    let months: [Int]
}

/// Every phrase the strip offers. `{name}` is the person a chip answers, `{me}` the one who sends it
struct StarterDeck {
    let react: [StarterPhrase]
    let picture: [PicturePhrase]
    let answerYesNo: [StarterPhrase]
    let answerOpen: [StarterPhrase]
    let welcome: [StarterPhrase]
    let welcomeBack: [StarterPhrase]
    let intro: [StarterPhrase]
    let back: [StarterPhrase]
    let gg: [StarterPhrase]
    let topics: [StarterPhrase]
    let seasonal: [SeasonalPhrase]
}

/// A message as the strip reads it
struct StarterMessage: Equatable {
    let id: String
    let senderId: String
    /// The server's kind: "text", "image", "drawing", "audio", "system", or one this build does not know
    let kind: String
    let text: String?
    let translatedText: String?
    let suggestions: [String]?
    /// Milliseconds since 1970, as the server keeps time
    let createdAt: Double
}

struct StarterPerson: Equatable {
    let id: String
    let nickname: String
}

enum StarterChipKind: String {
    case offered, intro, react, answer, welcome, gg, topic, game
}

struct StarterChip: Equatable, Identifiable {
    /// Unique among the chips shown together, and the same for the same chip from one drawing to the next
    let key: String
    let kind: StarterChipKind
    /// The phrase in both languages. An offered chip that came with its message has `text` instead
    var phrase: StarterPhrase? = nil
    var text: String? = nil

    var id: String { key }
}

struct Starters: Equatable {
    /// What the chips answer: a message, a newcomer, a game's end, a silence. Chips dismissed under a key stay away
    /// until it changes
    let key: String
    let chips: [StarterChip]
}

struct StarterInput {
    var messages: [StarterMessage]
    var people: [StarterPerson]
    var meId: String
    /// The room's host. The host's arrivals are the host's phone coming and going, and nobody is welcomed for them
    var hostId: String?
    var replyTo: StarterMessage?
    /// Milliseconds since 1970
    var now: Double
    /// 1 to 12, for the topics of the season
    var month: Int
    /// While a game is on, lobbies too, nothing is offered but replies to the message she is replying to
    var gameOn: Bool
    /// Each value shows other topics
    var shuffle = 0
    /// Replies the host's phone wrote for a message, by the message's id
    var ideas: [String: [StarterPhrase]] = [:]
}

enum ConversationStarters {
    /// A silence this long after a message turns the strip from answers to topics
    static let lullMs: Double = 30_000
    /// A newcomer is welcomed, and a finished game talked over, for this long before the silence counts
    static let welcomeMs: Double = 60_000
    /// This long after the last thing that happened, a silence offers a game as well
    static let gameNudgeMs: Double = 90_000
    /// A phrase said in one of this many newest messages is not offered again
    private static let retireLookback = 12
    private static let maxChips = 6
    private static let topicCount = 3

    /// The chips for this moment, if any, and the time at which the clock alone changes them (nil when nothing but
    /// another message or another tap can). The newest message counts from its own time if the clock reads earlier
    static func startersFor(_ input: StarterInput, deck: StarterDeck = .shipped) -> (starters: Starters?, wakeAt: Double?) {
        func nameOf(_ id: String) -> String? { input.people.first { $0.id == id }?.nickname }
        let me = nameOf(input.meId)
        let spoken = input.messages.filter(isSaid)
        let mine = spoken.filter { $0.senderId == input.meId }
        var said = Set<String>()
        for message in spoken.suffix(retireLookback) {
            for text in [message.text, message.translatedText] {
                if let text, !text.isEmpty { said.insert(plain(text)) }
            }
        }
        func seed(_ key: String) -> String { "\(input.meId)|\(key)" }
        // Her first words: an introduction if she has said nothing yet in the room
        func intro(_ key: String, _ count: Int) -> [StarterChip] {
            mine.isEmpty ? chips(.intro, pick(deck.intro, count, seed: seed(key), said: said, vars: Vars(me: me))) : []
        }
        // What she might send back: the replies written for it, or else what came with it, then her introduction if
        // she owes one, then the deck's
        func answers(to message: StarterMessage, key: String) -> [StarterChip] {
            let ideas = (input.ideas[message.id] ?? []).filter {
                !isBlank($0.en) && !isBlank($0.ja) && !said.contains(plain($0.en)) && !said.contains(plain($0.ja))
            }
            let offered: [StarterChip] = ideas.isEmpty
                ? (message.suggestions ?? []).filter { !isBlank($0) }.prefix(3).enumerated()
                    .map { StarterChip(key: "offered:\($0.offset)", kind: .offered, text: $0.element) }
                : ideas.prefix(3).enumerated().map { StarterChip(key: "idea:\($0.offset)", kind: .offered, phrase: $0.element) }
            let vars = Vars(name: nameOf(message.senderId), me: me)
            let replies: [StarterChip]
            if message.kind == "image" || message.kind == "drawing" {
                let fitting = deck.picture.filter { $0.only == nil || $0.only == message.kind }.map(\.phrase)
                replies = chips(.react, pick(fitting, 4, seed: seed(key), said: said, vars: vars))
            } else if let question = questionOf(message) {
                let pool = question == .yesNo ? deck.answerYesNo : deck.answerOpen
                replies = chips(.answer, pick(pool, 3, seed: seed(key), said: said, vars: vars))
            } else {
                replies = chips(.react, pick(deck.react, 4, seed: seed(key), said: said, vars: vars))
            }
            return Array((offered + intro(key, 1) + replies).prefix(maxChips))
        }

        if let replyTo = input.replyTo, replyTo.senderId != input.meId, isSaid(replyTo) {
            let key = "reply:\(replyTo.id)"
            return (Starters(key: key, chips: answers(to: replyTo, key: key)), nil)
        }
        // The game does the talking, and what is said meanwhile is mostly guesses and answers
        if input.gameOn { return (nil, nil) }

        var newestAt: Double = 0
        var newest: (message: StarterMessage, what: Happening)?
        for message in input.messages {
            newestAt = max(newestAt, message.createdAt)
            if let what = happening(of: message, hostId: input.hostId),
               newest.map({ message.createdAt >= $0.message.createdAt }) ?? true {
                newest = (message, what)
            }
        }
        let now = max(input.now, newestAt)

        if let (message, what) = newest {
            let freshFor = what == .said ? lullMs : welcomeMs
            if now - message.createdAt < freshFor {
                let wakeAt = message.createdAt + freshFor
                let mineToo = message.senderId == input.meId
                switch what {
                case .said:
                    // After her own message the others have the floor: the strip is back with anybody else's, however
                    // much she said
                    if mineToo { return (nil, wakeAt) }
                    let key = "said:\(message.id)"
                    return (Starters(key: key, chips: answers(to: message, key: key)), wakeAt)
                case .gameOver:
                    let key = "gg:\(message.id)"
                    return (Starters(key: key, chips: chips(.gg, pick(deck.gg, 3, seed: seed(key), said: said, vars: Vars()))), wakeAt)
                case .arrived:
                    if mineToo {
                        let key = "intro:\(message.id)"
                        let phrases = mine.isEmpty
                            ? pick(deck.intro, 3, seed: seed(key), said: said, vars: Vars(me: me))
                            : pick(deck.back, 2, seed: seed(key), said: said, vars: Vars())
                        return (Starters(key: key, chips: chips(.intro, phrases)), wakeAt)
                    }
                    // Somebody who has talked here before has come back
                    let key = "welcome:\(message.id)"
                    let back = spoken.contains { $0.senderId == message.senderId && $0.createdAt < message.createdAt }
                    let name = nameOf(message.senderId) ?? String(String.UnicodeScalarView((message.text ?? "").unicodeScalars.dropFirst("join:".unicodeScalars.count)))
                    let welcome = chips(.welcome, pick(back ? deck.welcomeBack : deck.welcome, 3, seed: seed(key), said: said, vars: Vars(name: name, me: me)))
                    return (Starters(key: key, chips: Array((welcome + intro(key, 1)).prefix(maxChips))), wakeAt)
                }
            }
        }

        // A silence
        let since = newest?.message.createdAt ?? -.infinity
        let key = "lull:\(newest?.message.id ?? "")"
        var lull = intro(key, 1) + chips(.topic, topics(seed: seed(key), shuffle: input.shuffle, month: input.month, said: said, deck: deck))
        let gameDue = since + gameNudgeMs
        if now >= gameDue { lull.append(StarterChip(key: "game", kind: .game)) }
        return (Starters(key: key, chips: lull), now >= gameDue ? nil : gameDue)
    }

    // MARK: - Reading the room

    private enum Happening { case said, arrived, gameOver }
    private enum Question { case yesNo, open }

    private struct Vars {
        var name: String? = nil
        var me: String? = nil
    }

    private static let saidKinds: Set<String> = ["text", "image", "drawing", "audio"]
    /// The lines a finished game writes into the chat
    private static let gameOverPrefixes = ["game_summary:", "emoji_match_summary:", "emoji_bingo_summary:", "emoji_match_complete:", "truth_or_dare_summary:"]
    private static let yesNoWords = ["do", "does", "did", "am", "are", "is", "was", "were", "have", "has", "had", "can", "could", "will", "would", "should", "shall"]
    /// Japanese that asks without a question mark: 元気ですか。 A bare か ends words too (静か)
    private static let askingEndings = ["ですか", "でしたか", "ますか", "ましたか", "ませんか", "でしょうか", "かな"]

    /// A message someone sent: a text, a picture, a drawing or a voice message
    private static func isSaid(_ message: StarterMessage) -> Bool { saidKinds.contains(message.kind) }

    private static func happening(of message: StarterMessage, hostId: String?) -> Happening? {
        if isSaid(message) { return .said }
        guard message.kind == "system", let text = message.text, !text.isEmpty else { return nil }
        if starts(text, with: "join:") { return message.senderId == hostId ? nil : .arrived }
        return gameOverPrefixes.contains { starts(text, with: $0) } ? .gameOver : nil
    }

    /// Whether a message asks something, and whether it can be answered yes or no, read off its English where it has one
    private static func questionOf(_ message: StarterMessage) -> Question? {
        let text = trimmed(message.text ?? "")
        let translated = trimmed(message.translatedText ?? "")
        guard asks(text) || asks(translated) || asksInJapanese(text) else { return nil }
        let english = text.unicodeScalars.contains(where: isJapanese) ? translated : text
        return isYesNo(english) ? .yesNo : .open
    }

    /// Ends in a question mark, with nothing after it but spaces, emoji or other marks. "Really?!" is a cry, not a question
    private static func asks(_ text: String) -> Bool {
        for scalar in text.unicodeScalars.reversed() {
            if scalar == "?" || scalar == "？" { return true }
            if isLetterOrNumber(scalar) || scalar == "!" || scalar == "！" { return false }
        }
        return false
    }

    private static func asksInJapanese(_ text: String) -> Bool {
        var scalars = Array(text.unicodeScalars)
        while let last = scalars.last, !(isLetterOrNumber(last) || "!！?？".unicodeScalars.contains(last)) {
            scalars.removeLast()
        }
        return askingEndings.contains { scalars.reversed().starts(with: $0.unicodeScalars.reversed()) }
    }

    /// Opens with one of the words a yes-or-no question opens with, in any case, and then a word boundary (JavaScript's `\b`)
    private static func isYesNo(_ english: String) -> Bool {
        let scalars = Array(english.unicodeScalars)
        return yesNoWords.contains { word in
            let letters = Array(word.unicodeScalars)
            guard scalars.count >= letters.count,
                  zip(scalars, letters).allSatisfy({ asciiLowercase($0) == $1 }) else { return false }
            return scalars.count == letters.count || !isWordCharacter(scalars[letters.count])
        }
    }

    /// FNV-1a over UTF-16, as the web hashes: the same chips for the same moment from one drawing to the next, and
    /// other people shown other ones
    private static func hash(_ text: String) -> UInt32 {
        var h: UInt32 = 0x811c9dc5
        for unit in text.utf16 {
            h ^= UInt32(unit)
            h = h &* 0x01000193
        }
        return h
    }

    private static func fill(_ phrase: StarterPhrase, _ vars: Vars) -> StarterPhrase {
        func put(_ text: String) -> String {
            text.replacingOccurrences(of: "{name}", with: vars.name ?? "", options: .literal)
                .replacingOccurrences(of: "{me}", with: vars.me ?? "", options: .literal)
        }
        return StarterPhrase(en: put(phrase.en), ja: put(phrase.ja), romaji: put(phrase.romaji))
    }

    private static func needs(_ phrase: StarterPhrase, _ slot: String) -> Bool {
        phrase.en.contains("{\(slot)}") || phrase.ja.contains("{\(slot)}")
    }

    /// Up to `count` phrases of `pool`, going round it from a place `seed` picks. A phrase that needs a name nobody
    /// gave is passed over, and so is one somebody said lately, in either language
    private static func pick(_ pool: [StarterPhrase], _ count: Int, seed: String, said: Set<String>, vars: Vars) -> [StarterPhrase] {
        var picked: [StarterPhrase] = []
        let start = pool.isEmpty ? 0 : Int(hash(seed) % UInt32(pool.count))
        for i in pool.indices where picked.count < count {
            let phrase = pool[(start + i) % pool.count]
            if (needs(phrase, "name") && (vars.name ?? "").isEmpty) || (needs(phrase, "me") && (vars.me ?? "").isEmpty) { continue }
            let filled = fill(phrase, vars)
            if said.contains(plain(filled.en)) || said.contains(plain(filled.ja)) { continue }
            picked.append(filled)
        }
        return picked
    }

    /// topicCount topics: one of the season's first if there is one, then the deck's, `shuffle` turning both on
    private static func topics(seed: String, shuffle: Int, month: Int, said: Set<String>, deck: StarterDeck) -> [StarterPhrase] {
        func fresh(_ phrase: StarterPhrase) -> Bool { !said.contains(plain(phrase.en)) && !said.contains(plain(phrase.ja)) }
        let start = Int(hash(seed))
        let inSeason = deck.seasonal.filter { $0.months.contains(month) && fresh($0.phrase) }
        var picked = inSeason.isEmpty ? [] : [inSeason[(start + shuffle) % inSeason.count].phrase]
        let first = start + shuffle * (topicCount - picked.count)
        for i in deck.topics.indices where picked.count < topicCount {
            let phrase = deck.topics[(first + i) % deck.topics.count]
            if fresh(phrase) { picked.append(phrase) }
        }
        return picked
    }

    private static func chips(_ kind: StarterChipKind, _ phrases: [StarterPhrase]) -> [StarterChip] {
        phrases.map { StarterChip(key: "\(kind.rawValue):\($0.en)", kind: kind, phrase: $0) }
    }

    // MARK: - Characters, as JavaScript's regular expressions class them

    /// A text for comparing what was said: lowercase, without spaces, punctuation, symbols or emoji
    static func plain(_ text: String) -> String {
        String(String.UnicodeScalarView(text.lowercased().unicodeScalars.filter { !isSpace($0) && !isPunctuationOrSymbol($0) }))
    }

    /// `\s`, and what `trim()` takes off
    private static func isSpace(_ scalar: Unicode.Scalar) -> Bool {
        scalar == "\u{FEFF}" || (scalar.properties.isWhitespace && scalar != "\u{85}")
    }

    private static func trimmed(_ text: String) -> String {
        let scalars = text.unicodeScalars
        guard let first = scalars.firstIndex(where: { !isSpace($0) }),
              let last = scalars.lastIndex(where: { !isSpace($0) }) else { return "" }
        return String(scalars[first...last])
    }

    private static func isBlank(_ text: String) -> Bool { text.unicodeScalars.allSatisfy(isSpace) }

    /// `\p{L}` or `\p{N}`
    private static func isLetterOrNumber(_ scalar: Unicode.Scalar) -> Bool {
        switch scalar.properties.generalCategory {
        case .uppercaseLetter, .lowercaseLetter, .titlecaseLetter, .modifierLetter, .otherLetter,
             .decimalNumber, .letterNumber, .otherNumber:
            return true
        default:
            return false
        }
    }

    /// `\p{P}` or `\p{S}`
    private static func isPunctuationOrSymbol(_ scalar: Unicode.Scalar) -> Bool {
        switch scalar.properties.generalCategory {
        case .connectorPunctuation, .dashPunctuation, .openPunctuation, .closePunctuation, .initialPunctuation,
             .finalPunctuation, .otherPunctuation, .mathSymbol, .currencySymbol, .modifierSymbol, .otherSymbol:
            return true
        default:
            return false
        }
    }

    /// Hiragana, katakana or a kanji of the common block
    private static func isJapanese(_ scalar: Unicode.Scalar) -> Bool {
        (0x3040...0x309F).contains(scalar.value) || (0x30A0...0x30FF).contains(scalar.value) || (0x4E00...0x9FFF).contains(scalar.value)
    }

    /// `\w` without the u flag: ASCII letters, digits and the underscore
    private static func isWordCharacter(_ scalar: Unicode.Scalar) -> Bool {
        scalar.isASCII && (scalar.properties.isAlphabetic || ("0"..."9").contains(scalar) || scalar == "_")
    }

    private static func asciiLowercase(_ scalar: Unicode.Scalar) -> Unicode.Scalar {
        ("A"..."Z").contains(scalar) ? Unicode.Scalar(scalar.value + 32)! : scalar
    }

    private static func starts(_ text: String, with prefix: String) -> Bool {
        text.unicodeScalars.starts(with: prefix.unicodeScalars)
    }
}
