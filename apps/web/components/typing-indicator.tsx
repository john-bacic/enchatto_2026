"use client";

import { PRESET_AVATARS } from "@/lib/types";

interface TypingParticipant {
  _id: string;
  nickname: string;
  avatar: { type: string; value: string };
  typingAction: "typing" | "drawing";
}

interface TypingIndicatorProps {
  participants: TypingParticipant[];
}

function getEmoji(avatarValue: string): string {
  return PRESET_AVATARS.find((a) => a.id === avatarValue)?.emoji ?? "👤";
}

export function TypingIndicator({ participants }: TypingIndicatorProps) {
  if (participants.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.5rem" }}>
      {participants.map((p) => (
        <div
          key={p._id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span style={{ fontSize: "0.9rem" }}>{getEmoji(p.avatar.value)}</span>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "0.4rem 0.7rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              {p.nickname} is {p.typingAction === "drawing" ? "drawing" : "typing"}
            </span>
            <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
              <span className="typing-dot" style={{ animationDelay: "0ms" }} />
              <span className="typing-dot" style={{ animationDelay: "150ms" }} />
              <span className="typing-dot" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
          <style jsx>{`
            .typing-dot {
              width: 5px;
              height: 5px;
              border-radius: 50%;
              background: var(--muted);
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
