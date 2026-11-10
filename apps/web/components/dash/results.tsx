"use client";

import { useEffect, useState } from "react";
import { AvatarDisc } from "@/components/ui/avatar";
import { Confetti } from "@/components/ui/effects";
import { Icon } from "@/components/ui/icon";
import type { Doc } from "@/convex/_generated/dataModel";
import { LEVEL_NAMES } from "@/lib/dash/level-names";
import { DashCard } from "./lobby";
import { dashCopy, ordinal, raceClock } from "./strings";

type Game = Doc<"dashGames">;

/** Everyone by points, most first; equal points share a place */
export function standings(game: Game) {
  const sorted = [...game.players].sort((a, b) => b.score - a.score);
  return sorted.map((p) => ({ ...p, place: 1 + sorted.filter((o) => o.score > p.score).length }));
}

function Standings({ game, participantId, gains, lang }: { game: Game; participantId: string; gains?: Record<string, number>; lang?: string }) {
  const c = dashCopy(lang);
  return (
    <div className="dash-rows">
      {standings(game).map((p) => (
        <div key={p.participantId} className={`dash-row${p.participantId === participantId ? " me" : ""}`}>
          <span className="n">{ordinal(p.place, lang)}</span>
          <AvatarDisc id={p.avatarValue} size={28} border={2} shadow={false} />
          <span className="name">{p.nickname}</span>
          {gains && gains[p.participantId] ? <span className="gain">+{gains[p.participantId]}</span> : null}
          <span className="pts">
            {p.score} {c.pts}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Between two rounds: how the round went, the standings, and the wait for the next course */
/**
 * A round's placings and the standings so far, until the next course starts. `onNext` is the host's: it starts
 * the next course now, for everyone, without waiting the count out.
 */
export function DashRoundResults({
  game,
  participantId,
  lang,
  serverNow,
  onNext,
}: {
  game: Game;
  participantId: string;
  lang?: string;
  serverNow: () => number;
  onNext?: () => void;
}) {
  const c = dashCopy(lang);
  // Pressed once: the screen changes when the server has moved on, which takes a moment
  const [going, setGoing] = useState(false);
  const result = game.results[game.results.length - 1];
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, Math.ceil(((game.nextAt ?? 0) - serverNow()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [game.nextAt, serverNow]);
  if (!result) return null;
  const name = LEVEL_NAMES[result.level % LEVEL_NAMES.length];
  const byId = new Map(game.players.map((p) => [p.participantId, p]));
  const gains: Record<string, number> = {};
  for (const row of result.rows) gains[row.participantId] = row.points;
  return (
    <DashCard>
      <div className="ec-chunky" style={{ fontSize: 13, opacity: 0.6 }}>
        {c.round} {game.results.length}/{game.levels.length} · {lang === "ja" ? name.ja : name.en}
      </div>
      <h2 className="ec-chunky" style={{ fontSize: 24, margin: "2px 0 10px", textShadow: "0 3px 0 var(--yellow)" }}>
        {c.results}
      </h2>
      <div className="dash-rows" style={{ marginBottom: 14 }}>
        {result.rows.map((row) => {
          const p = byId.get(row.participantId);
          if (!p) return null;
          return (
            <div key={row.participantId} className={`dash-row${row.participantId === participantId ? " me" : ""}`}>
              <span className="n">{ordinal(row.place, lang)}</span>
              <AvatarDisc id={p.avatarValue} size={28} border={2} shadow={false} />
              <span className="name">{p.nickname}</span>
              <span className="time">{row.ms !== undefined ? raceClock(row.ms / 1000) : `${Math.round(row.progress * 100)}%`}</span>
              <span className="gain">+{row.points}</span>
            </div>
          );
        })}
      </div>
      <div className="ec-label" style={{ justifyContent: "flex-start", marginBottom: 6 }}>
        {c.standings}
      </div>
      <Standings game={game} participantId={participantId} lang={lang} />
      <p className="ec-chunky" style={{ fontSize: 15, marginTop: 14 }}>
        {c.nextIn} {left}…
      </p>
      {onNext && (
        <button
          className="ec-btn pink"
          style={{ marginTop: 10, fontSize: 18, opacity: going ? 0.6 : 1 }}
          disabled={going}
          onClick={() => {
            setGoing(true);
            onNext();
          }}
        >
          {c.nextNow} ▶
        </button>
      )}
    </DashCard>
  );
}

/** After the last round: the podium, every round's points, and another go */
export function DashFinal({
  game,
  participantId,
  lang,
  onPlayAgain,
  onClose,
}: {
  game: Game;
  participantId: string;
  lang?: string;
  onPlayAgain: () => void;
  onClose: () => void;
}) {
  const c = dashCopy(lang);
  const table = standings(game);
  const top = table.filter((p) => p.place === 1);
  const podium = [table[1], table[0], table[2]].filter(Boolean);
  const heights: Record<number, number> = { 1: 74, 2: 54, 3: 40 };
  const tints: Record<number, string> = { 1: "var(--yellow)", 2: "var(--blue-soft)", 3: "var(--pink-soft)" };
  return (
    <DashCard>
      <Confetti burstKey={game._id} />
      <Icon name="g-crown" size={52} style={{ animation: "ec-drop-in 0.6s cubic-bezier(0.3, 1.6, 0.5, 1)" }} />
      <h2 className="ec-chunky" style={{ fontSize: 26, margin: "0 0 2px", textShadow: "0 3px 0 var(--yellow)" }}>
        {top.length > 1 ? c.tie : c.winner}
      </h2>
      <p style={{ fontSize: 15, fontWeight: 900, marginBottom: 8 }}>{top.map((p) => p.nickname).join(" & ")}</p>
      <div className="dash-podium">
        {podium.map((p) => (
          <div key={p.participantId}>
            <AvatarDisc id={p.avatarValue} size={p.place === 1 ? 62 : 48} />
            <span style={{ maxWidth: 92, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nickname}</span>
            <div className="step" style={{ height: heights[Math.min(3, p.place)], background: tints[Math.min(3, p.place)] }}>
              {p.place}
            </div>
          </div>
        ))}
      </div>
      <div className="ec-label" style={{ justifyContent: "flex-start", marginBottom: 6 }}>
        {c.finalResults}
      </div>
      <Standings game={game} participantId={participantId} lang={lang} />
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="ec-btn white" style={{ flex: 1, fontSize: 17 }} onClick={onClose}>
          {c.close}
        </button>
        <button className="ec-btn pink wiggle" style={{ flex: 1.3, fontSize: 17 }} onClick={onPlayAgain}>
          {c.playAgain}
        </button>
      </div>
    </DashCard>
  );
}
