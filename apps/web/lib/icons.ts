// Emoji → icon-pack image. Game data (bingo cards, match boards, reactions) stays as
// emoji strings so iOS and old games keep working; clients swap in the art when a mapping
// exists. Keep in sync with apps/ios/Theme/IconPack.swift.
export const EMOJI_ICONS: Record<string, string> = {
  // objects
  "☀️": "o-sun",
  "🌞": "o-sun",
  "☁️": "o-cloud",
  "☂️": "o-umbrella",
  "⛄": "o-snowman",
  "🌙": "o-moon",
  "🏠": "o-house",
  "☕": "o-coffee",
  "🌷": "o-tulip",
  "🍒": "o-cherry",
  "🍞": "o-bread",
  "🍺": "o-beer",
  "🍰": "o-cake",
  "🚗": "o-car",
  "🐳": "o-whale",
  "🍦": "o-icecream",
  "🍉": "o-watermelon",
  "💎": "o-diamond",
  "🦋": "o-butterfly",
  "⛱️": "o-parasol",
  "📷": "o-camera",
  "📺": "o-tv",
  "🚃": "o-train",
  "🥨": "o-pretzel",
  "🌠": "o-shootingstar",
  "🌸": "o-flower",
  "⭐": "o-star",
  "🎁": "o-gift",
  "🎀": "o-bow",
  // animals
  "🐰": "av-bunny",
  "🐼": "av-panda",
  "🐻": "av-bear",
  "👻": "av-ghost",
  "🐥": "av-chick",
  "🪼": "av-jelly",
  "🐶": "av-puppy",
  "🐹": "av-hamster",
  "🐱": "av-cat",
  "🐈": "av-bluecat",
  "🐢": "av-turtle",
  "🦭": "av-seal",
  "🐝": "av-bee",
  "🐑": "av-sheep",
  "🐷": "av-pig",
  "🐕": "av-chihuahua",
  // symbols
  "💡": "g-bulb",
  "✏️": "g-pencil",
  "👑": "g-crown",
  "⚡": "g-bolt",
  "❓": "g-question",
  "❗": "g-bang",
  "🍀": "g-clover",
  "👂": "g-ear",
  "🎵": "g-music",
  "🎶": "g-music",
  // reactions
  "👍": "re-thumbs",
  "❤️": "re-heart",
  "😂": "re-laugh",
  "😮": "re-wow",
  "😢": "re-cry",
  "🔥": "re-star",
  "✌️": "re-peace",
  "👋": "re-wave",
};

export function iconForEmoji(emoji: string): string | null {
  const key = EMOJI_ICONS[emoji] ?? EMOJI_ICONS[emoji.replace(/\uFE0F/g, "")];
  return key ? `/icons/${key}.png` : null;
}

export const iconSrc = (name: string) => `/icons/${name}.png`;
