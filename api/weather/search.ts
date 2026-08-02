import type { Request, Response } from "express";
import { guardGetRequest, sendHttpResult } from "../../server/httpContracts.js";
import { withObservedRequest } from "../../server/observability.js";
import { applySecurityHeaders } from "../../server/securityHeaders.js";
import { handleWeatherSearch, type HttpQuery } from "../../server/weatherHttp.js";

// Adaptador serverless fino: seguridad y transporte quedan aqui; validacion y
// casos de uso se comparten con Express en server/weatherHttp.ts.
export default async function handler(request: Request, response: Response) {
  await withObservedRequest(request, response, "/api/weather/search", async () => {
    applySecurityHeaders(response);
    if (guardGetRequest(request, response, { rateLimit: true })) return;

    sendHttpResult(
      response,
      await handleWeatherSearch(request.query as HttpQuery),
    );
  });
}
