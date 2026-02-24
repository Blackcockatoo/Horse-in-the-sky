'use client';

import { useEffect, useState } from 'react';

function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function PersonalStatusBar() {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto 1rem auto',
      background: '#101010',
      border: '1px solid #2f2f2f',
      borderRadius: '10px',
      padding: '0.65rem 0.9rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.75rem',
      fontFamily: 'monospace',
    }}>
      <div style={{ color: '#9a9a9a', letterSpacing: '0.08em', fontSize: '0.78rem' }}>
        PETER MORAN · PERSONAL COMMAND FEED
      </div>
      <div style={{ color: '#00c853', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.9rem' }}>
        LOCAL TIME {clock}
      </div>
    </div>
  );
}
