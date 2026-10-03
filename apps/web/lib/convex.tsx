"use client";

import { ConvexProvider, ConvexReactClient, useMutation } from "convex/react";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useCallback } from "react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
// Older iOS builds still create rooms on the previous deployment; guests reach
// those rooms with ?b=legacy (set by the join page after a lookup miss).
const LEGACY_CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_LEGACY_URL || null;

if (!CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set. Add it to .env.local");
}

const convex = new ConvexReactClient(CONVEX_URL);
const legacyConvex = LEGACY_CONVEX_URL ? new ConvexReactClient(LEGACY_CONVEX_URL) : null;

export const LEGACY_PARAM = "b";
export const LEGACY_VALUE = "legacy";
export const hasLegacyBackend = legacyConvex !== null;

export function useIsLegacyBackend(): boolean {
  const params = useSearchParams();
  return legacyConvex !== null && params.get(LEGACY_PARAM) === LEGACY_VALUE;
}

export function useConvexUrl(): string {
  return useIsLegacyBackend() ? LEGACY_CONVEX_URL! : CONVEX_URL;
}

export function useConvexSiteUrl(): string {
  return useConvexUrl().replace(".convex.cloud", ".convex.site");
}

function SelectedProvider({ children }: { children: ReactNode }) {
  const legacy = useIsLegacyBackend();
  return (
    <ConvexProvider client={legacy ? legacyConvex! : convex}>{children}</ConvexProvider>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ConvexProvider client={convex}>{children}</ConvexProvider>}>
      <SelectedProvider>{children}</SelectedProvider>
    </Suspense>
  );
}

// --- Caller token ---
// A participant id is shown to everyone in the room, so by itself it cannot say who is calling. The join page makes a
// random token, the server keeps it with the new participant, and every mutation made as that participant presents
// it. The token never goes into a URL.

/** On a room link: the join page registered a token for this participant, and the browser it was made for holds it */
export const TOKEN_PARAM = "tk";
const TOKEN_KEY = "enchatto_token_";
// Read first, and the only copy if a write to storage fails after the join: enough until the tab reloads
const tokens = new Map<string, string>();

/**
 * 32 random bytes as 64 hex characters, or undefined where the token could not be kept across a reload (storage
 * blocked). Without one the join registers nothing and the participant stays one the server knows by id alone, which
 * a reload does not break; a token held only in memory would be lost on reload and lock them out of themselves.
 */
export function newToken(): string | undefined {
  try {
    localStorage.setItem(TOKEN_KEY + "probe", "1");
    localStorage.removeItem(TOKEN_KEY + "probe");
  } catch {
    return undefined;
  }
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function saveToken(participantId: string, token: string) {
  tokens.set(participantId, token);
  try {
    localStorage.setItem(TOKEN_KEY + participantId, token);
  } catch {
    // The copy in memory serves this tab
  }
}

/** The token this browser holds for a participant, if any */
export function tokenFor(participantId: string): string | undefined {
  if (!participantId) return undefined;
  const held = tokens.get(participantId);
  if (held) return held;
  try {
    const stored = localStorage.getItem(TOKEN_KEY + participantId);
    if (stored) tokens.set(participantId, stored);
    return stored || undefined;
  } catch {
    return undefined;
  }
}

/**
 * `unknown` when a mutation's validator declares `token`; `never`, a type error at the call, when it does not.
 * A function with no validator is typed as having every key, hence the first test
 */
type DeclaresToken<Args> = string extends keyof Args ? never : "token" extends keyof Args ? unknown : never;

/**
 * useMutation for a call made as the participant in the room link (?pid=): adds the token this browser holds for them.
 * The server rejects an argument a function does not declare, so this only accepts functions that declare `token`.
 */
export function useAuthedMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation & DeclaresToken<FunctionArgs<Mutation>>
) {
  const mutate = useMutation<Mutation>(mutation) as unknown as (
    args: FunctionArgs<Mutation>
  ) => Promise<FunctionReturnType<Mutation>>;
  const participantId = useSearchParams().get("pid") ?? "";
  // Stable across renders like useMutation's own function: effects list these as dependencies.
  // The token is read at call time because storage does not exist during server render
  return useCallback(
    (args: Omit<FunctionArgs<Mutation>, "token">) =>
      mutate({ ...args, token: tokenFor(participantId) } as FunctionArgs<Mutation>),
    [mutate, participantId]
  );
}

export { convex, legacyConvex };
