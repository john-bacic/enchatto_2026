"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ReplyPreview } from "@/components/reply-preview";
import { DrawingModal } from "@/components/drawing-modal";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { t } from "@/lib/i18n";

interface ReplyTo {
  _id: string;
  text?: string;
  senderId: string;
}

interface MessageInputProps {
  onSend: (text: string) => void;
  onSendImage?: (file: File) => void;
  onSendDrawing?: (dataUrl: string) => void;
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onTypingChange?: (action: "typing" | "drawing" | "voicing" | null) => void;
  lang?: string;
}

export function MessageInput({
  onSend,
  onSendImage,
  onSendDrawing,
  replyTo,
  onCancelReply,
  onTypingChange,
  lang,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [showDrawing, setShowDrawing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const preVoiceTextRef = useRef("");
  const { isListening, start: startVoice, stop: stopVoice, supported: voiceSupported } =
    useSpeechRecognition({
      onTranscript: (transcript) => {
        const base = preVoiceTextRef.current;
        setText(base ? `${base} ${transcript}` : transcript);
      },
    });
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea when text changes (e.g. from voice input)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [text]);

  const clearTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    onTypingChange?.(null);
  }, [onTypingChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim()) {
      onTypingChange?.("typing");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange?.(null);
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      clearTyping();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isListening) stopVoice();
    preVoiceTextRef.current = "";
    clearTyping();
    onSend(trimmed);
    setText("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      if (!isListening) inputRef.current.focus();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendImage?.(file);
      e.target.value = "";
    }
  };

  const handleDrawingSave = (dataUrl: string) => {
    setShowDrawing(false);
    onTypingChange?.(null);
    onSendDrawing?.(dataUrl);
  };

  const hasText = text.trim().length > 0;

  return (
    <>
      <div style={{ background: "var(--surface)", padding: "0.5rem 0.625rem 0.5rem" }}>
        {/* Reply indicator */}
        {replyTo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              paddingLeft: "0.375rem",
            }}
          >
            <ReplyPreview originalText={replyTo.text ?? ""} senderName="" lang={lang} />
            <button
              onClick={onCancelReply}
              style={{
                background: "none",
                fontSize: "0.8rem",
                color: "var(--muted)",
                padding: "0.2rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t("Cancel", lang)}
            </button>
          </div>
        )}

        {/* Card container */}
        <div
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
          }}
        >
          {/* Text area */}
          <textarea
            ref={inputRef}
            value={text}
            readOnly={isListening}
            onFocus={(e) => { if (isListening) e.currentTarget.blur(); }}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={isListening ? t("Listening...", lang) : t("Type a message...", lang)}
            rows={1}
            style={{
              width: "100%",
              padding: "0.75rem 0.875rem 0.25rem",
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "1.4",
              maxHeight: "7.5rem",
              overflowY: "auto",
              background: "transparent",
              color: "inherit",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />

          {/* Bottom toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.625rem 0.625rem",
            }}
          >
            {/* Plus button — directly opens native image picker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "var(--border)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1rem",
                color: "var(--muted)",
                flexShrink: 0,
              }}
            >
              +
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            {/* Drawing pill */}
            <button
              onClick={() => {
                setShowDrawing(true);
                onTypingChange?.("drawing");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.35rem 0.625rem",
                borderRadius: "999px",
                background: "var(--border)",
                border: "none",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "var(--muted)",
                flexShrink: 0,
              }}
            >
              {t("✏️ Draw", lang)}
            </button>

            {/* Voice pill */}
            {voiceSupported && (
              <button
                onClick={() => {
                  if (isListening) {
                    stopVoice();
                    onTypingChange?.(null);
                  } else {
                    preVoiceTextRef.current = text.trim();
                    startVoice(lang);
                    onTypingChange?.("voicing");
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.35rem 0.625rem",
                  borderRadius: "999px",
                  background: isListening ? "rgba(239,68,68,0.1)" : "var(--border)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: isListening ? "#ef4444" : "var(--muted)",
                  flexShrink: 0,
                }}
              >
                {t("🎤 Voice", lang)}
              </button>
            )}

            <div style={{ flex: 1 }} />

            {/* Send button (circle arrow) */}
            <div style={{ position: "relative", width: "30px", height: "30px", flexShrink: 0 }}>
              {hasText && (
                <span
                  className="send-pulse"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "var(--primary)",
                  }}
                />
              )}
              <button
                onClick={handleSubmit}
                disabled={!hasText}
                style={{
                  position: "relative",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: hasText ? "var(--primary)" : "var(--border)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: hasText ? "pointer" : "default",
                  transition: "background 0.15s ease",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={hasText ? "#fff" : "var(--muted)"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
              <style jsx>{`
                .send-pulse {
                  animation: sendPulse 1.5s ease-out infinite;
                }
                @keyframes sendPulse {
                  0% { transform: scale(1); opacity: 0.5; }
                  100% { transform: scale(1.8); opacity: 0; }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>

      {/* Drawing modal */}
      <DrawingModal
        isOpen={showDrawing}
        onSave={handleDrawingSave}
        onClose={() => {
          setShowDrawing(false);
          onTypingChange?.(null);
        }}
        lang={lang}
      />
    </>
  );
}
