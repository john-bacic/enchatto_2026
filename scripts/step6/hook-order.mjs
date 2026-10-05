#!/usr/bin/env node
// Lists every React hook a component calls, in the order the calls run, and proves that a move kept that order.
//
// Why: effects run in the order their hooks are called, and a custom hook's effects run where the hook is
// called. In the room page that order is behaviour: one effect skips until a later one has set a ref, and of
// three redirects the last one to fire wins. Moving an effect into a hook that is called somewhere else changes
// when it runs although no line of it changed, and no text comparison can see that.
//
// What the list holds: the component's hook calls from top to bottom, with every custom hook of this project
// opened in place (whatever file it lives in, to any depth), so an effect inside a hook stands where it runs.
// Each entry has its kind (useState, useRef, useEffect, useMemo, useCallback, useQuery, a mutation hook, ...).
// Effects, memos and callbacks carry a fingerprint of their function and the text of their dependency list;
// the fingerprint ignores indentation, line breaks and comments, so a function that moved untouched keeps it.
// Hooks from packages (React, Convex, Next) and the mutation hook useAuthedMutation are listed as one entry.
//
// What it proves, always (exit 1 otherwise):
//   1. no name changes at a custom hook's edge: the hook returns `{ a, b }` and its caller takes `{ a, b }`,
//      never `{ a: b }`, so a moved line still reads and writes what it did.
// And when given a base (exit 1 otherwise):
//   2. the same effects (function and dependency list), states and refs (name and first value) exist as at
//      the base, none added, dropped or edited;
//   3. they are called in the same order, apart from the entries an allow-list declares as moved;
//   4. no caller hands a hook a value under another name than the base already does: `useX(a)` for
//      `function useX(a)` and `useX({ a })`, never `useX(b)` or `useX({ a: b })`. A moved line that reads
//      `participantId` inside the hook then reads what it read in the page. Without a base these are notes;
//   5. every other hook call of the base (callbacks, memos, queries, mutations) is still there, with the same
//      name, function, dependency list and arguments: none lost, none edited. They are compared as a set,
//      their order carries no behaviour. The allow-list cannot excuse one: a move edits no hook call.
// A hook call of that kind which the base does not have is printed as a note, and fails only with --strict.
//
// What it does not prove: that the lines between the hooks kept their place (web-move-check.mjs), or that a hook
// is still called on every render: one put inside an `if`, in a loop or below an early return is listed like
// any other, and lint's react-hooks/rules-of-hooks is what reports it. Names at a hook's edge are read from
// object literals, destructuring and bare names only. A hook that returns an array, an object built elsewhere
// and an argument that is an expression (`useX(a.b)`, `useX(a ?? b)`) are not followed, and the arguments of a
// custom hook's call are not compared with the base's beyond those names.
//
//   node scripts/step6/hook-order.mjs <component file>                         the list
//   node scripts/step6/hook-order.mjs <component file> --base <commit>         the list, and the comparison
//   node scripts/step6/hook-order.mjs <component file> --base-dir <folder>     the base from a copy of the tree
//   --component <name>   which function of the file (default: the only top-level one that calls hooks)
//   --allow <file>       declared moves, see below
//   --leaf <name>        one more project hook to list as one entry instead of opening it (may repeat)
//   --strict             a hook call the base does not have fails too
//   --json               the list as JSON on stdout instead of the table
//   --root <folder>      another checkout (default: the current folder)
//
// The allow-list is a JSON file naming entries by the key the list prints for them:
//
//   { "moved": [ "useState showEnglish", { "entry": "useEffect 3fa9c1d2e4b6", "why": "runs before the replay effect now" } ] }
//
// A declared entry may stand anywhere; every other entry must keep its place among the others. State and
// refs need declaring when their hook is called lower down than they were written: harmless, and then on record.
// A declaration the order does not need is reported, so the list stays as short as the move.
//
// Run with plain node from the repo root. It uses the TypeScript compiler API from node_modules (the
// "typescript" package the type-check already uses) to parse; it does not type-check and writes nothing.
// Exit 0: listed, and the comparison holds if a base was given. Exit 1: a check failed.
// Exit 2: the check could not run (bad arguments, no such file or component).

