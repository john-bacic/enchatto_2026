// Chatto Dash: its few sounds, made on the spot with Web Audio. A browser only lets a page make sound
// after a tap or a key, so nothing is heard before the player first touches the controls.

let ctx: AudioContext | null = null;

// The sound switch on the race screen, kept for the browser (the iPhone app's web view keeps it too)
const MUTED_KEY = "enchatto_dash_muted";
let muted = (() => {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
})();

export function isMuted() {
  return muted;
}

export function unlockSound() {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // No sound, then
  }
  if (track?.paused) playTrack();
}

/** Turns all of the game's sound off or on: the music and the effects */
export function setMuted(on: boolean) {
  muted = on;
  try {
    localStorage.setItem(MUTED_KEY, on ? "1" : "0");
  } catch {
    // For this visit only, then
  }
  if (track) track.muted = on;
  if (!on) playTrack();
}

// The race music: each course has its own track (public/music/<level id>.mp3), looped from "GO!" until the
// round is over. It is fetched as data and played from memory, because the iPhone app's offline copy serves its
// files through the app, which an audio element cannot stream from. A browser that refuses to play before a tap
// is asked again at the next tap (unlockSound).
const MUSIC_VOLUME = 0.4;
let track: HTMLAudioElement | null = null;
const fetched = new Map<string, Promise<string | null>>();
let wanted: string | null = null;

const musicPath = (levelId: string) => `/music/${levelId}.mp3`;

function musicUrl(levelId: string) {
  let url = fetched.get(levelId);
  if (!url) {
    url = fetch(musicPath(levelId))
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => (blob ? URL.createObjectURL(blob) : null))
      .catch(() => {
        fetched.delete(levelId); // Try again next round
        return null;
      });
    fetched.set(levelId, url);
  }
  return url;
}

/** Fetches a course's music ahead of the race, so that it starts on the beat of "GO!" */
export function preloadMusic(levelId: string) {
  void musicUrl(levelId);
}

function playTrack() {
  if (!track || !wanted || muted || document.hidden) return;
  track.muted = muted;
  void track.play().catch(() => {
    // Not before a tap: unlockSound asks again
  });
}

export async function startMusic(levelId: string) {
  if (wanted === levelId) return;
  wanted = levelId;
  const url = await musicUrl(levelId);
  // Another course may have started, or the race been put away, while this one was fetched
  if (!url || wanted !== levelId) return;
  if (!track) {
    track = new Audio();
    track.loop = true;
    track.volume = MUSIC_VOLUME;
    // Not heard from a hidden tab or an app put away, and back where it was when they return
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) track?.pause();
      else playTrack();
    });
  }
  if (track.src !== url) track.src = url;
  track.currentTime = 0;
  playTrack();
}

export function stopMusic() {
  wanted = null;
  track?.pause();
}

function tone(from: number, to: number, seconds: number, type: OscillatorType, volume: number, delay = 0) {
  if (!ctx || muted || ctx.state !== "running") return;
  const at = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), at + seconds);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + seconds + 0.03);
}

export const sfx = {
  jump: () => tone(330, 620, 0.16, "square", 0.05),
  dive: () => tone(520, 260, 0.2, "sawtooth", 0.04),
  land: () => tone(160, 90, 0.08, "sine", 0.08),
  bounce: () => {
    tone(180, 90, 0.22, "sine", 0.16);
    tone(420, 880, 0.2, "triangle", 0.06);
  },
  hit: () => {
    tone(240, 70, 0.26, "sawtooth", 0.08);
    tone(90, 50, 0.2, "square", 0.06);
  },
  fall: () => tone(700, 110, 0.5, "triangle", 0.07),
  checkpoint: () => {
    tone(660, 660, 0.09, "triangle", 0.07);
    tone(990, 990, 0.16, "triangle", 0.07, 0.09);
  },
  finish: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.22, "triangle", 0.09, i * 0.11)),
  count: () => tone(440, 440, 0.14, "square", 0.05),
  go: () => tone(880, 880, 0.4, "square", 0.06),
};
