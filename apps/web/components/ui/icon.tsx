"use client";

import { iconForEmoji, iconSrc } from "@/lib/icons";

/** Icon-pack image by name, e.g. <Icon name="ui-game" size={28} />. */
export function Icon({
  name,
  size,
  alt = "",
  style,
  className,
}: {
  name: string;
  size?: number | string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <img
      src={iconSrc(name)}
      alt={alt}
      draggable={false}
      className={`ec-icon${className ? ` ${className}` : ""}`}
      style={size !== undefined ? { width: size, height: size, ...style } : style}
    />
  );
}

/** Renders the icon-pack art for an emoji when there is one, otherwise the emoji itself. */
export function EmojiArt({
  emoji,
  size = "1.3em",
  style,
}: {
  emoji: string;
  size?: number | string;
  style?: React.CSSProperties;
}) {
  const src = iconForEmoji(emoji);
  if (!src) {
    return (
      <span style={{ fontSize: typeof size === "number" ? size * 0.85 : size, lineHeight: 1, ...style }}>{emoji}</span>
    );
  }
  return (
    <img
      src={src}
      alt={emoji}
      draggable={false}
      className="ec-icon"
      style={{ width: size, height: size, ...style }}
    />
  );
}

/** Square A / あ language badge (the icon pack has no flags). */
export function LangBadge({ lang, size = 26 }: { lang: string; size?: number }) {
  return (
    <span className="ec-lang-badge" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {lang === "ja" ? "あ" : "A"}
    </span>
  );
}
