'use client';

/**
 * Radar page — full-screen BOM radar loop.
 * No clutter. Just the radar.
 */

import RadarLoop from '../../components/RadarLoop';
import { RADAR_URLS } from '../../server/providers/bom.provider';

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
      <div style={{ marginBottom: '1rem' }}>
        <a
          href={RADAR_URLS.melbourne256}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '48px',
            padding: '0.75rem 1rem',
            background: '#ffe100',
            color: '#111',
            fontSize: '1rem',
            fontWeight: 800,
            borderRadius: '8px',
            textDecoration: 'none',
            border: '2px solid #111',
          }}
        >
          Open BOM Radar
        </a>
      </div>
      <RadarLoop />
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555', textAlign: 'center' }}>
        Source: Bureau of Meteorology | Auto-refreshes with BOM loop
      </div>
    </div>
  );
}
