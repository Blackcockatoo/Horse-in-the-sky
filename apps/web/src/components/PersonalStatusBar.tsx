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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
}

export default function PersonalStatusBar() {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [today, setToday] = useState(() => formatDate(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setClock(formatClock(now));
      setToday(formatDate(now));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto 1rem auto',
      background: 'linear-gradient(145deg, #131a19, #0c0f0f)',
      border: '1px solid #274034',
      borderRadius: '10px',
      padding: '0.65rem 0.9rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.75rem',
      fontFamily: 'monospace',
    }}>
      <div style={{ color: '#9a9a9a', letterSpacing: '0.08em', fontSize: '0.78rem' }}>
        PETER MORAN · PERSONAL COMMAND FEED · {today}
      </div>
      <div style={{ color: '#7bf4a5', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.9rem' }}>
        LOCAL TIME {clock}
      </div>
    </div>
  );
}
