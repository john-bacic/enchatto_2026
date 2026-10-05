"use client";

import type { ReactNode } from "react";
import { Chatto } from "@/components/ui/chatto";
import { RoomBackground } from "@/components/ui/effects";
import { t } from "@/lib/i18n";

export function LoadingState({ lang }: { lang: string }) {
  return (
    <>
      <RoomBackground waiting />
      <div className="ec-center-state">
        <Chatto size={110} shadow />
        <div className="ec-chunky" style={{ fontSize: 18 }}>{t("Loading room...", lang)}</div>
        <span className="ec-dots"><i /><i /><i /></span>
      </div>
    </>
  );
}

export function RoomNotFound({ lang }: { lang: string }) {
  return (
    <>
      <RoomBackground />
      <div className="ec-center-state">
        <Chatto size={110} bob={false} wave={false} shadow />
        <h1>{t("Room not found", lang)}</h1>
        <p>{t("This room may have been closed.", lang)}</p>
        <a href="/" className="ec-btn white sm" style={{ width: "auto", padding: "0 22px", textDecoration: "none" }}>
          {t("Back home", lang)}
        </a>
      </div>
    </>
  );
}

export function JoinRequired({ background, lang, joinCode }: { background: ReactNode; lang: string; joinCode: string }) {
  return (
    <>
      {background}
      <div className="ec-center-state">
        <Chatto size={110} shadow />
        <h1>{t("Join Required", lang)}</h1>
        <p>{t("You need to join this room first.", lang)}</p>
        <a href={`/join/${joinCode}`} className="ec-btn pink" style={{ width: "auto", padding: "0 28px", textDecoration: "none" }}>
          {t("Join Room", lang)}
        </a>
      </div>
    </>
  );
}
