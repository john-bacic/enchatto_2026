"use client";

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
  const isPending = message.status === "pending";
  const isFailed = message.status === "failed";
  const isMedia = message.kind === "image" || message.kind === "drawing";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        marginBottom: "0.75rem",
      }}
    >
      {/* Sender */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          marginBottom: "0.2rem",
          fontSize: "0.8rem",
          color: "var(--muted)",
        }}
      >
        <span>{senderEmoji}</span>
        <span style={{ fontWeight: 600 }}>{senderName}</span>
        {sender?.role === "host" && (
          <span
            style={{
              fontSize: "0.65rem",
              background: "var(--primary)",
              color: "#fff",
              padding: "0.1rem 0.35rem",
              borderRadius: "4px",
            }}
          >
            host
          </span>
        )}
      </div>

      {/* Reply preview */}
      {replyToMessage && (
        <ReplyPreview
          originalText={replyToMessage.text ?? ""}
          senderName={replyToSender?.nickname ?? "Unknown"}
          senderAvatar={replyToSender?.avatar.value}
          messageKind={replyToMessage.kind}
        />
      )}

      {/* Message bubble */}
      <div
        style={{
          background: isMedia ? "transparent" : isOwn ? "var(--primary)" : "var(--surface)",
          color: isOwn && !isMedia ? "#fff" : "var(--fg)",
          border: isMedia ? "none" : isOwn ? "none" : "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: isMedia ? "0" : "0.6rem 0.85rem",
          maxWidth: "85%",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {/* Image */}
        {message.kind === "image" && message.mediaUrl && (
          <MessageImage src={message.mediaUrl} />
        )}

        {/* Drawing */}
        {message.kind === "drawing" && message.mediaUrl && (
          <MessageDrawing src={message.mediaUrl} />
        )}

        {/* Original text */}
        {message.kind === "text" && message.text && (
          <p style={{ margin: 0, lineHeight: 1.4 }}>{message.text}</p>
        )}

        {/* System message */}
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

        {/* Processing results */}
        {message.processing && message.status === "processed" && message.kind === "text" && (
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

        {/* Status indicators */}
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

      {/* Suggestions */}
      {message.processing?.suggestions &&
        message.processing.suggestions.length > 0 && (
          <SuggestionChips
            suggestions={message.processing.suggestions}
            onSelect={(text) => {
              console.log("Suggestion selected:", text);
            }}
          />
        )}

      {/* Actions row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "0.2rem",
        }}
      >
        <ReactionBar
          messageId={message._id}
          currentParticipantId={currentParticipantId}
          onToggle={(emoji, hasReacted) => {
            onToggleReaction?.(message._id, emoji, hasReacted);
          }}
        />
        <button
          onClick={() => onReply(message._id)}
          style={{
            fontSize: "0.7rem",
            color: "var(--muted)",
            background: "none",
            padding: "0.15rem 0.3rem",
          }}
        >
          Reply
        </button>
      </div>
    </div>
  );
}
