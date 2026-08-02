import type { WeatherDashboardData, WeatherSummary } from "../src/types/weather.js";
import {
  getWeatherSummaryByCity,
  getWeatherSummaryByCoordinates,
} from "./aiSummaryService.js";
import {
  errorResult,
  successResult,
  type HttpResult,
} from "./httpContracts.js";
import { getWeatherByCity, getWeatherByCoordinates } from "./weatherService.js";

export type HttpQuery = Record<string, unknown>;

export const maxCityLength = 100;

type ValidatedCity = { ok: true; value: string } | { ok: false; result: HttpResult<never> };
type ValidatedCoordinates =
  | { latitude: number; longitude: number; ok: true }
  | { ok: false; result: HttpResult<never> };

function validateCity(value: unknown): ValidatedCity {
  if (typeof value !== "string" || !value.trim()) {
    return {
      ok: false,
      result: errorResult(400, "INVALID_CITY", "El parametro city es requerido."),
    };
  }

  const city = value.trim();
  if (city.length > maxCityLength) {
    return {
      ok: false,
      result: errorResult(
        400,
        "INVALID_CITY",
        `El parametro city no puede exceder ${maxCityLength} caracteres.`,
      ),
    };
  }

  return { ok: true, value: city };
}

function validateCoordinates(query: HttpQuery): ValidatedCoordinates {
  const latitude = Number(query.lat);
  const longitude = Number(query.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      ok: false,
      result: errorResult(
        400,
        "INVALID_COORDINATES",
        "Los parametros lat y lon son requeridos.",
      ),
    };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return {
      ok: false,
      result: errorResult(
        400,
        "INVALID_COORDINATES",
        "Las coordenadas estan fuera de rango.",
      ),
    };
  }

  return { latitude, longitude, ok: true };
}

function upstreamMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function handleWeatherSearch(
  query: HttpQuery,
): Promise<HttpResult<WeatherDashboardData>> {
  const city = validateCity(query.city);
  if (!city.ok) return city.result;

  try {
    const weather = await getWeatherByCity(city.value);
    return successResult(weather, { cacheWeather: true });
  } catch (error) {
    return errorResult(
      502,
      "WEATHER_UPSTREAM_FAILED",
      upstreamMessage(error, "No pudimos consultar el clima en este momento."),
    );
  }
}

export async function handleCurrentWeather(
  query: HttpQuery,
): Promise<HttpResult<WeatherDashboardData>> {
  const coordinates = validateCoordinates(query);
  if (!coordinates.ok) return coordinates.result;

  try {
    const weather = await getWeatherByCoordinates(
      coordinates.latitude,
      coordinates.longitude,
    );
    return successResult(weather, { cacheWeather: true });
  } catch (error) {
    return errorResult(
      502,
      "WEATHER_UPSTREAM_FAILED",
      upstreamMessage(error, "No pudimos consultar el clima de tu ubicación."),
    );
  }
}

export async function handleWeatherSummary(
  query: HttpQuery,
): Promise<HttpResult<WeatherSummary>> {
  const hasCity = query.city !== undefined;
  const hasCoordinates = query.lat !== undefined || query.lon !== undefined;

  if (hasCity && hasCoordinates) {
    return errorResult(
      400,
      "INVALID_QUERY",
      "Usa city o lat y lon, pero no ambos al mismo tiempo.",
    );
  }

  try {
    if (hasCity) {
      const city = validateCity(query.city);
      if (!city.ok) return city.result;
      return successResult(await getWeatherSummaryByCity(city.value));
    }

    if (hasCoordinates) {
      const coordinates = validateCoordinates(query);
      if (!coordinates.ok) return coordinates.result;
      return successResult(
        await getWeatherSummaryByCoordinates(
          coordinates.latitude,
          coordinates.longitude,
        ),
      );
    }

    return errorResult(
      400,
      "INVALID_QUERY",
      "Se requiere el parametro city o los parametros lat y lon.",
    );
  } catch (error) {
    return errorResult(
      502,
      "SUMMARY_UPSTREAM_FAILED",
      upstreamMessage(error, "No pudimos generar el resumen del clima."),
    );
  }
}
