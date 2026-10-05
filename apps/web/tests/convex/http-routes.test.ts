// convex/http.ts as a whole: which HTTP routes there are. The iPhone app reaches the backend through these routes
// and nothing else, and an installed build keeps calling the paths and methods it was built with (a deploy does
// not update it), so a route that goes missing, is renamed or changes its method breaks phones already in use.
// What each route does with a request is tested in the file for its area.
import { expect, test } from "vitest";
import http from "../../convex/http";
import { newBackend } from "./setup";

// Every route: its method, then its path. A route that is added, renamed or removed on purpose changes its line
// here in the same change. The two OPTIONS lines answer a browser's preflight: a drawing and a Truth or Dare
// answer are the two things the web's room page posts to a route, as the iPhone app does
const ROUTES = [
  "OPTIONS /api/messages/send-drawing",
  "OPTIONS /api/truth-or-dare/submit-response",
  "POST /api/emoji-bingo/active",
  "POST /api/emoji-bingo/cancel",
  "POST /api/emoji-bingo/claim-bingo",
  "POST /api/emoji-bingo/create-lobby",
  "POST /api/emoji-bingo/join",
  "POST /api/emoji-bingo/leave",
  "POST /api/emoji-bingo/mark-cell",
  "POST /api/emoji-bingo/play-again",
  "POST /api/emoji-bingo/roll",
  "POST /api/emoji-bingo/start",
  "POST /api/emoji-bingo/state",
  "POST /api/emoji-match/active",
  "POST /api/emoji-match/cancel",
  "POST /api/emoji-match/create-lobby",
  "POST /api/emoji-match/flip-card",
  "POST /api/emoji-match/join",
  "POST /api/emoji-match/leave",
  "POST /api/emoji-match/play-again",
  "POST /api/emoji-match/resolve-mismatch",
  "POST /api/emoji-match/start",
  "POST /api/emoji-match/state",
  "POST /api/emoji-match/timeout-turn",
  "POST /api/emojifyr/active-session",
  "POST /api/emojifyr/advance-round",
  "POST /api/emojifyr/cancel",
  "POST /api/emojifyr/current-round",
  "POST /api/emojifyr/game-state",
  "POST /api/emojifyr/generate-emoji-clue",
  "POST /api/emojifyr/guesses",
  "POST /api/emojifyr/reveal",
  "POST /api/emojifyr/start",
  "POST /api/emojifyr/submit-emoji-clue",
  "POST /api/emojifyr/submit-guess",
  "POST /api/emojifyr/submit-sentence",
  "POST /api/emojifyr/update-sentence",
  "POST /api/games/active-session",
  "POST /api/games/cancel",
  "POST /api/games/deal-teams",
  "POST /api/games/latest-session",
  "POST /api/games/my-active-step",
  "POST /api/games/replay",
  "POST /api/games/start",
  "POST /api/games/status",
  "POST /api/games/submit-step",
  "POST /api/messages/delete",
  "POST /api/messages/list",
  "POST /api/messages/mark-failed",
  "POST /api/messages/pending",
  "POST /api/messages/send-audio",
  "POST /api/messages/send-drawing",
  "POST /api/messages/send-image",
  "POST /api/messages/send-text",
  "POST /api/messages/submit-processed",
  "POST /api/messages/transcribe",
  "POST /api/participants/kick",
  "POST /api/participants/set-language",
  "POST /api/participants/set-online",
  "POST /api/participants/set-typing",
  "POST /api/reactions/add",
  "POST /api/reactions/remove",
  "POST /api/reactions/room-summaries",
  "POST /api/rooms/background",
  "POST /api/rooms/close",
  "POST /api/rooms/create",
  "POST /api/rooms/push-token",
  "POST /api/rooms/state",
  "POST /api/storage/generate-upload-url",
  "POST /api/truth-or-dare/ack-round-break",
  "POST /api/truth-or-dare/active",
  "POST /api/truth-or-dare/advance-turn",
  "POST /api/truth-or-dare/create",
  "POST /api/truth-or-dare/end",
  "POST /api/truth-or-dare/host-skip-turn",
  "POST /api/truth-or-dare/skip-turn",
  "POST /api/truth-or-dare/submit-choice",
  "POST /api/truth-or-dare/submit-rating",
  "POST /api/truth-or-dare/submit-response",
  "POST /api/truth-or-dare/submit-translation",
  "POST /api/word-rush/answer",
  "POST /api/word-rush/cancel",
  "POST /api/word-rush/create-lobby",
  "POST /api/word-rush/hint",
  "POST /api/word-rush/join",
  "POST /api/word-rush/leave",
  "POST /api/word-rush/play-again",
  "POST /api/word-rush/skip",
  "POST /api/word-rush/skip-mic",
  "POST /api/word-rush/start",
  "POST /api/word-rush/state",
  "POST /api/word-rush/submit-clip",
  "POST /api/word-rush/submit-teach-clip",
  "POST /api/word-rush/update-settings",
  "POST /api/word-rush/vote",
];

test("the routes are the listed ones and no others", () => {
  const registered = http.getRoutes().map(([path, method]) => `${method} ${path}`);
  expect(registered.sort()).toEqual([...ROUTES].sort());
});

test("every route is one exact path", () => {
  // A prefix route answers every path under it: the list would no longer say what can be called, and a path
  // nobody wrote a route for would get an answer
  const prefixes = [...http.prefixRoutes.values()].flatMap((routes) => [...routes.keys()]);
  expect(prefixes).toEqual([]);
});

test("a POST to a path with no route answers 404", async () => {
  const t = newBackend();
  // 404 says the server has no such route, and only that: a route that refuses a call answers 400, or 503 when
  // the call is worth repeating. That is how a client tells a server without a route from one that said no
  const missing = await t.fetch("/api/rooms/no-such-route", { method: "POST", body: JSON.stringify({}) });
  expect(missing.status).toBe(404);
  const refused = await t.fetch("/api/rooms/state", { method: "POST", body: JSON.stringify({}) });
  expect(refused.status).toBe(400);
});
