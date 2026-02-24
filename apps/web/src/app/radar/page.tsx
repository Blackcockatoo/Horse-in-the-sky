'use client';

/**
 * Radar page — full-screen BOM radar loop.
 * No clutter. Just the radar.
 */

import { useEffect, useState } from 'react';
import RadarLoop from '../../components/RadarLoop';
import DataCredibilityCard from '../../components/DataCredibilityCard';
import type { DataCredibilityMeta } from '../../types/wx.types';

interface RadarApiResponse {
  urls: {
    melbourne256: string;
    melbourne128: string;
  };
  credibility?: DataCredibilityMeta;
}

export default function RadarPage() {
  const [data, setData] = useState<RadarApiResponse | null>(null);

  useEffect(() => {
    fetch('/api/radar').then(r => r.json()).then(setData).catch(console.error);
    const interval = setInterval(() => {
      fetch('/api/radar').then(r => r.json()).then(setData).catch(console.error);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '1rem',
        color: '#888',
        fontWeight: 700,
        letterSpacing: '0.15em',
        margin: '0 0 1rem 0',
        fontFamily: 'monospace',
      }}>
        MELBOURNE RADAR
      </h1>
      {data?.credibility && (
        <DataCredibilityCard title="RADAR FEED" metadata={data.credibility} thresholdMinutes={15} />
      )}
      <RadarLoop urls={data?.urls} />
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555', textAlign: 'center' }}>
        Source: Bureau of Meteorology | Auto-refreshes with BOM loop
      </div>
    </div>
  );
}
