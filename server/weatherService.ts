import type {
  ClimateMarker,
  ConfidenceLevel,
  DailyForecast,
  HourlyForecast,
} from "../src/types/weather";
import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
  OpenMeteoGeocodingResult,
  OpenMeteoReverseGeocodingResponse,
  WeatherApiResponse,
} from "./types";

const geocodingBaseUrl = "https://geocoding-api.open-meteo.com/v1/search";
const reverseGeocodingBaseUrl = "https://geocoding-api.open-meteo.com/v1/reverse";
const forecastBaseUrl = "https://api.open-meteo.com/v1/forecast";
const primaryForecastModel = "best_match";
const secondaryForecastModel = "gfs_global";
const cacheDurationMs = 10 * 60 * 1000;

type CacheEntry = {
  expiresAt: number;
  value: WeatherApiResponse;
};

// Cache sencillo en memoria para reducir llamadas repetidas a Open-Meteo.
const weatherCache = new Map<string, CacheEntry>();

function normalizeCityName(city: string) {
  return city.trim().toLowerCase();
}

function describeWeatherCode(code: number) {
  if (code === 0) return "Despejado";
  if ([1, 2].includes(code)) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if ([45, 48].includes(code)) return "Niebla";
  if ([51, 53, 55, 56, 57].includes(code)) return "Llovizna";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Lluvia";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Nieve";
  if ([95, 96, 99].includes(code)) return "Tormenta";

  return "Condicion variable";
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatDay(value: string, index: number) {
  if (index === 0) return "Hoy";

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function getContinent(countryCode: string) {
  const europe = ["ES", "FR", "IT", "DE", "GB", "PT", "NL"];
  const asia = ["JP", "CN", "KR", "IN", "TH", "ID"];
  const oceania = ["AU", "NZ"];
  const africa = ["EG", "ZA", "NG", "MA", "KE"];
  const southAmerica = ["BR", "AR", "CL", "CO", "PE"];

  if (europe.includes(countryCode)) return "Europa";
  if (asia.includes(countryCode)) return "Asia";
  if (oceania.includes(countryCode)) return "Oceania";
  if (africa.includes(countryCode)) return "Africa";
  if (southAmerica.includes(countryCode)) return "America";

  return "America";
}

function markerForLocation(
  location: OpenMeteoGeocodingResult,
  temperature: number,
): ClimateMarker {
  const countryCode = location.country_code.toUpperCase();

  return {
    city: location.name,
    continent: getContinent(countryCode),
    condition: "Ubicacion buscada",
    latitude: location.latitude,
    longitude: location.longitude,
    temperature,
  };
}

function buildGeocodingUrl(city: string) {
  const url = new URL(geocodingBaseUrl);
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  return url.toString();
}

function buildReverseGeocodingUrl(latitude: number, longitude: number) {
  const url = new URL(reverseGeocodingBaseUrl);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  return url.toString();
}

function buildForecastUrl(
  location: OpenMeteoGeocodingResult,
  forecastModel = primaryForecastModel,
) {
  const url = new URL(forecastBaseUrl);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("models", forecastModel);
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    ["temperature_2m", "precipitation_probability"].join(","),
  );
  url.searchParams.set(
    "daily",
    ["weather_code", "temperature_2m_max", "temperature_2m_min"].join(","),
  );
  url.searchParams.set("timezone", location.timezone || "auto");
  url.searchParams.set("forecast_days", "4");
  url.searchParams.set("forecast_hours", "6");

  return url.toString();
}

function roundDelta(value: number) {
  return Math.round(Math.abs(value) * 10) / 10;
}

function calculateConfidence(
  temperatureDelta: number,
  humidityDelta: number,
  windDelta: number,
): ConfidenceLevel {
  if (temperatureDelta <= 1 && humidityDelta <= 5 && windDelta <= 4) {
    return "alta";
  }

  if (temperatureDelta <= 3 && humidityDelta <= 12 && windDelta <= 10) {
    return "media";
  }

  return "baja";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo respondio con estado ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

async function findLocation(city: string) {
  const geocoding = await fetchJson<OpenMeteoGeocodingResponse>(
    buildGeocodingUrl(city),
  );

  const location = geocoding.results?.[0];

  if (!location) {
    throw new Error("No encontramos esa ciudad en Open-Meteo.");
  }

  return location;
}

async function findNearestLocation(latitude: number, longitude: number) {
  const geocoding = await fetchJson<OpenMeteoReverseGeocodingResponse>(
    buildReverseGeocodingUrl(latitude, longitude),
  ).catch(() => undefined);

  const location = geocoding?.results?.[0];

  if (location) {
    return {
      ...location,
      latitude,
      longitude,
    };
  }

  return {
    country: "Ubicacion actual",
    country_code: "MX",
    latitude,
    longitude,
    name: "Mi ubicacion",
    timezone: "auto",
  };
}

function buildModelComparison(
  forecast: OpenMeteoForecastResponse,
  comparisonForecast?: OpenMeteoForecastResponse,
) {
  if (!comparisonForecast) {
    return {
      primaryProvider: "Open-Meteo Best Match",
      secondaryProvider: "Modelo alternativo no disponible",
      temperatureDelta: 0,
      humidityDelta: 0,
      windDelta: 0,
    };
  }

  return {
    primaryProvider: "Open-Meteo Best Match",
    secondaryProvider: "Open-Meteo GFS",
    temperatureDelta: roundDelta(
      forecast.current.temperature_2m - comparisonForecast.current.temperature_2m,
    ),
    humidityDelta: roundDelta(
      forecast.current.relative_humidity_2m -
        comparisonForecast.current.relative_humidity_2m,
    ),
    windDelta: roundDelta(
      forecast.current.wind_speed_10m - comparisonForecast.current.wind_speed_10m,
    ),
  };
}

function mapOpenMeteoToDashboard(
  location: OpenMeteoGeocodingResult,
  forecast: OpenMeteoForecastResponse,
  comparisonForecast?: OpenMeteoForecastResponse,
): WeatherApiResponse {
  const hourly: HourlyForecast[] = forecast.hourly.time.slice(0, 6).map(
    (time, index) => ({
      rainChance: forecast.hourly.precipitation_probability?.[index] ?? 0,
      temperature: Math.round(forecast.hourly.temperature_2m[index]),
      time: new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(time)),
    }),
  );

  const daily: DailyForecast[] = forecast.daily.time.map((time, index) => ({
    condition: describeWeatherCode(forecast.daily.weather_code[index]),
    day: formatDay(time, index),
    max: Math.round(forecast.daily.temperature_2m_max[index]),
    min: Math.round(forecast.daily.temperature_2m_min[index]),
  }));

  const temperature = Math.round(forecast.current.temperature_2m);
  const apparentTemperature = Math.round(forecast.current.apparent_temperature);
  const selectedMarker = markerForLocation(location, temperature);
  const comparison = buildModelComparison(forecast, comparisonForecast);

  return {
    apparentTemperature,
    comparison,
    condition: describeWeatherCode(forecast.current.weather_code),
    confidence: calculateConfidence(
      comparison.temperatureDelta,
      comparison.humidityDelta,
      comparison.windDelta,
    ),
    country: location.country,
    dataSource: "backend",
    daily,
    hourly,
    humidity: forecast.current.relative_humidity_2m,
    location: location.name,
    markers: [selectedMarker],
    precipitation: forecast.current.precipitation,
    temperature,
    updatedAt: formatUpdatedAt(forecast.current.time),
    windSpeed: Math.round(forecast.current.wind_speed_10m),
  };
}

// Servicio principal del backend: consulta, compara, normaliza y cachea.
export async function getWeatherByCity(city: string): Promise<WeatherApiResponse> {
  const normalizedCity = normalizeCityName(city);
  const cachedWeather = weatherCache.get(normalizedCity);

  if (cachedWeather && cachedWeather.expiresAt > Date.now()) {
    return cachedWeather.value;
  }

  const location = await findLocation(city);
  const [forecast, comparisonForecast] = await Promise.all([
    fetchJson<OpenMeteoForecastResponse>(buildForecastUrl(location)),
    fetchJson<OpenMeteoForecastResponse>(
      buildForecastUrl(location, secondaryForecastModel),
    ).catch(() => undefined),
  ]);
  const weather = mapOpenMeteoToDashboard(location, forecast, comparisonForecast);

  weatherCache.set(normalizedCity, {
    expiresAt: Date.now() + cacheDurationMs,
    value: weather,
  });

  return weather;
}

export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number,
): Promise<WeatherApiResponse> {
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const cachedWeather = weatherCache.get(cacheKey);

  if (cachedWeather && cachedWeather.expiresAt > Date.now()) {
    return cachedWeather.value;
  }

  const location = await findNearestLocation(latitude, longitude);
  const [forecast, comparisonForecast] = await Promise.all([
    fetchJson<OpenMeteoForecastResponse>(buildForecastUrl(location)),
    fetchJson<OpenMeteoForecastResponse>(
      buildForecastUrl(location, secondaryForecastModel),
    ).catch(() => undefined),
  ]);
  const weather = mapOpenMeteoToDashboard(location, forecast, comparisonForecast);

  weatherCache.set(cacheKey, {
    expiresAt: Date.now() + cacheDurationMs,
    value: weather,
  });

  return weather;
}
