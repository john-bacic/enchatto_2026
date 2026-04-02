#!/usr/bin/env npx tsx
/**
 * Truth or Dare — Stress Test
 *
 * Simulates a full game lifecycle against the live Convex deployment:
 *   1. Create a room + host participant
 *   2. Join N web participants
 *   3. Start heartbeats for every participant (mimics real app)
 *   4. Create a T/D game
 *   5. Run R rounds of: choose → respond → rate → advance
 *   6. End game + close room
 *
 * Logs every API call with latency, tracks p50/p95/max, and prints a summary.
 *
 * Usage:
 *   npx tsx scripts/stress-test-tod.ts                 # defaults: 4 players, 20 rounds
 *   npx tsx scripts/stress-test-tod.ts --players 8 --rounds 40 --mode deep
 *   npx tsx scripts/stress-test-tod.ts --concurrent    # concurrent ratings (stress write conflicts)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { writeFileSync } from "fs";

// ─── Config ──────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
function flag(name: string, fallback: string): string {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const NUM_PLAYERS = parseInt(flag("players", "4"), 10);
const NUM_ROUNDS = parseInt(flag("rounds", "20"), 10);
const PROMPT_MODE = flag("mode", "normal") as "normal" | "deep";
const CONCURRENT = argv.includes("--concurrent");

const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://helpful-bulldog-420.convex.cloud";
const SITE_URL =
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://helpful-bulldog-420.convex.site";

// ─── Logging ─────────────────────────────────────────────────────────────────

type LogEntry = {
  ts: number;
  action: string;
  latencyMs: number;
  ok: boolean;
  error?: string;
  detail?: string;
};

const logEntries: LogEntry[] = [];
const latencies: Record<string, number[]> = {};

function c(code: string, text: string) {
  const codes: Record<string, string> = {
    g: "\x1b[32m", r: "\x1b[31m", y: "\x1b[33m", c: "\x1b[36m",
    d: "\x1b[2m", R: "\x1b[0m", b: "\x1b[1m",
  };
  return `${codes[code] ?? ""}${text}${codes.R}`;
}

function logLine(entry: LogEntry) {
  logEntries.push(entry);
  if (!latencies[entry.action]) latencies[entry.action] = [];
  latencies[entry.action].push(entry.latencyMs);

  const status = entry.ok ? c("g", "OK  ") : c("r", "FAIL");
  const ms = entry.latencyMs.toString().padStart(5) + "ms";
  const detail = entry.detail ? c("d", ` ${entry.detail}`) : "";
  const err = entry.error ? c("r", ` ✘ ${entry.error}`) : "";
  console.log(`${c("d", new Date(entry.ts).toISOString().slice(11, 23))} ${status} ${ms}  ${entry.action}${detail}${err}`);
}

// ─── Instrumented Convex client ──────────────────────────────────────────────

const convex = new ConvexHttpClient(CONVEX_URL);

async function mut<T>(action: string, fn: () => Promise<T>, detail?: string): Promise<T> {
  const t0 = performance.now();
  let ok = true;
  let error: string | undefined;
  try {
    return await fn();
  } catch (e: any) {
    ok = false;
    error = e.message?.slice(0, 120);
    throw e;
  } finally {
    logLine({ ts: Date.now(), action, latencyMs: Math.round(performance.now() - t0), ok, error, detail });
  }
}

// HTTP POST helper (for endpoints that only exist as HTTP actions)
async function httpPost<T = any>(path: string, body: Record<string, any>, action: string, detail?: string): Promise<T> {
  const t0 = performance.now();
  let ok = true;
  let error: string | undefined;
  try {
    const res = await fetch(`${SITE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      ok = false;
      error = data.error ?? `HTTP ${res.status}`;
    }
    return data as T;
  } catch (e: any) {
    ok = false;
    error = e.message;
    throw e;
  } finally {
    logLine({ ts: Date.now(), action, latencyMs: Math.round(performance.now() - t0), ok, error, detail });
  }
}

// ─── Test drawing generator ──────────────────────────────────────────────────

/** Generate a small (~2-4 KB) PNG data URL with random colored pixels — mimics a real drawing submission */
function generateTestDrawingDataUrl(): string {
  // Minimal 50x50 PNG via raw construction
  // Use a simpler approach: create a BMP-style pixel buffer and encode to PNG manually
  // Actually, use a proper tiny PNG with zlib
  const width = 50, height = 50;

  // Build raw RGBA pixel data with random colors
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = Math.floor(Math.random() * 256);     // R
    pixels[i + 1] = Math.floor(Math.random() * 256); // G
    pixels[i + 2] = Math.floor(Math.random() * 256); // B
    pixels[i + 3] = 255;                              // A
  }

  // Build uncompressed PNG (store blocks, no compression for simplicity)
  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type: string, data: Uint8Array): Uint8Array {
    const typeBytes = new TextEncoder().encode(type);
    const length = data.length;
    const chunk = new Uint8Array(4 + 4 + length + 4);
    const view = new DataView(chunk.buffer);
    view.setUint32(0, length);
    chunk.set(typeBytes, 4);
    chunk.set(data, 8);
    // CRC over type + data
    const crcData = new Uint8Array(4 + length);
    crcData.set(typeBytes, 0);
    crcData.set(data, 4);
    view.setUint32(8 + length, crc32(crcData));
    return chunk;
  }

  // IHDR
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width);
  ihdrView.setUint32(4, height);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT — raw pixel rows with filter byte 0 (none) per row
  // Use zlib store blocks (no compression)
  const rawRows = new Uint8Array(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawRows[y * (1 + width * 4)] = 0; // filter: none
    rawRows.set(pixels.subarray(y * width * 4, (y + 1) * width * 4), y * (1 + width * 4) + 1);
  }

  // Wrap in zlib (deflate store)
  // zlib header: 0x78 0x01 (low compression)
  const blockSize = 65535;
  const blocks: Uint8Array[] = [];
  for (let offset = 0; offset < rawRows.length; offset += blockSize) {
    const end = Math.min(offset + blockSize, rawRows.length);
    const isLast = end === rawRows.length;
    const len = end - offset;
    const block = new Uint8Array(5 + len);
    block[0] = isLast ? 1 : 0;
    block[1] = len & 0xff;
    block[2] = (len >> 8) & 0xff;
    block[3] = ~len & 0xff;
    block[4] = (~len >> 8) & 0xff;
    block.set(rawRows.subarray(offset, end), 5);
    blocks.push(block);
  }

  // Adler-32 checksum
  let s1 = 1, s2 = 0;
  for (let i = 0; i < rawRows.length; i++) {
    s1 = (s1 + rawRows[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  const adler = ((s2 << 16) | s1) >>> 0;

  const totalBlockSize = blocks.reduce((s, b) => s + b.length, 0);
  const zlibData = new Uint8Array(2 + totalBlockSize + 4);
  zlibData[0] = 0x78;
  zlibData[1] = 0x01;
  let pos = 2;
  for (const block of blocks) {
    zlibData.set(block, pos);
    pos += block.length;
  }
  const adlerView = new DataView(zlibData.buffer, pos);
  adlerView.setUint32(0, adler);

  // IEND
  const iend = new Uint8Array(0);

  // Assemble PNG
  const ihdrChunk = makeChunk("IHDR", ihdr);
  const idatChunk = makeChunk("IDAT", zlibData);
  const iendChunk = makeChunk("IEND", iend);

  const png = new Uint8Array(signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length);
  let p = 0;
  png.set(signature, p); p += signature.length;
  png.set(ihdrChunk, p); p += ihdrChunk.length;
  png.set(idatChunk, p); p += idatChunk.length;
  png.set(iendChunk, p);

  // Convert to base64 data URL
  const base64 = Buffer.from(png).toString("base64");
  return `data:image/png;base64,${base64}`;
}

// ─── Avatars ─────────────────────────────────────────────────────────────────

const AVATARS = ["cat", "dog", "fox", "bear", "panda", "monkey", "owl", "penguin",
  "frog", "unicorn", "dragon", "koala", "tiger", "lion", "rabbit", "hamster"];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(c("b", "\n╔══════════════════════════════════════════════════╗"));
  console.log(c("b", "║   Truth or Dare — Stress Test                    ║"));
  console.log(c("b", "╚══════════════════════════════════════════════════╝\n"));
  console.log(`  Players: ${NUM_PLAYERS}   Rounds: ${NUM_ROUNDS}   Mode: ${PROMPT_MODE}   Concurrent: ${CONCURRENT}`);
  console.log(`  Convex:  ${CONVEX_URL}`);
  console.log(`  Site:    ${SITE_URL}\n`);
  console.log(c("d", "─".repeat(80)));

  const testStart = performance.now();

  // ── Step 1: Create room ──
  console.log(c("c", "\n▸ Step 1: Creating room..."));
  const { roomId, joinCode, hostId } = await mut("rooms/create", () =>
    convex.mutation(api.rooms.createRoom, {
      hostNickname: "StressHost",
      hostAvatarId: "dragon",
      settings: { sourceLanguage: "en", targetLanguage: "ja", romajiEnabled: true, suggestionsEnabled: true, maxParticipants: 30 },
    })
  );
  console.log(c("d", `  roomId=${roomId}  hostId=${hostId}  joinCode=${joinCode}\n`));

  // ── Step 2: Join participants ──
  console.log(c("c", `▸ Step 2: Joining ${NUM_PLAYERS - 1} web participants...`));
  const participants: { id: string; nickname: string }[] = [{ id: hostId, nickname: "StressHost" }];

  for (let i = 0; i < NUM_PLAYERS - 1; i++) {
    const nickname = `Player${i + 1}`;
    const avatar = AVATARS[(i + 1) % AVATARS.length];
    const pid = await mut("participants/join", () =>
      convex.mutation(api.participants.joinRoom, {
        roomId: roomId as Id<"rooms">,
        nickname,
        platform: "web",
        avatar: { type: "preset" as const, value: avatar },
        preferredLanguage: "en",
      }),
      nickname
    );
    participants.push({ id: pid, nickname });
  }
  console.log(c("d", `  ${participants.length} participants ready\n`));

  // ── Step 3: Start heartbeats ──
  console.log(c("c", "▸ Step 3: Starting heartbeats..."));
  const heartbeatIntervals: ReturnType<typeof setInterval>[] = [];
  for (const p of participants) {
    const iv = setInterval(async () => {
      try {
        await convex.mutation(api.participants.setParticipantOnline, {
          participantId: p.id as Id<"participants">,
          online: true,
          presence: "online",
        });
      } catch {}
    }, 10_000);
    heartbeatIntervals.push(iv);
  }
  // Fire one initial heartbeat for all
  await Promise.all(
    participants.map((p) =>
      mut("heartbeat", () =>
        convex.mutation(api.participants.setParticipantOnline, {
          participantId: p.id as Id<"participants">,
          online: true,
          presence: "online",
        }),
        p.nickname
      )
    )
  );
  console.log(c("d", `  ${participants.length} heartbeats running (10s interval)\n`));

  // ── Step 4: Create game ──
  console.log(c("c", "▸ Step 4: Creating Truth or Dare game..."));
  const gameId = await mut("tod/create", () =>
    convex.mutation(api.truthOrDare.createGame, {
      roomId: roomId as Id<"rooms">,
      hostParticipantId: hostId as Id<"participants">,
      promptMode: PROMPT_MODE,
    }),
    `mode=${PROMPT_MODE}`
  );
  console.log(c("d", `  gameId=${gameId}\n`));

  // ── Step 5: Play rounds ──
  console.log(c("c", `▸ Step 5: Playing ${NUM_ROUNDS} rounds...\n`));
  console.log(c("d", "─".repeat(80)));

  let errors = 0;
  const roundErrors: string[] = [];

  for (let round = 0; round < NUM_ROUNDS; round++) {
    const roundStart = performance.now();
    const rl = `R${String(round + 1).padStart(3)}/${NUM_ROUNDS}`;

    // Poll game state
    const state = await mut("tod/poll", () =>
      convex.query(api.truthOrDare.getActiveTruthOrDare, { roomId: roomId as Id<"rooms"> }),
      rl
    );

    if (!state || state.status !== "active") {
      console.log(c("r", `  ${rl}: Game not active (status=${state?.status}). Stopping.`));
      errors++;
      roundErrors.push(`${rl}: game not active`);
      break;
    }

    const currentPid = state.currentTurnParticipantId;
    const currentPlayer = participants.find((p) => p.id === currentPid);
    const turnStatus = state.currentTurn?.status;

    // 5a. Submit choice
    if (turnStatus === "waiting_for_choice") {
      const choice = Math.random() < 0.5 ? "truth" : "dare";
      try {
        await mut("tod/choice", () =>
          convex.mutation(api.truthOrDare.submitChoice, {
            gameId: gameId as Id<"truthOrDareGames">,
            participantId: currentPid! as Id<"participants">,
            choice: choice as "truth" | "dare",
          }),
          `${rl} ${currentPlayer?.nickname ?? "?"} → ${choice}`
        );
      } catch (e: any) {
        errors++;
        roundErrors.push(`${rl}: choice failed — ${e.message}`);
        try {
          await mut("tod/advance", () =>
            convex.mutation(api.truthOrDare.advanceTurn, {
              gameId: gameId as Id<"truthOrDareGames">,
              participantId: hostId as Id<"participants">,
            }),
            `${rl} recovery`
          );
        } catch {}
        continue;
      }
    }

    // 5b. Submit response
    const stateAfter = await mut("tod/poll", () =>
      convex.query(api.truthOrDare.getActiveTruthOrDare, { roomId: roomId as Id<"rooms"> }),
      `${rl} after-choice`
    );

    if (stateAfter?.currentTurn?.status === "waiting_for_response") {
      const responseType = stateAfter.currentTurn.promptResponseType ?? "text";
      try {
        if (responseType === "drawing") {
          // Drawing responses go through HTTP (base64 → Convex file storage → CDN URL)
          const dataUrl = generateTestDrawingDataUrl();
          const payloadKB = Math.round(dataUrl.length / 1024);
          await httpPost(
            "/api/truth-or-dare/submit-response",
            {
              gameId,
              participantId: currentPid,
              responseMediaUrl: dataUrl,
            },
            "tod/response:drawing",
            `${rl} ${currentPlayer?.nickname ?? "?"} (${payloadKB}KB)`
          );
        } else {
          // Text responses go through Convex mutation (fast, small)
          await mut("tod/response:text", () =>
            convex.mutation(api.truthOrDare.submitResponse, {
              gameId: gameId as Id<"truthOrDareGames">,
              participantId: currentPid! as Id<"participants">,
              responseText: `Stress test answer round ${round + 1}`,
            }),
            `${rl} ${currentPlayer?.nickname ?? "?"}`
          );
        }
      } catch (e: any) {
        errors++;
        roundErrors.push(`${rl}: response (${responseType}) failed — ${e.message}`);
      }
    }

    // 5c. Submit ratings
    const stateForRating = await mut("tod/poll", () =>
      convex.query(api.truthOrDare.getActiveTruthOrDare, { roomId: roomId as Id<"rooms"> }),
      `${rl} after-response`
    );
    const completedTurn = stateForRating?.currentTurn;

    if (completedTurn?.status === "completed" && completedTurn?._id) {
      const raters = participants.filter((p) => p.id !== currentPid);
      const ratingCalls = raters.map((rater) => () =>
        mut("tod/rate", () =>
          convex.mutation(api.truthOrDare.submitRating, {
            turnId: completedTurn._id as Id<"truthOrDareTurns">,
            participantId: rater.id as Id<"participants">,
            score: Math.ceil(Math.random() * 5),
          }),
          `${rl} ${rater.nickname}`
        )
      );

      if (CONCURRENT) {
        await Promise.allSettled(ratingCalls.map((fn) => fn()));
      } else {
        for (const fn of ratingCalls) {
          try { await fn(); } catch {}
        }
      }
    }

    // 5d. Advance turn
    try {
      await mut("tod/advance", () =>
        convex.mutation(api.truthOrDare.advanceTurn, {
          gameId: gameId as Id<"truthOrDareGames">,
          participantId: hostId as Id<"participants">,
        }),
        rl
      );
    } catch (e: any) {
      errors++;
      roundErrors.push(`${rl}: advance failed — ${e.message}`);
    }

    const roundMs = Math.round(performance.now() - roundStart);
    console.log(c("d", `  ──── ${rl} done in ${roundMs}ms ${errors === 0 ? c("g", "✓") : ""}`));
  }

  // ── Step 6: End game ──
  console.log(c("d", "\n" + "─".repeat(80)));
  console.log(c("c", "\n▸ Step 6: Ending game..."));
  await mut("tod/end", () =>
    convex.mutation(api.truthOrDare.endGame, {
      gameId: gameId as Id<"truthOrDareGames">,
      participantId: hostId as Id<"participants">,
    })
  );

  // ── Step 7: Close room ──
  console.log(c("c", "▸ Step 7: Closing room..."));
  await mut("rooms/close", () =>
    convex.mutation(api.rooms.closeRoom, { roomId: roomId as Id<"rooms"> })
  );

  // ── Cleanup heartbeats ──
  for (const iv of heartbeatIntervals) clearInterval(iv);

  // ── Summary ────────────────────────────────────────────────────────────────

  const totalMs = Math.round(performance.now() - testStart);
  const totalCalls = logEntries.length;
  const failures = logEntries.filter((e) => !e.ok).length;

  console.log(c("b", "\n╔══════════════════════════════════════════════════╗"));
  console.log(c("b", "║   Results                                        ║"));
  console.log(c("b", "╚══════════════════════════════════════════════════╝\n"));

  console.log(`  Total time:    ${(totalMs / 1000).toFixed(1)}s`);
  console.log(`  API calls:     ${totalCalls}`);
  console.log(`  Failures:      ${failures > 0 ? c("r", String(failures)) : c("g", "0")}`);
  console.log(`  Rounds:        ${NUM_ROUNDS}`);
  console.log(`  Players:       ${NUM_PLAYERS}`);
  console.log(`  Avg round:     ${(totalMs / NUM_ROUNDS / 1000).toFixed(2)}s`);
  console.log();

  // Latency breakdown
  console.log(c("b", "  Latency by action:"));
  console.log(`  ${"Action".padEnd(22)} ${"Count".padStart(6)} ${"p50".padStart(7)} ${"p95".padStart(7)} ${"Max".padStart(7)} ${"Avg".padStart(7)}`);
  console.log(c("d", "  " + "─".repeat(60)));

  const sortedActions = Object.keys(latencies).sort();
  for (const action of sortedActions) {
    const vals = latencies[action].sort((a, b) => a - b);
    const n = vals.length;
    const p50 = vals[Math.floor(n * 0.5)];
    const p95 = vals[Math.floor(n * 0.95)];
    const max = vals[n - 1];
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / n);
    console.log(
      `  ${action.padEnd(22)} ${String(n).padStart(6)} ${(p50 + "ms").padStart(7)} ${(p95 + "ms").padStart(7)} ${(max + "ms").padStart(7)} ${(avg + "ms").padStart(7)}`
    );
  }

  if (roundErrors.length > 0) {
    console.log(c("r", `\n  Errors (${roundErrors.length}):`));
    for (const e of roundErrors.slice(0, 20)) {
      console.log(c("r", `    • ${e}`));
    }
    if (roundErrors.length > 20) console.log(c("d", `    ... and ${roundErrors.length - 20} more`));
  }

  console.log();

  // Write full log to JSON
  const logPath = `scripts/stress-test-results-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(
    logPath,
    JSON.stringify({
      config: { players: NUM_PLAYERS, rounds: NUM_ROUNDS, mode: PROMPT_MODE, concurrent: CONCURRENT },
      summary: { totalMs, totalCalls, failures, avgRoundMs: Math.round(totalMs / NUM_ROUNDS) },
      latencies: Object.fromEntries(
        sortedActions.map((a) => {
          const vals = latencies[a].sort((x, y) => x - y);
          const n = vals.length;
          return [a, {
            count: n,
            p50: vals[Math.floor(n * 0.5)],
            p95: vals[Math.floor(n * 0.95)],
            max: vals[n - 1],
            avg: Math.round(vals.reduce((x, y) => x + y, 0) / n),
          }];
        })
      ),
      errors: roundErrors,
      log: logEntries,
    }, null, 2)
  );
  console.log(c("d", `  Full log written to ${logPath}\n`));

  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(c("r", `\nFatal: ${e.message}\n${e.stack}`));
  process.exit(2);
});