import { createHash } from "node:crypto";
import { basename, isAbsolute, posix, relative, resolve } from "node:path";
import ts from "typescript";
import { UsageError, clip, commonSubsequence, openTree, parseArgs, readJson, runTool, tally } from "./lib/common.mjs";

const EFFECTS = new Set(["useEffect", "useLayoutEffect", "useInsertionEffect"]);
const STATES = new Set(["useState", "useReducer"]);
// The page's mutation hook wraps three library hooks; one entry per mutation reads better than three
const DEFAULT_LEAVES = ["useAuthedMutation"];
const IMPORT_ENDINGS = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"];
const HOOK_NAME = /^use[A-Z0-9]/;

/** Which comparison an entry takes part in */
function classOf(kind) {
  if (EFFECTS.has(kind)) return "effect";
  if (STATES.has(kind)) return "state";
  if (kind === "useRef") return "ref";
  if (kind === "useCallback") return "callback";
  if (kind === "useMemo") return "memo";
  return "other";
}

/** A node's tokens without whitespace and comments: what stays the same when code is re-indented or re-wrapped */
function tokensOf(node, sourceFile, out = []) {
  if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return out;
  const children = node.getChildren(sourceFile);
  if (children.length) {
    for (const child of children) tokensOf(child, sourceFile, out);
    return out;
  }
  let text = node.getText(sourceFile);
  // Indentation inside JSX text does not reach the page; inside a string or template it does, so those stay exact
  if (node.kind === ts.SyntaxKind.JsxText) text = text.replace(/\s+/g, " ").trim();
  if (text) out.push(text);
  return out;
}

/** A node's source on one line, for the report */
const oneLine = (node, sourceFile) => node.getText(sourceFile).replace(/\s+/g, " ");

const fingerprint = (tokens) => createHash("sha256").update(tokens.join("\u0001")).digest("hex");

/** The expression inside brackets, casts and `!` */
function bare(node) {
  let inner = node;
  while (inner && (ts.isParenthesizedExpression(inner) || ts.isAsExpression(inner) || ts.isNonNullExpression(inner) || ts.isSatisfiesExpression(inner) || ts.isTypeAssertionExpression(inner))) {
    inner = inner.expression;
  }
  return inner;
}

/** The declaration a call's result is stored by: `const x = useX()` */
function declarationOf(call) {
  let node = call;
  while (node.parent && bare(node.parent) === bare(node) && !ts.isVariableDeclaration(node.parent)) node = node.parent;
  const parent = node.parent;
  return parent && ts.isVariableDeclaration(parent) && parent.initializer === node ? parent : null;
}

/** One tree's files, parsed on demand, with enough of module resolution to follow a hook to its definition */
class Project {
  constructor(tree, leaves) {
    this.tree = tree;
    this.leaves = leaves;
    this.sources = new Map();
    this.aliases = new Map();
    this.problems = [];
    this.handed = [];
    this.unopened = new Set();
    this.checked = new Set();
  }

