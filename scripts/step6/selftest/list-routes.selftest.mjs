#!/usr/bin/env node
// Self-test of list-routes.mjs: a tiny Convex router, split the way a real one is, and the splits that go wrong.
//
//   node scripts/step6/selftest/list-routes.selftest.mjs [--tmp <folder>] [--keep] [--verbose]
//
// Exit 0 when every case ends as expected, 1 otherwise.

import { selfTest, swap } from "./harness.mjs";

const t = selfTest("list-routes.mjs");

// Four written routes and two registered by a loop over a table, like the Word Rush routes of the real file
const HTTP = `import { httpRouter, httpActionGeneric } from "convex/server";
import { tableRoutes } from "./table";

const http = httpRouter();
const ok = httpActionGeneric(async () => new Response("ok"));

http.route({ path: "/api/rooms/create", method: "POST", handler: ok });
http.route({ path: "/api/rooms/close", method: "POST", handler: ok });
http.route({ path: "/api/messages/send", method: "POST", handler: ok });
http.route({ path: "/api/messages/send", method: "OPTIONS", handler: ok });

for (const name of Object.keys(tableRoutes)) {
  http.route({ path: \`/api/word-rush/\${name}\`, method: "POST", handler: ok });
}

export default http;
`;
const TABLE = `export const tableRoutes = { "create-lobby": 1, vote: 1 };
`;
const ROUTES = `OPTIONS /api/messages/send
POST /api/messages/send
POST /api/rooms/close
POST /api/rooms/create
POST /api/word-rush/create-lobby
POST /api/word-rush/vote
`;

// The same routes after a split: each area registers its own on the one router
const SPLIT = {
  "convex/table.ts": TABLE,
  "convex/httpShared.ts": `import { httpActionGeneric } from "convex/server";

export const ok = httpActionGeneric(async () => new Response("ok"));
`,
  "convex/httpRooms.ts": `import { HttpRouter } from "convex/server";
import { ok } from "./httpShared";

export function registerRoomRoutes(http: HttpRouter): void {
  http.route({ path: "/api/rooms/create", method: "POST", handler: ok });
  http.route({ path: "/api/rooms/close", method: "POST", handler: ok });
}
`,
  "convex/httpMessages.ts": `import { HttpRouter } from "convex/server";
import { ok } from "./httpShared";

export function registerMessageRoutes(http: HttpRouter): void {
  http.route({ path: "/api/messages/send", method: "POST", handler: ok });
  http.route({ path: "/api/messages/send", method: "OPTIONS", handler: ok });
}
`,
  "convex/httpWordRush.ts": `import { HttpRouter } from "convex/server";
import { ok } from "./httpShared";
import { tableRoutes } from "./table";

export function registerWordRushRoutes(http: HttpRouter): void {
  for (const name of Object.keys(tableRoutes)) {
    http.route({ path: \`/api/word-rush/\${name}\`, method: "POST", handler: ok });
  }
}
`,
  "convex/http.ts": `import { httpRouter } from "convex/server";
import { registerRoomRoutes } from "./httpRooms";
import { registerMessageRoutes } from "./httpMessages";
import { registerWordRushRoutes } from "./httpWordRush";

const http = httpRouter();

registerRoomRoutes(http);
registerMessageRoutes(http);
registerWordRushRoutes(http);

export default http;
`,
};

const repo = t.repo({ "convex/http.ts": HTTP, "convex/table.ts": TABLE });
const expected = t.file("routes.txt", ROUTES);
const at = (files) => t.workingTree(repo, files);
const list = ["--dir", "convex"];

console.log("\nthe list");
t.check("the tree before the split lists its six routes, the looped ones too", { args: list, cwd: repo }, { exit: 0, stdout: ROUTES, says: ["6 routes (1 OPTIONS, 5 POST)"] });
t.check("the same list compared with a file", { args: [...list, "--expect", expected], cwd: repo }, { exit: 0, says: ["OK: the same 6 routes"] });

console.log("\na correct split");
at(SPLIT);
t.check("the split tree lists the same routes as the commit", { args: [...list, "--same-as", "HEAD"], cwd: repo }, { exit: 0, stdout: ROUTES, says: ["OK: the same 6 routes"] });
t.check("--rev reads the commit, not the split files on disk", { args: [...list, "--rev", "HEAD"], cwd: repo }, { exit: 0, stdout: ROUTES });

console.log("\nbroken splits");
at({ ...SPLIT, "convex/http.ts": SPLIT["convex/http.ts"].replace("registerMessageRoutes(http);\n", "") });
t.check("an area's register function is never called", { args: [...list, "--same-as", "HEAD"], cwd: repo }, { exit: 1, says: ["missing now: POST /api/messages/send", "missing now: OPTIONS /api/messages/send"] });

at({ ...SPLIT, "convex/httpRooms.ts": swap(SPLIT["convex/httpRooms.ts"], "/api/rooms/close", "/api/rooms/shut") });
t.check("a route is renamed", { args: [...list, "--same-as", "HEAD"], cwd: repo }, { exit: 1, says: ["missing now: POST /api/rooms/close", "not in the reference: POST /api/rooms/shut"] });

at({ ...SPLIT, "convex/httpMessages.ts": swap(SPLIT["convex/httpMessages.ts"], '"OPTIONS"', '"GET"') });
t.check("a route's method changes", { args: [...list, "--expect", expected], cwd: repo }, { exit: 1, says: ["missing now: OPTIONS /api/messages/send", "not in the reference: GET /api/messages/send"] });

at({ ...SPLIT, "convex/table.ts": `export const tableRoutes = { "create-lobby": 1 };\n` });
t.check("a route registered by the loop is lost", { args: [...list, "--same-as", "HEAD"], cwd: repo }, { exit: 1, says: ["missing now: POST /api/word-rush/vote"] });

const added = swap(SPLIT["convex/httpRooms.ts"], "}\n", '  http.route({ path: "/api/rooms/snapshot", method: "POST", handler: ok });\n}\n');
at({ ...SPLIT, "convex/httpRooms.ts": added });
t.check("a route is added", { args: [...list, "--same-as", "HEAD"], cwd: repo }, { exit: 1, says: ["not in the reference: POST /api/rooms/snapshot"] });
t.check("the added route, declared with --plus", { args: [...list, "--same-as", "HEAD", "--plus", "POST /api/rooms/snapshot"], cwd: repo }, { exit: 0, says: ["OK: the same 7 routes", "plus 1"] });

console.log("\ntrees that cannot be listed");
at({ ...SPLIT, "convex/httpWordRush.ts": undefined });
t.check("http.ts imports a file that is not there", { args: list, cwd: repo }, { exit: 2, says: ["does not bundle", "./httpWordRush"] });

at({ ...SPLIT, "convex/httpMessages.ts": swap(SPLIT["convex/httpMessages.ts"], '"OPTIONS"', '"POST"') });
t.check("a route is registered twice, which the router refuses", { args: list, cwd: repo }, { exit: 2, says: ["throws when it is loaded"] });

at({ "convex/table.ts": TABLE });
t.check("there is no http.ts", { args: list, cwd: repo }, { exit: 2, says: ["no convex/http.ts"] });

t.done();
