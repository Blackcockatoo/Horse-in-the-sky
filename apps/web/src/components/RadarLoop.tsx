'use client';

/**
 * RadarLoop — embedded BOM radar.
 * No scraping. Iframe of official BOM radar page.
 * 256km Melbourne loop by default. Toggle to 128km 5-min rainfall.
 */

import { useState } from 'react';
import { RADAR_URLS } from '../server/providers/bom.provider';

interface RadarLoopProps {
  urls?: {
    melbourne256: string;
    melbourne128: string;
  };
}

export default function RadarLoop({ urls }: RadarLoopProps) {
  const [view, setView] = useState<'256' | '128'>('256');

  const radarUrls = urls ?? RADAR_URLS;
  const url = view === '256' ? radarUrls.melbourne256 : radarUrls.melbourne128;

  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #333',
      }}>
        <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em' }}>
          MELBOURNE RADAR
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setView('256')}
            style={{
              background: view === '256' ? '#333' : 'transparent',
              color: view === '256' ? '#fff' : '#888',
              border: '1px solid #555',
              borderRadius: '4px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            256km
          </button>
          <button
            onClick={() => setView('128')}
            style={{
              background: view === '128' ? '#333' : 'transparent',
              color: view === '128' ? '#fff' : '#888',
              border: '1px solid #555',
              borderRadius: '4px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            128km
          </button>
        </div>
      </div>
      <div style={{ position: 'relative', width: '100%', height: '0', paddingBottom: '75%' }}>
        <iframe
          src={url}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="BOM Radar Loop"
          loading="lazy"
        />
      </div>
    </div>
  );
}
