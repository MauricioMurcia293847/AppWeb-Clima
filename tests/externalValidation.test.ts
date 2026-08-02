import { describe, expect, it } from "vitest";
import {
  parseAnthropicText,
  parseOpenMeteoForecast,
  parseWeatherSummaryJson,
} from "../server/externalValidation";

describe("externalValidation", () => {
  it("rechaza pronosticos incompletos aunque TypeScript compile", () => {
    expect(() => parseOpenMeteoForecast({ current: {} })).toThrow(
      /formato inválido/i,
    );
  });

  it("extrae texto de una envoltura Anthropic valida", () => {
    expect(
      parseAnthropicText({ content: [{ text: '{"summary":[]}' }] }),
    ).toBe('{"summary":[]}');
  });

  it("exige resumen y recomendacion no vacios", () => {
    expect(() =>
      parseWeatherSummaryJson(
        JSON.stringify({ recommendation: "", summary: ["Soleado"] }),
      ),
    ).toThrow(/incompleta/i);
  });
});
