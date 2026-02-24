'use client';

/**
 * DecisionPanel — the main instrument.
 * Shows GO / CAUTION / NO-GO for flight and farm ops.
 * Binary first. Explanation second. No clutter.
 */

import { formatTime } from '../lib/time';

type Verdict = 'GO' | 'CAUTION' | 'NO_GO';

interface Decision {
  verdict: Verdict;
  reason: string;
}

interface FlightWindow {
  start: string;
  end: string;
  verdict: Verdict;
  summary: string;
}

interface SprayWindow {
  start: string;
  end: string;
  verdict: Verdict;
  summary: string;
}

export interface DecisionData {
  updatedAt: string;
  flight: {
    now: {
      overall: Decision;
      runway: { id: string; headwind: number; crosswind: number };
      wind: Decision;
      visibility: Decision;
      ceiling: Decision;
      densityAlt: Decision;
      fog: Decision;
      precipitation: Decision;
      details: {
        cloudBaseFt: number;
        densityAltFt: number;
        gustFactor: number;
        fogRisk: string;
      };
    };
    windows: FlightWindow[];
  };
  farm: {
    spray: { overall: Decision };
    fieldAccess: { overall: Decision };
    hay: { overall: Decision };
    sprayWindows: SprayWindow[];
  };
  warnings: {
    count: number;
    highest: string | null;
    dangerNearby: boolean;
    items: { headline: string; severity: string }[];
  };
  weather: {
    farm: { tempC: number; windSpeedKmh: number; windGustKmh: number; windDirectionDeg: number; humidity: number; precipitationMm: number };
    airport: { tempC: number; windSpeedKmh: number; windGustKmh: number; windDirectionDeg: number; precipitationMm: number };
    rainNext6hMm: number;
    rainPast24hMm: number;
  };
}

const VERDICT_COLORS: Record<Verdict, string> = {
  GO: '#00c853',
  CAUTION: '#ffd600',
  NO_GO: '#ff1744',
};

const VERDICT_BG: Record<Verdict, string> = {
  GO: 'rgba(0, 200, 83, 0.15)',
  CAUTION: 'rgba(255, 214, 0, 0.15)',
  NO_GO: 'rgba(255, 23, 68, 0.15)',
};

const VERDICT_LABELS: Record<Verdict, string> = {
  GO: 'GO',
  CAUTION: 'CAUTION',
  NO_GO: 'NO-GO',
};

function VerdictBadge({ verdict, size = 'large' }: { verdict: Verdict; size?: 'large' | 'small' }) {
  const fontSize = size === 'large' ? '2rem' : '1.1rem';
  const padding = size === 'large' ? '0.5rem 1.5rem' : '0.25rem 0.75rem';
  return (
    <span style={{
      display: 'inline-block',
      fontSize,
      fontWeight: 900,
      fontFamily: 'monospace',
      color: VERDICT_COLORS[verdict],
      backgroundColor: VERDICT_BG[verdict],
      border: `3px solid ${VERDICT_COLORS[verdict]}`,
      borderRadius: '8px',
      padding,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      lineHeight: 1,
    }}>
      {VERDICT_LABELS[verdict]}
    </span>
  );
}

function DecisionRow({ label, decision }: { label: string; decision: Decision }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #333',
      gap: '1rem',
    }}>
      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e0e0e0', minWidth: '120px' }}>{label}</span>
      <span style={{ flex: 1, fontSize: '0.95rem', color: '#aaa', textAlign: 'right', marginRight: '1rem' }}>{decision.reason}</span>
      <VerdictBadge verdict={decision.verdict} size="small" />
    </div>
  );
}

function WindowRow({ label, start, end, verdict }: { label: string; start: string; end: string; verdict: Verdict }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1rem',
      borderBottom: '1px solid #222',
    }}>
      <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: VERDICT_COLORS[verdict] }}>
        {formatTime(start)}–{formatTime(end)}
      </span>
      <span style={{ fontSize: '0.9rem', color: '#888' }}>{label}</span>
      <VerdictBadge verdict={verdict} size="small" />
    </div>
  );
}

function windArrow(deg: number): string {
  const arrows = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(deg / 45) % 8;
  return arrows[idx];
}