  /** A parsed file: its imports, its top-level functions and what it exports */
  source(path) {
    if (this.sources.has(path)) return this.sources.get(path);
    const text = this.tree.read(path);
    const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, /\.[jt]sx$/.test(path) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const source = { path, sourceFile, imports: new Map(), namespaces: new Map(), functions: new Map(), exports: new Map(), stars: [] };
    const has = (node, kind) => (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === kind);
    for (const statement of sourceFile.statements) {
      if (ts.isImportDeclaration(statement) && statement.importClause && !statement.importClause.isTypeOnly) {
        const from = statement.moduleSpecifier.text;
        const clause = statement.importClause;
        if (clause.name) source.imports.set(clause.name.text, { from, name: "default" });
        if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) source.namespaces.set(clause.namedBindings.name.text, from);
        if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const element of clause.namedBindings.elements) {
            source.imports.set(element.name.text, { from, name: (element.propertyName ?? element.name).text });
          }
        }
      } else if (ts.isFunctionDeclaration(statement) && statement.body) {
        const name = statement.name?.text ?? "default";
        source.functions.set(name, statement);
        if (has(statement, ts.SyntaxKind.ExportKeyword)) source.exports.set(has(statement, ts.SyntaxKind.DefaultKeyword) ? "default" : name, { local: name });
      } else if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          const value = declaration.initializer && bare(declaration.initializer);
          if (!ts.isIdentifier(declaration.name) || !value || !(ts.isArrowFunction(value) || ts.isFunctionExpression(value))) continue;
          source.functions.set(declaration.name.text, value);
          if (has(statement, ts.SyntaxKind.ExportKeyword)) source.exports.set(declaration.name.text, { local: declaration.name.text });
        }
      } else if (ts.isExportDeclaration(statement)) {
        const from = statement.moduleSpecifier?.text;
        if (!statement.exportClause && from) source.stars.push(from);
        if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
          for (const element of statement.exportClause.elements) {
            const original = (element.propertyName ?? element.name).text;
            source.exports.set(element.name.text, from ? { from, name: original } : { local: original });
          }
        }
      } else if (ts.isExportAssignment(statement) && !statement.isExportEquals && ts.isIdentifier(statement.expression)) {
        source.exports.set("default", { local: statement.expression.text });
      }
    }
    this.sources.set(path, source);
    return source;
  }

  /** The `paths` of the nearest tsconfig.json above a file, as [prefix, folder] pairs: "@/" -> "apps/web/" */
  aliasesFor(path) {
    let folder = posix.dirname(path);
    for (;;) {
      if (!this.aliases.has(folder)) {
        let pairs = null;
        const config = posix.join(folder, "tsconfig.json");
        if (this.tree.exists(config)) {
          const options = ts.parseConfigFileTextToJson(config, this.tree.read(config)).config?.compilerOptions ?? {};
          if (options.paths) {
            pairs = [];
            for (const [pattern, targets] of Object.entries(options.paths)) {
              if (!pattern.endsWith("*") || !targets[0]?.endsWith("*")) continue;
              pairs.push([pattern.slice(0, -1), posix.join(folder, options.baseUrl ?? ".", targets[0].slice(0, -1))]);
            }
          }
        }
        this.aliases.set(folder, pairs);
      }
      if (this.aliases.get(folder)) return this.aliases.get(folder);
      if (folder === "." || folder === "/") return [];
      folder = posix.dirname(folder);
    }
  }

  /** The project file an import names, or null for a package */
  resolveImport(from, importer) {
    let target = null;
    if (from.startsWith(".")) {
      target = posix.join(posix.dirname(importer), from);
    } else {
      const alias = this.aliasesFor(importer).find(([prefix]) => from.startsWith(prefix));
      if (alias) target = posix.join(alias[1], from.slice(alias[0].length));
    }
    if (target === null) return null;
    return IMPORT_ENDINGS.map((ending) => target + ending).find((path) => this.tree.exists(path)) ?? null;
  }

  /** The function a file exports under a name, following re-exports */
  exported(path, name, depth = 0) {
    if (depth > 8) return null;
    const source = this.source(path);
    const entry = source.exports.get(name);
    if (entry?.local) {
      if (source.functions.has(entry.local)) return { path, name: entry.local, node: source.functions.get(entry.local) };
      const imported = source.imports.get(entry.local);
      const target = imported && this.resolveImport(imported.from, path);
      return target ? this.exported(target, imported.name, depth + 1) : null;
    }
    const targets = entry?.from ? [[entry.from, entry.name]] : source.stars.map((from) => [from, name]);
    for (const [from, original] of targets) {
      const target = this.resolveImport(from, path);
      const found = target && this.exported(target, original, depth + 1);
      if (found) return found;
    }
    return null;
  }

  /** The project function behind a hook call, or null when it comes from a package or is listed as a leaf */
  definition(path, callee) {
    if (this.leaves.has(callee.name)) return null;
    const source = this.source(path);
    if (callee.namespace) {
      const from = source.namespaces.get(callee.namespace);
      const target = from && this.resolveImport(from, path);
      return target ? this.exported(target, callee.name) : null;
    }
    if (source.functions.has(callee.name)) return { path, name: callee.name, node: source.functions.get(callee.name) };
    const imported = source.imports.get(callee.name);
    const target = imported && this.resolveImport(imported.from, path);
    const found = target ? this.exported(target, imported.name) : null;
    // A project file that the hook could not be found in: said aloud, because its effects are then not in the list
    if (target && !found) this.unopened.add(`${callee.name} (imported from "${imported.from}" in ${path})`);
    return found;
  }

  /** The hook calls of one function in the order they run, custom hooks opened in place */
  collect(owner, via, out, stack) {
    const { sourceFile } = this.source(owner.path);
    const visit = (node) => {
      // A function or class inside the component does not run while the component's hooks are called
      if (node !== owner.node && (ts.isFunctionLike(node) || ts.isClassLike(node))) return;
      // Arguments are evaluated before the call they belong to
      ts.forEachChild(node, visit);
      if (!ts.isCallExpression(node)) return;
      const called = node.expression;
      let callee = null;
      if (ts.isIdentifier(called) && HOOK_NAME.test(called.text)) callee = { name: called.text };
      if (ts.isPropertyAccessExpression(called) && ts.isIdentifier(called.expression) && HOOK_NAME.test(called.name.text)) {
        callee = { name: called.name.text, namespace: called.expression.text };
      }
      if (!callee) return;

      const kind = callee.name;
      const declaration = declarationOf(node);
      const binding = declaration ? oneLine(declaration.name, sourceFile) : null;
      // `showEnglish` of `[showEnglish, setShowEnglish]`: the name an entry is known by
      const name = declaration ? tokensOf(declaration.name, sourceFile).find((token) => /^[\w$]/.test(token)) ?? binding : null;
      const entry = { kind, class: classOf(kind), path: owner.path, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, via, binding, name };

      const target = this.definition(owner.path, callee);
      const id = target && `${target.path}#${target.name}`;
      if (target && !stack.includes(id)) {
        out.push({ ...entry, class: "opened", target: target.path });
        this.checkNames(owner, declaration, target, callee.name);
        this.checkArguments(owner, node, target, callee.name);
        this.collect(target, [...via, kind], out, [...stack, id]);
        return;
      }

      // What an entry is compared by is built from tokens, so that only a change of code changes it
      const bound = declaration ? tokensOf(declaration.name, sourceFile).join(" ") : "";
      if (entry.class === "effect" || entry.class === "callback" || entry.class === "memo") {
        const [body, deps] = node.arguments;
        entry.body = fingerprint(body ? tokensOf(body, sourceFile) : []);
        entry.deps = deps ? oneLine(deps, sourceFile) : "(no list)";
        const depTokens = deps ? tokensOf(deps, sourceFile) : ["(no list)"];
        // `[a, b,]` and `[a, b]` are the same list
        if (depTokens.at(-2) === "," && depTokens.at(-1) === "]") depTokens.splice(-2, 1);
        const list = depTokens.join(" ");
        if (entry.class === "effect") {
          entry.sig = `${kind}|${entry.body}|${list}`;
          entry.key = `${kind} ${entry.body.slice(0, 12)}`;
        } else {
          entry.sig = `${kind}|${bound}|${entry.body}|${list}`;
          entry.key = `${kind} ${name ?? entry.body.slice(0, 12)}`;
        }
      } else {
        const print = fingerprint(tokensOf(node, sourceFile));
        entry.call = oneLine(node, sourceFile);
        entry.sig = `${kind}|${bound}|${print}`;
        entry.key = `${kind} ${name ?? print.slice(0, 12)}`;
      }
      out.push(entry);
    };
    visit(owner.node);
  }

  /**
   * Names at a custom hook's edge. A moved line keeps working only if every value still goes by its old name:
   * `return { a: b }` or `const { a: b } = useX()` renames one without any moved line showing it.
   */
  checkNames(owner, declaration, target, hook) {
    const at = (path, node) => {
      const { sourceFile } = this.source(path);
      return `${path}:${sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1}`;
    };
    const renames = (pattern, path, what) => {
      if (!ts.isObjectBindingPattern(pattern)) return;
      for (const element of pattern.elements) {
        if (!element.propertyName) continue;
        this.problems.push(`${at(path, element)}  ${what} under another name: ${clip(element.getText(this.source(path).sourceFile), 70)}`);
      }
    };
    if (declaration) renames(declaration.name, owner.path, `takes a value of ${hook}`);

    const id = `${target.path}#${target.name}`;
    if (this.checked.has(id)) return;
    this.checked.add(id);
    for (const parameter of target.node.parameters ?? []) renames(parameter.name, target.path, `${hook} takes an argument`);
    const returned = [];
    if (target.node.body && !ts.isBlock(target.node.body)) returned.push(target.node.body);
    const visit = (node) => {
      if (node !== target.node && (ts.isFunctionLike(node) || ts.isClassLike(node))) return;
      if (ts.isReturnStatement(node) && node.expression) returned.push(node.expression);
      ts.forEachChild(node, visit);
    };
    visit(target.node);
    for (const expression of returned) {
      const value = bare(expression);
      if (!ts.isObjectLiteralExpression(value)) continue;
      for (const property of value.properties) {
        if (ts.isShorthandPropertyAssignment(property)) continue;
        this.problems.push(`${at(target.path, property)}  ${hook} returns something that is not a bare name: ${clip(property.getText(this.source(target.path).sourceFile), 70)}`);
      }
    }
  }

  /**
   * What a caller hands a custom hook. A bare name passed for a parameter of another name, or `{ a: b }` in an
   * argument, gives the hook's lines another value than the name they read says. Kept apart from `problems`:
   * a call that stands this way at the base is not the move's doing, so the comparison counts only new ones.
   */
  checkArguments(owner, call, target, hook) {
    const { sourceFile } = this.source(owner.path);
    const at = `${owner.path}:${sourceFile.getLineAndCharacterOfPosition(call.getStart(sourceFile)).line + 1}`;
    const note = (taken, given) => {
      // `undefined` is no value handed at all
      if (given !== taken && given !== "undefined") this.handed.push({ at, what: `${hook} takes ${given} as ${taken}` });
    };
    (target.node.parameters ?? []).forEach((parameter, i) => {
      const argument = call.arguments[i] && bare(call.arguments[i]);
      if (!argument) return;
      if (ts.isIdentifier(argument) && ts.isIdentifier(parameter.name)) note(parameter.name.text, argument.text);
      if (!ts.isObjectLiteralExpression(argument)) return;
      for (const property of argument.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const value = bare(property.initializer);
        if (ts.isIdentifier(value)) note(property.name.getText(sourceFile), value.text);
      }
    });
  }

  /** The component of a file: the named function, or the only top-level function that calls a hook itself */
  component(path, wanted) {
    const source = this.source(path);
    if (wanted) {
      if (!source.functions.has(wanted)) throw new UsageError(`${path} has no top-level function ${wanted} (${this.tree.label})`);
      return { path, name: wanted, node: source.functions.get(wanted) };
    }
    const callers = [...source.functions].filter(([, node]) => {
      let calls = false;
      const visit = (inner) => {
        if (inner !== node && (ts.isFunctionLike(inner) || ts.isClassLike(inner))) return;
        if (ts.isCallExpression(inner) && ts.isIdentifier(inner.expression) && HOOK_NAME.test(inner.expression.text)) calls = true;
        ts.forEachChild(inner, visit);
      };
      visit(node);
      return calls;
    });
    if (callers.length !== 1) {
      throw new UsageError(`${path}: ${callers.length ? `several functions call hooks (${callers.map(([name]) => name).join(", ")})` : "no top-level function calls a hook"}; pass --component`);
    }
    return { path, name: callers[0][0], node: callers[0][1] };
  }

  list(path, wanted) {
    if (!this.tree.exists(path)) throw new UsageError(`${path} does not exist (${this.tree.label})`);
    const component = this.component(path, wanted);
    const entries = [];
    this.collect(component, [], entries, [`${path}#${component.name}`]);
    let effect = 0;
    entries.forEach((entry, i) => {
      entry.index = i + 1;
      if (entry.class === "effect") entry.effect = ++effect;
    });
    return { component: component.name, entries, problems: this.problems, handed: this.handed, unopened: [...this.unopened] };
  }
}

