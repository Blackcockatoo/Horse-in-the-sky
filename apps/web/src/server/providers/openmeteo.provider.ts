/**
 * Open-Meteo provider — pulls real forecast data using BOM ACCESS-G model.
 * Free, no API key, Australia-optimised.
 */

import { LOCATIONS, API_URLS } from '../../lib/config';
import type { WeatherData, CurrentWeather, HourlyForecast } from '../../types/wx.types';

const HOURLY_PARAMS = [
  'temperature_2m',
  'dewpoint_2m',
  'relative_humidity_2m',
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
  'precipitation',
  'pressure_msl',
  'cloud_cover',
  'precipitation_probability',
  'visibility',
].join(',');

const CURRENT_PARAMS = [
  'temperature_2m',
  'dewpoint_2m',
  'relative_humidity_2m',
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
  'precipitation',
  'pressure_msl',
  'cloud_cover',
].join(',');

interface OpenMeteoResponse {
  current?: Record<string, number>;
  hourly?: Record<string, (number | null)[]>;
}

export async function fetchWeather(location: 'farm' | 'airport'): Promise<WeatherData> {
  const coords = location === 'farm' ? LOCATIONS.farm : LOCATIONS.tyabb;
  const url = new URL(API_URLS.openMeteo);
  url.searchParams.set('latitude', coords.lat.toString());
  url.searchParams.set('longitude', coords.lon.toString());
  url.searchParams.set('current', CURRENT_PARAMS);
  url.searchParams.set('hourly', HOURLY_PARAMS);
  url.searchParams.set('timezone', 'Australia/Melbourne');
  url.searchParams.set('forecast_days', '2');
  url.searchParams.set('wind_speed_unit', 'kmh');

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}: ${res.statusText}`);

  const data: OpenMeteoResponse = await res.json();

  const current: CurrentWeather = {
    tempC: data.current?.temperature_2m ?? 0,
    dewpointC: data.current?.dewpoint_2m ?? 0,
    humidity: data.current?.relative_humidity_2m ?? 0,
    windSpeedKmh: data.current?.wind_speed_10m ?? 0,
    windGustKmh: data.current?.wind_gusts_10m ?? 0,
    windDirectionDeg: data.current?.wind_direction_10m ?? 0,
    precipitationMm: data.current?.precipitation ?? 0,
    pressureHpa: data.current?.pressure_msl ?? 1013,
    cloudCoverPct: data.current?.cloud_cover ?? 0,
    visibilityKm: 10, // Open-Meteo may not always return current visibility
    updatedAt: new Date().toISOString(),
  };

  const times = (data.hourly?.time as unknown as string[]) ?? [];
  const hourly: HourlyForecast[] = times.map((time, i) => ({
    time,
    tempC: (data.hourly?.temperature_2m?.[i] as number) ?? 0,
    dewpointC: (data.hourly?.dewpoint_2m?.[i] as number) ?? 0,
    humidity: (data.hourly?.relative_humidity_2m?.[i] as number) ?? 0,
    windSpeedKmh: (data.hourly?.wind_speed_10m?.[i] as number) ?? 0,
    windGustKmh: (data.hourly?.wind_gusts_10m?.[i] as number) ?? 0,
    windDirectionDeg: (data.hourly?.wind_direction_10m?.[i] as number) ?? 0,
    precipitationMm: (data.hourly?.precipitation?.[i] as number) ?? 0,
    pressureHpa: (data.hourly?.pressure_msl?.[i] as number) ?? 1013,
    cloudCoverPct: (data.hourly?.cloud_cover?.[i] as number) ?? 0,
    precipitationProbability: (data.hourly?.precipitation_probability?.[i] as number) ?? 0,
  }));

  return {
    current,
    hourly,
    location,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Sum precipitation from hourly data for the next N hours.
 */
export function sumPrecipitation(hourly: HourlyForecast[], hours: number): number {
  const now = new Date();
  const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return hourly
    .filter(h => {
      const t = new Date(h.time);
      return t >= now && t <= cutoff;
    })
    .reduce((sum, h) => sum + h.precipitationMm, 0);
}

/**
 * Sum precipitation from hourly data for the last N hours.
 */
export function sumPastPrecipitation(hourly: HourlyForecast[], hours: number): number {
  const now = new Date();
  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
  return hourly
    .filter(h => {
      const t = new Date(h.time);
      return t >= cutoff && t <= now;
    })
    .reduce((sum, h) => sum + h.precipitationMm, 0);
}
