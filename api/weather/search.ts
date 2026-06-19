import type { Request, Response } from "express";
import { getWeatherByCity } from "../../server/weatherService";

// Vercel ejecuta este archivo como funcion serverless para /api/weather/search.
export default async function handler(request: Request, response: Response) {
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
}