const place = (entry) => `${basename(entry.path)}:${entry.line}`;

/** One entry on one line, for the comparison's messages */
function describe(entry) {
  if (entry.class === "effect") return `${entry.key}  deps ${clip(entry.deps, 70)}  (${place(entry)})`;
  if (entry.class === "callback" || entry.class === "memo") return `${entry.key}  body ${entry.body.slice(0, 12)}  deps ${clip(entry.deps, 60)}  (${place(entry)})`;
  return `${entry.key}  ${clip(entry.call, 70)}  (${place(entry)})`;
}

function printList(listing, path, label) {
  console.log(`hook-order: ${listing.component} in ${path} (${label})\n`);
  const rows = listing.entries.map((entry) => {
    const depth = "  ".repeat(entry.via.length);
    let what;
    if (entry.class === "opened") what = `${entry.binding ? `${clip(entry.binding, 50)} = ` : ""}opened: ${entry.target}`;
    else if (entry.class === "effect") what = `E${entry.effect}  deps ${entry.deps}`;
    else if (entry.class === "callback" || entry.class === "memo") what = `body ${entry.body.slice(0, 12)}  deps ${entry.deps}`;
    else what = `${entry.binding ? `${entry.binding} = ` : ""}${entry.call}`;
    return [String(entry.index), depth + entry.kind, place(entry), entry.class === "opened" ? "" : entry.key, clip(what, 120)];
  });
  const widths = [0, 1, 2, 3].map((column) => Math.max(...rows.map((row) => row[column].length), 4));
  console.log(["#".padStart(widths[0]), "hook".padEnd(widths[1]), "where".padEnd(widths[2]), "key".padEnd(widths[3]), "what"].join("  "));
  for (const row of rows) console.log([row[0].padStart(widths[0]), row[1].padEnd(widths[1]), row[2].padEnd(widths[2]), row[3].padEnd(widths[3]), row[4]].join("  "));
  const counts = tally(listing.entries.filter((entry) => entry.class !== "opened").map((entry) => entry.kind));
  console.log(`\n${[...counts].sort((a, b) => b[1] - a[1]).map(([kind, count]) => `${count} ${kind}`).join(", ")}`);
  for (const hook of listing.unopened) console.log(`\n  note  not opened, its definition was not found: ${hook}`);
}

