import cors from "cors";
import express from "express";
import { getWeatherByCity, getWeatherByCoordinates } from "./weatherService";

export function createApp() {
  const app = express();

  // CORS permite que el frontend de Vite consuma este backend en desarrollo.
  app.use(
    cors({
      origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    }),
  );

  app.use(express.json());

  // Ruta simple para comprobar que el servidor esta vivo.
  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      service: "AppWeb Clima API",
    });
  });

  // Ruta principal: recibe una ciudad y devuelve clima normalizado.
  app.get("/api/weather/search", async (request, response) => {
    const city = String(request.query.city ?? "").trim();

    if (!city) {
      response.status(400).json({
        error: "El parametro city es requerido.",
      });
      return;
    }

    try {
      const weather = await getWeatherByCity(city);
      response.json(weather);
    } catch (error) {
      response.status(502).json({
        error:
          error instanceof Error
            ? error.message
            : "No pudimos consultar el clima en este momento.",
      });
    }
  });

  // Ruta por coordenadas: permite usar la geolocalizacion del navegador.
  app.get("/api/weather/current", async (request, response) => {
    const latitude = Number(request.query.lat);
    const longitude = Number(request.query.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      response.status(400).json({
        error: "Los parametros lat y lon son requeridos.",
      });
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      response.status(400).json({
        error: "Las coordenadas estan fuera de rango.",
      });
      return;
    }

    try {
      const weather = await getWeatherByCoordinates(latitude, longitude);
      response.json(weather);
    } catch (error) {
      response.status(502).json({
        error:
          error instanceof Error
            ? error.message
            : "No pudimos consultar el clima de tu ubicacion.",
      });
    }
  });

  return app;
}
