'use client';

/**
 * DASHBOARD — The command center.
 * One screen. Five questions answered. No scrolling required for decisions.
 */

import { useEffect, useState, useCallback } from 'react';
import DecisionPanel from '../components/DecisionPanel';
import RefreshControls from '../components/RefreshControls';
import { formatTime } from '../lib/time';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/decision');
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(json.updatedAt ?? new Date().toISOString());
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Retrying...');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000); // 10 min refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        color: '#888',
        fontSize: '1.3rem',
        fontFamily: 'monospace',
      }}>
        Pulling weather, radar, warnings...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        color: '#ff6d00',
        fontSize: '1.1rem',
        fontFamily: 'monospace',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>!</div>
        <div>{error}</div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          style={{
            marginTop: '1.5rem',
            background: '#333',
            color: '#e0e0e0',
            border: '1px solid #555',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div>
      <DecisionPanel data={data} />
      <RefreshControls
        lastUpdatedLabel={`Updated ${lastUpdated ? formatTime(lastUpdated) : 'N/A'} | Auto-refreshes every 10 min`}
        onRefresh={fetchData}
      />
    </div>
  );
}
