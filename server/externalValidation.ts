import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
  OpenMeteoGeocodingResult,
  OpenMeteoReverseGeocodingResponse,
} from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isFiniteNumber);
}

function isLocation(value: unknown): value is OpenMeteoGeocodingResult {
  if (!isRecord(value)) return false;

  return (
    typeof value.name === "string" &&
    typeof value.country === "string" &&
    typeof value.country_code === "string" &&
    isFiniteNumber(value.latitude) &&
    isFiniteNumber(value.longitude) &&
    typeof value.timezone === "string"
  );
}

function parseGeocodingPayload(
  value: unknown,
): OpenMeteoGeocodingResponse | OpenMeteoReverseGeocodingResponse {
  if (!isRecord(value)) {
    throw new Error("Open-Meteo devolvió una respuesta de ubicación inválida.");
  }

  if (value.results === undefined) return {};
  if (!Array.isArray(value.results) || !value.results.every(isLocation)) {
    throw new Error("Open-Meteo devolvió ubicaciones con formato inválido.");
  }

  return { results: value.results };
}

export function parseOpenMeteoGeocoding(
  value: unknown,
): OpenMeteoGeocodingResponse {
  return parseGeocodingPayload(value);
}

export function parseOpenMeteoReverseGeocoding(
  value: unknown,
): OpenMeteoReverseGeocodingResponse {
  return parseGeocodingPayload(value);
}

export function parseOpenMeteoForecast(
  value: unknown,
): OpenMeteoForecastResponse {
  if (!isRecord(value) || !isRecord(value.current) || !isRecord(value.hourly) || !isRecord(value.daily)) {
    throw new Error("Open-Meteo devolvió un pronóstico con formato inválido.");
  }

  const current = value.current;
  const hourly = value.hourly;
  const daily = value.daily;
  const validCurrent =
    typeof current.time === "string" &&
    isFiniteNumber(current.temperature_2m) &&
    isFiniteNumber(current.relative_humidity_2m) &&
    isFiniteNumber(current.apparent_temperature) &&
    isFiniteNumber(current.precipitation) &&
    isFiniteNumber(current.weather_code) &&
    isFiniteNumber(current.wind_speed_10m);
  const validHourly =
    isStringArray(hourly.time) &&
    isNumberArray(hourly.temperature_2m) &&
    (hourly.precipitation_probability === undefined ||
      isNumberArray(hourly.precipitation_probability)) &&
    hourly.time.length > 0 &&
    hourly.time.length === hourly.temperature_2m.length;
  const validDaily =
    isStringArray(daily.time) &&
    isNumberArray(daily.weather_code) &&
    isNumberArray(daily.temperature_2m_max) &&
    isNumberArray(daily.temperature_2m_min) &&
    daily.time.length > 0 &&
    daily.time.length === daily.weather_code.length &&
    daily.time.length === daily.temperature_2m_max.length &&
    daily.time.length === daily.temperature_2m_min.length;

  if (!validCurrent || !validHourly || !validDaily) {
    throw new Error("Open-Meteo devolvió datos meteorológicos incompletos.");
  }

  return value as unknown as OpenMeteoForecastResponse;
}

export function parseGeminiText(value: unknown): string {
  if (!isRecord(value) || !Array.isArray(value.candidates)) {
    throw new Error("Gemini devolvió una respuesta con formato inválido.");
  }

  const firstCandidate = value.candidates[0];
  if (!isRecord(firstCandidate) || !isRecord(firstCandidate.content)) {
    throw new Error("Gemini no devolvió un candidato válido.");
  }

  const { parts } = firstCandidate.content;
  if (!Array.isArray(parts)) {
    throw new Error("Gemini no devolvió contenido de texto.");
  }

  const textPart = parts.find(
    (part): part is Record<string, unknown> =>
      isRecord(part) && typeof part.text === "string",
  );
  if (!textPart || typeof textPart.text !== "string") {
    throw new Error("Gemini no devolvió contenido de texto.");
  }

  return textPart.text;
}

export function parseWeatherSummaryJson(text: string): {
  recommendation: string;
  summaryLines: string[];
} {
  const value: unknown = JSON.parse(text);
  if (!isRecord(value) || !Array.isArray(value.summary)) {
    throw new Error("La respuesta de IA no tuvo el formato esperado.");
  }

  const summaryLines = value.summary
    .filter((line): line is string => typeof line === "string")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);
  const recommendation =
    typeof value.recommendation === "string" ? value.recommendation.trim() : "";

  if (summaryLines.length === 0 || !recommendation) {
    throw new Error("La respuesta de IA quedó incompleta.");
  }

  return { recommendation, summaryLines };
}
