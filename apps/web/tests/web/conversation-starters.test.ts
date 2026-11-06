import { describe, expect, test } from "vitest";
import {
  ANSWER_OPEN,
  ANSWER_YES_NO,
  BACK,
  CHATTY_MS,
  GAME_NUDGE_MS,
  GG,
  INTRO,
  LULL_MS,
  PICTURE,
  REACT,
  SEASONAL,
  TOPICS,
  WELCOME,
  WELCOME_BACK,
  WELCOME_MS,
  startersFor,
  type Chip,
  type Phrase,
  type StarterInput,
  type StarterMessage,
} from "../../lib/conversation-starters";

// lib/conversation-starters.ts: the things to say over the message box, worked out in the browser from the room's
// messages and the clock. Here the strip is Yuki's, a guest; Alex is the host; Sam and Mia are other guests.
// October, so a silence opens on an autumn topic.

const NOW = Date.parse("2026-10-03T12:00:00Z");
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const people = [
  { _id: "alex", nickname: "Alex" },
  { _id: "yuki", nickname: "Yuki" },
  { _id: "sam", nickname: "Sam" },
  { _id: "mia", nickname: "Mia" },
];

let serial = 0;
/** A message `who` sent `ago` milliseconds before NOW */
const msg = (who: string, ago: number, text = "hello", more: Partial<StarterMessage> = {}): StarterMessage => ({
  _id: `m${++serial}`,
  senderId: who,
  kind: "text",
  text,
  createdAt: NOW - ago,
  ...more,
});
/** The line the server writes when `who` joins */
const joined = (who: string, ago: number, name: string) => msg(who, ago, `join:${name}`, { kind: "system" });

/** Yuki's strip in a room of these messages */
const strip = (messages: StarterMessage[], more: Partial<StarterInput> = {}) =>
  startersFor({ messages, people, meId: "yuki", hostId: "alex", now: NOW, month: 10, gameOn: false, ...more });

/** The chips as they read in English: an offered chip by its text, the game chip as 🎮 */
const words = (chips: readonly Chip[] | undefined) => chips?.map((c) => (c.kind === "game" ? "🎮" : (c.phrase?.en ?? c.text)));
const kinds = (chips: readonly Chip[] | undefined) => chips?.map((c) => c.kind);
const ens = (deck: readonly Phrase[], vars: Record<string, string> = {}) =>
  deck.map((p) => p.en.replace(/\{(\w+)\}/g, (_, slot: string) => vars[slot] ?? ""));

/** Yuki has said something before, long ago: she owes no introduction */
const yukiSpoke = () => msg("yuki", 20 * MINUTE, "hi!");

