"use client";

import { PRESET_AVATARS } from "@/lib/types";

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

export function TypingIndicator({ participants }: TypingIndicatorProps) {
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

          {/* Bubble with 3 dots */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px 16px 16px 4px",
              padding: "0.6rem 0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <span className="typing-dot" style={{ animationDelay: "0ms" }} />
            <span className="typing-dot" style={{ animationDelay: "150ms" }} />
            <span className="typing-dot" style={{ animationDelay: "300ms" }} />
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
          `}</style>
        </div>
      ))}
    </div>
  );
}
