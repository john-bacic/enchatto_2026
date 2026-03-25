"use client";

import { useEffect, useRef, useCallback } from "react";
import { MessageItem } from "@/components/message-item";
import { TypingIndicator } from "@/components/typing-indicator";
import { t } from "@/lib/i18n";
import { PRESET_AVATARS } from "@/lib/types";

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
              // name is like "Lost in Translation Level 2" or "Emojifyr" or "Emoji Match"
              if (name.startsWith("Emojifyr")) {
                displayText = `🔥 ${t("Game Started: Emojifyr", lang)}`;
              } else if (name.startsWith("Emoji Match")) {
                displayText = `🃏 ${t("Game Started: Match Emoji", lang)}`;
              } else {
                const levelMatch = name.match(/Level (\d+)/);
                const levelStr = levelMatch ? ` — ${t("Level", lang)} ${levelMatch[1]}` : "";
                displayText = `🎮 ${t("Game Started: Lost in Translation", lang)}${levelStr}`;
              }
            } else if (action === "game_cancelled") {
              displayText = `🎮 ${t("Game ended", lang)}`;
            } else if (action === "emoji_match_complete") {
              // Legacy format — keep for old messages
              const [headline, scores] = name.split("|");
              elements.push(
                <div
                  key={message._id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.15rem",
                    margin: "0.5rem 0",
                    padding: "0.5rem 1rem",
                    background: "var(--bg)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    🃏 {headline}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {scores}
                  </span>
                </div>
              );
              return elements;
            } else if (action === "emoji_match_summary" || action === "game_summary") {
              try {
                const data = JSON.parse(name);
                const isEmojiMatch = action === "emoji_match_summary";
                const getPlayerEmoji = (avatarId: string) =>
                  PRESET_AVATARS.find((a) => a.id === avatarId)?.emoji ?? "👤";

                type GameRound = { players: Array<{ name: string; avatar: string; score: number; isWinner: boolean }>; totalPairs: number; isTie: boolean };

                if (isEmojiMatch) {
                  // Multi-game format: data.games is an array of rounds
                  const games: GameRound[] = data.games ?? [
                    // Legacy single-game format fallback
                    { players: data.players, totalPairs: data.totalPairs, isTie: data.isTie },
                  ];
                  const gameCount = games.length;

                  // Aggregate total scores across all games per player (by name+avatar)
                  const aggregated: Record<string, { name: string; avatar: string; totalScore: number; totalPairs: number; wins: number }> = {};
                  for (const game of games) {
                    for (const p of (game.players ?? [])) {
                      const key = `${p.name}|${p.avatar}`;
                      if (!aggregated[key]) aggregated[key] = { name: p.name, avatar: p.avatar, totalScore: 0, totalPairs: 0, wins: 0 };
                      aggregated[key].totalScore += p.score;
                      aggregated[key].totalPairs += game.totalPairs;
                      if (p.isWinner) aggregated[key].wins += 1;
                    }
                  }
                  const sortedAgg = Object.values(aggregated).sort((a, b) => b.totalScore - a.totalScore);
                  const maxScore = sortedAgg[0]?.totalScore ?? 0;

                  elements.push(
                    <div
                      key={message._id}
                      style={{
                        margin: "0.75rem 0",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
                        padding: "1rem",
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                      }}
                    >
                      {/* Header */}
                      <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                          🃏 {data.gameType ?? "Match Emoji"}
                        </div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.15rem" }}>
                          {gameCount} {gameCount === 1 ? "game" : "games"} {t("played", lang)}
                        </div>
                      </div>

                      {/* Per-game results */}
                      {games.map((game, gi) => (
                        <div
                          key={gi}
                          style={{
                            background: "rgba(255,255,255,0.12)",
                            borderRadius: "10px",
                            padding: "0.5rem 0.6rem",
                            marginBottom: gi < gameCount - 1 ? "0.4rem" : "0.6rem",
                          }}
                        >
                          <div style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "0.3rem", fontWeight: 600 }}>
                            Game {gi + 1}
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {(() => { const sorted = [...(game.players ?? [])].sort((a, b) => b.score - a.score); return sorted.map((p, pi) => {
                              const rank = sorted.findIndex(r => r.score === p.score);
                              const placeEmoji = rank === 0 ? " 🏆" : rank === 1 ? " 🥈" : rank === 2 ? " 🥉" : "";
                              return (
                              <span key={pi} style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                {getPlayerEmoji(p.avatar)} {p.name}: <strong>{p.score}</strong>
                                {placeEmoji}
                              </span>
                            ); }); })()}
                          </div>
                        </div>
                      ))}

                      {/* Overall totals */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "0.6rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {sortedAgg.map((p, idx) => {
                          const rank = sortedAgg.findIndex(r => r.totalScore === p.totalScore);
                          const placeEmoji = rank === 0 ? "🏆" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : "";
                          const isTop3 = rank <= 2;
                          return (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "0.2rem",
                              background: isTop3 && p.totalScore > 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              padding: "0.5rem 0.85rem",
                              minWidth: "65px",
                              border: rank === 0 && p.totalScore > 0 ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid transparent",
                            }}
                          >
                            <span style={{ fontSize: "0.75rem", height: "1rem", lineHeight: "1rem" }}>
                              {placeEmoji}
                            </span>
                            <span style={{ fontSize: "1.5rem" }}>
                              {getPlayerEmoji(p.avatar)}
                            </span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                              {p.name}
                            </span>
                            <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                              {p.totalScore} {p.totalScore === 1 ? t("pair", lang) : t("pairs", lang)}
                            </span>
                          </div>
                        ); })}
                      </div>
                    </div>
                  );
                  return elements;
                } else {
                  // game_summary (Lost in Translation) — single game format
                  const playerIds = Object.keys(data.players ?? {});
                  const sorted = [...playerIds].sort((a, b) => (data.totals?.[b]?.correct ?? 0) - (data.totals?.[a]?.correct ?? 0));
                  const maxCorrect = data.totals?.[sorted[0]]?.correct ?? 0;

                  elements.push(
                    <div
                      key={message._id}
                      style={{
                        margin: "0.75rem 0",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
                        padding: "1rem",
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                      }}
                    >
                      <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                          🎮 {data.gameType ?? "Game"}{data.level ? ` — Level ${data.level}` : ""}
                        </div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.15rem" }}>
                          {data.cancelled ? t("Game ended early", lang) : t("Game Complete", lang)}
                          {" · "}{data.rounds?.length ?? 0} {(data.rounds?.length ?? 0) === 1 ? "round" : "rounds"}
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                        {sorted.map((pid) => (
                          <div
                            key={pid}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "0.2rem",
                              background: (data.totals?.[pid]?.correct ?? 0) === maxCorrect && maxCorrect > 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              padding: "0.5rem 0.85rem",
                              minWidth: "65px",
                              border: (data.totals?.[pid]?.correct ?? 0) === maxCorrect && maxCorrect > 0 ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid transparent",
                            }}
                          >
                            <span style={{ fontSize: "0.75rem", height: "1rem", lineHeight: "1rem" }}>
                              {(data.totals?.[pid]?.correct ?? 0) === maxCorrect && maxCorrect > 0 ? "👑" : ""}
                            </span>
                            <span style={{ fontSize: "1.5rem" }}>{getPlayerEmoji(data.players[pid]?.avatar)}</span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>{data.players[pid]?.name ?? "?"}</span>
                            <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>{data.totals?.[pid]?.correct ?? 0}/{data.totals?.[pid]?.total ?? 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  return elements;
                }
              } catch {
                displayText = action === "emoji_match_summary" ? "🃏 Match Emoji Summary" : "🎮 Game Summary";
              }
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
