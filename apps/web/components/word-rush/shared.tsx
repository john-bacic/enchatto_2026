"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { WordRushStrings } from "./strings";

export type WRState = NonNullable<FunctionReturnType<typeof api.wordRush.getState>>;
export type WRPlayer = WRState["players"][number];
export type WRLang = "en" | "ja";
export type WRVote = "huh" | "close" | "native";

export interface MyAnswer {
  choiceIndex: number;
  correct: boolean;
  points: number;
}

export interface ViewProps {
  state: WRState;
  me: WRPlayer | null;
  myId: Id<"participants">;
  /** language the viewer is learning (spectators: derived from UI language) */
  learning: WRLang;
  s: WordRushStrings;
  lang: string;
  /** server-clock-adjusted Date.now() */
  now: number;
  isHost: boolean;
  toast: (msg: string, kind?: "error" | "info") => void;
}

export const PACKS: Array<{ id: string; icon: string }> = [
  { id: "mix", icon: "ui-sparkle" },
  { id: "foodie", icon: "o-cake" },
  { id: "travel", icon: "o-train" },
  { id: "slang", icon: "re-laugh" },
  { id: "anime", icon: "o-shootingstar" },
  { id: "feelings", icon: "re-heart" },
  { id: "chat", icon: "ui-chat" },
];

export const VOTE_META: Record<WRVote, { icon: string; color: string }> = {
  huh: { icon: "j-huh", color: "var(--pink-soft)" },
  close: { icon: "j-close", color: "var(--yellow-soft)" },
  native: { icon: "j-native", color: "var(--mint-soft)" },
};

/** "[CONVEX M(wordRush:answer)] [Request ID: …] Server Error\nUncaught Error: Too late…\n at …" → "Too late…" */
export function errorText(e: unknown, fallback: string): string {
  const raw = e instanceof Error ? e.message : typeof e === "string" ? e : "";
  const uncaught = raw.match(/Uncaught (?:\w*Error):\s*([^\n]+)/);
  if (uncaught) return uncaught[1].trim();
  const cleaned = raw
    .replace(/\[CONVEX [^\]]*\]/g, "")
    .replace(/\[Request ID:[^\]]*\]/g, "")
    .replace(/Server Error/g, "")
    .split("\n")[0]
    .trim();
  return cleaned || fallback;
}

// ─── Sound + haptics ─────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume().catch(() => {});
    return audioCtx;
  } catch {
    return null;
  }
}

const SFX: Record<string, Array<[number, number, number, OscillatorType]>> = {
  // [freq, startOffset, duration, type]
  correct: [
    [660, 0, 0.09, "triangle"],
    [880, 0.08, 0.09, "triangle"],
    [1320, 0.16, 0.16, "triangle"],
  ],
  wrong: [
    [220, 0, 0.14, "square"],
    [165, 0.12, 0.22, "square"],
  ],
  tick: [[1200, 0, 0.04, "sine"]],
  pop: [[520, 0, 0.06, "sine"]],
  tada: [
    [523, 0, 0.1, "triangle"],
    [659, 0.1, 0.1, "triangle"],
    [784, 0.2, 0.1, "triangle"],
    [1046, 0.3, 0.3, "triangle"],
  ],
};

export function sfx(kind: keyof typeof SFX) {
  const c = ctx();
  if (!c || c.state !== "running") return;
  const t0 = c.currentTime;
  for (const [freq, at, dur, type] of SFX[kind]) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + at);
    gain.gain.exponentialRampToValueAtTime(type === "square" ? 0.05 : 0.12, t0 + at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0 + at);
    osc.stop(t0 + at + dur + 0.02);
  }
}

/** Call from a user gesture so later blips are allowed to play. */
export function unlockAudio() {
  ctx();
}

export function haptic(kind: "correct" | "wrong" | "tap") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(kind === "correct" ? 30 : kind === "wrong" ? [60, 40, 60] : 10);
  } catch {
    // ignore
  }
}

export function speak(text: string, lang: WRLang) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "ja" ? "ja-JP" : "en-US";
  u.rate = 0.9;
  const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").startsWith(u.lang));
  if (voice) u.voice = voice;
  synth.speak(u);
}

export async function uploadClip(blob: Blob, getUploadUrl: () => Promise<string>): Promise<Id<"_storage">> {
  const url = await getUploadUrl();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": blob.type || "audio/mp4" },
    body: blob,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
  return storageId;
}

// ─── Clock ───────────────────────────────────────────────────────────────────

export function useTicker(intervalMs: number, enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
}

/**
 * Estimates client-minus-server clock skew from phase transitions seen live (the first
 * observation may be mid-phase so it's ignored). Small skews are ignored since they're
 * indistinguishable from network latency.
 */
