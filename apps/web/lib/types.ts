/** Local type helpers for the web app */

export const PRESET_AVATARS = [
  // Animals
  { id: "cat", label: "Cat", emoji: "🐱", color: "#fde68a" },
  { id: "dog", label: "Dog", emoji: "🐶", color: "#fed7aa" },
  { id: "bear", label: "Bear", emoji: "🐻", color: "#d4c4a8" },
  { id: "panda", label: "Panda", emoji: "🐼", color: "#e5e7eb" },
  { id: "fox", label: "Fox", emoji: "🦊", color: "#fdba74" },
  { id: "rabbit", label: "Rabbit", emoji: "🐰", color: "#fecaca" },
  { id: "koala", label: "Koala", emoji: "🐨", color: "#c7d2fe" },
  { id: "tiger", label: "Tiger", emoji: "🐯", color: "#fcd34d" },
  // Extra
  { id: "penguin", label: "Penguin", emoji: "🐧", color: "#bfdbfe" },
  { id: "owl", label: "Owl", emoji: "🦉", color: "#d9c9a5" },
  { id: "unicorn", label: "Unicorn", emoji: "🦄", color: "#e9d5ff" },
  { id: "octopus", label: "Octopus", emoji: "🐙", color: "#fca5a5" },
  { id: "dolphin", label: "Dolphin", emoji: "🐬", color: "#93c5fd" },
  { id: "butterfly", label: "Butterfly", emoji: "🦋", color: "#a5f3fc" },
  { id: "dragon", label: "Dragon", emoji: "🐲", color: "#86efac" },
  { id: "alien", label: "Alien", emoji: "👽", color: "#bbf7d0" },
] as const;

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
] as const;

export type PresetAvatarId = (typeof PRESET_AVATARS)[number]["id"];
export type LanguageCode = (typeof LANGUAGES)[number]["code"];

/** Get avatar data by ID */
export function getAvatarById(id: string) {
  return PRESET_AVATARS.find((a) => a.id === id) ?? PRESET_AVATARS[0];
}
