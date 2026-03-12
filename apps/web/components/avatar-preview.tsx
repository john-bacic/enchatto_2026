"use client";

import { getAvatarById } from "@/lib/types";

type PresenceStatus = "online" | "away" | "offline";

interface AvatarPreviewProps {
  avatarId: string;
  nickname: string;
  size?: number;
  showName?: boolean;
  online?: boolean;
  presence?: PresenceStatus;
  isMe?: boolean;
}

export function AvatarPreview({
  avatarId,
  nickname,
  size = 40,
  showName = false,
  online,
  presence,
  isMe = false,
}: AvatarPreviewProps) {
  const avatar = getAvatarById(avatarId);

  // Determine effective presence: explicit `presence` prop takes priority
  const effectivePresence: PresenceStatus | undefined =
    presence ?? (online !== undefined ? (online ? "online" : "offline") : undefined);

  const dotColor =
    effectivePresence === "online"
      ? "#22c55e"
      : effectivePresence === "away"
        ? "#f97316"
        : "#9ca3af";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.2rem",
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: avatar.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${size * 0.55}px`,
          position: "relative",
          opacity: effectivePresence === "offline" ? 0.5 : effectivePresence === "away" ? 0.7 : 1,
          outline: isMe ? "2px solid var(--primary)" : "none",
          outlineOffset: "2px",
        }}
      >
        {avatar.emoji}
        {effectivePresence !== undefined && (
          <span
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: `${size * 0.28}px`,
              height: `${size * 0.28}px`,
              borderRadius: "50%",
              background: dotColor,
              border: "2px solid var(--surface)",
            }}
          />
        )}
      </div>
      {showName && (
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--muted)",
            fontWeight: 500,
            maxWidth: `${size + 20}px`,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {nickname}
        </span>
      )}
    </div>
  );
}
