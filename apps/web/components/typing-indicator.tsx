"use client";

import { PRESET_AVATARS } from "@/lib/types";
import { t } from "@/lib/i18n";

interface TypingParticipant {
  _id: string;
  nickname: string;
  avatar: { type: string; value: string };
  typingAction: "typing" | "drawing" | "voicing";
}

interface TypingIndicatorProps {
  participants: TypingParticipant[];
  lang?: string;
}

function getEmoji(avatarValue: string): string {
  return PRESET_AVATARS.find((a) => a.id === avatarValue)?.emoji ?? "👤";
}

function getAvatarColor(avatarValue: string): string {
  return PRESET_AVATARS.find((a) => a.id === avatarValue)?.color ?? "#e5e7eb";
}

function actionLabel(action: string, lang?: string): string {
  if (action === "drawing") return t("is drawing", lang);
  if (action === "voicing") return t("is speaking", lang);
  return t("is typing", lang);
}

export function TypingIndicator({ participants, lang }: TypingIndicatorProps) {
  if (participants.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.5rem" }}>
      {participants.map((p) => (
        <div
          key={p._id}
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "0.5rem",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.15rem",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: getAvatarColor(p.avatar.value),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
              }}
            >
              {getEmoji(p.avatar.value)}
            </div>
            <span
              style={{
                fontSize: "0.6rem",
                color: "var(--muted)",
                maxWidth: "40px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              {p.nickname}
            </span>
          </div>

          {/* Bubble with action-specific animation */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px 16px 16px 4px",
              padding: "0.5rem 0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {p.typingAction === "drawing" ? (
              <>
                <span className="drawing-pencil">✏️</span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {actionLabel(p.typingAction, lang)}
                </span>
              </>
            ) : p.typingAction === "voicing" ? (
              <>
                <span style={{ display: "flex", alignItems: "center", gap: "2px", height: "16px" }}>
                  <span className="voice-bar" style={{ animationDelay: "0ms" }} />
                  <span className="voice-bar" style={{ animationDelay: "150ms" }} />
                  <span className="voice-bar" style={{ animationDelay: "300ms" }} />
                  <span className="voice-bar" style={{ animationDelay: "450ms" }} />
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {actionLabel(p.typingAction, lang)}
                </span>
              </>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                <span className="typing-dot" style={{ animationDelay: "300ms" }} />
              </span>
            )}
          </div>
          <style jsx>{`
            .typing-dot {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: var(--muted);
              display: inline-block;
              animation: typingBounce 1.2s infinite ease-in-out;
            }
            @keyframes typingBounce {
              0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
              30% { transform: translateY(-4px); opacity: 1; }
            }
            .drawing-pencil {
              display: inline-block;
              font-size: 0.85rem;
              animation: drawingWiggle 0.8s infinite ease-in-out;
            }
            @keyframes drawingWiggle {
              0%, 100% { transform: rotate(-10deg) translateY(0); }
              25% { transform: rotate(5deg) translateY(-2px); }
              50% { transform: rotate(-5deg) translateY(0); }
              75% { transform: rotate(8deg) translateY(-1px); }
            }
            .voice-bar {
              width: 3px;
              border-radius: 2px;
              background: #f97316;
              display: inline-block;
              animation: voicePulse 0.8s infinite ease-in-out;
            }
            @keyframes voicePulse {
              0%, 100% { height: 4px; opacity: 0.5; }
              50% { height: 14px; opacity: 1; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}
