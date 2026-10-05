#!/usr/bin/env node
// Prints every HTTP route the Convex backend registers, one "METHOD path" per line, sorted.
//
// What it proves: that moving route registrations between files loses, renames or adds no route. The list is
// read from the router itself: convex/http.ts is bundled with what it imports, run, and asked for getRoutes().
// A route registered by a loop over a table therefore counts like a written one, and a registration that the
// router does not reach is missing from the list however the source reads. Installed iPhone builds call
// these paths by name, so the list before a move and the list after it must be the same lines.
//
// What it does not prove: that a path still reaches the handler it had. Two registrations that exchange their
// paths give the same list; web-move-check.mjs, given each registration as a range, holds its lines together.
//
//   node scripts/step6/list-routes.mjs                              apps/web/convex in the working tree
//   node scripts/step6/list-routes.mjs --dir apps/convex/convex     the backup copy
//   node scripts/step6/list-routes.mjs --rev <commit>               the folder as it is at a commit
//   node scripts/step6/list-routes.mjs --same-as <commit>           also compares with the list at that commit
//   node scripts/step6/list-routes.mjs --expect <file>              also compares with the lines of a file
//   node scripts/step6/list-routes.mjs --same-as <commit> --plus "POST /api/rooms/snapshot"
//                                                                   the comparison expects that route on top
//   --root <folder>   another checkout of the repository (default: the current folder)
//
// Run with plain node from the repo root. It uses esbuild from node_modules (already installed: vitest and
// convex bring it) to bundle in memory; the bundle runs in a child node process that reads it from stdin.
// Nothing is written to disk and no network is used. A commit is read with `git show`, never checked out.
//
// The list goes to stdout and nothing else does; the count goes to stderr.
// Exit 0: listed, and equal to the reference if one was given.
// Exit 1: the list differs from the reference; the lines on one side only are printed.
// Exit 2: the routes could not be listed (no http.ts, it does not bundle, or it throws when run).

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { UsageError, openTree, parseArgs, runTool, tally } from "./lib/common.mjs";

const DEFAULT_DIR = "apps/web/convex";
// The node_modules beside this script: where "convex/server" is found for a tree that has none of its own
const OWN_NODE_MODULES = resolve(dirname(fileURLToPath(import.meta.url)), "../../node_modules");
const ENTRY_NAME = "list-routes-entry.ts";
// The child prints this before the list, so anything a Convex module logs while loading is not read as routes
const MARKER = "@@list-routes@@";
const ENTRY_SOURCE = `import http from "./http";
const rows = http.getRoutes().map(([path, method]) => method + " " + path);
process.stdout.write(${JSON.stringify(MARKER)} + JSON.stringify(rows));
`;
const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.js"];

/** The nearest folder that exists on disk: esbuild looks for node_modules upwards from it */
function existingFolder(path) {
  let folder = path;
  while (!existsSync(folder) && dirname(folder) !== folder) folder = dirname(folder);
  return folder;
}

