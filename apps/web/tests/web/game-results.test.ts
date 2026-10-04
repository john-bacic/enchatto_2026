import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { gameOnScreen, useGameOnScreen, watchedGame, type RoomGame } from "../../lib/game-results";

// lib/game-results.ts: which Emoji Match game the room page puts on screen. The room's query answers its latest
// game even when that one ended long ago, so the page shows the results only of a game it saw being played.
// No effect runs here (see CLAUDE.md), so the hook is rendered once, as a page that has just loaded, and what it
// does from one answer of the query to the next is tested through the two functions it is made of.

/** The page over a run of query answers, as useGameOnScreen keeps it: whether each answer was on screen */
function page() {
  let watched: string | null = null;
  return (game: RoomGame | null | undefined, taskOpen = false) => {
    const shown = gameOnScreen(game, watched, taskOpen);
    watched = watchedGame(watched, game, taskOpen);
    return shown;
  };
}

const game = (status: string, _id = "g1"): RoomGame => ({ _id, status });

describe("a game the page saw being played", () => {
  test("is on screen from the lobby to its results", () => {
    const see = page();
    expect(see(undefined)).toBe(false);
    expect(see(game("lobby"))).toBe(true);
    expect(see(game("active"))).toBe(true);
    expect(see(game("resolving"))).toBe(true);
    expect(see(game("completed"))).toBe(true);
    // The results stay for as long as the query keeps answering them
    expect(see(game("completed"))).toBe(true);
  });

  test("keeps its results over a moment with no answer, as when the connection drops", () => {
    const see = page();
    see(game("active"));
    expect(see(undefined)).toBe(false);
    expect(see(game("completed"))).toBe(true);
  });

  test("is gone once canceled", () => {
    const see = page();
    see(game("active"));
    expect(see(game("canceled"))).toBe(false);
  });
});

describe("a game that had ended before the page saw it", () => {
  test("is not shown: a reload, or a guest who joined after it", () => {
    const see = page();
    expect(see(undefined)).toBe(false);
    expect(see(game("completed"))).toBe(false);
    expect(see(game("completed"))).toBe(false);
  });

  test("is not shown when the game the page did watch was another one", () => {
    const see = page();
    see(game("active", "g2"));
    expect(see(game("canceled", "g2"))).toBe(false);
    expect(see(game("completed", "g1"))).toBe(false);
  });

  test("does not keep the next game off the screen", () => {
    const see = page();
    expect(see(game("completed", "g1"))).toBe(false);
    expect(see(game("lobby", "g2"))).toBe(true);
    expect(see(game("active", "g2"))).toBe(true);
    expect(see(game("completed", "g2"))).toBe(true);
  });
});

describe("another game's open task", () => {
  test("is not covered by the results, which do not come back after it", () => {
    const see = page();
    see(game("active"));
    expect(see(game("completed"))).toBe(true);
    expect(see(game("completed"), true)).toBe(false);
    // Between two rounds of the other game, and after it
    expect(see(game("completed"), false)).toBe(false);
  });

  test("is not covered by results that arrive while it is open", () => {
    const see = page();
    see(game("active"), true);
    expect(see(game("completed"), true)).toBe(false);
    expect(see(game("completed"), false)).toBe(false);
  });

  test("leaves a game in progress on screen", () => {
    const see = page();
    expect(see(game("active"), true)).toBe(true);
    expect(see(game("lobby", "g2"), true)).toBe(true);
  });

  test("leaves the next game's results alone once it has closed", () => {
    const see = page();
    see(game("active", "g1"));
    see(game("completed", "g1"), true);
    see(game("active", "g2"));
    expect(see(game("completed", "g2"))).toBe(true);
  });
});

describe("a page that has just loaded", () => {
  function Probe({ answer, taskOpen }: { answer: RoomGame | null | undefined; taskOpen: boolean }) {
    return useGameOnScreen(answer, taskOpen) ? "shown" : "hidden";
  }
  const firstRender = (answer: RoomGame | null | undefined, taskOpen = false) =>
    renderToStaticMarkup(createElement(Probe, { answer, taskOpen }));

  test("shows a game in progress, and not one that is over", () => {
    expect(firstRender(game("lobby"))).toBe("shown");
    expect(firstRender(game("active"), true)).toBe("shown");
    expect(firstRender(game("completed"))).toBe("hidden");
    expect(firstRender(game("canceled"))).toBe("hidden");
    expect(firstRender(undefined)).toBe("hidden");
  });
});

describe("no game", () => {
  test("a room that has had none shows none", () => {
    const see = page();
    expect(see(null)).toBe(false);
    expect(see(undefined)).toBe(false);
  });
});
