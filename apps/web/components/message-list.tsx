"use client";

import { useEffect, useRef } from "react";
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
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
      {messages.map((message) => {
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
            }
          }
          return (
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
        }

        const replyToMessage = message.replyToId
          ? findMessage(message.replyToId)
          : undefined;
        const replyToSender = replyToMessage
          ? findParticipant(replyToMessage.senderId)
          : undefined;

        return (
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
          />
        );
      })}
      {typingParticipants && typingParticipants.length > 0 && (
        <TypingIndicator participants={typingParticipants} lang={lang} />
      )}
      <div ref={bottomRef} />
    </div>
  );
}