function readAllowList(path) {
  if (!path) return new Set();
  const json = readJson(path);
  if (!json || typeof json !== "object" || Array.isArray(json)) throw new UsageError(`${path}: expected an object`);
  for (const key of Object.keys(json)) if (key !== "moved") throw new UsageError(`${path}: unknown key "${key}" (known: moved)`);
  if (!Array.isArray(json.moved)) throw new UsageError(`${path}: "moved" must be a list`);
  return new Set(json.moved.map((item, i) => {
    const key = typeof item === "string" ? item : item?.entry;
    for (const name of Object.keys(typeof item === "string" ? {} : (item ?? {}))) {
      if (name !== "entry" && name !== "why") throw new UsageError(`${path}: moved[${i}]: unknown key "${name}"`);
    }
    if (typeof key !== "string" || !key.trim()) throw new UsageError(`${path}: moved[${i}]: expected an entry key such as "useState showEnglish"`);
    return key.trim().replace(/\s+/g, " ");
  }));
}

/** Entries on one side only, counting repeats */
function onlyIn(side, other) {
  const left = tally(other.map((entry) => entry.sig));
  return side.filter((entry) => {
    const count = left.get(entry.sig) ?? 0;
    left.set(entry.sig, count - 1);
    return count <= 0;
  });
}

