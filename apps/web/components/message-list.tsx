"use client";

import { useEffect, useRef, useCallback } from "react";
import { MessageItem } from "@/components/message-item";
import { TypingIndicator } from "@/components/typing-indicator";
import { AvatarDisc } from "@/components/ui/avatar";
import { Chatto } from "@/components/ui/chatto";
import { Icon } from "@/components/ui/icon";
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

interface TruthOrDareGameData {
  _id: string;
  status: string;
  completedAt?: number;
  createdAt: number;
  completedTurns: number;
  completedTurnsList?: Array<{
    _id: string;
    participantId: string;
    ratings: Array<{ participantId: string; score: number }>;
  }>;
  playerInfo: Array<{
    participantId: string;
    nickname: string;
    avatarValue: string;
    online: boolean;
  }>;
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
  truthOrDareGame?: TruthOrDareGameData | null;
  /** Room is buzzing: leave room for the bunting/crowd and light up the latest bubble. */
  hype?: boolean;
}

// ─── Summary cards ───────────────────────────────────────────────────────────

interface PodiumEntry {
  key: string;
  name: string;
  avatar: string;
  score: number | null;
  label: string;
}

function rankOf(sorted: PodiumEntry[], entry: PodiumEntry) {
  return sorted.findIndex((r) => r.score === entry.score);
}

function Podium({ entries }: { entries: PodiumEntry[] }) {
  const sorted = [...entries].sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });
  // Podium order: 2nd, 1st, 3rd, then rest
  const ordered = sorted.length >= 3 ? [sorted[1], sorted[0], sorted[2], ...sorted.slice(3)] : sorted;
  return (
    <div className="ec-podium">
      {ordered.map((p) => {
        const rank = p.score === null ? -1 : rankOf(sorted, p);
        const isTop = rank === 0 && (p.score ?? 0) > 0;
        return (
          <div key={p.key} className={`ec-podium-tile${isTop ? " top" : ""}`}>
            {isTop ? (
              <span className="ec-podium-rank" style={{ background: "var(--yellow)" }}>
                <Icon name="g-crown" size={18} />
              </span>
            ) : rank === 1 || rank === 2 ? (
              <span className="ec-podium-rank">{rank + 1}</span>
            ) : null}
            <AvatarDisc id={p.avatar} size={40} border={2.5} />
            <small>{p.name}</small>
            <b>{p.label}</b>
          </div>
        );
      })}
    </div>
  );
}

function SummaryCard({
  tone,
  icon,
  title,
  subtitle,
  children,
}: {
  tone: string;
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ec-card ec-summary">
      <div className="ec-summary-head" style={{ "--tone": tone } as React.CSSProperties}>
        <Icon name={icon} size={30} />
        <h3>{title}</h3>
      </div>
      {subtitle && <div className="ec-summary-sub">{subtitle}</div>}
      {children}
    </div>
  );
}

function plural(n: number, one: string, many: string, lang?: string) {
  return t(n === 1 ? one : many, lang);
}

// ─── System lines ────────────────────────────────────────────────────────────

interface SystemLine {
  text: string;
  icon?: string;
  avatarId?: string;
}

