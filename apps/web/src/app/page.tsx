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

      if (!decisionRes.ok) {
        throw new Error(`API error: decision=${decisionRes.status}`);
      }

      const decisionJson = await (decisionRes.json() as Promise<DecisionData>);

      const [weatherResult, warningsResult, radarResult] = await Promise.allSettled([
        weatherRes.json() as Promise<WeatherApiResponse>,
        warningsRes.json() as Promise<WarningsApiResponse>,
        radarRes.json() as Promise<RadarApiResponse>,
      ]);

      setData(decisionJson);

      if (weatherResult.status === 'fulfilled' && weatherResult.value.credibility) {
        setWeatherCredibility(weatherResult.value.credibility);
      }
      if (warningsResult.status === 'fulfilled' && warningsResult.value.credibility) {
        setWarningsCredibility(warningsResult.value.credibility);
      }
      if (radarResult.status === 'fulfilled' && radarResult.value.credibility) {
        setRadarCredibility(radarResult.value.credibility);
      }
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
      <DecisionPanel data={data} />
      <AutoRefresh />
    </>
  );
}