describe("someone else's message", () => {
  test("is answered with reactions for 30 seconds", () => {
    const sam = msg("sam", 5 * SECOND, "I went to Kyoto yesterday");
    const { starters, wakeAt } = strip([yukiSpoke(), sam]);
    expect(starters?.key).toBe(`said:${sam._id}`);
    expect(kinds(starters?.chips)).toEqual(["react", "react", "react", "react"]);
    expect(ens(REACT)).toEqual(expect.arrayContaining(words(starters?.chips)!));
    expect(wakeAt).toBe(sam.createdAt + LULL_MS);
  });

  test("that asks a yes-or-no question is answered yes or no, handing it back by name in Japanese", () => {
    const { starters } = strip([yukiSpoke(), msg("sam", 2 * SECOND, "Do you like sushi? 🍣")]);
    expect(kinds(starters?.chips)).toEqual(["answer", "answer", "answer"]);
    expect(words(starters?.chips)?.sort()).toEqual(ens(ANSWER_YES_NO).sort());
    expect(starters?.chips.map((c) => c.phrase?.ja)).toContain("うん！Samさんは？");
    expect(starters?.chips.map((c) => c.phrase?.romaji)).toContain("un! Sam san wa?");
  });

  test("that asks anything else is given time to think, or the question back", () => {
    const { starters } = strip([yukiSpoke(), msg("sam", 2 * SECOND, "What's your favorite anime?")]);
    expect(words(starters?.chips)?.sort()).toEqual(ens(ANSWER_OPEN, { name: "Sam" }).sort());
  });

  test.each([
    ["猫が好きですか", "Do you like cats?", "yes or no"],
    ["週末は何をしましたか？", "What did you do on the weekend?", "open"],
    ["元気ですか。", "How are you?", "open"],
    ["週末は何をしましたか😊", "What did you do on the weekend 😊", "open"],
  ])("in Japanese, %s, is read as a question off its English translation", (text, translatedText, which) => {
    const { starters } = strip([yukiSpoke(), msg("mia", 2 * SECOND, text, { processing: { translatedText } })]);
    expect(words(starters?.chips)?.sort()).toEqual((which === "open" ? ens(ANSWER_OPEN, { name: "Mia" }) : ens(ANSWER_YES_NO)).sort());
  });

  test.each(["Really?!", "本当に？！", "今日は静か", "Nice!"])("%s asks nothing: reactions", (text) => {
    expect(kinds(strip([yukiSpoke(), msg("mia", 2 * SECOND, text)]).starters?.chips)).toEqual(["react", "react", "react", "react"]);
  });

  test("a voice message is answered by its transcript", () => {
    const { starters } = strip([yukiSpoke(), msg("sam", 2 * SECOND, "Do you play games?", { kind: "audio" })]);
    expect(words(starters?.chips)?.sort()).toEqual(ens(ANSWER_YES_NO).sort());
  });

  test("a photo and a drawing are each answered with the reactions that fit them", () => {
    const photo = strip([yukiSpoke(), msg("sam", 2 * SECOND, undefined, { kind: "image" })]).starters;
    const drawing = strip([yukiSpoke(), msg("sam", 2 * SECOND, undefined, { kind: "drawing" })]).starters;
    const fit = (only: string) => ens(PICTURE.filter((p) => !p.only || p.only === only));
    expect(photo?.chips).toHaveLength(4);
    expect(fit("image")).toEqual(expect.arrayContaining(words(photo?.chips)!));
    expect(drawing?.chips).toHaveLength(4);
    expect(fit("drawing")).toEqual(expect.arrayContaining(words(drawing?.chips)!));
  });

  test("the suggestions that came with it come first, three at most and none blank, the deck's after them", () => {
    const sam = msg("sam", 2 * SECOND, "I went to Kyoto", { processing: { suggestions: ["Sounds good!", "  ", "👍", "Let's go", "One too many"] } });
    const { starters } = strip([yukiSpoke(), sam]);
    expect(words(starters?.chips)?.slice(0, 3)).toEqual(["Sounds good!", "👍", "Let's go"]);
    expect(kinds(starters?.chips)).toEqual(["offered", "offered", "offered", "react", "react", "react"]);
  });

  test("Yuki's introduction comes before the answers, while she has said nothing in the room", () => {
    const { starters } = strip([msg("sam", 2 * SECOND, "I went to Kyoto")]);
    expect(kinds(starters?.chips)).toEqual(["intro", "react", "react", "react", "react"]);
    expect(ens(INTRO, { me: "Yuki" })).toContain(words(starters?.chips)![0]);
  });

  test("then a silence: after 30 seconds the strip turns to topics", () => {
    const sam = msg("sam", 2 * SECOND, "I went to Kyoto");
    const { starters } = strip([yukiSpoke(), sam], { now: sam.createdAt + LULL_MS });
    expect(starters?.key).toBe(`lull:${sam._id}`);
    expect(kinds(starters?.chips)).toEqual(["topic", "topic", "topic"]);
  });
});

describe("Yuki's own message", () => {
  test("leaves the others the floor: nothing, until the silence after it", () => {
    const yuki = msg("yuki", 5 * SECOND, "I like ramen");
    expect(strip([msg("sam", MINUTE, "hi"), yuki])).toEqual({ starters: null, wakeAt: yuki.createdAt + LULL_MS });
  });

  test("three of them within two minutes: nothing at all, until the first of the three is two minutes old", () => {
    const first = msg("yuki", 100 * SECOND, "one");
    const messages = [first, msg("yuki", 50 * SECOND, "two"), msg("yuki", 10 * SECOND, "three"), msg("sam", 5 * SECOND, "Wow, Yuki!")];
    expect(strip(messages)).toEqual({ starters: null, wakeAt: first.createdAt + CHATTY_MS });
    expect(strip(messages, { now: first.createdAt + CHATTY_MS }).starters).not.toBeNull();
  });
});

