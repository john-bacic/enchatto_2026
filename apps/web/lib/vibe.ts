export interface VibeMessage {
  _id: string;
  senderId: string;
  kind: string;
  text?: string;
  createdAt: number;
}

const VIBE_WINDOW_MS = 60_000;
const COMBO_GAP_MS = 90_000;
export const HYPE_AT = 150;

/** Client-side party meter: recent chatter, boosted by EN⇄JA back-and-forth. */
export function computeVibe(messages: VibeMessage[], langOf: (m: VibeMessage) => string, now: number) {
  const real = messages.filter((m) => m.kind !== "system");
  const recent = real.filter((m) => now - m.createdAt < VIBE_WINDOW_MS);
  let switches = 0;
  for (let i = 1; i < recent.length; i++) {
    if (langOf(recent[i]) !== langOf(recent[i - 1])) switches++;
  }
  let combo = 0;
  const last = real[real.length - 1];
  if (last && now - last.createdAt < COMBO_GAP_MS) {
    combo = 1;
    for (let i = real.length - 1; i > 0; i--) {
      const cur = real[i];
      const prev = real[i - 1];
      if (cur.createdAt - prev.createdAt > COMBO_GAP_MS || langOf(cur) === langOf(prev)) break;
      combo++;
    }
  }
  const mult = 1 + Math.min(combo, 20) * 0.05;
  const vibe = Math.round((recent.length * 12 + switches * 20) * mult);
  return { vibe, combo, mult, hype: vibe >= HYPE_AT, recentCount: recent.length, switches };
}

/** A reading of the meter: the numbers the room header and the hype layer show */
export type Vibe = ReturnType<typeof computeVibe>;

/**
 * The meter as the page shows it when its clock was last moved at `clock`. A message newer than the clock counts
 * from its own time, so one that arrives between two moves of the clock shows at once.
 */
export function vibeAt(messages: VibeMessage[], langOf: (m: VibeMessage) => string, clock: number): Vibe {
  return computeVibe(messages, langOf, Math.max(clock, messages[messages.length - 1]?.createdAt ?? 0));
}

/** Whether two readings show the same numbers */
export function sameVibe(a: Vibe, b: Vibe): boolean {
  return (Object.keys(a) as (keyof Vibe)[]).every((key) => a[key] === b[key]);
}

export function formatVibe(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n);
}
