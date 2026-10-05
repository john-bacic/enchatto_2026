import { v } from "convex/values";
import { action, internalMutation, mutation, query, ActionCtx, MutationCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { callerProof, isAround, isInlineDrawing, isPresent, requireCaller, requireHost, takeRateLimit } from "./participants";
import { shuffleArray } from "./gameShared";

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

/**
 * English text → Japanese for one session: the built-in bank, with the session's own word bank on top.
 * What a Japanese-speaking player is shown and what a guess is scored against both come from here, so
 * the option the server offers as the right one is always scored right.
 */
function translationsFor(session: Doc<"gameSessions">): Record<string, { ja: string; hintJa?: string }> {
  const translations: Record<string, { ja: string; hintJa?: string }> = { ...PROMPT_TRANSLATIONS };
  for (const cp of session.customPrompts ?? []) {
    translations[cp.text] = { ja: cp.ja, hintJa: cp.hintJa };
  }
  return translations;
}

/** The prompts of a word bank with each text kept once */
function distinctByText<T extends { text: string }>(prompts: T[]): T[] {
  const seen = new Set<string>();
  return prompts.filter((p) => {
    if (seen.has(p.text)) return false;
    seen.add(p.text);
    return true;
  });
}

/** Pick 3 distractor prompts from the same level, excluding the correct one */
function generateDistractors(correctPrompt: string, allPrompts: Array<{ text: string }>): string[] {
  const others = allPrompts.filter((p) => p.text !== correctPrompt);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, 3).map((p) => p.text);
}

const TOTAL_ROUNDS = 10;
// The smallest word bank a game can be played from: a prompt for every round, and three more texts
// to offer as a round's wrong options
const MIN_WORD_BANK = TOTAL_ROUNDS + 3;

// How often the server looks at an open draw or guess phase, which is also how long the room
// waits for a player who is not there
const ROUND_CHECK_MS = 10_000;
// The second look at players who all read as absent, before their steps are closed
const ROUND_RECHECK_MS = 5_000;
// Added to the session timer: the client countdown starts when the overlay appears, which for a
// drawer who was away can be as late as the recheck, and the drawing still has to upload after it
// reaches 0
const DRAW_GRACE_MS = ROUND_CHECK_MS + ROUND_RECHECK_MS + 10_000;
// Timer off means no countdown on screen, so this only stops a drawer who is present but idle
const DRAW_UNTIMED_LIMIT_MS = 180_000;
// A guess is one tap with no countdown on screen
const GUESS_LIMIT_MS = 60_000;

type RoundPhase = "draw" | "guess";

/** Seconds of draw timer for a session: a number, or the legacy boolean (true/missing = 20, false = off) */
function timerSecondsOf(session: Doc<"gameSessions">): number {
  const t = session.timerEnabled;
  return typeof t === "number" ? t : t !== false ? 20 : 0;
}

function phaseLimitMs(session: Doc<"gameSessions">, phase: RoundPhase): number {
  if (phase === "guess") return GUESS_LIMIT_MS;
  const secs = timerSecondsOf(session);
  return secs > 0 ? secs * 1000 + DRAW_GRACE_MS : DRAW_UNTIMED_LIMIT_MS;
}

/** A guess someone actually answered. Steps closed by the server are "submitted" too, flagged timedOut. */
function isAnsweredGuess(s: Doc<"gameSteps">): boolean {
  return s.stepType === "guess" && s.status === "submitted" && !s.timedOut;
}

/**
 * With LOST_IN_TRANSLATION_HIDE_ANSWER set to "on", a client cannot read which option is right before its guess
 * is in: getMyActiveStep sends a step only to a caller who proves to be its player (a drawing step carries the
 * prompt), and leaves `correctOption` out of every step. The answer comes in the reply to the guess instead
 * (GuessResult), which is the same in both modes.
 *
 * Off unless set, like AUTH_MODE and EMOJI_MATCH_HIDE_CARDS: every iOS build up to e2c060f reads `correctOption`
 * off the step to mark the pick, and without it stamps every pick "Wrong!" (the guess is scored correctly either
 * way). Set it once those builds are no longer in use. Mutations read the stored game either way.
 */
function hidesAnswer(): boolean {
  return process.env.LOST_IN_TRANSLATION_HIDE_ANSWER === "on";
}

/** What submitting a guess is answered with: whether the pick was right, which option was, and the pick on record */
type GuessResult = { correct: boolean; correctOption: string; selectedOption?: string };

/**
 * The result of a player's guess. `correctOption` is the round's prompt in the words getMyActiveStep offered
 * that player, so it is one of the options on their screen: the translation for a Japanese-speaking player.
 */
function guessResult(
  session: Doc<"gameSessions">,
  chain: Doc<"gameChains">,
  player: Doc<"participants">,
  guess: { correct?: boolean; selectedOption?: string }
): GuessResult {
  const correctOption =
    player.preferredLanguage === "ja"
      ? (translationsFor(session)[chain.originalPrompt]?.ja ?? chain.originalPrompt)
      : chain.originalPrompt;
  return { correct: !!guess.correct, correctOption, selectedOption: guess.selectedOption };
}

// Four players or more can play as two teams. A session with `teams` is a team game; one without is an
// individual game, and nothing a client is sent for it mentions teams. In a team game everyone but the drawer
// guesses and each player has a score of their own: the teams' points are counted beside it.

// Two teams of two is the smallest team game. With fewer players a game is individual whatever was asked for
const MIN_TEAM_PLAYERS = 4;
// What a team's share of a round is counted out of. 60 divides by every number of guessers up to six, so a team
// of up to six players is never rounded: its points are its exact share. A team's total is the sum of its
// rounds' points whatever its size, so the rounds a client shows always add up to the total.
const TEAM_ROUND_POINTS = 60;

/** The two teams of a game, each in the order its members take the drawing. The index is the team: 0 or 1 */
type Teams = [Id<"participants">[], Id<"participants">[]];

function teamsOf(session: Doc<"gameSessions">): Teams | null {
  const teams = session.teams;
  return teams && teams.length === 2 ? [teams[0], teams[1]] : null;
}

/** A player as the split sees them */
type Seat = { id: Id<"participants">; japanese: boolean; away: boolean };

/**
 * The players dealt in, in the order a team's members take the drawing: the host, then the others as they
 * joined. A language that starts with "ja" is Japanese, and every other one counts as the other language.
 * Away is not here right now (isPresent). The host is the one asking, so is here whatever their last
 * heartbeat said.
 */
function seatsFor(players: Doc<"participants">[], hostId: Id<"participants">, now: number): Seat[] {
  return [...players.filter((p) => p._id === hostId), ...players.filter((p) => p._id !== hostId)].map((p) => ({
    id: p._id,
    japanese: p.preferredLanguage.startsWith("ja"),
    away: p._id !== hostId && !isPresent(p, now),
  }));
}

