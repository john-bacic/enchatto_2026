// Makes instrumental music with the ElevenLabs Music API.
// Reads ELEVENLABS_API_KEY from apps/web/.env.local (or the environment).
//
//   node scripts/eleven-music.mjs <out-dir> <name> <seconds> <count> "<prompt>" [model]
//
// Writes <out-dir>/<name>-1.mp3, -2.mp3, … (one API call each, run in parallel).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// A key is letters, digits and underscores; anything else (quotes, a pasted terminal escape) is dropped.
const clean = (k) => k.replace(/\x1b\[20[01]~/g, "").replace(/[^A-Za-z0-9_]/g, "");

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return clean(process.env.ELEVENLABS_API_KEY);
  try {
    const env = readFileSync(join(here, "..", ".env.local"), "utf8");
    const m = env.match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (m) return clean(m[1]);
  } catch {}
  throw new Error("ELEVENLABS_API_KEY is not set (add it to apps/web/.env.local)");
}

if (process.argv[2] === "--check") {
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": apiKey() } });
  const body = await res.json().catch(() => ({}));
  console.log(res.ok ? `key OK, plan: ${body.tier}, credits used ${body.character_count}/${body.character_limit}` : `HTTP ${res.status} ${JSON.stringify(body.detail ?? body)}`);
  process.exit(res.ok ? 0 : 1);
}

const [outDir, name, seconds, count, prompt, model = "music_v2_5"] = process.argv.slice(2);
if (!prompt) {
  console.error('usage: node scripts/eleven-music.mjs <out-dir> <name> <seconds> <count> "<prompt>" [model]');
  process.exit(1);
}

const key = apiKey();
mkdirSync(outDir, { recursive: true });

async function one(i) {
  const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192", {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      music_length_ms: Math.round(Number(seconds) * 1000),
      model_id: model,
      force_instrumental: true,
    }),
  });
  if (!res.ok) throw new Error(`take ${i}: HTTP ${res.status} ${await res.text()}`);
  const file = join(outDir, `${name}-${i}.mp3`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`${file}  (song id ${res.headers.get("song-id") ?? "?"})`);
}

// Two at a time: the plan allows two requests running at once.
const takes = Array.from({ length: Number(count) }, (_, i) => i + 1);
const results = [];
for (let i = 0; i < takes.length; i += 2) {
  results.push(...(await Promise.allSettled(takes.slice(i, i + 2).map(one))));
}
for (const r of results) if (r.status === "rejected") console.error(String(r.reason.message ?? r.reason));
process.exit(results.some((r) => r.status === "rejected") ? 1 : 0);
