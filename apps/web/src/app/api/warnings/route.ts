import { NextResponse } from 'next/server';
import { fetchWarnings } from '../../../server/providers/bom.provider';
import { API_URLS } from '../../../lib/config';
import type { DataCredibilityMeta, DataFeedStatus } from '../../../types/wx.types';

export const revalidate = 300; // 5 minutes

const WARNINGS_STALE_THRESHOLD_MINUTES = 15;

function buildWarningsCredibility(fetchedAt: string, statusOverride?: DataFeedStatus): DataCredibilityMeta {
  const ageMinutes = Math.max(0, Math.round((Date.now() - new Date(fetchedAt).getTime()) / 60000));
  const status: DataFeedStatus = statusOverride
    ?? (ageMinutes > WARNINGS_STALE_THRESHOLD_MINUTES ? 'stale' : 'live');

  return {
    source: 'Bureau of Meteorology Warnings Feed',
    sourceUrl: API_URLS.bomWarnAll,
    fetchedAt,
    status,
    ageMinutes,
  };
}

export async function GET() {
  try {
    const warnings = await fetchWarnings();
    return NextResponse.json({
      ...warnings,
      credibility: buildWarningsCredibility(warnings.fetchedAt),
    });
  } catch (err) {
    console.error('Warnings API error:', err);
    const fetchedAt = new Date().toISOString();
    return NextResponse.json({
      warnings: [],
      activeCount: 0,
      highestSeverity: null,
      fetchedAt,
      credibility: buildWarningsCredibility(fetchedAt, 'error'),
    }, { status: 502 });
  }
}
