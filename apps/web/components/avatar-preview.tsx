"use client";

import { AvatarDisc } from "@/components/ui/avatar";

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
  // Determine effective presence: explicit `presence` prop takes priority
  const effectivePresence: PresenceStatus | undefined =
    presence ?? (online !== undefined ? (online ? "online" : "offline") : undefined);

  const dotColor =
    effectivePresence === "online"
      ? "var(--mint)"
      : effectivePresence === "away"
        ? "var(--yellow)"
        : "#c9cbe8";

  const dot = Math.max(9, Math.round(size * 0.3));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <AvatarDisc
          id={avatarId}
          size={size}
          style={{
            filter: effectivePresence === "offline" ? "grayscale(1)" : undefined,
            opacity: effectivePresence === "offline" ? 0.55 : effectivePresence === "away" ? 0.8 : 1,
            outline: isMe ? "3px solid var(--pink)" : undefined,
            outlineOffset: 2,
          }}
        />
        {effectivePresence !== undefined && (
          <span
            style={{
              position: "absolute",
              right: -1,
              bottom: -1,
              width: dot,
              height: dot,
              borderRadius: "50%",
              background: dotColor,
              border: "2px solid var(--ink)",
            }}
          />
        )}
      </div>
      {showName && (
        <span
          style={{
            maxWidth: size + 20,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
            fontSize: 11,
            fontWeight: 900,
            opacity: 0.75,
          }}
        >
          {nickname}
        </span>
      )}
    </div>
  );
}
