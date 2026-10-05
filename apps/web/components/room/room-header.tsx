"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { ParticipantList } from "@/components/participant-list";
import { VibeInfo } from "@/components/vibe-info";
import { AvatarDisc } from "@/components/ui/avatar";
import { Wordmark } from "@/components/ui/logo";
import { t } from "@/lib/i18n";
import { HYPE_AT, formatVibe } from "@/lib/vibe";

export function RoomHeader({
  me,
  setShowDisplaySettings,
  lang,
  logoHop,
  hype,
  isClosed,
  onlineCount,
  awayCount,
  vibeRef,
  setShowVibeInfo,
  showVibeInfo,
  vibe,
  recentCount,
  switches,
  mult,
  closeVibeInfo,
  participants,
  participantId,
  roomState,
  setShowLeaveConfirm,
}: {
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  setShowDisplaySettings: Dispatch<SetStateAction<boolean>>;
  lang: string;
  logoHop: number;
  hype: boolean;
  isClosed: boolean;
  onlineCount: number;
  awayCount: number;
  vibeRef: RefObject<HTMLButtonElement>;
  setShowVibeInfo: Dispatch<SetStateAction<boolean>>;
  showVibeInfo: boolean;
  vibe: number;
  recentCount: number;
  switches: number;
  mult: number;
  closeVibeInfo: () => void;
  participants: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"];
  participantId: string;
  roomState: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>;
  setShowLeaveConfirm: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header className="ec-chat-head">
      {me && (
        <button
          onClick={() => setShowDisplaySettings(true)}
          aria-label={t("Display settings", lang)}
          style={{ flex: "none", padding: 0, border: 0, background: "none", cursor: "pointer", borderRadius: "50%" }}
        >
          <AvatarDisc id={me.avatar.value} size={40} />
        </button>
      )}
      <div className="ec-chat-title">
        <h1>
          <Wordmark text={t("Enchatto", lang)} size={22} hopKey={logoHop} hot={hype && !isClosed} />
        </h1>
        {isClosed ? (
          <span style={{ color: "var(--red)", opacity: 1 }}>{t("Room closed", lang)}</span>
        ) : (
          <span>
            <i className="ec-online-dot" />
            {onlineCount} {t("online", lang)}{awayCount > 0 ? `, ${awayCount} ${t("away", lang)}` : ""}
          </span>
        )}
      </div>
      <button
        ref={vibeRef}
        type="button"
        className={`ec-vibe${hype ? " hot" : ""}`}
        onClick={() => setShowVibeInfo((v) => !v)}
        aria-expanded={showVibeInfo}
        aria-label={`VIBE ${vibe}`}
      >
        <small>VIBE</small>
        <b key={vibe}>{formatVibe(vibe)}</b>
      </button>
      {showVibeInfo && (
        <VibeInfo
          vibe={formatVibe(vibe)}
          score={vibe}
          hypeAt={HYPE_AT}
          messageCount={recentCount}
          switches={switches}
          mult={mult}
          hype={hype}
          lang={lang}
          anchorRef={vibeRef}
          onClose={closeVibeInfo}
        />
      )}
      <ParticipantList
        participants={participants}
        currentParticipantId={participantId}
        roomCode={roomState.room.joinCode}
        onLeave={() => setShowLeaveConfirm(true)}
        lang={lang}
      />
    </header>
  );
}