/**
 * Two teams out of the players dealt in. A player `asked` lists stays on the team that lists them, the first
 * mention winning, and an id that is not a player's is dropped. Its first two lists are the teams; with
 * nothing in them this is a fresh deal.
 *
 * Everyone not on a team yet is seated one at a time: on the smaller team; between equal teams on the one with
 * fewer speakers of their language; then, for someone away, on the one with fewer players away; and otherwise
 * by chance. They come up one language after the other with those away in the middle of the line, next to each
 * other, which is what shares them out like a language. A fresh deal therefore ends at most one apart in size, in
 * the speakers of each language and in players away. All the chance is Math.random's.
 *
 * Players who were kept can leave the teams more than one apart: everyone listed on one side, or people who
 * left after the split was shown. The larger team then gives up players, as few as it takes, so that four
 * players or more always make two teams of at least two.
 */
function splitTeams(seats: Seat[], asked: string[][] = []): Teams {
  const byId = new Map<string, Seat>(seats.map((seat) => [seat.id, seat]));
  const teams: [Seat[], Seat[]] = [[], []];
  const seated = new Set<Seat>();
  for (const [team, ids] of asked.slice(0, 2).entries()) {
    for (const id of ids) {
      const seat = byId.get(id);
      if (!seat || seated.has(seat)) continue;
      teams[team].push(seat);
      seated.add(seat);
    }
  }

  const count = (team: number, is: (other: Seat) => boolean) => teams[team].filter(is).length;
  const rest = seats.filter((seat) => !seated.has(seat));
  const group = (japanese: boolean, away: boolean) =>
    shuffleArray(rest.filter((seat) => seat.japanese === japanese && seat.away === away));
  for (const seat of [...group(true, false), ...group(true, true), ...group(false, true), ...group(false, false)]) {
    // How far team 0 is ahead of team 1 in what decides this seat
    const ahead = (is: (other: Seat) => boolean) => count(0, is) - count(1, is);
    const lead =
      ahead(() => true) ||
      ahead((other) => other.japanese === seat.japanese) ||
      (seat.away ? ahead((other) => other.away) : 0);
    teams[lead < 0 || (lead === 0 && Math.random() < 0.5) ? 0 : 1].push(seat);
  }

  while (Math.abs(teams[0].length - teams[1].length) > 1) {
    const [larger, smaller] = teams[0].length > teams[1].length ? [0, 1] : [1, 0];
    const excess = (is: (other: Seat) => boolean) => count(larger, is) - count(smaller, is);
    // The one to cross speaks the language the larger team has most in excess; of those, is away if it has more
    // players away; and of those, is the last in the drawing order
    const [mover] = [...teams[larger]].sort(
      (a, b) =>
        excess((other) => other.japanese === b.japanese) - excess((other) => other.japanese === a.japanese) ||
        (b.away ? excess((other) => other.away) : 0) - (a.away ? excess((other) => other.away) : 0) ||
        seats.indexOf(b) - seats.indexOf(a)
    );
    teams[larger].splice(teams[larger].indexOf(mover), 1);
    teams[smaller].push(mover);
  }

  const inOrder = (team: Seat[]) => seats.filter((seat) => team.includes(seat)).map((seat) => seat.id);
  return [inOrder(teams[0]), inOrder(teams[1])];
}

/**
 * Whether two splits put the same players together, whichever team is called 0. `other` is one a client sent:
 * only the players of `teams` are looked at in it.
 */
function sameSides(teams: Teams, other: string[][]): boolean {
  if (other.length !== 2) return false;
  const playing = new Set<string>([...teams[0], ...teams[1]]);
  const side = (ids: string[]) => [...new Set(ids)].filter((id) => playing.has(id)).sort().join();
  const [a, b] = [side(teams[0]), side(teams[1])];
  return (a === side(other[0]) && b === side(other[1])) || (a === side(other[1]) && b === side(other[0]));
}

// How many more times Reshuffle deals when chance comes back with the split on screen. Where another deal is as
// even, each try misses it at most half the time, so forty leave no chance worth counting of missing it
const DEAL_AGAIN_TRIES = 40;

/**
 * A fresh deal that is not the split `shown`. When chance deals that one again, it deals again, up to
 * DEAL_AGAIN_TRIES times: every fresh deal is as even as the room allows, in players away too. Only when chance keeps dealing the split on
 * screen, as it must when no other deal is as even, do two players change sides: of one language, so the teams
 * stay as even as they were in size and language, and both here or both away where there is such a pair.
 */
function dealOtherTeams(seats: Seat[], shown: string[][]): Teams {
  let teams = splitTeams(seats);
  for (let tries = 0; tries < DEAL_AGAIN_TRIES && sameSides(teams, shown); tries++) teams = splitTeams(seats);
  if (!sameSides(teams, shown)) return teams;
  const [one, other] = teams.map((team) => seats.filter((seat) => team.includes(seat.id)));
  const pairs = one.flatMap((a) => other.map((b) => [a, b] as const));
  const ofOneLanguage = pairs.filter(([a, b]) => a.japanese === b.japanese);
  const alike = ofOneLanguage.filter(([a, b]) => a.away === b.away);
  const choices = alike.length > 0 ? alike : ofOneLanguage.length > 0 ? ofOneLanguage : pairs;
  const [a, b] = choices[Math.floor(Math.random() * choices.length)];
  // Asked for as a split to keep, which puts both teams back in drawing order
  return splitTeams(seats, [
    teams[0].map((id) => (id === a.id ? b.id : id)),
    teams[1].map((id) => (id === b.id ? a.id : id)),
  ]);
}

/**
 * Who draws each round of a team game. The teams take the rounds in turn, the host's team first, and each goes
 * through its members in order. The host is the first of their team, so round 1 is the host's: pressing Start
 * proves they are here.
 */
function teamDrawers(teams: Teams, hostId: Id<"participants">, rounds: number): Id<"participants">[] {
  const opening = teams[1].includes(hostId) ? 1 : 0;
  return Array.from({ length: rounds }, (_, r) => {
    const team = teams[(opening + r) % 2];
    return team[Math.floor(r / 2) % team.length];
  });
}

/** A round as it ended for one team: how many of its guessers count, and how many of those were right */
type TeamRound = { right: number; counted: number };

/**
 * A round that has just ended, for each team. A guess that was answered counts, right or wrong. A guess the
 * server closed counts as a wrong one for a player whose turn before it was played (a drawing they sent or a
 * guess they answered): not answering is never better than guessing. It is left out for a player in `away`, whose
 * last turn was not played either, or who has had none: a team is not marked down round after round for someone
 * who is not there. `away` is brought up to date for the next round.
 *
 * `chainSteps` are the round's steps as its caller holds them. One still open there is being closed by the
 * deadline, and is read as closed.
 */
