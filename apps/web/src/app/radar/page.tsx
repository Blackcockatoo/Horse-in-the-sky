'use client';

/**
 * Radar page — full-screen BOM radar loop.
 * No clutter. Just the radar.
 */

import RadarLoop from '../../components/RadarLoop';
import AutoRefresh from '../../components/AutoRefresh';

export default function RadarPage() {
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
      <RadarLoop />
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555', textAlign: 'center' }}>
        Source: Bureau of Meteorology | Auto-refreshes with BOM loop
      </div>
      <AutoRefresh />
    </div>
  );
}
