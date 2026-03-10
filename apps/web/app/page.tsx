"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QrScanner } from "@/components/qr-scanner";
import { t } from "@/lib/i18n";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [lang] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("enchatto_lastLanguage") ?? "ja";
    return "ja";
  });

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

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        {t("Enchatto", lang)}
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "1.1rem", maxWidth: "400px" }}>
        {t("Real-time multilingual conversation rooms.", lang)}
      </p>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {/* QR Scanner button */}
        <button
          onClick={() => setShowScanner(true)}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            background: "var(--primary)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            marginBottom: "1.25rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="3" height="3" />
            <line x1="21" y1="14" x2="21" y2="14.01" />
            <line x1="21" y1="21" x2="21" y2="21.01" />
            <line x1="17" y1="21" x2="17" y2="21.01" />
            <line x1="21" y1="17" x2="21" y2="17.01" />
          </svg>
          {t("Scan QR Code", lang)}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.25rem",
            color: "var(--muted)",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span>{t("or enter code", lang)}</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        {/* Join code input */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder={t("e.g. ABC123", lang)}
            maxLength={10}
            style={{
              flex: 1,
              padding: "0.6rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              fontSize: "1.1rem",
              letterSpacing: "0.15em",
              fontFamily: "monospace",
              textAlign: "center",
              outline: "none",
            }}
          />
          <button
            onClick={handleJoin}
            disabled={!joinCode.trim()}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              background: joinCode.trim() ? "var(--primary)" : "var(--muted)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: joinCode.trim() ? "pointer" : "default",
            }}
          >
            {t("Join", lang)}
          </button>
        </div>
      </div>

      {showScanner && (
        <QrScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          lang={lang}
        />
      )}

      {process.env.NEXT_PUBLIC_GIT_SHA && (
        <div
          style={{
            textAlign: "center",
            fontSize: "0.6rem",
            color: "var(--muted)",
            opacity: 0.5,
            padding: "0.15rem 0",
          }}
        >
          v{process.env.NEXT_PUBLIC_GIT_SHA.slice(0, 7)}
        </div>
      )}
    </main>
  );
}
