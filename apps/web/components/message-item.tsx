"use client";

import { useState } from "react";
import { PRESET_AVATARS } from "@/lib/types";
import { ReplyPreview } from "@/components/reply-preview";
import { ReactionBar } from "@/components/reaction-bar";
import { SuggestionChips } from "@/components/suggestion-chips";
import { MessageImage } from "@/components/message-image";
import { MessageDrawing } from "@/components/message-drawing";

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
}

function getEmoji(avatarValue: string): string {
  return PRESET_AVATARS.find((a) => a.id === avatarValue)?.emoji ?? "👤";
}

function getAvatarColor(avatarValue: string): string {
  return PRESET_AVATARS.find((a) => a.id === avatarValue)?.color ?? "#e5e7eb";
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export function MessageItem({
  message,
  sender,
  isOwn,
  replyToMessage,
  replyToSender,
  onReply,
  onToggleReaction,
  currentParticipantId,
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
              borderRadius: isOwn ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              padding: isMedia ? "0" : "0.6rem 0.85rem",
              maxWidth: "75%",
              opacity: isPending ? 0.7 : 1,
              cursor: isOwn ? "default" : "default",
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
            {message.kind === "text" && message.text && (
              <p style={{ margin: 0, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>
                {message.text}
              </p>
            )}
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
              message.kind === "text" && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    paddingTop: "0.5rem",
                    borderTop: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : "var(--border)"}`,
                    fontSize: "0.85rem",
                  }}
                >
                  {message.processing.romaji && (
                    <p
                      style={{
                        margin: "0 0 0.25rem",
                        fontStyle: "italic",
                        opacity: 0.8,
                      }}
                    >
                      {message.processing.romaji}
                    </p>
                  )}
                  {message.processing.translatedText && (
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {message.processing.translatedText}
                    </p>
                  )}
                </div>
              )}
            {isPending && (
              <p
                style={{
                  margin: "0.3rem 0 0",
                  fontSize: "0.7rem",
                  opacity: 0.6,
                  fontStyle: "italic",
                }}
              >
                Processing...
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
                {message.processing?.error ?? "Processing failed"}
              </p>
            )}
          </div>

          {/* Reaction button on right middle (others only) */}
          {!isOwn && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "none",
                border: "none",
                padding: "0.15rem",
                cursor: "pointer",
                fontSize: "0.85rem",
                opacity: 0.4,
                flexShrink: 0,
                alignSelf: "center",
              }}
              title="React or reply"
            >
              😊
            </button>
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
              ↩ Reply
            </button>
          </div>
        </div>
      )}
    </>
  );
}
