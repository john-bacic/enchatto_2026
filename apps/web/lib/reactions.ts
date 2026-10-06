import { useMemo } from "react";
import { useStableList } from "@/lib/stable";

// A room that keeps its reactions by room (`rooms.reactionsByRoom`) is asked for all of them in one query,
// `reactions.getRoomReactionSummaries`, which answers with a list: one entry for each message that has any. The
// message list finds a bubble's reactions by the message's id, so the list is turned into a map here.

/** One emoji under a message: how many people gave it, and who */
export interface ReactionSummary {
  emoji: string;
  count: number;
  participantIds: string[];
}

/** What the room's query answers for one message */
export interface MessageReactions {
  messageId: string;
  reactions: ReactionSummary[];
}

/** A room's reactions, each message's under its id. A message nobody has reacted to has no entry */
export type ReactionsByMessage = ReadonlyMap<string, readonly ReactionSummary[]>;

/** The reactions of a message that has none. One list for all of them: a bubble handed it twice is handed one object */
export const NO_REACTIONS: readonly ReactionSummary[] = [];

/** The key of an entry of the room's answer */
export const byMessageId = (entry: MessageReactions) => entry.messageId;

/** The room's answer as a map. A message's reactions there are the list its entry holds, not a copy */
export function reactionsByMessage(summaries: readonly MessageReactions[]): ReactionsByMessage {
  return new Map(summaries.map((entry) => [entry.messageId, entry.reactions]));
}

/** The reactions of one message of the room: the list under its id, or NO_REACTIONS */
export function reactionsOf(byMessage: ReactionsByMessage, messageId: string): readonly ReactionSummary[] {
  return byMessage.get(messageId) ?? NO_REACTIONS;
}

const NOT_ANSWERED: MessageReactions[] = [];

/**
 * reactionsByMessage of the room's answer, which is undefined until the server has answered: no message has an
 * entry then. A message whose reactions are what they were keeps the list it had (lib/stable.ts), so a reaction
 * given or taken back hands another list to that message's bubble and to no other, and an answer that says what
 * the last one said gives the map there was.
 */
export function useReactionsByMessage(summaries: MessageReactions[] | undefined): ReactionsByMessage {
  const kept = useStableList(summaries ?? NOT_ANSWERED, byMessageId);
  return useMemo(() => reactionsByMessage(kept), [kept]);
}
