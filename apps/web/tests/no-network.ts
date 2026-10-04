import { vi } from "vitest";

// Runs before every test file. A test must never reach a real service: the functions call Anthropic, Groq and
// APNs, and they decide whether to by these keys. A test that needs a model's answer sets the key with
// vi.stubEnv and replaces fetch with vi.stubGlobal, and undoes both afterwards.
for (const name of ["ANTHROPIC_API_KEY", "GROQ_API_KEY", "APNS_KEY", "APNS_KEY_ID", "APNS_TEAM_ID"]) {
  delete process.env[name];
}
for (const name of [
  "AUTH_MODE",
  "PURGE_CLOSED_ROOMS_AFTER_DAYS",
  "EMOJI_MATCH_HIDE_CARDS",
  "LOST_IN_TRANSLATION_HIDE_ANSWER",
  "WORD_RUSH_GENERATIONS_PER_HOUR_MAX",
  "WORD_RUSH_MODEL",
]) {
  delete process.env[name];
}

globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  throw new Error(`A test made a network call to ${url}`);
};

// push.ts reaches APNs through node:http2, which the fetch guard above does not cover. A test that sets
// the APNs keys would otherwise open a real connection to Apple
vi.mock("node:http2", () => ({
  connect: (authority: string | URL) => {
    throw new Error(`A test made a network call to ${authority}`);
  },
}));
