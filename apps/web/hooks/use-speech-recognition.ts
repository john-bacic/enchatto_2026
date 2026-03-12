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

export function useSpeechRecognition({ onTranscript, onEnd }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const supported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const stop = useCallback(() => {
    // Stop recognition first to prevent further onresult events
    listeningRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    // Apply punctuation to final transcript after stopping
    if (lastTranscriptRef.current) {
      const punctuated = ensurePunctuation(lastTranscriptRef.current);
      lastTranscriptRef.current = "";
      onTranscriptRef.current?.(punctuated);
    }
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

      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === "ja" ? "ja-JP" : "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!listeningRef.current) return;
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        lastTranscriptRef.current = transcript;
        onTranscriptRef.current?.(transcript);
      };

      recognition.onend = () => {
        // Auto-restart if user hasn't explicitly stopped
        if (listeningRef.current) {
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
      setIsListening(true);
      recognition.start();
    },
    [supported, stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        listeningRef.current = false;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isListening, start, stop, supported };
}