export function useServerSkew(gameId: string | undefined, phaseSeq: number | undefined, phaseStartedAt: number | undefined) {
  const ref = useRef<{ key: string | null; min: number | null }>({ key: null, min: null });
  const [skew, setSkew] = useState(0);
  useEffect(() => {
    if (!gameId || phaseSeq == null || phaseStartedAt == null) return;
    const key = `${gameId}:${phaseSeq}`;
    const r = ref.current;
    if (r.key === null) {
      r.key = key;
      return;
    }
    if (r.key === key) return;
    r.key = key;
    const obs = Date.now() - phaseStartedAt;
    if (r.min === null || obs < r.min) {
      r.min = obs;
      setSkew(Math.abs(obs) > 1000 ? obs : 0);
    }
  }, [gameId, phaseSeq, phaseStartedAt]);
  return skew;
}

// ─── Small pieces ────────────────────────────────────────────────────────────

export function MicGlyph({ size = 46, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 46 58" width={size} height={(size * 58) / 46} aria-hidden>
      <rect x="12" y="2" width="22" height="34" rx="11" fill={color} stroke="#1d1b4f" strokeWidth="4" />
      <path d="M17 12h12M17 19h12" stroke="#1d1b4f" strokeWidth="3" strokeLinecap="round" opacity=".35" />
      <path d="M5 26a18 18 0 0 0 36 0M23 44v10M13 55h20" fill="none" stroke="#1d1b4f" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Timer({ state, now, size }: { state: WRState; now: number; size?: "sm" }) {
  const total = Math.max(1, state.phaseEndsAt - state.phaseStartedAt);
  const left = Math.max(0, state.phaseEndsAt - now);
  const secs = Math.ceil(left / 1000);
  const p = Math.round((left / total) * 100);
  return (
    <div
      className={`wr-timer${size ? ` ${size}` : ""}${secs <= 3 ? " hurry" : ""}`}
      style={{ "--p": `${p}%` } as React.CSSProperties}
      aria-label={`${secs}s`}
    >
      <b>{secs}</b>
    </div>
  );
}

export function Lockins({
  players,
  doneIds,
  label,
  size = 38,
}: {
  players: WRPlayer[];
  doneIds: Set<string>;
  label?: string;
  size?: number;
}) {
  return (
    <div className="wr-lockins">
      {players.map((p) => (
        <span key={p.participantId} className={`p${doneIds.has(p.participantId) ? "" : " wait"}`} title={p.nickname}>
          <AvatarDisc id={p.avatarValue} size={size} />
          {doneIds.has(p.participantId) && <em>✓</em>}
        </span>
      ))}
      {label && <small>{label}</small>}
    </div>
  );
}

export function Stage({
  player,
  tag,
  tagColor,
  live = false,
  size = 96,
}: {
  player: WRPlayer | undefined;
  tag: string;
  tagColor?: string;
  live?: boolean;
  size?: number;
}) {
  return (
    <div className="wr-stage">
      <div className="wr-cone" aria-hidden />
      <div className="wr-star-av">
        <AvatarDisc id={player?.avatarValue ?? "rabbit"} size={size} border={4} />
      </div>
      <div className="wr-onmic" style={tagColor ? { background: tagColor } : undefined}>
        {live && <i />}
        {tag}
      </div>
    </div>
  );
}

export function SpectatorScores({ state, s }: { state: WRState; s: WordRushStrings }) {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  return (
    <div className="wr-scores">
      {sorted.map((p) => (
        <span key={p.participantId} className="s">
          <AvatarDisc id={p.avatarValue} size={24} />
          {p.nickname}
          <b>{p.score.toLocaleString()}</b>
        </span>
      ))}
      <span className="wr-spectate" style={{ alignSelf: "center" }}>
        <Icon name="g-ear" size={18} />
        {s.spectating}
      </span>
    </div>
  );
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Audio clip card with a play button and decorative bars that fill as it plays. */
export function ClipPlayer({
  url,
  autoPlay = false,
  color = "var(--blue)",
  buttonColor,
  label,
  s,
}: {
  url: string;
  autoPlay?: boolean;
  color?: string;
  buttonColor?: string;
  label?: React.ReactNode;
  s: WordRushStrings;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);

  const bars = useMemo(() => {
    let h = hash(url);
    return Array.from({ length: 18 }, () => {
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      return 22 + (h % 74);
    });
  }, [url]);

  useEffect(() => {
    const a = new Audio();
    a.preload = "auto";
    a.src = url;
    audioRef.current = a;
    const onTime = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) setProgress(a.currentTime / a.duration);
    };
    const onMeta = () => {
      if (Number.isFinite(a.duration)) setDuration(a.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(1);
    };
    const onPlay = () => {
      setPlaying(true);
      setBlocked(false);
    };
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    let disposed = false;
    if (autoPlay) {
      a.play().catch(() => {
        if (!disposed) setBlocked(true);
      });
    }
    return () => {
      disposed = true;
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, [url, autoPlay]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    unlockAudio();
    if (playing) {
      a.pause();
      return;
    }
    if (a.ended || progress >= 1) a.currentTime = 0;
    setBlocked(false);
    a.play().catch(() => setBlocked(true));
  };

  const lit = Math.round(progress * bars.length);
  return (
    <div className="ec-card wr-clip">
      <button
        type="button"
        className={`ec-round-btn${blocked ? " blocked" : ""}`}
        style={buttonColor ? { background: buttonColor, color: "var(--ink)" } : undefined}
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <div className={`bars${playing ? " playing" : ""}`} style={{ "--c": color } as React.CSSProperties}>
        {bars.map((h, i) => (
          <i key={i} className={!playing && progress === 0 ? "on" : i < lit ? "on" : ""} style={{ height: `${h}%` }} />
        ))}
      </div>
      <small>
        {blocked ? s.tapToPlay : label ?? (duration ? fmtSecs(Math.max(1000, Math.round(duration * 1000))) : "")}
      </small>
    </div>
  );
}

const SCENE_ICONS: Record<string, string[]> = {
  hearts: ["re-heart"],
  notes: ["g-music"],
  stars: ["o-star", "o-shootingstar"],
  sparkles: ["ui-sparkle", "o-star"],
  petals: [],
  snow: [],
  bubbles: [],
  confetti: [],
};

const CONF_COLORS = ["#ff7ab6", "#3b6bff", "#ffd23f", "#3fdcb0", "#a77bff", "#ff4f6d"];

/** Ambient falling / rising particles for the word card scene. */
export function SceneParticles({ scene }: { scene: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: scene === "bubbles" ? 14 : 18 }, (_, i) => ({
        left: (i * 29 + 7) % 104,
        top: (i * 37 + 11) % 90,
        dur: 4 + ((i * 13) % 30) / 10,
        delay: -((i * 7) % 50) / 10,
        dx: `${(i % 2 ? -1 : 1) * (30 + ((i * 17) % 60))}px`,
        size: 0.7 + ((i * 11) % 6) / 10,
        color: CONF_COLORS[i % CONF_COLORS.length],
        icon: SCENE_ICONS[scene]?.[i % Math.max(1, SCENE_ICONS[scene]?.length ?? 1)],
      })),
    [scene]
  );

  return (
    <div className="wr-scene" aria-hidden>
      {pieces.map((p, i) => {
        const base: React.CSSProperties = {
          left: `${p.left}%`,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
          "--dx": p.dx,
        } as React.CSSProperties;
        if (scene === "petals") return <i key={i} className="fall petal" style={{ ...base, scale: `${p.size}` }} />;
        if (scene === "snow") return <i key={i} className="fall flake" style={{ ...base, scale: `${p.size}` }} />;
        if (scene === "confetti")
          return <i key={i} className="fall conf" style={{ ...base, background: p.color, rotate: `${i * 40}deg` }} />;
        if (scene === "bubbles") return <i key={i} className="rise bubble" style={{ ...base, scale: `${p.size}` }} />;
        if (scene === "sparkles" || scene === "stars") {
          const twinkle = i % 2 === 0;
          return (
            <i
              key={i}
              className={twinkle ? "twinkle" : "fall"}
              style={twinkle ? { left: `${p.left}%`, top: `${p.top}%`, animationDuration: `${0.9 + (i % 5) * 0.25}s`, animationDelay: `${p.delay}s` } : base}
            >
              <img src={`/icons/${p.icon ?? "o-star"}.png`} alt="" style={{ width: 26 * p.size, height: 26 * p.size }} />
            </i>
          );
        }
        return (
          <i key={i} className={scene === "notes" || scene === "hearts" ? "rise" : "fall"} style={base}>
            <img src={`/icons/${p.icon ?? "re-heart"}.png`} alt="" style={{ width: 26 * p.size, height: 26 * p.size }} />
          </i>
        );
      })}
    </div>
  );
}

export function isNativeFor(p: WRPlayer | null | undefined, lang: WRLang | undefined) {
  return !!p && !!lang && p.learning !== lang;
}

export function fmtSecs(ms: number) {
  return `0:${String(Math.min(59, Math.round(ms / 1000))).padStart(2, "0")}`;
}

// Latin words only wrap at spaces, so size by the widest unbreakable run in em (chunky Latin ≈ 0.7em, CJK ≈ 1em).
export function textUnits(text: string) {
  return Math.max(0, ...text.split(/\s+/).map((w) => [...w].reduce((n, ch) => n + (ch.charCodeAt(0) < 0x2e80 ? 0.7 : 1), 0)));
}

export function answerSizeClass(text: string) {
  const units = textUnits(text);
  return units > 8.6 ? " xlong" : units > 7 || text.length > 14 ? " long" : "";
}