describe("someone arriving", () => {
  test("a newcomer is welcomed by name for a minute, with Yuki's introduction if she owes one", () => {
    const mia = joined("mia", 10 * SECOND, "Mia");
    const { starters, wakeAt } = strip([msg("sam", 5 * MINUTE), mia]);
    expect(starters?.key).toBe(`welcome:${mia._id}`);
    expect(kinds(starters?.chips)).toEqual(["welcome", "welcome", "welcome", "intro"]);
    expect(ens(WELCOME, { name: "Mia" })).toEqual(expect.arrayContaining(words(starters?.chips)!.slice(0, 3)));
    expect(wakeAt).toBe(mia.createdAt + WELCOME_MS);
  });

  test("somebody who had talked here before is welcomed back", () => {
    const { starters } = strip([yukiSpoke(), msg("mia", 10 * MINUTE, "bye!"), joined("mia", 10 * SECOND, "Mia")]);
    expect(words(starters?.chips)?.sort()).toEqual(ens(WELCOME_BACK, { name: "Mia" }).sort());
  });

  test("somebody the page does not know yet is welcomed by the name on the line", () => {
    const { starters } = strip([yukiSpoke(), joined("zoe", 10 * SECOND, "Zoe")]);
    expect(words(starters?.chips)?.every((w) => w?.includes("Zoe"))).toBe(true);
  });

  test("the host's arrivals, the host's phone coming and going, are nobody's to welcome", () => {
    const yuki = yukiSpoke();
    const { starters } = strip([yuki, joined("alex", 10 * SECOND, "Alex")]);
    expect(starters?.key).toBe(`lull:${yuki._id}`);
  });

  test("Yuki herself: introductions the first time, I'm back after that", () => {
    const first = strip([msg("sam", 5 * MINUTE), joined("yuki", 5 * SECOND, "Yuki")]).starters;
    expect(words(first?.chips)?.sort()).toEqual(ens(INTRO, { me: "Yuki" }).sort());
    const again = strip([yukiSpoke(), joined("yuki", 5 * SECOND, "Yuki")]).starters;
    expect(words(again?.chips)?.sort()).toEqual(ens(BACK).sort());
  });
});

describe("the end of a game", () => {
  test.each(["game_summary:", "emoji_match_summary:", "emoji_bingo_summary:", "emoji_match_complete:", "truth_or_dare_summary:"])(
    "%s is talked over for a minute",
    (prefix) => {
      const over = msg("alex", 5 * SECOND, `${prefix}{}`, { kind: "system" });
      const { starters, wakeAt } = strip([yukiSpoke(), over]);
      expect(starters?.key).toBe(`gg:${over._id}`);
      expect(ens(GG)).toEqual(expect.arrayContaining(words(starters?.chips)!));
      expect(starters?.chips).toHaveLength(3);
      expect(wakeAt).toBe(over.createdAt + WELCOME_MS);
    },
  );

  test("a game's other lines are no happening: the silence before them goes on", () => {
    const yuki = yukiSpoke();
    expect(strip([yuki, msg("alex", 5 * SECOND, "game:started", { kind: "system" })]).starters?.key).toBe(`lull:${yuki._id}`);
  });
});

describe("a silence", () => {
  test("offers three topics, the season's first, and after 90 seconds a game as well", () => {
    const sam = msg("sam", 40 * SECOND, "lol");
    const early = strip([yukiSpoke(), sam]);
    expect(kinds(early.starters?.chips)).toEqual(["topic", "topic", "topic"]);
    const autumn = SEASONAL.filter((p) => p.months.includes(10)).map((p) => p.en);
    expect(autumn).toContain(words(early.starters?.chips)![0]);
    expect(ens(TOPICS)).toEqual(expect.arrayContaining(words(early.starters?.chips)!.slice(1)));
    expect(early.wakeAt).toBe(sam.createdAt + GAME_NUDGE_MS);

    const late = strip([yukiSpoke(), sam], { now: sam.createdAt + GAME_NUDGE_MS });
    expect(kinds(late.starters?.chips)).toEqual(["topic", "topic", "topic", "game"]);
    expect(late.starters?.key).toBe(early.starters?.key);
    expect(late.wakeAt).toBeNull();
  });

  test("in a month without a season's topic, three of the deck's", () => {
    const { starters } = strip([yukiSpoke(), msg("sam", 40 * SECOND)], { month: 5 });
    expect(ens(TOPICS)).toEqual(expect.arrayContaining(words(starters?.chips)!));
  });

  test("an empty room: Yuki's introduction, topics and a game straight away", () => {
    const { starters, wakeAt } = strip([]);
    expect(starters?.key).toBe("lull:");
    expect(kinds(starters?.chips)).toEqual(["intro", "topic", "topic", "topic", "game"]);
    expect(wakeAt).toBeNull();
  });

  test("each shuffle shows other topics", () => {
    const messages = [yukiSpoke(), msg("sam", 40 * SECOND)];
    const shown = [0, 1, 2].map((shuffle) => words(strip(messages, { shuffle }).starters?.chips)!);
    expect(shown[0][0]).not.toBe(shown[1][0]);
    expect(shown[1].slice(1)).not.toEqual(expect.arrayContaining([shown[0][1]]));
    expect(shown[2].slice(1)).not.toEqual(expect.arrayContaining([shown[1][1]]));
  });
});