function scoreTeamRound(teams: Teams, chainSteps: Doc<"gameSteps">[], away: Set<Id<"participants">>): TeamRound[] {
  const result: TeamRound[] = teams.map(() => ({ right: 0, counted: 0 }));
  for (const s of chainSteps) {
    const player = s.assignedParticipantId;
    const played = s.status === "submitted" && !s.timedOut;
    const team = s.stepType === "guess" ? teams.findIndex((members) => members.includes(player)) : -1;
    if (team >= 0 && (played || !away.has(player))) {
      result[team].counted += 1;
      if (played && s.correct) result[team].right += 1;
    }
    if (played) away.delete(player);
    else away.add(player);
  }
  return result;
}

/**
 * Both teams' points for a round, or null for a round that gives none. A team's points are the share of its
 * counted guessers who were right, out of TEAM_ROUND_POINTS: a share, so that the bigger team gains nothing by
 * having more guessers. A round in which either team had nobody counted is void and gives neither team
 * anything, which a round nobody drew always is: it has no guesses. A round with no result stored gives none
 * either: one still open, never reached, or cut short by a Cancel.
 */
function teamPointsOf(chain: Doc<"gameChains">): [number, number] | null {
  const result = chain.teamRound;
  if (!result || result.length !== 2 || result.some((team) => team.counted === 0)) return null;
  const points = (team: TeamRound) => Math.round((TEAM_ROUND_POINTS * team.right) / team.counted);
  return [points(result[0]), points(result[1])];
}

/** What clients are told of a team: its players in drawing order, and its points over the rounds that scored */
type TeamView = { memberIds: Id<"participants">[]; points: number };

/**
 * How the teams of a game stand, or null in individual play. The points are read from the results stored as
 * each round ended (finishRound), so they never move while a round is open: a total that rose with each right
 * guess would tell the players still guessing how the others had done. Level totals are a draw; nothing
 * breaks the tie.
 */
function teamStanding(session: Doc<"gameSessions">, chains: Doc<"gameChains">[]): TeamView[] | null {
  const teams = teamsOf(session);
  if (!teams) return null;
  const total = (team: number) => chains.reduce((sum, chain) => sum + (teamPointsOf(chain)?.[team] ?? 0), 0);
  return teams.map((memberIds, team) => ({ memberIds, points: total(team) }));
}

/**
 * Who a game started now deals in: whoever has been here lately, plus the host who is pressing Start. There is
 * no way to join later, so a phone that just dimmed still gets a seat; roundDeadline moves past anyone who does
 * not come back.
 */
async function playersAround(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  hostId: Id<"participants">,
  now: number
): Promise<Doc<"participants">[]> {
  const allParticipants = await ctx.db
    .query("participants")
    .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
    .collect();
  const players = allParticipants.filter((p) => isAround(p, now) || p._id === hostId);
  if (players.length >= 2) return players;
  // The host app enables Start on its own online count, so Start must not fail where it used to work
  return allParticipants.filter((p) => (p.online && !p.departed) || p._id === hostId);
}

/** Schedule the next look at a chain's open draw or guess steps. Call once when those steps are created. */
async function watchRound(
  ctx: MutationCtx,
  chainId: Id<"gameChains">,
  phase: RoundPhase,
  delayMs: number = ROUND_CHECK_MS,
  misses: number = 0
): Promise<void> {
  await ctx.scheduler.runAfter(delayMs, internal.games.roundDeadline, { chainId, phase, misses });
}

/** One round of the summary posted to the chat. `teamPoints` only in a team game, for a round that scored */
type RoundResult = { round: number; prompt: string; results: Record<string, boolean>; teamPoints?: [number, number] };

/**
 * The round is over: start the next one, or end the game and post its summary.
 * Reached from the last guess and from the server deadline, so it only acts on a chain that is still active.
 * `chainSteps` are the round's steps, which both callers hold already.
 */
