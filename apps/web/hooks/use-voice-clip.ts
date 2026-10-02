"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { encodeWav, pickMp4Type } from "@/hooks/use-audio-recorder";

export interface VoiceClip {
  blob: Blob;
  durationMs: number;
  /** Normalized peaks (0..1); empty when no level could be measured */
  waveform: number[];
}

interface Session {
  startedAt: number;
  levels: number[];
  stop: () => Promise<Blob | null>;
  cleanup: () => void;
}

const WAVEFORM_BARS = 48;
const LEVEL_INTERVAL_MS = 50;
const WAV_RATE = 16_000;

function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

function buildWaveform(levels: number[]): number[] {
  const max = Math.max(0, ...levels);
  if (levels.length === 0 || max < 0.002) return [];
  const bars: number[] = [];
  for (let i = 0; i < WAVEFORM_BARS; i++) {
    const from = Math.floor((i * levels.length) / WAVEFORM_BARS);
    const to = Math.max(from + 1, Math.floor(((i + 1) * levels.length) / WAVEFORM_BARS));
    const slice = levels.slice(from, to);
    // Blend peak with mean so syllables read as bumps instead of a flat wall
    const value = (Math.max(...slice) + slice.reduce((a, b) => a + b, 0) / slice.length) / 2;
    bars.push(Math.round(Math.pow(value / max, 0.8) * 100) / 100);
  }
  return bars;
}

function downsample(input: Float32Array, fromRate: number): Float32Array {
  const ratio = fromRate / WAV_RATE;
  if (ratio <= 1) return new Float32Array(input);
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

/**
 * Records a voice message from a mic stream someone else owns (the dictation hook holds it),
 * so transcription and recording share one capture.
 */
export function useVoiceClip({ maxMs = 120_000, onLimit }: { maxMs?: number; onLimit?: () => void } = {}) {
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const levelRef = useRef(0);
  const onLimitRef = useRef(onLimit);
  onLimitRef.current = onLimit;

  const supported =
    typeof window !== "undefined" && (!!pickMp4Type() || !!getAudioContextClass()) && !!navigator.mediaDevices?.getUserMedia;

  /** Call synchronously inside the tap handler: iOS only lets an AudioContext run if it's resumed from a gesture */
  const arm = useCallback(() => {
    const AC = getAudioContextClass();
    if (!AC) return;
    try {
      if (!ctxRef.current || ctxRef.current.state === "closed") ctxRef.current = new AC();
      void ctxRef.current.resume().catch(() => {});
    } catch {
      ctxRef.current = null;
    }
  }, []);

  const endSession = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    session?.cleanup();
    levelRef.current = 0;
    setRecording(false);
    setElapsedMs(0);
    return session;
  }, []);

  const start = useCallback(
    (stream: MediaStream): boolean => {
      if (sessionRef.current) return true;
      const ctx = ctxRef.current;
      let source: MediaStreamAudioSourceNode | null = null;
      let analyser: AnalyserNode | null = null;
      try {
        if (ctx) {
          source = ctx.createMediaStreamSource(stream);
          analyser = ctx.createAnalyser();
          analyser.fftSize = 1024;
          source.connect(analyser);
        }
      } catch {
        source = null;
        analyser = null;
      }

      let stop: Session["stop"];
      let stopRecorder: () => void = () => {};
      const mp4Type = pickMp4Type();
      if (mp4Type) {
        let rec: MediaRecorder;
        try {
          rec = new MediaRecorder(stream, { mimeType: mp4Type });
        } catch {
          source?.disconnect();
          return false;
        }
        const chunks: Blob[] = [];
        const stopped = new Promise<Blob | null>((resolve) => {
          rec.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) chunks.push(ev.data);
          };
          rec.onstop = () => resolve(chunks.length ? new Blob(chunks, { type: "audio/mp4" }) : null);
          rec.onerror = () => resolve(null);
        });
        rec.start(1000);
        stopRecorder = () => {
          if (rec.state !== "inactive") rec.stop();
        };
        stop = () => {
          stopRecorder();
          return stopped;
        };
      } else if (ctx && source) {
        const proc = ctx.createScriptProcessor(4096, 1, 1);
        const pcm: Float32Array[] = [];
        proc.onaudioprocess = (ev) => pcm.push(downsample(ev.inputBuffer.getChannelData(0), ctx.sampleRate));
        source.connect(proc);
        // A ScriptProcessor only runs while connected to the destination; its output stays silent
        proc.connect(ctx.destination);
        stopRecorder = () => {
          proc.onaudioprocess = null;
          proc.disconnect();
        };
        stop = () => {
          stopRecorder();
          return Promise.resolve(encodeWav(pcm, WAV_RATE));
        };
      } else {
        return false;
      }

      const levels: number[] = [];
      const buf = analyser ? new Float32Array(analyser.fftSize) : null;
      const levelTimer = setInterval(() => {
        if (!analyser || !buf) return;
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        levels.push(rms);
        levelRef.current = Math.min(1, rms * 6);
      }, LEVEL_INTERVAL_MS);
      const startedAt = Date.now();
      const tick = setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
      const limit = setTimeout(() => onLimitRef.current?.(), maxMs);

      sessionRef.current = {
        startedAt,
        levels,
        stop,
        cleanup: () => {
          clearInterval(levelTimer);
          clearInterval(tick);
          clearTimeout(limit);
          try {
            stopRecorder();
          } catch {
            // already stopped
          }
          source?.disconnect();
        },
      };
      setElapsedMs(0);
      setRecording(true);
      return true;
    },
    [maxMs]
  );

  const finish = useCallback(async (): Promise<VoiceClip | null> => {
    const session = sessionRef.current;
    if (!session) return null;
    const durationMs = Math.min(maxMs, Date.now() - session.startedAt);
    const blobPromise = session.stop();
    endSession();
    const blob = await blobPromise;
    if (!blob || blob.size <= 44) return null;
    return { blob, durationMs, waveform: buildWaveform(session.levels) };
  }, [endSession, maxMs]);

  const discard = useCallback(() => {
    endSession();
  }, [endSession]);

  useEffect(
    () => () => {
      sessionRef.current?.cleanup();
      sessionRef.current = null;
      void ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    []
  );

  return { supported, recording, elapsedMs, levelRef, arm, start, finish, discard };
}
