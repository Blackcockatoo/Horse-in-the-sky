'use client';

import { useEffect, useState } from 'react';

type DeferredInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function IntroDownloadCard() {
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallPromptEvent | null>(null);
  const [message, setMessage] = useState('Tap download to install HMFFCC on this device.');

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as DeferredInstallPromptEvent);
      setMessage('App is ready to install. Tap download.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleDownloadApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      setMessage(result.outcome === 'accepted' ? 'Installing app now.' : 'Install cancelled. You can try again.');
      return;
    }

    setMessage('Use browser menu: Share/Options → Add to Home Screen to install the app.');
  };

  return (
    <section className="intro-card" aria-label="HMFFCC intro">
      <img
        src="/horse-intro-emblem.svg"
        alt="Blue and yellow HMFFCC monogram with wreath"
        className="intro-card__image"
      />

      <div className="intro-card__content">
        <p className="intro-card__kicker">WELCOME ABOARD</p>
        <h1 className="intro-card__title">Heavens Meadow Flight + Farm Command Centre</h1>
        <p className="intro-card__text">
          One quick glance for weather, operations, warnings, and decision confidence.
          Tuned for phone, tablet, and desktop cockpit use.
        </p>

        <button type="button" className="intro-card__download" onClick={handleDownloadApp}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="2" width="18" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path
              d="M12 7v7M8.5 10.5L12 14l3.5-3.5M7 17h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          Download app
        </button>
        <p className="intro-card__hint">{message}</p>
      </div>
    </section>
  );
}
