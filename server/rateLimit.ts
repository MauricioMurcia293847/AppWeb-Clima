import type { Request } from "express";

const windowMs = 60 * 1000;
const maxRequestsPerWindow = 30;

// In-memory, por IP -- suficiente para el volumen de trafico de este
// proyecto (02-arquitectura.md: no se justifica Redis/Upstash todavia).
//
// Limite conocido: en el servidor Express (dev local) esto funciona bien,
// es un solo proceso de larga duracion. En las funciones serverless de
// Vercel (api/weather/*.ts) es "best effort": solo protege dentro de una
// misma instancia tibia, no entre cold starts ni entre instancias en
// paralelo. Se documenta en vez de fingir que es una proteccion perfecta.
const requestLog = new Map<string, { count: number; windowStart: number }>();
let checksSinceCleanup = 0;

export const rateLimitMessage =
  "Estas consultando muy seguido. Espera un momento e intenta de nuevo.";

export function getClientIp(request: Request): string {
  const forwarded = request.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return request.ip ?? "unknown";
}

// true = puede continuar, false = excedio el limite.
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  checksSinceCleanup += 1;

  // Evita que identificadores de clientes inactivos permanezcan para siempre.
  if (checksSinceCleanup >= 100) {
    for (const [key, value] of requestLog) {
      if (now - value.windowStart > windowMs) requestLog.delete(key);
    }
    checksSinceCleanup = 0;
  }

  const entry = requestLog.get(ip);

  if (!entry || now - entry.windowStart > windowMs) {
    requestLog.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= maxRequestsPerWindow) {
    return false;
  }

  entry.count += 1;
  return true;
}
