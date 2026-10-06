import type { FunctionReturnType } from "convex/server";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { EmojiMatchGame } from "@/components/emoji-match-game";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// The three screens of Emoji Match on the web (components/emoji-match-game.tsx): the lobby, the board and the
// results, as static markup, each read as a guest who chose Japanese reads it and as one who chose English does.
// What is held: the Japanese guest reads no English but the players' names and the words on the cards, which are
// the game, and the English guest reads the words written here.
// No effect runs in a static render, so the board is read before its countdown is drawn, and nothing is tapped.

type MatchGame = NonNullable<FunctionReturnType<typeof api.emojiMatch.getActiveEmojiMatch>>;
type PID = Id<"participants">;

const ALEX = "alex" as PID;
const YUKI = "yuki" as PID;
const SAM = "sam" as PID;
const NOW = Date.parse("2026-10-03T12:00:00Z");

const seat = (participantId: PID, nickname: string, avatarValue: string, pairs = 0, turns = 0): MatchGame["players"][number] => ({
  participantId,
  nickname,
  avatarValue,
  joinedAt: NOW,
  isActive: true,
  score: pairs,
  turns,
});

/** The lobby Alex opened, which Yuki has joined. A game past the lobby adds its board, its turns and its scores */
const lobby = (extra: Partial<MatchGame> = {}): MatchGame => ({
  _id: "match1" as Id<"emojiMatchGames">,
  _creationTime: NOW,
  roomId: "room1" as Id<"rooms">,
  status: "lobby",
  hostParticipantId: ALEX,
  players: [seat(ALEX, "Alex", "fox"), seat(YUKI, "Yuki", "cat")],
  turnOrder: [],
  board: [],
  selectedCardIds: [],
  matchedPairCount: 0,
  totalPairs: 0,
  boardRows: 0,
  boardCols: 0,
  mismatchRevealMs: 1200,
  createdAt: NOW,
  ...extra,
});

// Eight cards as dealt: each pair is one emoji, once with its English word and once with its Japanese one
// prettier-ignore
const DEALT: Array<[pair: number, emoji: string, label: string]> = [
  [0, "☀️", "Sun"], [1, "🐝", "はち"], [0, "☀️", "たいよう"], [2, "☁️", "Cloud"],
  [1, "🐝", "Bee"], [3, "🐼", "パンダ"], [2, "☁️", "くも"], [3, "🐼", "Panda"],
];
const CARD_WORDS = DEALT.map(([, , label]) => label);
/** The board with the cards of `matchedPairs` found */
const board = (matchedPairs: number[]): MatchGame["board"] =>
  DEALT.map(([pair, value, label], i) => ({
    cardId: `card_${i}`,
    pairKey: `pair_${pair}`,
    content: { kind: "emoji", value, label },
    isMatched: matchedPairs.includes(pair),
    isRevealed: matchedPairs.includes(pair),
  }));
const dealt = { turnOrder: [ALEX, YUKI], totalPairs: 4, boardRows: 2, boardCols: 4, startedAt: NOW, turnTimeoutMs: 15000, idleTimeouts: 0 };

/** The game in play, one pair found by Alex, with `turn` to play */
const playing = (turn: PID) =>
  lobby({
    ...dealt,
    status: "active",
    players: [seat(ALEX, "Alex", "fox", 1, 1), seat(YUKI, "Yuki", "cat", 0, 1)],
    currentTurnParticipantId: turn,
    board: board([0]),
    matchedPairCount: 1,
    turnStartedAt: NOW,
  });

/** The game over, with `players` as they finished and `result` as the server wrote it */
const over = (players: MatchGame["players"], result: NonNullable<MatchGame["result"]>) =>
  lobby({ ...dealt, status: result.endReason === "canceled" ? "canceled" : "completed", players, board: board([0, 1, 2, 3]), matchedPairCount: 4, endedAt: NOW, result });

const nothing = () => {};

/** The screen of `game` in the page of `viewer`, who reads `lang` */
const screen = (game: MatchGame, viewer: PID, lang: "en" | "ja") =>
  renderToStaticMarkup(
    <EmojiMatchGame
      game={game}
      participants={[]}
      myParticipantId={viewer}
      isHost={false}
      lang={lang}
      onJoinLobby={nothing}
      onLeaveLobby={nothing}
      onStartGame={nothing}
      onFlipCard={nothing}
      onResolveMismatch={nothing}
      onTimeoutTurn={nothing}
      onCancelGame={nothing}
      onPlayAgain={nothing}
      onClose={nothing}
      onMinimize={nothing}
    />
  );

