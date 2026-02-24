'use client';

/**
 * Logs page — farm and flight logbook.
 * Shows all quick-log entries. Stored in localStorage until Supabase is wired.
 */

import { useEffect, useState } from 'react';

interface LogEntry {
  type: string;
  timestamp: string;
  note: string;
}

const TYPE_COLORS: Record<string, string> = {
  rain: '#2979ff',
  spray: '#00c853',
  maintenance: '#ff6d00',
  flight: '#aa00ff',
  note: '#888',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('hmffcc_logs') || '[]');
      setLogs(stored);
    } catch { /* ignore */ }
  }, []);

  function clearLogs() {
    if (confirm('Clear all log entries?')) {
      localStorage.removeItem('hmffcc_logs');
      setLogs([]);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{
          fontSize: '1rem',
          color: '#888',
          fontWeight: 700,
          letterSpacing: '0.15em',
          margin: 0,
          fontFamily: 'monospace',
        }}>
          LOGBOOK
        </h1>
        {logs.length > 0 && (
          <button
            onClick={clearLogs}
            style={{
              background: 'transparent',
              border: '1px solid #555',
              color: '#888',
              borderRadius: '6px',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            CLEAR ALL
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          color: '#555',
          fontSize: '1rem',
          fontFamily: 'monospace',
        }}>
          No log entries yet. Use the quick-log buttons on the Farm page.
        </div>
      ) : (
        <div style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {logs.map((log, i) => {
            const color = TYPE_COLORS[log.type] || '#888';
            const d = new Date(log.timestamp);
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderBottom: i < logs.length - 1 ? '1px solid #222' : 'none',
                gap: '1rem',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color,
                  border: `1px solid ${color}`,
                  borderRadius: '4px',
                  padding: '0.15rem 0.5rem',
                  minWidth: '70px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}>
                  {log.type}
                </span>
                <span style={{ flex: 1, fontSize: '0.9rem', color: '#ccc' }}>
                  {log.note || '—'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#555', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })} {d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555', textAlign: 'center' }}>
        {logs.length} entries | Stored locally | Supabase sync coming
      </div>
    </div>
  );
}
