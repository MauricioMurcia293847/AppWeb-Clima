import type { Request, Response } from "express";

// Health check publico para confirmar que la API desplegada esta activa.
export default function handler(_request: Request, response: Response) {
  response.json({
    ok: true,
    service: "AppWeb Clima API",
  });
}
