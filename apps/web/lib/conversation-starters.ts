/**
 * What the strip above the message box offers a guest to say next (components/suggestion-strip.tsx), worked out on
 * the guest's page from the conversation and the clock, and from the replies the host's phone wrote for a message
 * where it wrote any. Every phrase is written in both languages, so the strip can show it in the language the guest
 * is practising, with their own underneath. The iPhone app follows the same rules (ConversationStarters.swift), and
 * tests/web/conversation-starters.test.ts writes it the deck and the cases that hold the two alike.
 *
 * The strip answers the newest thing that happened in the room: someone else's message, a newcomer, the end of a
 * game, or a silence. A message she is replying to comes before all of them.
 */

export interface Phrase {
  en: string;
  ja: string;
  /** The Japanese as the app writes romaji (ROMAJI_SYSTEM in convex/messages.ts): lowercase Hepburn, particles as spoken, no macrons */
  romaji: string;
}

/** A message as the strip reads it: the room's messages and the ones waiting in this tab's outbox */
export interface StarterMessage {
  _id: string;
  senderId: string;
  kind: string;
  text?: string;
  processing?: { translatedText?: string; suggestions?: string[] };
  createdAt: number;
}

export interface StarterPerson {
  _id: string;
  nickname: string;
}

export type ChipKind = "offered" | "intro" | "react" | "answer" | "welcome" | "gg" | "topic" | "game";

export interface Chip {
  /** Unique among the chips shown together, and the same for the same chip from one drawing to the next */
  key: string;
  kind: ChipKind;
  /**
   * The phrase in both languages. An offered chip has it when the host's phone wrote it, and `text` instead when it
   * came with the message, in whatever language that was written
   */
  phrase?: Phrase;
  text?: string;
}

export interface Starters {
  /** What the chips answer: a message, a newcomer, a game's end, a silence. Chips dismissed under a key stay away until it changes */
  key: string;
  chips: Chip[];
}

export interface StarterInput {
  messages: readonly StarterMessage[];
  people: readonly StarterPerson[];
  meId: string;
  /** The host's arrivals are the host's phone coming and going, and nobody is offered a welcome for them */
  hostId?: string;
  replyTo?: StarterMessage | null;
  now: number;
  /** 1 to 12, for the topics of the season */
  month: number;
  /** While a game is on, lobbies too, nothing is offered but replies to the message she is replying to */
  gameOn: boolean;
  /** Each value shows other topics */
  shuffle?: number;
  /** Replies the host's phone wrote for a message (messages.getSuggestedReplies), by the message's id */
  ideas?: Readonly<Record<string, readonly Phrase[]>>;
}

/** A silence this long after a message turns the strip from answers to topics */
export const LULL_MS = 30_000;
/** A newcomer is welcomed, and a finished game talked over, for this long before the silence counts */
export const WELCOME_MS = 60_000;
/** This long after the last thing that happened, a silence offers a game as well */
export const GAME_NUDGE_MS = 90_000;
/** Once she has sent this many messages within CHATTY_MS the strip stays away: she has plenty to say */
export const CHATTY_COUNT = 3;
export const CHATTY_MS = 120_000;
/** A phrase said in one of this many newest messages is not offered again, so that nobody echoes a canned line */
const RETIRE_LOOKBACK = 12;
/** At most this many chips at once */
const MAX_CHIPS = 6;
const TOPIC_COUNT = 3;

// ─── The deck ────────────────────────────────────────────────────────────────
// `{name}` is the person the chip answers, `{me}` the guest who sends it.

/** Back-channel reactions (aizuchi) to something said */
export const REACT: readonly Phrase[] = [
  { en: "Really?!", ja: "本当に？！", romaji: "hontou ni?!" },
  { en: "Nice!", ja: "いいね！", romaji: "ii ne!" },
  { en: "Me too!", ja: "私も！", romaji: "watashi mo!" },
  { en: "No way!", ja: "うそ！", romaji: "uso!" },
  { en: "That's amazing!", ja: "すごい！", romaji: "sugoi!" },
  { en: "Tell me more!", ja: "もっと聞かせて！", romaji: "motto kikasete!" },
  { en: "I see!", ja: "なるほど！", romaji: "naruhodo!" },
  { en: "Sounds fun!", ja: "楽しそう！", romaji: "tanoshisou!" },
  { en: "I didn't know that!", ja: "知らなかった！", romaji: "shiranakatta!" },
  { en: "Haha 😂", ja: "ウケる😂", romaji: "ukeru😂" },
  { en: "That's great!", ja: "よかったね！", romaji: "yokatta ne!" },
  { en: "So true!", ja: "わかる！", romaji: "wakaru!" },
  { en: "Why?", ja: "なんで？", romaji: "nande?" },
];

