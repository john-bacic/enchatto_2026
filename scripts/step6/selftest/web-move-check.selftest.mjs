#!/usr/bin/env node
// Self-test of web-move-check.mjs: a small page whose game state and handlers move into a hook, done right and
// then wrong in each way the tool is there to catch.
//
//   node scripts/step6/selftest/web-move-check.selftest.mjs [--tmp <folder>] [--keep] [--verbose]
//
// Exit 0 when every case ends as expected, 1 otherwise.

import { linesBetween, selfTest, swap, without } from "./harness.mjs";

const t = selfTest("web-move-check.mjs");

// Two handlers start with the same guard, a third has none, and a function that stays behind has it too:
// the layout in which a guard can change owner without any count changing
const PAGE = `"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "convex/react";

function Room({ participantId, roomId }: { participantId: string; roomId: string }) {
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const flip = useMutation("game:flip");
  const cancel = useMutation("game:cancel");
  const timeout = useMutation("game:timeout");

  useEffect(() => {
    document.title = title;
  }, [title]);

  const handleFlip = useCallback(
    async (card: number) => {
      if (!participantId) return;
      setBusy(true);
      await flip({ roomId, card });
    },
    [flip, participantId, roomId]
  );

  const handleCancel = useCallback(
    async () => {
      if (!participantId) return;
      setBusy(true);
      await cancel({ roomId });
    },
    [cancel, participantId, roomId]
  );

  const handleTimeout = useCallback(
    async (target: string) => {
      setBusy(true);
      await timeout({ roomId, target });
    },
    [timeout, roomId]
  );

  const rename = (next: string) => {
    if (!participantId) return;
    setTitle(next);
  };

  return (
    <main>
      <h1>{title}</h1>
      <button disabled={busy} onClick={() => handleFlip(1)}>Flip</button>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={() => handleTimeout("x")}>Timeout</button>
      <button onClick={() => rename("new")}>Rename</button>
    </main>
  );
}

export default function Page() {
  return <Room participantId="p" roomId="r" />;
}
`;

// After the move. The hook's parts are kept apart so a case can leave one out, repeat one or reorder them
const STATE = `  const [busy, setBusy] = useState(false);
`;
const MUTATIONS = `  const flip = useMutation("game:flip");
  const cancel = useMutation("game:cancel");
  const timeout = useMutation("game:timeout");
`;
const HANDLERS = `  const handleFlip = useCallback(
    async (card: number) => {
      if (!participantId) return;
      setBusy(true);
      await flip({ roomId, card });
    },
    [flip, participantId, roomId]
  );

  const handleCancel = useCallback(
    async () => {
      if (!participantId) return;
      setBusy(true);
      await cancel({ roomId });
    },
    [cancel, participantId, roomId]
  );

  const handleTimeout = useCallback(
    async (target: string) => {
      setBusy(true);
      await timeout({ roomId, target });
    },
    [timeout, roomId]
  );
`;
const hook = (...parts) => `"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";

export function useGame({ participantId, roomId }: { participantId: string; roomId: string }) {
${parts.join("")}
  return { busy, handleFlip, handleCancel, handleTimeout };
}
`;
const HOOK = hook(STATE, MUTATIONS, "\n", HANDLERS);
const NEW_PAGE = `"use client";

import { useEffect, useState } from "react";
import { useGame } from "../hooks/use-game";

function Room({ participantId, roomId }: { participantId: string; roomId: string }) {
  const [title, setTitle] = useState("");
  const { busy, handleFlip, handleCancel, handleTimeout } = useGame({ participantId, roomId });

  useEffect(() => {
    document.title = title;
  }, [title]);

  const rename = (next: string) => {
    if (!participantId) return;
    setTitle(next);
  };

  return (
    <main>
      <h1>{title}</h1>
      <button disabled={busy} onClick={() => handleFlip(1)}>Flip</button>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={() => handleTimeout("x")}>Timeout</button>
      <button onClick={() => rename("new")}>Rename</button>
    </main>
  );
}

export default function Page() {
  return <Room participantId="p" roomId="r" />;
}
`;

