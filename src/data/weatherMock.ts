import type { WeatherDashboardData } from "../types/weather";

// Ciudad principal que se muestra cuando el usuario abre la aplicacion.
export const defaultCity = "Ciudad Juarez";

// Base local de ciudades simuladas. Funciona como una API temporal mientras
// construimos el frontend y despues se reemplazara por el backend real.
export const weatherMockByCity: Record<string, WeatherDashboardData> = {
  "ciudad juarez": {
    location: "Ciudad Juarez",
    country: "Mexico",
    dataSource: "mock",
    updatedAt: "18 jun 2026, 11:30",
    condition: "Soleado con viento ligero",
    temperature: 34,
    apparentTemperature: 36,
    humidity: 28,
    windSpeed: 18,
    precipitation: 4,
    confidence: "alta",
    comparison: {
      primaryProvider: "Open-Meteo",
      secondaryProvider: "OpenWeather",
      temperatureDelta: 0.8,
      humidityDelta: 3,
      windDelta: 2.1,
    },
    hourly: [
      { time: "12:00", temperature: 35, rainChance: 2 },
      { time: "13:00", temperature: 36, rainChance: 2 },
      { time: "14:00", temperature: 37, rainChance: 3 },
      { time: "15:00", temperature: 37, rainChance: 4 },
      { time: "16:00", temperature: 36, rainChance: 6 },
      { time: "17:00", temperature: 35, rainChance: 8 },
    ],
    daily: [
      { day: "Hoy", min: 24, max: 37, condition: "Soleado" },
      { day: "Vie", min: 23, max: 36, condition: "Despejado" },
      { day: "Sab", min: 22, max: 34, condition: "Nubes leves" },
      { day: "Dom", min: 21, max: 33, condition: "Viento" },
    ],
    markers: [
      { city: "Nueva York", continent: "America", temperature: 27, condition: "Nublado", latitude: 40.71, longitude: -74.01 },
      { city: "Sao Paulo", continent: "America", temperature: 19, condition: "Lluvia", latitude: -23.55, longitude: -46.63 },
      { city: "Madrid", continent: "Europa", temperature: 31, condition: "Soleado", latitude: 40.42, longitude: -3.7 },
      { city: "El Cairo", continent: "Africa", temperature: 38, condition: "Caluroso", latitude: 30.04, longitude: 31.24 },
      { city: "Tokio", continent: "Asia", temperature: 26, condition: "Humedo", latitude: 35.68, longitude: 139.69 },
      { city: "Sydney", continent: "Oceania", temperature: 15, condition: "Fresco", latitude: -33.87, longitude: 151.21 },
    ],
  },
  madrid: {
    location: "Madrid",
    country: "Espana",
    dataSource: "mock",
    updatedAt: "18 jun 2026, 19:30",
    condition: "Cielo despejado",
    temperature: 31,
    apparentTemperature: 32,
    humidity: 35,
    windSpeed: 14,
    precipitation: 1,
    confidence: "alta",
    comparison: {
      primaryProvider: "Open-Meteo",
      secondaryProvider: "OpenWeather",
      temperatureDelta: 0.5,
      humidityDelta: 2,
      windDelta: 1.4,
    },
    hourly: [
      { time: "20:00", temperature: 30, rainChance: 1 },
      { time: "21:00", temperature: 28, rainChance: 1 },
      { time: "22:00", temperature: 27, rainChance: 2 },
      { time: "23:00", temperature: 26, rainChance: 2 },
      { time: "00:00", temperature: 25, rainChance: 3 },
      { time: "01:00", temperature: 24, rainChance: 3 },
    ],
    daily: [
      { day: "Hoy", min: 22, max: 32, condition: "Despejado" },
      { day: "Vie", min: 21, max: 33, condition: "Soleado" },
      { day: "Sab", min: 20, max: 31, condition: "Nubes leves" },
      { day: "Dom", min: 19, max: 30, condition: "Templado" },
    ],
    markers: [
      { city: "Ciudad Juarez", continent: "America", temperature: 34, condition: "Soleado", latitude: 31.74, longitude: -106.49 },
      { city: "Madrid", continent: "Europa", temperature: 31, condition: "Soleado", latitude: 40.42, longitude: -3.7 },
      { city: "Roma", continent: "Europa", temperature: 29, condition: "Calido", latitude: 41.9, longitude: 12.5 },
      { city: "Paris", continent: "Europa", temperature: 24, condition: "Nublado", latitude: 48.86, longitude: 2.35 },
      { city: "El Cairo", continent: "Africa", temperature: 38, condition: "Caluroso", latitude: 30.04, longitude: 31.24 },
      { city: "Tokio", continent: "Asia", temperature: 26, condition: "Humedo", latitude: 35.68, longitude: 139.69 },
    ],
  },
  tokio: {
    location: "Tokio",
    country: "Japon",
    dataSource: "mock",
    updatedAt: "19 jun 2026, 02:30",
    condition: "Humedo con nubes dispersas",
    temperature: 26,
    apparentTemperature: 29,
    humidity: 74,
    windSpeed: 10,
    precipitation: 22,
    confidence: "media",
    comparison: {
      primaryProvider: "Open-Meteo",
      secondaryProvider: "OpenWeather",
      temperatureDelta: 1.6,
      humidityDelta: 8,
      windDelta: 3.2,
    },
    hourly: [
      { time: "03:00", temperature: 25, rainChance: 20 },
      { time: "04:00", temperature: 25, rainChance: 24 },
      { time: "05:00", temperature: 24, rainChance: 28 },
      { time: "06:00", temperature: 25, rainChance: 25 },
      { time: "07:00", temperature: 26, rainChance: 18 },
      { time: "08:00", temperature: 27, rainChance: 16 },
    ],
    daily: [
      { day: "Hoy", min: 24, max: 29, condition: "Humedo" },
      { day: "Vie", min: 23, max: 28, condition: "Lluvia leve" },
      { day: "Sab", min: 22, max: 27, condition: "Nublado" },
      { day: "Dom", min: 23, max: 30, condition: "Soleado" },
    ],
    markers: [
      { city: "Tokio", continent: "Asia", temperature: 26, condition: "Humedo", latitude: 35.68, longitude: 139.69 },
      { city: "Seul", continent: "Asia", temperature: 25, condition: "Nublado", latitude: 37.57, longitude: 126.98 },
      { city: "Bangkok", continent: "Asia", temperature: 33, condition: "Lluvia", latitude: 13.75, longitude: 100.5 },
      { city: "Sydney", continent: "Oceania", temperature: 15, condition: "Fresco", latitude: -33.87, longitude: 151.21 },
      { city: "Madrid", continent: "Europa", temperature: 31, condition: "Soleado", latitude: 40.42, longitude: -3.7 },
      { city: "Nueva York", continent: "America", temperature: 27, condition: "Nublado", latitude: 40.71, longitude: -74.01 },
    ],
  },
};

// Lista visible para sugerir busquedas disponibles en el prototipo.
export const availableCities = Object.values(weatherMockByCity).map(
  (weather) => weather.location,
);
