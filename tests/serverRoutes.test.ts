import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../server/app";

// Fixture minima valida para OpenMeteoForecastResponse (server/types.ts).
function forecastFixture(temperature: number) {
  return {
    current: {
      apparent_temperature: temperature,
      precipitation: 0,
      relative_humidity_2m: 40,
      temperature_2m: temperature,
      time: "2026-08-01T12:00",
      weather_code: 0,
      wind_speed_10m: 10,
    },
    daily: {
      temperature_2m_max: [temperature],
      temperature_2m_min: [temperature],
      time: ["2026-08-01"],
      weather_code: [0],
    },
    hourly: {
      precipitation_probability: [0],
      temperature_2m: [temperature],
      time: ["2026-08-01T12:00"],
    },
  };
}

const geocodingFixture = {
  results: [
    {
      country: "Espana",
      country_code: "ES",
      latitude: 40.42,
      longitude: -3.7,
      name: "Madrid",
      timezone: "Europe/Madrid",
    },
  ],
};

describe("server routes", () => {
  const app = createApp();

  it("responde health check", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      capabilities: { aiSummary: false },
      ok: true,
      service: "AppWeb Clima API",
    });
  });

  it("rechaza busqueda sin ciudad", async () => {
    const response = await request(app).get("/api/weather/search");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("El parametro city es requerido.");
    expect(response.body.code).toBe("INVALID_CITY");
  });

  it("rechaza una ciudad que supera el limite de entrada", async () => {
    const response = await request(app).get(
      `/api/weather/search?city=${"a".repeat(101)}`,
    );

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_CITY");
    expect(response.body.error).toMatch(/100 caracteres/i);
  });

  it("rechaza metodos distintos de GET con Allow explicito", async () => {
    const response = await request(app).post("/api/weather/search");

    expect(response.status).toBe(405);
    expect(response.headers.allow).toBe("GET");
    expect(response.body.code).toBe("METHOD_NOT_ALLOWED");
  });

  it("rechaza coordenadas fuera de rango", async () => {
    const response = await request(app).get(
      "/api/weather/current?lat=120&lon=-106.48",
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Las coordenadas estan fuera de rango.");
    expect(response.body.code).toBe("INVALID_COORDINATES");
  });

  it("rechaza un resumen ambiguo con ciudad y coordenadas", async () => {
    const response = await request(app).get(
      "/api/weather/summary?city=Madrid&lat=40.4&lon=-3.7",
    );

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_QUERY");
  });

  describe("nivel de confianza (regresion del bug de v1)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    // Ciudades distintas en cada test para no chocar con el cache en memoria
    // de weatherService (misma clave = misma respuesta cacheada 10 min).

    it("devuelve confianza real cuando ambos modelos responden", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("geocoding-api.open-meteo.com")) {
          return new Response(JSON.stringify(geocodingFixture), { status: 200 });
        }

        // Modelos con temperaturas casi iguales -> deberia dar confianza alta.
        const temperature = url.includes("models=gfs_global") ? 20.2 : 20;
        return new Response(JSON.stringify(forecastFixture(temperature)), {
          status: 200,
        });
      });

      const response = await request(app).get(
        "/api/weather/search?city=Madrid",
      );

      expect(response.status).toBe(200);
      expect(response.headers["cache-control"]).toBe(
        "public, max-age=60, s-maxage=600, stale-while-revalidate=300",
      );
      expect(response.body.confidence).toBe("alta");
      expect(response.body.comparison.secondaryProvider).toBe("Open-Meteo GFS");
    });

    it("devuelve 'no_disponible', no 'alta', cuando el segundo modelo falla", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("geocoding-api.open-meteo.com")) {
          return new Response(JSON.stringify(geocodingFixture), { status: 200 });
        }

        if (url.includes("models=gfs_global")) {
          throw new Error("Open-Meteo no respondio para el modelo secundario.");
        }

        return new Response(JSON.stringify(forecastFixture(20)), { status: 200 });
      });

      const response = await request(app).get(
        "/api/weather/search?city=Barcelona",
      );

      expect(response.status).toBe(200);
      // Antes del fix esto daba "alta" (deltas en 0 por defecto) -- justo lo
      // contrario de lo correcto cuando no hubo con que comparar.
      expect(response.body.confidence).toBe("no_disponible");
      expect(response.body.comparison.secondaryProvider).toBe(
        "Modelo alternativo no disponible",
      );
    });

    it("rechaza un pronostico primario con forma externa invalida", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("geocoding-api.open-meteo.com")) {
          return new Response(JSON.stringify(geocodingFixture), { status: 200 });
        }

        return new Response(JSON.stringify({ current: null }), { status: 200 });
      });

      const response = await request(app).get(
        "/api/weather/search?city=ValidacionExterna",
      );

      expect(response.status).toBe(502);
      expect(response.body.code).toBe("WEATHER_UPSTREAM_FAILED");
      expect(response.body.error).toMatch(/formato inválido/i);
    });
  });

  describe("resumen IA (M2)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });

    it("rechaza resumen sin city ni coordenadas", async () => {
      const response = await request(app).get("/api/weather/summary");

      expect(response.status).toBe(400);
    });

    it("responde degraded:true sin ANTHROPIC_API_KEY -- no rompe el resto de la app", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "");
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("geocoding-api.open-meteo.com")) {
          return new Response(JSON.stringify(geocodingFixture), {
            status: 200,
          });
        }

        return new Response(JSON.stringify(forecastFixture(20)), {
          status: 200,
        });
      });

      const response = await request(app).get(
        "/api/weather/summary?city=Sevilla",
      );

      expect(response.status).toBe(200);
      expect(response.body.degraded).toBe(true);
      expect(response.body.summaryLines).toEqual([
        "Resumen no disponible por ahora.",
      ]);
    });

    it("degrada una respuesta Anthropic con forma invalida", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("geocoding-api.open-meteo.com")) {
          return new Response(JSON.stringify(geocodingFixture), { status: 200 });
        }
        if (url.includes("api.open-meteo.com")) {
          return new Response(JSON.stringify(forecastFixture(21)), { status: 200 });
        }

        return new Response(JSON.stringify({ content: [{ unexpected: true }] }), {
          status: 200,
        });
      });

      const response = await request(app).get(
        "/api/weather/summary?city=AnthropicInvalido",
      );

      expect(response.status).toBe(200);
      expect(response.body.degraded).toBe(true);
    });

    it("entrega un resumen real cuando Anthropic responde con el contrato esperado", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("geocoding-api.open-meteo.com")) {
          return new Response(JSON.stringify(geocodingFixture), { status: 200 });
        }
        if (url.includes("api.open-meteo.com")) {
          return new Response(JSON.stringify(forecastFixture(22)), { status: 200 });
        }

        return new Response(
          JSON.stringify({
            content: [
              {
                text: JSON.stringify({
                  recommendation: "Lleva agua y busca un poco de sombra.",
                  summary: [
                    "La tarde viene cálida.",
                    "Los modelos están bastante alineados.",
                  ],
                }),
                type: "text",
              },
            ],
          }),
          { status: 200 },
        );
      });

      const response = await request(app).get(
        "/api/weather/summary?city=Merida",
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        degraded: false,
        recommendation: "Lleva agua y busca un poco de sombra.",
        summaryLines: [
          "La tarde viene cálida.",
          "Los modelos están bastante alineados.",
        ],
      });
    });
  });

  describe("seguridad (M4)", () => {
    it("aplica cabeceras basicas de seguridad (helmet)", async () => {
      const response = await request(app).get("/api/health");

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("bloquea con 429 despues de exceder el limite de solicitudes por IP", async () => {
      // IP de prueba (rango reservado RFC 5737) con sufijo aleatorio para no
      // chocar con otras corridas o con las demas pruebas de este archivo.
      const fakeIp = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;

      for (let i = 0; i < 30; i += 1) {
        const response = await request(app)
          .get("/api/weather/search")
          .set("X-Forwarded-For", fakeIp);

        // Sin "city" esto siempre da 400 -- lo que importa es que SI cuenta
        // contra el limite (el middleware corre antes que la validacion).
        expect(response.status).toBe(400);
      }

      const limited = await request(app)
        .get("/api/weather/search")
        .set("X-Forwarded-For", fakeIp);

      expect(limited.status).toBe(429);
      expect(limited.body.code).toBe("RATE_LIMITED");
      expect(limited.body.error).toMatch(/consultando muy seguido/i);
    });
  });
});
