import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavClock from '../components/NavClock';

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
  const productionBuildMarker = process.env.NEXT_PUBLIC_MOSS60 || process.env.MOSS60;

  return (
    <html lang="en">
      <body>
        <nav>
          <div className="nav-inner">
            <div className="nav-brand-group">
              <a href="/" className="nav-brand">HMFFCC</a>
              <div className="nav-owner">PETER MORAN · FLIGHT + FARM</div>
            </div>
            <div className="nav-right">
              <NavClock />
              <div className="nav-links">
              <a href="/">CMD</a>
              <a href="/flight">FLIGHT</a>
              <a href="/farm">FARM</a>
              <a href="/inventory">STOCK</a>
              <a href="/tasks">TODO</a>
              <a href="/alerts">ALERTS</a>
              <a href="/logs">LOG</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
        {productionBuildMarker ? (
          <div data-moss60={productionBuildMarker} style={{ display: 'none' }} aria-hidden="true" />
        ) : null}
      </body>
    </html>
  );
}
