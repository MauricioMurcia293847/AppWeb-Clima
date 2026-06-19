import { defaultCity, weatherMockByCity } from "../data/weatherMock";
import type { WeatherDashboardData } from "../types/weather";

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // En Vercel la API vive en el mismo dominio que el frontend publicado.
  return import.meta.env.PROD ? window.location.origin : "http://127.0.0.1:3001";
}

const apiBaseUrl = getApiBaseUrl();

// Normaliza el texto para buscar coincidencias dentro del respaldo local.
function normalizeCityName(city: string) {
  return city.trim().toLowerCase();
}

// Lee JSON desde nuestra API y convierte errores HTTP en errores claros.
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("La API local no respondio correctamente.");
  }

  return response.json() as Promise<T>;
}

// Busca un respaldo visual cuando la API local no esta disponible.
function getMockWeather(city: string): WeatherDashboardData {
  const normalizedCity = normalizeCityName(city || defaultCity);
  const weather = weatherMockByCity[normalizedCity] ?? weatherMockByCity["ciudad juarez"];

  return {
    ...weather,
    condition: `${weather.condition} (respaldo local)`,
    dataSource: "mock",
  };
}

// El frontend ya no consulta proveedores externos: consume nuestro backend.
export async function getWeatherByCity(
  city: string,
): Promise<WeatherDashboardData> {
  try {
    const url = new URL("/api/weather/search", apiBaseUrl);
    url.searchParams.set("city", city || defaultCity);

    const weather = await fetchJson<WeatherDashboardData>(url.toString());

    return {
      ...weather,
      dataSource: "backend",
    };
  } catch {
    return getMockWeather(city);
  }
}

export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number,
): Promise<WeatherDashboardData> {
  const url = new URL("/api/weather/current", apiBaseUrl);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  const weather = await fetchJson<WeatherDashboardData>(url.toString());

  return {
    ...weather,
    dataSource: "backend",
  };
}
