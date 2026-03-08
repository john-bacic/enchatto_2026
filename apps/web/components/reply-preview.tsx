"use client";

import { PRESET_AVATARS } from "@/lib/types";
import { t } from "@/lib/i18n";

interface ReplyPreviewProps {
  originalText: string;
  senderName: string;
  senderAvatar?: string;
  messageKind?: string;
  lang?: string;
}

export function ReplyPreview({
  originalText,
  senderName,
  senderAvatar,
  messageKind,
  lang,
}: ReplyPreviewProps) {
  const avatarEmoji = senderAvatar
    ? PRESET_AVATARS.find((a) => a.id === senderAvatar)?.emoji
    : undefined;

  let displayText = originalText;
  if (!displayText && messageKind === "image") displayText = t("Photo", lang);
  if (!displayText && messageKind === "drawing") displayText = t("Drawing", lang);

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
