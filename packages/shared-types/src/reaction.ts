export const SUPPORTED_REACTIONS = ["👍", "❤️", "😂", "😮", "🎉", "👀"] as const;

export type ReactionEmoji = (typeof SUPPORTED_REACTIONS)[number];

export interface Reaction {
  _id: string;
  messageId: string;
  participantId: string;
  emoji: ReactionEmoji;
  createdAt: number;
}

/** Summary of reactions on a message, keyed by emoji */
export type ReactionSummary = Partial<
  Record<ReactionEmoji, { count: number; participantIds: string[] }>
>;
