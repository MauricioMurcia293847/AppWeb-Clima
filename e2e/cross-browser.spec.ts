import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // La vista estatica evita que WebGL o diferencias de GPU oculten problemas
  // reales de compatibilidad entre los motores del navegador.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", saveData: true },
    });
  });
});

test("E2E-08 conserva el recorrido principal entre navegadores", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Ciudad Juárez" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Tu guía inteligente para salir preparado" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Otro consejo" }).click();
  await expect(page.getByText(/El sol viene con ganas/)).toBeVisible();

  await page.getByRole("button", { name: "Privacidad" }).click();
  await expect(page.getByRole("dialog", { name: "Privacidad" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar" }).click();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
