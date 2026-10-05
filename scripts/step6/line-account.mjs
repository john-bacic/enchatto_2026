#!/usr/bin/env node
// Accounts for every line of a file that is being split or moved: any text file, TypeScript or Swift.
//
// What it proves: every non-blank line of the old file is in the new files exactly once, and the new files hold
// nothing else, apart from the lines an allow-list names. A line that was dropped, a block that was copied
// instead of moved, a line that was edited on the way and a line that was slipped in all fail. Lines are
// compared without their indentation, so a block that moves one level deeper still counts as the same lines.
// Spaces at the end of a line and the line ending (LF or CRLF) are left out as well.
//
// What it does not prove: where a line landed. Two blocks that swapped places, or a line that moved from one
// function into another, leave the counts equal. web-move-check.mjs proves position. Nor whitespace:
// `git diff --cached --check` reports trailing spaces and CRLF endings, and inside a template literal that
// spans lines the indentation and the blank lines are part of the string, which needs a look by eye. Nor a file
// that is not named on the command line: a copy of a block in a file nobody lists is not seen, and `git status`
// is what shows that file.
//
//   node scripts/step6/line-account.mjs --base <commit> --old <path> [--allow <allow.json>] <new file>...
//   node scripts/step6/line-account.mjs --base-dir <folder> --old <path> ...      the old file from a copy
//   node scripts/step6/line-account.mjs --old <file> <new file>...                the old file from disk
//
//   --old may repeat when several files are reshuffled together (a file that already existed at the base and
//   receives more lines is both old and new). --root <folder> is another checkout (default: the current folder).
//
// The allow-list is a JSON file. Each text is one line, compared without its indentation; "count" defaults to 1.
//
//   {
//     "changed": [ { "old": "const corsHeaders = {", "new": "export const corsHeaders = {" } ],
//     "added":   [ "export function registerRoomRoutes(http: HttpRouter): void {", { "line": "}", "count": 8 } ],
//     "removed": [ "import { Id } from \"./_generated/dataModel\";" ]
//   }
//
// "changed" is a line whose text differs after the move, "added" is glue the new files need, "removed" is a
// line the move drops. The list has to be exact: an entry that names a change that did not happen fails too.
//
// Run with plain node from the repo root; needs only git (to read the old file at a commit).
// Exit 0: every line is accounted for. The counts are printed either way.
// Exit 1: at least one line is missing or extra; each is printed with where it stands.
// Exit 2: the check could not run (bad arguments, a file that does not exist, a malformed allow-list).

import { basename, dirname, isAbsolute, resolve } from "node:path";
import { UsageError, clip, codeLines, openTree, parseArgs, readJson, runTool } from "./lib/common.mjs";

/** One line of the allow-list as { text, count } */
function entry(value, where, textKey) {
  const item = typeof value === "string" ? { [textKey]: value } : value;
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new UsageError(`${where}: expected a string or an object`);
  for (const key of Object.keys(item)) {
    if (key !== textKey && key !== "count") throw new UsageError(`${where}: unknown key "${key}"`);
  }
  const text = typeof item[textKey] === "string" ? item[textKey].trim() : "";
  if (!text) throw new UsageError(`${where}: "${textKey}" must be a non-blank line`);
  const count = item.count ?? 1;
  if (!Number.isInteger(count) || count < 1) throw new UsageError(`${where}: "count" must be a whole number above 0`);
  return { text, count };
}

function readAllowList(path) {
  const allow = { changed: [], added: [], removed: [] };
  if (!path) return allow;
  const json = readJson(path);
  if (!json || typeof json !== "object" || Array.isArray(json)) throw new UsageError(`${path}: expected an object`);
  for (const key of Object.keys(json)) {
    if (!(key in allow)) throw new UsageError(`${path}: unknown key "${key}" (known: changed, added, removed)`);
    if (!Array.isArray(json[key])) throw new UsageError(`${path}: "${key}" must be a list`);
  }
  (json.changed ?? []).forEach((item, i) => {
    const where = `${path}: changed[${i}]`;
    if (!item || typeof item !== "object") throw new UsageError(`${where}: expected { "old": ..., "new": ... }`);
    for (const key of Object.keys(item)) {
      if (!["old", "new", "count"].includes(key)) throw new UsageError(`${where}: unknown key "${key}"`);
    }
    const from = entry({ old: item.old, count: item.count }, where, "old");
    const to = entry({ new: item.new }, where, "new");
    if (from.text === to.text) throw new UsageError(`${where}: "old" and "new" are the same line`);
    allow.changed.push({ old: from.text, new: to.text, count: from.count });
  });
  (json.added ?? []).forEach((item, i) => allow.added.push(entry(item, `${path}: added[${i}]`, "line")));
  (json.removed ?? []).forEach((item, i) => allow.removed.push(entry(item, `${path}: removed[${i}]`, "line")));
  return allow;
}

/** A file's name in the report: a path outside the tree is cut to its folder and name */
const shortName = (path) => (isAbsolute(path) ? `…/${basename(dirname(path))}/${basename(path)}` : path);

