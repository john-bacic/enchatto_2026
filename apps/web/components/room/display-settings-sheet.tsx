"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { TodDebugPanel } from "@/components/tod-debug-panel";
import { AvatarDisc } from "@/components/ui/avatar";
import { EmojiArt, LangBadge } from "@/components/ui/icon";
import { CHAT_SIZES, type useDisplayPrefs } from "@/hooks/use-display-prefs";
import { t } from "@/lib/i18n";

function ToggleRow({ badge, label, on, toggle }: { badge: ReactNode; label: string; on: boolean; toggle: () => void }) {
  return (
    <label className="ec-toggle-row">
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {badge}
        {label}
      </span>
      <input
        type="checkbox"
        checked={on}
        onChange={toggle}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
      <span className={`ec-switch${on ? " on" : ""}`} aria-hidden />
    </label>
  );
}

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
  showSuggestions,
  suggestUnder,
  toggleSuggestPref,
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
  showSuggestions: boolean;
  /** The other language under each thing to say */
  suggestUnder: boolean;
  toggleSuggestPref: ReturnType<typeof useDisplayPrefs>["toggleSuggestPref"];
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
              <ToggleRow
                key={item.key}
                badge={
                  item.key === "romaji" ? (
                    <span className="ec-lang-badge" style={{ width: 26, height: 26, fontSize: 12, background: "var(--pink-soft)" }}>Ro</span>
                  ) : (
                    <LangBadge lang={item.key} />
                  )
                }
                label={item.label}
                on={item.value}
                toggle={item.toggle}
              />
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
            <ToggleRow
              badge={
                <span className="ec-lang-badge" style={{ width: 26, height: 26, background: "var(--yellow-soft)" }}>
                  <EmojiArt emoji="💡" size={18} />
                </span>
              }
              label={t("Things to say", lang)}
              on={showSuggestions}
              toggle={() => toggleSuggestPref("show")}
            />
            {showSuggestions && (
              <ToggleRow
                badge={<LangBadge lang={lang === "ja" ? "en" : "ja"} />}
                label={t(lang === "ja" ? "Show English too" : "Show Japanese too", lang)}
                on={suggestUnder}
                toggle={() => toggleSuggestPref("under")}
              />
            )}
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
