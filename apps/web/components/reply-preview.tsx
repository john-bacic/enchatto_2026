"use client";

import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
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
  let displayText = originalText;
  if (!displayText && messageKind === "image") displayText = t("Photo", lang);
  if (!displayText && messageKind === "drawing") displayText = t("Drawing", lang);
  if (!displayText && messageKind === "audio") displayText = t("Voice message", lang);

  const truncated =
    displayText.length > 60 ? displayText.slice(0, 60) + "..." : displayText;
  const kindIcon = messageKind === "image" ? "ui-photo" : messageKind === "drawing" ? "g-pencil" : null;

  return (
    <div className="ec-reply" style={{ marginBottom: 4 }}>
      {senderAvatar && <AvatarDisc id={senderAvatar} size={20} border={1.5} shadow={false} />}
      {kindIcon && <Icon name={kindIcon} size={18} />}
      {messageKind === "audio" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flex: "none" }} aria-hidden>
          <rect x="8.5" y="2" width="7" height="12.5" rx="3.5" />
          <path d="M5 11a7 7 0 0 0 14 0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      )}
      <span>
        {senderName && <b>{senderName}: </b>}
        <span style={{ fontStyle: messageKind && messageKind !== "text" ? "italic" : "normal" }}>{truncated}</span>
      </span>
    </div>
  );
}
