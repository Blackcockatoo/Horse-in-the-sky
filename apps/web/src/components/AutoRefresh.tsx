'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatHour } from '../lib/time';

const REFRESH_INTERVAL_MS = 20 * 60 * 1000;

export default function AutoRefresh() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState(() => formatHour(new Date()));
  const [isPending, startTransition] = useTransition();
  const didTriggerRefresh = useRef(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      didTriggerRefresh.current = true;
      startTransition(() => {
        router.refresh();
      });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [router]);

  useEffect(() => {
    if (!isPending && didTriggerRefresh.current) {
      setLastUpdated(formatHour(new Date()));
      didTriggerRefresh.current = false;
    }
  }, [isPending]);

  return (
    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#777', textAlign: 'center', fontFamily: 'monospace' }}>
      <div>Auto-refresh: every 20 min</div>
      <div>Last updated: {lastUpdated}</div>
    </div>
  );
}
