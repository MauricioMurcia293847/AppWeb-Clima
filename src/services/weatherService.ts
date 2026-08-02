import { defaultCity, weatherMockByCity } from "../data/weatherMock";
import type { WeatherDashboardData } from "../types/weather";
import { getApiBaseUrl } from "./apiConfig";

const apiBaseUrl = getApiBaseUrl();

type ApiErrorBody = {
  code?: string;
  error?: string;
};

// El estado HTTP y el codigo sobreviven hasta App; asi un 400 o 429 no se
// confunde con una caida de proveedor que si admite respaldo visual.
export class WeatherApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "WeatherApiError";
    this.code = code;
    this.status = status;
  }
}

// Normaliza el texto para buscar coincidencias dentro del respaldo local.
function normalizeCityName(city: string) {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Lee JSON desde nuestra API y convierte errores HTTP en errores claros.
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    // El backend ya manda un mensaje especifico (400 de validacion, 429 de
    // rate limit, etc.) -- antes se descartaba y siempre se mostraba un
    // texto generico, así que un 429 nunca le decía al usuario que era eso.
    const errorBody = await response
      .json()
      .then((body: ApiErrorBody) => body)
      .catch(() => ({} as ApiErrorBody));

    throw new WeatherApiError(
      errorBody.error ?? "La API local no respondio correctamente.",
      response.status,
      errorBody.code,
    );
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
  } catch (error) {
    // Errores del usuario o rate limit deben llegar intactos a la interfaz.
    // Solo red/5xx usan mock porque representan indisponibilidad recuperable.
    if (error instanceof WeatherApiError && error.status < 500) {
      throw error;
    }

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
