'use client';

/**
 * Radar page — full-screen BOM radar loop.
 * No clutter. Just the radar.
 */

import { useState } from 'react';
import RadarLoop from '../../components/RadarLoop';
import RefreshControls from '../../components/RefreshControls';
import { formatDateTime } from '../../lib/time';

export default function RadarPage() {
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setLastUpdated(new Date().toISOString());
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '1rem',
        color: '#888',
        fontWeight: 700,
        letterSpacing: '0.15em',
        margin: '0 0 1rem 0',
        fontFamily: 'monospace',
      }}>
        MELBOURNE RADAR
      </h1>
      <RadarLoop key={refreshKey} />
      <RefreshControls
        lastUpdatedLabel={`Source: Bureau of Meteorology | Updated ${formatDateTime(lastUpdated)}`}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
