#!/usr/bin/env node
// Self-test of hook-order.mjs: a small page with an effect that waits for a later one, moved into a hook right
// and then wrong in each way the tool is there to catch.
//
//   node scripts/step6/selftest/hook-order.selftest.mjs [--tmp <folder>] [--keep] [--verbose]
//
// Exit 0 when every case ends as expected, 1 otherwise.

import { linesBetween, selfTest, swap } from "./harness.mjs";

const t = selfTest("hook-order.mjs");

const TSCONFIG = `{
  // The page imports its hooks as "@/hooks/…", like the web app
  "compilerOptions": { "paths": { "@/*": ["./*"] } }
}
`;
const USE_ONLINE = `import { useEffect, useState } from "react";

export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const on = () => setIsOnline(true);
    window.addEventListener("online", on);
    return () => window.removeEventListener("online", on);
  }, []);

  return { isOnline };
}
`;

// The save effect skips until the read effect below it has run once: the same arrangement as the room page's
// display settings, and the reason the order of effects is checked
const PAGE = `"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useOnline } from "@/hooks/use-online";

function Room({ roomId }: { roomId: string }) {
  const [reply, setReply] = useState<string | null>(null);
  const [showEnglish, setShowEnglish] = useState(true);
  const [size, setSize] = useState("s");
  const { isOnline } = useOnline();
  const room = useQuery("rooms:get", { roomId });
  const save = useMutation("prefs:save");

  useEffect(() => {
    console.log("room", room);
  }, [room]);

  const ready = useRef(false);

  useEffect(() => {
    if (!ready.current) return;
    save({ showEnglish });
  }, [showEnglish, save]);

  useEffect(() => {
    ready.current = true;
    setShowEnglish(localStorage.getItem("en") !== "0");
  }, []);

  const toggle = useCallback(() => {
    setShowEnglish((on) => !on);
  }, []);

  const send = useCallback(
    (text: string) => {
      if (!isOnline) return;
      console.log(text, reply, size);
    },
    [isOnline, reply, size]
  );

  useEffect(() => {
    if (room === null) location.assign("/");
  }, [room]);

  const label = useMemo(() => [reply, size].join(" "), [reply, size]);

  return <button title={label} onClick={() => { toggle(); send("hi"); setReply(null); setSize("m"); }}>{String(showEnglish)}</button>;
}

export default function Page() {
  return <Room roomId="r" />;
}
`;

// After the move: the display preference, its ref, its two effects and its toggle live in usePrefs
const SAVE_EFFECT = `  useEffect(() => {
    if (!ready.current) return;
    save({ showEnglish });
  }, [showEnglish, save]);
`;
const READ_EFFECT = `  useEffect(() => {
    ready.current = true;
    setShowEnglish(localStorage.getItem("en") !== "0");
  }, []);
`;
const usePrefs = (first = SAVE_EFFECT, second = READ_EFFECT, returned = "{ showEnglish, toggle }") => `import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";

export function usePrefs() {
  const [showEnglish, setShowEnglish] = useState(true);
  const save = useMutation("prefs:save");

  const ready = useRef(false);

${first}
${second}
  const toggle = useCallback(() => {
    setShowEnglish((on) => !on);
  }, []);

  return ${returned};
}
`;
const LOG_EFFECT = `  useEffect(() => {
    console.log("room", room);
  }, [room]);
`;
const CALL = `  const { showEnglish, toggle } = usePrefs();
`;
// The hook is called where the ref stood, after the logging effect; a case may call it earlier or take other names
const page = ({ early = false, call = CALL, extra = "" } = {}) => `"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useOnline } from "@/hooks/use-online";
import { usePrefs } from "@/hooks/use-prefs";

function Room({ roomId }: { roomId: string }) {
  const [reply, setReply] = useState<string | null>(null);
  const [size, setSize] = useState("s");
  const { isOnline } = useOnline();
  const room = useQuery("rooms:get", { roomId });
${early ? `${call}\n${LOG_EFFECT}` : `\n${LOG_EFFECT}\n${call}`}${extra}
  const send = useCallback(
    (text: string) => {
      if (!isOnline) return;
      console.log(text, reply, size);
    },
    [isOnline, reply, size]
  );

  useEffect(() => {
    if (room === null) location.assign("/");
  }, [room]);

  const label = useMemo(() => [reply, size].join(" "), [reply, size]);

  return <button title={label} onClick={() => { toggle(); send("hi"); setReply(null); setSize("m"); }}>{String(showEnglish)}</button>;
}

export default function Page() {
  return <Room roomId="r" />;
}
`;

