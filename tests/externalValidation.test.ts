import { describe, expect, it } from "vitest";
import {
  parseGeminiText,
  parseOpenMeteoForecast,
  parseWeatherSummaryJson,
} from "../server/externalValidation";

describe("externalValidation", () => {
  it("rechaza pronosticos incompletos aunque TypeScript compile", () => {
    expect(() => parseOpenMeteoForecast({ current: {} })).toThrow(
      /formato inválido/i,
    );
  });

  it("extrae texto de una envoltura Gemini valida", () => {
    expect(
      parseGeminiText({
        candidates: [
          { content: { parts: [{ text: '{"summary":[]}' }] } },
        ],
      }),
    ).toBe('{"summary":[]}');
  });

  it("exige resumen y recomendacion no vacios", () => {
    expect(() =>
      parseWeatherSummaryJson(
        JSON.stringify({ recommendations: [], summary: ["Soleado"] }),
      ),
    ).toThrow(/incompleta/i);
  });

  it("exige tres recomendaciones Gemini diferentes", () => {
    expect(() =>
      parseWeatherSummaryJson(
        JSON.stringify({
          recommendations: ["Lleva agua.", "Lleva agua.", "Busca sombra."],
          summary: ["Hace calor."],
        }),
      ),
    ).toThrow(/incompleta/i);
  });
});
