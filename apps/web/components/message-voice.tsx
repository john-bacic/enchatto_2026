"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n";

const PLAYED_KEY = "enchatto_playedVoice";
const PLAYED_LIMIT = 300;
const SPEEDS = [1, 1.5, 2];
const BARS = 48;

/** Only one voice message plays at a time */
let activeAudio: HTMLAudioElement | null = null;

function readPlayed(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(PLAYED_KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function markPlayed(id: string) {
  try {
    const list = readPlayed().filter((x) => x !== id);
    list.push(id);
    localStorage.setItem(PLAYED_KEY, JSON.stringify(list.slice(-PLAYED_LIMIT)));
  } catch {
    // storage blocked
  }
}

/** Stand-in shape for clips recorded without a level meter, stable per message */
function placeholderWaveform(seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const bars: number[] = [];
  let prev = 0.5;
  for (let i = 0; i < BARS; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const r = ((h >>> 0) % 1000) / 1000;
    prev = prev * 0.45 + r * 0.55;
    bars.push(0.2 + prev * 0.8);
  }
  return bars;
}

function formatClock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

interface VoiceMessageProps {
  messageId: string;
  src?: string;
  durationMs?: number;
  waveform?: number[];
  /** Show the pink dot until this viewer has played it (off for your own messages) */
  trackUnplayed: boolean;
  lang?: string;
}

export function VoiceMessage({ messageId, src, durationMs = 0, waveform, trackUnplayed, lang }: VoiceMessageProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [unplayed, setUnplayed] = useState(false);

  const bars = useMemo(
    () => (waveform && waveform.length > 0 ? waveform : placeholderWaveform(messageId)),
    [waveform, messageId]
  );
  const totalSeconds = durationMs / 1000;

  useEffect(() => {
    if (trackUnplayed) setUnplayed(!readPlayed().includes(messageId));
  }, [trackUnplayed, messageId]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        if (activeAudio === audio) activeAudio = null;
      }
    },
    []
  );

  const durationOf = (audio: HTMLAudioElement) =>
    Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : totalSeconds || 1;

  const tick = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(Math.min(1, audio.currentTime / durationOf(audio)));
    if (!audio.paused) rafRef.current = requestAnimationFrame(tick);
  };

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.onplay = () => {
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    };
    audio.onpause = () => {
      setPlaying(false);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    audio.onended = () => {
      setPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };
    audioRef.current = audio;
    return audio;
  };

  const play = (fromFraction?: number) => {
    if (!src) return;
    const audio = ensureAudio();
    if (activeAudio && activeAudio !== audio) activeAudio.pause();
    activeAudio = audio;
    audio.playbackRate = SPEEDS[speed];
    if (fromFraction != null) {
      const seek = () => {
        audio.currentTime = fromFraction * durationOf(audio);
      };
      // Safari ignores seeks before metadata has loaded
      if (audio.readyState >= 1) seek();
      else audio.addEventListener("loadedmetadata", seek, { once: true });
      setProgress(fromFraction);
    }
    void audio.play().catch(() => setPlaying(false));
    if (unplayed) {
      setUnplayed(false);
      markPlayed(messageId);
    }
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) audio.pause();
    else play();
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    play(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  };

  const cycleSpeed = () => {
    const next = (speed + 1) % SPEEDS.length;
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  const shownSeconds = playing || progress > 0 ? progress * totalSeconds : totalSeconds;

  return (
    <div className={`ec-vm${src ? "" : " expired"}`}>
      {unplayed && <span className="ec-vm-dot" aria-hidden />}
      <button
        type="button"
        className="ec-vm-play"
        onClick={toggle}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={!src}
        aria-label={playing ? t("Pause", lang) : t("Play", lang)}
      >
        {playing ? (
          <svg viewBox="0 0 10 12" aria-hidden>
            <path d="M1 0h3v12H1zM6 0h3v12H6z" />
          </svg>
        ) : (
          <svg viewBox="0 0 10 12" aria-hidden className="tri">
            <path d="M0 0l10 6-10 6z" />
          </svg>
        )}
      </button>
      <div
        className="ec-vm-wave"
        onClick={src ? seekTo : undefined}
        onPointerDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        {bars.map((p, i) => (
          <i
            key={i}
            className={(i + 0.5) / bars.length <= progress ? "played" : undefined}
            style={{ height: `${Math.round(4 + p * 22)}px` }}
          />
        ))}
      </div>
      <span className="ec-vm-meta">
        {src ? (
          <>
            <span>{formatClock(shownSeconds)}</span>
            <button
              type="button"
              className="ec-vm-speed"
              onClick={cycleSpeed}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={t("Playback speed", lang)}
            >
              {SPEEDS[speed]}×
            </button>
          </>
        ) : (
          <span className="ec-vm-expired">{t("Voice message expired", lang)}</span>
        )}
      </span>
    </div>
  );
}