// Hooks inside a function that is declared in a component run when that function runs, not with the component
const NESTED = `import { useEffect, useState } from "react";

export function Outer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(1);
  }, []);
  function Inner() {
    const [inner] = useState(0);
    useEffect(() => {}, [inner]);
    return null;
  }
  const later = () => useState(2);
  return <Inner key={count + later.length} />;
}
`;

const FILE = "app/page.tsx";
const SHARED = { "tsconfig.json": TSCONFIG, "hooks/use-online.ts": USE_ONLINE, "app/nested.tsx": NESTED };
const repo = t.repo({ ...SHARED, [FILE]: PAGE });
const at = (files) => t.workingTree(repo, { ...SHARED, ...files });
const moved = (pageText = page(), hookText = usePrefs()) => at({ [FILE]: pageText, "hooks/use-prefs.ts": hookText });
// The state is written above the hook's call in the page and is called inside the hook now: a declared move
const allow = t.file("allow.json", JSON.stringify({ moved: ["useState showEnglish"] }));
const compare = [FILE, "--base", "HEAD", "--allow", allow];

console.log("\nthe list");
t.check("the page before the move: hooks in the order they run, the custom hook opened in place", { args: [FILE], cwd: repo }, {
  exit: 0,
  says: ["Room in app/page.tsx", "opened: hooks/use-online.ts", /use-online\.ts:6 .* E1 {2}deps \[\]/, /page\.tsx:15 .* E2 {2}deps \[room\]/, /page\.tsx:21 .* E3 {2}deps \[showEnglish, save\]/, /page\.tsx:26 .* E4 {2}deps \[\]/, /page\.tsx:43 .* E5 {2}deps \[room\]/, "5 useEffect, 4 useState, 2 useCallback, 1 useQuery, 1 useMutation, 1 useRef, 1 useMemo", "no name changes at a hook's edge"],
});
t.check("hooks of a function declared inside the component are not the component's", { args: ["app/nested.tsx"], cwd: repo }, { exit: 0, says: ["Outer in app/nested.tsx", "\n1 useState, 1 useEffect\n"] });
const json = JSON.parse(t.run("hook-order.mjs", [FILE, "--json"], repo).stdout);
const keyOf = (effect) => json.entries.find((entry) => entry.effect === effect).key;

console.log("\na correct move");
moved();
t.check("two effects, a ref and a state move into a hook called where they stood", { args: compare, cwd: repo }, { exit: 0, says: ["the same effects, states and refs as the base (5 effects, 4 states, 1 ref)", "called in the base's order, 1 declared as moved aside", "the same 5 other hook calls as the base", "\nOK"] });
t.file("before/tsconfig.json", TSCONFIG);
t.file("before/hooks/use-online.ts", USE_ONLINE);
t.file("before/app/page.tsx", PAGE);
t.check("the base read from a copy of the tree instead of a commit", { args: [FILE, "--base-dir", `${t.home}/before`, "--allow", allow], cwd: repo }, { exit: 0, says: ["\nOK"] });
moved(page(), usePrefs().replace("    if (!ready.current) return;\n", "    // Nothing to save before the saved value was read\n        if (!ready.current)\n          return;\n"));
t.check("a moved effect is re-indented, re-wrapped and gains a comment: still the same function", { args: compare, cwd: repo }, { exit: 0, says: ["\nOK"] });

console.log("\nbroken moves");
moved();
t.check("the state's move is not declared", { args: [FILE, "--base", "HEAD"], cwd: repo }, { exit: 1, says: ["1 entry is called at another place than at the base and not declared as moved", "useState showEnglish", '{ "moved": ["useState showEnglish"] }'] });

