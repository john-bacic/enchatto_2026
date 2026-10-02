"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface UseSpeechRecognitionOptions {
  onTranscript?: (text: string) => void;
  onEnd?: () => void;
}

/** Check if text contains Japanese characters */
function isJapaneseText(text: string): boolean {
  return /[\u3040-\u9FFF\u30A0-\u30FF]/.test(text);
}

/** Ensure transcript ends with punctuation (matches iOS SpeechRecognizer.ensurePunctuation) */
export function ensurePunctuation(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  // Already has ending punctuation
  if (/[.!?。！？…]$/.test(trimmed)) return trimmed;

  const jp = isJapaneseText(trimmed);
  const lower = trimmed.toLowerCase();

  // Question patterns (English)
  const questionStarters = [
    "who ", "what ", "where ", "when ", "why ", "how ",
    "is ", "are ", "was ", "were ", "do ", "does ", "did ",
    "can ", "could ", "would ", "should ", "will ", "shall ",
    "have ", "has ", "had ", "don't ", "isn't ", "aren't ",
  ];
  const isQuestion =
    questionStarters.some((s) => lower.startsWith(s)) ||
    lower.endsWith(" right") ||
    lower.endsWith(" huh");

  // Question patterns (Japanese)
  const jpQuestion =
    trimmed.endsWith("か") || trimmed.endsWith("かな") ||
    trimmed.endsWith("でしょう") || trimmed.endsWith("ですか");

  if (isQuestion || jpQuestion) return trimmed + (jp ? "？" : "?");

  // Exclamation patterns (English)
  const exclamStarters = [
    "wow", "oh", "yes", "no", "hey", "stop", "wait",
    "help", "nice", "awesome", "amazing", "great",
    "let's go", "come on", "hurry",
  ];
  const isExclaim = exclamStarters.some((s) => lower.startsWith(s));

  // Exclamation patterns (Japanese)
  const jpExclaim =
    trimmed.endsWith("よ") || trimmed.endsWith("ぞ") ||
    trimmed.endsWith("ね") || trimmed.endsWith("なあ") ||
    trimmed.endsWith("すごい") || trimmed.endsWith("やばい");

  if (isExclaim || jpExclaim) return trimmed + (jp ? "！" : "!");

  // Default: period
  return trimmed + (jp ? "。" : ".");
}

const speechDebug = typeof location !== "undefined" && location.search.includes("speechdebug");

function debugLog(message: string) {
  if (!speechDebug) return;
  let el = document.getElementById("ec-speech-debug");
  if (!el) {
    el = document.createElement("pre");
    el.id = "ec-speech-debug";
    el.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:9999;max-height:40vh;overflow:auto;margin:0;padding:6px;font:11px/1.3 monospace;background:rgba(0,0,0,.8);color:#0f0;pointer-events:none;white-space:pre-wrap";
    document.body.appendChild(el);
  }
  const time = new Date().toISOString().slice(17, 23);
  el.textContent = `${time} ${message}\n${el.textContent ?? ""}`.slice(0, 4000);
}

function trace(recognition: any, label: string) {
  if (!speechDebug) return;
  for (const type of ["start", "audiostart", "soundstart", "speechstart", "speechend", "soundend", "audioend", "nomatch", "end"]) {
    recognition.addEventListener(type, () => debugLog(`${label} ${type}`));
  }
  recognition.addEventListener("error", (e: any) => debugLog(`${label} error ${e.error} ${e.message ?? ""}`));
  recognition.addEventListener("result", (e: any) => {
    const last = e.results[e.results.length - 1];
    debugLog(`${label} result "${last?.[0]?.transcript ?? ""}"${last?.isFinal ? " final" : ""}`);
  });
}

/**
 * Detach and abort an instance. iOS Safari can deliver onend seconds after stop() and keeps the mic
 * until then, so a lingering instance would restart itself over the next session and steal the mic.
 * Resolves once the instance has really ended (or after a cap) so the next one isn't started on a busy mic.
 */
function retire(recognition: any): Promise<void> {
  if (!recognition) return Promise.resolve();
  recognition.onresult = null;
  recognition.onend = null;
  recognition.onerror = null;
  if (!recognition.__live) return Promise.resolve();
  const released = new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 3000);
    recognition.addEventListener("end", () => {
      clearTimeout(timer);
      resolve();
    });
  });
  try {
    recognition.abort();
  } catch {
    return Promise.resolve();
  }
  return released;
}

/**
 * Track whether WebKit still holds an instance so retire() knows whether to wait for its end.
 * Must run before onend is assigned, so a restart inside onend isn't marked dead right after.
 */
function track(recognition: any) {
  recognition.addEventListener("end", () => {
    recognition.__live = false;
  });
}

function launch(recognition: any) {
  recognition.start();
  recognition.__live = true;
}

/** Detect Android browser */
function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

