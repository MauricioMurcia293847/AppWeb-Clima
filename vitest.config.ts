import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    // Las pruebas de navegador pertenecen a Playwright y viven en e2e/.
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
