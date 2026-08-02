import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

type RequestContext = {
  requestId: string;
};

type RequestEvent = {
  durationMs: number;
  event: "http_request_completed";
  method: string;
  requestId: string;
  route: ApiRoute;
  status: number;
};

type DependencyEvent = {
  dependency: "gemini" | "open_meteo";
  durationMs: number;
  event: "dependency_request_completed";
  operation: string;
  outcome: "degraded" | "error" | "success";
  requestId?: string;
  status?: number;
};

type ApiRoute =
  | "/api/health"
  | "/api/weather/current"
  | "/api/weather/search"
  | "/api/weather/summary"
  | "unknown";

const requestContext = new AsyncLocalStorage<RequestContext>();
const knownRoutes = new Set<ApiRoute>([
  "/api/health",
  "/api/weather/current",
  "/api/weather/search",
  "/api/weather/summary",
]);

function writeLog(record: RequestEvent | DependencyEvent): void {
  if (process.env.NODE_ENV === "test") return;

  const output = JSON.stringify({
    ...record,
    timestamp: new Date().toISOString(),
  });

  if ("outcome" in record && record.outcome === "error") {
    console.error(output);
    return;
  }

  console.info(output);
}

export function normalizeApiRoute(path: string): ApiRoute {
  return knownRoutes.has(path as ApiRoute) ? (path as ApiRoute) : "unknown";
}

function createRequestContext(response: Response): RequestContext {
  const context = { requestId: randomUUID() };
  response.setHeader("X-Request-Id", context.requestId);
  return context;
}

function logRequest(
  context: RequestContext,
  method: string,
  route: ApiRoute,
  status: number,
  startedAt: number,
): void {
  writeLog({
    durationMs: Math.max(0, Date.now() - startedAt),
    event: "http_request_completed",
    method: method.toUpperCase(),
    requestId: context.requestId,
    route,
    status,
  });
}

// Express conserva el contexto durante toda la cadena async iniciada por next().
export function observeExpressRequest(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const context = createRequestContext(response);
  const route = normalizeApiRoute(request.path);
  const startedAt = Date.now();

  response.once("finish", () => {
    logRequest(context, request.method, route, response.statusCode, startedAt);
  });

  requestContext.run(context, next);
}

// Las funciones serverless no pasan por el middleware Express, por eso usan
// este wrapper. La ruta es una constante y nunca se deriva de la query.
export async function withObservedRequest(
  request: Request,
  response: Response,
  route: ApiRoute,
  handler: () => void | Promise<void>,
): Promise<void> {
  const context = createRequestContext(response);
  const startedAt = Date.now();

  await requestContext.run(context, handler);
  logRequest(context, request.method, route, response.statusCode, startedAt);
}

export function observeDependency(
  dependency: DependencyEvent["dependency"],
  operation: string,
  startedAt: number,
  outcome: DependencyEvent["outcome"],
  status?: number,
): void {
  writeLog({
    dependency,
    durationMs: Math.max(0, Date.now() - startedAt),
    event: "dependency_request_completed",
    operation,
    outcome,
    requestId: requestContext.getStore()?.requestId,
    status,
  });
}

export function observeServerStarted(port: number): void {
  if (process.env.NODE_ENV === "test") return;

  console.info(
    JSON.stringify({
      event: "server_started",
      port,
      timestamp: new Date().toISOString(),
    }),
  );
}
