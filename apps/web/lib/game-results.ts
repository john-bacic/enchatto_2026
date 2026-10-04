"use client";

import { useEffect, useState } from "react";

// Emoji Match's room query (emojiMatch.getActiveEmojiMatch) answers the game in progress, or else the room's latest
// finished game, however long ago it ended: that is how the results reach a page whose game has just ended. So a
// finished game in the answer does not say that this page should show it. A page shows the results of a game it saw
// being played and of no other: not again after a reload, and not to a guest who joined after the game.

/** What the room page needs of a game to decide whether it is on screen */
export interface RoomGame {
  _id: string;
  status: string;
}

const isOver = (game: RoomGame) => game.status === "completed" || game.status === "canceled";

/**
 * The id of the game this page has seen in progress, which is the one whose results it shows. `watched` is what it
 * was before this answer of the query. Results give way to another game's task for good: results that came back
 * between two rounds of that game would be in the way each time.
 */
export function watchedGame(watched: string | null, game: RoomGame | null | undefined, taskOpen: boolean): string | null {
  if (!game) return watched;
  if (!isOver(game)) return game._id;
  return taskOpen && game._id === watched ? null : watched;
}

/** Whether the game is this page's to show: as its screen, or as its Resume button once the player has put it away */
export function gameOnScreen(game: RoomGame | null | undefined, watched: string | null, taskOpen: boolean): boolean {
  if (!game || game.status === "canceled") return false;
  if (game.status !== "completed") return true;
  return game._id === watched && !taskOpen;
}

/**
 * `gameOnScreen` for the answer of a room's game query, with the page keeping track of the game it has watched.
 * `taskOpen` says that another game has a task open for this player, which no results may cover.
 */
export function useGameOnScreen(game: RoomGame | null | undefined, taskOpen: boolean): boolean {
  const [watched, setWatched] = useState<string | null>(null);
  useEffect(() => {
    setWatched((prev) => watchedGame(prev, game, taskOpen));
  }, [game, taskOpen]);
  return gameOnScreen(game, watched, taskOpen);
}
