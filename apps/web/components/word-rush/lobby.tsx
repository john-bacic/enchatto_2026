"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon, LangBadge } from "@/components/ui/icon";
import { PACKS, errorText, unlockAudio, type ViewProps } from "./shared";

export function LobbySheet({
  state,
  myId,
  s,
  toast,
  onMinimize,
}: Pick<ViewProps, "state" | "myId" | "s" | "toast"> & { onMinimize: () => void }) {
  const joinLobby = useMutation(api.wordRush.joinLobby);
  const leaveLobby = useMutation(api.wordRush.leaveLobby);
  const updateSettings = useMutation(api.wordRush.updateSettings);
  const start = useMutation(api.wordRush.start);
  const cancel = useMutation(api.wordRush.cancel);
  const [busy, setBusy] = useState(false);

  const joined = state.players.some((p) => p.participantId === myId);
  const isHost = state.hostParticipantId === myId;
  const gameId = state._id;

  const run = async (fn: () => Promise<unknown>, after?: () => void) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      after?.();
    } catch (e) {
      toast(errorText(e, s.error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ec-sheet-backdrop" style={{ zIndex: 120 }} onClick={onMinimize}>
      <div className="ec-sheet wr-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={s.gameName}>
        <div className="grab" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 40, lineHeight: 1, animation: "ec-hop 1.6s cubic-bezier(.3,1.6,.5,1) infinite", "--r": "-6deg" } as React.CSSProperties}>
            🌸
          </span>
          <div className="wr-sheet-title">{s.gameName}</div>
        </div>
        <p style={{ textAlign: "center", fontSize: 13, fontWeight: 900, opacity: 0.7, marginTop: 6 }}>{s.tagline}</p>
        <div className="wr-dir">
          <span>{s.dirJa}</span>
          <span>{s.dirEn}</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="ec-label">{s.pack}</div>
          <div className="wr-packs">
            {PACKS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${state.pack === p.id ? "on" : ""}${p.id === "chat" ? " chat" : ""}`}
                disabled={!isHost || busy}
                onClick={() =>
                  state.pack !== p.id && run(() => updateSettings({ gameId, participantId: myId, pack: p.id }))
                }
              >
                <Icon name={p.icon} size={22} />
                {s.packs[p.id] ?? p.id}
              </button>
            ))}
          </div>
          <div className={`wr-shimmer${state.cardsReady ? " ready" : ""}`} style={{ marginTop: 10 }}>
            <Icon name={state.cardsReady ? "g-ok" : "ui-sparkle"} size={20} />
            {state.cardsReady ? s.dealt : s.dealing}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            className="wr-toggle"
            disabled={!isHost || busy}
            style={{ cursor: isHost ? "pointer" : "default" }}
            onClick={() => run(() => updateSettings({ gameId, participantId: myId, sayIt: !state.sayIt }))}
          >
            <Icon name="g-music" size={36} />
            <span className="txt">
              {s.sayIt}
              <small>{state.players.length < 2 && state.sayIt ? s.needTwo : s.sayItDesc}</small>
            </span>
            {isHost ? (
              <span className={`wr-switch${state.sayIt ? " on" : ""}`} aria-label={state.sayIt ? s.on : s.off} />
            ) : (
              <span className={`ec-chip${state.sayIt ? "" : " outline"}`} style={state.sayIt ? { background: "var(--mint)", color: "var(--ink)" } : undefined}>
                {state.sayIt ? s.on : s.off}
              </span>
            )}
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="ec-label">
            {s.players(state.players.length)}
            <small>
              <LangBadge lang="en" size={16} /> / <LangBadge lang="ja" size={16} /> = {s.learning}
            </small>
          </div>
          <div className="wr-players">
            {state.players.map((p, i) => (
              <span
                key={p.participantId}
                className={`wr-player${p.participantId === myId ? " me" : ""}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <AvatarDisc id={p.avatarValue} size={30} />
                {p.nickname}
                {p.participantId === state.hostParticipantId && <Icon name="g-crown" size={18} alt={s.host} />}
                <LangBadge lang={p.learning} size={22} />
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          {!joined ? (
            <>
              <button
                type="button"
                className="ec-btn pink wiggle"
                disabled={busy}
                onClick={() => {
                  unlockAudio();
                  void run(() => joinLobby({ gameId, participantId: myId }));
                }}
              >
                {s.join}
              </button>
              <button type="button" className="ec-btn white sm" onClick={onMinimize}>
                {s.notNow}
              </button>
            </>
          ) : isHost ? (
            <>
              <button
                type="button"
                className="ec-btn pink wiggle"
                disabled={busy}
                onClick={() => {
                  unlockAudio();
                  void run(() => start({ gameId, participantId: myId }));
                }}
              >
                <Icon name="g-bolt" size={30} />
                {s.start}
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="ec-btn white sm" onClick={onMinimize}>
                  {s.minimize}
                </button>
                <button
                  type="button"
                  className="ec-btn white sm"
                  disabled={busy}
                  style={{ color: "var(--red)" }}
                  onClick={() => run(() => cancel({ gameId, participantId: myId }))}
                >
                  {s.cancel}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="ec-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontWeight: 900, fontSize: 14, boxShadow: "0 4px 0 var(--ink)" }}>
                <span className="ec-dots">
                  <i />
                  <i />
                  <i />
                </span>
                {s.waitingHost}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="ec-btn white sm" onClick={onMinimize}>
                  {s.minimize}
                </button>
                <button
                  type="button"
                  className="ec-btn white sm"
                  disabled={busy}
                  onClick={() => run(() => leaveLobby({ gameId, participantId: myId }), onMinimize)}
                >
                  {s.leave}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
