"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface UseSpeechRecognitionOptions {
  onTranscript?: (text: string) => void;
}

export function useSpeechRecognition({ onTranscript }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const supported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const stop = useCallback(() => {
    listeningRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
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
