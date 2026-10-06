"use client";

import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { ReplyPreview } from "@/components/reply-preview";
import { ReactionBar } from "@/components/reaction-bar";
import { SuggestionChips } from "@/components/suggestion-chips";
import { MessageImage } from "@/components/message-image";
import { MessageDrawing } from "@/components/message-drawing";
import { VoiceMessage } from "@/components/message-voice";
import { AvatarDisc } from "@/components/ui/avatar";
import { Chatto } from "@/components/ui/chatto";
import { EmojiArt, Icon } from "@/components/ui/icon";
import { t } from "@/lib/i18n";
import { avatarTint, isQueuedMessageId } from "@/lib/types";

interface ProcessingState {
  translatedText?: string;
  romaji?: string;
  suggestions?: string[];
  error?: string;
}

interface MessageData {
  _id: string;
  senderId: string;
  kind: string;
  status: string;
  text?: string;
  mediaUrl?: string;
  durationMs?: number;
  waveform?: number[];
  processing?: ProcessingState;
  replyToId?: string;
  createdAt: number;
}

/** A person as the room page hands them down: these fields and no others */
interface ParticipantData {
  _id: string;
  nickname: string;
  role: string;
  avatar: { type: string; value: string };
}

interface MessageItemProps {
  message: MessageData;
  sender: ParticipantData | undefined;
  isOwn: boolean;
  replyToMessage?: MessageData;
  replyToSender?: ParticipantData;
  onReply: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string, hasReacted: boolean) => void;
  currentParticipantId: string;
  preferredLanguage?: string;
  lang?: string;
  showEnglish?: boolean;
  showJapanese?: boolean;
  showRomaji?: boolean;
  onImageLoad?: () => void;
  /** Little Chatto riding on the bubble while its translation is in flight. */
  showCarrier?: boolean;
  /** Marquee lights around the bubble (hype mode, latest message). */
  highlight?: boolean;
}

/** Check if text contains Japanese characters (Hiragana, Katakana, CJK) */
export function isJapaneseText(text: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
}

