import { defineConfig } from "vitest/config";

// Convex functions run in a V8 isolate, not Node: edge-runtime is the closest environment vitest offers
export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/no-network.ts"],
    // The slowest tests take about a second on a laptop. The default 5 s is too close to that on a shared CI runner
    testTimeout: 20_000,
    server: { deps: { inline: ["convex-test"] } },
  },
});
