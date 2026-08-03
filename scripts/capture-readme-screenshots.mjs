import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const port = 4176;
const baseUrl = `http://127.0.0.1:${port}`;
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

async function openDashboard(browser, viewport) {
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    viewport,
  });
  const page = await context.newPage();

  // El movimiento reducido estabiliza las capturas sin alterar el contenido.
  await page.addInitScript(() => {
    window.localStorage.setItem("appweb-clima:reduce-motion", "true");
  });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".hero-explore").waitFor();

  // Se acepta tanto el globo WebGL como su modo compatible. Esto permite
  // regenerar la documentacion incluso en equipos sin aceleracion grafica.
  await page.locator(".hero-globe canvas, .hero-globe .globe-fallback-earth").first().waitFor({
    state: "visible",
    timeout: 20_000,
  });
  await page.locator(".globe-skeleton").waitFor({
    state: "detached",
    timeout: 20_000,
  });
  await page.waitForTimeout(500);

  return { context, page };
}

async function captureViewport(browser, name, viewport, options = {}) {
  const { context, page } = await openDashboard(browser, viewport);
  await page.screenshot({
    fullPage: options.fullPage ?? false,
    path: path.join(outputDirectory, `${name}.${options.type ?? "png"}`),
    type: options.type ?? "png",
  });
  await context.close();
}

async function captureDashboardSections(browser, name, visibleSelectors, hiddenSelectors = []) {
  const viewport = { height: 844, width: 390 };
  const { context, page } = await openDashboard(browser, viewport);
  const dashboard = page.locator(".dashboard-content");

  for (const selector of visibleSelectors) {
    await page.locator(selector).waitFor({ state: "visible" });
  }
  await page.locator(visibleSelectors.at(-1)).scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);

  // Conservamos los componentes reales y ocultamos temporalmente los demas.
  // Asi Playwright puede capturar una composicion larga sin unir imagenes.
  await page.evaluate(
    ({ hidden, visible }) => {
      const dashboardNode = document.querySelector(".dashboard-content");
      if (!dashboardNode) throw new Error("No se encontro el dashboard.");

      for (const child of dashboardNode.children) {
        child.style.display = "none";
      }

      for (const selector of visible) {
        const selected = document.querySelector(selector);
        if (!selected) throw new Error(`No se encontro ${selector}.`);

        let directChild = selected;
        while (directChild.parentElement !== dashboardNode) {
          directChild = directChild.parentElement;
          if (!directChild) throw new Error(`No se encontro el contenedor de ${selector}.`);
        }
        directChild.style.display = "";
      }

      for (const selector of hidden) {
        const selected = document.querySelector(selector);
        if (selected) selected.style.display = "none";
      }
    },
    { hidden: hiddenSelectors, visible: visibleSelectors },
  );

  await dashboard.screenshot({
    path: path.join(outputDirectory, `${name}.png`),
  });
  await context.close();
}

await mkdir(outputDirectory, { recursive: true });

const vite = spawn(
  process.execPath,
  [viteEntry, "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
  { stdio: "ignore", windowsHide: true },
);

let browser;

try {
  await waitForServer();
  browser = await chromium.launch();
  await captureViewport(
    browser,
    "appweb-clima-desktop",
    { height: 960, width: 1440 },
    { fullPage: true, type: "webp" },
  );
  await captureViewport(browser, "appweb-clima-mobile", {
    height: 844,
    width: 390,
  });
  await captureDashboardSections(
    browser,
    "appweb-clima-mobile-forecast",
    [".metrics-grid", ".hourly-list", ".daily-panel"],
    [".comparison-panel"],
  );
  await captureDashboardSections(
    browser,
    "appweb-clima-mobile-assistant",
    [".comparison-panel", ".ai-weather-guide"],
    [".daily-panel"],
  );
} finally {
  await browser?.close();
  vite.kill();
}
