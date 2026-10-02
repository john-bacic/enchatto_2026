"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The iOS app (AVPlayer) can't play webm/opus, so browsers that can't record
// MP4 (Firefox) capture raw PCM and encode WAV instead.
const MP4_TYPES = ["audio/mp4;codecs=mp4a.40.2", "audio/mp4"];

export type RecorderStatus = "idle" | "requesting" | "recording" | "recorded" | "error";
export type RecorderError = "denied" | "unsupported" | "failed";

export interface AudioRecorder {
  status: RecorderStatus;
  blob: Blob | null;
  url: string | null;
  /** 0..1 RMS-ish input level while recording */
  level: number;
  elapsedMs: number;
  durationMs: number;
  error: RecorderError | null;
  maxMs: number;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

interface ClipRecorder {
  readonly state: string;
  stop: () => void;
}

export function pickMp4Type(): string | undefined {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return undefined;
  return MP4_TYPES.find((m) => MediaRecorder.isTypeSupported(m));
}

export function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  const length = chunks.reduce((n, c) => n + c.length, 0);
  const view = new DataView(new ArrayBuffer(44 + length * 2));
  const ascii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  ascii(0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, length * 2, true);
  let offset = 44;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, chunk[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }
  return new Blob([view], { type: "audio/wav" });
}

export function useAudioRecorder({ maxMs = 4000 }: { maxMs?: number } = {}): AudioRecorder {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<RecorderError | null>(null);

  const recorderRef = useRef<ClipRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);
  const urlRef = useRef<string | null>(null);
  const sessionRef = useRef(0);

  const teardown = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setLevel(0);
  }, []);

  const clearClip = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setUrl(null);
    setBlob(null);
    setDurationMs(0);
    setElapsedMs(0);
  }, []);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        teardown();
      }
    }
  }, [teardown]);

  const start = useCallback(async () => {
    if (recorderRef.current?.state === "recording") return;
    const session = ++sessionRef.current;
    clearClip();
    setError(null);

    const AC =
      typeof window === "undefined"
        ? undefined
        : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
    const mp4Type = pickMp4Type();
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || (!mp4Type && !AC)) {
      setError("unsupported");
      setStatus("error");
      return;
    }

    setStatus("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setError(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "failed");
      setStatus("error");
      return;
    }
    if (session !== sessionRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    streamRef.current = stream;

    const fail = () => {
      teardown();
      recorderRef.current = null;
      setError("failed");
      setStatus("error");
    };

    const finish = (out: Blob) => {
      const took = Math.min(maxMs, Date.now() - startedAtRef.current);
      teardown();
      recorderRef.current = null;
      if (session !== sessionRef.current) return;
      if (out.size <= 44) {
        setError("failed");
        setStatus("error");
        return;
      }
      const objectUrl = URL.createObjectURL(out);
      urlRef.current = objectUrl;
      setBlob(out);
      setUrl(objectUrl);
      setDurationMs(took);
      setElapsedMs(took);
      setStatus("recorded");
    };

    let ctx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    try {
      if (AC) {
        ctx = new AC();
        ctxRef.current = ctx;
        ctx.resume().catch(() => {});
        source = ctx.createMediaStreamSource(stream);
      }
    } catch {
      ctx = null;
      source = null;
    }

    if (mp4Type) {
      let rec: MediaRecorder;
      try {
        rec = new MediaRecorder(stream, { mimeType: mp4Type });
      } catch {
        fail();
        return;
      }
      const chunks: Blob[] = [];
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      rec.onstop = () => finish(new Blob(chunks, { type: "audio/mp4" }));
      recorderRef.current = rec;
      rec.start(250);
    } else if (ctx && source) {
      const sampleRate = ctx.sampleRate;
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      const pcm: Float32Array[] = [];
      proc.onaudioprocess = (ev) => pcm.push(new Float32Array(ev.inputBuffer.getChannelData(0)));
      source.connect(proc);
      // ScriptProcessor only runs while connected to the destination; its output stays silent
      proc.connect(ctx.destination);
      const wav = {
        state: "recording",
        stop() {
          if (wav.state === "inactive") return;
          wav.state = "inactive";
          proc.onaudioprocess = null;
          proc.disconnect();
          finish(encodeWav(pcm, sampleRate));
        },
      };
      recorderRef.current = wav;
    } else {
      fail();
      return;
    }

    try {
      if (ctx && source) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        const loop = () => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const x = (buf[i] - 128) / 128;
            sum += x * x;
          }
          setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 3.2));
          setElapsedMs(Date.now() - startedAtRef.current);
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      }
    } catch {
      // level meter is cosmetic
    }

    startedAtRef.current = Date.now();
    setStatus("recording");
    timerRef.current = setTimeout(() => stop(), maxMs);
  }, [clearClip, maxMs, stop, teardown]);

  const reset = useCallback(() => {
    sessionRef.current++;
    const rec = recorderRef.current;
    recorderRef.current = null;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
    teardown();
    clearClip();
    setError(null);
    setStatus("idle");
  }, [clearClip, teardown]);

  useEffect(
    () => () => {
      sessionRef.current++;
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") {
        try {
          rec.stop();
        } catch {
          // ignore
        }
      }
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close().catch(() => {});
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  return { status, blob, url, level, elapsedMs, durationMs, error, maxMs, start, stop, reset };
}
