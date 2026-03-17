"use client";

import { useEffect, useRef, useCallback } from "react";
import { MessageItem } from "@/components/message-item";
import { TypingIndicator } from "@/components/typing-indicator";
import { t } from "@/lib/i18n";

interface MessageData {
  _id: string;
  senderId: string;
  kind: string;
  status: string;
  text?: string;
  mediaUrl?: string;
  processing?: {
    translatedText?: string;
    romaji?: string;
    suggestions?: string[];
    error?: string;
  };
  replyToId?: string;
  createdAt: number;
}

interface ParticipantData {
  _id: string;
  nickname: string;
  role: string;
  avatar: { type: string; value: string };
}

interface TypingParticipant {
  _id: string;
  nickname: string;
  avatar: { type: string; value: string };
  typingAction: "typing" | "drawing" | "voicing";
  drawingStartedAt?: number;
}

interface MessageListProps {
  messages: MessageData[];
  participants: ParticipantData[];
  currentParticipantId: string;
  preferredLanguage?: string;
  onReply: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string, hasReacted: boolean) => void;
  typingParticipants?: TypingParticipant[];
  lang?: string;
  showEnglish?: boolean;
  showJapanese?: boolean;
  showRomaji?: boolean;
  isGameComplete?: boolean;
  gameCompletedAt?: number;
  onViewGameResults?: () => void;
}

export function MessageList({
  messages,
  participants,
  currentParticipantId,
  preferredLanguage,
  onReply,
  onToggleReaction,
  typingParticipants,
  lang,
  showEnglish = true,
  showJapanese = true,
  showRomaji = true,
  isGameComplete,
  gameCompletedAt,
  onViewGameResults,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Count messages that have translations to detect when new translations arrive
  const translationCount = messages.filter((m) => m.processing?.translatedText).length;
  // Count media messages to detect when images/drawings arrive
  const mediaCount = messages.filter((m) => m.mediaUrl).length;

  const typingCount = typingParticipants?.length ?? 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, translationCount, mediaCount, typingCount]);

  // Also scroll when an image/drawing finishes loading (async render)
  const handleImageLoad = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const findParticipant = (id: string) =>
    participants.find((p) => p._id === id);

  const findMessage = (id: string) => messages.find((m) => m._id === id);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: "0.9rem",
          padding: "2rem",
        }}
      >
        {t("No messages yet. Start the conversation!", lang)}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem",
      }}
    >
      {messages.map((message, index) => {
        const elements: React.ReactNode[] = [];

        // Insert game complete bubble at chronological position
        if (isGameComplete && onViewGameResults && gameCompletedAt) {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const isInsertPoint =
            (prevMessage && prevMessage.createdAt <= gameCompletedAt && message.createdAt > gameCompletedAt) ||
            (index === 0 && message.createdAt > gameCompletedAt);
          if (isInsertPoint) {
            elements.push(
              <div
                key="game-complete"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "0.75rem 0",
                }}
              >
                <button
                  onClick={onViewGameResults}
                  style={{
                    background: "linear-gradient(135deg, var(--primary), #7c3aed)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "1rem",
                    padding: "0.6rem 1.25rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  🎮 {t("Game complete! View Results", lang)}
                </button>
              </div>
            );
          }
        }

        if (message.kind === "system") {
          let displayText = message.text ?? "";
          const colonIdx = displayText.indexOf(":");
          if (colonIdx > 0) {
            const action = displayText.slice(0, colonIdx);
            const name = displayText.slice(colonIdx + 1);
            if (action === "join") {
              displayText = lang === "ja" ? `${name}${t("has joined", lang)}` : `${name} ${t("has joined", lang)}`;
            } else if (action === "leave") {
              displayText = lang === "ja" ? `${name}${t("has left", lang)}` : `${name} ${t("has left", lang)}`;
            } else if (action === "away") {
              displayText = lang === "ja" ? `${name}${t("is away", lang)}` : `${name} ${t("is away", lang)}`;
            } else if (action === "back") {
              displayText = lang === "ja" ? `${name}${t("is back", lang)}` : `${name} ${t("is back", lang)}`;
            } else if (action === "game") {
              // name is like "Lost in Translation Level 2" or "Emojifyr"
              if (name.startsWith("Emojifyr")) {
                displayText = `🔥 ${t("Game Started: Emojifyr", lang)}`;
              } else {
                const levelMatch = name.match(/Level (\d+)/);
                const levelStr = levelMatch ? ` — ${t("Level", lang)} ${levelMatch[1]}` : "";
                displayText = `🎮 ${t("Game Started: Lost in Translation", lang)}${levelStr}`;
              }
            } else if (action === "game_cancelled") {
              displayText = `🎮 ${t("Game ended", lang)}`;
            } else if (action === "game_correct") {
              const [guesserName, prompt] = name.split("|");
              displayText = `🎉 ${guesserName} ${t("guessed correctly!", lang)} (${prompt})`;
            } else if (action === "game_wrong") {
              const [guesserName, prompt] = name.split("|");
              displayText = `❌ ${guesserName} ${t("guessed wrong", lang)} (${prompt})`;
            }
          }
          elements.push(
            <div
              key={message._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0.5rem 0",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {displayText}
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>
          );
          return elements;
        }

        const replyToMessage = message.replyToId
          ? findMessage(message.replyToId)
          : undefined;
        const replyToSender = replyToMessage
          ? findParticipant(replyToMessage.senderId)
          : undefined;

        elements.push(
          <MessageItem
            key={message._id}
            message={message}
            sender={findParticipant(message.senderId)}
            isOwn={message.senderId === currentParticipantId}
            replyToMessage={replyToMessage}
            replyToSender={replyToSender}
            onReply={onReply}
            onToggleReaction={onToggleReaction}
            currentParticipantId={currentParticipantId}
            preferredLanguage={preferredLanguage}
            lang={lang}
            showEnglish={showEnglish}
            showJapanese={showJapanese}
            showRomaji={showRomaji}
            onImageLoad={handleImageLoad}
          />
        );
        return elements;
      })}
      {/* Game complete bubble at end if no messages came after it */}
      {isGameComplete && onViewGameResults && (!gameCompletedAt || messages[messages.length - 1]?.createdAt <= gameCompletedAt) && (
        <div
          key="game-complete"
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "0.75rem 0",
          }}
        >
          <button
            onClick={onViewGameResults}
            style={{
              background: "linear-gradient(135deg, var(--primary), #7c3aed)",
              color: "#fff",
              border: "none",
              borderRadius: "1rem",
              padding: "0.6rem 1.25rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            🎮 {t("Game complete! View Results", lang)}
          </button>
        </div>
      )}
      {typingParticipants && typingParticipants.length > 0 && (
        <TypingIndicator participants={typingParticipants} lang={lang} />
      )}
      <div ref={bottomRef} style={{ height: "1rem" }} />
    </div>
  );
}
