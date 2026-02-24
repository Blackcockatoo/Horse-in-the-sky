'use client';

/**
 * FarmOpsCard — farm operations overview.
 * Spray, field access, hay — all at a glance.
 */

type Verdict = 'GO' | 'CAUTION' | 'NO_GO';

interface Decision {
  verdict: Verdict;
  reason: string;
}

interface Props {
  spray: { overall: Decision };
  fieldAccess: { overall: Decision };
  hay: { overall: Decision };
  rainPast24hMm: number;
  rainNext6hMm: number;
}

const VERDICT_COLORS: Record<Verdict, string> = {
  GO: '#00c853',
  CAUTION: '#ffd600',
  NO_GO: '#ff1744',
};

const VERDICT_LABELS: Record<Verdict, string> = {
  GO: 'GO',
  CAUTION: 'CAUTION',
  NO_GO: 'NO-GO',
};

export default function FarmOpsCard({ spray, fieldAccess, hay, rainPast24hMm, rainNext6hMm }: Props) {
  const ops = [
    { label: 'Spray', ...spray.overall },
    { label: 'Field Access', ...fieldAccess.overall },
    { label: 'Hay', ...hay.overall },
  ];

  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '1rem',
    }}>
      <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
        FARM OPERATIONS
      </div>

      {ops.map((op, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 0',
          borderBottom: i < ops.length - 1 ? '1px solid #222' : 'none',
        }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e0e0e0' }}>{op.label}</div>
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>{op.reason}</div>
          </div>
          <span style={{
            fontSize: '1rem',
            fontWeight: 900,
            fontFamily: 'monospace',
            color: VERDICT_COLORS[op.verdict],
            padding: '0.25rem 0.75rem',
            border: `2px solid ${VERDICT_COLORS[op.verdict]}`,
            borderRadius: '6px',
            whiteSpace: 'nowrap',
          }}>
            {VERDICT_LABELS[op.verdict]}
          </span>
        </div>
      ))}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #333',
        fontSize: '0.85rem',
        color: '#888',
      }}>
        <span>Rain (24h): {rainPast24hMm}mm</span>
        <span>Rain (next 6h): {rainNext6hMm}mm</span>
      </div>
    </div>
  );
}
