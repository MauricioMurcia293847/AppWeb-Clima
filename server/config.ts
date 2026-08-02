// Constantes compartidas entre servicios del backend (02-arquitectura.md).

// TTL del cache en memoria, tanto para clima (weatherService) como para el
// resumen de IA (aiSummaryService) -- mismo valor, caches independientes.
export const cacheDurationMs = 10 * 60 * 1000;

// Modelo rapido/economico (ADR-003): la tarea es resumir 6-7 campos
// numericos, no requiere razonamiento profundo. Configurable por env var
// para poder ajustarlo sin tocar codigo si hace falta.
export const geminiModel = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

export const aiSummaryMaxTokens = 512;
export const aiSummaryTimeoutMs = 8000;

// Permite verificar el despliegue sin revelar la clave ni su contenido.
export function getRuntimeCapabilities() {
  return {
    aiSummary: Boolean(process.env.GEMINI_API_KEY?.trim()),
  };
}
