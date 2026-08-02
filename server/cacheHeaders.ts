import type { Response } from "express";

// Los datos se actualizan cada pocos minutos. El navegador reutiliza una
// respuesta durante 60 s y Vercel puede servirla desde el edge durante 10 min.
export const weatherCacheControl =
  "public, max-age=60, s-maxage=600, stale-while-revalidate=300";

export function applyWeatherCacheHeaders(response: Response) {
  response.setHeader("Cache-Control", weatherCacheControl);
}
