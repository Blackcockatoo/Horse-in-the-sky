'use client';

/**
 * Flight page — detailed flight assessment.
 * Runway winds, density altitude, flight windows.
 */

import { useEffect, useState, useCallback } from 'react';
import RunwayWindCard from '../../components/RunwayWindCard';
import RefreshControls from '../../components/RefreshControls';
import { formatDateTime, formatTime } from '../../lib/time';

type Verdict = 'GO' | 'CAUTION' | 'NO_GO';

const VERDICT_COLORS: Record<Verdict, string> = {
  GO: '#00c853',
  CAUTION: '#ffd600',
  NO_GO: '#ff1744',
};

const VERDICT_LABELS: Record<Verdict, string> = {
  GO: 'GO',
  CAUTION: 'CAUTION',
  NO_GO: 'NO-GO',
};

export default function FlightPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  const fetchFlightData = useCallback(async () => {
    try {
      const response = await fetch('/api/decision');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchFlightData();
  }, [fetchFlightData]);

  if (!data) {
    return <div style={{ padding: '2rem', color: '#888', fontFamily: 'monospace' }}>Loading flight data...</div>;
  }

  const flight = data.flight as {
    now: {
      overall: { verdict: Verdict; reason: string };
      runway: { id: string; headwind: number; crosswind: number };
      wind: { verdict: Verdict; reason: string };
      visibility: { verdict: Verdict; reason: string };
      ceiling: { verdict: Verdict; reason: string };
      densityAlt: { verdict: Verdict; reason: string };
      fog: { verdict: Verdict; reason: string };
      precipitation: { verdict: Verdict; reason: string };
      details: { cloudBaseFt: number; densityAltFt: number; gustFactor: number; fogRisk: string };
    };
    windows: { start: string; end: string; verdict: Verdict; summary: string }[];
  };
  const weather = data.weather as {
    airport: { windSpeedKmh: number; windGustKmh: number; windDirectionDeg: number; tempC: number; dewpointC: number; pressureHpa: number };
  };
  const updatedAt = data.updatedAt as string | undefined;

  const checks = [
    { label: 'Wind', ...flight.now.wind },
    { label: 'Visibility', ...flight.now.visibility },
    { label: 'Ceiling', ...flight.now.ceiling },
    { label: 'Density Alt', ...flight.now.densityAlt },
    { label: 'Fog', ...flight.now.fog },
    { label: 'Precipitation', ...flight.now.precipitation },
  ];

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
        FLIGHT — YTYA TYABB
      </h1>

      {/* Overall verdict */}
      <div style={{
        background: `rgba(${flight.now.overall.verdict === 'GO' ? '0,200,83' : flight.now.overall.verdict === 'CAUTION' ? '255,214,0' : '255,23,68'}, 0.15)`,
        border: `3px solid ${VERDICT_COLORS[flight.now.overall.verdict]}`,
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          fontSize: '3rem',
          fontWeight: 900,
          fontFamily: 'monospace',
          color: VERDICT_COLORS[flight.now.overall.verdict],
          letterSpacing: '0.15em',
        }}>
          {VERDICT_LABELS[flight.now.overall.verdict]}
        </div>
        <div style={{ fontSize: '1.1rem', color: '#ccc', marginTop: '0.5rem' }}>
          {flight.now.overall.reason}
        </div>
      </div>

      {/* Runway winds */}
      <div style={{ marginBottom: '1.5rem' }}>
        <RunwayWindCard
          windDir={weather.airport.windDirectionDeg}
          windSpeedKmh={weather.airport.windSpeedKmh}
          windGustKmh={weather.airport.windGustKmh}
        />
      </div>

      {/* Detail checks */}
      <div style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', borderBottom: '1px solid #333' }}>
          PRE-FLIGHT CHECKS
        </div>
        {checks.map((check, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderBottom: i < checks.length - 1 ? '1px solid #222' : 'none',
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#e0e0e0', minWidth: '100px' }}>{check.label}</span>
            <span style={{ flex: 1, fontSize: '0.9rem', color: '#888', textAlign: 'right', marginRight: '1rem' }}>{check.reason}</span>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: VERDICT_COLORS[check.verdict],
              border: `2px solid ${VERDICT_COLORS[check.verdict]}`,
              borderRadius: '4px',
              padding: '0.15rem 0.5rem',
            }}>
              {VERDICT_LABELS[check.verdict]}
            </span>
          </div>
        ))}
      </div>

      {/* Instrument readings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1.5rem',
      }}>
        <InstrumentCell label="CLOUD BASE" value={`${flight.now.details.cloudBaseFt} ft`} />
        <InstrumentCell label="DENSITY ALT" value={`${flight.now.details.densityAltFt} ft`} />
        <InstrumentCell label="GUST FACTOR" value={`${flight.now.details.gustFactor}`} />
        <InstrumentCell label="FOG RISK" value={flight.now.details.fogRisk} />
        <InstrumentCell label="QNH" value={`${weather.airport.pressureHpa} hPa`} />
        <InstrumentCell label="TEMP/DEW" value={`${weather.airport.tempC}/${weather.airport.dewpointC}°C`} />
      </div>

      {/* Flight windows */}
      {flight.windows.length > 0 && (
        <div style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1rem',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
            FLIGHT WINDOWS
          </div>
          {flight.windows.map((w, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0',
              borderBottom: i < flight.windows.length - 1 ? '1px solid #222' : 'none',
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

      <RefreshControls
        lastUpdatedLabel={`Updated ${updatedAt ? formatDateTime(updatedAt) : 'N/A'} | Flight assessment`}
        onRefresh={fetchFlightData}
      />
    </div>
  );
}

function InstrumentCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '0.75rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e0e0e0', fontFamily: 'monospace' }}>{value}</div>
    </div>
  );
}
