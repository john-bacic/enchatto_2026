import Foundation

// Mirrors `stateValidator` in apps/web/convex/wordRush.ts. Decoding is lenient: Convex sends
// every number as a JSON number (possibly fractional) and nullable fields as explicit nulls.

enum WordRushStatus: String, Decodable {
    case lobby, active, completed, unknown

    init(from decoder: Decoder) throws {
        self = WordRushStatus(rawValue: try decoder.singleValueContainer().decode(String.self)) ?? .unknown
    }
}

enum WordRushPhase: String, Decodable {
    case clues, reveal, mic, judging, verdict, unknown

    init(from decoder: Decoder) throws {
        self = WordRushPhase(rawValue: try decoder.singleValueContainer().decode(String.self)) ?? .unknown
    }
}

enum WordRushVote: String, Decodable, CaseIterable {
    case huh, close, native

    var points: Int { self == .huh ? 0 : self == .close ? 10 : 20 }
}

enum WordRushPacks {
    static let all = ["mix", "foodie", "travel", "slang", "anime", "feelings", "chat"]
}

struct WordRushJaWord: Decodable, Equatable, Hashable {
    let ja: String
    let kana: String
    let romaji: String
}

struct WordRushPlayer: Decodable, Equatable, Identifiable {
    let participantId: String
    let nickname: String
    let avatarValue: String
    /// "en" | "ja" — the language this player is learning
    let learning: String
    let score: Int
    let streak: Int
    let bestStreak: Int
    let correct: Int
    let sayItBonus: Int

    var id: String { participantId }

    enum CodingKeys: String, CodingKey {
        case participantId, nickname, avatarValue, learning, score, streak, bestStreak, correct, sayItBonus
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        participantId = try c.decode(String.self, forKey: .participantId)
        nickname = (try? c.decode(String.self, forKey: .nickname)) ?? "?"
        avatarValue = (try? c.decode(String.self, forKey: .avatarValue)) ?? ""
        learning = (try? c.decode(String.self, forKey: .learning)) ?? "en"
        score = c.flexInt(.score)
        streak = c.flexInt(.streak)
        bestStreak = c.flexInt(.bestStreak)
        correct = c.flexInt(.correct)
        sayItBonus = c.flexInt(.sayItBonus)
    }
}

struct WordRushReveal: Decodable, Equatable {
    let en: String
    let ja: WordRushJaWord
    let ipa: String
    let posEn: String
    let posJa: String
    let hookEn: String
    let hookJa: String
    let exampleEn: String
    let exampleJa: String
    let scene: String
    let correctEnIndex: Int
    let correctJaIndex: Int

    enum CodingKeys: String, CodingKey {
        case en, ja, ipa, posEn, posJa, hookEn, hookJa, exampleEn, exampleJa, scene, correctEnIndex, correctJaIndex
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        en = try c.decode(String.self, forKey: .en)
        ja = try c.decode(WordRushJaWord.self, forKey: .ja)
        ipa = (try? c.decode(String.self, forKey: .ipa)) ?? ""
        posEn = (try? c.decode(String.self, forKey: .posEn)) ?? ""
        posJa = (try? c.decode(String.self, forKey: .posJa)) ?? ""
        hookEn = (try? c.decode(String.self, forKey: .hookEn)) ?? ""
        hookJa = (try? c.decode(String.self, forKey: .hookJa)) ?? ""
        exampleEn = (try? c.decode(String.self, forKey: .exampleEn)) ?? ""
        exampleJa = (try? c.decode(String.self, forKey: .exampleJa)) ?? ""
        scene = (try? c.decode(String.self, forKey: .scene)) ?? "sparkles"
        correctEnIndex = c.flexInt(.correctEnIndex, default: -1)
        correctJaIndex = c.flexInt(.correctJaIndex, default: -1)
    }

    func correctIndex(learning: String) -> Int {
        learning == "ja" ? correctJaIndex : correctEnIndex
    }
}

struct WordRushCard: Decodable, Equatable {
    let emoji: [String]
    let choicesEn: [String]
    let choicesJa: [WordRushJaWord]
    let reveal: WordRushReveal?
}

struct WordRushAnswer: Decodable, Equatable, Identifiable {
    let participantId: String
    let elapsedMs: Double
    let choiceIndex: Int?
    let correct: Bool?
    let points: Int?

    var id: String { participantId }

    enum CodingKeys: String, CodingKey {
        case participantId, elapsedMs, choiceIndex, correct, points
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        participantId = try c.decode(String.self, forKey: .participantId)
        elapsedMs = (try? c.decode(Double.self, forKey: .elapsedMs)) ?? 0
        choiceIndex = c.flexIntIfPresent(.choiceIndex)
        correct = try? c.decodeIfPresent(Bool.self, forKey: .correct)
        points = c.flexIntIfPresent(.points)
    }
}

struct WordRushPerformer: Decodable, Equatable {
    let participantId: String
    /// Language the performer has to say the word in
    let lang: String
    let word: String
    let kana: String
    let romaji: String
    let clipUrl: String?
}

