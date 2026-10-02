/** Local type helpers for the web app */

// Ids are persisted on participants (web + iOS), so they never change; only the art does.
export const PRESET_AVATARS = [
  { id: "rabbit", label: "Bunny", icon: "bunny", emoji: "🐰", color: "#ffd0e4" },
  { id: "panda", label: "Panda", icon: "panda", emoji: "🐼", color: "#e5e7eb" },
  { id: "bear", label: "Bear", icon: "bear", emoji: "🐻", color: "#f3dcc8" },
  { id: "owl", label: "Ghost", icon: "ghost", emoji: "👻", color: "#d9e4ff" },
  { id: "penguin", label: "Chick", icon: "chick", emoji: "🐥", color: "#fff4c4" },
  { id: "octopus", label: "Jelly", icon: "jelly", emoji: "🪼", color: "#dcfaef" },
  { id: "dog", label: "Puppy", icon: "puppy", emoji: "🐶", color: "#fed7aa" },
  { id: "fox", label: "Hamster", icon: "hamster", emoji: "🐹", color: "#fde68a" },
  { id: "cat", label: "Cat", icon: "cat", emoji: "🐱", color: "#d9e4ff" },
  { id: "tiger", label: "Blue Cat", icon: "bluecat", emoji: "😺", color: "#fff4c4" },
  { id: "dolphin", label: "Turtle", icon: "turtle", emoji: "🐢", color: "#efe6ff" },
  { id: "koala", label: "Seal", icon: "seal", emoji: "🦭", color: "#c7d2fe" },
  { id: "butterfly", label: "Bee", icon: "bee", emoji: "🐝", color: "#a5f3fc" },
  { id: "unicorn", label: "Sheep", icon: "sheep", emoji: "🐑", color: "#e9d5ff" },
  { id: "dragon", label: "Piggy", icon: "pig", emoji: "🐷", color: "#dcfaef" },
  { id: "alien", label: "Chihuahua", icon: "chihuahua", emoji: "🐕", color: "#fecaca" },
  { id: "whale", label: "Whale", icon: "whale", emoji: "🐳", color: "#cfe8ff" },
  { id: "crab", label: "Crab", icon: "crab", emoji: "🦀", color: "#ffe1d6" },
  { id: "octo", label: "Octopus", icon: "octo", emoji: "🐙", color: "#ffe4f1" },
  { id: "jellyfish", label: "Jellyfish", icon: "jellyfish", emoji: "🪼", color: "#dff3ff" },
  { id: "mole", label: "Mole", icon: "mole", emoji: "🐾", color: "#ecdfd0" },
  { id: "caterpillar", label: "Caterpillar", icon: "caterpillar", emoji: "🐛", color: "#e3f9d5" },
  { id: "ant", label: "Ant", icon: "ant", emoji: "🐜", color: "#e2e8f0" },
  { id: "worm", label: "Worm", icon: "worm", emoji: "🪱", color: "#ffedd5" },
  { id: "cloud", label: "Cloud", icon: "cloud", emoji: "☁️", color: "#dbeafe" },
  { id: "cupcake", label: "Cupcake", icon: "cupcake", emoji: "🧁", color: "#fce7f3" },
  { id: "snowman", label: "Snowman", icon: "snowman", emoji: "⛄", color: "#e0f2fe" },
  { id: "moon", label: "Moon", icon: "moon", emoji: "🌙", color: "#ede9fe" },
  { id: "sun", label: "Sun", icon: "sun", emoji: "☀️", color: "#fff1c1" },
  { id: "toast", label: "Toast", icon: "toast", emoji: "🍞", color: "#fef3c7" },
  { id: "melon", label: "Melon", icon: "melon", emoji: "🍉", color: "#dcfce7" },
  { id: "flower", label: "Flower", icon: "flower", emoji: "🌸", color: "#fde2ef" },
] as const;

export const LANGUAGES = [
  { code: "en", label: "English", badge: "A" },
  { code: "ja", label: "日本語", badge: "あ" },
] as const;

export type PresetAvatarId = (typeof PRESET_AVATARS)[number]["id"];
export type LanguageCode = (typeof LANGUAGES)[number]["code"];

/** Get avatar data by ID */
export function getAvatarById(id: string) {
  return PRESET_AVATARS.find((a) => a.id === id) ?? PRESET_AVATARS[0];
}

/**
 * Very light version of an avatar's colour, tinting a guest's own screen and their bubbles for others.
 * Keep in sync with `Participant.tint` on iOS.
 */
export function avatarTint(id: string) {
  const hex = getAvatarById(id).color.slice(1);
  const channel = (i: number) =>
    Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.6 + 255 * 0.4)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

/** Public path of an avatar's icon-pack image */
export function avatarIconSrc(id: string) {
  return `/icons/av-${getAvatarById(id).icon}.png`;
}
