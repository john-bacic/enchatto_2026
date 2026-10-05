import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { wordRushCard, wordRushLang, wordRushPhase, wordRushVote } from "./wordRushShared";

export default defineSchema({
  rooms: defineTable({
    joinCode: v.string(),
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("closed")),
    settings: v.object({
      sourceLanguage: v.string(),
      targetLanguage: v.string(),
      romajiEnabled: v.boolean(),
      suggestionsEnabled: v.boolean(),
      maxParticipants: v.number(),
    }),
    hostId: v.string(),
    createdAt: v.number(),
    closedAt: v.optional(v.number()),
    background: v.optional(v.number()),
  })
    .index("by_joinCode", ["joinCode"])
    .index("by_status", ["status"])
    // Finds rooms closed before a given time without reading the open ones (rooms.purgeClosedRooms)
    .index("by_status_closedAt", ["status", "closedAt"]),

  // APNs device token of the iOS host; kept off `rooms` because room docs are sent to guests
  hostPushTokens: defineTable({
    roomId: v.id("rooms"),
    token: v.string(),
  }).index("by_roomId", ["roomId"]),

  participants: defineTable({
    roomId: v.id("rooms"),
    nickname: v.string(),
    role: v.union(v.literal("host"), v.literal("participant")),
    platform: v.union(v.literal("ios"), v.literal("web")),
    avatar: v.object({
      type: v.union(v.literal("preset"), v.literal("custom")),
      value: v.string(),
    }),
    preferredLanguage: v.string(),
    displaySettings: v.optional(v.object({
      showEnglish: v.boolean(),
      showJapanese: v.boolean(),
      showRomaji: v.boolean(),
    })),
    online: v.boolean(),
    departed: v.optional(v.boolean()),
    presence: v.optional(v.union(v.literal("online"), v.literal("away"))),
    typingAction: v.optional(v.union(v.literal("typing"), v.literal("drawing"), v.literal("voicing"))),
    drawingStartedAt: v.optional(v.number()),
    lastSeenAt: v.number(),
    joinedAt: v.number(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_role", ["roomId", "role"])
    // Finds who is online and has gone silent without reading everyone who ever joined (participants.cleanupStaleParticipants)
    .index("by_online_lastSeenAt", ["online", "lastSeenAt"]),

  // The secret each client made up for its participant (participants.ts: requireCaller). A table of its
  // own because participant documents are sent whole to everyone in the room.
  participantSecrets: defineTable({
    participantId: v.id("participants"),
    token: v.string(),
  }).index("by_participantId", ["participantId"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    kind: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("drawing"),
      v.literal("system"),
      v.literal("audio")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("processed"),
      v.literal("failed")
    ),
    text: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id("_storage")),
    /** The stored file behind mediaUrl for an image or a chat drawing, kept so the file can be deleted with the message. Rows from before this field have only the URL. Never sent to clients. */
    mediaStorageId: v.optional(v.id("_storage")),
    durationMs: v.optional(v.number()),
    /** Peak levels (0..1) sampled across the clip, drawn as the bubble's waveform */
    waveform: v.optional(v.array(v.number())),
    processing: v.optional(
      v.object({
        translatedText: v.optional(v.string()),
        romaji: v.optional(v.string()),
        suggestions: v.optional(v.array(v.string())),
        error: v.optional(v.string()),
      })
    ),
    replyToId: v.optional(v.id("messages")),
    /** Made up by the sender per message; a send repeated with the same id returns the first message */
    clientId: v.optional(v.string()),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
    /** True on a failed message whose only failure so far is the server's own translation: the iOS host has not answered for it, so it stays in the host's queue (messages.ts: getPendingMessagesForProcessor). Removed by the host's answer or by a translation. */
    awaitingHost: v.optional(v.boolean()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"])
    .index("by_roomId_createdAt", ["roomId", "createdAt"])
    .index("by_roomId_clientId", ["roomId", "clientId"])
    // Whether a stored file is already some voice message's clip (participants.ts: heldByVoiceMessage)
    .index("by_audioStorageId", ["audioStorageId"])
    // The failed messages still left for the host, without reading the room's other failed ones
    .index("by_roomId_awaitingHost", ["roomId", "awaitingHost"])
    // A room's messages that still have a voice clip, without reading its other messages (messages.ts: purgeRoomAudio)
    .index("by_roomId_audioStorageId", ["roomId", "audioStorageId"])
    // A room's messages of one kind in the order of the chat, without reading its other messages (emojiMatch.ts, emojiBingo.ts: a game's summary message and start line among the system messages)
    .index("by_roomId_kind_createdAt", ["roomId", "kind", "createdAt"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    participantId: v.id("participants"),
    emoji: v.string(),
    createdAt: v.number(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_messageId_participantId", ["messageId", "participantId"]),

  gameSessions: defineTable({
    roomId: v.id("rooms"),
    gameType: v.string(),
    status: v.union(v.literal("active"), v.literal("complete")),
    createdByParticipantId: v.id("participants"),
    playerIds: v.array(v.id("participants")),
    playerOrder: v.optional(v.array(v.id("participants"))),
    chainCount: v.number(),
    level: v.optional(v.number()),
    timerEnabled: v.optional(v.union(v.boolean(), v.number())),
    customPrompts: v.optional(v.array(v.object({
      text: v.string(),
      ja: v.string(),
      hint: v.optional(v.string()),
      hintJa: v.optional(v.string()),
    }))),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    cancelled: v.optional(v.boolean()),
    // Lost in Translation played in two teams: each team's players in the order they take the drawing. A team
    // is known to clients by its place here, 0 or 1. Missing, with teamAway: everyone plays for themselves.
    teams: v.optional(v.array(v.array(v.id("participants")))),
    // Team game: the players whose last turn was not played, which is everyone before their first. A guess the
    // server closes counts against the team of a player who is not in here. Brought up to date as each round ends.
    teamAway: v.optional(v.array(v.id("participants"))),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"]),

  emojifyrRounds: defineTable({
    gameSessionId: v.id("gameSessions"),
    roundIndex: v.number(),
    writerParticipantId: v.id("participants"),
    originalSentence: v.optional(v.string()),
    translatedSentence: v.optional(v.string()),
    emojiClue: v.optional(v.string()),
    status: v.union(
      v.literal("writing"),
      v.literal("generating"),
      v.literal("preview"),
      v.literal("guessing"),
      v.literal("reveal"),
      v.literal("complete")
    ),
    isInitialism: v.optional(v.boolean()),
    hintEn: v.optional(v.string()),
    hintJa: v.optional(v.string()),
    maxCharacters: v.number(),
    startedAt: v.number(),
    revealedAt: v.optional(v.number()),
  })
    .index("by_gameSessionId", ["gameSessionId"]),

  emojifyrGuesses: defineTable({
    roundId: v.id("emojifyrRounds"),
    participantId: v.id("participants"),
    guessText: v.string(),
    translatedGuessText: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_roundId", ["roundId"]),

  emojiMatchGames: defineTable({
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("lobby"),
      v.literal("active"),
      v.literal("resolving"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    hostParticipantId: v.id("participants"),
    players: v.array(v.object({
      participantId: v.id("participants"),
      nickname: v.string(),
      avatarValue: v.string(),
      joinedAt: v.number(),
      isActive: v.boolean(),
      score: v.number(),
      turns: v.optional(v.number()),
    })),
    turnOrder: v.array(v.id("participants")),
    currentTurnParticipantId: v.optional(v.id("participants")),
    board: v.array(v.object({
      cardId: v.string(),
      pairKey: v.string(),
      content: v.object({
        kind: v.string(),
        value: v.string(),
        label: v.optional(v.string()),
      }),
      isMatched: v.boolean(),
      isRevealed: v.boolean(),
    })),
    selectedCardIds: v.array(v.string()),
    matchedPairCount: v.number(),
    totalPairs: v.number(),
    boardRows: v.number(),
    boardCols: v.number(),
    turnTimeoutMs: v.optional(v.number()),
    mismatchRevealMs: v.number(),
    result: v.optional(v.object({
      winnerParticipantIds: v.array(v.id("participants")),
      isTie: v.boolean(),
      endReason: v.string(),
    })),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    turnStartedAt: v.optional(v.number()),
    /** Turns in a row that ran out with no card flipped; the game is ended when this gets too high */
    idleTimeouts: v.optional(v.number()),
    resolveAt: v.optional(v.number()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"]),

  truthOrDareGames: defineTable({
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    hostParticipantId: v.id("participants"),
    promptMode: v.optional(v.union(v.literal("normal"), v.literal("deep"), v.literal("spicy"))),
    playerOrder: v.array(v.id("participants")),
    currentTurnIndex: v.number(),
    currentTurnParticipantId: v.optional(v.id("participants")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    /** completedTurns value whose 10-turn round break the host has continued past */
    roundBreakAckedTurns: v.optional(v.number()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"]),

  truthOrDareTurns: defineTable({
    gameId: v.id("truthOrDareGames"),
    turnIndex: v.number(),
    participantId: v.id("participants"),
    choice: v.optional(v.union(v.literal("truth"), v.literal("dare"))),
    promptId: v.optional(v.string()),
    promptText: v.optional(v.string()),
    promptResponseType: v.optional(v.union(
      v.literal("text"),
      v.literal("photo"),
      v.literal("drawing")
    )),
    responseText: v.optional(v.string()),
    translatedResponseText: v.optional(v.string()),
    responseMediaUrl: v.optional(v.string()),
    /** The stored file behind responseMediaUrl, kept so the room purge can delete it. Never sent to clients. */
    responseStorageId: v.optional(v.id("_storage")),
    ratings: v.optional(v.array(v.object({
      participantId: v.id("participants"),
      score: v.number(),
    }))),
    status: v.union(
      v.literal("waiting_for_choice"),
      v.literal("waiting_for_response"),
      v.literal("completed"),
      v.literal("skipped")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_gameId", ["gameId"])
    .index("by_gameId_status", ["gameId", "status"]),

  // Lightweight trace logs for debugging gameplay
  emTrace: defineTable({
    gameId: v.id("emojiMatchGames"),
    action: v.string(),
    participantId: v.optional(v.string()),
    detail: v.optional(v.string()),
    ts: v.number(),
  })
    .index("by_gameId", ["gameId"])
    .index("by_ts", ["ts"]),

  todTrace: defineTable({
    gameId: v.id("truthOrDareGames"),
    action: v.string(),                       // e.g. "submitChoice", "advanceTurn"
    participantId: v.optional(v.string()),
    detail: v.optional(v.string()),           // JSON payload snippet
    serverMs: v.optional(v.number()),         // server-side processing time
    ts: v.number(),
  })
    .index("by_gameId", ["gameId"])
    .index("by_ts", ["ts"]),

  gameChains: defineTable({
    gameSessionId: v.id("gameSessions"),
    chainIndex: v.number(),
    originalPrompt: v.string(),
    options: v.optional(v.array(v.string())),
    drawerParticipantId: v.optional(v.id("participants")),
    status: v.union(v.literal("active"), v.literal("complete")),
    currentStepIndex: v.number(),
    maxSteps: v.number(),
    // Team game, written once when the round ends: for each team, how many of its guessers count and how many
    // of those were right. Missing on a round that has not ended, or that a Cancel closed.
    teamRound: v.optional(v.array(v.object({ right: v.number(), counted: v.number() }))),
  })
    .index("by_gameSessionId", ["gameSessionId"]),

  gameSteps: defineTable({
    gameSessionId: v.id("gameSessions"),
    chainId: v.id("gameChains"),
    stepIndex: v.number(),
    stepType: v.union(v.literal("draw"), v.literal("guess")),
    assignedParticipantId: v.id("participants"),
    inputText: v.optional(v.string()),
    hintText: v.optional(v.string()),
    inputDrawingUrl: v.optional(v.string()),
    outputText: v.optional(v.string()),
    translatedOutputText: v.optional(v.string()),
    outputDrawingUrl: v.optional(v.string()),
    /** The stored file behind outputDrawingUrl when the submit-step route stored the drawing, kept so the room purge can delete it. A drawing sent to the mutation is a data URL and has no file. Never sent to clients. */
    outputDrawingStorageId: v.optional(v.id("_storage")),
    selectedOption: v.optional(v.string()),
    correct: v.optional(v.boolean()),
    // Closed by the server with nobody answering. The status is still "submitted" because
    // installed iOS builds cannot decode a new status literal.
    timedOut: v.optional(v.boolean()),
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("submitted")),
    createdAt: v.number(),
    submittedAt: v.optional(v.number()),
  })
    .index("by_gameSessionId", ["gameSessionId"])
    .index("by_chainId", ["chainId"])
    .index("by_assignedParticipantId_status", ["assignedParticipantId", "status"]),

  // ─── Emoji Bingo ────────────────────────────────────────────────────────────
  wordRushGames: defineTable({
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("lobby"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    hostParticipantId: v.id("participants"),
    pack: v.string(),
    sayIt: v.boolean(),
    cardsReady: v.boolean(),
    /** Bumped on every pack change; a generation that finds a newer value was superseded */
    genSeq: v.optional(v.number()),
    /** Card generations this game has paid for */
    genCount: v.optional(v.number()),
    cards: v.array(wordRushCard),
    players: v.array(
      v.object({
        participantId: v.id("participants"),
        nickname: v.string(),
        avatarValue: v.string(),
        learning: wordRushLang,
        joinedAt: v.number(),
        score: v.number(),
        streak: v.number(),
        bestStreak: v.number(),
        correct: v.number(),
        sayItCount: v.number(),
        sayItBonus: v.number(),
        hintCard: v.optional(v.number()),
      })
    ),
    cardIndex: v.number(),
    phase: wordRushPhase,
    phaseSeq: v.number(),
    phaseStartedAt: v.number(),
    phaseEndsAt: v.number(),
    performerId: v.optional(v.id("participants")),
    performerLang: v.optional(wordRushLang),
    clipStorageId: v.optional(v.id("_storage")),
    teachClip: v.optional(
      v.object({ storageId: v.id("_storage"), byParticipantId: v.id("participants") })
    ),
    verdict: v.optional(
      v.object({
        bonus: v.number(),
        label: wordRushVote,
        votes: v.array(
          v.object({ judgeId: v.id("participants"), vote: wordRushVote, weight: v.number() })
        ),
      })
    ),
    storageIds: v.array(v.id("_storage")),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"]),

  wordRushAnswers: defineTable({
    gameId: v.id("wordRushGames"),
    cardIndex: v.number(),
    participantId: v.id("participants"),
    choiceIndex: v.number(),
    correct: v.boolean(),
    points: v.number(),
    elapsedMs: v.number(),
  }).index("by_game_card", ["gameId", "cardIndex"]),

  wordRushVotes: defineTable({
    gameId: v.id("wordRushGames"),
    cardIndex: v.number(),
    judgeId: v.id("participants"),
    vote: wordRushVote,
    weight: v.number(),
  }).index("by_game_card", ["gameId", "cardIndex"]),

  emojiBingoGames: defineTable({
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("lobby"),
      v.literal("active"),
      v.literal("won"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    hostParticipantId: v.id("participants"),
    winPattern: v.union(
      v.literal("line"),
      v.literal("four_corners"),
      v.literal("blackout")
    ),
    callIntervalMs: v.number(),
    turnOrder: v.optional(v.array(v.string())),
    currentTurnParticipantId: v.optional(v.string()),
    turnStartedAt: v.optional(v.number()),
    turnTimeoutMs: v.optional(v.number()),
    players: v.array(v.object({
      participantId: v.id("participants"),
      nickname: v.string(),
      avatarValue: v.string(),
      joinedAt: v.number(),
      card: v.array(v.string()),
      markedCells: v.array(v.number()),
      placement: v.number(),
    })),
    drawDeck: v.array(v.string()),
    calledEmojis: v.array(v.string()),
    drawIndex: v.number(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    firstBingoAt: v.optional(v.number()),
    nextDrawScheduledAt: v.optional(v.number()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_status", ["roomId", "status"]),

  bingoTrace: defineTable({
    gameId: v.id("emojiBingoGames"),
    action: v.string(),
    participantId: v.optional(v.string()),
    detail: v.optional(v.string()),
    ts: v.number(),
  })
    .index("by_gameId", ["gameId"])
    .index("by_ts", ["ts"]),

  // One row per limited thing and subject (participants.ts: takeRateLimit)
  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_windowStart", ["windowStart"]),

  // The lease of the closed-room purge (rooms.purgeClosedRooms): one row, rewritten by every step.
  // Not room data: nothing here is ever purged and no query returns it.
  purgeRuns: defineTable({
    /** When the run started. A step that carries another run's id stops */
    runId: v.number(),
    heartbeatAt: v.number(),
    roomsPurged: v.number(),
    finishedAt: v.optional(v.number()),
  }),
});
