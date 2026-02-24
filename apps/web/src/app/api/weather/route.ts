import { NextResponse } from 'next/server';
import { fetchWeather, sumPrecipitation, sumPastPrecipitation } from '../../../server/providers/openmeteo.provider';

export const revalidate = 600; // 10 minutes

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
    });
  } catch (err) {
    console.error('Weather API error:', err);
    return NextResponse.json({ error: 'Weather fetch failed' }, { status: 502 });
  }
}
