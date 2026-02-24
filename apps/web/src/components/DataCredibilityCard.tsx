'use client';

import type { DataCredibilityMeta } from '../types/wx.types';
import { formatDateTime } from '../lib/time';

interface DataCredibilityCardProps {
  title: string;
  thresholdMinutes: number;
  metadata: DataCredibilityMeta;
}

const STATUS_COLORS: Record<DataCredibilityMeta['status'], string> = {
  live: '#00c853',
  stale: '#ffab00',
  fallback: '#ff6d00',
  error: '#ff1744',
};

export default function DataCredibilityCard({ title, thresholdMinutes, metadata }: DataCredibilityCardProps) {
  const isSeverelyOld = metadata.ageMinutes > thresholdMinutes * 2;
  const ageColor = isSeverelyOld ? '#ff1744' : metadata.ageMinutes > thresholdMinutes ? '#ffab00' : '#00c853';

  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
        <strong style={{ color: '#ddd', fontSize: '0.85rem', letterSpacing: '0.08em' }}>{title}</strong>
        <span style={{
          background: 'rgba(0,0,0,0.3)',
          border: `1px solid ${STATUS_COLORS[metadata.status]}`,
          color: STATUS_COLORS[metadata.status],
          borderRadius: '999px',
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          padding: '0.1rem 0.55rem',
          fontWeight: 700,
        }}>
          {metadata.status}
        </span>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#888' }}>
        Source:{' '}
        <a href={metadata.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#7bb5ff' }}>
          {metadata.source}
        </a>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#888' }}>
        Last fetch: {metadata.fetchedAt ? formatDateTime(metadata.fetchedAt) : 'N/A'}
      </div>
      <div style={{ fontSize: '0.8rem', color: ageColor, fontWeight: 700 }}>
        Data age: {metadata.ageMinutes} min {metadata.ageMinutes > thresholdMinutes ? '(stale threshold exceeded)' : ''}
      </div>
    </div>
  );
}