/** Every iOS browser is WebKit; iPadOS reports itself as a Mac with touch */
function isIOSWebKit(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

/**
 * On iOS, WebKit's shared mic unit won't restart for about a minute after a capture stops, so a
 * second recognition in that window gets no audio at all. Holding a getUserMedia stream keeps the
 * unit running between dictations; it's released after this long without one.
 */
const IOS_MIC_HOLD_MS = 90_000;

export function useSpeechRecognition({ onTranscript, onEnd }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const committedTextRef = useRef(""); // finalized text from previous recognition sessions
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Bumped on every start/stop; events from an instance whose session is stale are dropped */
  const sessionRef = useRef(0);
  /** Recognition runs that ended almost instantly without a result (broken or missing speech service) */
  const quickFailsRef = useRef(0);
  const runStartedAtRef = useRef(0);
  const runGotResultRef = useRef(false);
  /** Settles when the last retired instance has released the mic */
  const releasedRef = useRef<Promise<unknown>>(Promise.resolve());
  const micStreamRef = useRef<MediaStream | null>(null);
  const micReleaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const releaseMic = useCallback(() => {
    if (micReleaseTimerRef.current) {
      clearTimeout(micReleaseTimerRef.current);
      micReleaseTimerRef.current = null;
    }
    if (!micStreamRef.current) return;
    micStreamRef.current.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    debugLog("mic released");
  }, []);

  const holdMic = useCallback(async () => {
    if (micReleaseTimerRef.current) {
      clearTimeout(micReleaseTimerRef.current);
      micReleaseTimerRef.current = null;
    }
    if (micStreamRef.current?.getAudioTracks().some((t) => t.readyState === "live")) return;
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      debugLog("mic held");
    } catch (err) {
      debugLog(`mic hold failed ${String(err)}`);
    }
  }, []);

  const stop = useCallback(() => {
    // Invalidate the session first so late events from the old instance are ignored
    sessionRef.current++;
    listeningRef.current = false;
    setIsListening(false);
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    releasedRef.current = Promise.all([releasedRef.current, retire(recognitionRef.current)]);
    recognitionRef.current = null;
    if (micStreamRef.current) {
      if (micReleaseTimerRef.current) clearTimeout(micReleaseTimerRef.current);
      micReleaseTimerRef.current = setTimeout(releaseMic, IOS_MIC_HOLD_MS);
    }
    // Apply punctuation to final transcript after stopping
    if (lastTranscriptRef.current) {
      const punctuated = ensurePunctuation(lastTranscriptRef.current);
      lastTranscriptRef.current = "";
      committedTextRef.current = "";
      onTranscriptRef.current?.(punctuated);
    }
    committedTextRef.current = "";
    onEndRef.current?.();
  }, [releaseMic]);

  const start = useCallback(
    (lang?: string) => {
      if (!supported) return;
      const released = Promise.all([releasedRef.current, retire(recognitionRef.current)]);
      releasedRef.current = released;
      const ready = isIOSWebKit() ? Promise.all([released, holdMic()]) : released;
      recognitionRef.current = null;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }

      const session = ++sessionRef.current;
      const isCurrent = () => sessionRef.current === session && listeningRef.current;
      const android = isAndroid();
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      track(recognition);
      trace(recognition, `#${session}`);
      // Android Chrome doesn't handle continuous mode well — it re-recognizes
      // the same speech on restart, causing duplicates. Use single-shot on Android.
      recognition.continuous = !android;
      recognition.interimResults = true;
      recognition.lang = lang === "ja" ? "ja-JP" : "en-US";

      const markRunStart = () => {
        runStartedAtRef.current = Date.now();
        runGotResultRef.current = false;
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!isCurrent()) return;
        runGotResultRef.current = true;
        quickFailsRef.current = 0;
        // Build transcript from final + latest interim results.
        let finalText = "";
        let interimText = "";
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }
        const sessionTranscript = finalText + interimText;
        const prefix = committedTextRef.current;
        const full = prefix ? prefix + sessionTranscript : sessionTranscript;
        // Skip if unchanged
        if (full === lastTranscriptRef.current) return;
        lastTranscriptRef.current = full;
        onTranscriptRef.current?.(full);
      };

      recognition.onend = () => {
        if (!isCurrent()) return;

        if (!runGotResultRef.current && Date.now() - runStartedAtRef.current < 1000) {
          quickFailsRef.current++;
          if (quickFailsRef.current >= 3) {
            console.warn("Speech recognition keeps failing instantly; giving up");
            stop();
            return;
          }
        }

        // Commit current transcript before restarting
        if (lastTranscriptRef.current) {
          committedTextRef.current = ensurePunctuation(lastTranscriptRef.current) + " ";
        }

        // Auto-restart: on Android, add a delay so the mic fully stops
        // and doesn't re-capture the same speech.
        if (android) {
          restartTimerRef.current = setTimeout(() => {
            if (!isCurrent()) return;
            // Create a fresh recognition instance on Android to avoid stale results
            const newRecognition = new SR();
            track(newRecognition);
            trace(newRecognition, `#${session}`);
            newRecognition.continuous = false;
            newRecognition.interimResults = true;
            newRecognition.lang = recognition.lang;
            newRecognition.onresult = recognition.onresult;
            newRecognition.onend = recognition.onend;
            newRecognition.onerror = recognition.onerror;
            recognitionRef.current = newRecognition;
            markRunStart();
            try {
              launch(newRecognition);
            } catch {
              // Already started or stopped
            }
          }, 300);
        } else {
          markRunStart();
          try {
            launch(recognition);
          } catch {
            // Already started or stopped
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (!isCurrent()) return;
        console.warn("Speech recognition error:", e.error);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          stop();
        }
      };

      recognitionRef.current = recognition;
      listeningRef.current = true;
      committedTextRef.current = "";
      lastTranscriptRef.current = "";
      quickFailsRef.current = 0;
      setIsListening(true);
      debugLog(`#${session} requested`);
      void ready.then(() => {
        if (!isCurrent()) return;
        markRunStart();
        try {
          launch(recognition);
        } catch (err) {
          debugLog(`#${session} start threw ${String(err)}`);
          stop();
        }
      });
    },
    [supported, stop, holdMic]
  );

  // Don't keep the mic open behind a hidden tab
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && !listeningRef.current) releaseMic();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [releaseMic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionRef.current++;
      listeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      void retire(recognitionRef.current);
      recognitionRef.current = null;
      releaseMic();
    };
  }, [releaseMic]);

  return { isListening, start, stop, supported };
}
