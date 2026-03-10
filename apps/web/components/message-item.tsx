"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { PRESET_AVATARS } from "@/lib/types";
import { ReplyPreview } from "@/components/reply-preview";
import { ReactionBar } from "@/components/reaction-bar";
import { SuggestionChips } from "@/components/suggestion-chips";
import { MessageImage } from "@/components/message-image";
import { MessageDrawing } from "@/components/message-drawing";
import { t } from "@/lib/i18n";

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
  processing?: ProcessingState;
  replyToId?: string;
  createdAt: number;
}

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
}

function getEmoji(avatarValue: string): string {
  return PRESET_AVATARS.find((a) => a.id === avatarValue)?.emoji ?? "👤";
}

function getAvatarColor(avatarValue: string): string {
  return PRESET_AVATARS.find((a) => a.id === avatarValue)?.color ?? "#e5e7eb";
}

/** Check if text contains Japanese characters (Hiragana, Katakana, CJK) */
function isJapaneseText(text: string): boolean {
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

function InlineReactions({
  messageId,
  currentParticipantId,
  isOwn,
  onToggleReaction,
  onShowModal,
}: {
  messageId: string;
  currentParticipantId: string;
  isOwn: boolean;
  onToggleReaction?: (messageId: string, emoji: string, hasReacted: boolean) => void;
  onShowModal: () => void;
}) {
  const summaryList = useQuery(api.reactions.getReactionSummary, {
    messageId: messageId as Id<"messages">,
  });

  const reactions = (summaryList ?? []).filter((r) => r.count > 0);

  if (reactions.length > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {reactions.map((r) => (
          <div
            key={r.emoji}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              padding: "2px 6px",
              borderRadius: "999px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            onClick={() => {
              const isMine = r.participantIds.includes(currentParticipantId);
              onToggleReaction?.(messageId, r.emoji, isMine);
            }}
          >
            <span style={{ fontSize: "0.8rem" }}>{r.emoji}</span>
            {r.count > 1 && (
              <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                {r.count}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!isOwn) {
    return (
      <button
        onClick={onShowModal}
        style={{
          background: "none",
          border: "none",
          padding: "0.15rem",
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
        }}
        title={t("React or reply")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    );
  }

  return null;
}

export function MessageItem({
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
}: MessageItemProps) {
  const senderName = sender?.nickname ?? "Unknown";
  const senderEmoji = sender ? getEmoji(sender.avatar.value) : "👤";
  const senderColor = sender ? getAvatarColor(sender.avatar.value) : "#e5e7eb";
  const isPending = message.status === "pending";
  const isFailed = message.status === "failed";
  const isMedia = message.kind === "image" || message.kind === "drawing";

  const [showModal, setShowModal] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          marginBottom: "0.75rem",
        }}
      >
        {/* Reply preview */}
        {replyToMessage && (
          <div style={{ marginLeft: isOwn ? 0 : "2.75rem" }}>
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "0.5rem",
            maxWidth: isOwn ? "75%" : "85%",
            marginLeft: isOwn ? "auto" : undefined,
          }}
        >
          {/* Avatar column (others only) */}
          {!isOwn && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.15rem",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: senderColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                }}
              >
                {senderEmoji}
              </div>
              <span
                style={{
                  fontSize: "0.6rem",
                  color: "var(--muted)",
                  maxWidth: "40px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {senderName}
              </span>
            </div>
          )}

          {/* Reactions to the left of own bubble */}
          {isOwn && (
            <div style={{ alignSelf: "center", flexShrink: 0 }}>
              <InlineReactions
                messageId={message._id}
                currentParticipantId={currentParticipantId}
                isOwn={isOwn}
                onToggleReaction={onToggleReaction}
                onShowModal={() => setShowModal(true)}
              />
            </div>
          )}

          {/* Bubble */}
          <div
            style={{
              background: isMedia
                ? "transparent"
                : isOwn
                  ? "var(--primary)"
                  : "var(--surface)",
              color: isOwn && !isMedia ? "#fff" : "var(--fg)",
              border: isMedia ? "none" : isOwn ? "none" : "1px solid var(--border)",
              borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: isMedia ? "0" : "0.6rem 0.85rem",
              opacity: isPending ? 0.7 : 1,
              userSelect: "text",
              WebkitUserSelect: "text",
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onContextMenu={handleContextMenu}
          >
            {message.kind === "image" && message.mediaUrl && (
              <MessageImage src={message.mediaUrl} />
            )}
            {message.kind === "drawing" && message.mediaUrl && (
              <MessageDrawing src={message.mediaUrl} />
            )}
            {message.kind === "text" && (() => {
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
                  <p style={{ margin: 0, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>
                    {primaryText}
                  </p>
                  {showRomajiWithPrimary && (
                    <p style={{ margin: "0.25rem 0 0", fontStyle: "italic", fontSize: "0.78rem", opacity: 0.8 }}>
                      {romaji}
                    </p>
                  )}
                </>
              ) : null;
            })()}
            {message.kind === "system" && message.text && (
              <p
                style={{
                  margin: 0,
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  color: "var(--muted)",
                }}
              >
                {message.text}
              </p>
            )}
            {message.processing &&
              message.status === "processed" &&
              message.kind === "text" && (() => {
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
                return (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      paddingTop: "0.5rem",
                      borderTop: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : "var(--border)"}`,
                      fontSize: "0.85rem",
                    }}
                  >
                    {preferredLanguage === "ja" ? (
                      <>
                        {hasRomajiBelow && (
                          <p
                            style={{
                              margin: "0 0 0.25rem",
                              fontStyle: "italic",
                              opacity: 0.8,
                            }}
                          >
                            {message.processing!.romaji}
                          </p>
                        )}
                        {hasSecondary && (
                          <p style={{ margin: 0, opacity: 0.7 }}>
                            {english}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {hasRomajiBelow && (
                          <p
                            style={{
                              margin: "0 0 0.25rem",
                              fontStyle: "italic",
                              opacity: 0.8,
                            }}
                          >
                            {message.processing!.romaji}
                          </p>
                        )}
                        {hasSecondary && (
                          <p style={{ margin: 0, fontWeight: 500 }}>
                            {japanese}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            {isPending && (
              <p
                style={{
                  margin: "0.3rem 0 0",
                  fontSize: "0.7rem",
                  opacity: 0.6,
                  fontStyle: "italic",
                }}
              >
                {t("Processing...", lang)}
              </p>
            )}
            {isFailed && (
              <p
                style={{
                  margin: "0.3rem 0 0",
                  fontSize: "0.7rem",
                  color: "#ef4444",
                }}
              >
                {message.processing?.error ?? t("Processing failed", lang)}
              </p>
            )}
          </div>

          {/* Reactions / trigger on right of others' bubble */}
          {!isOwn && (
            <div style={{ alignSelf: "center", flexShrink: 0 }}>
              <InlineReactions
                messageId={message._id}
                currentParticipantId={currentParticipantId}
                isOwn={isOwn}
                onToggleReaction={onToggleReaction}
                onShowModal={() => setShowModal(true)}
              />
            </div>
          )}
        </div>

        {/* Suggestions */}
        {message.processing?.suggestions &&
          message.processing.suggestions.length > 0 && (
            <div style={{ marginLeft: isOwn ? 0 : "2.75rem" }}>
              <SuggestionChips
                suggestions={message.processing.suggestions}
                onSelect={(text) => {
                  console.log("Suggestion selected:", text);
                }}
              />
            </div>
          )}
      </div>

      {/* Long-press modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "16px",
              padding: "1.25rem",
              width: "100%",
              maxWidth: "280px",
              margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Reaction row */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onToggleReaction?.(message._id, emoji, false);
                    setShowModal(false);
                  }}
                  style={{
                    fontSize: "1.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                    borderRadius: "8px",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Existing reactions */}
            <div style={{ marginBottom: "0.75rem" }}>
              <ReactionBar
                messageId={message._id}
                currentParticipantId={currentParticipantId}
                onToggle={(emoji, hasReacted) => {
                  onToggleReaction?.(message._id, emoji, hasReacted);
                  setShowModal(false);
                }}
              />
            </div>

            {/* Reply button */}
            <button
              onClick={() => {
                onReply(message._id);
                setShowModal(false);
              }}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "10px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              {t("↩ Reply", lang)}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
