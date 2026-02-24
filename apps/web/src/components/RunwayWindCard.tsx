'use client';

/**
 * RunwayWindCard — shows wind relative to each runway.
 * Visual crosswind/headwind indicator. Instrument-panel style.
 */

import { crosswindComponent, headwindComponent, bestRunway, kmhToKts } from '@hmffcc/decision-engine';
import { RUNWAYS } from '../lib/config';

interface Props {
  windDir: number;
  windSpeedKmh: number;
  windGustKmh: number;
}

export default function RunwayWindCard({ windDir, windSpeedKmh, windGustKmh }: Props) {
  const windKts = kmhToKts(windSpeedKmh);
  const gustKts = kmhToKts(windGustKmh);
  const best = bestRunway(windDir, windKts, [...RUNWAYS]);

  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '1rem',
    }}>
      <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
        RUNWAY WIND — YTYA
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {RUNWAYS.map(rwy => {
          const xw = Math.abs(crosswindComponent(windDir, windKts, rwy.heading_deg));
          const hw = headwindComponent(windDir, windKts, rwy.heading_deg);
          const isBest = rwy.id === best.id;

          return (
            <div key={rwy.id} style={{
              background: isBest ? 'rgba(0, 200, 83, 0.1)' : '#0a0a0a',
              border: isBest ? '2px solid #00c853' : '1px solid #222',
              borderRadius: '8px',
              padding: '0.75rem',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                fontFamily: 'monospace',
                color: isBest ? '#00c853' : '#e0e0e0',
              }}>
                {rwy.id}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                {hw >= 0 ? 'HW' : 'TW'} {Math.abs(hw)}kt | XW {xw}kt
              </div>
              {isBest && (
                <div style={{ fontSize: '0.7rem', color: '#00c853', marginTop: '0.25rem', fontWeight: 700 }}>
                  BEST
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
        Wind {windDir}° at {windKts}kt (gusts {gustKts}kt)
      </div>
    </div>
  );
}
