#!/usr/bin/env node
// Checks apps/ios/Localization.swift for duplicate dictionary keys.
//
// The file holds one big Swift dictionary literal. Swift builds a dictionary literal
// at run time and traps on a repeated key ("Fatal error: Dictionary literal contains
// duplicate keys"). The compiler does not stop the build for it (at most it prints a
// warning among the others), so a key added twice crashes the iOS app the first
// time a string is looked up, which is at launch.
//
//   node scripts/check-localization.mjs            checks apps/ios/Localization.swift
//   node scripts/check-localization.mjs <file>     checks another file
//   node scripts/check-localization.mjs --min 50   lowers the "too few entries" floor
//
// Exit 0: no duplicates, prints the number of keys.
// Exit 1: at least one duplicate key, each listed with its line numbers.
// Exit 2: the file could not be checked (missing, an unexpected shape, or far fewer
//         entries than expected). Read the message: either the file is broken or
//         this script needs to learn the new shape. It never passes on a guess.
//
// No dependencies.

import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../apps/ios/Localization.swift",
);
// 371 keys when this was written. Far fewer means the parser lost its place (or
// most of the file is gone), and a check that saw a tenth of the keys must not pass.
const DEFAULT_MIN_ENTRIES = 200;

// The declaration whose literal is checked: `translations: [String: [String: String]] = [`
const ANCHOR = /\btranslations\s*:\s*\[\s*String\s*:\s*\[\s*String\s*:\s*String\s*\]\s*\]\s*=\s*\[/;
// One-line cross-check of the parser, independent of it: an entry as it is normally
// written, `"key": ["ja": ...` (the value may start on the next line).
const ENTRY_PATTERN = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*\[\s*"ja"/gm;

class CheckError extends Error {}

function parseArgs(argv) {
  let file = DEFAULT_FILE;
  let min = DEFAULT_MIN_ENTRIES;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--min") {
      min = Number(argv[++i]);
      if (!Number.isInteger(min) || min < 0) throw new CheckError("--min needs a whole number");
    } else if (arg.startsWith("-")) {
      throw new CheckError(`unknown option ${arg}`);
    } else {
      file = resolve(arg);
    }
  }
  return { file, min };
}

/** 1-based line number of a character offset. */
function lineAt(source, offset) {
  let line = 1;
  for (let i = 0; i < offset; i++) if (source[i] === "\n") line++;
  return line;
}

/** Turns the inside of a Swift string literal into the string it stands for. */
function unescapeSwift(raw, line) {
  return raw.replace(/\\(u\{([0-9a-fA-F]{1,8})\}|.)/gs, (whole, body, hex) => {
    if (hex !== undefined) return String.fromCodePoint(parseInt(hex, 16));
    switch (body) {
      case "n": return "\n";
      case "t": return "\t";
      case "r": return "\r";
      case "0": return "\0";
      case '"': return '"';
      case "'": return "'";
      case "\\": return "\\";
      default:
        throw new CheckError(`line ${line}: unknown escape ${whole} in a string literal`);
    }
  });
}

/**
 * Walks the dictionary literal and returns its top-level entries:
 * [{ key, line, innerKeys: [{ key, line }] }]
 *
 * It reads Swift the way the compiler does as far as this file needs: string
 * literals with escapes, line and block comments, and nested [ ]. Anything it does
 * not understand is an error, never a silent skip.
 */
