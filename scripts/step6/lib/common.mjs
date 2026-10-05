// Shared by the move-checking tools in this folder: reading a file as it is at a commit, the
// "non-blank line, indentation aside" view of a file that every text check compares, a longest
// common subsequence, and command-line parsing.
//
// No dependencies beyond Node and git.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join } from "node:path";

/** Wrong arguments, an unreadable file or a table that does not fit its base: exit code 2, never a verdict */
export class UsageError extends Error {}

const GIT_OPTIONS = { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] };

function git(root, args) {
  return execFileSync("git", ["-C", root, ...args], GIT_OPTIONS);
}

/**
 * One view of the repository's files: the working tree under `root`, a folder holding a copy, or the tree of a
 * commit. Paths are relative to `root` with forward slashes. Reading a commit runs `git show` and nothing else:
 * no checkout, no file written.
 */
export function openTree({ root = process.cwd(), rev, dir } = {}) {
  if (rev && dir) throw new UsageError("give a commit or a folder as the base, not both");
  if (rev) {
    let commit;
    try {
      commit = git(root, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]).trim();
    } catch {
      throw new UsageError(`${rev} is not a commit in the repository at ${root}`);
    }
    let names = null;
    return {
      label: `commit ${commit.slice(0, 7)}`,
      exists(path) {
        // One listing answers every later question: resolving imports asks about many paths
        names ??= new Set(git(root, ["ls-tree", "-r", "--name-only", "-z", commit]).split("\0"));
        return names.has(path);
      },
      read(path) {
        try {
          // "./" makes the path relative to `root` even when `root` is not the top of the repository
          return git(root, ["show", `${commit}:./${path}`]);
        } catch {
          throw new UsageError(`${path} does not exist at ${rev}`);
        }
      },
    };
  }
  const base = dir ?? root;
  if (!existsSync(base) || !statSync(base).isDirectory()) throw new UsageError(`${base} is not a folder`);
  // An absolute path names a file outside the tree, such as a scratch copy
  const onDisk = (path) => (isAbsolute(path) ? path : join(base, path));
  return {
    label: dir ? `folder ${dir}` : "working tree",
    exists(path) {
      return existsSync(onDisk(path)) && statSync(onDisk(path)).isFile();
    },
    read(path) {
      try {
        return readFileSync(onDisk(path), "utf8");
      } catch {
        throw new UsageError(`cannot read ${onDisk(path)}`);
      }
    },
  };
}

/**
 * The lines of a file that carry code, as the text checks compare them: blank lines left out, each line without
 * its indentation and trailing spaces. `n` is the 1-based line number in the file and `indent` the width of the
 * indentation that was taken off.
 */
export function codeLines(text) {
  const lines = [];
  text.split("\n").forEach((raw, index) => {
    const trimmed = raw.trim();
    if (trimmed) lines.push({ n: index + 1, text: trimmed, indent: raw.length - raw.trimStart().length });
  });
  return lines;
}

/** How many times each text occurs */
export function tally(texts) {
  const counts = new Map();
  for (const text of texts) counts.set(text, (counts.get(text) ?? 0) + 1);
  return counts;
}

/**
 * A longest common subsequence of two arrays, as pairs of indices [i, j] with a[i] === b[j], in order.
 * Myers' algorithm: the time grows with the number of differences, so two long files that mostly agree are cheap.
 */
export function commonSubsequence(a, b) {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const offset = max + 1;
  // furthest[offset + k] is the furthest x reached on diagonal k (k = x - y)
  const furthest = new Int32Array(2 * max + 3);
  // rounds[d] is `furthest` for diagonals -d-1..d+1 as it stood when round d began
  const rounds = [];
  let done = -1;
  for (let d = 0; d <= max && done < 0; d++) {
    rounds.push(furthest.slice(offset - d - 1, offset + d + 2));
    for (let k = -d; k <= d; k += 2) {
      const down = k === -d || (k !== d && furthest[offset + k - 1] < furthest[offset + k + 1]);
      let x = down ? furthest[offset + k + 1] : furthest[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      furthest[offset + k] = x;
      if (x >= n && y >= m) {
        done = d;
        break;
      }
    }
  }
  const pairs = [];
  let x = n;
  let y = m;
  for (let d = done; d > 0; d--) {
    const before = rounds[d];
    const at = (k) => before[k + d + 1];
    const k = x - y;
    const down = k === -d || (k !== d && at(k - 1) < at(k + 1));
    const fromK = down ? k + 1 : k - 1;
    const fromX = at(fromK);
    const fromY = fromX - fromK;
    while (x > fromX && y > fromY) {
      x--;
      y--;
      pairs.push([x, y]);
    }
    x = fromX;
    y = fromY;
  }
  while (x > 0 && y > 0) {
    x--;
    y--;
    pairs.push([x, y]);
  }
  return pairs.reverse();
}

/**
 * Reads a command line. `spec` names each option: "value" takes the next argument, "list" may repeat, "flag"
 * takes none. Anything else starting with "--" is refused, so a mistyped option never passes as "nothing asked".
 */
export function parseArgs(argv, spec) {
  const options = {};
  const rest = [];
  for (const [name, kind] of Object.entries(spec)) {
    if (kind === "list") options[name] = [];
    if (kind === "flag") options[name] = false;
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      rest.push(arg);
      continue;
    }
    const name = arg.slice(2);
    const kind = spec[name];
    if (!kind) throw new UsageError(`unknown option ${arg}`);
    if (kind === "flag") {
      options[name] = true;
      continue;
    }
    const value = argv[++i];
    if (value === undefined) throw new UsageError(`${arg} needs a value`);
    if (kind === "list") options[name].push(value);
    else options[name] = value;
  }
  return { options, rest };
}

/** Reads a JSON file given on the command line */
export function readJson(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new UsageError(`cannot read ${path}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new UsageError(`${path} is not valid JSON: ${error.message}`);
  }
}

/**
 * Runs a tool's main function and turns its outcome into the exit code: 0 when the check holds, 1 when it does
 * not, 2 when the tool could not check at all. A fault in the tool itself is 3, so that it is never read as
 * "the move is wrong".
 */
export async function runTool(name, main) {
  try {
    process.exitCode = (await main(process.argv.slice(2))) ? 0 : 1;
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(`${name}: ${error.message}`);
      process.exitCode = 2;
    } else {
      console.error(`${name}: internal error`);
      console.error(error);
      process.exitCode = 3;
    }
  }
}

/** A long line cut for a report */
export function clip(text, width = 110) {
  return text.length > width ? `${text.slice(0, width - 1)}…` : text;
}
