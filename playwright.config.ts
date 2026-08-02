import { defineConfig, devices } from "@playwright/test";
import process from "node:process";

const isCi = Boolean(process.env.CI);

// Playwright levanta Vite automaticamente para que la misma suite funcione
// tanto en la computadora local como en GitHub Actions.
export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate:
    "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  // El globo usa WebGL. Dos contextos simultaneos bastan para cubrir ambos
  // viewports sin saturar la GPU virtual de los runners de CI.
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : 2,
  reporter: isCi
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "firefox-desktop",
      testMatch: /cross-browser\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit-desktop",
      testMatch: /cross-browser\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    reuseExistingServer: !isCi,
    timeout: 120_000,
    url: "http://127.0.0.1:5173",
  },
});
