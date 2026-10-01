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

/** Public path of an avatar's icon-pack image */
export function avatarIconSrc(id: string) {
  return `/icons/av-${getAvatarById(id).icon}.png`;
}
