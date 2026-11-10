/** A finished tournament's podium is offered for this long, by the device's own clock; after that the room is just a room again */
const PODIUM_MS = 5 * 60_000;

/** Whether a room's Chatto Dash game is one to draw: a lobby, a race, results, or a podium that is still fresh */
export function dashLive(game: { status: string; endedAt?: number } | null | undefined, now: number = Date.now()): boolean {
  if (!game) return false;
  if (game.status === "canceled") return false;
  if (game.status === "completed") return now - (game.endedAt ?? 0) < PODIUM_MS;
  return true;
}

/** Whether a game is under way, lobby included: what the End Game button and the game picker go by */
export function dashOn(game: { status: string } | null | undefined): boolean {
  return !!game && (game.status === "lobby" || game.status === "racing" || game.status === "results");
}
