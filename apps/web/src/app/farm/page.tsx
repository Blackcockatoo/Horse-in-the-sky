'use client';

/**
 * Farm page — detailed farm operations.
 * Spray windows, field access, hay conditions.
 */

import { useEffect, useState } from 'react';
import FarmOpsCard from '../../components/FarmOpsCard';
import LogbookQuickAdd from '../../components/LogbookQuickAdd';
import { formatTime } from '../../lib/time';

type Verdict = 'GO' | 'CAUTION' | 'NO_GO';

const VERDICT_COLORS: Record<Verdict, string> = {
  GO: '#00c853',
  CAUTION: '#ffd600',
  NO_GO: '#ff1744',
};

export default function FarmPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/decision')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <div style={{ padding: '2rem', color: '#888', fontFamily: 'monospace' }}>Loading farm data...</div>;
  }

  const farm = data.farm as {
    spray: { overall: { verdict: Verdict; reason: string }; details: { deltaT: number; driftRisk: string } };
    fieldAccess: { overall: { verdict: Verdict; reason: string } };
    hay: { overall: { verdict: Verdict; reason: string } };
    sprayWindows: { start: string; end: string; verdict: Verdict; summary: string }[];
  };
  const weather = data.weather as {
    farm: { tempC: number; dewpointC: number; windSpeedKmh: number; windGustKmh: number; humidity: number };
    rainPast24hMm: number;
    rainNext6hMm: number;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '1rem',
        color: '#888',
        fontWeight: 700,
        letterSpacing: '0.15em',
        margin: '0 0 1rem 0',
        fontFamily: 'monospace',
      }}>
        FARM OPS — HEAVENS MEADOW
      </h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <FarmOpsCard
          spray={farm.spray}
          fieldAccess={farm.fieldAccess}
          hay={farm.hay}
          rainPast24hMm={weather.rainPast24hMm}
          rainNext6hMm={weather.rainNext6hMm}
        />
      </div>

      {/* Spray detail */}
      <div style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
          SPRAY CONDITIONS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
          <InfoCell label="DELTA-T" value={`${farm.spray.details.deltaT.toFixed(1)}°C`} />
          <InfoCell label="DRIFT RISK" value={farm.spray.details.driftRisk} />
          <InfoCell label="WIND" value={`${weather.farm.windSpeedKmh} km/h`} />
          <InfoCell label="GUSTS" value={`${weather.farm.windGustKmh} km/h`} />
          <InfoCell label="HUMIDITY" value={`${weather.farm.humidity}%`} />
          <InfoCell label="TEMP" value={`${weather.farm.tempC}°C`} />
        </div>
      </div>

      {/* Spray windows */}
      {farm.sprayWindows.length > 0 && (
        <div style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
            SPRAY WINDOWS
          </div>
          {farm.sprayWindows.map((w, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0',
              borderBottom: i < farm.sprayWindows.length - 1 ? '1px solid #222' : 'none',
            }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: VERDICT_COLORS[w.verdict],
              }}>
                {formatTime(w.start)}–{formatTime(w.end)}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>{w.summary}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick log */}
      <LogbookQuickAdd />
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid #222',
      borderRadius: '8px',
      padding: '0.75rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e0e0e0', fontFamily: 'monospace' }}>{value}</div>
    </div>
  );
}
