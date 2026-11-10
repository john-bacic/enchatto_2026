// Chatto Dash: its few sounds, made on the spot with Web Audio. A browser only lets a page make sound
// after a tap or a key, so nothing is heard before the player first touches the controls.

let ctx: AudioContext | null = null;
let muted = false;

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
}

export function setMuted(on: boolean) {
  muted = on;
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
