/**
 * Airservices Australia provider.
 * Provides METAR, TAF, NOTAM data for YTYA and surrounds.
 *
 * Note: Full NAIPS API requires registration and API key.
 * This module is structured for when that key is available.
 * In the interim, it returns structured placeholder data.
 */

import type { AviationData, METAR, NOTAM } from '../../types/aviation.types';

const AIRSERVICES_BASE = 'https://data.airservicesaustralia.com/NAIPS';
const API_KEY = process.env.AIRSERVICES_API_KEY || '';

export async function fetchAviationData(station: string = 'YTYA'): Promise<AviationData> {
  if (!API_KEY) {
    return {
      metar: null,
      notams: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  try {
    const [metar, notams] = await Promise.all([
      fetchMetar(station),
      fetchNotams(station),
    ]);

    return {
      metar,
      notams,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Airservices fetch failed:', err);
    return {
      metar: null,
      notams: [],
      fetchedAt: new Date().toISOString(),
    };
  }
}

async function fetchMetar(station: string): Promise<METAR | null> {
  try {
    const res = await fetch(`${AIRSERVICES_BASE}/metar?station=${station}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return parseMetar(data);
  } catch {
    return null;
  }
}

async function fetchNotams(station: string): Promise<NOTAM[]> {
  try {
    const res = await fetch(`${AIRSERVICES_BASE}/notam?station=${station}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map(parseNotam) : [];
  } catch {
    return [];
  }
}

function parseMetar(data: Record<string, unknown>): METAR {
  return {
    raw: (data.raw as string) || '',
    station: (data.station as string) || 'YTYA',
    time: (data.time as string) || new Date().toISOString(),
    windDir: (data.wind_dir as number) || 0,
    windSpeedKts: (data.wind_speed as number) || 0,
    windGustKts: (data.wind_gust as number) || null,
    visibilityM: (data.visibility as number) || 9999,
    tempC: (data.temp as number) || 0,
    dewpointC: (data.dewpoint as number) || 0,
    qnhHpa: (data.qnh as number) || 1013,
    cloudLayers: Array.isArray(data.clouds) ? data.clouds as { coverage: string; baseFt: number }[] : [],
  };
}

function parseNotam(data: Record<string, unknown>): NOTAM {
  return {
    id: (data.id as string) || '',
    type: (data.type as string) || 'NOTAM',
    text: (data.text as string) || '',
    effective: (data.effective as string) || '',
    expires: (data.expires as string) || '',
    area: (data.area as string) || '',
  };
}
