// What the self-tests of the tools in scripts/step6 share: a throwaway git repository to hold a tiny "before"
// tree, a way to put an "after" tree on top of it, and a check that runs a tool and compares its exit code and
// what it printed with what the case expects.
//
// A check passes only when the exit code is the expected one and every expected phrase is in the output: an
// exit code alone could be right for the wrong reason.
//
// Fixtures go into a fresh folder under the system's temporary folder, or under --tmp <folder> (also
// STEP6_SELFTEST_TMP), and are removed at the end unless --keep is given. --verbose prints every tool's output.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const TOOLS = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// The fixture repository must not pick up the machine's hooks, signing or default branch name
const GIT_SETTINGS = [
  "-c", "user.name=selftest",
  "-c", "user.email=selftest@example.invalid",
  "-c", "commit.gpgsign=false",
  "-c", "core.hooksPath=/dev/null",
  "-c", "init.defaultBranch=main",
];

/** `path -> text` for every file, written under a folder; a path given as undefined is left out */
function writeFiles(folder, files) {
  for (const [path, text] of Object.entries(files)) {
    if (text === undefined) continue;
    mkdirSync(dirname(join(folder, path)), { recursive: true });
    writeFileSync(join(folder, path), text);
  }
}

/**
 * The 1-based numbers of the first and last line of a block of `text`: from the line that contains `first` to
 * the next line at or after it that contains `last`. Fixtures name their ranges this way, so a range never
 * depends on someone counting lines by hand.
 */
export function linesBetween(text, first, last = first) {
  const lines = text.split("\n");
  const from = lines.findIndex((line) => line.includes(first));
  const to = lines.findIndex((line, i) => i >= from && line.includes(last));
  if (from < 0 || to < 0) throw new Error(`fixture has no block from "${first}" to "${last}"`);
  return [from + 1, to + 1];
}

/** `text` with the line that contains `marker` removed */
export function without(text, marker) {
  const lines = text.split("\n");
  const at = lines.findIndex((line) => line.includes(marker));
  if (at < 0) throw new Error(`fixture has no line with "${marker}"`);
  lines.splice(at, 1);
  return lines.join("\n");
}

/** `text` with `find` replaced once; fails loudly when the fixture has no such text, so a case cannot go stale */
export function swap(text, find, replacement) {
  if (!text.includes(find)) throw new Error(`fixture has no "${find}"`);
  return text.replace(find, replacement);
}

export function selfTest(tool) {
  const argv = process.argv.slice(2);
  const option = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
  const keep = argv.includes("--keep");
  const verbose = argv.includes("--verbose");
  const parent = resolve(option("--tmp") ?? process.env.STEP6_SELFTEST_TMP ?? tmpdir());
  mkdirSync(parent, { recursive: true });
  const home = mkdtempSync(join(parent, `step6-selftest-${tool.replace(/\W+/g, "-")}-`));
  let repos = 0;
  let failed = 0;
  let passed = 0;
  // Also when a self-test stops on an error of its own: the fixtures never outlive the run
  process.on("exit", () => {
    if (!keep) rmSync(home, { recursive: true, force: true });
  });

  console.log(`self-test of ${tool} (fixtures in ${home})`);

  return {
    home,

    /** A new git repository holding `files` as its one commit: the tree "before the move" */
    repo(files) {
      const folder = join(home, `repo${++repos}`);
      mkdirSync(folder);
      writeFiles(folder, files);
      execFileSync("git", [...GIT_SETTINGS, "init", "-q", folder]);
      execFileSync("git", ["-C", folder, ...GIT_SETTINGS, "add", "-A"]);
      execFileSync("git", ["-C", folder, ...GIT_SETTINGS, "commit", "-q", "-m", "before"]);
      return folder;
    },

    /** Replaces everything in a repository's working tree with `files`: the tree "after the move" */
    workingTree(folder, files) {
      // Only a fixture this run made is ever emptied
      if (!folder.startsWith(home + sep)) throw new Error(`${folder} is not a fixture of this run`);
      for (const name of readdirSync(folder)) {
        if (name !== ".git") rmSync(join(folder, name), { recursive: true, force: true });
      }
      writeFiles(folder, files);
    },

    /** A file outside any repository, such as an allow-list or a table; answers its path */
    file(name, text) {
      writeFiles(home, { [name]: text });
      return join(home, name);
    },

    /** Runs another tool of this folder, for a case that compares two tools on one fixture */
    run(name, args, cwd) {
      return spawnSync(process.execPath, [join(TOOLS, name), ...args], { cwd, encoding: "utf8" });
    },

    /**
     * Runs the tool in `cwd` and checks the outcome. `exit` is the expected exit code, `says` phrases (or
     * patterns) that must be in what it printed, `stdout` the exact standard output when that matters.
     */
    check(title, { args, cwd, tool: other }, { exit, says = [], stdout }) {
      const result = spawnSync(process.execPath, [join(TOOLS, other ?? tool), ...args], { cwd, encoding: "utf8" });
      const output = `${result.stdout}${result.stderr}`;
      const problems = [];
      if (result.status !== exit) problems.push(`exit code ${result.status}, expected ${exit}`);
      for (const phrase of says) {
        const found = phrase instanceof RegExp ? phrase.test(output) : output.includes(phrase);
        if (!found) problems.push(`output lacks ${phrase instanceof RegExp ? phrase : `"${phrase}"`}`);
      }
      if (stdout !== undefined && result.stdout !== stdout) problems.push("standard output is not the expected text");
      if (problems.length) failed++;
      else passed++;
      console.log(`  ${problems.length ? "FAIL" : "ok  "}  exit ${result.status}  ${title}`);
      for (const problem of problems) console.log(`          ${problem}`);
      if (problems.length || verbose) console.log(output.replace(/^/gm, "        | "));
      return result;
    },

    /** Prints the tally and sets the exit code: 0 when every case went as expected */
    done() {
      console.log(`${failed ? "FAIL" : "OK"}: ${passed} of ${passed + failed} cases as expected`);
      process.exitCode = failed ? 1 : 0;
    },
  };
}
