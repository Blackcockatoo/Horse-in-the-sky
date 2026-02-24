export default function IntroDownloadCard() {
  return (
    <section className="intro-card" aria-label="HMFFCC intro">
      <img
        src="/horse-intro-emblem.svg"
        alt="Horse and horseshoe HMFFCC emblem"
        className="intro-card__image"
      />

      <div className="intro-card__content">
        <p className="intro-card__kicker">WELCOME ABOARD</p>
        <h1 className="intro-card__title">Heavens Meadow Flight + Farm Command Centre</h1>
        <p className="intro-card__text">
          One quick glance for weather, operations, warnings, and decision confidence.
          Tuned for phone, tablet, and desktop cockpit use.
        </p>

        <a className="intro-card__download" href="/horse-intro-emblem.svg" download="hmffcc-horse-emblem.svg">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <rect x="3" y="17" width="18" height="4" rx="1" fill="currentColor" opacity="0.15" />
          </svg>
          Download SVG thumbnail
        </a>
      </div>
    </section>
  );
}