const FROM = "app/page.tsx";
const TO = "hooks/use-game.ts";
// The three handlers move as one range: from the first one's opening line to the `);` after the last dependency list
const [handlersFirst, lastDependencyList] = linesBetween(PAGE, "const handleFlip =", "[timeout, roomId]");
const TABLE = {
  base: "HEAD",
  ranges: [
    { from: FROM, lines: linesBetween(PAGE, "import { useMutation }"), to: TO },
    { from: FROM, lines: linesBetween(PAGE, "const [busy, setBusy]"), to: TO },
    { from: FROM, lines: linesBetween(PAGE, "const flip =", "const timeout ="), to: TO },
    { from: FROM, lines: [handlersFirst, lastDependencyList + 1], to: TO },
  ],
  changed: [
    { file: FROM, line: linesBetween(PAGE, "import { useCallback")[0], old: 'import { useCallback, useEffect, useState } from "react";', new: 'import { useEffect, useState } from "react";' },
  ],
  glue: {
    [FROM]: ['import { useGame } from "../hooks/use-game";', "const { busy, handleFlip, handleCancel, handleTimeout } = useGame({ participantId, roomId });"],
    [TO]: [
      '"use client";',
      'import { useCallback, useState } from "react";',
      "export function useGame({ participantId, roomId }: { participantId: string; roomId: string }) {",
      "return { busy, handleFlip, handleCancel, handleTimeout };",
      "}",
    ],
  },
};

const repo = t.repo({ [FROM]: PAGE });
const table = t.file("table.json", JSON.stringify(TABLE, null, 2));
const at = (files) => t.workingTree(repo, files);
const moved = (changes = {}) => at({ [FROM]: NEW_PAGE, [TO]: HOOK, ...changes });

console.log("\na correct move");
moved();
t.check("four ranges into a hook", { args: [table], cwd: repo }, { exit: 0, says: ["OK: every range is one block", "page.tsx:17-41 -> use-game.ts:12-36  23 lines, indent 0", "page.tsx: 24 lines stay", "use-game.ts: 5 glue lines, as listed"] });
t.file("before/app/page.tsx", PAGE);
t.check("the old file read from a copy of the tree instead of a commit", { args: [table, "--base-dir", `${t.home}/before`], cwd: repo }, { exit: 0, says: ["OK: every range is one block"] });

const unlisted = t.file("table-no-glue.json", JSON.stringify({ ...TABLE, glue: {} }));
t.check("a table that lists no glue yet", { args: [unlisted], cwd: repo }, { exit: 1, says: ["use-game.ts: the glue is not what the table lists", 'not listed: use-game.ts:1  "use client";'] });
t.check("  --print-glue prints the glue to read through and put in the table", { args: [unlisted, "--print-glue"], cwd: repo }, { exit: 1, stdout: `${JSON.stringify(TABLE.glue, null, 2)}\n` });

console.log("\nbroken moves");
moved({ [TO]: hook(STATE, MUTATIONS, "\n", without(HANDLERS, "await cancel({ roomId });")) });
t.check("a line is dropped from a moved block", { args: [table], cwd: repo }, { exit: 1, says: ["page.tsx:17-41 -> use-game.ts: not there as one block of 23 lines", "12 of its lines stand from use-game.ts:12", "old page.tsx:30  await cancel({ roomId });", "new use-game.ts:25  },"] });

moved({ [FROM]: swap(NEW_PAGE, "  const rename =", `${HANDLERS}\n  const rename =`) });
t.check("a block is copied: it is in the hook and still in the page", { args: [table], cwd: repo }, { exit: 1, says: ["page.tsx: the glue is not what the table lists", "not listed: page.tsx:14  const handleFlip = useCallback("] });

moved({ [TO]: hook(MUTATIONS, STATE, "\n", HANDLERS) });
t.check("two ranges swap places in the new file", { args: [table], cwd: repo }, { exit: 1, says: ["page.tsx:9-11 -> use-game.ts:7-9: out of order, it stands before page.tsx:7-7"] });

