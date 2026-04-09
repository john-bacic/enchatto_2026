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

/** Detect Android browser */
function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

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

  const supported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const stop = useCallback(() => {
    // Stop recognition first to prevent further onresult events
    listeningRef.current = false;
    setIsListening(false);
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    // Apply punctuation to final transcript after stopping
    if (lastTranscriptRef.current) {
      const punctuated = ensurePunctuation(lastTranscriptRef.current);
      lastTranscriptRef.current = "";
      committedTextRef.current = "";
      onTranscriptRef.current?.(punctuated);
    }
    committedTextRef.current = "";
    onEndRef.current?.();
  }, []);

  const start = useCallback(
    (lang?: string) => {
      if (!supported) return;
      // Stop any existing instance
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      const android = isAndroid();
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      // Android Chrome doesn't handle continuous mode well — it re-recognizes
      // the same speech on restart, causing duplicates. Use single-shot on Android.
      recognition.continuous = !android;
      recognition.interimResults = true;
      recognition.lang = lang === "ja" ? "ja-JP" : "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!listeningRef.current) return;
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
        if (!listeningRef.current) return;

        // Commit current transcript before restarting
        if (lastTranscriptRef.current) {
          committedTextRef.current = ensurePunctuation(lastTranscriptRef.current) + " ";
        }

        // Auto-restart: on Android, add a delay so the mic fully stops
        // and doesn't re-capture the same speech.
        if (android) {
          restartTimerRef.current = setTimeout(() => {
            if (listeningRef.current) {
              // Create a fresh recognition instance on Android to avoid stale results
              const newRecognition = new SR();
              newRecognition.continuous = false;
              newRecognition.interimResults = true;
              newRecognition.lang = recognition.lang;
              newRecognition.onresult = recognition.onresult;
              newRecognition.onend = recognition.onend;
              newRecognition.onerror = recognition.onerror;
              recognitionRef.current = newRecognition;
              try {
                newRecognition.start();
              } catch {
                // Already started or stopped
              }
            }
          }, 300);
        } else {
          try {
            recognition.start();
          } catch {
            // Already started or stopped
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          stop();
        }
      };

      recognitionRef.current = recognition;
      listeningRef.current = true;
      committedTextRef.current = "";
      lastTranscriptRef.current = "";
      setIsListening(true);
      recognition.start();
    },
    [supported, stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        listeningRef.current = false;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isListening, start, stop, supported };
}
