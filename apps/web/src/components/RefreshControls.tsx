'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface RefreshControlsProps {
  lastUpdatedLabel: string;
  onRefresh?: () => Promise<void> | void;
}

export default function RefreshControls({ lastUpdatedLabel, onRefresh }: RefreshControlsProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await onRefresh?.();
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 350);
    }
  };

  const disabled = isRefreshing || isPending;

  return (
    <div
      style={{
        marginTop: '1rem',
        fontSize: '0.8rem',
        color: '#555',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      <span>{lastUpdatedLabel}</span>
      <button
        onClick={handleRefresh}
        disabled={disabled}
        style={{
          background: disabled ? '#1f1f1f' : '#222',
          color: disabled ? '#666' : '#bbb',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '0.6rem 1rem',
          fontSize: '0.95rem',
          fontWeight: 700,
          fontFamily: 'monospace',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {disabled ? 'Refreshing…' : 'Refresh now'}
      </button>
    </div>
  );
}
