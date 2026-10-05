#!/usr/bin/env node
// Proves where the lines of a move landed. Written for moving code out of the room page
// (apps/web/app/room/[roomId]/page.tsx) into hooks and components; it reads text only, so any file works.
//
// What it proves, given a table of the ranges that move:
//   1. each range of the old file stands in its new file as one unbroken block, its lines in their old order;
//   2. ranges that share a new file stand there in the order they had in the old file;
//   3. the lines that stay behind are all still in the old file, in their old order;
//   4. every other line of the files involved is glue that the table lists (imports, a hook's signature and
//      return, closing braces, the call that replaces a block).
// Together: every line of the files is a moved line in its place, a line that stayed in its place, or listed
// glue. A guard such as `if (!participantId) return;` that slips from one handler into another fails 1 or 3
// although the files still hold the same lines the same number of times, which is what a count cannot see.
//
// What it does not prove: that hooks still run in the same order (hook-order.mjs), or anything about meaning.
// Nor whitespace: blank lines, spaces at the end of a line and the line ending (LF or CRLF) are not compared,
// and indentation only with --strict-indent. `git diff --cached --check` reports trailing spaces and CRLF
// endings. Inside a template literal that spans lines all of these are part of the string: a range that holds
// one needs a look by eye.
//
//   node scripts/step6/web-move-check.mjs <table.json>
//   node scripts/step6/web-move-check.mjs <table.json> --base <commit>       overrides the table's "base"
//   node scripts/step6/web-move-check.mjs <table.json> --base-dir <folder>   the old files from a copy
//   --root <folder>     another checkout (default: the current folder)
//   --strict-indent     also fails when a block's lines were not all re-indented by the same amount
//   --print-glue        prints the glue it found as the table's "glue" object, on stdout, instead of the report
//
// The table is a JSON file. Paths are relative to the repo root; line numbers are those of the old file at the
// base commit, first and last line included. Lines are compared without indentation and blank lines are skipped.
//
//   {
//     "base": "abc1234",
//     "ranges": [
//       { "from": "apps/web/app/room/[roomId]/page.tsx", "lines": [389, 397], "to": "apps/web/hooks/use-theme-color.ts" }
//     ],
//     "changed": [
//       { "file": "apps/web/app/room/[roomId]/page.tsx", "line": 53, "old": "const CHAT_SIZES = [", "new": "export const CHAT_SIZES = [" }
//     ],
//     "glue": {
//       "apps/web/hooks/use-theme-color.ts": ["\"use client\";", "import { useEffect } from \"react\";", { "line": "}", "count": 1 }]
//     }
//   }
//
// "changed" names a line whose text differs after the move, by its old line number, so the allowance cannot
// wander to another line with the same text; "new": null says the line is dropped. "glue" lists, per file, the
// lines that are new. Write the ranges first, run with --print-glue, read what it prints line by line (a line
// that is not an import, a signature, a return, a closing brace or the call that replaces a block does not
// belong there) and put it in the table.
// A file that already existed at the base and receives a range keeps all its own lines in order, like the old file.
//
// Run with plain node from the repo root; needs only git (to read the old files at the base commit).
// Exit 0: the move is as the table says. Exit 1: it is not; each failure is printed with both sides.
// Exit 2: the check could not run (bad arguments, a table that does not fit the base, a missing file).

import { basename, resolve } from "node:path";
import { UsageError, clip, codeLines, commonSubsequence, openTree, parseArgs, readJson, runTool, tally } from "./lib/common.mjs";

