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

    // Only cancel non-emojifyr sessions (Emojifyr has its own cancel)
    const litSessions = activeSessions.filter((s) => s.gameType !== "emojifyr");
    for (const session of litSessions) {
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
    if (litSessions.length > 0) {
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
    // Only return non-emojifyr sessions (Emojifyr has its own query)
    const litSession = sessions.find((s) => s.gameType !== "emojifyr");
    return litSession ?? null;
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
    // Find active non-emojifyr game session
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .collect();
    const session = sessions.find((s) => s.gameType !== "emojifyr");
    if (!session) return null;

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
    // Only return non-emojifyr sessions (Emojifyr has its own queries)
    const litSessions = sessions.filter((s) => s.gameType !== "emojifyr");
    if (litSessions.length === 0) return null;
    litSessions.sort((a, b) => b.createdAt - a.createdAt);
    return litSessions[0];
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
    const pidSet = new Set<string>();
    for (const s of allSteps) pidSet.add(s.assignedParticipantId);
    for (const c of chains) if (c.drawerParticipantId) pidSet.add(c.drawerParticipantId);
    const participantIds = Array.from(pidSet);
    const participants: Record<string, { nickname: string; avatar: { type: string; value: string } }> = {};
    for (const pid of participantIds) {
      const p = await ctx.db.get(pid as Id<"participants">);
      if (p && "nickname" in p) participants[pid] = { nickname: (p as any).nickname, avatar: (p as any).avatar };
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

// ============================================================
// Emojifyr — sentence-to-emoji guessing game
// ============================================================

export const startEmojifyr = mutation({
  args: {
    roomId: v.id("rooms"),
    createdByParticipantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    // Verify room exists and is active
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    // Verify participant is host
    const participant = await ctx.db.get(args.createdByParticipantId);
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
    // Host (creator) always goes first, then shuffle the rest
    const otherIds = playerIds.filter((id) => id !== args.createdByParticipantId);
    const playerOrder = [args.createdByParticipantId, ...shuffleArray(otherIds)];

    // Create game session
    const sessionId = await ctx.db.insert("gameSessions", {
      roomId: args.roomId,
      gameType: "emojifyr",
      status: "active",
      createdByParticipantId: args.createdByParticipantId,
      playerIds,
      playerOrder,
      chainCount: 0,
      createdAt: Date.now(),
    });

    // Create the first round
    await ctx.db.insert("emojifyrRounds", {
      gameSessionId: sessionId,
      roundIndex: 0,
      writerParticipantId: playerOrder[0],
      status: "writing",
      maxCharacters: 80,
      startedAt: Date.now(),
    });

    // Post system message
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.createdByParticipantId,
      kind: "system",
      status: "processed",
      text: "game:Emojifyr",
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

export const submitEmojifyrSentence = mutation({
  args: {
    roundId: v.id("emojifyrRounds"),
    sentence: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.sentence.length < 1 || args.sentence.length > 80) {
      throw new Error("Sentence must be between 1 and 80 characters");
    }
    const round = await ctx.db.get(args.roundId);
    if (!round) throw new Error("Round not found");
    if (round.status !== "writing") throw new Error("Round is not in writing phase");

    await ctx.db.patch(args.roundId, {
      originalSentence: args.sentence,
      status: "generating",
    });
  },
});

export const submitEmojifyrEmojiClue = mutation({
  args: {
    roundId: v.id("emojifyrRounds"),
    emojiClue: v.string(),
  },
  handler: async (ctx, args) => {
    const round = await ctx.db.get(args.roundId);
    if (!round) throw new Error("Round not found");
    if (round.status !== "generating" && round.status !== "preview") {
      throw new Error("Round is not in generating or preview phase");
    }

    await ctx.db.patch(args.roundId, {
      emojiClue: args.emojiClue,
      status: "guessing",
    });
  },
});

export const submitEmojifyrGuess = mutation({
  args: {
    roundId: v.id("emojifyrRounds"),
    participantId: v.id("participants"),
    guessText: v.string(),
  },
  handler: async (ctx, args) => {
    const round = await ctx.db.get(args.roundId);
    if (!round) throw new Error("Round not found");

    await ctx.db.insert("emojifyrGuesses", {
      roundId: args.roundId,
      participantId: args.participantId,
      guessText: args.guessText,
      createdAt: Date.now(),
    });
  },
});

export const revealEmojifyrRound = mutation({
  args: {
    roundId: v.id("emojifyrRounds"),
  },
  handler: async (ctx, args) => {
    const round = await ctx.db.get(args.roundId);
    if (!round) throw new Error("Round not found");

    await ctx.db.patch(args.roundId, {
      status: "reveal",
      revealedAt: Date.now(),
    });
  },
});

export const advanceEmojifyrRound = mutation({
  args: {
    gameSessionId: v.id("gameSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.gameSessionId);
    if (!session) throw new Error("Session not found");
    if (session.status !== "active") throw new Error("Session is not active");

    const playerOrder = session.playerOrder ?? session.playerIds;

    // Get all rounds for this session
    const rounds = await ctx.db
      .query("emojifyrRounds")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", args.gameSessionId))
      .collect();
    rounds.sort((a, b) => a.roundIndex - b.roundIndex);

    // Mark current round as complete
    const currentRound = rounds.find((r) => r.status !== "complete");
    if (currentRound) {
      await ctx.db.patch(currentRound._id, { status: "complete" });
    }

    // Determine next writer (rotate through playerOrder)
    const nextRoundIndex = (currentRound?.roundIndex ?? -1) + 1;
    const nextWriterIndex = nextRoundIndex % playerOrder.length;
    const nextWriter = playerOrder[nextWriterIndex];

    // Create new round
    await ctx.db.insert("emojifyrRounds", {
      gameSessionId: args.gameSessionId,
      roundIndex: nextRoundIndex,
      writerParticipantId: nextWriter,
      status: "writing",
      maxCharacters: 80,
      startedAt: Date.now(),
    });
  },
});

export const cancelEmojifyr = mutation({
  args: {
    gameSessionId: v.id("gameSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.gameSessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.gameSessionId, {
      status: "complete",
      completedAt: Date.now(),
      cancelled: true,
    });

    // Mark all non-complete rounds as complete
    const rounds = await ctx.db
      .query("emojifyrRounds")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", args.gameSessionId))
      .collect();
    for (const round of rounds) {
      if (round.status !== "complete") {
        await ctx.db.patch(round._id, { status: "complete" });
      }
    }

    // Post system message
    const creator = await ctx.db.get(session.createdByParticipantId);
    await ctx.db.insert("messages", {
      roomId: session.roomId,
      senderId: session.createdByParticipantId,
      kind: "system",
      status: "processed",
      text: "game_cancelled:Emojifyr",
      createdAt: Date.now(),
    });
  },
});

// --- Emojifyr Queries ---

export const getActiveEmojifyrSession = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .collect();
    const emojifyrSession = sessions.find((s) => s.gameType === "emojifyr");
    return emojifyrSession ?? null;
  },
});

export const getCurrentEmojifyrRound = query({
  args: { gameSessionId: v.id("gameSessions") },
  handler: async (ctx, args) => {
    const rounds = await ctx.db
      .query("emojifyrRounds")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", args.gameSessionId))
      .collect();
    // Return the most recent round that isn't "complete"
    const activeRounds = rounds.filter((r) => r.status !== "complete");
    if (activeRounds.length === 0) return null;
    activeRounds.sort((a, b) => b.roundIndex - a.roundIndex);
    return activeRounds[0];
  },
});

export const getEmojifyrGuesses = query({
  args: { roundId: v.id("emojifyrRounds") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emojifyrGuesses")
      .withIndex("by_roundId", (q) => q.eq("roundId", args.roundId))
      .collect();
  },
});

// --- AI Emoji Clue Generation (Anthropic Claude) ---

export const generateEmojiClue = action({
  args: { sentence: v.string() },
  handler: async (_ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const prompt = `Convert this sentence into 3–6 emojis.
Output emojis only.
Do not output words.
Preserve the core meaning.
Make it fun and guessable for a group.
Prefer common, recognizable emojis.
Do not explain your answer.

Sentence: ${args.sentence}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 64,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) {
      throw new Error("Empty response from Anthropic API");
    }

    return { emojiClue: text };
  },
});

export const getEmojifyrGameState = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Find active emojifyr session
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .collect();
    const session = sessions.find((s) => s.gameType === "emojifyr");
    if (!session) return null;

    // Get all rounds
    const rounds = await ctx.db
      .query("emojifyrRounds")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
      .collect();
    rounds.sort((a, b) => a.roundIndex - b.roundIndex);

    // Current round = most recent non-complete
    const currentRound = [...rounds].reverse().find((r) => r.status !== "complete") ?? null;

    // Get guesses for current round
    let guesses: any[] = [];
    if (currentRound) {
      guesses = await ctx.db
        .query("emojifyrGuesses")
        .withIndex("by_roundId", (q) => q.eq("roundId", currentRound._id))
        .collect();
    }

    // Get participant info for all players
    const participants: Record<string, { nickname: string; avatar: { type: string; value: string } }> = {};
    for (const pid of session.playerIds) {
      const p = await ctx.db.get(pid);
      if (p) {
        participants[pid as string] = { nickname: p.nickname, avatar: p.avatar };
      }
    }

    const playerOrder = session.playerOrder ?? session.playerIds;

    // Redact sensitive fields based on round status:
    // - originalSentence: only visible during reveal/complete (writer knows it already)
    // - emojiClue: only visible during guessing/reveal/complete
    let redactedRound = currentRound;
    if (currentRound) {
      const showSentence = currentRound.status === "reveal" || currentRound.status === "complete";
      const showClue = currentRound.status === "guessing" || currentRound.status === "reveal" || currentRound.status === "complete";
      redactedRound = {
        ...currentRound,
        originalSentence: showSentence ? currentRound.originalSentence : undefined,
        emojiClue: showClue ? currentRound.emojiClue : undefined,
      };
    }

    return {
      session: {
        _id: session._id,
        roomId: session.roomId,
        gameType: session.gameType,
        status: session.status,
        playerIds: session.playerIds,
        playerOrder,
        createdAt: session.createdAt,
      },
      currentRound: redactedRound,
      guesses,
      participants,
      totalRounds: rounds.length,
      completedRounds: rounds.filter((r) => r.status === "complete").length,
    };
  },
});
