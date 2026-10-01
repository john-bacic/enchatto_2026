"use client";

import { avatarIconSrc, getAvatarById } from "@/lib/types";

/** Round icon-pack avatar on its colour disc with the chunky ink outline. */
export function AvatarDisc({
  id,
  size = 40,
  border = size >= 36 ? 3 : 2,
  shadow = size >= 36,
  style,
  className,
}: {
  id: string;
  size?: number;
  border?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const avatar = getAvatarById(id);
  return (
    <span
      className={className}
      style={{
        display: "inline-grid",
        placeItems: "center",
        flex: "none",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${border}px solid var(--ink)`,
        background: avatar.color,
        boxShadow: shadow ? `0 ${Math.max(2, Math.round(size / 14))}px 0 var(--ink)` : undefined,
        overflow: "hidden",
        ...style,
      }}
    >
      <img
        src={avatarIconSrc(id)}
        alt={avatar.label}
        draggable={false}
        style={{ width: "84%", height: "84%", objectFit: "contain", pointerEvents: "none" }}
      />
    </span>
  );
}
