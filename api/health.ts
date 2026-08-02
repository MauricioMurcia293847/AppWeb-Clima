import type { Request, Response } from "express";
import { getRuntimeCapabilities } from "../server/config.js";
import { guardGetRequest } from "../server/httpContracts.js";
import { withObservedRequest } from "../server/observability.js";
import { applySecurityHeaders } from "../server/securityHeaders.js";

// Health check publico para confirmar que la API desplegada esta activa.
export default async function handler(request: Request, response: Response) {
  await withObservedRequest(request, response, "/api/health", () => {
    applySecurityHeaders(response);
    if (guardGetRequest(request, response)) return;

    response.json({
      capabilities: getRuntimeCapabilities(),
      ok: true,
      service: "AppWeb Clima API",
    });
  });
}
