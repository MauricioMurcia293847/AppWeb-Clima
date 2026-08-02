import { describe, expect, it } from "vitest";
import { weatherMockByCity } from "../src/data/weatherMock";
import {
  buildFriendlyTips,
  buildLocalGuidance,
} from "../src/services/weatherGuidance";

const baseWeather = weatherMockByCity["ciudad juarez"];

describe("guia meteorologica local", () => {
  it("prioriza proteccion contra lluvia", () => {
    const guidance = buildLocalGuidance({
      ...baseWeather,
      precipitation: 75,
      temperature: 35,
    });

    expect(guidance.summaryLines[0]).toContain("alta probabilidad de lluvia");
    expect(guidance.recommendation).toContain("paraguas");
  });

  it("recomienda hidratacion cuando hace calor", () => {
    const guidance = buildLocalGuidance({
      ...baseWeather,
      precipitation: 5,
      temperature: 36,
    });

    expect(guidance.summaryLines[1]).toContain("temperatura será alta");
    expect(guidance.recommendation).toContain("Toma agua");
  });

  it("recomienda abrigo cuando hace frio", () => {
    const guidance = buildLocalGuidance({
      ...baseWeather,
      precipitation: 5,
      temperature: 6,
    });

    expect(guidance.summaryLines[1]).toContain("ambiente será frío");
    expect(guidance.recommendation).toContain("chamarra");
  });

  it("advierte sobre viento fuerte en clima templado", () => {
    const guidance = buildLocalGuidance({
      ...baseWeather,
      precipitation: 5,
      temperature: 22,
      windSpeed: 32,
    });

    expect(guidance.recommendation).toContain("viento");
  });

  it("ofrece tres variantes amigables sin repetir consejos", () => {
    const tips = buildFriendlyTips({
      ...baseWeather,
      precipitation: 5,
      temperature: 36,
    });

    expect(tips).toHaveLength(3);
    expect(new Set(tips).size).toBe(3);
    expect(tips[1]).toContain("sol viene con ganas");
  });
});
