import { NextResponse } from 'next/server';
import { fetchWeather, sumPrecipitation, sumPastPrecipitation } from '../../../server/providers/openmeteo.provider';
import { API_URLS } from '../../../lib/config';
import type { DataCredibilityMeta, DataFeedStatus } from '../../../types/wx.types';

export const revalidate = 600; // 10 minutes

const WEATHER_STALE_THRESHOLD_MINUTES = 30;

function buildWeatherCredibility(fetchedAt: string, statusOverride?: DataFeedStatus): DataCredibilityMeta {
  const ageMinutes = Math.max(0, Math.round((Date.now() - new Date(fetchedAt).getTime()) / 60000));
  const status: DataFeedStatus = statusOverride
    ?? (ageMinutes > WEATHER_STALE_THRESHOLD_MINUTES ? 'stale' : 'live');

  return {
    source: 'Open-Meteo (BOM ACCESS-G)',
    sourceUrl: API_URLS.openMeteo,
    fetchedAt,
    status,
    ageMinutes,
  };
}

export async function GET() {
  try {
    const [farmWx, airportWx] = await Promise.all([
      fetchWeather('farm'),
      fetchWeather('airport'),
    ]);

    const rainNext6h = sumPrecipitation(farmWx.hourly, 6);
    const rainPast24h = sumPastPrecipitation(farmWx.hourly, 24);

    return NextResponse.json({
      farm: farmWx,
      airport: airportWx,
      derived: {
        rainNext6hMm: Math.round(rainNext6h * 10) / 10,
        rainPast24hMm: Math.round(rainPast24h * 10) / 10,
      },
      credibility: buildWeatherCredibility(farmWx.fetchedAt),
    });
  } catch (err) {
    console.error('Weather API error:', err);
    const fetchedAt = new Date().toISOString();
    return NextResponse.json({
      error: 'Weather fetch failed',
      credibility: buildWeatherCredibility(fetchedAt, 'error'),
    }, { status: 502 });
  }
}
