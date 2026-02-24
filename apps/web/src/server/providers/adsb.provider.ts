/**
 * ADS-B tracking provider.
 * Pulls aircraft near Tyabb from ADSBexchange or OpenSky.
 *
 * Note: API keys required for full access.
 * Falls back gracefully when unavailable.
 */

import { LOCATIONS } from '../../lib/config';
import type { TrackingData, Aircraft } from '../../types/tracking.types';

const ADSBX_KEY = process.env.ADSBEXCHANGE_API_KEY || '';
const OPENSKY_USER = process.env.OPENSKY_USERNAME || '';
const OPENSKY_PASS = process.env.OPENSKY_PASSWORD || '';

const SEARCH_RADIUS_NM = 25;

export async function fetchNearbyAircraft(): Promise<TrackingData> {
  // Try ADSBexchange first, fall back to OpenSky
  if (ADSBX_KEY) {
    try {
      return await fetchFromAdsbx();
    } catch (err) {
      console.error('ADSBx fetch failed:', err);
    }
  }

  if (OPENSKY_USER) {
    try {
      return await fetchFromOpenSky();
    } catch (err) {
      console.error('OpenSky fetch failed:', err);
    }
  }

  return {
    aircraft: [],
    nearbyCount: 0,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchFromAdsbx(): Promise<TrackingData> {
  const { lat, lon } = LOCATIONS.tyabb;
  const url = `https://adsbexchange.com/api/aircraft/lat/${lat}/lon/${lon}/dist/${SEARCH_RADIUS_NM}/`;
  const res = await fetch(url, {
    headers: { 'api-auth': ADSBX_KEY },
    next: { revalidate: 30 },
  });

  if (!res.ok) throw new Error(`ADSBx ${res.status}`);
  const data = await res.json();
  const acList = Array.isArray(data.ac) ? data.ac : [];

  const aircraft: Aircraft[] = acList.map((ac: Record<string, unknown>) => ({
    icao: (ac.hex as string) || '',
    callsign: ((ac.flight as string) || '').trim(),
    registration: (ac.r as string) || '',
    lat: (ac.lat as number) || 0,
    lon: (ac.lon as number) || 0,
    altFt: (ac.alt_baro as number) || 0,
    speedKts: (ac.gs as number) || 0,
    heading: (ac.track as number) || 0,
    verticalRate: (ac.baro_rate as number) || 0,
    onGround: ac.alt_baro === 'ground',
    lastSeen: new Date().toISOString(),
  }));

  return {
    aircraft,
    nearbyCount: aircraft.length,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchFromOpenSky(): Promise<TrackingData> {
  const { lat, lon } = LOCATIONS.tyabb;
  // OpenSky uses bounding box: lamin, lomin, lamax, lomax
  const delta = 0.3; // ~30km box
  const url = `https://opensky-network.org/api/states/all?lamin=${lat - delta}&lomin=${lon - delta}&lamax=${lat + delta}&lomax=${lon + delta}`;

  const headers: Record<string, string> = {};
  if (OPENSKY_USER && OPENSKY_PASS) {
    headers['Authorization'] = 'Basic ' + btoa(`${OPENSKY_USER}:${OPENSKY_PASS}`);
  }

  const res = await fetch(url, { headers, next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`OpenSky ${res.status}`);
  const data = await res.json();
  const states: unknown[][] = data.states || [];

  const aircraft: Aircraft[] = states.map((s) => ({
    icao: (s[0] as string) || '',
    callsign: ((s[1] as string) || '').trim(),
    registration: '',
    lat: (s[6] as number) || 0,
    lon: (s[5] as number) || 0,
    altFt: Math.round(((s[7] as number) || 0) * 3.28084),
    speedKts: Math.round(((s[9] as number) || 0) * 1.944),
    heading: (s[10] as number) || 0,
    verticalRate: Math.round(((s[11] as number) || 0) * 196.85),
    onGround: (s[8] as boolean) || false,
    lastSeen: new Date(((s[4] as number) || 0) * 1000).toISOString(),
  }));

  return {
    aircraft,
    nearbyCount: aircraft.length,
    fetchedAt: new Date().toISOString(),
  };
}
