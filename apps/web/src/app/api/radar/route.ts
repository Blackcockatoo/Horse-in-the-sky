import { NextResponse } from 'next/server';
import { API_URLS } from '../../../lib/config';
import type { DataCredibilityMeta, DataFeedStatus } from '../../../types/wx.types';

export const revalidate = 300;

const RADAR_STALE_THRESHOLD_MINUTES = 15;

function buildRadarCredibility(fetchedAt: string, statusOverride?: DataFeedStatus): DataCredibilityMeta {
  const ageMinutes = Math.max(0, Math.round((Date.now() - new Date(fetchedAt).getTime()) / 60000));
  const status: DataFeedStatus = statusOverride
    ?? (ageMinutes > RADAR_STALE_THRESHOLD_MINUTES ? 'stale' : 'live');

  return {
    source: 'Bureau of Meteorology Radar',
    sourceUrl: API_URLS.bomRadar256,
    fetchedAt,
    status,
    ageMinutes,
  };
}

export async function GET() {
  try {
    const fetchedAt = new Date().toISOString();

    return NextResponse.json({
      urls: {
        melbourne256: API_URLS.bomRadar256,
        melbourne128: API_URLS.bomRadar128,
      },
      credibility: buildRadarCredibility(fetchedAt),
    });
  } catch (err) {
    console.error('Radar API error:', err);
    const fetchedAt = new Date().toISOString();
    return NextResponse.json({
      urls: {
        melbourne256: API_URLS.bomRadar256,
        melbourne128: API_URLS.bomRadar128,
      },
      credibility: buildRadarCredibility(fetchedAt, 'error'),
    }, { status: 502 });
  }
}