/** Every code line of the files, as text -> the places it stands */
function index(files) {
  const places = new Map();
  let total = 0;
  for (const { name, text } of files) {
    for (const line of codeLines(text)) {
      if (!places.has(line.text)) places.set(line.text, []);
      places.get(line.text).push(`${shortName(name)}:${line.n}`);
      total++;
    }
  }
  return { places, total };
}

function main(argv) {
  const { options, rest: newPaths } = parseArgs(argv, {
    root: "value",
    base: "value",
    "base-dir": "value",
    old: "list",
    allow: "value",
  });
  if (!options.old.length) throw new UsageError("give the old file with --old");
  if (!newPaths.length) throw new UsageError("give the new files after the options");
  const root = resolve(options.root ?? process.cwd());
  const now = openTree({ root });
  const before = options.base || options["base-dir"] ? openTree({ root, rev: options.base, dir: options["base-dir"] }) : now;
  const allow = readAllowList(options.allow);

  const old = index(options.old.map((name) => ({ name, text: before.read(name) })));
  const fresh = index(newPaths.map((name) => ({ name, text: now.read(name) })));

  // How many times each text must stand in the new files: as often as in the old file, moved by the allow-list
  const expected = new Map([...old.places].map(([text, places]) => [text, places.length]));
  const shift = (text, by) => expected.set(text, (expected.get(text) ?? 0) + by);
  const sum = (items) => items.reduce((total, item) => total + item.count, 0);
  for (const item of allow.changed) {
    shift(item.old, -item.count);
    shift(item.new, item.count);
  }
  for (const item of allow.removed) shift(item.text, -item.count);
  for (const item of allow.added) shift(item.text, item.count);

  const missing = [];
  const extra = [];
  const overdrawn = [];
  let unchanged = 0;
  for (const text of new Set([...expected.keys(), ...fresh.places.keys()])) {
    const want = expected.get(text) ?? 0;
    const inOld = old.places.get(text)?.length ?? 0;
    const inNew = fresh.places.get(text)?.length ?? 0;
    // Old lines that the allow-list neither changes nor removes, and that are there
    const carried = inOld - sum(allow.changed.filter((c) => c.old === text)) - sum(allow.removed.filter((r) => r.text === text));
    unchanged += Math.max(0, Math.min(carried, inNew));
    if (want < 0) overdrawn.push({ text, inOld });
    else if (inNew < want) missing.push({ text, by: want - inNew, inOld, inNew, want });
    else if (inNew > want) extra.push({ text, by: inNew - want, inOld, inNew, want });
  }

  const oldName = options.old.map(shortName).join(", ");
  console.log(`line-account: ${oldName} (${before === now ? "on disk" : before.label}) -> ${newPaths.length} file${newPaths.length === 1 ? "" : "s"}`);
  const row = (label, value) => console.log(`  ${label.padEnd(34)}${String(value).padStart(6)}`);
  row("old non-blank lines", old.total);
  row("new non-blank lines", fresh.total);
  row("found unchanged", unchanged);
  row("changed, named in the allow-list", sum(allow.changed));
  row("removed, named in the allow-list", sum(allow.removed));
  row("added, named in the allow-list", sum(allow.added));

  const places = (list) => (list.length > 4 ? `${list.slice(0, 4).join(", ")} and ${list.length - 4} more` : list.join(", "));
  const byText = (a, b) => a.text.localeCompare(b.text);
  if (overdrawn.length) {
    console.log(`\nALLOW-LIST names more old lines than the old file has:`);
    for (const { text, inOld } of overdrawn.sort(byText)) console.log(`  the old file has ${inOld}:  ${clip(text)}`);
  }
  if (missing.length) {
    console.log(`\nMISSING from the new files (${sum(missing.map((m) => ({ count: m.by })))}):`);
    for (const { text, by, inOld, inNew, want } of missing.sort(byText)) {
      console.log(`  ${by}x  ${clip(text)}`);
      console.log(`      expected ${want}, found ${inNew}; ${inOld ? `old: ${places(old.places.get(text))}` : "named in the allow-list, not in the old file"}`);
    }
  }
  if (extra.length) {
    console.log(`\nEXTRA in the new files (${sum(extra.map((e) => ({ count: e.by })))}):`);
    for (const { text, by, inNew, want } of extra.sort(byText)) {
      console.log(`  ${by}x  ${clip(text)}`);
      console.log(`      expected ${want}, found ${inNew}; new: ${places(fresh.places.get(text))}`);
    }
  }
  const unaccounted = overdrawn.length + missing.length + extra.length;
  if (unaccounted) {
    console.log(`\nFAIL: ${unaccounted} line text${unaccounted === 1 ? "" : "s"} not accounted for`);
    return false;
  }
  console.log(`\nOK: every old line is in the new files exactly once, and nothing else is there but the allow-list's lines`);
  return true;
}

runTool("line-account", main);
