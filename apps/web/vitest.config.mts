import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Convex functions run in a V8 isolate, not Node: edge-runtime is the closest environment vitest offers
export default defineConfig({
  // The component tests (tests/web/*.test.tsx) render the web's components: these import each other as "@/…"
  // (tsconfig paths), and tsconfig leaves their JSX for Next to compile ("preserve")
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "") } },
  esbuild: { jsx: "automatic" },
  test: {
    environment: "edge-runtime",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/no-network.ts"],
    // The slowest tests take about a second on a laptop. The default 5 s is too close to that on a shared CI runner
    testTimeout: 20_000,
    server: { deps: { inline: ["convex-test"] } },
  },
});
