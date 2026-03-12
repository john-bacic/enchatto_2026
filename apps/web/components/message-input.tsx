"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ReplyPreview } from "@/components/reply-preview";
import { DrawingModal } from "@/components/drawing-modal";
import { useSpeechRecognition, ensurePunctuation } from "@/hooks/use-speech-recognition";
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
  const [audioLevel, setAudioLevel] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const preVoiceTextRef = useRef("");
  const lastTranscriptRef = useRef("");
  const audioDecayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usedVoiceRef = useRef(false);
  const { isListening, start: startVoice, stop: stopVoice, supported: voiceSupported } =
    useSpeechRecognition({
      onTranscript: (transcript) => {
        const base = preVoiceTextRef.current;
        const punctuated = ensurePunctuation(transcript);
        setText(base ? `${base} ${punctuated}` : punctuated);
        // Detect speech activity from transcript changes
        if (transcript !== lastTranscriptRef.current) {
          lastTranscriptRef.current = transcript;
          setAudioLevel(0.3);
          if (audioDecayRef.current) clearTimeout(audioDecayRef.current);
          // Gradual decay: step down smoothly
          audioDecayRef.current = setTimeout(() => {
            setAudioLevel(0.15);
            audioDecayRef.current = setTimeout(() => {
              setAudioLevel(0);
            }, 200);
          }, 150);
        }
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

  // Reset audio level and transcript ref when listening stops
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0);
      lastTranscriptRef.current = "";
      if (audioDecayRef.current) clearTimeout(audioDecayRef.current);
    }
  }, [isListening]);

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
    if (value.trim() && !isListening) {
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
    let trimmed = text.trim();
    if (!trimmed) return;
    if (isListening) stopVoice();
    // Apply punctuation if voice was used for this message
    if (usedVoiceRef.current) {
      trimmed = ensurePunctuation(trimmed);
    }
    usedVoiceRef.current = false;
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

  const handleMicTap = () => {
    if (isListening) {
      stopVoice();
      onTypingChange?.(null);
    } else {
      preVoiceTextRef.current = text.trim();
      usedVoiceRef.current = true;
      startVoice(lang);
      onTypingChange?.("voicing");
    }
  };

  const hasText = text.trim().length > 0;
  const micScale = 1.0 + audioLevel * 0.8;

  // SF Symbols-style mic.fill icon
  const MicIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="22" x2="16" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  // SF Symbols-style arrow.up.circle.fill icon
  const SendIcon = ({ color, size = 28 }: { color: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill={color} />
      <path d="M14 20V9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9 13l5-5 5 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

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

            <div style={{ flex: 1 }} />

            {/* Right side: mic/send toggle */}
            {isListening ? (
              /* Recording: orange mic + send button side by side */
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                {/* Orange mic with audio-reactive ring */}
                <div style={{ position: "relative", width: "30px", height: "30px" }}>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(249,115,22,0.5)",
                      transform: `scale(${micScale})`,
                      transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  <button
                    onClick={handleMicTap}
                    style={{
                      position: "relative",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "#fff",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <MicIcon color="#f97316" />
                  </button>
                </div>
                {/* Send button (no pulse) */}
                <button
                  onClick={handleSubmit}
                  disabled={!hasText}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: hasText ? "pointer" : "default",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <SendIcon color={hasText ? "var(--primary)" : "var(--border)"} />
                </button>
              </div>
            ) : hasText ? (
              /* Has text, not recording: pulsating send button */
              <div style={{ position: "relative", width: "30px", height: "30px", flexShrink: 0 }}>
                <span
                  className="send-pulse"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "var(--primary)",
                  }}
                />
                <button
                  onClick={handleSubmit}
                  style={{
                    position: "relative",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <SendIcon color="var(--primary)" />
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
            ) : voiceSupported ? (
              /* No text, not recording: grey mic button */
              <button
                onClick={handleMicTap}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#999",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                <MicIcon color="#fff" />
              </button>
            ) : (
              /* Voice not supported: grey disabled send button */
              <button
                onClick={handleSubmit}
                disabled
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "default",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <SendIcon color="var(--border)" />
              </button>
            )}
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