describe("a game on", () => {
  test("offers nothing: the game does the talking", () => {
    expect(strip([yukiSpoke(), msg("sam", 2 * SECOND, "Is it a cat?")], { gameOn: true })).toEqual({ starters: null, wakeAt: null });
    expect(strip([], { gameOn: true })).toEqual({ starters: null, wakeAt: null });
  });

  test("except answers to the message Yuki is replying to", () => {
    const sam = msg("sam", 10 * MINUTE, "Do you like natto?");
    expect(kinds(strip([yukiSpoke(), sam], { gameOn: true, replyTo: sam }).starters?.chips)).toEqual(["answer", "answer", "answer"]);
  });
});

describe("a reply", () => {
  test("the chips answer the message Yuki is replying to, however old, and the clock changes nothing", () => {
    const sam = msg("sam", 10 * MINUTE, "Do you like natto?", { processing: { suggestions: ["Yes!"] } });
    const { starters, wakeAt } = strip([yukiSpoke(), sam, msg("mia", 2 * SECOND, "lol")], { replyTo: sam });
    expect(starters?.key).toBe(`reply:${sam._id}`);
    expect(kinds(starters?.chips)).toEqual(["offered", "answer", "answer", "answer"]);
    expect(wakeAt).toBeNull();
  });

  test("to her own message, or to a line of the room's, changes nothing", () => {
    const yuki = msg("yuki", 10 * MINUTE, "Do you like natto?");
    const line = joined("mia", 10 * MINUTE, "Mia");
    const sam = msg("sam", 2 * SECOND, "hey");
    const plain = strip([yuki, line, sam]);
    expect(strip([yuki, line, sam], { replyTo: yuki })).toEqual(plain);
    expect(strip([yuki, line, sam], { replyTo: line })).toEqual(plain);
  });
});

describe("what was said lately", () => {
  test("is not offered again, in either language", () => {
    const question = () => msg("sam", 2 * SECOND, "What's your favorite anime?");
    const answered = strip([yukiSpoke(), msg("mia", 10 * SECOND, "うーん、むずかしい"), question()]).starters;
    expect(words(answered?.chips)).toHaveLength(2);
    expect(words(answered?.chips)).not.toContain("Hmm, that's a hard one 😅");
  });

  test("a topic somebody asked is offered by no shuffle", () => {
    const messages = [yukiSpoke(), msg("sam", 40 * SECOND, "cats or dogs??")];
    for (let shuffle = 0; shuffle < TOPICS.length; shuffle++) {
      expect(words(strip(messages, { shuffle }).starters?.chips)).not.toContain("Cats or dogs?");
    }
  });
});

describe("the same moment", () => {
  test("shows the same chips each time it is drawn", () => {
    const messages = [yukiSpoke(), msg("sam", 2 * SECOND, "I went to Kyoto")];
    expect(strip(messages)).toEqual(strip(messages));
  });

  test("shows other people other chips", () => {
    // Both have talked already, so that neither is offered an introduction with their own name in it
    const before = [msg("yuki", 20 * MINUTE, "hi!"), msg("mia", 20 * MINUTE, "hey!")];
    const latest = Array.from({ length: 8 }, (_, i) => msg("sam", 2 * SECOND, `message ${i}`));
    const shown = (meId: string) =>
      latest.map((m) => words(startersFor({ messages: [...before, m], people, meId, now: NOW, month: 10, gameOn: false }).starters?.chips));
    expect(shown("yuki")).not.toEqual(shown("mia"));
  });

  test("counts from a message's own time when the clock reads earlier", () => {
    const ahead = msg("sam", -5 * SECOND, "I went to Kyoto");
    const { starters, wakeAt } = strip([yukiSpoke(), ahead]);
    expect(starters?.key).toBe(`said:${ahead._id}`);
    expect(wakeAt).toBe(ahead.createdAt + LULL_MS);
  });
});

