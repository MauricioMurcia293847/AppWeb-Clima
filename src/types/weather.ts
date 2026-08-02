// Define el nivel de confianza al comparar dos modelos meteorologicos.
// "no_disponible" es honesto: no hubo segundo modelo con que comparar, no es
// lo mismo que "alta" (que significaria que los modelos coinciden).
export type ConfidenceLevel = "alta" | "media" | "baja" | "no_disponible";

// Representa una medicion individual dentro del pronostico por horas.
export type HourlyForecast = {
  time: string;
  temperature: number;
  rainChance: number;
};

// Representa el resumen de clima para un dia.
export type DailyForecast = {
  day: string;
  min: number;
  max: number;
  condition: string;
};

// Representa una ciudad o region destacada dentro del globo mundial.
export type ClimateMarker = {
  city: string;
  continent: string;
  temperature: number;
  condition: string;
  latitude: number;
  longitude: number;
  x?: number;
  y?: number;
};

// Indica si el dashboard viene del backend propio o del respaldo local.
export type WeatherDataSource = "backend" | "mock";

// Modelo central normalizado que consumen todos los componentes del dashboard.
export type WeatherDashboardData = {
  location: string;
  country: string;
  dataSource: WeatherDataSource;
  updatedAt: string;
  condition: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  confidence: ConfidenceLevel;
  comparison: {
    primaryProvider: string;
    secondaryProvider: string;
    temperatureDelta: number;
    humidityDelta: number;
    windDelta: number;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  markers: ClimateMarker[];
};

// Resumen en lenguaje natural (M2). Endpoint separado del clima -- ver
// ADR-002 en 02-arquitectura.md -- por eso no vive dentro de WeatherDashboardData.
export type WeatherSummary = {
  summaryLines: string[];
  recommendation: string;
  generatedAt: string;
  // true cuando la IA no respondio a tiempo o fallo: el texto es un respaldo
  // generico, no algo generado. El frontend lo muestra distinto (sin alarmar).
  degraded: boolean;
};
