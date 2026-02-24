'use client';

/**
 * OfficialSafetyLinks — quick access to authoritative fire/local sources.
 */

const LINKS = [
  {
    label: 'CFA Fire Danger Ratings (Central district)',
    href: 'https://www.cfa.vic.gov.au/warnings-restrictions/total-fire-bans-and-ratings',
    note: 'Official Victorian fire danger rating and total fire ban updates.',
  },
  {
    label: 'VicEmergency incidents map',
    href: 'https://www.emergency.vic.gov.au/respond/',
    note: 'Live incidents, warnings, and advice across Victoria.',
  },
  {
    label: 'Mornington Peninsula Shire emergency updates',
    href: 'https://www.mornpen.vic.gov.au/Community-Services/Emergency-Management',
    note: 'Council emergency information and local preparedness guidance.',
  },
] as const;

export default function OfficialSafetyLinks() {
  const checkedAt = new Date().toLocaleString();

  return (
    <section style={{
      marginBottom: '1rem',
      border: '1px solid #444',
      background: '#111',
      borderRadius: '10px',
      padding: '0.9rem 1rem',
    }}>
      <div style={{
        fontFamily: 'monospace',
        letterSpacing: '0.08em',
        fontWeight: 800,
        color: '#ffe100',
        marginBottom: '0.6rem',
      }}>
        OFFICIAL FIRE + LOCAL UPDATES
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              border: '1px solid #2f2f2f',
              borderRadius: '8px',
              padding: '0.9rem 1rem',
              textDecoration: 'none',
              color: '#ddd',
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: '0.35rem', fontSize: '1.05rem', lineHeight: 1.35 }}>{link.label}</div>
            <div style={{ fontSize: '0.95rem', color: '#b0b0b0', lineHeight: 1.45 }}>{link.note}</div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#7f7f7f' }}>
        Quick links last refreshed: {checkedAt}
      </div>
    </section>
  );
}