/** Reactions to a photo or a drawing. Some fit only one of the two */
export const PICTURE: readonly (Phrase & { only?: "image" | "drawing" })[] = [
  { en: "Nice!", ja: "いいね！", romaji: "ii ne!" },
  { en: "So cute!", ja: "かわいい！", romaji: "kawaii!" },
  { en: "Wow!", ja: "わあ、すごい！", romaji: "waa, sugoi!" },
  { en: "Haha, love it 😂", ja: "ウケる😂", romaji: "ukeru😂" },
  { en: "Where is that?", ja: "それどこ？", romaji: "sore doko?", only: "image" },
  { en: "Great drawing!", ja: "絵うまい！", romaji: "e umai!", only: "drawing" },
  { en: "What is it? 😆", ja: "それ何？😆", romaji: "sore nani?😆", only: "drawing" },
];

/** Answers to a yes-or-no question, most of them handing the question back */
export const ANSWER_YES_NO: readonly Phrase[] = [
  { en: "Yes! How about you?", ja: "うん！{name}さんは？", romaji: "un! {name} san wa?" },
  { en: "Not really… how about you?", ja: "あんまり…{name}さんは？", romaji: "anmari... {name} san wa?" },
  { en: "Kind of!", ja: "まあまあかな！", romaji: "maamaa kana!" },
];

/** Ways into any other question: time to think, or the question handed back */
export const ANSWER_OPEN: readonly Phrase[] = [
  { en: "Good question! Let me think…", ja: "いい質問！ちょっと考えるね…", romaji: "ii shitsumon! chotto kangaeru ne..." },
  { en: "Hmm, that's a hard one 😅", ja: "うーん、むずかしい😅", romaji: "uun, muzukashii😅" },
  { en: "You first, {name}!", ja: "{name}さんから教えて！", romaji: "{name} san kara oshiete!" },
];

/** For someone who has just joined */
export const WELCOME: readonly Phrase[] = [
  { en: "Welcome, {name}!", ja: "{name}さん、ようこそ！", romaji: "{name} san, youkoso!" },
  { en: "Hi {name}! 👋", ja: "{name}さん、こんにちは！👋", romaji: "{name} san, konnichiwa!👋" },
  { en: "Nice to meet you, {name}!", ja: "{name}さん、はじめまして！", romaji: "{name} san, hajimemashite!" },
  { en: "Where are you from, {name}?", ja: "{name}さんはどこから来たの？", romaji: "{name} san wa doko kara kita no?" },
];

/** For someone who has come back to a room they had talked in */
export const WELCOME_BACK: readonly Phrase[] = [
  { en: "Welcome back, {name}!", ja: "{name}さん、おかえり！", romaji: "{name} san, okaeri!" },
  { en: "We missed you, {name}!", ja: "{name}さん、待ってたよ！", romaji: "{name} san, matteta yo!" },
];

/** Her own first words in the room */
export const INTRO: readonly Phrase[] = [
  { en: "Hi, I'm {me}! Nice to meet you", ja: "{me}です！よろしくね", romaji: "{me} desu! yoroshiku ne" },
  { en: "Hi everyone! 👋", ja: "みんな、こんにちは！👋", romaji: "minna, konnichiwa!👋" },
  { en: "Nice to meet you all!", ja: "みなさん、はじめまして！", romaji: "minasan, hajimemashite!" },
];

/** Her first words back in a room she had talked in before */
export const BACK: readonly Phrase[] = [
  { en: "I'm back!", ja: "ただいま！", romaji: "tadaima!" },
  { en: "Hi again, everyone!", ja: "みんな、また来たよ！", romaji: "minna, mata kita yo!" },
];