/** What a reader sees of `html`: its text, without the tags and without the style sheet the board carries */
const words = (html: string) =>
  html
    .replace(/<style>.*?<\/style>/gs, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** The runs of Latin letters in `text` that are not among `allowed` */
const english = (text: string, allowed: string[]) => (text.match(/[A-Za-z]+/g) ?? []).filter((run) => !allowed.includes(run));

/**
 * The cards on the board in play as a reader meets them in the markup: each one's back, then the word on its face.
 * The pair Alex found has left the board
 */
const CARDS = DEALT.filter(([pair]) => pair !== 0)
  .map(([, , word]) => `? ${word}`)
  .join(" ");

/**
 * `game` in `viewer`'s page reads `en` for an English guest and `ja` for a Japanese one, who meets no English in it
 * but the two players' names and the words on the cards.
 */
function reads(game: MatchGame, viewer: PID, { en, ja }: { en: string; ja: string }) {
  expect(words(screen(game, viewer, "en"))).toBe(en);
  const japanese = words(screen(game, viewer, "ja"));
  expect(japanese).toBe(ja);
  expect(english(japanese, ["Alex", "Yuki", ...CARD_WORDS])).toEqual([]);
}

describe("the lobby", () => {
  const ABOUT = {
    en: "Emoji Match Match English and Japanese words! Flip cards to pair translations. Players (2/30) Alex HOST Yuki",
    ja: "絵文字マッチ 英語と日本語のことばを合わせよう！カードをめくって、同じ意味のペアを探してね。 プレイヤー (2/30) Alex ホスト Yuki",
  };

  test("for someone in the room who has not joined it: Join Game and Close", () => {
    reads(lobby(), SAM, { en: `${ABOUT.en} Join Game Close`, ja: `${ABOUT.ja} 参加する 閉じる` });
  });

  test("for a player who has joined it: Leave Lobby", () => {
    reads(lobby(), YUKI, { en: `${ABOUT.en} Leave Lobby`, ja: `${ABOUT.ja} ロビーを出る` });
  });

  test("for the player who opened it: Start Game", () => {
    reads(lobby(), ALEX, { en: `${ABOUT.en} Start Game`, ja: `${ABOUT.ja} ゲーム開始` });
  });
});

describe("the board", () => {
  test("for the player whose turn it is: the game's name, the pairs found, both scores, and the call to find a pair", () => {
    reads(playing(YUKI), YUKI, {
      en: `– Emoji Match 1/4 pairs Alex 1 turn 1 YOU 1 turn 0 Your turn! Find a pair ${CARDS}`,
      ja: `– 絵文字マッチ 1/4 ペア Alex 1回 1 あなた 1回 0 あなたの番！ ペアを探そう ${CARDS}`,
    });
  });

  test("for a player who waits: whose turn it is, as one sentence in either language", () => {
    reads(playing(ALEX), YUKI, {
      en: `– Emoji Match 1/4 pairs Alex 1 turn 1 YOU 1 turn 0 Alex's turn ${CARDS}`,
      ja: `– 絵文字マッチ 1/4 ペア Alex 1回 1 あなた 1回 0 Alexの番 ${CARDS}`,
    });
  });
});

describe("the results", () => {
  const alexWon = over([seat(ALEX, "Alex", "fox", 3, 4), seat(YUKI, "Yuki", "cat", 1, 3)], { winnerParticipantIds: [ALEX], isTie: false, endReason: "all_matched" });

  test("for a player who came second: the winner's name in the headline, as one sentence in either language", () => {
    reads(alexWon, YUKI, {
      en: "Alex Won! Alex 4/3/4 3 2 Yuki (you) 3/1/4 1 Exit Play Again",
      ja: "Alexの勝ち！ Alex 4/3/4 3 2 Yuki (あなた) 3/1/4 1 閉じる もう一回",
    });
  });

  test("for the winner: You Won!", () => {
    reads(alexWon, ALEX, {
      en: "You Won! Alex (you) 4/3/4 3 2 Yuki 3/1/4 1 Exit Play Again",
      ja: "あなたの勝ち！ Alex (あなた) 4/3/4 3 2 Yuki 3/1/4 1 閉じる もう一回",
    });
  });

  test("a tie", () => {
    const tied = over([seat(ALEX, "Alex", "fox", 2, 4), seat(YUKI, "Yuki", "cat", 2, 4)], { winnerParticipantIds: [ALEX, YUKI], isTie: true, endReason: "all_matched" });
    reads(tied, YUKI, {
      en: "It's a Tie! Alex 4/2/4 2 Yuki (you) 4/2/4 2 Exit Play Again",
      ja: "引き分け！ Alex 4/2/4 2 Yuki (あなた) 4/2/4 2 閉じる もう一回",
    });
  });

  test("a game played alone", () => {
    const alone = over([seat(YUKI, "Yuki", "cat", 4, 9)], { winnerParticipantIds: [YUKI], isTie: false, endReason: "all_matched" });
    reads(alone, YUKI, {
      en: "Board Cleared! Yuki (you) 9/4/4 4 Exit Play Again",
      ja: "ぜんぶクリア！ Yuki (あなた) 9/4/4 4 閉じる もう一回",
    });
  });

  test("a game the host called off", () => {
    const calledOff = over([seat(ALEX, "Alex", "fox", 1, 1), seat(YUKI, "Yuki", "cat", 0, 1)], { winnerParticipantIds: [], isTie: false, endReason: "canceled" });
    reads(calledOff, YUKI, {
      en: "Game Canceled Alex 1/1/4 1 2 Yuki (you) 1/0/4 0 Exit Play Again",
      ja: "ゲーム中止 Alex 1/1/4 1 2 Yuki (あなた) 1/0/4 0 閉じる もう一回",
    });
  });

  test("a winner whose name holds a dollar sign is named as written", () => {
    const cash = over([seat(ALEX, "Ca$$h $& Co", "fox", 3, 4), seat(YUKI, "Yuki", "cat", 1, 3)], { winnerParticipantIds: [ALEX], isTie: false, endReason: "all_matched" });
    expect(words(screen(cash, YUKI, "en"))).toMatch(/^Ca\$\$h \$& Co Won! /);
    expect(words(screen(cash, YUKI, "ja"))).toMatch(/^Ca\$\$h \$& Coの勝ち！ /);
  });
});
