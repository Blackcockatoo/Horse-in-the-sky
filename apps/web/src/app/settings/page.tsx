'use client';

/**
 * Settings page — adjust thresholds.
 * Hidden complexity. One page. Only what matters.
 */

import { useState, useEffect } from 'react';

interface Thresholds {
  maxCrosswindKts: number;
  maxGustKts: number;
  minVisibilityKm: number;
  minCloudBaseFt: number;
  maxSprayWindKmh: number;
  minSprayWindKmh: number;
}

const DEFAULTS: Thresholds = {
  maxCrosswindKts: 12,
  maxGustKts: 25,
  minVisibilityKm: 5,
  minCloudBaseFt: 1500,
  maxSprayWindKmh: 15,
  minSprayWindKmh: 3,
};

export default function SettingsPage() {
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hmffcc_thresholds');
      if (stored) setThresholds(JSON.parse(stored));
    } catch { /* use defaults */ }
  }, []);

  function save() {
    localStorage.setItem('hmffcc_thresholds', JSON.stringify(thresholds));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function reset() {
    setThresholds(DEFAULTS);
    localStorage.removeItem('hmffcc_thresholds');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function update(key: keyof Thresholds, value: string) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setThresholds(prev => ({ ...prev, [key]: num }));
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '1rem',
        color: '#888',
        fontWeight: 700,
        letterSpacing: '0.15em',
        margin: '0 0 1.5rem 0',
        fontFamily: 'monospace',
      }}>
        ADJUST LIMITS
      </h1>

      <div style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', borderBottom: '1px solid #333' }}>
          FLIGHT LIMITS
        </div>
        <ThresholdRow label="Max crosswind (kt)" value={thresholds.maxCrosswindKts} onChange={v => update('maxCrosswindKts', v)} />
        <ThresholdRow label="Max gusts (kt)" value={thresholds.maxGustKts} onChange={v => update('maxGustKts', v)} />
        <ThresholdRow label="Min visibility (km)" value={thresholds.minVisibilityKm} onChange={v => update('minVisibilityKm', v)} />
        <ThresholdRow label="Min cloud base (ft)" value={thresholds.minCloudBaseFt} onChange={v => update('minCloudBaseFt', v)} />
      </div>

      <div style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', borderBottom: '1px solid #333' }}>
          SPRAY LIMITS
        </div>
        <ThresholdRow label="Max spray wind (km/h)" value={thresholds.maxSprayWindKmh} onChange={v => update('maxSprayWindKmh', v)} />
        <ThresholdRow label="Min spray wind (km/h)" value={thresholds.minSprayWindKmh} onChange={v => update('minSprayWindKmh', v)} />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={save}
          style={{
            flex: 1,
            background: '#00c853',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 900,
            fontFamily: 'monospace',
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          {saved ? 'SAVED' : 'SAVE'}
        </button>
        <button
          onClick={reset}
          style={{
            background: 'transparent',
            color: '#888',
            border: '1px solid #555',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          RESET
        </button>
      </div>
    </div>
  );
}

function ThresholdRow({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #222',
    }}>
      <label style={{ fontSize: '0.95rem', color: '#ccc' }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: '#0a0a0a',
          border: '1px solid #555',
          color: '#e0e0e0',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          fontSize: '1.1rem',
          fontFamily: 'monospace',
          fontWeight: 700,
          width: '100px',
          textAlign: 'right',
        }}
      />
    </div>
  );
}
