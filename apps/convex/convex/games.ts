import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Leveled prompts — level 1 has single words with hints, higher levels get progressively harder
const LEVEL_PROMPTS: Record<number, Array<{ text: string; ja: string; hint?: string; hintJa?: string }>> = {
  1: [
    { text: "Cat", ja: "猫", hint: "Says meow", hintJa: "ニャーと鳴く" },
    { text: "Dog", ja: "犬", hint: "Man's best friend", hintJa: "人間の親友" },
    { text: "Sun", ja: "太陽", hint: "Bright in the sky", hintJa: "空に輝く" },
    { text: "Tree", ja: "木", hint: "Has leaves", hintJa: "葉っぱがある" },
    { text: "Fish", ja: "魚", hint: "Swims in water", hintJa: "水の中を泳ぐ" },
    { text: "House", ja: "家", hint: "People live here", hintJa: "人が住む場所" },
    { text: "Star", ja: "星", hint: "Twinkles at night", hintJa: "夜に輝く" },
    { text: "Flower", ja: "花", hint: "Grows in a garden", hintJa: "庭に咲く" },
    { text: "Car", ja: "車", hint: "Has four wheels", hintJa: "4つの車輪がある" },
    { text: "Bird", ja: "鳥", hint: "Has wings", hintJa: "翼がある" },
    { text: "Moon", ja: "月", hint: "Seen at night", hintJa: "夜に見える" },
    { text: "Apple", ja: "りんご", hint: "Red fruit", hintJa: "赤い果物" },
    { text: "Robot", ja: "ロボット", hint: "Made of metal", hintJa: "金属でできている" },
    { text: "Pizza", ja: "ピザ", hint: "Italian food", hintJa: "イタリアの食べ物" },
    { text: "Snake", ja: "ヘビ", hint: "No legs", hintJa: "足がない" },
    { text: "Cake", ja: "ケーキ", hint: "Birthday treat", hintJa: "誕生日のお菓子" },
    { text: "Rocket", ja: "ロケット", hint: "Goes to space", hintJa: "宇宙に行く" },
    { text: "Ghost", ja: "お化け", hint: "Says boo", hintJa: "怖い" },
    { text: "Dragon", ja: "ドラゴン", hint: "Breathes fire", hintJa: "火を吐く" },
    { text: "Banana", ja: "バナナ", hint: "Yellow fruit", hintJa: "黄色い果物" },
  ],
  2: [
    { text: "Flying cat", ja: "飛ぶ猫" },
    { text: "Dancing robot", ja: "踊るロボット" },
    { text: "Angry pizza", ja: "怒ったピザ" },
    { text: "Happy cloud", ja: "幸せな雲" },
    { text: "Surfing penguin", ja: "サーフィンペンギン" },
    { text: "Singing frog", ja: "歌うカエル" },
    { text: "Sleepy dragon", ja: "眠いドラゴン" },
    { text: "Running sushi", ja: "走る寿司" },
    { text: "Crying banana", ja: "泣くバナナ" },
    { text: "Magic hat", ja: "魔法の帽子" },
    { text: "Ninja turtle", ja: "忍者カメ" },
    { text: "Space dog", ja: "宇宙犬" },
    { text: "Fire snowman", ja: "炎の雪だるま" },
    { text: "Baby shark", ja: "赤ちゃんサメ" },
    { text: "Pirate cat", ja: "海賊猫" },
    { text: "Rocket snail", ja: "ロケットカタツムリ" },
    { text: "Zombie chef", ja: "ゾンビシェフ" },
    { text: "Disco ball", ja: "ディスコボール" },
    { text: "Rainbow fish", ja: "虹の魚" },
    { text: "Alien cow", ja: "宇宙人の牛" },
  ],
  3: [
    { text: "Cat riding a skateboard", ja: "スケボーに乗る猫" },
    { text: "Robot eating ice cream", ja: "アイスを食べるロボット" },
    { text: "Dragon blowing birthday candles", ja: "誕生日のろうそくを吹くドラゴン" },
    { text: "Penguin surfing a wave", ja: "波に乗るペンギン" },
    { text: "Banana dancing in rain", ja: "雨の中で踊るバナナ" },
    { text: "Frog playing the piano", ja: "ピアノを弾くカエル" },
    { text: "Shark wearing sunglasses", ja: "サングラスをかけたサメ" },
    { text: "Cloud lifting heavy weights", ja: "重いものを持ち上げる雲" },
    { text: "Pizza delivering itself", ja: "自分を配達するピザ" },
    { text: "Cactus giving a hug", ja: "ハグするサボテン" },
    { text: "Sloth doing karate", ja: "空手をするナマケモノ" },
    { text: "Ghost using a phone", ja: "スマホを使うお化け" },
    { text: "Flamingo doing ballet", ja: "バレエをするフラミンゴ" },
    { text: "Potato as a superhero", ja: "スーパーヒーローのジャガイモ" },
    { text: "Octopus juggling balls", ja: "ボールをジャグリングするタコ" },
    { text: "Donut running from police", ja: "警察から逃げるドーナツ" },
    { text: "Taco riding a unicorn", ja: "ユニコーンに乗るタコス" },
    { text: "Snail winning a race", ja: "レースに勝つカタツムリ" },
    { text: "Pineapple at pool party", ja: "プールパーティーのパイナップル" },
    { text: "Monkey flying a plane", ja: "飛行機を操縦するサル" },
  ],
  4: [
    { text: "A banana dancing in a top hat", ja: "シルクハットをかぶって踊るバナナ" },
    { text: "An angry robot doing yoga at sunset", ja: "夕日の中でヨガをする怒ったロボット" },
    { text: "A shark wearing glasses reading a book", ja: "メガネをかけて本を読むサメ" },
    { text: "A penguin delivering pizza on a bicycle", ja: "自転車でピザを届けるペンギン" },
    { text: "A dragon trying to blow out birthday candles", ja: "誕生日のろうそくを吹き消そうとするドラゴン" },
    { text: "A cat surfing on a giant wave", ja: "巨大な波に乗る猫" },
    { text: "An octopus juggling while riding a unicycle", ja: "一輪車に乗りながらジャグリングするタコ" },
    { text: "A snail winning a marathon against a rabbit", ja: "ウサギに勝ってマラソンを制すカタツムリ" },
    { text: "A ghost trying to take a selfie", ja: "自撮りしようとするお化け" },
    { text: "A pineapple relaxing at a pool party", ja: "プールパーティーでくつろぐパイナップル" },
    { text: "A cactus giving a warm hug to a balloon", ja: "風船を温かくハグするサボテン" },
    { text: "A potato dressed as a superhero saving the day", ja: "スーパーヒーローに扮して世界を救うジャガイモ" },
    { text: "A flamingo teaching ballet to a hippo", ja: "カバにバレエを教えるフラミンゴ" },
    { text: "A cloud lifting weights at the gym", ja: "ジムでウエイトを持ち上げる雲" },
    { text: "A donut being chased by the police", ja: "警察に追いかけられるドーナツ" },
    { text: "A taco riding a unicorn through a rainbow", ja: "虹の中をユニコーンに乗るタコス" },
    { text: "A frog playing piano at a jazz concert", ja: "ジャズコンサートでピアノを弾くカエル" },
    { text: "A sloth winning a karate tournament", ja: "空手大会で優勝するナマケモノ" },
    { text: "A fish driving a car through the desert", ja: "砂漠で車を運転する魚" },
    { text: "An alien cow abducting a farmer", ja: "農家を誘拐する宇宙人の牛" },
  ],
};

