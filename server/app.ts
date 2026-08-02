import cors from "cors";
import express from "express";
import helmet from "helmet";
import { getRuntimeCapabilities } from "./config";
import { guardGetRequest, sendHttpResult } from "./httpContracts";
import { observeExpressRequest } from "./observability";
import {
  handleCurrentWeather,
  handleWeatherSearch,
  handleWeatherSummary,
  type HttpQuery,
} from "./weatherHttp";

export function createApp() {
  const app = express();

  // Helmet protege el servidor local. Las funciones serverless aplican sus
  // cabeceras equivalentes porque no pasan por esta instancia de Express.
  app.use(helmet());
  app.use(
    cors({
      origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    }),
  );
  app.use(express.json());
  app.use(observeExpressRequest);

  app.get("/api/health", (_request, response) => {
    response.json({
      capabilities: getRuntimeCapabilities(),
      ok: true,
      service: "AppWeb Clima API",
    });
  });
  app.all("/api/health", (request, response) => {
    guardGetRequest(request, response);
  });

  app.get("/api/weather/search", async (request, response) => {
    if (guardGetRequest(request, response, { rateLimit: true })) return;
    sendHttpResult(
      response,
      await handleWeatherSearch(request.query as HttpQuery),
    );
  });
  app.all("/api/weather/search", (request, response) => {
    guardGetRequest(request, response);
  });

  app.get("/api/weather/current", async (request, response) => {
    if (guardGetRequest(request, response, { rateLimit: true })) return;
    sendHttpResult(
      response,
      await handleCurrentWeather(request.query as HttpQuery),
    );
  });
  app.all("/api/weather/current", (request, response) => {
    guardGetRequest(request, response);
  });

  app.get("/api/weather/summary", async (request, response) => {
    if (guardGetRequest(request, response, { rateLimit: true })) return;
    sendHttpResult(
      response,
      await handleWeatherSummary(request.query as HttpQuery),
    );
  });
  app.all("/api/weather/summary", (request, response) => {
    guardGetRequest(request, response);
  });

  return app;
}
