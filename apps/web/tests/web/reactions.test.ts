// @vitest-environment node
import { act, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { InlineReactionPills } from "@/components/message-item";
import { ReactionBarPills } from "@/components/reaction-bar";
import { EmojiArt } from "@/components/ui/icon";
import { NO_REACTIONS, reactionsByMessage, reactionsOf, useReactionsByMessage, type MessageReactions, type ReactionSummary, type ReactionsByMessage } from "@/lib/reactions";
import { installBrowser } from "./dom";

// lib/reactions.ts: the room page asks a room that keeps its reactions by room for all of them at once, and the
// message list hands each bubble its own message's out of the map made here. The hook that keeps the map from one
// answer of the server to the next (useReactionsByMessage) is mounted by itself with react-dom/client in the
// stand-in browser (dom.ts) and handed the answers. Then the two parts that draw a message's reactions, the pills
// under its bubble (InlineReactionPills) and the row in its sheet (ReactionBarPills), rendered with
// react-dom/server from an entry of that map: neither subscribes to anything, so there is no server to stand in
// for. Nothing is tapped here, and no pill pops: the page with its subscriptions, and what a tap sends, are in
// room-live.test.tsx.

const YUKI = "yuki";
const SAM = "sam";
const MIKA = "mika";

/** One emoji as the server answers it: the count is the number of people who gave it */
const given = (emoji: string, ...participantIds: string[]) => ({ emoji, count: participantIds.length, participantIds });

/** The same answer as the server sends it again: new objects all the way down */
const again = (summaries: MessageReactions[]): MessageReactions[] => JSON.parse(JSON.stringify(summaries));

// The server names the messages that have reactions. m1 has two emoji, one of them from two people; m2 has three
// emoji, all from Sam
const answer = (): MessageReactions[] => [
  { messageId: "m1", reactions: [given("👍", YUKI, SAM), given("🔥", MIKA)] },
  { messageId: "m2", reactions: [given("❤️", SAM), given("😂", SAM), given("😮", SAM)] },
];

describe("the room's reactions by message", () => {
  test("a message's reactions are the list the server sent for it, the object itself", () => {
    const summaries = answer();
    const byMessage = reactionsByMessage(summaries);
    expect(byMessage.size).toBe(2);
    expect(reactionsOf(byMessage, "m1")).toBe(summaries[0].reactions);
    expect(reactionsOf(byMessage, "m2")).toBe(summaries[1].reactions);
  });

  test("a message nobody has reacted to has no entry, and is handed the one empty list", () => {
    const byMessage = reactionsByMessage(answer());
    expect(byMessage.has("m3")).toBe(false);
    expect(reactionsOf(byMessage, "m3")).toBe(NO_REACTIONS);
    expect(reactionsOf(byMessage, "m4")).toBe(reactionsOf(byMessage, "m3"));
    // A message that waits for the network has an id the server has never seen
    expect(reactionsOf(byMessage, "queued-1")).toBe(NO_REACTIONS);
    expect(NO_REACTIONS).toEqual([]);
  });

  test("before the server has answered, and in a room where nobody has reacted, every message has none", () => {
    const byMessage = reactionsByMessage([]);
    expect(byMessage.size).toBe(0);
    expect(reactionsOf(byMessage, "m1")).toBe(NO_REACTIONS);
  });

  test("several emoji from one person: each is an emoji of its own under the message, in the server's order", () => {
    expect(reactionsOf(reactionsByMessage(answer()), "m2")).toEqual([
      { emoji: "❤️", count: 1, participantIds: [SAM] },
      { emoji: "😂", count: 1, participantIds: [SAM] },
      { emoji: "😮", count: 1, participantIds: [SAM] },
    ]);
  });

  test("a reaction taken back: its emoji counts one fewer, or is gone, and a message left with none has no entry", () => {
    // Sam takes back the thumb under m1 and all three under m2: the server names m2 no more
    const byMessage = reactionsByMessage([{ messageId: "m1", reactions: [given("👍", YUKI), given("🔥", MIKA)] }]);
    expect(reactionsOf(byMessage, "m1")).toEqual([
      { emoji: "👍", count: 1, participantIds: [YUKI] },
      { emoji: "🔥", count: 1, participantIds: [MIKA] },
    ]);
    expect(byMessage.has("m2")).toBe(false);
    expect(reactionsOf(byMessage, "m2")).toBe(NO_REACTIONS);
  });
});

describe("the room answers again", () => {
  afterEach(() => vi.unstubAllGlobals());

  /** The page's hook, mounted and handed one answer of the server after the other: the map it gave for each */
  async function mapsFor(...answers: (MessageReactions[] | undefined)[]) {
    const browser = installBrowser();
    const { createRoot } = await import("react-dom/client");
    const maps: ReactionsByMessage[] = [];
    function Room({ summaries }: { summaries: MessageReactions[] | undefined }) {
      maps.push(useReactionsByMessage(summaries));
      return null;
    }
    const root = createRoot(browser.document.createElement("div") as unknown as Element);
    for (const summaries of answers) await act(async () => root.render(createElement(Room, { summaries })));
    await act(async () => root.unmount());
    expect(maps.length).toBe(answers.length);
    return maps;
  }

  test("for the first time: until then no message has an entry, and then each has the list the server sent", async () => {
    const first = answer();
    const [before, byMessage] = await mapsFor(undefined, first);
    expect(before.size).toBe(0);
    expect(reactionsOf(before, "m1")).toBe(NO_REACTIONS);
    expect(reactionsOf(byMessage, "m1")).toBe(first[0].reactions);
    expect(reactionsOf(byMessage, "m2")).toBe(first[1].reactions);
  });

  test("with what it said before: every message has the list it had, in the map there was", async () => {
    const first = answer();
    const [before, byMessage] = await mapsFor(first, again(first));
    expect(reactionsOf(byMessage, "m1")).toBe(first[0].reactions);
    expect(reactionsOf(byMessage, "m2")).toBe(first[1].reactions);
    expect(byMessage).toBe(before);
  });

  test("with a reaction given to one message: that message has another list, and every other the one it had", async () => {
    const first = answer();
    const next = again(first);
    next[1].reactions.push(given("👍", YUKI));
    next.push({ messageId: "m3", reactions: [given("🔥", YUKI)] });
    const [before, byMessage] = await mapsFor(first, next);
    expect(reactionsOf(byMessage, "m1")).toBe(first[0].reactions);
    expect(reactionsOf(byMessage, "m2")).toBe(next[1].reactions);
    expect(reactionsOf(byMessage, "m3")).toBe(next[2].reactions);
    expect(byMessage).not.toBe(before);
  });

  test("with one more person on an emoji: the count and the people are compared, not just the emoji", async () => {
    const first = answer();
    const next = again(first);
    next[0].reactions[1] = given("🔥", MIKA, SAM);
    const [, byMessage] = await mapsFor(first, next);
    expect(reactionsOf(byMessage, "m1")).toBe(next[0].reactions);
    expect(reactionsOf(byMessage, "m2")).toBe(first[1].reactions);
  });

  test("with a message's last reaction taken back: it is handed the empty list, and the others the lists they had", async () => {
    const first = answer();
    const [, byMessage] = await mapsFor(first, again(first).slice(1));
    expect(reactionsOf(byMessage, "m1")).toBe(NO_REACTIONS);
    expect(reactionsOf(byMessage, "m2")).toBe(first[1].reactions);
  });

  test("with the entries in another order: every message has the list it had", async () => {
    const first = answer();
    const [, byMessage] = await mapsFor(first, again(first).reverse());
    expect(reactionsOf(byMessage, "m1")).toBe(first[0].reactions);
    expect(reactionsOf(byMessage, "m2")).toBe(first[1].reactions);
  });
});

// ─── The parts that draw ─────────────────────────────────────────────────────

/** An emoji as a pill shows it */
const art = (emoji: string) => renderToStaticMarkup(createElement(EmojiArt, { emoji, size: 18 }));

describe("the pills under a bubble, drawn from the message's reactions", () => {
  const pills = (reactions: readonly ReactionSummary[], currentParticipantId = YUKI) =>
    renderToStaticMarkup(createElement(InlineReactionPills, { reactions, messageId: "m1", currentParticipantId }));

  test("one pill for each emoji: the count from two up, and 'mine' on the ones the reader gave", () => {
    expect(pills(reactionsOf(reactionsByMessage(answer()), "m1"))).toBe(
      '<div class="ec-reacts">' +
        `<button class="ec-react mine"><span class="ec-react-in">${art("👍")}<b>2</b></span></button>` +
        `<button class="ec-react"><span class="ec-react-in">${art("🔥")}</span></button>` +
        "</div>"
    );
  });

  test("the same reactions for another reader: 'mine' is on that reader's", () => {
    const html = pills(answer()[0].reactions, MIKA);
    expect(html.match(/<button class="[^"]*"/g)).toEqual(['<button class="ec-react"', '<button class="ec-react mine"']);
  });

  test("several emoji from one person: a pill each, all of them that person's", () => {
    const html = pills(answer()[1].reactions, SAM);
    expect(html.match(/<button class="[^"]*"/g)).toEqual(Array(3).fill('<button class="ec-react mine"'));
    expect(html).not.toContain("<b>");
  });

  test("a message with no reactions draws nothing, and neither does an emoji nobody is left on", () => {
    expect(pills(NO_REACTIONS)).toBe("");
    expect(pills([{ emoji: "👍", count: 0, participantIds: [] }])).toBe("");
    expect(pills([{ emoji: "👍", count: 0, participantIds: [] }, given("🔥", SAM)])).toBe(
      `<div class="ec-reacts"><button class="ec-react"><span class="ec-react-in">${art("🔥")}</span></button></div>`
    );
  });
});

describe("the reactions in a message's sheet, drawn from the same entry", () => {
  const bar = (reactions: readonly ReactionSummary[], currentParticipantId = YUKI) =>
    renderToStaticMarkup(createElement(ReactionBarPills, { reactions, currentParticipantId, onToggle: () => {} }));

  test("one button for each emoji, always with its count, and 'mine' on the ones the reader gave", () => {
    expect(bar(answer()[0].reactions)).toBe(
      '<div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap">' +
        `<button class="ec-react mine">${art("👍")}<b>2</b></button>` +
        `<button class="ec-react">${art("🔥")}<b>1</b></button>` +
        "</div>"
    );
  });

  test("a message with no reactions draws nothing, and neither does an emoji nobody is left on", () => {
    expect(bar(NO_REACTIONS)).toBe("");
    expect(bar([{ emoji: "👍", count: 0, participantIds: [] }])).toBe("");
  });
});