function personLine(name: string, key: string, lang?: string) {
  return lang === "ja" ? `${name}${t(key, lang)}` : `${name} ${t(key, lang)}`;
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
  truthOrDareGame,
  hype = false,
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
      <div className="ec-empty">
        <Chatto size={96} shadow />
        <div className="ec-card" style={{ padding: "12px 16px", borderRadius: 18, boxShadow: "0 4px 0 var(--ink)" }}>
          <div className="ec-chunky" style={{ fontSize: 16 }}>{t("Say hi to get things started!", lang)}</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>{t("No messages yet. Start the conversation!", lang)}</div>
        </div>
      </div>
    );
  }

  const renderTruthOrDare = (key: string, totalTurns: number, entries: PodiumEntry[]) => (
    <SummaryCard
      key={key}
      tone="var(--pink)"
      icon="g-question"
      title={t("Truth or Dare", lang)}
      subtitle={`${totalTurns} ${plural(totalTurns, "turn", "turns", lang)} ${t("played", lang)}`}
    >
      <Podium entries={entries} />
    </SummaryCard>
  );

  const renderTruthOrDareBanner = (game: TruthOrDareGameData): React.ReactNode => {
    const turns = game.completedTurnsList ?? [];
    const playerRatings: Record<string, { total: number; count: number }> = {};
    for (const turn of turns) {
      if (turn.ratings.length === 0) continue;
      const pid = turn.participantId;
      const avg = turn.ratings.reduce((s, r) => s + r.score, 0) / turn.ratings.length;
      if (!playerRatings[pid]) playerRatings[pid] = { total: 0, count: 0 };
      playerRatings[pid].total += avg;
      playerRatings[pid].count += 1;
    }
    const entries: PodiumEntry[] = (game.playerInfo ?? []).map((p) => {
      const r = playerRatings[p.participantId];
      const avg = r ? Math.round((r.total / r.count) * 10) / 10 : null;
      return { key: p.participantId, name: p.nickname, avatar: p.avatarValue, score: avg, label: avg !== null ? `★ ${avg}` : "—" };
    });
    return renderTruthOrDare(`tod-summary-${game._id}`, game.completedTurns, entries);
  };

  const renderGameCompleteButton = (key: string) => (
    <div key={key} style={{ display: "flex", justifyContent: "center" }}>
      <button
        className="ec-btn violet sm"
        style={{ width: "auto", padding: "0 18px", animation: "ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)" }}
        onClick={onViewGameResults}
      >
        <Icon name="ui-game" size={26} />
        {t("Game complete! View Results", lang)}
      </button>
    </div>
  );

  // Check if Truth or Dare summary should appear after all messages
  const todSummaryAfterAll = truthOrDareGame && truthOrDareGame.status === "completed" &&
    messages.length > 0 &&
    (truthOrDareGame.completedAt ?? truthOrDareGame.createdAt) >= messages[messages.length - 1].createdAt;
  // Also show if there are no messages after the game
  const todSummaryNoMessages = truthOrDareGame && truthOrDareGame.status === "completed" && messages.length === 0;

  // Latest own message still waiting on the host gets the Chatto carrier.
  let carrierId: string | null = null;
  let latestId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.kind === "system") continue;
    if (!latestId) latestId = m._id;
    if (m.senderId === currentParticipantId) {
      if (m.status === "pending") carrierId = m._id;
      break;
    }
  }

  return (
    <div className={`ec-messages${hype ? " hype" : ""}`}>
      {messages.map((message, index) => {
        const elements: React.ReactNode[] = [];

        // Insert Truth or Dare summary at chronological position
        if (truthOrDareGame && truthOrDareGame.status === "completed") {
          const todCompletedAt = truthOrDareGame.completedAt ?? truthOrDareGame.createdAt;
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const shouldInsertBefore =
            (prevMsg && prevMsg.createdAt <= todCompletedAt && message.createdAt > todCompletedAt) ||
            (index === 0 && message.createdAt > todCompletedAt);
          if (shouldInsertBefore) {
            const banner = renderTruthOrDareBanner(truthOrDareGame);
            if (banner) elements.push(banner);
          }
        }

        // Insert game complete bubble at chronological position
        if (isGameComplete && onViewGameResults && gameCompletedAt) {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const isInsertPoint =
            (prevMessage && prevMessage.createdAt <= gameCompletedAt && message.createdAt > gameCompletedAt) ||
            (index === 0 && message.createdAt > gameCompletedAt);
          if (isInsertPoint) {
            elements.push(renderGameCompleteButton("game-complete"));
          }
        }

        if (message.kind === "system") {
          const rawText = message.text ?? "";
          let line: SystemLine = { text: rawText };

          // Truth or Dare summary — handle before colon-split (kept for historical messages)
          if (rawText.startsWith("truth_or_dare_summary:")) {
            try {
              const data = JSON.parse(rawText.slice("truth_or_dare_summary:".length));
              const entries: PodiumEntry[] = (data.players ?? []).map(
                (p: { name: string; avatar: string; avgRating: number | null }, i: number) => ({
                  key: `${p.name}-${i}`,
                  name: p.name,
                  avatar: p.avatar,
                  score: p.avgRating,
                  label: p.avgRating !== null ? `★ ${p.avgRating}` : "—",
                })
              );
              elements.push(renderTruthOrDare(message._id, data.totalTurns ?? 0, entries));
            } catch (err) {
              console.error("Failed to render Truth or Dare summary:", err);
              elements.push(
                <div key={message._id} className="ec-sys plain">
                  {t("Truth or Dare", lang)} — {t("Game ended", lang)}
                </div>
              );
            }
            return elements;
          }

          const colonIdx = rawText.indexOf(":");
          if (colonIdx > 0) {
            const action = rawText.slice(0, colonIdx);
            const name = rawText.slice(colonIdx + 1);
            const senderAvatar = findParticipant(message.senderId)?.avatar.value;
            if (action === "join") {
              line = { text: personLine(name, "has joined", lang), avatarId: senderAvatar };
            } else if (action === "leave") {
              line = { text: personLine(name, "has left", lang), avatarId: senderAvatar };
            } else if (action === "away") {
              line = { text: personLine(name, "is away", lang), avatarId: senderAvatar };
            } else if (action === "back") {
              line = { text: personLine(name, "is back", lang), avatarId: senderAvatar };
            } else if (action === "game") {
              // name is like "Lost in Translation Level 2", "Word Rush", "Emoji Match"…
              if (name.startsWith("Word Rush")) {
                line = { text: t("Game Started: Word Rush", lang), icon: "g-bolt" };
              } else if (name.startsWith("Emojifyr")) {
                line = { text: t("Game Started: Emojifyr", lang), icon: "ui-game" };
              } else if (name.startsWith("Emoji Match")) {
                line = { text: t("Game Started: Match Emoji", lang), icon: "ui-game" };
              } else if (name.startsWith("Emoji Bingo")) {
                line = { text: t("Game Started: Emoji Bingo", lang), icon: "g-clover" };
              } else if (name.startsWith("Truth or Dare")) {
                line = { text: t("Game Started: Truth or Dare", lang), icon: "g-question" };
              } else {
                const levelMatch = name.match(/Level (\d+)/);
                const levelStr = levelMatch ? ` — ${t("Level", lang)} ${levelMatch[1]}` : "";
                line = { text: `${t("Game Started: Lost in Translation", lang)}${levelStr}`, icon: "g-pencil" };
              }
            } else if (action === "game_cancelled") {
              line = name.startsWith("Word Rush")
                ? { text: t("Game ended: Word Rush", lang), icon: "g-bolt" }
                : { text: t("Game ended", lang), icon: "ui-game" };
            } else if (action === "game_ended") {
              line = { text: t("Game ended", lang), icon: "g-question" };
            } else if (action === "emoji_match_complete") {
              // Legacy format — keep for old messages
              const [headline, scores] = name.split("|");
              elements.push(
                <div key={message._id} className="ec-sys plain" style={{ flexDirection: "column", gap: 0, borderRadius: 16, padding: "5px 14px" }}>
                  <span>{headline}</span>
                  <span style={{ opacity: 0.6, fontWeight: 700 }}>{scores}</span>
                </div>
              );
              return elements;
            } else if (action === "emoji_match_summary" || action === "game_summary") {
              try {
                const data = JSON.parse(name);
                const isEmojiMatch = action === "emoji_match_summary";

                type GameRound = { players: Array<{ name: string; avatar: string; score: number; isWinner: boolean }>; totalPairs: number; isTie: boolean };

                if (isEmojiMatch) {
                  // Multi-game format: data.games is an array of rounds
                  const games: GameRound[] = data.games ?? [
                    // Legacy single-game format fallback
                    { players: data.players, totalPairs: data.totalPairs, isTie: data.isTie },
                  ];
                  const gameCount = games.length;
                  const gameType: string = data.gameType ?? "Match Emoji";
                  const isWordRush = gameType === "Word Rush";
                  const isBingoGame = gameType.includes("Bingo");

                  // Aggregate total scores across all games per player (by name+avatar)
                  const aggregated: Record<string, { name: string; avatar: string; totalScore: number; wins: number }> = {};
                  for (const game of games) {
                    for (const p of (game.players ?? [])) {
                      const key = `${p.name}|${p.avatar}`;
                      if (!aggregated[key]) aggregated[key] = { name: p.name, avatar: p.avatar, totalScore: 0, wins: 0 };
                      aggregated[key].totalScore += p.score;
                      if (p.isWinner) aggregated[key].wins += 1;
                    }
                  }
                  const scoreLabel = (score: number) =>
                    isWordRush
                      ? `${score} ${t("pts", lang)}`
                      : isBingoGame
                        ? `${score} ${t("marked", lang)}`
                        : `${score} ${plural(score, "pair", "pairs", lang)}`;

                  elements.push(
                    <SummaryCard
                      key={message._id}
                      tone={isWordRush ? "var(--yellow)" : isBingoGame ? "var(--mint)" : "var(--violet)"}
                      icon={isWordRush ? "g-bolt" : isBingoGame ? "g-clover" : "ui-game"}
                      title={isWordRush ? t("Word Rush", lang) : t(gameType, lang)}
                      subtitle={`${gameCount} ${plural(gameCount, "game", "games", lang)} ${t("played", lang)}`}
                    >
                      {gameCount > 1 && (
                        <div className="ec-summary-games">
                          {games.map((game, gi) => {
                            const sorted = [...(game.players ?? [])].sort((a, b) => b.score - a.score);
                            return (
                              <div key={gi} className="ec-summary-game">
                                <div>{t("Game", lang)} {gi + 1}</div>
                                {sorted.map((p, pi) => (
                                  <span key={pi}>
                                    <AvatarDisc id={p.avatar} size={18} border={1.5} shadow={false} />
                                    {p.name}: <b>{isWordRush ? `${p.score} ${t("pts", lang)}` : p.score}</b>
                                    {p.isWinner && <Icon name="g-crown" size={14} />}
                                  </span>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <Podium
                        entries={Object.values(aggregated).map((p) => ({
                          key: `${p.name}|${p.avatar}`,
                          name: p.name,
                          avatar: p.avatar,
                          // Bingo winners are whoever claimed first, not whoever marked the most
                          score: isBingoGame ? p.wins * 1000 + p.totalScore : p.totalScore,
                          label: isBingoGame && p.wins > 0 ? `${p.wins > 1 ? `${p.wins}× ` : ""}BINGO!` : scoreLabel(p.totalScore),
                        }))}
                      />
                    </SummaryCard>
                  );
                  return elements;
                } else {
                  // game_summary (Lost in Translation) — single game format
                  const playerIds = Object.keys(data.players ?? {});
                  const rounds = data.rounds?.length ?? 0;
                  elements.push(
                    <SummaryCard
                      key={message._id}
                      tone="var(--blue)"
                      icon="g-pencil"
                      title={`${t(data.gameType ?? "Game", lang)}${data.level ? ` — ${t("Level", lang)} ${data.level}` : ""}`}
                      subtitle={`${data.cancelled ? t("Game ended early", lang) : t("Game Complete", lang)} · ${rounds} ${plural(rounds, "round", "rounds", lang)}`}
                    >
                      <Podium
                        entries={playerIds.map((pid) => ({
                          key: pid,
                          name: data.players[pid]?.name ?? "?",
                          avatar: data.players[pid]?.avatar ?? "",
                          score: data.totals?.[pid]?.correct ?? 0,
                          label: `${data.totals?.[pid]?.correct ?? 0}/${data.totals?.[pid]?.total ?? 0}`,
                        }))}
                      />
                    </SummaryCard>
                  );
                  return elements;
                }
              } catch (summaryErr) {
                console.error("[BINGO/MATCH/LIT] Summary render error:", action, summaryErr);
                line = { text: action === "emoji_match_summary" ? "Match Emoji Summary" : "Game Summary", icon: "ui-game" };
              }
            } else if (action === "game_correct") {
              const [guesserName, prompt] = name.split("|");
              line = { text: `${guesserName} ${t("guessed correctly!", lang)} (${prompt})`, icon: "g-ok" };
            } else if (action === "game_wrong") {
              const [guesserName, prompt] = name.split("|");
              line = { text: `${guesserName} ${t("guessed wrong", lang)} (${prompt})`, icon: "g-no" };
            }
          }
          elements.push(
            <div key={message._id} className={`ec-sys${line.avatarId || line.icon ? "" : " plain"}`}>
              {line.avatarId && <AvatarDisc id={line.avatarId} size={22} border={1.5} shadow={false} />}
              {line.icon && <Icon name={line.icon} size={18} />}
              <span>{line.text}</span>
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
            showCarrier={message._id === carrierId}
            highlight={hype && message._id === latestId}
          />
        );
        return elements;
      })}
      {/* Game complete bubble at end if no messages came after it */}
      {isGameComplete && onViewGameResults && (!gameCompletedAt || messages[messages.length - 1]?.createdAt <= gameCompletedAt) &&
        renderGameCompleteButton("game-complete")}
      {/* Truth or Dare summary after all messages */}
      {(todSummaryAfterAll || todSummaryNoMessages) && truthOrDareGame && renderTruthOrDareBanner(truthOrDareGame)}

      {typingParticipants && typingParticipants.length > 0 && (
        <TypingIndicator participants={typingParticipants} lang={lang} />
      )}
      <div ref={bottomRef} style={{ flex: "none", height: hype ? 44 : 4 }} />
    </div>
  );
}
