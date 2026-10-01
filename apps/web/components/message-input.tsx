"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ReplyPreview } from "@/components/reply-preview";
import { DrawingModal } from "@/components/drawing-modal";
import { useSpeechRecognition, ensurePunctuation } from "@/hooks/use-speech-recognition";
import { Icon } from "@/components/ui/icon";
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
  onGameTap?: () => void;
  isGameActive?: boolean;
  onEndGame?: () => void;
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onTypingChange?: (action: "typing" | "drawing" | "voicing" | null) => void;
  lang?: string;
}

export function MessageInput({
  onSend,
  onSendImage,
  onSendDrawing,
  onGameTap,
  isGameActive,
  onEndGame,
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
        setText(base ? `${base} ${punctuated} ` : `${punctuated} `);
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

  const MicIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="8.5" y="2" width="7" height="12.5" rx="3.5" />
      <path d="M5 11a7 7 0 0 0 14 0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );

  const SendIcon = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 20V5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M5.5 11.5L12 5l6.5 6.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const sendButton = (
    <button
      className="ec-round-btn send"
      onClick={handleSubmit}
      disabled={!hasText}
      aria-label={t("Send", lang)}
    >
      <SendIcon />
    </button>
  );

  return (
    <>
      <div className="ec-inputbar">
        {/* Reply indicator */}
        {replyTo && (
          <div className="ec-reply-bar">
            <div style={{ flex: 1, minWidth: 0 }}>
              <ReplyPreview originalText={replyTo.text ?? ""} senderName="" lang={lang} />
            </div>
            <button className="ec-chip outline" onClick={onCancelReply} style={{ flex: "none", cursor: "pointer" }}>
              {t("Cancel", lang)}
            </button>
          </div>
        )}

        <div className="ec-input-row">
          {/* Game button — End Game when active, Game otherwise */}
          {isGameActive && onEndGame ? (
            <button className="ec-end-game" onClick={onEndGame}>
              {t("End Game", lang)}
            </button>
          ) : onGameTap ? (
            <button className="ec-round-btn game" onClick={onGameTap} aria-label={t("Games", lang)}>
              <Icon name="ui-game" size={28} />
            </button>
          ) : null}

          {/* Photo — directly opens native image picker */}
          <button
            className="ec-round-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("Photo", lang)}
          >
            <Icon name="ui-photo" size={28} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          {/* Drawing */}
          <button
            className="ec-round-btn"
            onClick={() => {
              setShowDrawing(true);
              onTypingChange?.("drawing");
            }}
            aria-label={t("Drawing", lang)}
          >
            <Icon name="g-pencil" size={28} />
          </button>

          {/* Text field */}
          <div className="ec-text-pill">
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
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
          </div>

          {/* Right side: mic/send toggle */}
          {isListening ? (
            <>
              {/* Live mic with audio-reactive ring */}
              <div className="ec-mic-wrap">
                <span className="ec-mic-ring" style={{ transform: `scale(${micScale})` }} />
                <button className="ec-round-btn mic live" onClick={handleMicTap} aria-label={t("Voice", lang)} style={{ position: "relative" }}>
                  <MicIcon />
                </button>
              </div>
              {sendButton}
            </>
          ) : hasText || !voiceSupported ? (
            sendButton
          ) : (
            <button className="ec-round-btn mic" onClick={handleMicTap} aria-label={t("Voice", lang)}>
              <MicIcon />
            </button>
          )}
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
