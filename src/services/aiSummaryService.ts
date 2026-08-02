import type { WeatherSummary } from "../types/weather";
import { getApiBaseUrl } from "./apiConfig";

const apiBaseUrl = getApiBaseUrl();

function localDegradedFallback(): WeatherSummary {
  return {
    degraded: true,
    generatedAt: "",
    recommendation: "",
    recommendations: [],
    summaryLines: ["Resumen no disponible por ahora."],
  };
}

// Nunca lanza -- si el resumen no llega (red caida, backend abajo, lo que
// sea), el resto de la app no se entera y sigue funcionando (M2).
async function fetchSummary(url: URL): Promise<WeatherSummary> {
  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      return localDegradedFallback();
    }

    return (await response.json()) as WeatherSummary;
  } catch {
    return localDegradedFallback();
  }
}

export async function getWeatherSummaryByCity(
  city: string,
): Promise<WeatherSummary> {
  const url = new URL("/api/weather/summary", apiBaseUrl);
  url.searchParams.set("city", city);

  return fetchSummary(url);
}

export async function getWeatherSummaryByCoordinates(
  latitude: number,
  longitude: number,
): Promise<WeatherSummary> {
  const url = new URL("/api/weather/summary", apiBaseUrl);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  return fetchSummary(url);
}
