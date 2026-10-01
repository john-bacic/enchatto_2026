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

  const truncated =
    displayText.length > 60 ? displayText.slice(0, 60) + "..." : displayText;
  const kindIcon = messageKind === "image" ? "ui-photo" : messageKind === "drawing" ? "g-pencil" : null;

  return (
    <div className="ec-reply" style={{ marginBottom: 4 }}>
      {senderAvatar && <AvatarDisc id={senderAvatar} size={20} border={1.5} shadow={false} />}
      {kindIcon && <Icon name={kindIcon} size={18} />}
      <span>
        {senderName && <b>{senderName}: </b>}
        <span style={{ fontStyle: messageKind && messageKind !== "text" ? "italic" : "normal" }}>{truncated}</span>
      </span>
    </div>
  );
}