/** Get the English and Japanese text from a message, regardless of which field they're in */
function getLanguageTexts(message: MessageData) {
  const originalIsJapanese = message.text ? isJapaneseText(message.text) : false;
  return {
    english: originalIsJapanese ? message.processing?.translatedText : message.text,
    japanese: originalIsJapanese ? message.text : message.processing?.translatedText,
  };
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function ReactionPill({
  emoji,
  count,
  mine,
  onClick,
}: {
  emoji: string;
  count: number;
  mine: boolean;
  onClick: () => void;
}) {
  const prevCount = useRef(count);
  const [popKey, setPopKey] = useState(0);
  useEffect(() => {
    if (count > prevCount.current) setPopKey((k) => k + 1);
    prevCount.current = count;
  }, [count]);

  return (
    <button className={`ec-react${mine ? " mine" : ""}`} onClick={onClick}>
      <span key={popKey} className={`ec-react-in${popKey ? " pop" : ""}`}>
        <EmojiArt emoji={emoji} size={18} />
        {count > 1 && <b>{count}</b>}
      </span>
    </button>
  );
}

function InlineReactions({
  messageId,
  currentParticipantId,
  onToggleReaction,
}: {
  messageId: string;
  currentParticipantId: string;
  onToggleReaction?: (messageId: string, emoji: string, hasReacted: boolean) => void;
}) {
  const summaryList = useQuery(
    api.reactions.getReactionSummary,
    isQueuedMessageId(messageId) ? "skip" : { messageId: messageId as Id<"messages"> }
  );

  const reactions = (summaryList ?? []).filter((r) => r.count > 0);
  if (reactions.length === 0) return null;

  return (
    <div className="ec-reacts">
      {reactions.map((r) => {
        const isMine = r.participantIds.includes(currentParticipantId);
        return (
          <ReactionPill
            key={r.emoji}
            emoji={r.emoji}
            count={r.count}
            mine={isMine}
            onClick={() => onToggleReaction?.(messageId, r.emoji, isMine)}
          />
        );
      })}
    </div>
  );
}

// The list draws a bubble again only when one of its props is another value or object. The page hands down the
// object it handed down before for a message or a person that holds what it held, and the same handlers
// (lib/stable.ts)
export const MessageItem = memo(function MessageItem({
  message,
  sender,
  isOwn,
  replyToMessage,
  replyToSender,
  onReply,
  onToggleReaction,
  currentParticipantId,
  preferredLanguage = "en",
  lang,
  showEnglish = true,
  showJapanese = true,
  showRomaji = true,
  onImageLoad,
  showCarrier = false,
  highlight = false,
}: MessageItemProps) {
  const senderName = sender?.nickname ?? "Unknown";
  const isAudio = message.kind === "audio";
  const [textOpen, setTextOpen] = useState(false);
  // A voice message is delivered the moment it lands; only its collapsed transcript is still translating
  const showsText = message.kind === "text" || (isAudio && textOpen);
  const isPending = message.status === "pending" && (!isAudio || textOpen);
  const isFailed = message.status === "failed" && (!isAudio || textOpen);
  const isMedia = message.kind === "image" || message.kind === "drawing";

  const [showModal, setShowModal] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // "GOT IT!" stamp: only for a pending → processed transition seen in this session.
  const prevStatus = useRef(message.status);
  const [stampKey, setStampKey] = useState(0);
  useEffect(() => {
    if (prevStatus.current === "pending" && message.status === "processed" && message.kind === "text") {
      setStampKey((k) => k + 1);
    }
    prevStatus.current = message.status;
  }, [message.status, message.kind]);
  useEffect(() => {
    if (!stampKey) return;
    const timer = setTimeout(() => setStampKey(0), 3000);
    return () => clearTimeout(timer);
  }, [stampKey]);

  const handlePointerDown = () => {
    if (isOwn) return;
    const timer = setTimeout(() => setShowModal(true), 500);
    setLongPressTimer(timer);
  };

  const handlePointerUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isOwn) return;
    e.preventDefault();
    setShowModal(true);
  };

  // Others' bubbles take their avatar colour so a busy room is easy to scan
  const tint = !isOwn && sender ? avatarTint(sender.avatar.value) : undefined;

  const bubbleClass = [
    "ec-bubble",
    isMedia ? "media" : "",
    isPending && !isAudio ? "pending" : "",
    isFailed && !isAudio ? "failed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={`ec-msg${isOwn ? " own" : ""}`}>
        {/* Reply preview */}
        {replyToMessage && (
          <div style={{ marginLeft: isOwn ? 0 : 50, maxWidth: "80%" }}>
            <ReplyPreview
              originalText={replyToMessage.text ?? ""}
              senderName={replyToSender?.nickname ?? "Unknown"}
              senderAvatar={replyToSender?.avatar.value}
              messageKind={replyToMessage.kind}
              lang={lang}
            />
          </div>
        )}

        {/* Main row: avatar + bubble + reaction button */}
        <div className="ec-msg-row">
          {/* Avatar column (others only) */}
          {!isOwn && (
            <div className="ec-who">
              {sender ? (
                <AvatarDisc id={sender.avatar.value} size={36} border={2.5} />
              ) : (
                <span className="ec-stack-empty" style={{ width: 36, height: 36 }}>?</span>
              )}
              <small>{senderName}</small>
            </div>
          )}

          <div className="ec-bubble-col">
            {/* Bubble */}
            <div
              className={bubbleClass}
              style={tint ? ({ "--bubble-tint": tint } as React.CSSProperties) : undefined}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onContextMenu={handleContextMenu}
            >
              {message.kind === "image" && message.mediaUrl && (
                <MessageImage src={message.mediaUrl} onLoad={onImageLoad} />
              )}
              {message.kind === "drawing" && message.mediaUrl && (
                <MessageDrawing src={message.mediaUrl} onLoad={onImageLoad} />
              )}
              {isAudio && (
                <>
                  <VoiceMessage
                    messageId={message._id}
                    src={message.mediaUrl}
                    durationMs={message.durationMs}
                    waveform={message.waveform}
                    trackUnplayed={!isOwn}
                    lang={lang}
                  />
                  {message.text && (
                    <button
                      type="button"
                      className={`ec-vm-show${textOpen ? " open" : ""}`}
                      onClick={() => setTextOpen((open) => !open)}
                      onPointerDown={(e) => e.stopPropagation()}
                      aria-expanded={textOpen}
                    >
                      <svg viewBox="0 0 10 10" aria-hidden>
                        <path d="M2 3.5l3 3 3-3" />
                      </svg>
                      {textOpen ? t("Hide text", lang) : t("Show text", lang)}
                    </button>
                  )}
                </>
              )}
              {showsText && (() => {
                const { english, japanese } = getLanguageTexts(message);
                const romaji = message.processing?.romaji;
                // Primary: show preferred language first, fallback to other
                const primaryText = preferredLanguage === "ja"
                  ? (showJapanese && japanese ? japanese : showEnglish && english ? english : null)
                  : (showEnglish && english ? english : showJapanese && japanese ? japanese : null);
                // Romaji grouped with Japanese whenever Japanese is the displayed primary text
                const japaneseIsPrimary = preferredLanguage === "ja"
                  ? (showJapanese && !!japanese)
                  : (!(showEnglish && !!english) && showJapanese && !!japanese);
                const showRomajiWithPrimary = japaneseIsPrimary && showRomaji && !!romaji;
                return primaryText ? (
                  <>
                    <p>{primaryText}</p>
                    {showRomajiWithPrimary && <p className="ec-romaji">{romaji}</p>}
                  </>
                ) : null;
              })()}
              {message.kind === "system" && message.text && (
                <p style={{ fontStyle: "italic", fontSize: 13, opacity: 0.7 }}>{message.text}</p>
              )}
              {message.processing &&
                message.status === "processed" &&
                showsText && (() => {
                  const { english, japanese } = getLanguageTexts(message);
                  // Only show secondary if primary showed the preferred language (not a fallback)
                  const primaryShowedPreferred = preferredLanguage === "ja"
                    ? showJapanese && !!japanese
                    : showEnglish && !!english;
                  const hasSecondary = primaryShowedPreferred && (preferredLanguage === "ja"
                    ? showEnglish && !!english
                    : showJapanese && !!japanese);
                  // Romaji below divider only if not already shown with Japanese in primary
                  const romajiAvailable = showRomaji && !!message.processing!.romaji;
                  const japaneseWasPrimary = preferredLanguage === "ja"
                    ? (showJapanese && !!japanese)
                    : (!(showEnglish && !!english) && showJapanese && !!japanese);
                  const hasRomajiBelow = romajiAvailable && !japaneseWasPrimary;
                  if (!hasSecondary && !hasRomajiBelow) return null;
                  const secondary = preferredLanguage === "ja" ? english : japanese;
                  return (
                    <div className="ec-tr">
                      {hasRomajiBelow && (
                        <p className="ec-romaji" style={{ margin: "0 0 2px" }}>
                          {message.processing!.romaji}
                        </p>
                      )}
                      {hasSecondary && (
                        <p>
                          <span className="ec-tr-tag">{preferredLanguage === "ja" ? "EN" : "JA"}</span>
                          {secondary}
                        </p>
                      )}
                    </div>
                  );
                })()}
              {isPending && (
                <div className="ec-status-line">
                  {t("translating", lang)}
                  <span className="ec-dots"><i /><i /><i /></span>
                </div>
              )}
              {isFailed && (
                <div className="ec-status-line" style={{ color: "var(--red)" }}>
                  <Icon name="g-bang" size={16} />
                  {message.processing?.error ?? t("Processing failed", lang)}
                </div>
              )}

              {highlight && !isMedia && <div className="ec-marquee" aria-hidden />}
              {showCarrier && isPending && (
                <Chatto size={46} wave={false} style={{ position: "absolute", right: -6, top: -44, pointerEvents: "none" }} />
              )}
              {stampKey > 0 && (
                <div key={stampKey} className="ec-stamp ec-msg-stamp" aria-hidden>
                  GOT
                  <br />
                  IT!
                </div>
              )}
            </div>

            <InlineReactions
              messageId={message._id}
              currentParticipantId={currentParticipantId}
              onToggleReaction={onToggleReaction}
            />
          </div>

          {/* Reaction trigger on right of others' bubble */}
          {!isOwn && (
            <button className="ec-react-add" onClick={() => setShowModal(true)} title={t("React or reply", lang)}>
              <Icon name="re-heart" size={16} />
            </button>
          )}
        </div>

        {/* Suggestions */}
        {message.processing?.suggestions &&
          message.processing.suggestions.length > 0 && (
            <div style={{ marginLeft: isOwn ? 0 : 50 }}>
              <SuggestionChips
                suggestions={message.processing.suggestions}
                onSelect={(text) => {
                  console.log("Suggestion selected:", text);
                }}
              />
            </div>
          )}
      </div>

      {/* Long-press reaction picker */}
      {showModal &&
        createPortal(
          <div className="ec-sheet-backdrop" style={{ zIndex: 200 }} onClick={() => setShowModal(false)}>
            <div className="ec-sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
              <div className="ec-sheet-grip" />
              <div className="ec-sheet-head">
                {sender && <AvatarDisc id={sender.avatar.value} size={36} border={2.5} />}
                <h2 style={{ fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t("React", lang)} · {senderName}
                </h2>
                <button className="ec-round-btn" onClick={() => setShowModal(false)} aria-label={t("Close", lang)}>
                  ✕
                </button>
              </div>
              <div className="ec-sheet-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {message.text && (
                  <div className="ec-reply" style={{ alignSelf: "stretch" }}>
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Reaction row */}
                <div className="ec-picker-row">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      aria-label={emoji}
                      onClick={() => {
                        onToggleReaction?.(message._id, emoji, false);
                        setShowModal(false);
                      }}
                    >
                      <EmojiArt emoji={emoji} size={34} />
                    </button>
                  ))}
                </div>

                {/* Existing reactions */}
                <ReactionBar
                  messageId={message._id}
                  currentParticipantId={currentParticipantId}
                  onToggle={(emoji, hasReacted) => {
                    onToggleReaction?.(message._id, emoji, hasReacted);
                    setShowModal(false);
                  }}
                />

                {/* Reply button */}
                <button
                  className="ec-btn white sm"
                  onClick={() => {
                    onReply(message._id);
                    setShowModal(false);
                  }}
                >
                  {t("↩ Reply", lang)}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
});
