import { expect, test, type Page, type Route } from "@playwright/test";
import type { WeatherDashboardData, WeatherSummary } from "../src/types/weather";

const madridWeather: WeatherDashboardData = {
  location: "Madrid",
  country: "España",
  dataSource: "backend",
  updatedAt: "01 ago, 08:00 p.m.",
  condition: "Despejado",
  temperature: 27,
  apparentTemperature: 28,
  humidity: 35,
  windSpeed: 12,
  precipitation: 5,
  confidence: "alta",
  comparison: {
    primaryProvider: "Open-Meteo",
    secondaryProvider: "Modelo secundario",
    temperatureDelta: 0.4,
    humidityDelta: 2,
    windDelta: 1.1,
  },
  hourly: [
    { time: "20:00", temperature: 27, rainChance: 5 },
    { time: "21:00", temperature: 26, rainChance: 4 },
    { time: "22:00", temperature: 25, rainChance: 3 },
    { time: "23:00", temperature: 24, rainChance: 2 },
  ],
  daily: [
    { day: "Hoy", min: 19, max: 28, condition: "Despejado" },
    { day: "Dom", min: 18, max: 27, condition: "Nubes leves" },
    { day: "Lun", min: 17, max: 26, condition: "Soleado" },
  ],
  markers: [
    {
      city: "Madrid",
      continent: "Europa",
      temperature: 27,
      condition: "Despejado",
      latitude: 40.4168,
      longitude: -3.7038,
    },
  ],
};

const coordinateWeather: WeatherDashboardData = {
  ...madridWeather,
  location: "Ciudad de México",
  country: "México",
  temperature: 22,
  markers: [
    {
      city: "Ciudad de México",
      continent: "América",
      temperature: 22,
      condition: "Nubes leves",
      latitude: 19.4326,
      longitude: -99.1332,
    },
  ],
};

const weatherSummary: WeatherSummary = {
  degraded: false,
  generatedAt: "2026-08-01T20:00:00.000Z",
  recommendation: "Lleva agua y proteccion solar.",
  recommendations: [
    "Lleva agua y proteccion solar.",
    "Busca sombra durante las horas de mayor calor.",
    "Usa ropa ligera para mantenerte fresco.",
  ],
  summaryLines: ["Tarde despejada y templada.", "La lluvia es poco probable."],
};

async function fulfillJson(route: Route, body: unknown) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json" });
}

async function mockSummary(page: Page) {
  await page.route("**/api/weather/summary**", (route) =>
    fulfillJson(route, weatherSummary),
  );
}

test.beforeEach(async ({ page }) => {
  // Los recorridos funcionales usan la vista mundial estatica. Evitamos crear
  // varios contextos WebGL simultaneos, algo costoso y poco estable en CI.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", saveData: true },
    });
  });
});

test("E2E-01 muestra el dashboard inicial y mantiene el globo dentro del viewport", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Ciudad Juárez" })).toBeVisible();
  await expect(page.getByRole("search", { name: "Buscar ciudad" })).toBeVisible();
  await expect(page.locator(".hero-globe")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Tu guía inteligente para salir preparado" }),
  ).toBeVisible();
  await expect(page.getByText(/Consejo alternativo basado/)).toBeVisible();
  await page.getByRole("button", { name: "Otro consejo" }).click();
  await expect(page.getByText(/El sol viene con ganas/)).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const globeBox = await page.locator(".hero-globe").boundingBox();
  const viewport = page.viewportSize();
  expect(globeBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  const visibleLeft = Math.max(0, globeBox!.x);
  const visibleRight = Math.min(viewport!.width, globeBox!.x + globeBox!.width);
  const visibleRatio = (visibleRight - visibleLeft) / globeBox!.width;
  expect(visibleRatio).toBeGreaterThanOrEqual(0.85);
});

