import type { WeatherDashboardData, WeatherSummary } from "../src/types/weather.js";
import {
  aiSummaryMaxTokens,
  aiSummaryModel,
  aiSummaryTimeoutMs,
  cacheDurationMs,
} from "./config.js";
import {
  parseAnthropicText,
  parseWeatherSummaryJson,
} from "./externalValidation.js";
import { observeDependency } from "./observability.js";
import { getWeatherByCity, getWeatherByCoordinates } from "./weatherService.js";

const anthropicUrl = "https://api.anthropic.com/v1/messages";

type CacheEntry = {
  expiresAt: number;
  value: WeatherSummary;
};

// Cache independiente del de weatherService (mismo TTL, distinta clave) --
// ADR-002 en 02-arquitectura.md: fallas de la IA no deben afectar el clima.
const summaryCache = new Map<string, CacheEntry>();

function degradedSummary(): WeatherSummary {
  return {
    degraded: true,
    generatedAt: new Date().toISOString(),
    recommendation: "",
    summaryLines: ["Resumen no disponible por ahora."],
  };
}

// Solo datos ya calculados por weatherService -- nunca texto libre del
// usuario mas alla del nombre de ciudad, que ya paso por geocodificacion
// (ADR-003: superficie de prompt injection minima).
function buildUserPrompt(weather: WeatherDashboardData): string {
  return [
    `Ubicacion: ${weather.location}, ${weather.country}.`,
    `Condicion actual: ${weather.condition}.`,
    `Temperatura: ${weather.temperature} grados C, sensacion termica de ${weather.apparentTemperature} grados C.`,
    `Humedad: ${weather.humidity}%.`,
    `Viento: ${weather.windSpeed} km/h.`,
    `Probabilidad de precipitacion: ${weather.precipitation}%.`,
    `Confianza de estos datos (comparacion entre modelos climaticos): ${weather.confidence}.`,
  ].join("\n");
}

const systemPrompt = `Eres un asistente meteorológico amigable, cercano y ligeramente bromista que ayuda a alguien que está por salir de casa.
Responde SOLO con JSON valido, sin texto adicional antes o despues, exactamente con esta forma:
{"summary": ["linea 1", "linea 2"], "recommendation": "una recomendacion practica y corta"}

Reglas:
- Máximo 3 líneas en "summary", cada una una oración corta y clara.
- Usa un tono conversacional y alegre, con humor ligero cuando encaje, sin exagerar ni ocultar riesgos.
- Puedes usar expresiones cotidianas en espanol latinoamericano, pero evita modismos dificiles de entender.
- Si la confianza es "media" o "baja", menciona esa reserva en alguna linea (ej. "los modelos difieren un poco, tomalo con reserva").
- Si la confianza es "no_disponible", menciona que no se pudo comparar con un segundo modelo.
- "recommendation" es una sola oracion practica (que llevar, si usar paraguas, si es buen momento para salir) y nunca queda vacia.
- No inventes datos que no te dieron.`;

async function callAnthropic(weather: WeatherDashboardData): Promise<WeatherSummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Sin key configurada (ej. desarrollo local sin .env): no intentamos la
    // llamada. El resto de la app sigue funcionando igual (requisito no
    // funcional de 01-requerimientos.md).
    return degradedSummary();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiSummaryTimeoutMs);
  const startedAt = Date.now();
  let status: number | undefined;

  try {
    const response = await fetch(anthropicUrl, {
      body: JSON.stringify({
        max_tokens: aiSummaryMaxTokens,
        messages: [{ content: buildUserPrompt(weather), role: "user" }],
        model: aiSummaryModel,
        system: systemPrompt,
      }),
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      method: "POST",
      signal: controller.signal,
    });
    status = response.status;

    if (!response.ok) {
      throw new Error(`Anthropic respondio con estado ${response.status}.`);
    }

    const payload: unknown = await response.json();
    const parsed = parseWeatherSummaryJson(parseAnthropicText(payload));
    observeDependency("anthropic", "messages", startedAt, "success", status);

    return {
      degraded: false,
      generatedAt: new Date().toISOString(),
      recommendation: parsed.recommendation,
      summaryLines: parsed.summaryLines,
    };
  } catch {
    observeDependency("anthropic", "messages", startedAt, "error", status);
    // Timeout, red caida, JSON invalido -- lo que sea, nunca tumbamos el
    // resto de la UI por esto (ADR-002).
    return degradedSummary();
  } finally {
    clearTimeout(timeout);
  }
}

async function getSummary(
  cacheKey: string,
  weather: WeatherDashboardData,
): Promise<WeatherSummary> {
  const cached = summaryCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const summary = await callAnthropic(weather);

  // Solo cacheamos resultados reales -- una falla temporal no deberia
  // condenar la respuesta a "no disponible" por los 10 minutos completos.
  if (!summary.degraded) {
    summaryCache.set(cacheKey, {
      expiresAt: Date.now() + cacheDurationMs,
      value: summary,
    });
  }

  return summary;
}

export async function getWeatherSummaryByCity(
  city: string,
): Promise<WeatherSummary> {
  const weather = await getWeatherByCity(city);
  return getSummary(`city:${city.trim().toLowerCase()}`, weather);
}

export async function getWeatherSummaryByCoordinates(
  latitude: number,
  longitude: number,
): Promise<WeatherSummary> {
  const weather = await getWeatherByCoordinates(latitude, longitude);
  return getSummary(
    `coords:${latitude.toFixed(3)},${longitude.toFixed(3)}`,
    weather,
  );
}