// The guard leaves handleCancel and turns up in handleTimeout: each text still occurs as often as before
const withoutCancelGuard = swap(HANDLERS, "    async () => {\n      if (!participantId) return;\n", "    async () => {\n");
const guardInTimeout = swap(withoutCancelGuard, "async (target: string) => {\n", "async (target: string) => {\n      if (!participantId) return;\n");
moved({ [TO]: hook(STATE, MUTATIONS, "\n", guardInTimeout) });
t.check("a guard moves from one handler into another that has the same lines", { args: [table], cwd: repo }, { exit: 1, says: ["page.tsx:17-41 -> use-game.ts: not there as one block", "old page.tsx:28  if (!participantId) return;", "new use-game.ts:23  setBusy(true);"] });
const counted = t.file("guard-allow.json", JSON.stringify({
  changed: TABLE.changed.map(({ old, new: text }) => ({ old, new: text })),
  added: [...TABLE.glue[FROM], ...TABLE.glue[TO]],
}));
t.check("  the same move passes a count of lines, which is why position is checked", { tool: "line-account.mjs", args: ["--base", "HEAD", "--old", FROM, "--allow", counted, FROM, TO], cwd: repo }, { exit: 0, says: ["OK: every old line"] });

// The same slip across the edge of the move: out of `rename`, which stays, into handleTimeout, which moved
moved({ [FROM]: without(NEW_PAGE, "if (!participantId) return;"), [TO]: hook(STATE, MUTATIONS, "\n", swap(HANDLERS, "async (target: string) => {\n", "async (target: string) => {\n      if (!participantId) return;\n")) });
t.check("a guard moves from a function that stays into a handler that moved", { args: [table], cwd: repo }, { exit: 1, says: ["page.tsx:17-41 -> use-game.ts: not there as one block", "page.tsx: 1 of the 24 lines that stay are gone or out of their old order", "old page.tsx:44  if (!participantId) return;"] });
t.check("  that one passes a count of lines too", { tool: "line-account.mjs", args: ["--base", "HEAD", "--old", FROM, "--allow", counted, FROM, TO], cwd: repo }, { exit: 0, says: ["OK: every old line"] });

moved({ [FROM]: swap(swap(NEW_PAGE, "      <button onClick={handleCancel}>Cancel</button>\n", ""), "      <h1>{title}</h1>\n", "      <button onClick={handleCancel}>Cancel</button>\n      <h1>{title}</h1>\n") });
t.check("a line that stays moves to another place in the page", { args: [table], cwd: repo }, { exit: 1, says: ["page.tsx: 1 of the 24 lines that stay are gone or out of their old order", "old page.tsx:52  <button onClick={handleCancel}>Cancel</button>", "new page.tsx:21, out of order"] });

moved({ [FROM]: without(NEW_PAGE, "document.title = title;") });
t.check("a line that stays is dropped from the page", { args: [table], cwd: repo }, { exit: 1, says: ["page.tsx: 1 of the 24 lines that stay are gone or out of their old order", "old page.tsx:14  document.title = title;", "new: not there"] });

moved({ [FROM]: swap(NEW_PAGE, "    setTitle(next);\n", "    if (!next) return;\n    setTitle(next);\n") });
t.check("a line is slipped into a function that stays", { args: [table], cwd: repo }, { exit: 1, says: ["page.tsx: the glue is not what the table lists", "not listed: page.tsx:16  if (!next) return;"] });

moved({ [TO]: swap(HOOK, "[timeout, roomId]", "[timeout]") });
t.check("a dependency list is edited in a moved callback", { args: [table], cwd: repo }, { exit: 1, says: ["not there as one block", "old page.tsx:40  [timeout, roomId]", "new use-game.ts:35  [timeout]"] });
const declared = t.file("table-declared.json", JSON.stringify({
  ...TABLE,
  changed: [...TABLE.changed, { file: FROM, line: linesBetween(PAGE, "[timeout, roomId]")[0], old: "[timeout, roomId]", new: "[timeout]" }],
}));
t.check("  the same edit, listed in the table as a changed line", { args: [declared], cwd: repo }, { exit: 0, says: ["OK: every range is one block"] });

moved({ [TO]: undefined });
t.check("the new file was never written", { args: [table], cwd: repo }, { exit: 1, says: ["use-game.ts: the file does not exist"] });

