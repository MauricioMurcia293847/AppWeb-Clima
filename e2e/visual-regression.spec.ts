import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", saveData: true },
    });
  });
});

test("VIS-01 conserva las superficies principales del dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".hero-explore")).toHaveScreenshot("hero.webp", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });

  const assistant = page.locator(".ai-weather-guide");
  await assistant.scrollIntoViewIfNeeded();
  await expect(assistant).toHaveScreenshot("assistant.webp", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });

  const footer = page.locator(".app-footer");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toHaveScreenshot("footer.webp", {
    animations: "disabled",
    // Linux y Windows rasterizan la tipografia del footer con una diferencia
    // cercana al 2%; el resto de las superficies conserva el umbral estricto.
    maxDiffPixelRatio: 0.025,
  });
});