// Build a flat translation map: English text → { ja, hintJa }
const PROMPT_TRANSLATIONS: Record<string, { ja: string; hintJa?: string }> = {};
for (const prompts of Object.values(LEVEL_PROMPTS)) {
  for (const p of prompts) {
    PROMPT_TRANSLATIONS[p.text] = { ja: p.ja, hintJa: p.hintJa };
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Pick 3 distractor prompts from the same level, excluding the correct one */
function generateDistractors(correctPrompt: string, allPrompts: Array<{ text: string }>): string[] {
  const others = allPrompts.filter((p) => p.text !== correctPrompt);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, 3).map((p) => p.text);
}

const TOTAL_ROUNDS = 10;

export const startGame = mutation({
  args: {
    roomId: v.id("rooms"),
    participantId: v.id("participants"),
    gameType: v.string(),
    level: v.optional(v.number()),
    timerEnabled: v.optional(v.union(v.boolean(), v.number())),
    customPrompts: v.optional(v.array(v.object({
      text: v.string(),
      ja: v.string(),
      hint: v.optional(v.string()),
      hintJa: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const level = args.level ?? 1;

    // Verify room exists and is active
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    // Verify participant is host
    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    if (participant.role !== "host") throw new Error("Only the host can start a game");

    // Check no active game
    const activeGames = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .collect();
    if (activeGames.length > 0) throw new Error("A game is already in progress");

    // Get online, non-departed participants
    const allParticipants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const players = allParticipants.filter((p) => p.online && !p.departed);
    if (players.length < 2) throw new Error("Need at least 2 players");

    const playerIds = players.map((p) => p._id);
    const playerCount = playerIds.length;

    // Use custom prompts from iOS host if provided, otherwise fall back to hardcoded
    const promptLevel = Math.min(level, 4);
    const prompts: Array<{ text: string; ja: string; hint?: string; hintJa?: string }> =
      args.customPrompts && args.customPrompts.length >= TOTAL_ROUNDS
        ? args.customPrompts
        : LEVEL_PROMPTS[promptLevel] ?? LEVEL_PROMPTS[4];
    const shuffledPrompts = shuffleArray(prompts);

    // Pick 10 correct prompts for the 10 rounds
    const correctPrompts = shuffledPrompts.slice(0, TOTAL_ROUNDS);
    const correctTexts = new Set(correctPrompts.map((p) => p.text));

    // Build a distractor pool from the same level so choices match difficulty
    // (e.g., level 1 only shows single words, level 2 only two-word phrases).
    // Fall back to all levels only if same-level pool is too small.
    const sameLevelPool = LEVEL_PROMPTS[promptLevel] ?? [];
    const allAvailable: Array<{ text: string }> = args.customPrompts
      ? args.customPrompts
      : sameLevelPool.filter((p) => !correctTexts.has(p.text)).length >= 3
        ? sameLevelPool
        : Object.values(LEVEL_PROMPTS).flat();
    const distractorPool = shuffleArray(
      allAvailable.filter((p) => !correctTexts.has(p.text))
    );

    // Pre-assign 3 unique distractors per round sequentially (no repeats across rounds)
    let distIdx = 0;
    const roundDistractors: string[][] = [];
    for (let r = 0; r < TOTAL_ROUNDS; r++) {
      const rd: string[] = [];
      for (let d = 0; d < 3; d++) {
        rd.push(distractorPool[distIdx % distractorPool.length].text);
        distIdx++;
      }
      roundDistractors.push(rd);
    }

    // Create game session — always 10 rounds
    const sessionId = await ctx.db.insert("gameSessions", {
      roomId: args.roomId,
      gameType: args.gameType,
      status: "active",
      createdByParticipantId: args.participantId,
      playerIds,
      chainCount: TOTAL_ROUNDS,
      level,
      timerEnabled: args.timerEnabled ?? 20,
      customPrompts: args.customPrompts,
      createdAt: Date.now(),
    });

    // Create 10 chains (rounds), each with a unique prompt, options, and drawer
    for (let r = 0; r < TOTAL_ROUNDS; r++) {
      const promptData = correctPrompts[r];
      const prompt = promptData.text;
      const hint = promptData.hint;
      const drawerId = playerIds[r % playerCount];

      // Use pre-assigned unique distractors
      const options = shuffleArray([prompt, ...roundDistractors[r]]);

      const chainId = await ctx.db.insert("gameChains", {
        gameSessionId: sessionId,
        chainIndex: r,
        originalPrompt: prompt,
        options,
        drawerParticipantId: drawerId,
        status: r === 0 ? "active" : "active",
        currentStepIndex: 0,
        maxSteps: playerCount, // 1 draw + (N-1) guesses
      });

      // Only create the first round's draw step as active
      if (r === 0) {
        await ctx.db.insert("gameSteps", {
          gameSessionId: sessionId,
          chainId,
          stepIndex: 0,
          stepType: "draw",
          assignedParticipantId: drawerId,
          inputText: prompt,
          status: "active",
          createdAt: Date.now(),
        });
      }
    }

    // Post system message
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.participantId,
      kind: "system",
      status: "processed",
      text: `game:Lost in Translation Level ${level}`,
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

export const submitGameStep = mutation({
  args: {
    stepId: v.id("gameSteps"),
    participantId: v.id("participants"),
    outputText: v.optional(v.string()),
    translatedOutputText: v.optional(v.string()),
    outputDrawingUrl: v.optional(v.string()),
    selectedOption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("[submitGameStep] called with stepId:", args.stepId);
    try {
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");
    if (step.assignedParticipantId !== args.participantId) throw new Error("Not your step");
    if (step.status !== "active") throw new Error("Step is not active");

    const chain = await ctx.db.get(step.chainId);
    if (!chain) throw new Error("Chain not found");
    const session = await ctx.db.get(chain.gameSessionId);
    if (!session) throw new Error("Session not found");

    const playerIds = session.playerIds;
    const playerCount = playerIds.length;

    console.log("[submitGameStep] type:", step.stepType, "chain:", chain.chainIndex, "players:", playerCount);

    // === DRAW STEP SUBMITTED ===
    if (step.stepType === "draw") {
      // Save the drawing
      await ctx.db.patch(args.stepId, {
        outputDrawingUrl: args.outputDrawingUrl,
        status: "submitted",
        submittedAt: Date.now(),
      });

      // Post drawing to room timeline
      if (args.outputDrawingUrl) {
        await ctx.db.insert("messages", {
          roomId: session.roomId,
          senderId: args.participantId,
          kind: "drawing",
          status: "processed",
          mediaUrl: args.outputDrawingUrl,
          createdAt: Date.now(),
        });
      }

      // Create guess steps for ALL other players (all active simultaneously)
      const guessers = playerIds.filter((pid) => pid !== chain.drawerParticipantId);
      console.log("[submitGameStep] draw done, creating", guessers.length, "guess steps");
      for (let i = 0; i < guessers.length; i++) {
        await ctx.db.insert("gameSteps", {
          gameSessionId: session._id,
          chainId: step.chainId,
          stepIndex: 1 + i,
          stepType: "guess",
          assignedParticipantId: guessers[i],
          inputDrawingUrl: args.outputDrawingUrl,
          status: "active",
          createdAt: Date.now(),
        });
      }

      await ctx.db.patch(step.chainId, { currentStepIndex: 1 });
      console.log("[submitGameStep] draw path complete for chain", chain.chainIndex);
      return;
    }

    // === GUESS STEP SUBMITTED ===
    const selectedOption = args.selectedOption ?? args.outputText;
    // Check correctness against both English original and Japanese translation
    // Look up translation from custom prompts first, then hardcoded
    let jaTranslation = PROMPT_TRANSLATIONS[chain.originalPrompt]?.ja;
    if (!jaTranslation && session.customPrompts) {
      const cp = session.customPrompts.find((p: { text: string; ja: string }) => p.text === chain.originalPrompt);
      if (cp) jaTranslation = cp.ja;
    }
    const isCorrect = selectedOption === chain.originalPrompt || (!!jaTranslation && selectedOption === jaTranslation);
    console.log("[submitGameStep] guess:", selectedOption, "correct:", isCorrect, "expected:", chain.originalPrompt, "ja:", jaTranslation);

    await ctx.db.patch(args.stepId, {
      outputText: selectedOption,
      selectedOption: selectedOption,
      correct: isCorrect,
      status: "submitted",
      submittedAt: Date.now(),
    });

    // Post correct/wrong feedback to chat timeline
    const guesser = await ctx.db.get(args.participantId);
    const msgPrefix = isCorrect ? "game_correct" : "game_wrong";
    await ctx.db.insert("messages", {
      roomId: session.roomId,
      senderId: args.participantId,
      kind: "system",
      status: "processed",
      text: `${msgPrefix}:${guesser?.nickname ?? "?"}|${chain.originalPrompt}`,
      createdAt: Date.now(),
    });

    // Check if ALL guess steps for this chain are submitted
    const chainSteps = await ctx.db
      .query("gameSteps")
      .withIndex("by_chainId", (q) => q.eq("chainId", step.chainId))
      .collect();
    const guessSteps = chainSteps.filter((s) => s.stepType === "guess");
    const allGuessesSubmitted = guessSteps.every(
      (s) => s._id === args.stepId ? true : s.status === "submitted"
    );

    console.log("[submitGameStep] guessSteps:", guessSteps.length, "allSubmitted:", allGuessesSubmitted);

    if (!allGuessesSubmitted) return; // Wait for other guessers

    // All guesses in — complete this chain/round
    await ctx.db.patch(step.chainId, { status: "complete" });

    // Find the next chain (next round)
    const allChains = await ctx.db
      .query("gameChains")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
      .collect();
    allChains.sort((a, b) => a.chainIndex - b.chainIndex);

    const nextChain = allChains.find(
      (ch) => ch.chainIndex === chain.chainIndex + 1
    );

    console.log("[submitGameStep] chain", chain.chainIndex, "complete. nextChain:", nextChain ? nextChain.chainIndex : "NONE");

    if (!nextChain) {
      // No more rounds — game complete
      await ctx.db.patch(session._id, {
        status: "complete",
        completedAt: Date.now(),
      });
      return;
    }

    console.log("[submitGameStep] creating draw step for chain", nextChain.chainIndex, "drawer:", nextChain.drawerParticipantId);

    await ctx.db.insert("gameSteps", {
      gameSessionId: session._id,
      chainId: nextChain._id,
      stepIndex: 0,
      stepType: "draw",
      assignedParticipantId: nextChain.drawerParticipantId!,
      inputText: nextChain.originalPrompt,
      status: "active",
      createdAt: Date.now(),
    });
    console.log("[submitGameStep] draw step created successfully for chain", nextChain.chainIndex);
    } catch (err: any) {
      console.error("[submitGameStep] ERROR:", err.message ?? err);
      throw err;
    }
  },
});

// Action wrapper for submitting game steps (handles drawing + multiple choice)
export const submitGameStepWithTranslation = action({
  args: {
    stepId: v.id("gameSteps"),
    participantId: v.id("participants"),
    outputText: v.optional(v.string()),
    outputDrawingUrl: v.optional(v.string()),
    selectedOption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Build args object, omitting undefined values (Convex requires absent, not undefined)
    const mutationArgs: Record<string, unknown> = {
      stepId: args.stepId,
      participantId: args.participantId,
    };
    if (args.outputText !== undefined) mutationArgs.outputText = args.outputText;
    if (args.outputDrawingUrl !== undefined) mutationArgs.outputDrawingUrl = args.outputDrawingUrl;
    if (args.selectedOption !== undefined) mutationArgs.selectedOption = args.selectedOption;

    await ctx.runMutation(api.games.submitGameStep, mutationArgs as any);
  },
});

export const cancelGame = mutation({
  args: {
    roomId: v.id("rooms"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    if (participant.role !== "host") throw new Error("Only the host can cancel a game");

    const activeSessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .collect();

    for (const session of activeSessions) {
      await ctx.db.patch(session._id, {
        status: "complete",
        completedAt: Date.now(),
        cancelled: true,
      });
      // Mark all active chains as complete
      const chains = await ctx.db
        .query("gameChains")
        .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
        .collect();
      for (const chain of chains) {
        if (chain.status === "active") {
          await ctx.db.patch(chain._id, { status: "complete" });
        }
      }
      // Mark all non-submitted steps as submitted so they don't linger
      const steps = await ctx.db
        .query("gameSteps")
        .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
        .collect();
      for (const step of steps) {
        if (step.status !== "submitted") {
          await ctx.db.patch(step._id, { status: "submitted", submittedAt: Date.now() });
        }
      }
    }

    // Post system message that game was cancelled
    if (activeSessions.length > 0) {
      await ctx.db.insert("messages", {
        roomId: args.roomId,
        senderId: args.participantId,
        kind: "system",
        status: "processed",
        text: "game_cancelled:Lost in Translation",
        createdAt: Date.now(),
      });
    }
  },
});

export const getActiveGameSession = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .collect();
    return sessions[0] ?? null;
  },
});

export const getMyActiveStep = query({
  args: { participantId: v.id("participants") },
  handler: async (ctx, args) => {
    // Look up the participant to get their roomId
    const participant = await ctx.db.get(args.participantId);
    if (!participant) return null;

    // Find active game session for this room
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) =>
        q.eq("roomId", participant.roomId).eq("status", "active")
      )
      .collect();
    if (sessions.length === 0) return null;
    const session = sessions[0];

    // Read ALL steps for the session — broad read set ensures the subscription
    // re-fires whenever ANY step in the game changes (insert, update, delete).
    const allSteps = await ctx.db
      .query("gameSteps")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
      .collect();

    // Filter in code to find this participant's active step
    const step = allSteps.find(
      (s) => s.assignedParticipantId === args.participantId && s.status === "active"
    );
    if (!step) return null;

    const chain = await ctx.db.get(step.chainId);
    const round = (chain?.chainIndex ?? 0) + 1;
    const totalRounds = session.chainCount ?? TOTAL_ROUNDS;

    // Build translation map: merge hardcoded with any custom prompts from this session
    const translationMap: Record<string, { ja: string; hintJa?: string }> = { ...PROMPT_TRANSLATIONS };
    if (session.customPrompts) {
      for (const cp of session.customPrompts) {
        translationMap[cp.text] = { ja: cp.ja, hintJa: cp.hintJa };
      }
    }

    // Translate prompt and options if player's language is Japanese
    const lang = participant.preferredLanguage;
    const useJa = lang === "ja";

    const inputText = useJa
      ? (translationMap[step.inputText ?? ""]?.ja ?? step.inputText)
      : step.inputText;
    const hintText = useJa
      ? (translationMap[step.inputText ?? ""]?.hintJa ?? step.hintText)
      : step.hintText;
    const options = chain?.options?.map((o) =>
      useJa ? (translationMap[o]?.ja ?? o) : o
    );
    const correctOption = useJa
      ? (translationMap[chain?.originalPrompt ?? ""]?.ja ?? chain?.originalPrompt)
      : chain?.originalPrompt;

    return {
      ...step,
      inputText,
      hintText,
      chainMaxSteps: chain?.maxSteps ?? 0,
      level: session.level ?? 1,
      round,
      totalRounds,
      options,
      correctOption,
      timerEnabled: typeof session.timerEnabled === "number"
        ? session.timerEnabled
        : (session.timerEnabled !== false ? 20 : 0),
    };
  },
});

export const getGameStatus = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Find active game session
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .collect();
    if (sessions.length === 0) return null;
    const session = sessions[0];

    // Get all chains and steps
    const chains = await ctx.db
      .query("gameChains")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
      .collect();
    chains.sort((a, b) => a.chainIndex - b.chainIndex);

    const allSteps = await ctx.db
      .query("gameSteps")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
      .collect();

    // Find current round: first chain that isn't complete
    const completedChains = chains.filter((c) => c.status === "complete");
    const currentRound = completedChains.length + 1;
    const totalRounds = session.chainCount ?? TOTAL_ROUNDS;

    // Find active draw step (if any) to determine drawer and phase
    const activeDrawStep = allSteps.find((s) => s.stepType === "draw" && s.status === "active");
    const activeGuessSteps = allSteps.filter((s) => s.stepType === "guess" && s.status === "active");
    const phase: "drawing" | "guessing" | "waiting" = activeDrawStep
      ? "drawing"
      : activeGuessSteps.length > 0
        ? "guessing"
        : "waiting";

    // Get drawer info
    const drawerId = activeDrawStep?.assignedParticipantId
      ?? (activeGuessSteps.length > 0
        ? chains.find((c) => {
            return allSteps.some((s) => s.chainId === c._id && s.stepType === "guess" && s.status === "active");
          })?.drawerParticipantId
        : null);

    let drawerName: string | null = null;
    let drawerAvatar: { type: string; value: string } | null = null;
    if (drawerId) {
      const drawer = await ctx.db.get(drawerId);
      if (drawer) {
        drawerName = drawer.nickname;
        drawerAvatar = drawer.avatar;
      }
    }

    // Count guesses submitted vs total for current round
    const currentChain = chains.find((c) => {
      return allSteps.some((s) => s.chainId === c._id && (s.status === "active" || (s.stepType === "guess" && s.status !== "submitted" )));
    }) ?? chains[completedChains.length];
    let guessesSubmitted = 0;
    let guessesTotal = 0;
    if (currentChain) {
      const chainGuesses = allSteps.filter((s) => s.chainId === currentChain._id && s.stepType === "guess");
      guessesTotal = chainGuesses.length;
      guessesSubmitted = chainGuesses.filter((s) => s.status === "submitted").length;
    }

    // Compute live scores
    const playedChainIds = new Set(
      chains
        .filter((chain) => {
          const drawStep = allSteps.find((s) => s.chainId === chain._id && s.stepType === "draw");
          return drawStep && drawStep.outputDrawingUrl;
        })
        .map((c) => c._id)
    );

    const scores: Record<string, { correct: number; total: number; nickname: string; avatar: { type: string; value: string } }> = {};
    for (const pid of session.playerIds) {
      const p = await ctx.db.get(pid);
      scores[pid] = {
        correct: 0,
        total: 0,
        nickname: p?.nickname ?? "?",
        avatar: p?.avatar ?? { type: "preset", value: "fox" },
      };
    }
    for (const step of allSteps) {
      if (step.stepType === "guess" && step.status === "submitted" && playedChainIds.has(step.chainId)) {
        const pid = step.assignedParticipantId;
        if (scores[pid]) {
          scores[pid].total += 1;
          if (step.correct) scores[pid].correct += 1;
        }
      }
    }

    // Timer info for countdown beeps
    const sessionTimer = session.timerEnabled;
    const timerSecs = typeof sessionTimer === "number"
      ? sessionTimer
      : (sessionTimer !== false ? 20 : 0);
    const drawStartedAt = activeDrawStep?.createdAt ?? null;

    return {
      gameType: session.gameType,
      level: session.level ?? 1,
      currentRound,
      totalRounds,
      phase,
      drawerName,
      drawerAvatar,
      guessesSubmitted,
      guessesTotal,
      scores,
      timerSeconds: timerSecs,
      drawStartedAt,
    };
  },
});

export const getLatestGameSession = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    if (sessions.length === 0) return null;
    // Sort by createdAt descending, return most recent
    sessions.sort((a, b) => b.createdAt - a.createdAt);
    return sessions[0];
  },
});