// A glue entry the file lacks is an allowance left open: the same line slipped in later would pass as listed
moved();
const stale = t.file("table-stale-glue.json", JSON.stringify({ ...TABLE, glue: { ...TABLE.glue, [TO]: [...TABLE.glue[TO], "if (!participantId) return;"] } }));
t.check("the table lists glue that the file does not have", { args: [stale], cwd: repo }, { exit: 1, says: ["use-game.ts: the glue is not what the table lists", "listed, not in the file: if (!participantId) return;"] });

// Two functions hold the same two lines, and both ranges go to one new file where the lines stand once. The
// block that is there accounts for one range; the other is reported with the range that already stands there
const SHARED = `  if (!id) return;
  touch(id);
`;
const TWICE = `export function a(id: string) {
${SHARED}}

export function b(id: string) {
${SHARED}}
`;
const ONCE = `export function guard(id: string) {
${SHARED}}
`;
const [aFirst, aLast] = linesBetween(TWICE, "if (!id) return;", "touch(id);");
const bFirst = linesBetween(TWICE, "function b")[0] + 1;
const landed = linesBetween(ONCE, "if (!id) return;")[0];
const twice = t.repo({ "lib/old.ts": TWICE });
// `first` is the range taken out of function a; the two lines of function b are a range in both cases
const twiceTable = (name, first, glue) => t.file(name, JSON.stringify({
  base: "HEAD",
  ranges: [{ from: "lib/old.ts", lines: first, to: "lib/new.ts" }, { from: "lib/old.ts", lines: [bFirst, bFirst + 1], to: "lib/new.ts" }],
  glue: { "lib/old.ts": glue },
}));
t.workingTree(twice, { "lib/old.ts": TWICE.replaceAll(SHARED, "  guard(id);\n"), "lib/new.ts": ONCE });
t.check("two blocks with the same text move and one arrives", { args: [twiceTable("table-twice.json", [aFirst, aLast], [{ line: "guard(id);", count: 2 }])], cwd: twice }, {
  exit: 1,
  says: [`old.ts:${bFirst}-${bFirst + 1} -> new.ts: not there as one block of 2 lines`, `its lines stand from new.ts:${landed}, but old.ts:${aFirst}-${aLast} already stands there`, "FAIL: 1 check failed"],
});
// The guard of function a alone is a range as well: it lands on the first line of the block function b's range needs
t.workingTree(twice, { "lib/old.ts": TWICE.replace(SHARED, "  touch(id);\n").replace(SHARED, "  guard(id);\n"), "lib/new.ts": ONCE });
t.check("the one line of a range stands inside the block of another", { args: [twiceTable("table-inside.json", [aFirst, aFirst], ["guard(id);"])], cwd: twice }, {
  exit: 1,
  says: [`old.ts:${bFirst}-${bFirst + 1} -> new.ts: not there as one block of 2 lines`, `its lines stand from new.ts:${landed}, but old.ts:${aFirst}-${aFirst} already stands there`, "FAIL: 1 check failed"],
});

console.log("\nindentation");
moved({ [TO]: swap(HOOK, "      await flip({ roomId, card });", "        await flip({ roomId, card });") });
t.check("one line of a block is indented differently: reported, not a failure", { args: [table], cwd: repo }, { exit: 0, says: ["23 lines, indent mixed"] });
t.check("  with --strict-indent it fails", { args: [table, "--strict-indent"], cwd: repo }, { exit: 1, says: ["its lines were not all re-indented by the same amount"] });

console.log("\nchecks that cannot run");
moved();
const misfit = t.file("table-misfit.json", JSON.stringify({ ...TABLE, changed: [{ ...TABLE.changed[0], line: TABLE.changed[0].line + 1 }] }));
t.check("a changed line whose old text is not what the base has there", { args: [misfit], cwd: repo }, { exit: 2, says: ["the table does not fit the base: app/page.tsx:4 reads"] });
const overlap = t.file("table-overlap.json", JSON.stringify({ ...TABLE, ranges: [...TABLE.ranges, { from: FROM, lines: [10, 12], to: TO }] }));
t.check("two ranges that overlap", { args: [overlap], cwd: repo }, { exit: 2, says: ["ranges 9-11 and 10-12 overlap"] });
t.check("no base anywhere", { args: [t.file("table-no-base.json", JSON.stringify({ ...TABLE, base: undefined }))], cwd: repo }, { exit: 2, says: ["no base"] });

t.done();
