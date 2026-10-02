"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useSearchParams } from "next/navigation";
import { ReactNode, Suspense } from "react";

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

export { convex, legacyConvex };