moved(page({ early: true }));
t.check("an effect moves above another: the hook is called before the logging effect", { args: compare, cwd: repo }, { exit: 1, says: ["called at another place than at the base and not declared as moved", `${keyOf(2)}  deps [room]`] });
const declared = t.file("allow-effect.json", JSON.stringify({ moved: ["useState showEnglish", { entry: keyOf(2), why: "logs only; shares nothing with the preference effects" }] }));
t.check("  the same order with that effect declared as moved", { args: [FILE, "--base", "HEAD", "--allow", declared], cwd: repo }, { exit: 0, says: ["2 declared as moved aside", "\nOK"] });

moved(page(), usePrefs(READ_EFFECT, SAVE_EFFECT));
t.check("the two effects swap inside the hook, so the first save does not wait for the read", { args: compare, cwd: repo }, { exit: 1, says: ["1 entry is called at another place than at the base and not declared as moved", "use-prefs.ts:"] });

moved(page(), usePrefs(swap(SAVE_EFFECT, "[showEnglish, save]", "[showEnglish]")));
t.check("a dependency list changes", { args: compare, cwd: repo }, { exit: 1, says: ["effects, states and refs are not the base's", "same function, other dependency list now:  [showEnglish]"] });

moved(page(), usePrefs(swap(SAVE_EFFECT, "    if (!ready.current) return;\n", "")));
t.check("an effect loses its guard line", { args: compare, cwd: repo }, { exit: 1, says: ["effects, states and refs are not the base's", `only at the base:  ${keyOf(3)}`, "only now:          useEffect "] });

moved(page(), swap(usePrefs(), "useState(true)", "useState(false)"));
t.check("a state starts with another value", { args: compare, cwd: repo }, { exit: 1, says: ["effects, states and refs are not the base's", "only at the base:  useState showEnglish  useState(true)", "only now:          useState showEnglish  useState(false)"] });

moved(page({ extra: `\n${LOG_EFFECT}` }));
t.check("an effect is in the page twice after the move", { args: compare, cwd: repo }, { exit: 1, says: ["effects, states and refs are not the base's (base: 5 effects, 4 states, 1 ref; now: 6 effects, 4 states, 1 ref)", `only now:          ${keyOf(2)}`] });

moved(swap(page(), "import { useCallback, useEffect, useMemo, useState }", "import { useCallback, useEffect, useMemo, useRef, useState }").replace(CALL, `${CALL}  const ready = useRef(false);\n`));
t.check("a ref is left behind in the page as well", { args: compare, cwd: repo }, { exit: 1, says: ["now: 5 effects, 4 states, 2 refs", "only now:          useRef ready"] });

moved(page(), usePrefs(SAVE_EFFECT, READ_EFFECT, "{ showEnglish, toggle: flip }").replace("const toggle =", "const flip ="));
t.check("the hook returns a value under another name", { args: compare, cwd: repo }, { exit: 1, says: ["1 name change at a hook's edge", "usePrefs returns something that is not a bare name: toggle: flip"] });

moved(page({ call: "  const { showEnglish, toggle: flip } = usePrefs();\n  const toggle = flip;\n" }));
t.check("the page takes a value of the hook under another name", { args: compare, cwd: repo }, { exit: 1, says: ["1 name change at a hook's edge", "takes a value of usePrefs under another name: toggle: flip"] });

// The hook reads `roomId`: the page hands it its own `roomId`, not another value that happens to fit the type
const takesRoomId = (signature) => swap(usePrefs(), "export function usePrefs() {", `export function usePrefs(${signature}) {`);
const calls = (argument) => page({ call: `  const { showEnglish, toggle } = usePrefs(${argument});\n` });
moved(calls("roomId"), takesRoomId("roomId: string"));
t.check("the hook takes a value of the page under the page's name", { args: compare, cwd: repo }, { exit: 0, says: ["no value is handed to a hook under another name than at the base", "\nOK"] });
moved(calls("size"), takesRoomId("roomId: string"));
const handed = `${FILE}:${linesBetween(calls("size"), "usePrefs(size)")[0]}  usePrefs takes size as roomId`;
t.check("the page hands the hook another value under that name", { args: compare, cwd: repo }, { exit: 1, says: ["1 value is handed to a hook under another name, which the base does not do", handed] });
t.check("  without a base it is a note: nothing says whether the move brought it", { args: [FILE], cwd: repo }, { exit: 0, says: [`note  handed under another name (compared when a base is given): ${handed}`, "\nOK"] });
t.file("handed/tsconfig.json", TSCONFIG);
t.file("handed/hooks/use-online.ts", USE_ONLINE);
t.file("handed/hooks/use-prefs.ts", takesRoomId("roomId: string"));
t.file("handed/app/page.tsx", calls("size"));
t.check("  a base that hands it the same way already: not the move's doing", { args: [FILE, "--base-dir", `${t.home}/handed`], cwd: repo }, { exit: 0, says: ["no value is handed to a hook under another name than at the base", "\nOK"] });
moved(calls("{ roomId: size }"), takesRoomId("{ roomId }: { roomId: string }"));
t.check("the page hands the hook another value as a property of that name", { args: compare, cwd: repo }, { exit: 1, says: ["1 value is handed to a hook under another name", "usePrefs takes size as roomId"] });