/** Compares the list with the base's; prints what it finds and answers whether every check holds */
function compare(base, now, movable, strict, baseLabel) {
  let ok = true;
  const say = (verdict, text) => {
    if (verdict === "FAIL") ok = false;
    console.log(`  ${verdict.padEnd(4)}  ${text}`);
  };
  const detail = (text) => console.log(`          ${text}`);
  console.log(`\ncompared with ${baseLabel}:`);

  const ordered = (listing) => listing.entries.filter((entry) => ["effect", "state", "ref"].includes(entry.class));
  const before = ordered(base);
  const after = ordered(now);
  const counts = (entries) => ["effect", "state", "ref"].map((name) => {
    const count = entries.filter((entry) => entry.class === name).length;
    return `${count} ${name}${count === 1 ? "" : "s"}`;
  }).join(", ");

  // 1: the same effects, states and refs
  const gone = onlyIn(before, after);
  const added = onlyIn(after, before);
  if (gone.length || added.length) {
    say("FAIL", `effects, states and refs are not the base's (base: ${counts(before)}; now: ${counts(after)})`);
    for (const entry of gone) {
      detail(`only at the base:  ${describe(entry)}`);
      const twin = entry.class === "effect" && added.find((other) => other.class === "effect" && other.body === entry.body);
      if (twin) detail(`  same function, other dependency list now:  ${twin.deps}  (${place(twin)})`);
    }
    for (const entry of added) detail(`only now:          ${describe(entry)}`);
  } else {
    say("ok", `the same effects, states and refs as the base (${counts(after)})`);
    // 2: in the same order, the declared entries aside
    const fixed = (entries) => entries.filter((entry) => !movable.has(entry.key));
    const fixedBefore = fixed(before);
    const fixedAfter = fixed(after);
    const pairs = commonSubsequence(fixedBefore.map((entry) => entry.sig), fixedAfter.map((entry) => entry.sig));
    const declared = after.length - fixedAfter.length;
    if (pairs.length === fixedAfter.length) {
      say("ok", `called in the base's order${declared ? `, ${declared} declared as moved aside` : ""}`);
      // A declaration the order does not need is noise that could hide a later move: name it
      const needed = new Set(movable);
      for (const key of movable) {
        const without = (entries) => entries.filter((entry) => entry.key === key || !needed.has(entry.key)).map((entry) => entry.sig);
        if (without(before).join("\n") === without(after).join("\n")) needed.delete(key);
      }
      const spare = [...movable].filter((key) => !needed.has(key) && after.some((entry) => entry.key === key));
      if (spare.length) say("note", `declared as moved, but the order holds without: ${spare.join("; ")}`);
    } else {
      const keptNow = new Set(pairs.map(([, j]) => j));
      const keptBase = new Set(pairs.map(([i]) => i));
      const moved = fixedAfter.filter((_, j) => !keptNow.has(j));
      say("FAIL", `${moved.length} ${moved.length === 1 ? "entry is" : "entries are"} called at another place than at the base and not declared as moved`);
      const neighbour = (entries, i) => (i > 0 ? `after ${entries[i - 1].key} (${place(entries[i - 1])})` : "first");
      for (const entry of moved) {
        const was = fixedBefore.findIndex((other, i) => other.sig === entry.sig && !keptBase.has(i));
        keptBase.add(was);
        detail(describe(entry));
        detail(`  base: ${neighbour(fixedBefore, was)}`);
        detail(`  now:  ${neighbour(fixedAfter, fixedAfter.indexOf(entry))}`);
      }
      detail(`to declare ${moved.length === 1 ? "it" : "them"} as moved on purpose: { "moved": ${JSON.stringify([...new Set(moved.map((entry) => entry.key))])} }`);
    }
  }
  const known = new Set([...before, ...after].map((entry) => entry.key));
  const stale = [...movable].filter((key) => !known.has(key));
  if (stale.length) say("FAIL", `the allow-list names ${stale.length === 1 ? "an entry" : "entries"} that no effect, state or ref has: ${stale.join("; ")}`);

  // What callers hand their hooks under another name, apart from what the base already hands that way
  const handedBefore = tally(base.handed.map((item) => item.what));
  const handedNew = now.handed.filter((item) => {
    const left = handedBefore.get(item.what) ?? 0;
    handedBefore.set(item.what, left - 1);
    return left <= 0;
  });
  if (handedNew.length) {
    say("FAIL", `${handedNew.length} value${handedNew.length === 1 ? " is" : "s are"} handed to a hook under another name, which the base does not do`);
    for (const item of handedNew) detail(`${item.at}  ${item.what}`);
  } else {
    say("ok", "no value is handed to a hook under another name than at the base");
  }

  // The other hooks, as a set: their order carries no behaviour, their functions, lists and arguments do.
  // One the base has must still be there as it was; one the tree has on top is new code, which --strict refuses
  const others = (listing) => listing.entries.filter((entry) => ["callback", "memo", "other"].includes(entry.class));
  const otherGone = onlyIn(others(base), others(now));
  const otherAdded = onlyIn(others(now), others(base));
  if (otherGone.length || otherAdded.length) {
    const fails = strict || otherGone.length > 0;
    say(fails ? "FAIL" : "note", `the other hook calls differ from the base${fails ? "" : " (a hook call the base lacks is not a failure without --strict)"}`);
    for (const entry of otherGone) detail(`only at the base:  ${describe(entry)}`);
    for (const entry of otherAdded) detail(`only now:          ${describe(entry)}`);
  } else {
    say("ok", `the same ${others(now).length} other hook calls as the base (callbacks, memos, queries, mutations)`);
  }
  return ok;
}

