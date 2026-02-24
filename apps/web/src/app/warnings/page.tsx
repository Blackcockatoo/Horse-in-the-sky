'use client';

/**
 * Warnings page — all active BOM warnings for Victoria.
 * Severity-sorted. Colour-coded.
 */

import { useEffect, useState } from 'react';
import type { WarningsData, Warning } from '../../types/warning.types';
import { formatDateTime } from '../../lib/time';
import DataCredibilityCard from '../../components/DataCredibilityCard';

const SEVERITY_COLORS: Record<string, string> = {
  EXTREME: '#ff1744',
  SEVERE: '#ff6d00',
  MODERATE: '#ffd600',
  MINOR: '#888',
  UNKNOWN: '#555',
};

const SEVERITY_ORDER = ['EXTREME', 'SEVERE', 'MODERATE', 'MINOR', 'UNKNOWN'];

export default function WarningsPage() {
  const [data, setData] = useState<WarningsData | null>(null);

  useEffect(() => {
    fetch('/api/warnings')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);

    const interval = setInterval(() => {
      fetch('/api/warnings').then(r => r.json()).then(setData).catch(console.error);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return <div style={{ padding: '2rem', color: '#888', fontFamily: 'monospace' }}>Loading warnings...</div>;
  }

  const sorted = [...data.warnings].sort((a, b) => {
    return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
  });

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
        ACTIVE WARNINGS — VICTORIA
      </h1>

      {data.credibility && (
        <DataCredibilityCard title="WARNINGS FEED" metadata={data.credibility} thresholdMinutes={15} />
      )}

      {sorted.length === 0 ? (
        <div style={{
          background: 'rgba(0, 200, 83, 0.1)',
          border: '2px solid #00c853',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          color: '#00c853',
          fontSize: '1.3rem',
          fontWeight: 700,
          fontFamily: 'monospace',
        }}>
          ALL CLEAR — No active warnings
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sorted.map((w, i) => (
            <WarningCard key={i} warning={w} />
          ))}
        </div>
      )}

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555', textAlign: 'center' }}>
        Source: Bureau of Meteorology | Updated {data.fetchedAt ? formatDateTime(data.fetchedAt) : 'N/A'}
      </div>
    </div>
  );
}

function WarningCard({ warning }: { warning: Warning }) {
  const color = SEVERITY_COLORS[warning.severity] || '#555';
  return (
    <div style={{
      background: '#111',
      border: `2px solid ${color}`,
      borderLeft: `6px solid ${color}`,
      borderRadius: '8px',
      padding: '1rem 1.25rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 900, color, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          {warning.severity}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#666' }}>
          {warning.issued ? formatDateTime(warning.issued) : ''}
        </span>
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e0e0e0', marginBottom: '0.5rem' }}>
        {warning.headline}
      </div>
      {warning.description && (
        <div style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: 1.5 }}>
          {warning.description.slice(0, 300)}{warning.description.length > 300 ? '...' : ''}
        </div>
      )}
      {warning.areas.length > 0 && (
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
          Areas: {warning.areas.join(', ')}
        </div>
      )}
    </div>
  );
}
