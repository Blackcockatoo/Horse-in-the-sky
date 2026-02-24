'use client';

/**
 * WarningBanner — persistent warning strip at the top of any page.
 * Red = extreme/severe. Amber = moderate. Hidden when clear.
 */

import type { WarningsData } from '../types/warning.types';

const SEVERITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  EXTREME: { bg: '#ff1744', border: '#ff1744', text: '#fff' },
  SEVERE: { bg: '#ff6d00', border: '#ff6d00', text: '#fff' },
  MODERATE: { bg: '#ffd600', border: '#ffd600', text: '#000' },
  MINOR: { bg: '#333', border: '#ffd600', text: '#ffd600' },
  UNKNOWN: { bg: '#333', border: '#888', text: '#888' },
};

export default function WarningBanner({ warnings }: { warnings: WarningsData | null }) {
  if (!warnings || warnings.activeCount === 0) return null;

  const severity = warnings.highestSeverity || 'UNKNOWN';
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.UNKNOWN;

  return (
    <div style={{
      background: colors.bg,
      borderBottom: `3px solid ${colors.border}`,
      color: colors.text,
      padding: '0.75rem 1.5rem',
      fontWeight: 900,
      fontFamily: 'monospace',
      fontSize: '1.1rem',
      textAlign: 'center',
      letterSpacing: '0.05em',
    }}>
      {warnings.warnings.length > 0
        ? warnings.warnings[0].headline
        : `${warnings.activeCount} active warning${warnings.activeCount > 1 ? 's' : ''}`
      }
      {warnings.activeCount > 1 && (
        <span style={{ fontSize: '0.85rem', marginLeft: '1rem', opacity: 0.8 }}>
          +{warnings.activeCount - 1} more
        </span>
      )}
    </div>
  );
}
