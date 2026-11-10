// What the iPhone app's copy of Chatto Dash's practice screen is made of besides the bundled code, and the
// hash that says which web code a copy was built from. Shared by offline/build.mjs, which writes the copy,
// and tests/web/dash-offline.test.ts, which holds the copy to the code.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Chatto Dash</title>
<link rel="stylesheet" href="/dash.css">
</head>
<body>
<div id="root"></div>
<script src="/dash.js"></script>
</body>
</html>
`;

/** The pictures the practice screen asks for by address: every avatar, and the game's own icon */
export function pictures(web) {
  return fs
    .readdirSync(path.join(web, "public/icons"))
    .filter((f) => /^av-.*\.png$/.test(f) || f === "o-shootingstar.png")
    .sort();
}

/**
 * A hash of everything a copy is built from: the source files named (paths from apps/web), the page, the
 * pictures, and the versions of the libraries bundled in with them
 */
export function hashOf(web, inputs) {
  const hash = createHash("sha256");
  for (const f of inputs) hash.update(f).update("\0").update(fs.readFileSync(path.join(web, f))).update("\0");
  hash.update(HTML);
  for (const f of pictures(web)) hash.update(f).update("\0").update(fs.readFileSync(path.join(web, "public/icons", f))).update("\0");
  for (const dep of ["three", "react", "react-dom"]) {
    const found = [path.join(web, "node_modules", dep), path.join(web, "../../node_modules", dep)].find((d) => fs.existsSync(d));
    hash.update(dep).update(JSON.parse(fs.readFileSync(path.join(found, "package.json"), "utf8")).version);
  }
  return hash.digest("hex");
}
