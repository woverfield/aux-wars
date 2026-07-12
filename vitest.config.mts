import { defineConfig } from "vitest/config";

// Root-level vitest config for Convex function tests (convex-test).
// Client tests have their own config in client/vite.config.js.
export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["convex/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
  },
});
