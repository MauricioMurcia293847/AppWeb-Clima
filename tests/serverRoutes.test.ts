import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../server/app";

describe("server routes", () => {
  const app = createApp();

  it("responde health check", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      service: "AppWeb Clima API",
    });
  });

  it("rechaza busqueda sin ciudad", async () => {
    const response = await request(app).get("/api/weather/search");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("El parametro city es requerido.");
  });

  it("rechaza coordenadas fuera de rango", async () => {
    const response = await request(app).get(
      "/api/weather/current?lat=120&lon=-106.48",
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Las coordenadas estan fuera de rango.");
  });
});
