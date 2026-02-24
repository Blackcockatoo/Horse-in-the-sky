'use client';

/**
 * DASHBOARD — The command center.
 * One screen. Fiv…11 chars truncated… answered. No scrolling required for decisions.
 */

import { useEffect, useState, useCallback } from 'react';
import type { DecisionData } from '../components/DecisionPanel';
import type { DataCredibilityMeta, WeatherData } from '../types/wx.types';
import type { WarningsData } from '../types/warning.types';
import DecisionPanel from '../components/DecisionPanel';
import AutoRefresh from '../components/AutoRefresh';
import OfficialSafetyLinks from '../components/OfficialSafetyLinks';
import PersonalStatusBar from '../components/PersonalStatusBar';
import IntroDownloadCard from '../components/IntroDownloadCard';

type WeatherApiResponse = {
  farm?: WeatherData;
  airport?: WeatherData;
  credibility?: DataCredibilityMeta;
};

type WarningsApiResponse = WarningsData;

type RadarApiResponse = {
  urls: {
    melbourne256: string;
    melbourne128: string;
  };
  credibility?: DataCredibilityMeta;
};

export default function Dashboard() {
  const [data, setData] = useState<DecisionData | null>(null);
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

      if (!decisionRes.ok || !weatherRes.ok || !warningsRes.ok || !radarRes.ok) {
        throw new Error(`API error: decision=${decisionRes.status}, weather=${weatherRes.status}, warnings=${warningsRes.status}, radar=${radarRes.status}`);
      }

      const [decisionJson, weatherJson, warningsJson, radarJson] = await Promise.all([
        decisionRes.json() as Promise<DecisionData>,
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
      setError('Failed to fetch live data right now. You can still install the app below.');
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

  return (
    <>
      <OfficialSafetyLinks />
      <PersonalStatusBar />
      <IntroDownloadCard />

      {loading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '20vh',
          color: '#9fb2d7',
          fontSize: '1.05rem',
          fontFamily: 'monospace',
          textAlign: 'center',
          padding: '0.8rem',
        }}>
          Pulling weather, radar, warnings...
        </div>
      )}

      {!loading && error && !data && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '20vh',
          color: '#ffd27a',
          fontSize: '1rem',
          fontFamily: 'monospace',
          textAlign: 'center',
          padding: '1rem',
          border: '1px solid #5f4d2a',
          borderRadius: '10px',
          background: 'rgba(35, 24, 10, 0.45)',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>!</div>
          <div>{error}</div>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            style={{
              marginTop: '0.75rem',
              background: '#f7d548',
              color: '#0a2f70',
              border: '1px solid #f7d548',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            RETRY LIVE DATA
          </button>
        </div>
      )}

      {data && <DecisionPanel data={data} />}
      <AutoRefresh />
    </>
  );
}