moved();
const spare = t.file("allow-spare.json", JSON.stringify({ moved: ["useState showEnglish", keyOf(5)] }));
t.check("an effect is declared as moved although it stands where it stood: said, not a failure", { args: [FILE, "--base", "HEAD", "--allow", spare], cwd: repo }, { exit: 0, says: [`note  declared as moved, but the order holds without: ${keyOf(5)}`] });
t.check("the allow-list names an entry that does not exist", { args: [FILE, "--base", "HEAD", "--allow", t.file("allow-stale.json", JSON.stringify({ moved: ["useState showEnglish", "useRef nothing"] }))], cwd: repo }, { exit: 1, says: ["the allow-list names an entry that no effect, state or ref has: useRef nothing"] });

console.log("\nthe other hooks (lost or edited: a failure; added: a failure only with --strict)");
const others = "FAIL  the other hook calls differ from the base";
moved(swap(page(), "[isOnline, reply, size]", "[isOnline, reply]"));
t.check("a callback's dependency list changes", { args: compare, cwd: repo }, { exit: 1, says: [others, "only at the base:  useCallback send", "deps [isOnline, reply, size]", "deps [isOnline, reply]"] });
moved(swap(page(), "      if (!isOnline) return;\n", ""));
t.check("a callback loses its guard line", { args: compare, cwd: repo }, { exit: 1, says: [others, "only at the base:  useCallback send", "only now:          useCallback send"] });
moved(swap(page(), '[reply, size].join(" ")', '[size, reply].join(" ")'));
t.check("a memo's function changes", { args: compare, cwd: repo }, { exit: 1, says: [others, "only at the base:  useMemo label", "only now:          useMemo label"] });
moved(swap(page(), 'useQuery("rooms:get", { roomId })', 'useQuery("rooms:get", { roomId: "other" })'));
t.check("a query's arguments change", { args: compare, cwd: repo }, { exit: 1, says: [others, "only at the base:  useQuery room", 'only now:          useQuery room  useQuery("rooms:get", { roomId: "other" })'] });
moved(page(), swap(usePrefs(), '  const save = useMutation("prefs:save");\n', ""));
t.check("a mutation is lost on the way into the hook", { args: compare, cwd: repo }, { exit: 1, says: [others, 'only at the base:  useMutation save  useMutation("prefs:save")'] });
moved(page({ extra: '\n  const again = useQuery("rooms:get", { roomId });\n' }));
t.check("a hook call the base does not have: reported", { args: compare, cwd: repo }, { exit: 0, says: ["note  the other hook calls differ from the base (a hook call the base lacks is not a failure without --strict)", "only now:          useQuery again", "\nOK"] });
t.check("  with --strict it fails", { args: [...compare, "--strict"], cwd: repo }, { exit: 1, says: [others, "only now:          useQuery again"] });
moved();
t.check("a correct move adds no hook call, so it passes --strict too", { args: [...compare, "--strict"], cwd: repo }, { exit: 0, says: ["the same 5 other hook calls as the base", "\nOK"] });

console.log("\nchecks that cannot run");
moved();
t.check("a component the file does not have", { args: [FILE, "--component", "Lobby"], cwd: repo }, { exit: 2, says: ["has no top-level function Lobby"] });
t.check("an allow-list without a base", { args: [FILE, "--allow", allow], cwd: repo }, { exit: 2, says: ["--allow needs --base"] });
t.check("a file that is not there", { args: ["app/nothing.tsx"], cwd: repo }, { exit: 2, says: ["app/nothing.tsx does not exist"] });

t.done();
