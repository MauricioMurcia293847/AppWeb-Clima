import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import searchHandler from "../api/weather/search";

type CapturedResponse = {
  body?: unknown;
  headers: Record<string, string>;
  response: Response;
  statusCode: number;
};

function createResponse(): CapturedResponse {
  const captured: CapturedResponse = {
    headers: {},
    response: {} as Response,
    statusCode: 200,
  };

  captured.response = {
    json(body: unknown) {
      captured.body = body;
      return this;
    },
    setHeader(name: string, value: string | number | readonly string[]) {
      captured.headers[name.toLowerCase()] = String(value);
      return this;
    },
    status(status: number) {
      captured.statusCode = status;
      return this;
    },
  } as unknown as Response;

  return captured;
}

describe("Vercel weather adapters", () => {
  it("aplica el mismo 405 y contrato de error compartido", async () => {
    const captured = createResponse();
    const request = {
      headers: {},
      ip: "203.0.113.90",
      method: "POST",
      query: {},
    } as unknown as Request;

    await searchHandler(request, captured.response);

    expect(captured.statusCode).toBe(405);
    expect(captured.headers.allow).toBe("GET");
    expect(captured.body).toMatchObject({ code: "METHOD_NOT_ALLOWED" });
  });

  it("reutiliza la validacion de longitud de ciudad", async () => {
    const captured = createResponse();
    const request = {
      headers: {},
      ip: "203.0.113.91",
      method: "GET",
      query: { city: "a".repeat(101) },
    } as unknown as Request;

    await searchHandler(request, captured.response);

    expect(captured.statusCode).toBe(400);
    expect(captured.body).toMatchObject({ code: "INVALID_CITY" });
    expect(captured.headers["x-content-type-options"]).toBe("nosniff");
    expect(captured.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
