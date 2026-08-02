import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:5173";
const outputDirectory = path.resolve("docs", "screenshots");
const viteEntry = path.resolve("node_modules", "vite", "bin", "vite.js");

async function waitForServer() {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Vite todavia esta iniciando.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Vite no estuvo disponible a tiempo para crear las capturas.");
}

async function capture(
  browser,
  name,
  viewport,
  { fullPage = true, type = "webp" } = {},
) {
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    viewport,
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.localStorage.setItem("appweb-clima:reduce-motion", "true");
  });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".hero-explore").waitFor();

  // El globo se carga cuando el navegador queda libre. Esperar al canvas y
  // al retiro del esqueleto evita documentar su estado transitorio.
  await page.locator(".globe-shell canvas").waitFor({
    state: "visible",
    timeout: 20_000,
  });
  await page.locator(".globe-skeleton").waitFor({
    state: "detached",
    timeout: 20_000,
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    fullPage,
    path: path.join(outputDirectory, `${name}.${type}`),
    type,
  });
  await context.close();
}

await mkdir(outputDirectory, { recursive: true });

const vite = spawn(
  process.execPath,
  [viteEntry, "--host", "127.0.0.1", "--port", "5173", "--strictPort"],
  { stdio: "ignore", windowsHide: true },
);

let browser;

try {
  await waitForServer();
  browser = await chromium.launch();
  await capture(browser, "appweb-clima-desktop", { height: 960, width: 1440 });
  await capture(
    browser,
    "appweb-clima-mobile",
    { height: 844, width: 390 },
    { fullPage: false, type: "png" },
  );
} finally {
  await browser?.close();
  vite.kill();
}