/** After a game */
export const GG: readonly Phrase[] = [
  { en: "Good game!", ja: "おつかれ！", romaji: "otsukare!" },
  { en: "That was fun!", ja: "楽しかった！", romaji: "tanoshikatta!" },
  { en: "One more round?", ja: "もう1回やる？", romaji: "mou 1 kai yaru?" },
  { en: "So close! 😆", ja: "惜しかった！😆", romaji: "oshikatta!😆" },
];

/** Light questions for the whole room, for a silence */
export const TOPICS: readonly Phrase[] = [
  { en: "Cats or dogs?", ja: "猫派？犬派？", romaji: "nekoha? inuha?" },
  { en: "What's your favorite food?", ja: "好きな食べ物は何？", romaji: "suki na tabemono wa nani?" },
  { en: "Morning person or night owl?", ja: "朝型？それとも夜型？", romaji: "asagata? soretomo yorugata?" },
  { en: "Beach or mountains?", ja: "海と山、どっちが好き？", romaji: "umi to yama, docchi ga suki?" },
  { en: "Ramen or sushi?", ja: "ラーメンとお寿司、どっちが好き？", romaji: "raamen to osushi, docchi ga suki?" },
  { en: "Coffee or tea?", ja: "コーヒーとお茶、どっちが好き？", romaji: "koohii to ocha, docchi ga suki?" },
  { en: "Where do you want to travel next?", ja: "次に旅行したい場所は？", romaji: "tsugi ni ryokou shitai basho wa?" },
  { en: "What did you do last weekend?", ja: "先週末は何してた？", romaji: "senshuumatsu wa nani shiteta?" },
  { en: "What's your favorite movie?", ja: "好きな映画は？", romaji: "suki na eiga wa?" },
  { en: "What music are you into lately?", ja: "最近ハマってる音楽は？", romaji: "saikin hamatteru ongaku wa?" },
  { en: "What's your go-to konbini snack?", ja: "コンビニでよく買うお菓子は？", romaji: "konbini de yoku kau okashi wa?" },
  { en: "What's your hobby?", ja: "趣味は何？", romaji: "shumi wa nani?" },
  { en: "Do you have any pets?", ja: "ペット飼ってる？", romaji: "petto katteru?" },
  { en: "Any anime or dramas you're watching?", ja: "今見てるアニメかドラマある？", romaji: "ima miteru anime ka dorama aru?" },
  { en: "Best thing you ate this week?", ja: "今週食べた一番おいしいものは？", romaji: "konshuu tabeta ichiban oishii mono wa?" },
  { en: "Your favorite place in Japan?", ja: "日本で好きな場所は？", romaji: "nihon de suki na basho wa?" },
  { en: "Which city in Japan do you recommend?", ja: "日本でおすすめの街は？", romaji: "nihon de osusume no machi wa?" },
  { en: "Any food you can't eat?", ja: "苦手な食べ物ある？", romaji: "nigate na tabemono aru?" },
  { en: "Do you like spicy food?", ja: "辛い食べ物は好き？", romaji: "karai tabemono wa suki?" },
  { en: "What's your karaoke song?", ja: "カラオケの十八番は？", romaji: "karaoke no ohako wa?" },
  { en: "What game are you playing lately?", ja: "最近やってるゲームある？", romaji: "saikin yatteru geemu aru?" },
  { en: "Do you cook? What's your best dish?", ja: "料理する？得意料理は？", romaji: "ryouri suru? tokui ryouri wa?" },
  { en: "Something that made you happy today?", ja: "今日ちょっと嬉しかったことは？", romaji: "kyou chotto ureshikatta koto wa?" },
  { en: "Favorite Japanese word?", ja: "好きな日本語の言葉は？", romaji: "suki na nihongo no kotoba wa?" },
  { en: "Favorite English word?", ja: "好きな英語の言葉は？", romaji: "suki na eigo no kotoba wa?" },
  { en: "What do you usually eat for breakfast?", ja: "朝ごはんはいつも何食べる？", romaji: "asagohan wa itsumo nani taberu?" },
  { en: "If you could live anywhere, where?", ja: "どこにでも住めるなら、どこがいい？", romaji: "doko ni demo sumeru nara, doko ga ii?" },
  { en: "Most fun thing you did this year?", ja: "今年一番楽しかったことは？", romaji: "kotoshi ichiban tanoshikatta koto wa?" },
  { en: "What's your dream job?", ja: "夢の仕事は何？", romaji: "yume no shigoto wa nani?" },
  { en: "Summer or winter?", ja: "夏と冬、どっちが好き？", romaji: "natsu to fuyu, docchi ga suki?" },
];

