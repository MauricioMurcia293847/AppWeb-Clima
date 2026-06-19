import type { Request, Response } from "express";
import { getWeatherByCoordinates } from "../../server/weatherService.js";

// Vercel ejecuta este archivo como funcion serverless para /api/weather/current.
export default async function handler(request: Request, response: Response) {
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
}
