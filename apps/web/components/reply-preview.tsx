"use client";

import { PRESET_AVATARS } from "@/lib/types";

interface ReplyPreviewProps {
  originalText: string;
  senderName: string;
  senderAvatar?: string;
  messageKind?: string;
}

export function ReplyPreview({
  originalText,
  senderName,
  senderAvatar,
  messageKind,
}: ReplyPreviewProps) {
  const avatarEmoji = senderAvatar
    ? PRESET_AVATARS.find((a) => a.id === senderAvatar)?.emoji
    : undefined;

  let displayText = originalText;
  if (!displayText && messageKind === "image") displayText = "Photo";
  if (!displayText && messageKind === "drawing") displayText = "Drawing";

  const truncated =
    displayText.length > 60 ? displayText.slice(0, 60) + "..." : displayText;

  return (
    <div
      style={{
        borderLeft: "3px solid var(--primary-light)",
        paddingLeft: "0.5rem",
        fontSize: "0.8rem",
        color: "var(--muted)",
        marginBottom: "0.25rem",
        maxWidth: "85%",
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
      }}
    >
      <div>
        {senderName && (
          <span style={{ fontWeight: 600 }}>
            {avatarEmoji ? `${avatarEmoji} ` : ""}
            {senderName}:{" "}
          </span>
        )}
        <span
          style={{
            fontStyle: messageKind && messageKind !== "text" ? "italic" : "normal",
          }}
        >
          {truncated}
        </span>
      </div>
    </div>
  );
}