function readTable(path) {
  const table = readJson(path);
  const fail = (message) => {
    throw new UsageError(`${path}: ${message}`);
  };
  if (!table || typeof table !== "object" || Array.isArray(table)) fail("expected an object");
  for (const key of Object.keys(table)) {
    if (!["base", "about", "ranges", "changed", "glue"].includes(key)) fail(`unknown key "${key}" (known: base, about, ranges, changed, glue)`);
  }
  if (!Array.isArray(table.ranges) || !table.ranges.length) fail('"ranges" must be a list with at least one range');
  const ranges = table.ranges.map((range, i) => {
    const where = `ranges[${i}]`;
    for (const key of Object.keys(range ?? {})) if (!["from", "lines", "to"].includes(key)) fail(`${where}: unknown key "${key}"`);
    const [first, last] = Array.isArray(range?.lines) ? range.lines : [];
    if (typeof range?.from !== "string" || typeof range.to !== "string") fail(`${where}: "from" and "to" must be paths`);
    if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last < first) fail(`${where}: "lines" must be [first, last]`);
    return { from: range.from, to: range.to, first, last };
  });
  const changed = (table.changed ?? []).map((item, i) => {
    const where = `changed[${i}]`;
    for (const key of Object.keys(item ?? {})) if (!["file", "line", "old", "new"].includes(key)) fail(`${where}: unknown key "${key}"`);
    if (typeof item?.file !== "string" || !Number.isInteger(item.line)) fail(`${where}: needs "file" and "line"`);
    if (typeof item.old !== "string" || !item.old.trim()) fail(`${where}: "old" must be the line's present text`);
    if (item.new !== null && (typeof item.new !== "string" || !item.new.trim())) fail(`${where}: "new" must be the line's new text, or null for a dropped line`);
    return { file: item.file, line: item.line, old: item.old.trim(), new: item.new === null ? null : item.new.trim() };
  });
  const glue = new Map();
  for (const [file, lines] of Object.entries(table.glue ?? {})) {
    if (!Array.isArray(lines)) fail(`glue["${file}"] must be a list of lines`);
    const texts = [];
    lines.forEach((item, i) => {
      const text = typeof item === "string" ? item : item?.line;
      const count = typeof item === "string" ? 1 : (item?.count ?? 1);
      if (typeof text !== "string" || !text.trim() || !Number.isInteger(count) || count < 1) fail(`glue["${file}"][${i}]: expected a line, or { "line": ..., "count": ... }`);
      for (let n = 0; n < count; n++) texts.push(text.trim());
    });
    glue.set(file, texts);
  }
  return { base: table.base, ranges, changed, glue };
}