/** "METHOD path" for every route of the router that `dir`/http.ts exports, sorted */
async function listRoutes({ root, rev, dir }) {
  const tree = openTree({ root, rev });
  if (!tree.exists(posix.join(dir, "http.ts"))) {
    throw new UsageError(`no ${posix.join(dir, "http.ts")} in the ${tree.label}: run from the repo root or pass --dir`);
  }
  // Files come from the tree (a commit or the disk) through this plugin; packages come from node_modules on disk
  const fromTree = {
    name: "files-from-tree",
    setup(bundler) {
      bundler.onResolve({ filter: /^list-routes-entry$/ }, () => ({
        path: posix.join(dir, ENTRY_NAME),
        namespace: "tree",
      }));
      bundler.onResolve({ filter: /^\.\.?\//, namespace: "tree" }, (args) => {
        const target = posix.normalize(posix.join(posix.dirname(args.importer), args.path));
        const found = EXTENSIONS.map((ext) => target + ext).find((path) => tree.exists(path));
        if (!found) return { errors: [{ text: `${args.importer} imports ${args.path}, which is not in the ${tree.label}` }] };
        return { path: found, namespace: "tree" };
      });
      bundler.onLoad({ filter: /.*/, namespace: "tree" }, (args) => ({
        contents: posix.basename(args.path) === ENTRY_NAME ? ENTRY_SOURCE : tree.read(args.path),
        loader: /\.tsx$/.test(args.path) ? "tsx" : /\.(js|mjs)$/.test(args.path) ? "js" : "ts",
        resolveDir: existingFolder(join(root, posix.dirname(args.path))),
      }));
    },
  };
  let bundle;
  try {
    const result = await build({
      entryPoints: ["list-routes-entry"],
      bundle: true,
      write: false,
      platform: "node",
      format: "esm",
      logLevel: "silent",
      nodePaths: [join(root, "node_modules"), OWN_NODE_MODULES],
      plugins: [fromTree],
    });
    bundle = result.outputFiles[0].text;
  } catch (error) {
    const reasons = (error.errors ?? []).map((e) => `  ${e.location ? `${e.location.file}:${e.location.line}: ` : ""}${e.text}`);
    throw new UsageError(`${dir}/http.ts does not bundle (${tree.label})\n${reasons.join("\n") || error.message}`);
  }
  const child = spawnSync(process.execPath, ["--input-type=module"], {
    input: bundle,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const at = child.stdout?.lastIndexOf(MARKER) ?? -1;
  if (child.status !== 0 || at < 0) {
    throw new UsageError(`${dir}/http.ts throws when it is loaded (${tree.label})\n${(child.stderr ?? "").trim()}`);
  }
  return JSON.parse(child.stdout.slice(at + MARKER.length)).sort();
}

async function main(argv) {
  const { options, rest } = parseArgs(argv, {
    root: "value",
    dir: "value",
    rev: "value",
    "same-as": "value",
    expect: "value",
    plus: "list",
  });
  if (rest.length) throw new UsageError(`unexpected argument ${rest[0]}`);
  if (options.expect && options["same-as"]) throw new UsageError("give --expect or --same-as, not both");
  let root = resolve(options.root ?? process.cwd());
  let dir = options.dir ?? DEFAULT_DIR;
  if (isAbsolute(dir)) {
    // A folder outside the checkout (a scratch copy): it is its own root
    if (options.rev || options["same-as"]) throw new UsageError("with a commit, --dir is a path inside the repository");
    root = dir;
    dir = ".";
  }
  dir = posix.normalize(dir.split("\\").join("/")).replace(/\/$/, "");

  const routes = await listRoutes({ root, rev: options.rev, dir });
  if (routes.length) process.stdout.write(routes.join("\n") + "\n");
  const methods = [...tally(routes.map((row) => row.split(" ")[0]))].map(([method, count]) => `${count} ${method}`);
  console.error(`${routes.length} routes${methods.length ? ` (${methods.join(", ")})` : ""}`);

  let reference = null;
  let referenceName = "";
  if (options.expect) {
    let text;
    try {
      text = readFileSync(options.expect, "utf8");
    } catch {
      throw new UsageError(`cannot read ${options.expect}`);
    }
    reference = text.split("\n").map((line) => line.trim()).filter(Boolean);
    referenceName = options.expect;
  } else if (options["same-as"]) {
    reference = await listRoutes({ root, rev: options["same-as"], dir });
    referenceName = `the list at ${options["same-as"]}`;
  } else if (options.plus.length) {
    throw new UsageError("--plus needs --expect or --same-as");
  }
  if (!reference) return true;

  // Compared as counted lines, so a route listed twice on one side shows as a difference too
  const wanted = tally([...reference, ...options.plus.map((row) => row.trim())]);
  const got = tally(routes);
  const missing = [...wanted].filter(([row, count]) => (got.get(row) ?? 0) < count).map(([row]) => row).sort();
  const extra = [...got].filter(([row, count]) => (wanted.get(row) ?? 0) < count).map(([row]) => row).sort();
  if (!missing.length && !extra.length) {
    console.error(`OK: the same ${routes.length} routes as ${referenceName}${options.plus.length ? ` plus ${options.plus.length}` : ""}`);
    return true;
  }
  console.error(`FAIL: the routes differ from ${referenceName}`);
  for (const row of missing) console.error(`  missing now: ${row}`);
  for (const row of extra) console.error(`  not in the reference: ${row}`);
  return false;
}

runTool("list-routes", main);