describe("the deck", () => {
  const decks = { REACT, PICTURE, ANSWER_YES_NO, ANSWER_OPEN, WELCOME, WELCOME_BACK, INTRO, BACK, GG, TOPICS, SEASONAL };
  const slots = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

  test.each(Object.entries(decks))("%s: every phrase in both languages and romaji, none twice", (_, deck) => {
    const phrases = deck as readonly Phrase[];
    expect(phrases.length).toBeGreaterThan(0);
    for (const phrase of phrases) {
      expect(phrase.en.trim()).not.toBe("");
      expect(phrase.ja.trim()).not.toBe("");
      // Lowercase Hepburn without macrons, once the names and emoji are out
      const romaji = phrase.romaji.replace(/\{\w+\}/g, "").replace(/\p{Extended_Pictographic}/gu, "");
      expect(romaji).toMatch(/^[a-z0-9 ,.!?'-]+$/);
      expect(slots(phrase.romaji)).toEqual(slots(phrase.ja));
      expect(slots(phrase.en).every((slot) => phrase.ja.includes(slot))).toBe(true);
    }
    expect(new Set(phrases.map((p) => p.en)).size).toBe(phrases.length);
  });

  test("the topics of the seasons are in season at least one month each, and no topic is asked twice", () => {
    expect(SEASONAL.every((p) => p.months.length > 0 && p.months.every((m) => m >= 1 && m <= 12))).toBe(true);
    const all = [...TOPICS, ...SEASONAL].map((p) => p.en);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("replies the host's phone wrote for a message", () => {
  const idea = (en: string, ja: string, romaji = ""): Phrase => ({ en, ja, romaji });
  const written = [idea("I love it!", "大好き！", "daisuki!"), idea("What kind?", "どんなの？", "donna no?"), idea("Not really", "あんまり", "anmari"), idea("One too many", "多すぎ", "oosugi")];

  test("come first, three at most, in place of the suggestions that came with it", () => {
    const sam = msg("sam", 2 * SECOND, "Do you like ramen?", { processing: { suggestions: ["Yes!"] } });
    const { starters } = strip([yukiSpoke(), sam], { ideas: { [sam._id]: written } });
    expect(kinds(starters?.chips)).toEqual(["offered", "offered", "offered", "answer", "answer", "answer"]);
    expect(starters?.chips.slice(0, 3).map((c) => c.phrase)).toEqual(written.slice(0, 3));
  });

  test("answer the message Yuki is replying to as well", () => {
    const sam = msg("sam", 10 * MINUTE, "Do you like ramen?");
    const { starters } = strip([yukiSpoke(), sam, msg("mia", 2 * SECOND, "lol")], { replyTo: sam, ideas: { [sam._id]: written } });
    expect(starters?.chips[0].phrase).toEqual(written[0]);
  });

  test("one blank in either language, or said lately, is passed over; none left, the suggestions that came with it", () => {
    const sam = msg("sam", 2 * SECOND, "I went to Kyoto", { processing: { suggestions: ["Yes!"] } });
    const mia = msg("mia", 5 * SECOND, "大好き！");
    const some = strip([yukiSpoke(), mia, sam], { ideas: { [sam._id]: [written[0], idea(" ", "空"), idea("Wow", ""), written[1]] } }).starters;
    expect(some?.chips.filter((c) => c.kind === "offered").map((c) => c.phrase)).toEqual([written[1]]);
    const none = strip([yukiSpoke(), mia, sam], { ideas: { [sam._id]: [written[0]] } }).starters;
    expect(words(none?.chips)?.[0]).toBe("Yes!");
  });

  test("for another message change nothing", () => {
    const messages = [yukiSpoke(), msg("sam", 2 * SECOND, "I went to Kyoto")];
    expect(strip(messages, { ideas: { elsewhere: written } })).toEqual(strip(messages));
  });
});

// The iPhone app's strip (apps/ios/Services/Processing/ConversationStarters.swift) is this file's rules in Swift. Its
// deck and the cases its tests run (`swift test` in apps/ios) are written from here as file snapshots: change the
// deck or the rules, then run this file with -u, and the Swift copy has to give what the cases now say
describe("the iPhone app's copy", () => {
  /** A string as a Swift literal. JSON writes \uXXXX for a control character, which Swift would not read alike */
  const swift = (text: string) => {
    const literal = JSON.stringify(text);
    expect(literal).not.toMatch(/\\u/);
    return literal;
  };
  const phrase = (p: Phrase) => `StarterPhrase(en: ${swift(p.en)}, ja: ${swift(p.ja)}, romaji: ${swift(p.romaji)})`;
  const list = (name: string, items: readonly string[]) => `        ${name}: [\n${items.map((item) => `            ${item},`).join("\n")}\n        ]`;

  test("ships this deck", async () => {
    const lists = [
      list("react", REACT.map(phrase)),
      list("picture", PICTURE.map((p) => `PicturePhrase(phrase: ${phrase(p)}, only: ${p.only ? swift(p.only) : "nil"})`)),
      list("answerYesNo", ANSWER_YES_NO.map(phrase)),
      list("answerOpen", ANSWER_OPEN.map(phrase)),
      list("welcome", WELCOME.map(phrase)),
      list("welcomeBack", WELCOME_BACK.map(phrase)),
      list("intro", INTRO.map(phrase)),
      list("back", BACK.map(phrase)),
      list("gg", GG.map(phrase)),
      list("topics", TOPICS.map(phrase)),
      list("seasonal", SEASONAL.map((p) => `SeasonalPhrase(phrase: ${phrase(p)}, months: [${p.months.join(", ")}])`)),
    ];
    const source = [
      "// Written by apps/web/tests/web/conversation-starters.test.ts from the deck in apps/web/lib/conversation-starters.ts.",
      "// Change the deck there and run that test with -u to write this file again.",
      "",
      "extension StarterDeck {",
      "    static let shipped = StarterDeck(",
      lists.join(",\n"),
      "    )",
      "}",
      "",
    ].join("\n");
    await expect(source).toMatchFileSnapshot("../../../ios/Services/Processing/ConversationDeck.swift");
  });

  test("decides as this file does in these moments", async () => {
    const cases = moments().map((input) => JSON.stringify({ input, output: startersFor(input) }));
    await expect(`${cases.join("\n")}\n`).toMatchFileSnapshot("../../../ios/Tests/EnchattoTextTests/StarterCases.jsonl");
  });

  test("whose moments reach every way the strip can go", () => {
    const outputs = moments().map(startersFor);
    const keys = new Set(outputs.map(({ starters }) => starters?.key.replace(/:.*/, "") ?? "none"));
    expect([...keys].sort()).toEqual(["gg", "intro", "lull", "none", "reply", "said", "welcome"]);
    const chipKinds = new Set(outputs.flatMap(({ starters }) => starters?.chips.map((c) => (c.phrase && c.kind === "offered" ? "idea" : c.kind)) ?? []));
    expect([...chipKinds].sort()).toEqual(["answer", "game", "gg", "idea", "intro", "offered", "react", "topic", "welcome"]);
  });
});

/**
 * Rooms made up from a seeded random number, the same ones every run: messages of every kind, among them questions
 * that are and are not, in either language and with marks of either width; joins, games ending, the clock at either
 * side of each boundary and before the newest message, replies, games on, shuffles, months, and written replies
 */
function moments(): StarterInput[] {
  let seed = 20261003;
  // mulberry32
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const any = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
  const said: readonly (readonly [string | undefined, string?])[] = [
    ["Do you like ramen?", "ラーメン好き？"],
    ["What did you eat?", "何を食べた？"],
    ["ラーメン好きですか？", "Do you like ramen?"],
    ["猫が好きですか", "Do you like cats?"],
    ["元気ですか。", "How are you?"],
    ["そうかな", "I wonder"],
    ["行きましたか…", "Did you go..."],
    ["今日は静か", "It's quiet today"],
    ["Really?!", "本当に？！"],
    ["本当に？！", "Really?!"],
    ["Dog?", "犬？"],
    ["Isn't it great?", "すごくない？"],
    ["Can you swim? 🏊", "泳げる？🏊"],
    ["Are you OK??", "大丈夫？？"],
    ["DOES IT HURT?", "痛い？"],
    ["do_you know?"],
    ["I went to Kyoto", "京都に行った"],
    ["Nice!", "いいね！"],
    ["いいね！", "Nice!"],
    ["Haha 😂", "ウケる😂"],
    ["うーん、むずかしい", "Hmm, it's hard"],
    ["cats or dogs??", "猫派？犬派？"],
    ["Where are you from?"],
    ["週末は何をしましたか😊", "What did you do on the weekend 😊"],
    ["Hi everyone! 👋", "みんな、こんにちは！👋"],
    ["  "],
    [undefined],
  ];
  const ideas: readonly (readonly Phrase[])[] = [
    [
      { en: "I love it!", ja: "大好き！", romaji: "daisuki!" },
      { en: "What kind?", ja: "どんなの？", romaji: "donna no?" },
      { en: "Not really", ja: "あんまり", romaji: "anmari" },
      { en: "One more", ja: "もう一つ", romaji: "mou hitotsu" },
    ],
    [
      { en: "Nice!", ja: "いいね！", romaji: "ii ne!" },
      { en: " ", ja: "空", romaji: "" },
      { en: "Wow", ja: "  ", romaji: "" },
    ],
    [],
  ];
  const overs = ["game_summary:{}", "emoji_match_summary:{}", "emoji_bingo_summary:{}", "emoji_match_complete:{}", "truth_or_dare_summary:{}"];
  const cases: StarterInput[] = [];
  for (let n = 0; n < 150; n++) {
    const meId = random() < 0.15 ? "alex" : "yuki";
    const messages: StarterMessage[] = [];
    let at = NOW - 10 * MINUTE;
    const count = Math.floor(random() * 7);
    for (let i = 0; i < count; i++) {
      at += Math.floor(random() * 50) * SECOND;
      const base = { _id: `m${n}-${i}`, senderId: any(["yuki", "yuki", "sam", "mia", "alex", "zoe"]), createdAt: at };
      const roll = random();
      if (roll < 0.5) {
        const [text, translatedText] = any(said);
        messages.push({ ...base, kind: "text", text, processing: translatedText ? { translatedText } : undefined });
      } else if (roll < 0.58) {
        const [text, translatedText] = any(said);
        messages.push({ ...base, kind: "text", text, processing: { translatedText, suggestions: ["こんにちは！", "  ", "👍", "Let's go", "One too many"] } });
      } else if (roll < 0.66) {
        messages.push({ ...base, kind: any(["image", "drawing"]) });
      } else if (roll < 0.72) {
        messages.push({ ...base, kind: "audio", text: any(said)[0] });
      } else if (roll < 0.84) {
        const who = base.senderId === "zoe" ? "Zoe" : (people.find((p) => p._id === base.senderId)?.nickname ?? "?");
        messages.push({ ...base, kind: "system", text: `join:${who}` });
      } else if (roll < 0.92) {
        messages.push({ ...base, kind: "system", text: any(overs) });
      } else {
        messages.push({ ...base, kind: "system", text: "game:started" });
      }
    }
    // Now and then she has been chatty
    if (random() < 0.1) {
      for (let i = 0; i < 3; i++) {
        at += Math.floor(random() * 30) * SECOND;
        messages.push({ _id: `m${n}-me${i}`, senderId: meId, kind: "text", text: "and another thing", createdAt: at });
      }
    }
    const newest = messages.at(-1);
    cases.push({
      messages,
      people: random() < 0.1 ? people.filter((p) => p._id !== meId) : people,
      meId,
      hostId: random() < 0.9 ? "alex" : undefined,
      replyTo: messages.length > 0 && random() < 0.2 ? any(messages) : null,
      now: (newest?.createdAt ?? NOW) + any([-5, 0, 2, 29, 30, 31, 59, 60, 61, 89, 90, 91, 130, 400]) * SECOND,
      month: 1 + Math.floor(random() * 12),
      gameOn: random() < 0.12,
      shuffle: Math.floor(random() * 4),
      ideas: newest && random() < 0.35 ? { [newest._id]: any(ideas) } : undefined,
    });
  }
  return cases;
}