function parseEntries(source) {
  const anchor = ANCHOR.exec(source);
  if (!anchor) {
    throw new CheckError(
      "could not find `translations: [String: [String: String]] = [`. " +
        "If the dictionary was renamed or retyped, update ANCHOR in this script.",
    );
  }

  const entries = [];
  let i = anchor.index + anchor[0].length; // just past the opening [
  let depth = 1; // 1 = between entries, 2 = inside one entry's value
  let current = null; // the entry whose value is being read
  let pending = null; // a string literal just read at depth 1 or 2, not yet followed by ":"
  let closed = false;

  const fail = (offset, message) => {
    throw new CheckError(`line ${lineAt(source, offset)}: ${message}`);
  };

  while (i < source.length) {
    const ch = source[i];

    if (ch === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      i = end === -1 ? source.length : end;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      // Swift block comments nest.
      let level = 1;
      let j = i + 2;
      while (j < source.length && level > 0) {
        if (source[j] === "/" && source[j + 1] === "*") { level++; j += 2; }
        else if (source[j] === "*" && source[j + 1] === "/") { level--; j += 2; }
        else j++;
      }
      if (level > 0) fail(i, "unterminated block comment");
      i = j;
      continue;
    }
    if (/\s/.test(ch)) { i++; continue; }

    if (ch === "#" && (source[i + 1] === '"' || source[i + 1] === "#")) {
      fail(i, 'raw string literals (#"..."#) are not supported by this script');
    }
    if (ch === '"') {
      if (source.startsWith('"""', i)) fail(i, 'multi-line string literals (""") are not supported by this script');
      let j = i + 1;
      while (j < source.length && source[j] !== '"') {
        if (source[j] === "\n") fail(i, "unterminated string literal");
        if (source[j] === "\\" && source[j + 1] === "(") {
          fail(i, "string interpolation \\( ) is not supported by this script");
        }
        j += source[j] === "\\" ? 2 : 1;
      }
      if (j >= source.length) fail(i, "unterminated string literal");
      if (pending) fail(i, "two string literals in a row; expected `:` or `,` between them");
      pending = { raw: source.slice(i + 1, j), offset: i };
      i = j + 1;
      continue;
    }

    if (ch === ":") {
      if (pending && depth <= 2) {
        const line = lineAt(source, pending.offset);
        const key = unescapeSwift(pending.raw, line);
        if (depth === 1) {
          if (current) {
            fail(pending.offset, current.hasValue ? "missing `,` before this key" : "a key follows a key that has no value");
          }
          current = { key, line, innerKeys: [], hasValue: false };
          entries.push(current);
        } else {
          current.innerKeys.push({ key, line });
        }
      } else if (depth === 1) {
        fail(i, "`:` without a string key in front of it");
      }
      pending = null;
      i++;
      continue;
    }

    if (ch === "[") {
      if (depth === 1) {
        if (!current || current.hasValue) fail(i, "a value `[` without a `\"key\":` in front of it");
        current.hasValue = true;
      }
      pending = null;
      depth++;
      i++;
      continue;
    }
    if (ch === "]") {
      depth--;
      pending = null;
      i++;
      if (depth === 0) { closed = true; break; }
      continue;
    }

    if (ch === ",") {
      if (depth === 1) {
        if (pending) fail(pending.offset, "a string at the top level is not followed by `:`, so it is not a key");
        if (current && !current.hasValue) fail(i, `the key on line ${current.line} has no [ ... ] value`);
        current = null;
      }
      pending = null;
      i++;
      continue;
    }

    if (depth === 1) {
      fail(i, `unexpected \`${ch}\` between entries; every entry should look like "key": ["ja": "..."]`);
    }
    // Inside a value anything else (identifiers, numbers, operators) is none of our business.
    pending = null;
    i++;
  }

  if (!closed) throw new CheckError("the dictionary literal is never closed with `]`");
  if (pending) fail(pending.offset, "a string at the top level is not followed by `:`, so it is not a key");
  if (current && !current.hasValue) {
    throw new CheckError(`line ${current.line}: the key has no [ ... ] value`);
  }
  return entries;
}

/** Groups [{ key, line }] by key and returns the groups that have more than one line. */
function duplicates(items) {
  // Swift compares strings by canonical equivalence, so "é" typed as one code point
  // and as e + combining accent are the same key. NFC makes them the same here too.
  const seen = new Map();
  for (const { key, line } of items) {
    const normalized = key.normalize("NFC");
    if (!seen.has(normalized)) seen.set(normalized, { key, lines: [] });
    seen.get(normalized).lines.push(line);
  }
  return [...seen.values()].filter((group) => group.lines.length > 1);
}

function main() {
  const { file, min } = parseArgs(process.argv.slice(2));
  // Shown relative to where the script is run, unless that needs "../".
  const fromHere = relative(process.cwd(), file);
  const shown = fromHere && !fromHere.startsWith("..") ? fromHere : file;

  let source;
  try {
    source = readFileSync(file, "utf8");
  } catch (error) {
    throw new CheckError(`cannot read ${shown}: ${error.message}`);
  }

  const entries = parseEntries(source);

  const problems = [];
  for (const group of duplicates(entries)) {
    problems.push(`  ${JSON.stringify(group.key)} is a key ${group.lines.length} times: lines ${group.lines.join(", ")}`);
  }
  // The inner ["ja": ...] is a dictionary literal too and traps the same way.
  for (const entry of entries) {
    for (const group of duplicates(entry.innerKeys)) {
      problems.push(
        `  ${JSON.stringify(entry.key)} (line ${entry.line}) has the language ${JSON.stringify(group.key)} ` +
          `${group.lines.length} times: lines ${group.lines.join(", ")}`,
      );
    }
  }
  if (problems.length > 0) {
    console.error(`${shown}: duplicate keys in a dictionary literal. The app would crash at launch.`);
    for (const problem of problems) console.error(problem);
    console.error("Remove or rename the repeated keys.");
    return 1;
  }

  // Guards against a check that passes because it looked at too little.
  const patternCount = [...source.matchAll(ENTRY_PATTERN)].length;
  if (patternCount > entries.length) {
    throw new CheckError(
      `found ${entries.length} keys, but ${patternCount} lines look like \`"key": ["ja"\`. ` +
        "Some entries were not read: are there entries outside the translations literal, or inside a /* */ comment?",
    );
  }
  if (entries.length < min) {
    throw new CheckError(
      `found only ${entries.length} keys, expected at least ${min}. ` +
        "Either the file lost most of its entries or its shape changed and this script no longer reads it. " +
        "If the smaller number is right, pass --min or lower DEFAULT_MIN_ENTRIES.",
    );
  }

  console.log(`${shown}: ${entries.length} keys, no duplicates.`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  // Exit 1 is reserved for "duplicates found"; a failure of the check itself is 2.
  console.error(`check-localization: ${error instanceof CheckError ? error.message : error.stack}`);
  process.exitCode = 2;
}