test("E2E-02 busca una ciudad y presenta datos en vivo", async ({ page }) => {
  await page.route("**/api/weather/search**", (route) =>
    fulfillJson(route, madridWeather),
  );
  await mockSummary(page);
  await page.goto("/");

  await page.getByRole("searchbox", { name: "Nombre de la ciudad" }).fill("Madrid");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Madrid" })).toBeVisible();
  await expect(page.getByText("Clima en tiempo real.", { exact: true })).toBeVisible();
  await expect(page.getByText("Tarde despejada y templada.")).toBeVisible();
  await expect(page.getByText("Lleva agua y proteccion solar.")).toBeVisible();
  await page.getByRole("button", { name: "Otro consejo" }).click();
  await expect(
    page.getByText("Busca sombra durante las horas de mayor calor."),
  ).toBeVisible();
  await expect(
    page.getByText("Consejos generados por Gemini con el clima actual."),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Recientes" })
      .getByRole("button", { name: "Madrid", exact: true }),
  ).toBeVisible();
});

test("E2E-03 conserva un respaldo util cuando la API no responde", async ({ page }) => {
  await page.route("**/api/weather/search**", (route) => route.abort("failed"));
  await page.goto("/");

  await page.getByRole("searchbox", { name: "Nombre de la ciudad" }).fill("Madrid");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Madrid" })).toBeVisible();
  await expect(page.getByText("Mostrando respaldo local.", { exact: true })).toBeVisible();
  await expect(page.locator(".hero-weather > p")).toContainText("respaldo local");
});

test("E2E-10 conserva el rate limit como error y no lo disfraza de respaldo", async ({
  page,
}) => {
  await page.route("**/api/weather/search**", (route) =>
    route.fulfill({
      body: JSON.stringify({
        code: "RATE_LIMITED",
        error: "Estas consultando muy seguido. Espera un momento e intenta de nuevo.",
      }),
      contentType: "application/json",
      status: 429,
    }),
  );
  await page.goto("/");

  await page.getByRole("searchbox", { name: "Nombre de la ciudad" }).fill("Madrid");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();

  await expect(page.getByRole("alert")).toContainText("consultando muy seguido");
  await expect(page.getByText("Mostrando respaldo local.", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 1, name: "Ciudad Juárez" }),
  ).toBeVisible();
});

test("E2E-04 consulta coordenadas sin recortar el explorador mundial", async ({ page }) => {
  await page.route("**/api/weather/current**", (route) =>
    fulfillJson(route, coordinateWeather),
  );
  await mockSummary(page);
  await page.goto("/");

  await page.getByText("Buscar por coordenadas", { exact: true }).click();
  await page.getByLabel("Latitud").fill("19.4326");
  await page.getByLabel("Longitud").fill("-99.1332");
  await page.getByRole("button", { name: "Consultar coordenadas" }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Ciudad de México" }),
  ).toBeVisible();
  await expect(page.getByText("Clima en tiempo real.", { exact: true })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("E2E-05 explica como continuar cuando se rechaza la geolocalizacion", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: unknown,
          error: (positionError: { code: number; message: string }) => void,
        ) => error({ code: 1, message: "Permission denied" }),
      },
    });
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Mi ubicación" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "No pudimos acceder a tu ubicación",
  );
  await expect(page.getByRole("searchbox", { name: "Nombre de la ciudad" })).toBeEnabled();
});

test("E2E-06 conserva una ciudad favorita despues de recargar", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Guardar favorito" }).click();
  await expect(page.getByRole("button", { name: "Guardada" })).toBeVisible();
  await page.reload();

  await expect(page.getByRole("button", { name: "Guardada" })).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Favoritos" })
      .getByRole("button", { name: "Ciudad Juárez", exact: true }),
  ).toBeVisible();
});

test("E2E-07 muestra creditos y explica el uso de datos", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("© 2026 AppWeb Clima", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Créditos" }).click();
  await expect(page.getByRole("dialog", { name: "Créditos" })).toContainText(
    "Mauricio Murcia",
  );
  await page.getByRole("button", { name: "Cerrar" }).click();

  await page.getByRole("button", { name: "Privacidad" }).click();
  await expect(page.getByRole("dialog", { name: "Privacidad" })).toContainText(
    "almacenamiento local",
  );
  await page.getByRole("button", { name: "Cerrar" }).click();

  await page.getByRole("button", { name: "Uso responsable" }).click();
  const responsibleDialog = page.getByRole("dialog", { name: "Uso responsable" });
  await expect(responsibleDialog).toContainText("información orientativa");
  await expect(responsibleDialog).toContainText("autoridades meteorológicas");
  await expect(responsibleDialog).toContainText("no sustituyen avisos oficiales");
  await page.getByRole("button", { name: "Cerrar" }).click();
});

