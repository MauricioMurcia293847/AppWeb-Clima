import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../server/app";
import { normalizeApiRoute } from "../server/observability";

describe("observabilidad segura", () => {
  it("normaliza rutas para impedir cardinalidad o datos arbitrarios", () => {
    expect(normalizeApiRoute("/api/weather/search")).toBe(
      "/api/weather/search",
    );
    expect(normalizeApiRoute("/api/weather/search/Madrid")).toBe("unknown");
  });

  it("agrega un identificador opaco a cada respuesta", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