function main(argv) {
  const { options, rest } = parseArgs(argv, { root: "value", base: "value", "base-dir": "value", "strict-indent": "flag", "print-glue": "flag" });
  if (rest.length !== 1) throw new UsageError("give one table file");
  const table = readTable(rest[0]);
  const root = resolve(options.root ?? process.cwd());
  const rev = options["base-dir"] ? undefined : (options.base ?? table.base);
  if (!rev && !options["base-dir"]) throw new UsageError('no base: put "base" in the table or pass --base');
  const before = openTree({ root, rev, dir: options["base-dir"] });
  const now = openTree({ root });

  const files = [...new Set(table.ranges.flatMap((range) => [range.from, range.to]))];
  // Short names for the report where they are not ambiguous
  const names = tally(files.map((file) => basename(file)));
  const label = (file) => (names.get(basename(file)) === 1 ? basename(file) : file);

  // --- The old side: each file's code lines at the base, with the table's changes applied ---
  const old = new Map();
  for (const file of files) {
    if (before.exists(file)) old.set(file, { raw: before.read(file).split("\n"), lines: [] });
  }
  for (const range of table.ranges) {
    if (!old.has(range.from)) throw new UsageError(`${range.from} does not exist at the base (${before.label})`);
    if (range.last > old.get(range.from).raw.length) throw new UsageError(`${range.from} has no line ${range.last} at the base (${before.label})`);
  }
  const changes = new Map();
  for (const change of table.changed) {
    const side = old.get(change.file);
    if (!side) throw new UsageError(`changed: ${change.file} is not a file of this table that exists at the base`);
    const present = (side.raw[change.line - 1] ?? "").trim();
    if (present !== change.old) {
      throw new UsageError(`the table does not fit the base: ${change.file}:${change.line} reads\n    ${present}\n  and the table says\n    ${change.old}`);
    }
    const key = `${change.file}:${change.line}`;
    if (changes.has(key)) throw new UsageError(`changed: ${key} is listed twice`);
    changes.set(key, change);
  }
  for (const [file, side] of old) {
    for (const line of codeLines(side.raw.join("\n"))) {
      const change = changes.get(`${file}:${line.n}`);
      if (change && change.new === null) continue;
      side.lines.push(change ? { ...line, text: change.new } : line);
    }
  }
  const rangesOf = new Map();
  for (const range of table.ranges) {
    if (!rangesOf.has(range.from)) rangesOf.set(range.from, []);
    rangesOf.get(range.from).push(range);
  }
  for (const [file, ranges] of rangesOf) {
    ranges.sort((a, b) => a.first - b.first);
    ranges.forEach((range, i) => {
      if (i > 0 && ranges[i - 1].last >= range.first) throw new UsageError(`${file}: ranges ${ranges[i - 1].first}-${ranges[i - 1].last} and ${range.first}-${range.last} overlap`);
      range.lines = old.get(file).lines.filter((line) => line.n >= range.first && line.n <= range.last);
      if (!range.lines.length) throw new UsageError(`${file}:${range.first}-${range.last} holds no code line`);
    });
  }
  for (const file of table.glue.keys()) {
    if (!files.includes(file)) throw new UsageError(`glue: ${file} is not a file of any range`);
  }

  // --- The new side ---
  const fresh = new Map();
  for (const file of files) {
    const lines = now.exists(file) ? codeLines(now.read(file)) : [];
    // owner[i] says what accounts for line i: a range, a line that stayed, or nothing yet (glue)
    fresh.set(file, { exists: now.exists(file), lines, owner: new Array(lines.length).fill(null) });
  }

  const failures = [];
  const unsound = new Set();
  const report = [];
  const fail = (file, message) => {
    failures.push(message);
    unsound.add(file);
    report.push(`  FAIL  ${message}`);
  };

  // 1 and 2: each range as one block, blocks of one old file in their old order
  for (const to of files) {
    const side = fresh.get(to);
    const matchAt = (texts, start) => texts.every((text, k) => side.owner[start + k] === null && side.lines[start + k]?.text === text);
    const find = (texts, from) => {
      for (let start = from; start + texts.length <= side.lines.length; start++) if (matchAt(texts, start)) return start;
      return -1;
    };
    for (const [from, ranges] of rangesOf) {
      let cursor = 0;
      let previous = null;
      for (const range of ranges.filter((r) => r.to === to)) {
        const name = `${label(from)}:${range.first}-${range.last}`;
        const texts = range.lines.map((line) => line.text);
        if (!side.exists) {
          fail(to, `${name} -> ${label(to)}: the file does not exist`);
          continue;
        }
        let start = find(texts, cursor);
        const inOrder = start >= 0;
        if (!inOrder) start = find(texts, 0);
        if (start < 0) {
          // Say how far the block goes before it breaks: the usual causes are a line dropped, added or edited
          let best = { length: 0, at: -1 };
          side.lines.forEach((line, i) => {
            if (line.text !== texts[0]) return;
            let length = 0;
            while (length < texts.length && side.lines[i + length]?.text === texts[length]) length++;
            if (length > best.length) best = { length, at: i };
          });
          const lines = [`${name} -> ${label(to)}: not there as one block of ${texts.length} lines`];
          if (best.at < 0) {
            lines.push(`        its first line is not in ${label(to)}: ${clip(texts[0])}`);
          } else if (best.length === texts.length) {
            // Every line is there, but in a block that stands for another range: one line cannot be two ranges
            const holder = side.owner.slice(best.at, best.at + texts.length).find((owner) => owner !== null);
            lines.push(`        its lines stand from ${label(to)}:${side.lines[best.at].n}, but ${label(holder.from)}:${holder.first}-${holder.last} already stands there: one line cannot be two ranges`);
          } else {
            const next = side.lines[best.at + best.length];
            const wanted = range.lines[best.length];
            lines.push(`        ${best.length} of its lines stand from ${label(to)}:${side.lines[best.at].n}; then`);
            lines.push(`        old ${label(from)}:${wanted.n}  ${clip(wanted.text)}`);
            lines.push(`        new ${next ? `${label(to)}:${next.n}  ${clip(next.text)}` : "the file ends"}`);
          }
          fail(to, lines.join("\n"));
          continue;
        }
        for (let k = 0; k < texts.length; k++) side.owner[start + k] = range;
        const landed = `${label(to)}:${side.lines[start].n}-${side.lines[start + texts.length - 1].n}`;
        const shifts = new Set(range.lines.map((line, k) => side.lines[start + k].indent - line.indent));
        const indent = shifts.size === 1 ? `indent ${[...shifts][0] > 0 ? "+" : ""}${[...shifts][0]}` : "indent mixed";
        if (!inOrder) {
          fail(to, `${name} -> ${landed}: out of order, it stands before ${previous}, which comes first in ${label(from)}`);
          continue;
        }
        if (shifts.size > 1 && options["strict-indent"]) {
          fail(to, `${name} -> ${landed}: its lines were not all re-indented by the same amount`);
        } else {
          report.push(`  ok    ${name} -> ${landed}  ${texts.length} line${texts.length === 1 ? "" : "s"}, ${indent}`);
        }
        cursor = start + texts.length;
        previous = `${name} (at ${landed})`;
      }
    }
  }

  // 3: the lines that stay behind, in every file that existed at the base
  for (const [file, side] of old) {
    const moved = rangesOf.get(file) ?? [];
    const stay = side.lines.filter((line) => !moved.some((range) => line.n >= range.first && line.n <= range.last));
    const target = fresh.get(file);
    const free = target.lines.map((line, i) => ({ line, i })).filter(({ i }) => target.owner[i] === null);
    const pairs = commonSubsequence(stay.map((line) => line.text), free.map(({ line }) => line.text));
    for (const [, j] of pairs) target.owner[free[j].i] = "stayed";
    if (pairs.length === stay.length) {
      report.push(`  ok    ${label(file)}: ${stay.length} line${stay.length === 1 ? "" : "s"} stay, all there in their old order`);
      continue;
    }
    const kept = new Set(pairs.map(([i]) => i));
    const lost = stay.filter((_, i) => !kept.has(i));
    const loose = free.filter(({ i }) => target.owner[i] === null);
    const lines = [`${label(file)}: ${lost.length} of the ${stay.length} lines that stay are gone or out of their old order`];
    for (const line of lost.slice(0, 12)) {
      const elsewhere = loose.find((entry) => entry.line.text === line.text);
      lines.push(`        old ${label(file)}:${line.n}  ${clip(line.text)}`);
      lines.push(`        ${elsewhere ? `new ${label(file)}:${elsewhere.line.n}, out of order` : target.exists ? "new: not there" : "new: the file does not exist"}`);
    }
    if (lost.length > 12) lines.push(`        and ${lost.length - 12} more`);
    fail(file, lines.join("\n"));
  }

  // 4: what is left is glue, and the table lists it
  const glueFound = {};
  for (const file of files) {
    const side = fresh.get(file);
    const found = side.lines.filter((_, i) => side.owner[i] === null);
    if (found.length) glueFound[file] = found.map((line) => line.text);
    const listed = table.glue.get(file) ?? [];
    if (unsound.has(file)) {
      report.push(`  -     ${label(file)}: glue not compared, the failures above come first`);
      continue;
    }
    const want = tally(listed);
    const have = tally(found.map((line) => line.text));
    const unlisted = found.filter((line) => {
      const left = want.get(line.text) ?? 0;
      want.set(line.text, left - 1);
      return left <= 0;
    });
    const absent = [];
    for (const text of listed) {
      const left = have.get(text) ?? 0;
      have.set(text, left - 1);
      if (left <= 0) absent.push(text);
    }
    if (!unlisted.length && !absent.length) {
      report.push(`  ok    ${label(file)}: ${found.length} glue line${found.length === 1 ? "" : "s"}, as listed`);
      continue;
    }
    const lines = [`${label(file)}: the glue is not what the table lists`];
    for (const line of unlisted) lines.push(`        not listed: ${label(file)}:${line.n}  ${clip(line.text)}`);
    for (const text of absent) lines.push(`        listed, not in the file: ${clip(text)}`);
    lines.push(`        the glue in the file now, as the table would list it:`);
    lines.push(`        ${JSON.stringify(file)}: ${JSON.stringify(found.map((line) => line.text), null, 2).replace(/\n/g, "\n        ")}`);
    fail(file, lines.join("\n"));
  }

  if (options["print-glue"]) {
    // Glue is only what remains once every range and every staying line is placed: until then it is not known
    const placed = failures.every((failure) => failure.includes("the glue is not what the table lists"));
    if (!placed) console.error("web-move-check: ranges or staying lines fail; the glue below also holds the lines they could not place");
    console.log(JSON.stringify(glueFound, null, 2));
    return failures.length === 0;
  }
  console.log(`web-move-check: ${table.ranges.length} range${table.ranges.length === 1 ? "" : "s"}, old files from ${before.label}`);
  for (const line of report) console.log(line);
  if (failures.length) {
    console.log(`\nFAIL: ${failures.length} check${failures.length === 1 ? "" : "s"} failed`);
    return false;
  }
  console.log(`\nOK: every range is one block in its place, the lines that stay keep their order, the rest is listed glue`);
  return true;
}

runTool("web-move-check", main);
