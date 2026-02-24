'use client';

/**
 * DASHBOARD — The command center.
 * One screen. Fiv…11 chars truncated… answered. No scrolling required for decisions.
 */

import { useEffect, useState, useCallback } from 'react';
import DecisionPanel from '../components/DecisionPanel';
import DataCredibilityCard from '../components/DataCredibilityCard';
import type { DataCredibilityMeta } from '../types/wx.types';

interface WarningsApiResponse {
  credibility?: DataCredibilityMeta;
}

interface RadarApiResponse {
  credibility?: DataCredibilityMeta;
}

interface WeatherApiResponse {
  credibility?: DataCredibilityMeta;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherCredibility, setWeatherCredibility] = useState<DataCredibilityMeta | null>(null);
  const [warningsCredibility, setWarningsCredibility] = useState<DataCredibilityMeta | null>(null);
  const [radarCredibility, setRadarCredibility] = useState<DataCredibilityMeta | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [decisionRes, weatherRes, warningsRes, radarRes] = await Promise.all([
        fetch('/api/decision'),
        fetch('/api/weather'),
        fetch('/api/warnings'),
        fetch('/api/radar'),
      ]);

      if (!decisionRes.ok) throw new Error(`${decisionRes.status}`);
      const [decisionJson, weatherJson, warningsJson, radarJson] = await Promise.all([
        decisionRes.json(),
        weatherRes.json() as Promise<WeatherApiResponse>,
        warningsRes.json() as Promise<WarningsApiResponse>,
        radarRes.json() as Promise<RadarApiResponse>,
      ]);

      setData(decisionJson);
      if (weatherJson.credibility) setWeatherCredibility(weatherJson.credibility);
      if (warningsJson.credibility) setWarningsCredibility(warningsJson.credibility);
      if (radarJson.credibility) setRadarCredibility(radarJson.credibility);
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
    <>
      <div style={{ maxWidth: '920px', margin: '0 auto 1rem auto' }}>
        {weatherCredibility && (
          <DataCredibilityCard title="WEATHER FEED" metadata={weatherCredibility} thresholdMinutes={30} />
        )}
        {warningsCredibility && (
          <DataCredibilityCard title="WARNINGS FEED" metadata={warningsCredibility} thresholdMinutes={15} />
        )}
        {radarCredibility && (
          <DataCredibilityCard title="RADAR FEED" metadata={radarCredibility} thresholdMinutes={15} />
        )}
      </div>
      <DecisionPanel data={data} />
    </>
  );
}
