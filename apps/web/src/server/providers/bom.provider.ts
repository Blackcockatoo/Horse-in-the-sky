/**
 * BOM provider — pulls warnings from Bureau of Meteorology RSS feeds.
 * Radar is handled client-side via iframe/image embed.
 */

import { API_URLS } from '../../lib/config';
import type { WarningsData, Warning, WarningSeverity, WarningType } from '../../types/warning.types';

/**
 * Fetch BOM warnings from RSS feed and parse to normalized format.
 * BOM RSS uses standard RSS 2.0 XML.
 */
export async function fetchWarnings(): Promise<WarningsData> {
  try {
    const res = await fetch(API_URLS.bomWarnAll, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'HMFFCC/1.0 (Farm Flight Command Centre)' },
    });

    if (!res.ok) {
      console.error(`BOM warnings ${res.status}: ${res.statusText}`);
      return emptyWarnings();
    }

    const xml = await res.text();
    const warnings = parseRssWarnings(xml);

    const activeWarnings = warnings.filter(w => {
      if (!w.expires) return true;
      return new Date(w.expires) > new Date();
    });

    const severityOrder: WarningSeverity[] = ['EXTREME', 'SEVERE', 'MODERATE', 'MINOR', 'UNKNOWN'];
    const highestSeverity = activeWarnings.length > 0
      ? severityOrder.find(s => activeWarnings.some(w => w.severity === s)) ?? null
      : null;

    return {
      warnings: activeWarnings,
      activeCount: activeWarnings.length,
      highestSeverity,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('BOM warnings fetch failed:', err);
    return emptyWarnings();
  }
}

function emptyWarnings(): WarningsData {
  return {
    warnings: [],
    activeCount: 0,
    highestSeverity: null,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Parse BOM RSS XML into Warning objects.
 * Simple regex-based parsing — no XML lib dependency needed.
 */
function parseRssWarnings(xml: string): Warning[] {
  const warnings: Warning[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = extractTag(item, 'title');
    const description = extractTag(item, 'description');
    const pubDate = extractTag(item, 'pubDate');
    const link = extractTag(item, 'link');

    if (!title) continue;

    warnings.push({
      id: link || `bom-${Date.now()}-${warnings.length}`,
      severity: classifySeverity(title),
      type: classifyType(title),
      headline: title,
      description: description || '',
      areas: extractAreas(title, description || ''),
      issued: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      expires: '', // BOM RSS doesn't always include expiry
      source: 'BOM',
    });
  }

  return warnings;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's');
  const m = regex.exec(xml);
  return m ? m[1].trim() : null;
}

function classifySeverity(title: string): WarningSeverity {
  const t = title.toLowerCase();
  if (t.includes('extreme') || t.includes('emergency')) return 'EXTREME';
  if (t.includes('severe') || t.includes('dangerous')) return 'SEVERE';
  if (t.includes('warning')) return 'MODERATE';
  if (t.includes('watch') || t.includes('advisory')) return 'MINOR';
  return 'UNKNOWN';
}

function classifyType(title: string): WarningType {
  const t = title.toLowerCase();
  if (t.includes('storm') || t.includes('thunder')) return 'STORM';
  if (t.includes('flood')) return 'FLOOD';
  if (t.includes('fire') || t.includes('bushfire')) return 'FIRE';
  if (t.includes('wind') || t.includes('gale')) return 'WIND';
  if (t.includes('heat')) return 'HEAT';
  if (t.includes('frost')) return 'FROST';
  return 'OTHER';
}

function extractAreas(title: string, description: string): string[] {
  // BOM often includes area names like "for Western Port" or "for Central district"
  const combined = `${title} ${description}`;
  const areaMatch = combined.match(/for\s+([^.]+)/i);
  if (areaMatch) return [areaMatch[1].trim()];
  return ['Victoria'];
}

/** Radar URLs for embedding */
export const RADAR_URLS = {
  melbourne256: API_URLS.bomRadar256,
  melbourne128: API_URLS.bomRadar128,
};
