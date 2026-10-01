import { v, Infer } from "convex/values";

export const wordRushLang = v.union(v.literal("en"), v.literal("ja"));
export const wordRushVote = v.union(v.literal("huh"), v.literal("close"), v.literal("native"));
export const wordRushPhase = v.union(
  v.literal("clues"),
  v.literal("reveal"),
  v.literal("mic"),
  v.literal("judging"),
  v.literal("verdict")
);

export const WORD_RUSH_SCENES = [
  "petals",
  "sparkles",
  "bubbles",
  "hearts",
  "notes",
  "stars",
  "snow",
  "confetti",
] as const;

export const WORD_RUSH_PACKS = ["mix", "foodie", "travel", "slang", "anime", "feelings", "chat"] as const;

const jaWord = v.object({ ja: v.string(), kana: v.string(), romaji: v.string() });

export const wordRushCard = v.object({
  en: v.string(),
  ja: jaWord,
  ipa: v.string(),
  posEn: v.string(),
  posJa: v.string(),
  emoji: v.array(v.string()),
  hookEn: v.string(),
  hookJa: v.string(),
  exampleEn: v.string(),
  exampleJa: v.string(),
  scene: v.string(),
  choicesEn: v.array(v.string()),
  choicesJa: v.array(jaWord),
});

export type WordRushLang = Infer<typeof wordRushLang>;
export type WordRushVote = Infer<typeof wordRushVote>;
export type WordRushPhase = Infer<typeof wordRushPhase>;
export type WordRushCard = Infer<typeof wordRushCard>;
export type JaWord = Infer<typeof jaWord>;