/** Topics of a season, by the months (1 to 12) they are in season. A silence opens on one of them */
export const SEASONAL: readonly (Phrase & { months: readonly number[] })[] = [
  { months: [3, 4], en: "Been cherry blossom viewing yet?", ja: "お花見した？", romaji: "ohanami shita?" },
  { months: [6], en: "What do you do on rainy days?", ja: "雨の日は何して過ごす？", romaji: "ame no hi wa nani shite sugosu?" },
  { months: [7, 8], en: "Going to any summer festivals?", ja: "夏祭り行く？", romaji: "natsumatsuri iku?" },
  { months: [10], en: "Dressing up for Halloween?", ja: "ハロウィン、仮装する？", romaji: "harowin, kasou suru?" },
  { months: [10, 11], en: "Seen the autumn leaves yet?", ja: "紅葉もう見た？", romaji: "kouyou mou mita?" },
  { months: [11, 12], en: "Any year-end parties coming up?", ja: "忘年会の予定ある？", romaji: "bounenkai no yotei aru?" },
  { months: [12, 1], en: "Any plans for New Year's?", ja: "お正月の予定は？", romaji: "oshougatsu no yotei wa?" },
  { months: [12, 1, 2], en: "Hot pot season! Favorite nabe?", ja: "鍋の季節！好きな鍋は？", romaji: "nabe no kisetsu! suki na nabe wa?" },
  { months: [2], en: "Giving chocolate on Valentine's?", ja: "バレンタインにチョコあげる？", romaji: "barentain ni choko ageru?" },
];

// ─── Reading the room ────────────────────────────────────────────────────────

const SAID_KINDS = new Set(["text", "image", "drawing", "audio"]);
const JAPANESE = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
/** The lines a finished game writes into the chat (games.ts, emojiMatch.ts, emojiBingo.ts, wordRush.ts, truthOrDare.ts) */
const GAME_OVER = /^(game_summary|emoji_match_summary|emoji_bingo_summary|emoji_match_complete|truth_or_dare_summary):/;
const YES_NO = /^(do|does|did|am|are|is|was|were|have|has|had|can|could|will|would|should|shall)\b/i;

type Happening = "said" | "arrived" | "gameOver";

/** A message someone sent: a text, a picture, a drawing or a voice message */
const isSaid = (m: StarterMessage) => SAID_KINDS.has(m.kind);

function happeningOf(m: StarterMessage, hostId: string | undefined): Happening | null {
  if (isSaid(m)) return "said";
  if (m.kind !== "system" || !m.text) return null;
  if (m.text.startsWith("join:")) return m.senderId === hostId ? null : "arrived";
  return GAME_OVER.test(m.text) ? "gameOver" : null;
}

/** A text for comparing what was said: lowercase, without spaces, punctuation, symbols or emoji */
const plain = (text: string) => text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");

/** Ends in a question mark, with nothing after it but spaces, emoji or other marks. "Really?!" is a cry, not a question */
const ASKED = /[?？][^\p{L}\p{N}!！]*$/u;
/** Japanese that asks without a question mark: 元気ですか。 A bare か ends words too (静か) */
const ASKED_JA = /((です|でした|ます|ました|ません|でしょう)か|かな)[^\p{L}\p{N}!！?？]*$/u;

/** Whether a message asks something, and whether it can be answered yes or no, read off its English where it has one */
function questionOf(m: StarterMessage): "yesNo" | "open" | null {
  const text = m.text?.trim() ?? "";
  const translated = m.processing?.translatedText?.trim() ?? "";
  if (!ASKED.test(text) && !ASKED.test(translated) && !ASKED_JA.test(text)) return null;
  const english = JAPANESE.test(text) ? translated : text;
  return YES_NO.test(english) ? "yesNo" : "open";
}

