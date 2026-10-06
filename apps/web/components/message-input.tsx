"use client";

import { forwardRef, useState, useRef, useEffect, useCallback, useImperativeHandle } from "react";
import { ReplyPreview } from "@/components/reply-preview";
import { DrawingModal } from "@/components/drawing-modal";
import { useSpeechRecognition, ensurePunctuation, isAndroid } from "@/hooks/use-speech-recognition";
import { useVoiceClip, type VoiceClip } from "@/hooks/use-voice-clip";
import { Icon } from "@/components/ui/icon";
import { t } from "@/lib/i18n";
import { isImeComposing } from "@/lib/keyboard";

function fitTextarea(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

const WAVE_SAMPLES = 64;
const VOICE_MODE_KEY = "enchatto_voiceMode";
const VOICE_HINT_KEY = "enchatto_voiceModeHinted";
const LONG_PRESS_MS = 450;
const MIN_CLIP_MS = 600;
const MAX_CLIP_MS = 120_000;

type VoiceMode = "text" | "voice";

function formatClock(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Scrolling dictation meter: newest sample on the right, silence drawn as dots */
function VoiceWave({ level, micLevelRef }: { level: number; micLevelRef?: React.RefObject<number> }) {
  const levelRef = useRef(level);
  levelRef.current = level;
  const micRef = useRef(micLevelRef);
  micRef.current = micLevelRef;
  const [samples, setSamples] = useState<number[]>(() => Array(WAVE_SAMPLES).fill(0));

  useEffect(() => {
    const id = setInterval(() => {
      const mic = micRef.current?.current;
      let v: number;
      if (mic != null) {
        v = mic < 0.04 ? 0 : mic;
      } else {
        // Web Speech exposes no mic level, only word activity, so jitter it into a believable wave
        const l = levelRef.current;
        v = l > 0 ? Math.min(1, l * (1.4 + Math.random() * 1.8)) : 0;
      }
      setSamples((prev) => [...prev.slice(1), v]);
    }, 70);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ec-voice-wave" aria-hidden>
      {samples.map((v, i) => (
        <i key={i} className={v > 0 ? "on" : undefined} style={v > 0 ? { height: `${Math.round(4 + v * 22)}px` } : undefined} />
      ))}
    </div>
  );
}

/** Icon-only Text | Voice switch; the selected side takes the pill's color */
function VoiceModeSwitch({
  mode,
  nudge,
  onChange,
  lang,
}: {
  mode: VoiceMode;
  nudge: boolean;
  onChange: (mode: VoiceMode) => void;
  lang?: string;
}) {
  return (
    <div className={`ec-voice-mode${nudge ? " nudge" : ""}`} role="radiogroup" aria-label={t("Send as", lang)}>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "text"}
        aria-label={t("Text", lang)}
        className={mode === "text" ? "on" : undefined}
        onClick={() => onChange("text")}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M4 6h16M4 12h11M4 18h7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "voice"}
        aria-label={t("Voice message", lang)}
        className={mode === "voice" ? "on voice" : "voice"}
        onClick={() => onChange("voice")}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="8.5" y="2" width="7" height="12.5" rx="3.5" />
          <path d="M5 11a7 7 0 0 0 14 0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/** No `text` means the server transcribes the clip; `lang` is what was spoken, as a hint for that */
export type OutgoingVoiceClip = VoiceClip & { text?: string; lang: "en" | "ja" };

interface ReplyTo {
  _id: string;
  text?: string;
  senderId: string;
}

/** What the room page asks of the message box */
export interface MessageInputHandle {
  /**
   * Puts a suggestion in the field in place of whatever the field holds, as if it had been typed by hand. Nothing is
   * sent. A dictation that is running ends first, as its Cancel ends it. While a voice message is being recorded
   * nothing is done: the recording runs on.
   */
  fill: (suggestion: string) => void;
}

interface MessageInputProps {
  onSend: (text: string) => void;
  onSendImage?: (file: File) => void;
  onSendDrawing?: (dataUrl: string) => void;
  onSendVoice?: (clip: OutgoingVoiceClip) => void;
  onGameTap?: () => void;
  isGameActive?: boolean;
  onEndGame?: () => void;
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onTypingChange?: (action: "typing" | "drawing" | "voicing" | null) => void;
  lang?: string;
}

export const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(function MessageInput({
  onSend,
  onSendImage,
  onSendDrawing,
  onSendVoice,
  onGameTap,
  isGameActive,
  onEndGame,
  replyTo,
  onCancelReply,
  onTypingChange,
  lang,
}, ref) {
  const [text, setText] = useState("");
  const [showDrawing, setShowDrawing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsCollapsed = (isFocused || text.length > 0) && !toolsOpen;
  const refocusRef = useRef(false);
  /** The field takes the focus when it is drawn again in the place of dictation's pill */
  const focusOnReturnRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const preVoiceTextRef = useRef("");
  const lastTranscriptRef = useRef("");
  const audioDecayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usedVoiceRef = useRef(false);
  /** Only the dictated words, without whatever was typed before; becomes a voice message's transcript */
  const dictatedRef = useRef("");
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("text");
  const [modeNudge, setModeNudge] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const clipLimitRef = useRef<() => void>(() => {});
  const voiceClip = useVoiceClip({ maxMs: MAX_CLIP_MS, onLimit: () => clipLimitRef.current() });
  const { isListening, start: startVoice, stop: stopVoice, supported: voiceSupported } =
    useSpeechRecognition({
      onTranscript: (transcript) => {
        const base = preVoiceTextRef.current;
        const punctuated = ensurePunctuation(transcript);
        dictatedRef.current = punctuated;
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
    if (inputRef.current) fitTextarea(inputRef.current);
  }, [text]);

  // Re-fit when the field widens or narrows as the tools fold away
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    fitTextarea(el);
    let lastWidth = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === lastWidth) return;
      lastWidth = el.clientWidth;
      fitTextarea(el);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isListening]);

  // Reset audio level and transcript ref when listening stops
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0);
      lastTranscriptRef.current = "";
      if (audioDecayRef.current) clearTimeout(audioDecayRef.current);
    }
  }, [isListening]);

  useEffect(() => {
    try {
      if (localStorage.getItem(VOICE_MODE_KEY) === "voice") setVoiceMode("voice");
    } catch {
      // storage blocked
    }
  }, []);

  const chooseVoiceMode = (mode: VoiceMode) => {
    setVoiceMode(mode);
    try {
      localStorage.setItem(VOICE_MODE_KEY, mode);
    } catch {
      // storage blocked
    }
  };

  // Dictation ended on its own (error, repeated failures): drop the half-made recording
  const { recording: clipRecording, discard: discardClip } = voiceClip;
  useEffect(() => {
    if (!isListening && clipRecording) discardClip();
  }, [isListening, clipRecording, discardClip]);

  useEffect(() => {
    if (!modeNudge) return;
    const timer = setTimeout(() => setModeNudge(false), 1600);
    return () => clearTimeout(timer);
  }, [modeNudge]);

  const sendingVoice = isListening && clipRecording && voiceMode === "voice";

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
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  /** Tells the room that this person is typing, until two seconds have passed without it being told again */
  const signalTyping = () => {
    onTypingChange?.("typing");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingChange?.(null);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    setToolsOpen(false);
    if (value.trim() && !isListening) signalTyping();
    else clearTyping();
  };

  // A suggestion takes the place of whatever the field holds, and from there on the field is as if the suggestion
  // had been typed by hand: the person sends it, or edits it first. A dictation of words for the field ends as its
  // Cancel ends it, the words it heard dropped with the recording that runs beside them, and the suggestion is sent
  // as it reads, whatever was dictated before it
  const fill = (suggestion: string) => {
    // A chip with nothing on it leaves the field as it is
    if (!suggestion.trim()) return;
    // A voice message that is being recorded is no text of the field's, and once dropped it cannot be had back:
    // it runs on, to be sent or cancelled from its own pill, and the tap does nothing
    if (sendingVoice) return;
    // A press on the mic that has not yet been held long enough starts no dictation over the suggestion
    clearLongPress();
    voiceClip.discard();
    // stop() hands over the last transcript before it returns, so the text is set after it
    if (isListening) stopVoice();
    usedVoiceRef.current = false;
    preVoiceTextRef.current = "";
    dictatedRef.current = "";
    setText(suggestion);
    setToolsOpen(false);
    signalTyping();
    // A phone's keyboard stays as it is: the chip leaves the focus where it was (suggestion-chips.tsx), and the
    // field is not given it here. On a computer the field takes the focus, so that Enter sends
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (isListening) focusOnReturnRef.current = true;
    else inputRef.current?.focus();
  };
  useImperativeHandle(ref, () => ({ fill }));

  // While dictation runs its pill stands in the field's place: the field that a suggestion ended dictation for
  // takes the focus here, once it is drawn again
  useEffect(() => {
    if (isListening || !focusOnReturnRef.current) return;
    focusOnReturnRef.current = false;
    inputRef.current?.focus();
  }, [isListening]);

  const handleSendVoice = async () => {
    if (!isListening) return;
    // stop() synchronously emits the final transcript into dictatedRef
    stopVoice();
    onTypingChange?.(null);
    const transcript = dictatedRef.current ? ensurePunctuation(dictatedRef.current) : "";
    dictatedRef.current = "";
    usedVoiceRef.current = false;
    setText(preVoiceTextRef.current);
    preVoiceTextRef.current = "";
    const clip = await voiceClip.finish();
    if (clip && clip.durationMs >= MIN_CLIP_MS) {
      onSendVoice?.({ ...clip, text: transcript || undefined, lang: lang === "ja" ? "ja" : "en" });
    } else if (transcript) {
      onSend(transcript);
    }
  };

  clipLimitRef.current = () => {
    if (sendingVoice) void handleSendVoice();
    else voiceClip.discard();
  };

  const handleSubmit = () => {
    if (sendingVoice) {
      void handleSendVoice();
      return;
    }
    let trimmed = text.trim();
    if (!trimmed) return;
    voiceClip.discard();
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

  const handleClear = () => {
    voiceClip.discard();
    if (isListening) {
      stopVoice();
      onTypingChange?.(null);
    }
    usedVoiceRef.current = false;
    preVoiceTextRef.current = "";
    clearTyping();
    setText("");
    inputRef.current?.focus();
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

  const canRecord = !!onSendVoice && voiceClip.supported;
  const android = isAndroid();

  /** `base` restarts a running dictation (Android mode switch) on top of the text typed before it */
  const beginVoice = (mode: VoiceMode, base?: string) => {
    if (isListening && base === undefined) return;
    preVoiceTextRef.current = base ?? text.trim();
    dictatedRef.current = "";
    usedVoiceRef.current = true;
    if (mode !== voiceMode) chooseVoiceMode(mode);
    // Android: one or the other. Voice mode records and the server transcribes; text mode only recognizes
    const record = canRecord && (!android || mode === "voice");
    const mic = startVoice(lang, { holdMic: record, recognize: !(android && record) });
    onTypingChange?.("voicing");
    if (record) {
      void mic.then((stream) => {
        if (stream) voiceClip.start(stream);
      });
    }
    if (canRecord) {
      try {
        if (!localStorage.getItem(VOICE_HINT_KEY)) {
          localStorage.setItem(VOICE_HINT_KEY, "1");
          setModeNudge(true);
        }
      } catch {
        // storage blocked
      }
    }
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  // Tap dictates in the last-used mode; holding the mic starts straight in voice mode
  const micHandlers = {
    onPointerDown: () => {
      voiceClip.arm();
      longPressedRef.current = false;
      clearLongPress();
      longPressTimerRef.current = setTimeout(() => {
        longPressedRef.current = true;
        navigator.vibrate?.(12);
        beginVoice("voice");
      }, LONG_PRESS_MS);
    },
    onPointerUp: clearLongPress,
    onPointerLeave: clearLongPress,
    onPointerCancel: clearLongPress,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    onClick: () => {
      clearLongPress();
      if (longPressedRef.current) {
        longPressedRef.current = false;
        return;
      }
      voiceClip.arm();
      beginVoice(voiceMode);
    },
  };

  const handleModeSwitch = (mode: VoiceMode) => {
    if (mode === voiceMode) return;
    if (!android || !isListening) {
      chooseVoiceMode(mode);
      return;
    }
    // Android can't record and recognize at once, so start over in the new mode
    const base = preVoiceTextRef.current;
    voiceClip.discard();
    stopVoice();
    setText(base);
    beginVoice(mode, base);
  };

  /** Keeps the dictated text in the field for editing */
  const handleVoiceStop = () => {
    voiceClip.discard();
    stopVoice();
    onTypingChange?.(null);
  };

  /** Throws the dictation away and restores whatever was typed before */
  const handleVoiceCancel = () => {
    voiceClip.discard();
    stopVoice();
    usedVoiceRef.current = false;
    setText(preVoiceTextRef.current);
    preVoiceTextRef.current = "";
    onTypingChange?.(null);
  };

  const hasText = text.trim().length > 0;

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
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        handleSubmit();
        inputRef.current?.blur();
      }}
      disabled={!hasText && !sendingVoice}
      aria-label={sendingVoice ? t("Send voice message", lang) : t("Send", lang)}
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

        {isListening && (
          <div className="ec-voice-live-row">
            <div className="ec-voice-live" aria-live="polite">
              <span className={text.trim() ? undefined : "idle"}>
                {text.trim() || (sendingVoice ? t("Recording...", lang) : t("Listening...", lang))}
              </span>
            </div>
            {(clipRecording || (android && canRecord)) && (
              <VoiceModeSwitch mode={voiceMode} nudge={modeNudge} onChange={handleModeSwitch} lang={lang} />
            )}
          </div>
        )}

        <div className="ec-input-row">
          {isListening ? (
            /* Replaces the field while dictating; send stays outside where the mic was */
            <div className={`ec-voice-pill${sendingVoice ? " voice" : ""}`}>
              <button type="button" className="ec-voice-btn" onClick={handleVoiceCancel} aria-label={t("Cancel", lang)}>
                <svg viewBox="0 0 10 10" aria-hidden>
                  <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                </svg>
              </button>
              <VoiceWave level={audioLevel} micLevelRef={clipRecording ? voiceClip.levelRef : undefined} />
              {sendingVoice ? (
                <span className="ec-voice-timer" role="timer">
                  <i aria-hidden />
                  {formatClock(voiceClip.elapsedMs)}
                </span>
              ) : (
                <button type="button" className="ec-voice-btn" onClick={handleVoiceStop} aria-label={t("Stop", lang)}>
                  <span className="ec-voice-stop" />
                </button>
              )}
            </div>
          ) : (
          <>
          {/* Tools fold into a chevron while typing so the field gets the width */}
          <div className={`ec-tools${toolsCollapsed ? " collapsed" : ""}`} aria-hidden={toolsCollapsed || undefined}>
            {/* Game button — End Game when active, Game otherwise */}
            {isGameActive && onEndGame ? (
              <button
                className="ec-round-btn end-game"
                onClick={onEndGame}
                aria-label={t("End Game", lang)}
                tabIndex={toolsCollapsed ? -1 : undefined}
              >
                <span className="ec-end-game-stop" />
              </button>
            ) : onGameTap ? (
              <button
                className="ec-round-btn game"
                onClick={onGameTap}
                aria-label={t("Games", lang)}
                tabIndex={toolsCollapsed ? -1 : undefined}
              >
                <Icon name="ui-game" size={26} />
              </button>
            ) : null}

            {/* Drawing */}
            <button
              className="ec-round-btn draw"
              onClick={() => {
                setShowDrawing(true);
                onTypingChange?.("drawing");
              }}
              aria-label={t("Drawing", lang)}
              tabIndex={toolsCollapsed ? -1 : undefined}
            >
              <Icon name="g-pencil" size={24} />
            </button>

            {/* Photo — directly opens native image picker */}
            <button
              className="ec-round-btn photo"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t("Photo", lang)}
              tabIndex={toolsCollapsed ? -1 : undefined}
            >
              <Icon name="ui-camera" size={24} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className={`ec-tools-toggle${toolsCollapsed ? " shown" : ""}`}
            onPointerDown={() => {
              refocusRef.current = document.activeElement === inputRef.current;
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setToolsOpen(true);
              if (refocusRef.current) inputRef.current?.focus();
            }}
            aria-label={t("More tools", lang)}
            aria-hidden={!toolsCollapsed || undefined}
            tabIndex={toolsCollapsed ? undefined : -1}
          >
            <svg viewBox="0 0 10 16" aria-hidden>
              <path d="M2.5 2l5.5 6-5.5 6" />
            </svg>
          </button>

          {/* Text field */}
          <div className="ec-text-pill">
            <textarea
              ref={inputRef}
              value={text}
              readOnly={isListening}
              onFocus={(e) => {
                if (isListening) e.currentTarget.blur();
                else setIsFocused(true);
              }}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (isImeComposing(e)) return;
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                  if (window.matchMedia("(pointer: coarse)").matches) e.currentTarget.blur();
                }
              }}
              placeholder={isListening ? t("Listening...", lang) : t("Type a message...", lang)}
              rows={1}
              onInput={(e) => fitTextarea(e.currentTarget)}
            />
            {text.length > 0 && (
              <button
                type="button"
                className="ec-clear-text"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                aria-label={t("Clear", lang)}
              >
                <svg viewBox="0 0 10 10" aria-hidden>
                  <path d="M1 1l8 8M9 1l-8 8" />
                </svg>
              </button>
            )}
          </div>
          </>
          )}

          {/* Right side: mic/send toggle */}
          {isListening || hasText || !voiceSupported ? (
            sendButton
          ) : (
            <button className="ec-round-btn mic" {...micHandlers} aria-label={t("Voice", lang)}>
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
});
