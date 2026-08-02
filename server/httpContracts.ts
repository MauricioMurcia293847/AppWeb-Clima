import type { Request, Response } from "express";
import { applyWeatherCacheHeaders } from "./cacheHeaders";
import { checkRateLimit, getClientIp, rateLimitMessage } from "./rateLimit";

export type ApiErrorCode =
  | "INVALID_CITY"
  | "INVALID_COORDINATES"
  | "INVALID_QUERY"
  | "METHOD_NOT_ALLOWED"
  | "RATE_LIMITED"
  | "WEATHER_UPSTREAM_FAILED"
  | "SUMMARY_UPSTREAM_FAILED";

export type ApiErrorBody = {
  code: ApiErrorCode;
  error: string;
};

export type HttpResult<T> = {
  body: T | ApiErrorBody;
  cacheWeather?: boolean;
  status: number;
};

// Mantiene el contrato de error anterior (`error`) y agrega un codigo estable
// para que el cliente no dependa de comparar mensajes traducidos.
export function errorResult(
  status: number,
  code: ApiErrorCode,
  error: string,
): HttpResult<never> {
  return { body: { code, error }, status };
}

export function successResult<T>(
  body: T,
  options: { cacheWeather?: boolean } = {},
): HttpResult<T> {
  return { body, cacheWeather: options.cacheWeather, status: 200 };
}

// Un unico traductor HTTP evita que Express y Vercel apliquen cache/status de
// forma distinta aun cuando ambos consumen el mismo caso de uso.
export function sendHttpResult<T>(
  response: Response,
  result: HttpResult<T>,
): void {
  if (result.cacheWeather && result.status >= 200 && result.status < 300) {
    applyWeatherCacheHeaders(response);
  }

  response.status(result.status).json(result.body);
}

// Retorna true cuando la peticion ya fue respondida y el adaptador debe parar.
export function guardGetRequest(
  request: Request,
  response: Response,
  options: { rateLimit?: boolean } = {},
): boolean {
  if (request.method.toUpperCase() !== "GET") {
    response.setHeader("Allow", "GET");
    sendHttpResult(
      response,
      errorResult(
        405,
        "METHOD_NOT_ALLOWED",
        "Este endpoint solo acepta solicitudes GET.",
      ),
    );
    return true;
  }

  if (options.rateLimit && !checkRateLimit(getClientIp(request))) {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Retry-After", "60");
    sendHttpResult(
      response,
      errorResult(429, "RATE_LIMITED", rateLimitMessage),
    );
    return true;
  }

  return false;
}