async function finishRound(
  ctx: MutationCtx,
  session: Doc<"gameSessions">,
  chain: Doc<"gameChains">,
  chainSteps: Doc<"gameSteps">[]
): Promise<void> {
  if (chain.status !== "active") return;
  await ctx.db.patch(chain._id, { status: "complete" });

  // A team game's round is scored here, once, and the result kept on the chain: a Cancel closes rounds too, and
  // those give no points. It is scored from the round's own steps. Every guess step holds the drawing, so reading
  // the session's steps for it would bring every drawing of the game into the mutation that takes a guess.
  const teams = teamsOf(session);
  if (teams) {
    const away = new Set(session.teamAway);
    await ctx.db.patch(chain._id, { teamRound: scoreTeamRound(teams, chainSteps, away) });
    await ctx.db.patch(session._id, { teamAway: session.playerIds.filter((pid) => away.has(pid)) });
  }

  // Find the next chain (next round)
  const allChains = await ctx.db
    .query("gameChains")
    .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
    .collect();
  allChains.sort((a, b) => a.chainIndex - b.chainIndex);

  const nextChain = allChains.find(
    (ch) => ch.chainIndex === chain.chainIndex + 1
  );

  console.log("[finishRound] chain", chain.chainIndex, "complete. nextChain:", nextChain ? nextChain.chainIndex : "NONE");

  if (!nextChain) {
    // No more rounds — game complete
    const completedAt = Date.now();
    await ctx.db.patch(session._id, {
      status: "complete",
      completedAt,
    });

    // Post game summary to chat
    const allSteps = await ctx.db
      .query("gameSteps")
      .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
      .collect();

    // Build per-round, per-player results
    const roundResults: RoundResult[] = [];
    for (const ch of allChains) {
      const guessStepsForChain = allSteps.filter((s) => s.chainId === ch._id && isAnsweredGuess(s));
      if (guessStepsForChain.length === 0) continue;
      const results: Record<string, boolean> = {};
      for (const gs of guessStepsForChain) {
        results[gs.assignedParticipantId] = !!gs.correct;
      }
      const teamPoints = teamPointsOf(ch);
      roundResults.push({ round: ch.chainIndex + 1, prompt: ch.originalPrompt, results, ...(teamPoints ? { teamPoints } : {}) });
    }

    if (roundResults.length === 0) {
      // Every round timed out. Nobody played, so this is a cancelled game, not a finished level
      await ctx.db.patch(session._id, { cancelled: true });
      await ctx.db.insert("messages", {
        roomId: session.roomId,
        senderId: session.playerIds[0],
        kind: "system",
        status: "processed",
        text: "game_cancelled:Lost in Translation",
        createdAt: completedAt, // same as cancelGame, so the chat reads the same either way
      });
      return;
    }

    // Build totals
    const totals: Record<string, { correct: number; total: number }> = {};
    for (const pid of session.playerIds) {
      totals[pid] = { correct: 0, total: 0 };
    }
    for (const s of allSteps) {
      if (isAnsweredGuess(s)) {
        if (!totals[s.assignedParticipantId]) totals[s.assignedParticipantId] = { correct: 0, total: 0 };
        totals[s.assignedParticipantId].total += 1;
        if (s.correct) totals[s.assignedParticipantId].correct += 1;
      }
    }

    // Build player name map
    const playerMap: Record<string, { name: string; avatar: string }> = {};
    for (const pid of session.playerIds) {
      const p = await ctx.db.get(pid);
      if (p && "nickname" in p) {
        playerMap[pid] = { name: (p as any).nickname, avatar: (p as any).avatar?.value ?? "default" };
      }
    }

    // `teams` comes last and only in a team game: `players` and `totals` hold players and nothing else
    const standing = teamStanding(session, allChains);
    const summaryData = {
      gameType: "Lost in Translation",
      level: session.level ?? 1,
      players: playerMap,
      rounds: roundResults,
      totals,
      ...(standing ? { teams: standing } : {}),
    };

    await ctx.db.insert("messages", {
      roomId: session.roomId,
      senderId: session.playerIds[0],
      kind: "system",
      status: "processed",
      text: `game_summary:${JSON.stringify(summaryData)}`,
      createdAt: completedAt + 1,
    });

    return;
  }

  console.log("[finishRound] creating draw step for chain", nextChain.chainIndex, "drawer:", nextChain.drawerParticipantId);

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
  await watchRound(ctx, nextChain._id, "draw");
  console.log("[finishRound] draw step created successfully for chain", nextChain.chainIndex);
}

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
    token: v.optional(v.string()),
    // Left out, as every build from before teams leaves it: individual play. "auto": two teams dealt here.
    // Two lists of participant ids: the split the host was shown, kept where it still fits whoever is dealt in
    // (splitTeams). The ids are plain strings, so that a stale one is dropped instead of refusing the Start.
    teams: v.optional(v.union(v.literal("auto"), v.array(v.array(v.string())))),
  },
  handler: async (ctx, args) => {
    const level = args.level ?? 1;

    if (args.gameType.length > 40) throw new Error("Unknown game type");
    // The host app sends 40 prompts of a few words each. They are stored on the session and sent to every player
    if (args.customPrompts) {
      if (args.customPrompts.length > 200) throw new Error("Too many prompts (max 200)");
      for (const p of args.customPrompts) {
        if ([p.text, p.ja, p.hint, p.hintJa].some((s) => s !== undefined && s.length > 200)) {
          throw new Error("Prompt too long (max 200 characters)");
        }
      }
    }

    // Verify room exists and is active
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    // Verify participant is host
    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    if (participant.role !== "host") throw new Error("Only the host can start a game");
    // "Host" above is any room's host; it has to be this room's, and has to prove it
    await requireHost(ctx, args.roomId, args.participantId, args.token, "games.startGame");

    // Check no active game. An Emojifyr session does not count: it is opened without a token, and no
    // current build can close one, so it would keep this game out of the room for good. Start ends it below.
    const activeGames = await ctx.db
      .query("gameSessions")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .collect();
    if (activeGames.some((s) => s.gameType !== "emojifyr")) throw new Error("A game is already in progress");

    const now = Date.now();
    const players = await playersAround(ctx, args.roomId, args.participantId, now);
    if (players.length < 2) throw new Error("Need at least 2 players");
    // Pressing Start proves the host is here. Record it, or a stale presence write would let the
    // first deadline check skip the host's own round-1 drawing.
    if (!isPresent(participant, now)) {
      await ctx.db.patch(participant._id, { online: true, departed: undefined, presence: "online", lastSeenAt: now });
    }

    const playerIds = players.map((p) => p._id);
    const playerCount = playerIds.length;

    // Teams only where the host's client asked for them and there are players for two teams of two: a Start is
    // never refused over its teams. They are settled here, from who is dealt in, and stay as they are all game.
    const teams =
      args.teams === undefined || playerCount < MIN_TEAM_PLAYERS
        ? null
        : splitTeams(seatsFor(players, args.participantId, now), args.teams === "auto" ? [] : args.teams);
    const drawers = teams ? teamDrawers(teams, args.participantId, TOTAL_ROUNDS) : null;

    // Use custom prompts from iOS host if provided, otherwise fall back to hardcoded. A word bank too
    // small to fill the game is not played at all: the wrong options come from what is left of it once
    // the prompts are picked, and fewer than three left means a round with the same option twice, or
    // none to offer. It is counted by its different texts, since one listed twice could land twice
    // in the same round.
    const promptLevel = Math.min(level, 4);
    const wordBank = distinctByText(args.customPrompts ?? []);
    const useWordBank = wordBank.length >= MIN_WORD_BANK;
    const prompts: Array<{ text: string; ja: string; hint?: string; hintJa?: string }> = useWordBank
      ? wordBank
      : LEVEL_PROMPTS[promptLevel] ?? LEVEL_PROMPTS[4];
    const shuffledPrompts = shuffleArray(prompts);

    // Pick 10 correct prompts for the 10 rounds
    const correctPrompts = shuffledPrompts.slice(0, TOTAL_ROUNDS);
    const correctTexts = new Set(correctPrompts.map((p) => p.text));

    // Build a distractor pool from the same level so choices match difficulty
    // (e.g., level 1 only shows single words, level 2 only two-word phrases).
    // Fall back to all levels only if same-level pool is too small.
    const sameLevelPool = LEVEL_PROMPTS[promptLevel] ?? [];
    const allAvailable: Array<{ text: string }> = useWordBank
      ? wordBank
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

    // Take the room over from Emojifyr: every session still active here is one of its own. This happens
    // in the transaction that starts the game, so a caller who keeps reopening Emojifyr cannot slip in
    // between a Cancel and this Start.
    for (const emojifyr of activeGames) {
      await endEmojifyrSession(ctx, emojifyr);
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
      // Nobody has had a turn yet, so everyone is in teamAway. An individual game has neither key
      ...(teams ? { teams, teamAway: playerIds } : {}),
    });

    // Create 10 chains (rounds), each with a unique prompt, options, and drawer
    for (let r = 0; r < TOTAL_ROUNDS; r++) {
      const promptData = correctPrompts[r];
      const prompt = promptData.text;
      const hint = promptData.hint;
      const drawerId = drawers ? drawers[r] : playerIds[r % playerCount];

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
        await watchRound(ctx, chainId, "draw");
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

/**
 * A team split for the host's picker to show before Start, and another one for its Reshuffle. Nothing is
 * written: the picker sends the split it showed back with Start (startGame `teams`), which keeps it where it
 * still fits whoever is here by then. `teams` is null with fewer than four players: that game is individual.
 * A mutation, although it writes nothing, because every call deals anew.
 */
export const dealTeams = mutation({
  args: {
    roomId: v.id("rooms"),
    participantId: v.id("participants"),
    /** The split on screen, so that Reshuffle comes back with other teams */
    previous: v.optional(v.array(v.array(v.string()))),
    token: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ playerIds: Id<"participants">[]; teams: Id<"participants">[][] | null }> => {
    // What a Start is refused for is refused here in the same words
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");
    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    if (participant.role !== "host") throw new Error("Only the host can start a game");
    // "Host" above is any room's host; it has to be this room's, and has to prove it
    await requireHost(ctx, args.roomId, args.participantId, args.token, "games.dealTeams");

    // The same players a Start would deal in right now
    const now = Date.now();
    const players = await playersAround(ctx, args.roomId, args.participantId, now);
    const playerIds = players.map((p) => p._id);
    if (players.length < MIN_TEAM_PLAYERS) return { playerIds, teams: null };

    const seats = seatsFor(players, args.participantId, now);
    return { playerIds, teams: args.previous ? dealOtherTeams(seats, args.previous) : splitTeams(seats) };
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
    token: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GuessResult | null> => {
    console.log("[submitGameStep] called with stepId:", args.stepId);
    try {
    const caller = await requireCaller(ctx, args.participantId, args.token, "games.submitGameStep");
    // requireCaller lets a missing or wrong token through unless AUTH_MODE is "enforce", so it decides whether
    // the guess is taken. Whether the call is told how the guess came out goes by this proof in both modes:
    // otherwise anyone could read a round's prompt by sending, or sending again, another player's guess
    const proof = caller ? await callerProof(ctx, caller._id, args.token) : "none";
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");
    if (step.assignedParticipantId !== args.participantId) throw new Error("Not your step");
    // Kept in the step and in a chat message as a data URL: both iOS game views decode nothing else. Never a link.
    if (args.outputDrawingUrl && !isInlineDrawing(args.outputDrawingUrl)) throw new Error("Unsupported drawing");
    if ((args.selectedOption ?? args.outputText ?? "").length > 500) throw new Error("Answer too long");
    // Already answered, or closed by the server deadline. Not an error: clients show anything
    // thrown here as an alert, and a late answer is simply dropped.
    if (step.status !== "active") {
      // The reply to a guess can be lost, so its player may send the guess again and is told how the first one
      // came out: the pick on record stands, whatever this call carries. A repeat changes nothing, which would
      // make it a free read for anyone who knows the ids, so it is answered only for a matching token. A player
      // with none on record is answered once, when the guess is taken.
      if (!caller || proof !== "token" || !isAnsweredGuess(step)) return null;
      const answeredChain = await ctx.db.get(step.chainId);
      const answeredSession = answeredChain && (await ctx.db.get(answeredChain.gameSessionId));
      if (!answeredChain || !answeredSession) return null;
      return guessResult(answeredSession, answeredChain, caller, step);
    }

    const chain = await ctx.db.get(step.chainId);
    if (!chain) throw new Error("Chain not found");
    const session = await ctx.db.get(chain.gameSessionId);
    if (!session) throw new Error("Session not found");

    const playerIds = session.playerIds;
    const playerCount = playerIds.length;

    console.log("[submitGameStep] type:", step.stepType, "chain:", chain.chainIndex, "players:", playerCount);

    // === DRAW STEP SUBMITTED ===
    if (step.stepType === "draw") {
      // Both apps always attach the canvas image. Without one the others would be asked to guess at
      // nothing, in a round the summary counts and the scores and the replay leave out.
      if (!args.outputDrawingUrl) throw new Error("Drawing is missing");

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
      await watchRound(ctx, step.chainId, "guess");

      await ctx.db.patch(step.chainId, { currentStepIndex: 1 });
      console.log("[submitGameStep] draw path complete for chain", chain.chainIndex);
      return null;
    }

    // === GUESS STEP SUBMITTED ===
    const selectedOption = args.selectedOption ?? args.outputText;
    // Check correctness against both English original and Japanese translation: the translation
    // getMyActiveStep showed, which is the session's own word bank first, then the built-in one
    const jaTranslation = translationsFor(session)[chain.originalPrompt]?.ja;
    const isCorrect = selectedOption === chain.originalPrompt || (!!jaTranslation && selectedOption === jaTranslation);
    // Neither the pick nor the prompt: a dev deployment sends a function's log lines back to its caller
    console.log("[submitGameStep] guess taken for chain", chain.chainIndex);

    await ctx.db.patch(args.stepId, {
      outputText: selectedOption,
      selectedOption: selectedOption,
      correct: isCorrect,
      status: "submitted",
      submittedAt: Date.now(),
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

    const result =
      caller && proof !== "none" ? guessResult(session, chain, caller, { correct: isCorrect, selectedOption }) : null;
    if (!allGuessesSubmitted) return result; // Wait for other guessers

    // All guesses in — complete this chain/round
    await finishRound(ctx, session, chain, chainSteps);
    return result;
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
    token: v.optional(v.string()),
  },
  // The return type is written out: inferred, it would depend on `api`, which depends on this module
  handler: async (ctx, args): Promise<GuessResult | null> => {
    // Build args object, omitting undefined values (Convex requires absent, not undefined)
    const mutationArgs: Record<string, unknown> = {
      stepId: args.stepId,
      participantId: args.participantId,
    };
    if (args.outputText !== undefined) mutationArgs.outputText = args.outputText;
    if (args.outputDrawingUrl !== undefined) mutationArgs.outputDrawingUrl = args.outputDrawingUrl;
    if (args.selectedOption !== undefined) mutationArgs.selectedOption = args.selectedOption;
    if (args.token !== undefined) mutationArgs.token = args.token;

    return await ctx.runMutation(api.games.submitGameStep, mutationArgs as any);
  },
});

/**
 * Keeps a round from waiting forever on someone who is not playing. Scheduled when a chain's
 * draw step or guess steps are created, and re-schedules itself until that phase is over.
 * A chain only moves draw → guess → complete, so (chainId, phase) identifies the state this
 * was scheduled for: if that phase has no open step left, the call is stale and does nothing.
 */
export const roundDeadline = internalMutation({
  args: {
    chainId: v.id("gameChains"),
    phase: v.union(v.literal("draw"), v.literal("guess")),
    /** Looks in a row that found nobody we are waiting for present */
    misses: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const chain = await ctx.db.get(args.chainId);
    if (!chain || chain.status !== "active") return null;
    const session = await ctx.db.get(chain.gameSessionId);
    if (!session || session.status !== "active") return null;

    const chainSteps = await ctx.db
      .query("gameSteps")
      .withIndex("by_chainId", (q) => q.eq("chainId", chain._id))
      .collect();
    const open = chainSteps.filter((s) => s.stepType === args.phase && s.status === "active");
    if (open.length === 0) return null;

    // A round's guess steps are created together, so any open step dates the phase
    const now = Date.now();
    const endsAt = open[0].createdAt + phaseLimitMs(session, args.phase);
    if (now < endsAt) {
      let someoneCanReturn = false;
      for (const s of open) {
        const player = await ctx.db.get(s.assignedParticipantId);
        if (isPresent(player, now)) {
          // Someone we are waiting for is here: give them until the limit. Nobody absent is
          // closed out while the round is still open for someone else, so they can come back.
          await watchRound(ctx, chain._id, args.phase, Math.min(ROUND_CHECK_MS, endsAt - now));
          return null;
        }
        if (player) someoneCanReturn = true; // a kicked player cannot come back
      }
      // One look is not proof: a page reload reads as gone for a few seconds
      if (someoneCanReturn && (args.misses ?? 0) < 1) {
        await watchRound(ctx, chain._id, args.phase, Math.min(ROUND_RECHECK_MS, endsAt - now), 1);
        return null;
      }
    }

    // No `correct` and no `selectedOption`: a timeout is not a wrong answer
    for (const s of open) {
      await ctx.db.patch(s._id, { status: "submitted", timedOut: true, submittedAt: now });
    }
    if (args.phase === "draw") {
      // The drawer's own client clears its "drawing" indicator when the step goes away; a locked phone never does
      const drawer = await ctx.db.get(open[0].assignedParticipantId);
      if (drawer?.typingAction === "drawing") {
        await ctx.db.patch(drawer._id, { typingAction: undefined, drawingStartedAt: undefined });
      }
    }
    await finishRound(ctx, session, chain, chainSteps);
    return null;
  },
});

export const cancelGame = mutation({
  args: {
    roomId: v.id("rooms"),
    participantId: v.id("participants"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    if (participant.role !== "host") throw new Error("Only the host can cancel a game");
    // "Host" above is any room's host; it has to be this room's, and has to prove it
    await requireHost(ctx, args.roomId, args.participantId, args.token, "games.cancelGame");

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
          // Flagged like a deadline close, so an unanswered step is not scored as a wrong answer
          await ctx.db.patch(step._id, { status: "submitted", submittedAt: Date.now(), timedOut: true });
        }
      }
    }

    // Post game summary (only if at least one round was played)
    for (const session of litSessions) {
      const chains = await ctx.db
        .query("gameChains")
        .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
        .collect();
      chains.sort((a, b) => a.chainIndex - b.chainIndex);
      const steps = await ctx.db
        .query("gameSteps")
        .withIndex("by_gameSessionId", (q) => q.eq("gameSessionId", session._id))
        .collect();

      // Only post summary if any guesses were made
      const guessSteps = steps.filter(isAnsweredGuess);
      if (guessSteps.length === 0) {
        // No rounds played — just post cancellation
        await ctx.db.insert("messages", {
          roomId: args.roomId,
          senderId: args.participantId,
          kind: "system",
          status: "processed",
          text: "game_cancelled:Lost in Translation",
          createdAt: Date.now(),
        });
        continue;
      }

      // Build per-round results. The round the Cancel cut short is listed with its answers, and gives the teams
      // of a team game no points: its result was never stored
      const roundResults: RoundResult[] = [];
      for (const ch of chains) {
        const guessesForChain = steps.filter((s) => s.chainId === ch._id && isAnsweredGuess(s));
        if (guessesForChain.length === 0) continue;
        const results: Record<string, boolean> = {};
        for (const gs of guessesForChain) {
          results[gs.assignedParticipantId] = !!gs.correct;
        }
        const teamPoints = teamPointsOf(ch);
        roundResults.push({ round: ch.chainIndex + 1, prompt: ch.originalPrompt, results, ...(teamPoints ? { teamPoints } : {}) });
      }

      // Build totals
      const totals: Record<string, { correct: number; total: number }> = {};
      for (const pid of session.playerIds) {
        totals[pid] = { correct: 0, total: 0 };
      }
      for (const s of guessSteps) {
        if (!totals[s.assignedParticipantId]) totals[s.assignedParticipantId] = { correct: 0, total: 0 };
        totals[s.assignedParticipantId].total += 1;
        if (s.correct) totals[s.assignedParticipantId].correct += 1;
      }

      // Build player name map
      const playerMap: Record<string, { name: string; avatar: string }> = {};
      for (const pid of session.playerIds) {
        const p = await ctx.db.get(pid);
        if (p && "nickname" in p) {
          playerMap[pid] = { name: (p as any).nickname, avatar: (p as any).avatar?.value ?? "default" };
        }
      }

      const standing = teamStanding(session, chains);
      const summaryData = {
        gameType: "Lost in Translation",
        level: session.level ?? 1,
        cancelled: true,
        players: playerMap,
        rounds: roundResults,
        totals,
        ...(standing ? { teams: standing } : {}),
      };

      await ctx.db.insert("messages", {
        roomId: args.roomId,
        senderId: args.participantId,
        kind: "system",
        status: "processed",
        text: `game_summary:${JSON.stringify(summaryData)}`,
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
  // `token` is read only with LOST_IN_TRANSLATION_HIDE_ANSWER on
  args: { participantId: v.id("participants"), token: v.optional(v.string()) },
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

    // See hidesAnswer. A participant id is on every guest's screen, so anyone can ask for anyone's step, and a
    // step is for its player alone: a drawing step carries the prompt, and every step the id its answer is
    // sent with. A caller without proof is told there is no step, never refused: an error from this query
    // takes the web room page down.
    const hide = hidesAnswer();
    if (hide && (await callerProof(ctx, args.participantId, args.token)) === "none") return null;

    const chain = await ctx.db.get(step.chainId);
    const round = (chain?.chainIndex ?? 0) + 1;
    const totalRounds = session.chainCount ?? TOTAL_ROUNDS;

    // Build translation map: merge hardcoded with any custom prompts from this session
    const translationMap = translationsFor(session);

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
      correctOption: hide ? undefined : correctOption,
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
      if (isAnsweredGuess(step) && playedChainIds.has(step.chainId)) {
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

    // Team game: how the teams stand after the rounds that have ended, and which team's member has the drawing
    // this round. Both are keys of their own beside `scores`, which is a map of players only: installed iOS
    // builds decode it as one fixed shape, and an entry of another shape would fail the whole status.
    const teams = teamStanding(session, chains);
    const drawingTeam: 0 | 1 | null =
      !teams || !drawerId
        ? null
        : teams[0].memberIds.includes(drawerId)
          ? 0
          : teams[1].memberIds.includes(drawerId)
            ? 1
            : null;

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
      ...(teams ? { teams, drawingTeam } : {}),
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
    // A team is shown whole, with the members the game never reached
    if (teamsOf(session)) for (const pid of session.playerIds) pidSet.add(pid);
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
      if (isAnsweredGuess(step) && playedChainIds.has(step.chainId)) {
        const pid = step.assignedParticipantId;
        if (!scores[pid]) scores[pid] = { correct: 0, total: 0 };
        scores[pid].total += 1;
        if (step.correct) scores[pid].correct += 1;
      }
    }

    const chainData = chains
      .map((chain) => {
        // Steps the server closed unanswered are left out: both replay UIs would draw them as a wrong pick
        const steps = allSteps
          .filter((s) => s.chainId === chain._id && !s.timedOut)
          .sort((a, b) => a.stepIndex - b.stepIndex);
        const teamPoints = teamPointsOf(chain);
        return {
          ...chain,
          steps,
          ...(teamPoints ? { teamPoints } : {}),
        };
      })
      // Only include chains that were actually played (have a draw step with output). While the game
      // is running that also means finished: a round still being guessed would hand its prompt to the
      // guessers. Both apps ask for the replay only once the session is complete, and that replay is
      // what it always was.
      .filter((chain) => {
        const drawStep = chain.steps.find((s) => s.stepType === "draw");
        return drawStep && drawStep.outputDrawingUrl && (session.status !== "active" || chain.status === "complete");
      });

    // Build prompt translations (en→ja) for all options used in this game
    const promptTranslations: Record<string, string> = {};
    const translationMap = translationsFor(session);
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

    const teams = teamStanding(session, chains);
    return { session, chains: chainData, participants, scores, promptTranslations, ...(teams ? { teams } : {}) };
  },
});

// ============================================================
// Emojifyr — sentence-to-emoji guessing game
// ============================================================

// No current build offers Emojifyr, but installed iOS builds from before 2026-10-01 still call these
// functions and their routes, so all of them stay as they are. What is bounded is what they can ask
// of the model, and which sessions they reach: Emojifyr's own, never Lost in Translation's.

// The longest text the game's own screens send towards the model, in UTF-16 units. The sentence field
// stops at 80 characters, which the iOS field counts whole: an emoji is one there and two to four here.
// A clue is never typed: it is the model's own 3-6 emoji, and the generator below stops at 64 tokens.
// The guess field has no limit of its own, but a guess is one line typed at a handful of emoji.
const EMOJIFYR_SENTENCE_MAX = 320;
const EMOJIFYR_CLUE_MAX = 500;
const EMOJIFYR_GUESS_MAX = 300;

// One hourly ceiling for every Emojifyr model call, under a single key. Elsewhere a row that every
// caller writes is avoided (participants.ts: takeRateLimit), but here the only real callers are the
// few old builds that still have the game, so they are all that can contend for it. A round costs
// about four calls plus one per guess: six players finishing a round every two minutes use about 270
// an hour, so this leaves room for five such rooms.
const EMOJIFYR_MODEL_CALLS_PER_HOUR = 1500;

export const takeEmojifyrModelCall = internalMutation({
  args: {},
  returns: v.boolean(),
  handler: async (ctx): Promise<boolean> =>
    await takeRateLimit(ctx, "emojifyr:all", EMOJIFYR_MODEL_CALLS_PER_HOUR, 60 * 60_000),
});

/** Counts one model call against the ceiling. False once the hour's allowance is used up */
async function emojifyrModelCallAllowed(ctx: ActionCtx): Promise<boolean> {
  return await ctx.runMutation(internal.games.takeEmojifyrModelCall, {});
}

/**
 * The session an Emojifyr function was handed, which has to be one of Emojifyr's. These functions ask
 * for no token, and Lost in Translation keeps its sessions in the same table, with their ids in what
 * every guest reads: without this check anyone could end the game that cancelGame lets only the host end.
 */
async function emojifyrSessionById(ctx: MutationCtx, id: Id<"gameSessions">): Promise<Doc<"gameSessions">> {
  const session = await ctx.db.get(id);
  if (!session) throw new Error("Session not found");
  if (session.gameType !== "emojifyr") throw new Error("Not an Emojifyr game");
  return session;
}

/**
 * Ends an Emojifyr session and records it in the chat: for the game's own Cancel, and for a Lost in
 * Translation Start that takes the room over (startGame), so that a build which still shows Emojifyr
 * sees the same thing either way. The rounds are left to the caller. startGame does not touch them:
 * no build asks for the rounds of a session that is over, and they are written without a token, so
 * reading them there would let whoever filled them push Start over a transaction's read limit.
 */
async function endEmojifyrSession(ctx: MutationCtx, session: Doc<"gameSessions">): Promise<void> {
  await ctx.db.patch(session._id, {
    status: "complete",
    completedAt: Date.now(),
    cancelled: true,
  });

  // Post system message
  await ctx.db.insert("messages", {
    roomId: session.roomId,
    senderId: session.createdByParticipantId,
    kind: "system",
    status: "processed",
    text: "game_cancelled:Emojifyr",
    createdAt: Date.now(),
  });
}

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
    isInitialism: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.sentence.length < 1 || args.sentence.length > 80) {
      throw new Error("Sentence must be between 1 and 80 characters");
    }
    const round = await ctx.db.get(args.roundId);
    if (!round) throw new Error("Round not found");
    // Tolerate stale calls: if round already moved past "writing", silently skip
    if (round.status !== "writing") return;

    const patch: any = {
      originalSentence: args.sentence,
      status: "generating",
    };
    if (args.isInitialism) {
      patch.isInitialism = true;
    }
    await ctx.db.patch(args.roundId, patch);
  },
});

export const updateEmojifyrSentence = mutation({
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
    // Tolerate stale calls: if round already moved past generating/preview, silently skip
    if (round.status !== "generating" && round.status !== "preview") return;

    await ctx.db.patch(args.roundId, {
      originalSentence: args.sentence,
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
    // Tolerate stale calls: if round already moved past generating/preview, silently skip
    if (round.status !== "generating" && round.status !== "preview") return;

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
    translatedGuessText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const round = await ctx.db.get(args.roundId);
    if (!round) throw new Error("Round not found");

    const doc: any = {
      roundId: args.roundId,
      participantId: args.participantId,
      guessText: args.guessText,
      createdAt: Date.now(),
    };
    if (args.translatedGuessText) {
      doc.translatedGuessText = args.translatedGuessText;
    }
    await ctx.db.insert("emojifyrGuesses", doc);

    // Auto-reveal: if all non-writer participants have guessed, reveal automatically
    if (round.status === "guessing") {
      const session = await ctx.db.get(round.gameSessionId);
      if (session) {
        const writerIdStr = String(round.writerParticipantId);
        const guesserIds = session.playerIds
          .map((pid: any) => String(pid))
          .filter((pid: string) => pid !== writerIdStr);
        const allGuesses = await ctx.db
          .query("emojifyrGuesses")
          .withIndex("by_roundId", (q) => q.eq("roundId", args.roundId))
          .collect();
        const guessedPlayerIds = new Set(allGuesses.map((g: any) => String(g.participantId)));
        const allGuessed = guesserIds.every((pid: string) => guessedPlayerIds.has(pid));
        if (allGuessed && guesserIds.length > 0) {
          await ctx.db.patch(args.roundId, {
            status: "reveal",
            revealedAt: Date.now(),
          });
        }
      }
    }
  },
});

// Action wrappers that translate before saving

export const submitEmojifyrEmojiClueWithTranslation = action({
  args: {
    roundId: v.id("emojifyrRounds"),
    emojiClue: v.string(),
  },
  handler: async (ctx, args) => {
    // The clue goes into the hint prompt. The sentence translated below was capped at 80 when it was stored.
    if (args.emojiClue.length > EMOJIFYR_CLUE_MAX) {
      throw new Error(`Emoji clue too long (max ${EMOJIFYR_CLUE_MAX} characters)`);
    }
    // Submit the emoji clue FIRST so guessing begins immediately
    await ctx.runMutation(api.games.submitEmojifyrEmojiClue, {
      roundId: args.roundId,
      emojiClue: args.emojiClue,
    });

    // Then do background work: generate hint + translate sentence (non-blocking)
    try {
      const round: any = await ctx.runQuery(api.games.getEmojifyrRoundById, { roundId: args.roundId });

      // Generate bilingual hint for the emoji clue. Over the ceiling the round goes on without a hint
      // or a translated sentence, which is also what happens when either call fails.
      const hints = (await emojifyrModelCallAllowed(ctx)) ? await generateEmojiHint(args.emojiClue) : null;
      if (hints) {
        await ctx.runMutation(api.games.patchEmojifyrRoundHints, {
          roundId: args.roundId,
          hintEn: hints.en,
          hintJa: hints.ja,
        });
      }

      // Translate the original sentence
      if (round?.originalSentence) {
        const sentence = round.originalSentence;
        const detectedLang = detectLanguage(sentence);
        const targetLang = detectedLang === "ja" ? "en" : "ja";
        const translated = (await emojifyrModelCallAllowed(ctx))
          ? await translateWithClaude(sentence, detectedLang, targetLang)
          : null;
        if (translated) {
          await ctx.runMutation(api.games.patchEmojifyrRoundTranslation, {
            roundId: args.roundId,
            translatedSentence: translated,
          });
        }
      }
    } catch {
      // Background work is best-effort; don't fail the game flow
    }
  },
});

export const submitEmojifyrGuessWithTranslation = action({
  args: {
    roundId: v.id("emojifyrRounds"),
    participantId: v.id("participants"),
    guessText: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.guessText.length > EMOJIFYR_GUESS_MAX) {
      throw new Error(`Guess too long (max ${EMOJIFYR_GUESS_MAX} characters)`);
    }
    const detectedLang = detectLanguage(args.guessText);
    const targetLang = detectedLang === "ja" ? "en" : "ja";
    // Over the ceiling the guess is still recorded, untranslated, as when the translation fails
    const translated = (await emojifyrModelCallAllowed(ctx))
      ? await translateWithClaude(args.guessText, detectedLang, targetLang)
      : null;

    await ctx.runMutation(api.games.submitEmojifyrGuess, {
      roundId: args.roundId,
      participantId: args.participantId,
      guessText: args.guessText,
      translatedGuessText: translated ?? undefined,
    });
  },
});

// Helper queries/mutations for translation actions

export const getEmojifyrRoundById = query({
  args: { roundId: v.id("emojifyrRounds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roundId);
  },
});

export const patchEmojifyrRoundTranslation = mutation({
  args: {
    roundId: v.id("emojifyrRounds"),
    translatedSentence: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roundId, {
      translatedSentence: args.translatedSentence,
    });
  },
});

export const patchEmojifyrRoundHints = mutation({
  args: {
    roundId: v.id("emojifyrRounds"),
    hintEn: v.string(),
    hintJa: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roundId, {
      hintEn: args.hintEn,
      hintJa: args.hintJa,
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
    const session = await emojifyrSessionById(ctx, args.gameSessionId);
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
    const session = await emojifyrSessionById(ctx, args.gameSessionId);

    await endEmojifyrSession(ctx, session);

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

// --- AI Hint Generation Helper ---

async function generateEmojiHint(emojiClue: string): Promise<{ en: string; ja: string } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 128,
        messages: [{
          role: "user",
          content: `You are helping players in a guessing game. Given these emojis: ${emojiClue}

Write a short, playful one-sentence hint that nudges players toward the answer WITHOUT giving it away. Be vague and fun.

Output exactly two lines:
Line 1: The hint in English
Line 2: The same hint in Japanese

No labels, no prefixes, just the two lines.`,
        }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) return null;

    const lines = text.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    if (lines.length < 2) return null;

    return { en: lines[0], ja: lines[1] };
  } catch {
    return null;
  }
}

// --- AI Translation Helper ---

async function translateWithClaude(text: string, fromLang: string, toLang: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const fromName = fromLang === "ja" ? "Japanese" : "English";
  const toName = toLang === "ja" ? "Japanese" : "English";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        messages: [{
          role: "user",
          content: `Translate the following ${fromName} text to ${toName}. Output only the translation, nothing else.\n\n${text}`,
        }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

function detectLanguage(text: string): string {
  // Simple heuristic: if text contains CJK characters, it's Japanese
  const cjkRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/;
  return cjkRegex.test(text) ? "ja" : "en";
}

// --- AI Emoji Clue Generation (Anthropic Claude) ---

export const generateEmojiClue = action({
  args: { sentence: v.string() },
  handler: async (ctx, args) => {
    if (args.sentence.length > EMOJIFYR_SENTENCE_MAX) {
      throw new Error(`Sentence too long (max ${EMOJIFYR_SENTENCE_MAX} characters)`);
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    // "rate limit" makes the route answer 503. The old host app then makes a clue on the device
    // and the old web screen offers Regenerate.
    if (!(await emojifyrModelCallAllowed(ctx))) {
      throw new Error("Emojifyr is busy (rate limit). Try again later.");
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
        translatedSentence: showSentence ? currentRound.translatedSentence : undefined,
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
