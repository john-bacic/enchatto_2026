"use client";

import type { Dispatch, SetStateAction } from "react";
import { Chatto } from "@/components/ui/chatto";
import { t } from "@/lib/i18n";

export function LeaveConfirm({
  setShowLeaveConfirm,
  lang,
  handleLeave,
}: {
  setShowLeaveConfirm: Dispatch<SetStateAction<boolean>>;
  lang: string;
  handleLeave: () => Promise<void>;
}) {
  return (
    <div className="ec-modal-backdrop" style={{ zIndex: 210 }} onClick={() => setShowLeaveConfirm(false)}>
      <div className="ec-card ec-modal" onClick={(e) => e.stopPropagation()}>
        <Chatto size={84} bob={false} wave={false} style={{ margin: "0 auto 8px" }} />
        <h2 className="ec-chunky" style={{ fontSize: 22, marginBottom: 6 }}>
          {t("Leave room?", lang)}
        </h2>
        <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 18 }}>
          {t("You can rejoin later with the same room code.", lang)}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ec-btn white sm" style={{ flex: 1 }} onClick={() => setShowLeaveConfirm(false)}>
            {t("Stay", lang)}
          </button>
          <button className="ec-btn red sm" style={{ flex: 1 }} onClick={handleLeave}>
            {t("Leave", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
