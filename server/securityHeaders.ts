import type { Response } from "express";

// Cabeceras basicas de seguridad para las funciones serverless de Vercel
// (api/weather/*.ts), que no pasan por el Express app de server/app.ts y por
// lo tanto no reciben el middleware de helmet. Es el mismo conjunto de
// cabeceras que helmet aplicaria por defecto, puestas a mano para no
// depender de una libreria extra en cada funcion aislada.
export function applySecurityHeaders(response: Response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
}