export const getGameReplay = query({
  args: { gameSessionId: v.id("gameSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.gameSessionId);
    if (!session) return null;

    const chains = await ctx.db
      .query("gameChains")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", args.gameSessionId))
      .collect();
    chains.sort((a, b) => a.chainIndex - b.chainIndex);

    const allSteps = await ctx.db
      .query("gameSteps")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", args.gameSessionId))
      .collect();

    // Get all participants for this game
    const participantIds = [...new Set([
      ...allSteps.map((s) => s.assignedParticipantId),
      ...chains.map((c) => c.drawerParticipantId).filter(Boolean) as Id<"participants">[],
    ])];
    const participants: Record<string, { nickname: string; avatar: { type: string; value: string } }> = {};
    for (const pid of participantIds) {
      const p = await ctx.db.get(pid);
      if (p) participants[pid] = { nickname: p.nickname, avatar: p.avatar };
    }

    // Collect chain IDs that were actually played (have a drawing)
    const playedChainIds = new Set(
      chains
        .filter((chain) => {
          const drawStep = allSteps.find((s) => s.chainId === chain._id && s.stepType === "draw");
          return drawStep && drawStep.outputDrawingUrl;
        })
        .map((c) => c._id)
    );

    // Compute scores: per player, only count guesses from played chains
    const scores: Record<string, { correct: number; total: number }> = {};
    for (const pid of session.playerIds) {
      scores[pid] = { correct: 0, total: 0 };
    }
    for (const step of allSteps) {
      if (step.stepType === "guess" && step.status === "submitted" && playedChainIds.has(step.chainId)) {
        const pid = step.assignedParticipantId;
        if (!scores[pid]) scores[pid] = { correct: 0, total: 0 };
        scores[pid].total += 1;
        if (step.correct) scores[pid].correct += 1;
      }
    }

    const chainData = chains
      .map((chain) => {
        const steps = allSteps
          .filter((s) => s.chainId === chain._id)
          .sort((a, b) => a.stepIndex - b.stepIndex);
        return {
          ...chain,
          steps,
        };
      })
      // Only include chains that were actually played (have a draw step with output)
      .filter((chain) => {
        const drawStep = chain.steps.find((s) => s.stepType === "draw");
        return drawStep && drawStep.outputDrawingUrl;
      });

    // Build prompt translations (en→ja) for all options used in this game
    const promptTranslations: Record<string, string> = {};
    const translationMap: Record<string, { ja: string }> = { ...PROMPT_TRANSLATIONS };
    if (session.customPrompts) {
      for (const cp of session.customPrompts as Array<{ text: string; ja: string }>) {
        translationMap[cp.text] = { ja: cp.ja };
      }
    }
    for (const chain of chains) {
      // originalPrompt
      if (translationMap[chain.originalPrompt]) {
        promptTranslations[chain.originalPrompt] = translationMap[chain.originalPrompt].ja;
      }
      // all options (includes distractors)
      for (const opt of chain.options ?? []) {
        if (translationMap[opt]) {
          promptTranslations[opt] = translationMap[opt].ja;
        }
      }
    }

    return { session, chains: chainData, participants, scores, promptTranslations };
  },
});
