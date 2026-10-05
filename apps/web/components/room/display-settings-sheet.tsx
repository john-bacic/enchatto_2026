"use client";

import type { Dispatch, SetStateAction } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { TodDebugPanel } from "@/components/tod-debug-panel";
import { AvatarDisc } from "@/components/ui/avatar";
import { LangBadge } from "@/components/ui/icon";
import { CHAT_SIZES, type useDisplayPrefs } from "@/hooks/use-display-prefs";
import { t } from "@/lib/i18n";

export function DisplaySettingsSheet({
  setShowDisplaySettings,
  me,
  lang,
  showEnglish,
  toggleDisplay,
  showJapanese,
  showRomaji,
  chatSize,
  pickChatSize,
  setShowLeaveConfirm,
  convexUrl,
  roomId,
}: {
  setShowDisplaySettings: Dispatch<SetStateAction<boolean>>;
  me: NonNullable<FunctionReturnType<typeof api.rooms.getRoomState>>["participants"][number] | undefined;
  lang: string;
  showEnglish: boolean;
  toggleDisplay: ReturnType<typeof useDisplayPrefs>["toggleDisplay"];
  showJapanese: boolean;
  showRomaji: boolean;
  chatSize: ReturnType<typeof useDisplayPrefs>["chatSize"];
  pickChatSize: ReturnType<typeof useDisplayPrefs>["pickChatSize"];
  setShowLeaveConfirm: Dispatch<SetStateAction<boolean>>;
  convexUrl: string;
  roomId: string;
}) {
  return (
    <div className="ec-sheet-backdrop" style={{ zIndex: 100 }} onClick={() => setShowDisplaySettings(false)}>
      <div className="ec-sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="ec-sheet-grip" />
        <div className="ec-sheet-head">
          {me && <AvatarDisc id={me.avatar.value} size={40} />}
          <h2 style={{ minWidth: 0, overflowWrap: "anywhere" }}>
            {t("Display for", lang)} {me?.nickname ?? ""}
          </h2>
          <button className="ec-round-btn" onClick={() => setShowDisplaySettings(false)} aria-label={t("Close", lang)}>
            ✕
          </button>
        </div>
        <div className="ec-sheet-body">
          <div>
            {([
              { key: "en", label: t("English", lang), value: showEnglish, toggle: () => toggleDisplay("showEnglish") },
              { key: "ja", label: t("Japanese", lang), value: showJapanese, toggle: () => toggleDisplay("showJapanese") },
              { key: "romaji", label: t("Romaji", lang), value: showRomaji, toggle: () => toggleDisplay("showRomaji") },
            ] as const).map((item) => (
              <label key={item.key} className="ec-toggle-row">
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {item.key === "romaji" ? (
                    <span className="ec-lang-badge" style={{ width: 26, height: 26, fontSize: 12, background: "var(--pink-soft)" }}>Ro</span>
                  ) : (
                    <LangBadge lang={item.key} />
                  )}
                  {item.label}
                </span>
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={item.toggle}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                />
                <span className={`ec-switch${item.value ? " on" : ""}`} aria-hidden />
              </label>
            ))}
            <div className="ec-toggle-row" style={{ cursor: "default" }}>
              <span>{t("Chat text size", lang)}</span>
              <div className="ec-size-picker" role="radiogroup" aria-label={t("Chat text size", lang)}>
                {CHAT_SIZES.map((s) => (
                  <button
                    key={s.key}
                    role="radio"
                    aria-checked={chatSize === s.key}
                    aria-label={t(s.key === "s" ? "Small" : s.key === "m" ? "Medium" : "Large", lang)}
                    className={chatSize === s.key ? "on" : undefined}
                    style={{ fontSize: s.glyph }}
                    onClick={() => pickChatSize(s.key)}
                  >
                    A
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="ec-btn red sm" style={{ flex: 1 }} onClick={() => { setShowDisplaySettings(false); setShowLeaveConfirm(true); }}>
              {t("Leave room", lang)}
            </button>
            <button className="ec-btn sm" style={{ flex: 1 }} onClick={() => setShowDisplaySettings(false)}>
              {t("Done", lang)}
            </button>
          </div>
          <p className="ec-version" style={{ marginTop: 14 }}>
            {convexUrl.replace("https://", "").replace(".convex.cloud", "")} · web v0.1.0
            {process.env.NEXT_PUBLIC_GIT_SHA && process.env.NEXT_PUBLIC_GIT_SHA !== "dev" ? (<><br />github: {process.env.NEXT_PUBLIC_GIT_SHA}</>) : null}
            {process.env.NEXT_PUBLIC_VERCEL_URL ? (<><br />vercel: {process.env.NEXT_PUBLIC_VERCEL_URL}</>) : null}
          </p>
          {/* Game debug panel */}
          <div style={{ marginTop: 12, borderTop: "2.5px dashed var(--line-soft)", paddingTop: 12 }}>
            <TodDebugPanel roomId={roomId} embedded />
          </div>
        </div>
      </div>
    </div>
  );
}
