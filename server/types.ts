import type { WeatherDashboardData } from "../src/types/weather";

export type OpenMeteoGeocodingResult = {
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[];
};

export type OpenMeteoReverseGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[];
};

export type OpenMeteoForecastResponse = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability?: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

export type WeatherApiResponse = WeatherDashboardData;
