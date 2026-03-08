"use client";

import { useState, useEffect, useRef } from "react";
import { AvatarPreview } from "@/components/avatar-preview";
import { t } from "@/lib/i18n";

interface Participant {
  _id: string;
  nickname: string;
  role: "host" | "participant";
  avatar: { type: string; value: string };
  online: boolean;
  presence?: "online" | "away";
}

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId?: string;
  onLeave?: () => void;
  lang?: string;
}

export function ParticipantList({ participants, currentParticipantId, onLeave, lang }: ParticipantListProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip when tapping outside (mobile)
  useEffect(() => {
    if (!tooltip) return;
    const handleTouchOutside = (e: TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTooltip(null);
      }
    };
    document.addEventListener("touchstart", handleTouchOutside);
    return () => document.removeEventListener("touchstart", handleTouchOutside);
  }, [tooltip]);

  const activeParticipants = participants.filter((p) => p.online);
  const onlineCount = activeParticipants.filter((p) => (p.presence ?? "online") === "online").length;
  const awayCount = activeParticipants.length - onlineCount;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
      <div ref={containerRef} style={{ display: "flex", gap: "0.15rem", position: "relative" }}>
        {activeParticipants.slice(0, 5).map((p) => {
          const isMe = p._id === currentParticipantId;
          const label = `${p.nickname}${isMe ? ` ${t("(you)", lang)}` : ""}${p.role === "host" ? ` ${t("· host", lang)}` : ""}${(p.presence ?? "online") === "away" ? ` ${t("· away", lang)}` : ""}`;
          return (
            <div
              key={p._id}
              style={{ position: "relative" }}
              onMouseEnter={() => setTooltip(p._id)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => setTooltip((prev) => (prev === p._id ? null : p._id))}
            >
              <AvatarPreview
                avatarId={p.avatar.value}
                nickname={p.nickname}
                size={26}
                presence={p.presence ?? "online"}
                isMe={isMe}
              />
              {tooltip === p._id && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "0.35rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    whiteSpace: "nowrap",
                    zIndex: 50,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    pointerEvents: "none",
                  }}
                >
                  {label}
                  <div
                    style={{
                      position: "absolute",
                      top: "-4px",
                      left: "50%",
                      transform: "translateX(-50%) rotate(45deg)",
                      width: "8px",
                      height: "8px",
                      background: "var(--surface)",
                      borderLeft: "1px solid var(--border)",
                      borderTop: "1px solid var(--border)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
        {activeParticipants.length > 5 && (
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6rem",
              fontWeight: 600,
              color: "var(--muted)",
            }}
          >
            +{activeParticipants.length - 5}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--muted)",
          marginLeft: "0.15rem",
          whiteSpace: "nowrap",
        }}
      >
        {onlineCount} {t("online", lang)}{awayCount > 0 ? `, ${awayCount} ${t("away", lang)}` : ""}
      </span>
      {onLeave && (
        <button
          onClick={onLeave}
          title={t("Leave room", lang)}
          style={{
            background: "none",
            border: "none",
            padding: "0.25rem",
            marginLeft: "0.15rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "var(--muted)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
