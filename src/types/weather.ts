// Define el nivel de confianza que usaremos al comparar proveedores climaticos.
export type ConfidenceLevel = "alta" | "media" | "baja";

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

// Representa una ciudad o region destacada dentro del mapa mundial.
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
export type WeatherDataSource = "backend" | "mock" | "open-meteo";

// Modelo central del dashboard. Luego se llenara desde el backend.
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
