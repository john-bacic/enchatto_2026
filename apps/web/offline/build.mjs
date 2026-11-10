// Builds Chatto Dash's practice screen into the files the iPhone app carries: apps/ios/Resources/DashOffline.
//   npm run build:dash-offline          writes them
//   node offline/build.mjs --check      says whether they are up to date with the web code, and exits 1 if not
// What is written: index.html, dash.js, dash.css, the avatar pictures the game draws (icons/), and built.json,
// which names every source file that went in and a hash of them all. tests/web/dash-offline.test.ts holds the
// app's copy to the web code with that hash: change the game and the test says to build this again.
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HTML, hashOf, music, pictures } from "./built.mjs";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.resolve(web, "../ios/Resources/DashOffline");
const check = process.argv.includes("--check");

const result = await build({
  entryPoints: [path.join(web, "offline/dash-practice.tsx")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["safari16"],
  jsx: "automatic",
  minify: true,
  legalComments: "none",
  alias: { "@": web },
  define: { "process.env.NODE_ENV": '"production"' },
  // Served by the app at these addresses, not part of the bundle
  external: ["/fonts/*", "/icons/*", "/music/*"],
  outdir: out,
  entryNames: "dash",
  write: false,
  metafile: true,
  logLevel: "warning",
});

// Everything of ours that went in, and the versions of what did not come from this repository
const inputs = Object.keys(result.metafile.inputs)
  .map((f) => path.relative(web, path.resolve(f)))
  .filter((f) => !f.includes("node_modules"))
  .sort();
const icons = pictures(web);
const built = { hash: hashOf(web, inputs), inputs };

if (check) {
  let kept = null;
  try {
    kept = JSON.parse(fs.readFileSync(path.join(out, "built.json"), "utf8"));
  } catch {}
  if (kept?.hash === built.hash) {
    console.log("DashOffline is up to date.");
    process.exit(0);
  }
  console.error("apps/ios/Resources/DashOffline is not built from the web code as it is now. Run: npm run build:dash-offline");
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "icons"), { recursive: true });
for (const file of result.outputFiles) fs.writeFileSync(path.join(out, path.basename(file.path)), file.contents);
fs.writeFileSync(path.join(out, "index.html"), HTML);
for (const f of icons) fs.copyFileSync(path.join(web, "public/icons", f), path.join(out, "icons", f));
fs.mkdirSync(path.join(out, "music"), { recursive: true });
for (const f of music(web)) fs.copyFileSync(path.join(web, "public/music", f), path.join(out, "music", f));
fs.writeFileSync(path.join(out, "built.json"), JSON.stringify(built, null, 1) + "\n");
const size = (f) => `${Math.round(fs.statSync(path.join(out, f)).size / 1024)} KB`;
console.log(`DashOffline: dash.js ${size("dash.js")}, dash.css ${size("dash.css")}, ${icons.length} pictures, ${inputs.length} source files`);
