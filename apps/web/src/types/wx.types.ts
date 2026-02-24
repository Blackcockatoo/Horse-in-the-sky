/** Weather data types — normalized from OpenMeteo */

export type DataFeedStatus = 'live' | 'stale' | 'fallback' | 'error';

export interface DataCredibilityMeta {
  source: string;
  sourceUrl: string;
  fetchedAt: string;
  status: DataFeedStatus;
  ageMinutes: number;
}

export interface CurrentWeather {
  tempC: number;
  dewpointC: number;
  humidity: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirectionDeg: number;
  precipitationMm: number;
  pressureHpa: number;
  cloudCoverPct: number;
  visibilityKm: number;
  updatedAt: string;
}

export interface HourlyForecast {
  time: string;
  tempC: number;
  dewpointC: number;
  humidity: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirectionDeg: number;
  precipitationMm: number;
  pressureHpa: number;
  cloudCoverPct: number;
  precipitationProbability: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  location: 'farm' | 'airport';
  fetchedAt: string;
}