/** FNV-1a: the same chips for the same moment from one drawing to the next, and other people shown other ones */
function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

type Vars = { name?: string; me?: string };

function fill(phrase: Phrase, vars: Vars): Phrase {
  const put = (text: string) => text.replaceAll("{name}", vars.name ?? "").replaceAll("{me}", vars.me ?? "");
  return { en: put(phrase.en), ja: put(phrase.ja), romaji: put(phrase.romaji) };
}

const needs = (phrase: Phrase, slot: keyof Vars) => phrase.en.includes(`{${slot}}`) || phrase.ja.includes(`{${slot}}`);

/**
 * Up to `count` phrases of `pool`, going round it from a place `seed` picks. A phrase that needs a name nobody gave
 * is passed over, and so is one somebody said lately, in either language.
 */
function pick(pool: readonly Phrase[], count: number, seed: string, said: ReadonlySet<string>, vars: Vars): Phrase[] {
  const picked: Phrase[] = [];
  const start = pool.length > 0 ? hash(seed) % pool.length : 0;
  for (let i = 0; i < pool.length && picked.length < count; i++) {
    const phrase = pool[(start + i) % pool.length];
    if ((needs(phrase, "name") && !vars.name) || (needs(phrase, "me") && !vars.me)) continue;
    const filled = fill(phrase, vars);
    if (said.has(plain(filled.en)) || said.has(plain(filled.ja))) continue;
    picked.push(filled);
  }
  return picked;
}

const chipsOf = (kind: ChipKind, phrases: Phrase[]): Chip[] => phrases.map((phrase) => ({ key: `${kind}:${phrase.en}`, kind, phrase }));

// ─── The strip ───────────────────────────────────────────────────────────────

/**
 * The chips for this moment, if any, and the time at which the clock alone changes them (null when nothing but
 * another message or another tap can). The newest of the room's messages counts from its own time if the clock
 * reads earlier, as the vibe meter's does (lib/vibe.ts).
 */
