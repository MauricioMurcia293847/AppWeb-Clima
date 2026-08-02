import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWeatherByCity,
  WeatherApiError,
} from "../src/services/weatherService";

describe("weatherService frontend", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("usa la API local cuando responde correctamente", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          apparentTemperature: 22,
          comparison: {
            humidityDelta: 1,
            primaryProvider: "Open-Meteo Best Match",
            secondaryProvider: "Open-Meteo GFS",
            temperatureDelta: 0.5,
            windDelta: 2,
          },
          condition: "Despejado",
          confidence: "alta",
          country: "Espana",
          daily: [],
          dataSource: "backend",
          hourly: [],
          humidity: 40,
          location: "Madrid",
          markers: [],
          precipitation: 0,
          temperature: 22,
          updatedAt: "18 jun, 12:00",
          windSpeed: 8,
        }),
        { status: 200 },
      ),
    );

    const weather = await getWeatherByCity("Madrid");

    expect(weather.location).toBe("Madrid");
    expect(weather.dataSource).toBe("backend");
  });

  it("usa respaldo local cuando la API local falla", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    const weather = await getWeatherByCity("Madrid");

    expect(weather.location).toBe("Madrid");
    expect(weather.dataSource).toBe("mock");
    expect(weather.condition).toContain("respaldo local");
  });

  it.each([
    [400, "INVALID_CITY", "La ciudad no es válida."],
    [429, "RATE_LIMITED", "Espera un momento."],
  ])(
    "conserva el error HTTP %i en lugar de convertirlo en mock",
    async (status, code, message) => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ code, error: message }), { status }),
      );

      await expect(getWeatherByCity("Madrid")).rejects.toMatchObject({
        code,
        message,
        status,
      } satisfies Partial<WeatherApiError>);
    },
  );

  it("usa respaldo local ante un 502 del proveedor", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "WEATHER_UPSTREAM_FAILED",
          error: "Open-Meteo no respondió.",
        }),
        { status: 502 },
      ),
    );

    const weather = await getWeatherByCity("Madrid");

    expect(weather.dataSource).toBe("mock");
  });
});