test("E2E-11 borra solo los datos locales de AppWeb Clima", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("otra-app:preferencia", "conservar");
  });

  await page.getByRole("button", { name: "Guardar favorito" }).click();
  await page.getByRole("checkbox", { name: "Reducir animaciones" }).check();
  await page.getByRole("button", { name: "Privacidad" }).click();
  await page.getByRole("button", { name: "Borrar datos locales" }).click();

  const confirmation = page.getByRole("dialog", {
    name: "¿Borrar los datos locales?",
  });
  await expect(confirmation).toContainText("Esta acción no se puede deshacer");
  await confirmation.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("dialog", { name: "Privacidad" })).toBeVisible();

  await page.getByRole("button", { name: "Borrar datos locales" }).click();
  await page.getByRole("button", { name: "Sí, borrar" }).click();
  await expect(page.getByText("Datos locales borrados correctamente.")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar" }).click();

  await expect(page.getByText("Aún no hay favoritos.")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Reducir animaciones" })).not.toBeChecked();
  await expect.poll(async () =>
    page.evaluate(() => ({
      favorite: window.localStorage.getItem("appweb-clima:favorite-locations"),
      foreign: window.localStorage.getItem("otra-app:preferencia"),
      motion: window.localStorage.getItem("appweb-clima:reduce-motion"),
      recent: window.localStorage.getItem("appweb-clima:recent-locations"),
    })),
  ).toEqual({ favorite: null, foreign: "conservar", motion: null, recent: null });
});

test("E2E-09 conserva la preferencia de reducir animaciones", async ({ page }) => {
  await page.goto("/");

  const preference = page.getByRole("checkbox", { name: "Reducir animaciones" });
  await preference.check();
  await expect(preference).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "true");

  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Reducir animaciones" })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "true");
});

test("E2E-12 permite reactivar animaciones aunque el sistema las reduzca", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const preference = page.getByRole("checkbox", { name: "Reducir animaciones" });
  await expect(preference).toBeChecked();

  await preference.uncheck();

  await expect(preference).not.toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "false");
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("appweb-clima:reduce-motion"),
      ),
    )
    .toBe("false");
});

test("E2E-13 conserva movimiento y recorrido cuando WebGL no esta disponible", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(
      contextId: string,
      ...args: unknown[]
    ) {
      if (["webgl", "webgl2", "experimental-webgl"].includes(contextId)) {
        return null;
      }
      return originalGetContext.call(this, contextId, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.route("**/api/weather/search**", (route) =>
    fulfillJson(route, coordinateWeather),
  );
  await mockSummary(page);
  await page.goto("/");

  const fallbackImage = page.locator(".globe-fallback-earth img");
  await expect(page.locator(".hero-globe canvas")).toHaveCount(0);
  await expect(page.getByText("Modo compatible animado")).toBeVisible();

  const ambientStart = await fallbackImage.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.waitForTimeout(700);
  const ambientEnd = await fallbackImage.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  expect(ambientEnd).not.toBe(ambientStart);

  await page.getByRole("searchbox", { name: "Nombre de la ciudad" }).fill("Ciudad de México");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Ciudad de México" }),
  ).toBeVisible();

  const readPosition = () =>
    fallbackImage.evaluate((element) => getComputedStyle(element).objectPosition);
  const focusStart = await readPosition();
  await page.waitForTimeout(550);
  const focusMiddle = await readPosition();
  await page.waitForTimeout(1900);
  const focusEnd = await readPosition();

  expect(new Set([focusStart, focusMiddle, focusEnd]).size).toBe(3);
  await expect(page.locator(".globe-fallback-marker")).toHaveAttribute(
    "title",
    "Ciudad de México",
  );
});
