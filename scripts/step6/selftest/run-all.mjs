#!/usr/bin/env node
// Runs the self-test of every tool in scripts/step6, one after the other, passing its own arguments on.
//
//   node scripts/step6/selftest/run-all.mjs [--tmp <folder>] [--keep] [--verbose]
//
// Each self-test builds a tiny tree, moves code in it the right way and then in each wrong way its tool is
// there to catch, and checks the tool's exit code and report. Run this after changing a tool, and before
// trusting one on a machine it has not run on. Needs node, git and node_modules; no network.
//
// Exit 0 when every self-test passes, 1 otherwise.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TESTS = ["list-routes", "line-account", "web-move-check", "hook-order"];

const failed = [];
for (const name of TESTS) {
  const result = spawnSync(process.execPath, [join(HERE, `${name}.selftest.mjs`), ...process.argv.slice(2)], { stdio: "inherit" });
  if (result.status !== 0) failed.push(name);
  console.log("");
}
console.log(failed.length ? `FAIL: ${failed.join(", ")}` : `OK: all ${TESTS.length} self-tests pass`);
process.exitCode = failed.length ? 1 : 0;