export function startersFor(input: StarterInput): { starters: Starters | null; wakeAt: number | null } {
  const { messages, meId, hostId, replyTo, gameOn, month, shuffle = 0 } = input;
  const nameOf = (id: string) => input.people.find((p) => p._id === id)?.nickname;
  const me = nameOf(meId);
  const spoken = messages.filter(isSaid);
  const mine = spoken.filter((m) => m.senderId === meId);
  const said = new Set(
    spoken.slice(-RETIRE_LOOKBACK).flatMap((m) => [m.text, m.processing?.translatedText].filter((t): t is string => !!t).map(plain))
  );
  const seed = (key: string) => `${meId}|${key}`;
  // Her first words: an introduction if she has said nothing yet in the room
  const intro = (key: string, count: number) => (mine.length === 0 ? chipsOf("intro", pick(INTRO, count, seed(key), said, { me })) : []);

  /**
   * What she might send back to `m`: the replies written for it, or else what came with it, then her introduction if
   * she owes one, then the deck's
   */
  const answersTo = (m: StarterMessage, key: string): Chip[] => {
    const ideas = (input.ideas?.[m._id] ?? []).filter(
      (p) => p.en.trim() !== "" && p.ja.trim() !== "" && !said.has(plain(p.en)) && !said.has(plain(p.ja))
    );
    const offered: Chip[] =
      ideas.length > 0
        ? ideas.slice(0, 3).map((phrase, i) => ({ key: `idea:${i}`, kind: "offered", phrase }))
        : (m.processing?.suggestions ?? [])
            .filter((text) => text.trim() !== "")
            .slice(0, 3)
            .map((text, i) => ({ key: `offered:${i}`, kind: "offered", text }));
    const vars = { name: nameOf(m.senderId), me };
    let replies: Chip[];
    if (m.kind === "image" || m.kind === "drawing") {
      replies = chipsOf("react", pick(PICTURE.filter((p) => !p.only || p.only === m.kind), 4, seed(key), said, vars));
    } else {
      const question = questionOf(m);
      replies = question
        ? chipsOf("answer", pick(question === "yesNo" ? ANSWER_YES_NO : ANSWER_OPEN, 3, seed(key), said, vars))
        : chipsOf("react", pick(REACT, 4, seed(key), said, vars));
    }
    return [...offered, ...intro(key, 1), ...replies].slice(0, MAX_CHIPS);
  };

  if (replyTo && replyTo.senderId !== meId && isSaid(replyTo)) {
    const key = `reply:${replyTo._id}`;
    return { starters: { key, chips: answersTo(replyTo, key) }, wakeAt: null };
  }
  // The game does the talking, and what is said meanwhile is mostly guesses and answers
  if (gameOn) return { starters: null, wakeAt: null };

  let newestAt = 0;
  let newest: { m: StarterMessage; what: Happening } | null = null;
  for (const m of messages) {
    newestAt = Math.max(newestAt, m.createdAt);
    const what = happeningOf(m, hostId);
    if (what && (!newest || m.createdAt >= newest.m.createdAt)) newest = { m, what };
  }
  const now = Math.max(input.now, newestAt);

  const lately = mine.filter((m) => now - m.createdAt < CHATTY_MS);
  if (lately.length >= CHATTY_COUNT) {
    return { starters: null, wakeAt: lately[lately.length - CHATTY_COUNT].createdAt + CHATTY_MS };
  }

  if (newest) {
    const { m, what } = newest;
    const freshFor = what === "said" ? LULL_MS : WELCOME_MS;
    if (now - m.createdAt < freshFor) {
      const wakeAt = m.createdAt + freshFor;
      const mineToo = m.senderId === meId;
      if (what === "said") {
        // After her own message the others have the floor
        if (mineToo) return { starters: null, wakeAt };
        const key = `said:${m._id}`;
        return { starters: { key, chips: answersTo(m, key) }, wakeAt };
      }
      if (what === "gameOver") {
        const key = `gg:${m._id}`;
        return { starters: { key, chips: chipsOf("gg", pick(GG, 3, seed(key), said, {})) }, wakeAt };
      }
      if (mineToo) {
        const key = `intro:${m._id}`;
        const chips = mine.length === 0 ? chipsOf("intro", pick(INTRO, 3, seed(key), said, { me })) : chipsOf("intro", pick(BACK, 2, seed(key), said, {}));
        return { starters: { key, chips }, wakeAt };
      }
      // Somebody who has talked here before has come back
      const key = `welcome:${m._id}`;
      const back = spoken.some((s) => s.senderId === m.senderId && s.createdAt < m.createdAt);
      const name = nameOf(m.senderId) ?? m.text!.slice("join:".length);
      const welcome = chipsOf("welcome", pick(back ? WELCOME_BACK : WELCOME, 3, seed(key), said, { name, me }));
      return { starters: { key, chips: [...welcome, ...intro(key, 1)].slice(0, MAX_CHIPS) }, wakeAt };
    }
  }

  // A silence
  const since = newest ? newest.m.createdAt : -Infinity;
  const key = `lull:${newest?.m._id ?? ""}`;
  const chips = [...intro(key, 1), ...chipsOf("topic", topics(seed(key), shuffle, month, said))];
  const gameDue = since + GAME_NUDGE_MS;
  if (now >= gameDue) chips.push({ key: "game", kind: "game" });
  return { starters: { key, chips }, wakeAt: now >= gameDue ? null : gameDue };
}

/** TOPIC_COUNT topics: one of the season's first if there is one, then the deck's, `shuffle` turning both on */
function topics(seed: string, shuffle: number, month: number, said: ReadonlySet<string>): Phrase[] {
  const fresh = (p: Phrase) => !said.has(plain(p.en)) && !said.has(plain(p.ja));
  const start = hash(seed);
  const inSeason = SEASONAL.filter((p) => p.months.includes(month) && fresh(p));
  const picked: Phrase[] = inSeason.length > 0 ? [inSeason[(start + shuffle) % inSeason.length]] : [];
  const first = start + shuffle * (TOPIC_COUNT - picked.length);
  for (let i = 0; i < TOPICS.length && picked.length < TOPIC_COUNT; i++) {
    const phrase = TOPICS[(first + i) % TOPICS.length];
    if (fresh(phrase)) picked.push(phrase);
  }
  return picked.map(({ en, ja, romaji }) => ({ en, ja, romaji }));
}
