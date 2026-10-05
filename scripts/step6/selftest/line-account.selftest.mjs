#!/usr/bin/env node
// Self-test of line-account.mjs: one file split into four, done right and then wrong in each way the tool is
// there to catch, plus the one mistake it is known not to see.
//
//   node scripts/step6/selftest/line-account.selftest.mjs [--tmp <folder>] [--keep] [--verbose]
//
// Exit 0 when every case ends as expected, 1 otherwise.

import { selfTest, swap, without } from "./harness.mjs";

const t = selfTest("line-account.mjs");

const OLD = `import { httpRouter } from "convex/server";
import { api } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
};

function jsonAction(handler) {
  return async (ctx, request) => {
    const body = await request.json();
    return new Response(JSON.stringify(await handler(ctx, body)), { headers: corsHeaders });
  };
}

// --- Rooms ---

http.route({
  path: "/api/rooms/create",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runMutation(api.rooms.createRoom, { hostName: body.hostName });
  }),
});

http.route({
  path: "/api/rooms/close",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    return await ctx.runMutation(api.rooms.closeRoom, { roomId: body.roomId });
  }),
});

// --- Messages ---

http.route({
  path: "/api/messages/send",
  method: "POST",
  handler: jsonAction(async (ctx, body) => {
    if (!body.text) return { error: "empty" };
    return await ctx.runMutation(api.messages.send, { roomId: body.roomId, text: body.text });
  }),
});

export default http;
`;

// The split: helpers gain "export", each area's routes go one level deeper into a register function
const SHARED = `const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
};

export function jsonAction(handler) {
  return async (ctx, request) => {
    const body = await request.json();
    return new Response(JSON.stringify(await handler(ctx, body)), { headers: corsHeaders });
  };
}
`;
const CREATE = `  http.route({
    path: "/api/rooms/create",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runMutation(api.rooms.createRoom, { hostName: body.hostName });
    }),
  });
`;
const CLOSE = `  http.route({
    path: "/api/rooms/close",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      return await ctx.runMutation(api.rooms.closeRoom, { roomId: body.roomId });
    }),
  });
`;
const rooms = (first, second) => `import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

// --- Rooms ---

export function registerRoomRoutes(http: HttpRouter): void {
${first}
${second}}
`;
const MESSAGES = `import { HttpRouter } from "convex/server";
import { api } from "./_generated/api";
import { jsonAction } from "./httpShared";

// --- Messages ---

export function registerMessageRoutes(http: HttpRouter): void {
  http.route({
    path: "/api/messages/send",
    method: "POST",
    handler: jsonAction(async (ctx, body) => {
      if (!body.text) return { error: "empty" };
      return await ctx.runMutation(api.messages.send, { roomId: body.roomId, text: body.text });
    }),
  });
}
`;
const HTTP = `import { httpRouter } from "convex/server";
import { registerRoomRoutes } from "./httpRooms";
import { registerMessageRoutes } from "./httpMessages";

const http = httpRouter();

registerRoomRoutes(http);
registerMessageRoutes(http);

export default http;
`;
const SPLIT = {
  "convex/http.ts": HTTP,
  "convex/httpShared.ts": SHARED,
  "convex/httpRooms.ts": rooms(CREATE, CLOSE),
  "convex/httpMessages.ts": MESSAGES,
};
const ALLOW = {
  changed: [{ old: "function jsonAction(handler) {", new: "export function jsonAction(handler) {" }],
  added: [
    { line: 'import { HttpRouter } from "convex/server";', count: 2 },
    'import { api } from "./_generated/api";',
    { line: 'import { jsonAction } from "./httpShared";', count: 2 },
    'import { registerRoomRoutes } from "./httpRooms";',
    'import { registerMessageRoutes } from "./httpMessages";',
    "export function registerRoomRoutes(http: HttpRouter): void {",
    "export function registerMessageRoutes(http: HttpRouter): void {",
    { line: "}", count: 2 },
    "registerRoomRoutes(http);",
    "registerMessageRoutes(http);",
  ],
};

const repo = t.repo({ "convex/http.ts": OLD });
const allow = t.file("allow.json", JSON.stringify(ALLOW, null, 2));
const at = (files) => t.workingTree(repo, files);
const NEW = Object.keys(SPLIT);
const account = (list = allow) => ["--base", "HEAD", "--old", "convex/http.ts", "--allow", list, ...NEW];