function main(argv) {
  const { options, rest } = parseArgs(argv, {
    root: "value",
    base: "value",
    "base-dir": "value",
    component: "value",
    allow: "value",
    leaf: "list",
    strict: "flag",
    json: "flag",
  });
  if (rest.length !== 1) throw new UsageError("give one component file");
  const root = resolve(options.root ?? process.cwd());
  const path = posix.normalize((isAbsolute(rest[0]) ? relative(root, rest[0]) : rest[0]).split("\\").join("/"));
  const leaves = new Set([...DEFAULT_LEAVES, ...options.leaf]);
  const movable = readAllowList(options.allow);
  const hasBase = Boolean(options.base || options["base-dir"]);
  if (movable.size && !hasBase) throw new UsageError("--allow needs --base or --base-dir");

  const tree = openTree({ root });
  const listing = new Project(tree, leaves).list(path, options.component);
  if (options.json) console.log(JSON.stringify(listing, null, 2));
  else printList(listing, path, tree.label);

  // With --json stdout is one JSON document (it holds the name changes too) and the report goes to stderr
  const log = console.log;
  if (options.json) console.log = console.error;
  let ok = listing.problems.length === 0;
  if (ok) {
    console.log(`\n  ok    no name changes at a hook's edge`);
  } else {
    console.log(`\n  FAIL  ${listing.problems.length} name change${listing.problems.length === 1 ? "" : "s"} at a hook's edge:`);
    for (const problem of listing.problems) console.log(`          ${problem}`);
  }
  if (!hasBase) {
    for (const item of listing.handed) console.log(`  note  handed under another name (compared when a base is given): ${item.at}  ${item.what}`);
  }
  if (hasBase) {
    const baseTree = openTree({ root, rev: options.base, dir: options["base-dir"] });
    const base = new Project(baseTree, leaves).list(path, options.component ?? listing.component);
    ok = compare(base, listing, movable, options.strict, baseTree.label) && ok;
  }
  console.log(ok ? "\nOK" : "\nFAIL");
  console.log = log;
  return ok;
}

runTool("hook-order", main);
