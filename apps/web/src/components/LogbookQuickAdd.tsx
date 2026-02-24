'use client';

/**
 * LogbookQuickAdd — one-tap logging.
 * Rain, Spray, Maintenance, Flight — done in 3 seconds.
 * Big buttons. No forms. No fiddling.
 */

import { useState } from 'react';

type LogType = 'rain' | 'spray' | 'maintenance' | 'flight' | 'note';

interface LogEntry {
  type: LogType;
  timestamp: string;
  note: string;
}

const LOG_BUTTONS: { type: LogType; label: string; color: string; icon: string }[] = [
  { type: 'rain', label: 'RAIN', color: '#2979ff', icon: '~' },
  { type: 'spray', label: 'SPRAY', color: '#00c853', icon: '+' },
  { type: 'maintenance', label: 'MAINT', color: '#ff6d00', icon: '#' },
  { type: 'flight', label: 'FLIGHT', color: '#aa00ff', icon: '^' },
];

export default function LogbookQuickAdd() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);

  function addLog(type: LogType, note: string = '') {
    const entry: LogEntry = {
      type,
      timestamp: new Date().toISOString(),
      note,
    };
    setLogs(prev => [entry, ...prev]);
    setLastAction(`${type.toUpperCase()} logged`);

    // TODO: POST to Supabase when connected
    // For now, save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('hmffcc_logs') || '[]');
      existing.unshift(entry);
      localStorage.setItem('hmffcc_logs', JSON.stringify(existing.slice(0, 500)));
    } catch { /* ignore */ }

    setTimeout(() => setLastAction(null), 2000);
  }

  function submitNote() {
    if (noteText.trim()) {
      addLog('note', noteText.trim());
      setNoteText('');
      setShowNote(false);
    }
  }

  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '1rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
      }}>
        <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em' }}>
          QUICK LOG
        </div>
        {lastAction && (
          <div style={{
            fontSize: '0.85rem',
            color: '#00c853',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}>
            {lastAction}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {LOG_BUTTONS.map(btn => (
          <button
            key={btn.type}
            onClick={() => addLog(btn.type)}
            style={{
              background: 'transparent',
              border: `2px solid ${btn.color}`,
              color: btn.color,
              borderRadius: '8px',
              padding: '1rem 0.5rem',
              fontSize: '0.9rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              cursor: 'pointer',
              minHeight: '60px',
              letterSpacing: '0.1em',
            }}
          >
            <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{btn.icon}</div>
            {btn.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowNote(!showNote)}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid #555',
          color: '#888',
          borderRadius: '8px',
          padding: '0.5rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}
      >
        + Add note
      </button>

      {showNote && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitNote()}
            placeholder="Quick note..."
            style={{
              flex: 1,
              background: '#0a0a0a',
              border: '1px solid #555',
              color: '#e0e0e0',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '1rem',
              fontFamily: 'monospace',
            }}
            autoFocus
          />
          <button
            onClick={submitNote}
            style={{
              background: '#333',
              border: '1px solid #555',
              color: '#e0e0e0',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            LOG
          </button>
        </div>
      )}

      {/* Recent logs */}
      {logs.length > 0 && (
        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #222', paddingTop: '0.5rem' }}>
          {logs.slice(0, 3).map((log, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#666',
              padding: '0.25rem 0',
            }}>
              <span>{log.type.toUpperCase()}{log.note ? `: ${log.note}` : ''}</span>
              <span>{new Date(log.timestamp).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
