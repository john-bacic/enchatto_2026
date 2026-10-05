"use client";

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
