"use client";

import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { Bunting, Rays } from "@/components/ui/effects";
import { t } from "@/lib/i18n";
import { avatarIconSrc } from "@/lib/types";

export function HypeLayer({
  hype,
  crowd,
  combo,
  lang,
  mult,
}: {
  hype: boolean;
  crowd: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"];
  combo: number;
  lang: string;
  mult: number;
}) {
  return (
    <>
      {hype && (
        <div className="ec-hype-layer">
          <Rays rainbow />
          <div className="ec-crowd">
            {crowd.map((p, i) => (
              <img key={p._id} src={avatarIconSrc(p.avatar.value)} alt="" style={{ animationDelay: `${(i % 3) * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
      {hype && <Bunting top={0} />}
      {combo >= 3 && (
        <div key={combo} className="ec-combo" aria-live="polite">
          <b>×{combo}</b>
          <small>{t("BACK & FORTH!", lang)}</small>
          <em>VIBE ×{mult.toFixed(2)}</em>
          <i style={{ width: `calc((100% - 12px) * ${Math.min(combo, 20) / 20})` }} />
        </div>
      )}
    </>
  );
}