console.log("\na correct split");
at(SPLIT);
t.check("every line once, the allow-list's lines aside", { args: account(), cwd: repo }, { exit: 0, says: ["OK: every old line", /old non-blank lines +37\n/, /new non-blank lines +50\n/, /found unchanged +36\n/, /changed, named in the allow-list +1\n/, /added, named in the allow-list +13\n/] });
t.file("before/convex/http.ts", OLD);
t.check("the old file read from a copy of the tree instead of a commit", { args: ["--base-dir", `${t.home}/before`, "--old", "convex/http.ts", "--allow", allow, ...NEW], cwd: repo }, { exit: 0, says: ["OK: every old line"] });

console.log("\nbroken splits");
at({ ...SPLIT, "convex/httpMessages.ts": without(MESSAGES, "if (!body.text)") });
t.check("a line is dropped", { args: account(), cwd: repo }, { exit: 1, says: ["MISSING from the new files (1)", 'if (!body.text) return { error: "empty" };', "old: convex/http.ts:41"] });

at({ ...SPLIT, "convex/http.ts": swap(HTTP, "registerRoomRoutes(http);\n", `registerRoomRoutes(http);\n\n${CLOSE}`) });
t.check("a block is copied instead of moved", { args: account(), cwd: repo }, { exit: 1, says: ["EXTRA in the new files (7)", 'path: "/api/rooms/close",', "convex/http.ts:"] });

at({ ...SPLIT, "convex/httpRooms.ts": rooms(CREATE, swap(CLOSE, '"POST"', '"GET"')) });
t.check("a line is edited on the way", { args: account(), cwd: repo }, { exit: 1, says: ["MISSING from the new files (1)", 'method: "POST",', "EXTRA in the new files (1)", 'method: "GET",'] });

at({ ...SPLIT, "convex/httpRooms.ts": rooms(CREATE, swap(CLOSE, "      return await", '      if (!body.roomId) return { error: "no room" };\n      return await')) });
t.check("a line is slipped in", { args: account(), cwd: repo }, { exit: 1, says: ["EXTRA in the new files (1)", 'if (!body.roomId) return { error: "no room" };', "convex/httpRooms.ts:20"] });

at(SPLIT);
const noChanges = t.file("allow-no-changes.json", JSON.stringify({ added: ALLOW.added }));
t.check("a changed line is not in the allow-list", { args: account(noChanges), cwd: repo }, { exit: 1, says: ["MISSING from the new files (1)", "function jsonAction(handler) {", "EXTRA in the new files (1)", "export function jsonAction(handler) {"] });

const stale = t.file("allow-stale.json", JSON.stringify({ ...ALLOW, changed: [...ALLOW.changed, { old: "const corsHeaders = {", new: "export const corsHeaders = {" }] }));
t.check("the allow-list names a change that did not happen", { args: account(stale), cwd: repo }, { exit: 1, says: ["MISSING from the new files (1)", "export const corsHeaders = {", "EXTRA in the new files (1)"] });

const generous = t.file("allow-generous.json", JSON.stringify({ ...ALLOW, added: [...ALLOW.added, "}"] }));
t.check("the allow-list lists more glue than there is", { args: account(generous), cwd: repo }, { exit: 1, says: ["MISSING from the new files (1)", "expected 4, found 3"] });

const invented = t.file("allow-invented.json", JSON.stringify({ ...ALLOW, removed: ["const nothing = 1;"] }));
t.check("the allow-list names an old line that the old file does not have", { args: account(invented), cwd: repo }, { exit: 1, says: ["ALLOW-LIST names more old lines than the old file has", "the old file has 0:  const nothing = 1;"] });

t.check("no allow-list at all", { args: ["--base", "HEAD", "--old", "convex/http.ts", ...NEW], cwd: repo }, { exit: 1, says: ["EXTRA in the new files (14)"] });

console.log("\nwhat a count cannot see (web-move-check.mjs proves position)");
at({ ...SPLIT, "convex/httpRooms.ts": rooms(CLOSE, CREATE) });
t.check("two blocks swap places: the counts are equal, so this passes", { args: account(), cwd: repo }, { exit: 0, says: ["OK: every old line"] });

console.log("\nchecks that cannot run");
at(SPLIT);
t.check("an allow-list with a mistyped key", { args: account(t.file("allow-typo.json", JSON.stringify({ add: [] }))), cwd: repo }, { exit: 2, says: ['unknown key "add"'] });
t.check("a new file that does not exist", { args: [...account(), "convex/httpGames.ts"], cwd: repo }, { exit: 2, says: ["cannot read"] });
t.check("an old file that is not in the commit", { args: ["--base", "HEAD", "--old", "convex/nothing.ts", ...NEW], cwd: repo }, { exit: 2, says: ["does not exist at HEAD"] });

t.done();
