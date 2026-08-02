import type { Request, Response } from "express";
import { guardGetRequest, sendHttpResult } from "../../server/httpContracts.js";
import { withObservedRequest } from "../../server/observability.js";
import { applySecurityHeaders } from "../../server/securityHeaders.js";
import { handleCurrentWeather, type HttpQuery } from "../../server/weatherHttp.js";

// Vercel ejecuta este adaptador para consultas por coordenadas.
export default async function handler(request: Request, response: Response) {
  await withObservedRequest(request, response, "/api/weather/current", async () => {
    applySecurityHeaders(response);
    if (guardGetRequest(request, response, { rateLimit: true })) return;

    sendHttpResult(
      response,
      await handleCurrentWeather(request.query as HttpQuery),
    );
  });
}
