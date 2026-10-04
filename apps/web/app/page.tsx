"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QrScanner } from "@/components/qr-scanner";
import { Logo } from "@/components/ui/logo";
import { Chatto } from "@/components/ui/chatto";
import { Icon } from "@/components/ui/icon";
import { RoomBackground } from "@/components/ui/effects";
import { t } from "@/lib/i18n";
import { isImeComposing } from "@/lib/keyboard";
import "./screens.css";

const CODE_LENGTH = 6;
const CELL_TONES = [
  ["var(--pink-soft)", "-4deg"],
  ["var(--yellow-soft)", "3deg"],
  ["var(--mint-soft)", "-2deg"],
  ["var(--blue-soft)", "4deg"],
  ["var(--violet-soft)", "-3deg"],
  ["#ffe6dc", "2deg"],
];

/** Accepts a bare code or a pasted join URL; returns the cleaned, upper-cased code. */
function cleanCode(value: string) {
  const fromUrl = value.match(/\/join\/([A-Za-z0-9]+)/);
  return (fromUrl ? fromUrl[1] : value).replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, CODE_LENGTH);
}

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [lang, setLang] = useState("ja");
  const [greetEn, setGreetEn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setLang(localStorage.getItem("enchatto_lastLanguage") ?? "ja");
    } catch {
      // storage blocked
    }
  }, []);

  // Chatto alternates greetings in time with the bubble's wobble.
  useEffect(() => {
    const id = setInterval(() => setGreetEn((v) => !v), 2400);
    return () => clearInterval(id);
  }, []);

  const toggleLang = () => {
    const next = lang === "ja" ? "en" : "ja";
    setLang(next);
    try {
      localStorage.setItem("enchatto_lastLanguage", next);
    } catch {
      // storage blocked
    }
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    router.push(`/join/${code}`);
  };

  const handleScan = useCallback(
    (result: string) => {
      setShowScanner(false);

      // If it's a URL like https://enchatto.vercel.app/join/ABC123, extract the code
      const joinMatch = result.match(/\/join\/([A-Za-z0-9]+)/);
      if (joinMatch) {
        router.push(`/join/${joinMatch[1].toUpperCase()}`);
        return;
      }

      // Otherwise treat the whole scanned text as a join code
      const code = result.trim().toUpperCase();
      if (code) {
        router.push(`/join/${code}`);
      }
    },
    [router]
  );

  const complete = joinCode.length === CODE_LENGTH;

  return (
    <main className="ec-home ec-col">
      <RoomBackground />
      <button
        className="ec-round-btn ec-home-lang"
        onClick={toggleLang}
        aria-label={t("Switch language", lang)}
      >
        <span>
          <b>あ</b>/A
        </span>
      </button>

      <Logo tagline={t("CHAT ACROSS LANGUAGES", lang)} style={{ marginTop: 104 }} />

      <div style={{ position: "relative", marginTop: 26, width: 120 }}>
        <Chatto size={120} shadow />
        <div className="ec-say" style={{ left: 104, top: -6 }}>
          {greetEn ? "Hello!" : "こんにちは！"}
        </div>
      </div>

      <div
        className="ec-card"
        style={{
          width: "100%",
          marginTop: 24,
          padding: "20px 18px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <button
          className="ec-btn"
          style={{ minHeight: 64, fontSize: lang === "ja" ? 18 : 21, whiteSpace: "nowrap" }}
          onClick={() => setShowScanner(true)}
        >
          <Icon name="ui-camera" size={40} style={{ filter: "drop-shadow(0 2px 0 rgba(29, 27, 79, 0.5))" }} />
          {t("SCAN QR CODE", lang)}
        </button>

        <div className="ec-divider">{t("or type the room code", lang)}</div>

        <div className="ec-code-wrap" onClick={() => inputRef.current?.focus()}>
          <div className="ec-code-cells" aria-hidden>
            {Array.from({ length: CODE_LENGTH }, (_, i) => {
              const ch = joinCode[i];
              const active = !ch && i === joinCode.length;
              const [c, r] = CELL_TONES[i % CELL_TONES.length];
              return (
                <div
                  key={ch ? `${i}-${ch}` : `${i}-empty`}
                  className={`ec-cell${ch ? " filled" : ""}${active ? " active" : ""}`}
                  style={{ "--c": c, "--r": r } as React.CSSProperties}
                >
                  {ch ?? (active ? "?" : "")}
                </div>
              );
            })}
          </div>
          <input
            ref={inputRef}
            className="ec-code-input"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={t("Room code", lang)}
            value={joinCode}
            onChange={(e) => setJoinCode(cleanCode(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && !isImeComposing(e) && handleJoin()}
          />
        </div>

        <button
          className={`ec-btn pink${complete ? " wiggle" : ""}`}
          style={{ minHeight: 64, fontSize: 22 }}
          onClick={handleJoin}
          disabled={!joinCode.trim()}
        >
          {t("JOIN!", lang)}
        </button>
      </div>

      <div className="ec-version" style={{ marginTop: "auto", paddingTop: 24 }}>
        v{(process.env.NEXT_PUBLIC_GIT_SHA || "dev").slice(0, 7)}
      </div>

      {showScanner && (
        <QrScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          lang={lang}
        />
      )}
    </main>
  );
}
