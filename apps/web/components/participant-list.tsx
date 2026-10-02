"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AvatarPreview } from "@/components/avatar-preview";
import { AvatarDisc } from "@/components/ui/avatar";
import { t } from "@/lib/i18n";
import { avatarTint } from "@/lib/types";

interface Participant {
  _id: string;
  nickname: string;
  role: "host" | "participant";
  avatar: { type: string; value: string };
  online: boolean;
  departed?: boolean;
  presence?: "online" | "away";
}

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId?: string;
  onLeave?: () => void;
  lang?: string;
}

const STACK_MAX = 3;

function presenceOf(p: Participant): "online" | "away" | "offline" {
  return p.online ? (p.presence ?? "online") : "offline";
}

const PRESENCE_ORDER = { online: 0, away: 1, offline: 2 } as const;

/** Header avatar stack; tapping it opens the member sheet. */
export function ParticipantList({ participants, currentParticipantId, onLeave, lang }: ParticipantListProps) {
  const [open, setOpen] = useState(false);

  // Show all non-departed participants (online, away, AND offline)
  const visibleParticipants = participants
    .filter((p) => !p.departed)
    .sort((a, b) => PRESENCE_ORDER[presenceOf(a)] - PRESENCE_ORDER[presenceOf(b)]);
  const [first, second] = visibleParticipants;
  const collapsed = visibleParticipants.length > STACK_MAX;

  return (
    <>
      <button
        className={`ec-stack${collapsed ? " pile" : ""}`}
        onClick={() => setOpen(true)}
        aria-label={`${t("In this room", lang)} ${visibleParticipants.length}`}
        aria-haspopup="dialog"
      >
        {visibleParticipants.length === 0 && <span className="ec-stack-empty">?</span>}
        {collapsed ? (
          <>
            <AvatarDisc id={second.avatar.value} size={26} border={2.5} shadow={false} className="ec-pile-back" />
            <AvatarDisc id={first.avatar.value} size={32} border={2.5} shadow={false} />
            <span className="ec-pile-count">{visibleParticipants.length}</span>
          </>
        ) : (
          visibleParticipants.map((p) => (
            <AvatarDisc
              key={p._id}
              id={p.avatar.value}
              size={30}
              border={2.5}
              shadow={false}
              style={presenceOf(p) === "online" ? undefined : { filter: "grayscale(0.8)", opacity: 0.7 }}
            />
          ))
        )}
      </button>

      {open &&
        createPortal(
        <div className="ec-sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="ec-sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
            <div className="ec-sheet-grip" />
            <div className="ec-sheet-head">
              <h2>{t("In this room", lang)}</h2>
              <span className="ec-chip outline">{visibleParticipants.length}</span>
              <button className="ec-round-btn" onClick={() => setOpen(false)} aria-label={t("Close", lang)}>
                ✕
              </button>
            </div>
            <div className="ec-sheet-body">
              {visibleParticipants.length === 0 ? (
                <p style={{ padding: "18px 0", textAlign: "center", opacity: 0.6 }}>
                  {t("Nobody else is here yet.", lang)}
                </p>
              ) : (
                <div className="ec-people">
                  {visibleParticipants.map((p, i) => {
                    const isMe = p._id === currentParticipantId;
                    const presence = presenceOf(p);
                    return (
                      <div
                        key={p._id}
                        className={`ec-person${presence === "offline" ? " dim" : ""}`}
                        style={{
                          animationDelay: `${i * 0.04}s`,
                          background: p.role === "host" ? undefined : avatarTint(p.avatar.value),
                        }}
                      >
                        <AvatarPreview avatarId={p.avatar.value} nickname={p.nickname} size={44} presence={presence} isMe={isMe} />
                        <div className="ec-person-name">
                          <b>
                            {p.nickname}
                            {isMe ? ` ${t("(you)", lang)}` : ""}
                          </b>
                          <small>
                            <span className={`ec-presence-dot ${presence}`} />
                            {t(presence, lang)}
                          </small>
                        </div>
                        {p.role === "host" && <span className="ec-chip" style={{ background: "var(--violet)" }}>{t("host", lang).toUpperCase()}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
              {onLeave && (
                <button
                  className="ec-btn red sm"
                  style={{ marginTop: 18 }}
                  onClick={() => {
                    setOpen(false);
                    onLeave();
                  }}
                >
                  {t("Leave room", lang)}
                </button>
              )}
            </div>
          </div>
        </div>,
          document.body
        )}
    </>
  );
}
