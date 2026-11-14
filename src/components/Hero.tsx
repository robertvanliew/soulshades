import { SpotifyIcon } from './icons';

const GENRES = ['Deep House', 'Jazz', 'Afro House', 'R&B', 'Hip-Hop', 'Reggaeton', 'Electronic'];

export default function Hero() {
  return (
    <header className="ss-hero">
      <img src="/ss-hero.jpg" alt="" className="ss-hero-bg" aria-hidden="true" />
      <div className="ss-hero-overlay" aria-hidden="true" />
      <div className="ss-hero-orb ss-hero-orb--1" aria-hidden="true" />
      <div className="ss-hero-orb ss-hero-orb--2" aria-hidden="true" />
      <div className="ss-hero-orb ss-hero-orb--3" aria-hidden="true" />

      <div className="ss-hero-content">

        {/* Extruded wordmark: a solid copy carries the "sides", the face sits on top. */}
        <h1 className="ss-hero-name">
          {(['Soul', 'Shades'] as const).map(w => (
            <span key={w} className={`ss-hero-word ss-hero-${w.toLowerCase()}`}>
              <span className="ss-hero-word-depth" aria-hidden="true">{w}</span>
              <span className="ss-hero-word-face">{w}</span>
            </span>
          ))}
        </h1>

        <p className="ss-hero-motto"><span className="q" aria-hidden="true">“</span>Blending genres, creating moods.<span className="q" aria-hidden="true">”</span></p>

        <div className="ss-hero-cta-row">
          <a href="#ss-booking" className="ss-hero-btn">Book Soul Shades</a>
          <a href="#new-release" className="ss-hero-btn ss-hero-btn--ghost">
            <SpotifyIcon /> New release: Get Up
          </a>
        </div>

        <div className="ss-hero-tags">
          {GENRES.map(t => (
            <span className="ss-genre-tag" key={t}>{t}</span>
          ))}
        </div>
      </div>
    </header>
  );
}