export default function DecisionPanel({ data }: { data: DecisionData | null }) {
  if (!data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#888', fontSize: '1.3rem' }}>
        Loading command center...
      </div>
    );
  }

  const { flight, farm, warnings, weather } = data;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* DANGER BANNER */}
      {warnings.dangerNearby && (
        <div style={{
          background: '#ff1744',
          color: '#fff',
          padding: '1rem 1.5rem',
          fontSize: '1.3rem',
          fontWeight: 900,
          fontFamily: 'monospace',
          textAlign: 'center',
          borderRadius: '8px',
          marginBottom: '1rem',
          animation: 'pulse 2s infinite',
        }}>
          WARNING: {warnings.items[0]?.headline || 'Severe weather active'}
        </div>
      )}

      {/* TOP: THE FIVE QUESTIONS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* CAN I FLY? */}
        <div style={{
          background: VERDICT_BG[flight.now.overall.verdict],
          border: `2px solid ${VERDICT_COLORS[flight.now.overall.verdict]}`,
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>CAN I FLY?</div>
          <VerdictBadge verdict={flight.now.overall.verdict} />
          <div style={{ marginTop: '0.75rem', fontSize: '1rem', color: '#ccc' }}>{flight.now.overall.reason}</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
            RWY {flight.now.runway.id} | {flight.now.runway.crosswind}kt xwind
          </div>
        </div>

        {/* CAN I SPRAY? */}
        <div style={{
          background: VERDICT_BG[farm.spray.overall.verdict],
          border: `2px solid ${VERDICT_COLORS[farm.spray.overall.verdict]}`,
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>CAN I SPRAY?</div>
          <VerdictBadge verdict={farm.spray.overall.verdict} />
          <div style={{ marginTop: '0.75rem', fontSize: '1rem', color: '#ccc' }}>{farm.spray.overall.reason}</div>
        </div>

        {/* WILL RAIN HIT ME? */}
        <div style={{
          background: weather.rainNext6hMm > 5 ? VERDICT_BG['NO_GO'] : weather.rainNext6hMm > 1 ? VERDICT_BG['CAUTION'] : VERDICT_BG['GO'],
          border: `2px solid ${weather.rainNext6hMm > 5 ? VERDICT_COLORS['NO_GO'] : weather.rainNext6hMm > 1 ? VERDICT_COLORS['CAUTION'] : VERDICT_COLORS['GO']}`,
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>WILL RAIN HIT ME?</div>
          <VerdictBadge verdict={weather.rainNext6hMm > 5 ? 'NO_GO' : weather.rainNext6hMm > 1 ? 'CAUTION' : 'GO'} />
          <div style={{ marginTop: '0.75rem', fontSize: '1rem', color: '#ccc' }}>
            {weather.rainNext6hMm > 5
              ? `${weather.rainNext6hMm}mm expected in 6h`
              : weather.rainNext6hMm > 1
              ? `${weather.rainNext6hMm}mm possible in 6h`
              : 'No significant rain in 6h'}
          </div>
        </div>

        {/* DANGER NEARBY? */}
        <div style={{
          background: warnings.dangerNearby ? VERDICT_BG['NO_GO'] : warnings.count > 0 ? VERDICT_BG['CAUTION'] : VERDICT_BG['GO'],
          border: `2px solid ${warnings.dangerNearby ? VERDICT_COLORS['NO_GO'] : warnings.count > 0 ? VERDICT_COLORS['CAUTION'] : VERDICT_COLORS['GO']}`,
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>DANGER NEARBY?</div>
          <VerdictBadge verdict={warnings.dangerNearby ? 'NO_GO' : warnings.count > 0 ? 'CAUTION' : 'GO'} />
          <div style={{ marginTop: '0.75rem', fontSize: '1rem', color: '#ccc' }}>
            {warnings.dangerNearby
              ? `${warnings.count} active warning${warnings.count > 1 ? 's' : ''} — ${warnings.highest}`
              : warnings.count > 0
              ? `${warnings.count} minor warning${warnings.count > 1 ? 's' : ''}`
              : 'No active warnings'}
          </div>
        </div>
      </div>

      {/* WHAT SHOULD I DO NEXT? */}
      <div style={{
        background: '#1a1a1a',
        border: '2px solid #444',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
          WHAT SHOULD I DO NEXT?
        </div>
        <div style={{ fontSize: '1.15rem', color: '#e0e0e0', lineHeight: 1.5 }}>
          {generateNextAction(data)}
        </div>
      </div>

      {/* FLIGHT WINDOWS */}
      {flight.windows.length > 0 && (
        <div style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            FLIGHT WINDOWS
          </div>
          {flight.windows.map((w, i) => (
            <WindowRow key={i} label={w.summary} start={w.start} end={w.end} verdict={w.verdict} />
          ))}
        </div>
      )}

      {/* SPRAY WINDOWS */}
      {farm.sprayWindows.length > 0 && (
        <div style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            SPRAY WINDOWS
          </div>
          {farm.sprayWindows.map((w, i) => (
            <WindowRow key={i} label={w.summary} start={w.start} end={w.end} verdict={w.verdict} />
          ))}
        </div>
      )}

      {/* WEATHER STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <WeatherCell label="FARM TEMP" value={`${weather.farm.tempC}°C`} />
        <WeatherCell label="WIND" value={`${weather.farm.windSpeedKmh} km/h ${windArrow(weather.farm.windDirectionDeg)}`} />
        <WeatherCell label="GUSTS" value={`${weather.farm.windGustKmh} km/h`} />
        <WeatherCell label="HUMIDITY" value={`${weather.farm.humidity}%`} />
        <WeatherCell label="RAIN 24H" value={`${weather.rainPast24hMm}mm`} />
        <WeatherCell label="RAIN 6H" value={`${weather.rainNext6hMm}mm`} />
      </div>

      {/* FLIGHT DETAIL STRIP */}
      <div style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', borderBottom: '1px solid #333' }}>
          FLIGHT CHECKS
        </div>
        <DecisionRow label="Wind" decision={flight.now.wind} />
        <DecisionRow label="Visibility" decision={flight.now.visibility} />
        <DecisionRow label="Ceiling" decision={flight.now.ceiling} />
        <DecisionRow label="Density Alt" decision={flight.now.densityAlt} />
        <DecisionRow label="Fog" decision={flight.now.fog} />
        <DecisionRow label="Precip" decision={flight.now.precipitation} />
      </div>

      {/* FARM OPS STRIP */}
      <div style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', borderBottom: '1px solid #333' }}>
          FARM OPS
        </div>
        <DecisionRow label="Spray" decision={farm.spray.overall} />
        <DecisionRow label="Field Access" decision={farm.fieldAccess.overall} />
        <DecisionRow label="Hay" decision={farm.hay.overall} />
      </div>

    </div>
  );
}

function WeatherCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '0.75rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e0e0e0', fontFamily: 'monospace' }}>{value}</div>
    </div>
  );
}

function generateNextAction(data: DecisionData): string {
  const { flight, farm, warnings, weather } = data;

  // Danger first
  if (warnings.dangerNearby) {
    return `Severe weather active. ${warnings.items[0]?.headline || 'Check warnings immediately.'}`;
  }

  // Rain incoming
  if (weather.rainNext6hMm > 10) {
    return `Rain incoming (${weather.rainNext6hMm}mm in 6h). Secure loose items, close sheds.`;
  }

  // Best action based on current conditions
  if (flight.now.overall.verdict === 'GO' && farm.spray.overall.verdict !== 'GO') {
    return 'Good flying weather. Spray conditions not ideal — fly first if you need to.';
  }

  if (farm.spray.overall.verdict === 'GO' && flight.now.overall.verdict !== 'GO') {
    return 'Spray window open. Flying marginal — spray while you can.';
  }

  if (flight.now.overall.verdict === 'GO' && farm.spray.overall.verdict === 'GO') {
    return 'Both flight and spray windows open. Pick your priority.';
  }

  // Look for upcoming windows
  if (flight.windows.length > 0) {
    const nextWindow = flight.windows[0];
    return `Flight window: ${formatTime(nextWindow.start)}–${formatTime(nextWindow.end)}. ${nextWindow.summary}.`;
  }

  if (farm.sprayWindows.length > 0) {
    const nextWindow = farm.sprayWindows[0];
    return `Spray window: ${formatTime(nextWindow.start)}–${formatTime(nextWindow.end)}.`;
  }

  if (weather.rainNext6hMm > 2) {
    return `Rain likely (${weather.rainNext6hMm}mm in 6h). Paperwork day.`;
  }

  return 'No immediate windows. Monitor conditions.';
}
