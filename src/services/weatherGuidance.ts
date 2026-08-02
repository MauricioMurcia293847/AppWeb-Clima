import type { WeatherDashboardData } from "../types/weather";

export type LocalGuidance = {
  recommendation: string;
  summaryLines: string[];
};

// Reglas transparentes para conservar consejos utiles cuando el proveedor de
// IA no esta configurado. Solo interpretan los valores visibles del clima.
export function buildLocalGuidance(weather: WeatherDashboardData): LocalGuidance {
  const summaryLines: string[] = [];

  if (weather.precipitation >= 60) {
    summaryLines.push(`Hay alta probabilidad de lluvia en ${weather.location}.`);
  } else if (weather.precipitation >= 25) {
    summaryLines.push(`Podrían presentarse lluvias aisladas en ${weather.location}.`);
  } else if (weather.condition.toLowerCase().includes("nubl")) {
    summaryLines.push(`El cielo estará mayormente nublado en ${weather.location}.`);
  } else {
    summaryLines.push(`El tiempo estará mayormente despejado en ${weather.location}.`);
  }

  if (weather.temperature >= 32) {
    summaryLines.push(`La temperatura será alta, alrededor de ${weather.temperature} grados.`);
  } else if (weather.temperature <= 10) {
    summaryLines.push(`El ambiente será frío, cerca de ${weather.temperature} grados.`);
  } else {
    summaryLines.push(`La temperatura será de aproximadamente ${weather.temperature} grados.`);
  }

  let recommendation = "Las condiciones son favorables; revisa de nuevo antes de salir.";
  if (weather.precipitation >= 40) {
    recommendation = "Lleva paraguas o impermeable antes de salir.";
  } else if (weather.temperature >= 32) {
    recommendation = "Toma agua, usa protector solar y evita el sol prolongado.";
  } else if (weather.temperature <= 10) {
    recommendation = "Lleva una chamarra y protege las manos del frío.";
  } else if (weather.windSpeed >= 25) {
    recommendation = "Asegura objetos ligeros y considera una capa contra el viento.";
  }

  return { recommendation, summaryLines };
}

// Variantes conversacionales para que el asistente pueda responder otra vez
// sin repetir el mismo texto. Mantienen el dato meteorologico como fuente.
export function buildFriendlyTips(weather: WeatherDashboardData): string[] {
  const primaryTip = buildLocalGuidance(weather).recommendation;

  if (weather.precipitation >= 40) {
    return [
      primaryTip,
      "El paraguas hoy no es adorno: dale un lugar en tu salida.",
      "Plan seco activado: impermeable, calzado cómodo y a disfrutar el día.",
    ];
  }

  if (weather.temperature >= 32) {
    return [
      primaryTip,
      "El sol viene con ganas: agua fresca y una buena sombra serán tu equipo.",
      "Hoy toca modo fresco: ropa ligera, protector solar y pausas bajo techo.",
    ];
  }

  if (weather.temperature <= 10) {
    return [
      primaryTip,
      "El frío anda serio: una capa extra te va a caer de maravilla.",
      "Antes de salir, chamarra lista y algo caliente para el camino.",
    ];
  }

  if (weather.windSpeed >= 25) {
    return [
      primaryTip,
      "El viento anda inquieto: sujeta bien lo ligero y camina con calma.",
      "Dia con personalidad: una capa contra el viento te hara buen paro.",
    ];
  }

  return [
    primaryTip,
    "El clima viene tranquilo; buen momento para salir sin tanta ceremonia.",
    "Todo pinta amable por ahora. Dale una última mirada al cielo antes de salir.",
  ];
}
