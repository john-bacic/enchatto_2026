"use client";

import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { Doc } from "@/convex/_generated/dataModel";
import { LEVEL_NAMES } from "@/lib/dash/level-names";
import { dashCopy } from "./strings";

export const DASH_ICON = "o-shootingstar";
const LEVEL_TINTS = ["var(--pink-soft)", "var(--yellow-soft)", "var(--blue-soft)", "#fff", "var(--violet-soft)"];

export function DashCard({ children, onBackdrop }: { children: React.ReactNode; onBackdrop?: () => void }) {
  return (
    <div className="ec-sheet-backdrop" style={{ zIndex: 95, alignItems: "center", padding: 16 }} onClick={onBackdrop}>
      <div
        className="ec-card"
        style={{
          width: "100%",
          maxWidth: 380,
          maxHeight: "92dvh",
          overflowY: "auto",
          padding: "20px 16px 16px",
          textAlign: "center",
          background: "var(--paper)",
          animation: "ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DashLobby({
  game,
  participantId,
  lang,
  coarse,
  onJoin,
  onLeave,
  onStart,
  onCancel,
  onClose,
}: {
  game: Doc<"dashGames">;
  participantId: string;
  lang?: string;
  coarse: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onStart: () => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  const c = dashCopy(lang);
  const inLobby = game.players.some((p) => p.participantId === participantId);
  const isGameHost = game.hostParticipantId === participantId;
  return (
    <DashCard onBackdrop={onClose}>
      <Icon name={DASH_ICON} size={64} style={{ animation: "ec-drop-in 0.6s cubic-bezier(0.3, 1.6, 0.5, 1)" }} />
      <h2 className="ec-chunky" style={{ fontSize: 26, margin: "2px 0 4px", textShadow: "0 3px 0 var(--yellow)" }}>
        {c.title}
      </h2>
      <p style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.75, marginBottom: 12, lineHeight: 1.45 }}>{c.blurb}</p>

      {/* The courses this tournament drew from the ten there are, in the order they are run */}
      {game.levels.length > 0 && (
        <>
          <div className="ec-label" style={{ justifyContent: "flex-start", marginBottom: 0 }}>
            {c.courses}
          </div>
          <div className="dash-levels">
            {game.levels.map((level, i) => {
              const name = LEVEL_NAMES[level % LEVEL_NAMES.length];
              return (
                <span key={i} style={{ background: LEVEL_TINTS[i % LEVEL_TINTS.length] }}>
                  <b>{i + 1}</b>
                  {lang === "ja" ? name.ja : name.en}
                </span>
              );
            })}
          </div>
        </>
      )}

      <div className="ec-label" style={{ justifyContent: "flex-start", marginBottom: 6 }}>
        {c.players} <small>{game.players.length}</small>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 14 }}>
        {game.players.map((p) => (
          <div key={p.participantId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 62 }}>
            <AvatarDisc id={p.avatarValue} size={46} />
            <span style={{ fontSize: 11, fontWeight: 900, maxWidth: 62, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.nickname}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11.5, fontWeight: 900, opacity: 0.6, marginBottom: 12 }}>{coarse ? c.howTouch : c.howKeys}</p>

      {!inLobby ? (
        <button className="ec-btn yellow wiggle" onClick={onJoin}>
          {c.join}
        </button>
      ) : isGameHost ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ec-btn white" style={{ flex: 1, fontSize: 17 }} onClick={onCancel}>
            {c.cancel}
          </button>
          <button className="ec-btn pink wiggle" style={{ flex: 1.3, fontSize: 19 }} onClick={onStart}>
            {c.start}
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>{c.waitingHost}</p>
          <button className="ec-btn white" style={{ fontSize: 17 }} onClick={onLeave}>
            {c.leave}
          </button>
        </>
      )}
    </DashCard>
  );
}
