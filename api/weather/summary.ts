import type { Request, Response } from "express";
import { guardGetRequest, sendHttpResult } from "../../server/httpContracts.js";
import { withObservedRequest } from "../../server/observability.js";
import { applySecurityHeaders } from "../../server/securityHeaders.js";
import { handleWeatherSummary, type HttpQuery } from "../../server/weatherHttp.js";

// La IA comparte validacion y semantica de error entre Express y Vercel.
export default async function handler(request: Request, response: Response) {
  await withObservedRequest(request, response, "/api/weather/summary", async () => {
    applySecurityHeaders(response);
    if (guardGetRequest(request, response, { rateLimit: true })) return;

    sendHttpResult(
      response,
      await handleWeatherSummary(request.query as HttpQuery),
    );
  });
}