struct WordRushVerdictVote: Decodable, Equatable, Identifiable {
    let judgeId: String
    let vote: WordRushVote
    let weight: Int

    var id: String { judgeId }

    enum CodingKeys: String, CodingKey { case judgeId, vote, weight }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        judgeId = try c.decode(String.self, forKey: .judgeId)
        vote = (try? c.decode(WordRushVote.self, forKey: .vote)) ?? .huh
        weight = c.flexInt(.weight, default: 1)
    }
}

struct WordRushVerdict: Decodable, Equatable {
    let bonus: Int
    let label: WordRushVote
    let votes: [WordRushVerdictVote]

    enum CodingKeys: String, CodingKey { case bonus, label, votes }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        bonus = c.flexInt(.bonus)
        label = (try? c.decode(WordRushVote.self, forKey: .label)) ?? .huh
        votes = (try? c.decode([WordRushVerdictVote].self, forKey: .votes)) ?? []
    }
}

struct WordRushTeachClip: Decodable, Equatable {
    let url: String
    let byParticipantId: String
}

struct WordRushGame: Decodable, Equatable, Identifiable {
    let id: String
    let roomId: String
    let status: WordRushStatus
    let hostParticipantId: String
    let pack: String
    let sayIt: Bool
    let cardsReady: Bool
    let players: [WordRushPlayer]
    let totalCards: Int
    let cardIndex: Int
    let phase: WordRushPhase
    let phaseSeq: Int
    /// Epoch ms
    let phaseStartedAt: Double
    /// Epoch ms
    let phaseEndsAt: Double
    let emojiStepMs: Double
    let card: WordRushCard?
    let answers: [WordRushAnswer]
    let performer: WordRushPerformer?
    let votedIds: [String]
    let verdict: WordRushVerdict?
    let teachClip: WordRushTeachClip?
    let endedAt: Double?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case roomId, status, hostParticipantId, pack, sayIt, cardsReady, players, totalCards, cardIndex
        case phase, phaseSeq, phaseStartedAt, phaseEndsAt, emojiStepMs, card, answers, performer
        case votedIds, verdict, teachClip, endedAt
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        roomId = (try? c.decode(String.self, forKey: .roomId)) ?? ""
        status = (try? c.decode(WordRushStatus.self, forKey: .status)) ?? .unknown
        hostParticipantId = (try? c.decode(String.self, forKey: .hostParticipantId)) ?? ""
        pack = (try? c.decode(String.self, forKey: .pack)) ?? "mix"
        sayIt = (try? c.decode(Bool.self, forKey: .sayIt)) ?? false
        cardsReady = (try? c.decode(Bool.self, forKey: .cardsReady)) ?? false
        players = (try? c.decode([WordRushPlayer].self, forKey: .players)) ?? []
        totalCards = c.flexInt(.totalCards)
        cardIndex = c.flexInt(.cardIndex)
        phase = (try? c.decode(WordRushPhase.self, forKey: .phase)) ?? .unknown
        phaseSeq = c.flexInt(.phaseSeq)
        phaseStartedAt = (try? c.decode(Double.self, forKey: .phaseStartedAt)) ?? 0
        phaseEndsAt = (try? c.decode(Double.self, forKey: .phaseEndsAt)) ?? 0
        emojiStepMs = (try? c.decode(Double.self, forKey: .emojiStepMs)) ?? 2500
        card = try? c.decodeIfPresent(WordRushCard.self, forKey: .card)
        answers = (try? c.decode([WordRushAnswer].self, forKey: .answers)) ?? []
        performer = try? c.decodeIfPresent(WordRushPerformer.self, forKey: .performer)
        votedIds = (try? c.decode([String].self, forKey: .votedIds)) ?? []
        verdict = try? c.decodeIfPresent(WordRushVerdict.self, forKey: .verdict)
        teachClip = try? c.decodeIfPresent(WordRushTeachClip.self, forKey: .teachClip)
        endedAt = try? c.decodeIfPresent(Double.self, forKey: .endedAt)
    }

    var isLive: Bool { status == .lobby || status == .active }

    func player(_ participantId: String) -> WordRushPlayer? {
        players.first { $0.participantId == participantId }
    }

    func answer(for participantId: String) -> WordRushAnswer? {
        answers.first { $0.participantId == participantId }
    }

    /// Phase-unique key so per-phase UI state resets when the server moves on
    var phaseKey: String { "\(id)-\(phaseSeq)" }
    var cardKey: String { "\(id)-\(cardIndex)" }
}

extension KeyedDecodingContainer {
    func flexInt(_ key: Key, default fallback: Int = 0) -> Int {
        flexIntIfPresent(key) ?? fallback
    }

    func flexIntIfPresent(_ key: Key) -> Int? {
        if let i = try? decodeIfPresent(Int.self, forKey: key) { return i }
        if let d = try? decodeIfPresent(Double.self, forKey: key) { return Int(d.rounded()) }
        return nil
    }
}
