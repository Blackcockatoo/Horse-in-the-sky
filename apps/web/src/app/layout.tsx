import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HMFFCC — Heavens Meadow Farm Flight Command Centre',
  description: 'Peter Moran\'s aviation and farm operations command centre. Tyabb, VIC.',
  manifest: '/manifest.json',
  icons: { apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <div className="nav-inner">
            <a href="/" className="nav-brand">HMFFCC</a>
            <div className="nav-links">
              <a href="/">CMD</a>
              <a href="/flight">FLIGHT</a>
              <a href="/farm">FARM</a>
              <a href="/radar">RADAR</a>
              <a href="/warnings">WARN</a>
              <a href="/logs">LOG</a>
              <a href="/settings">SET</a>
            </div>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
