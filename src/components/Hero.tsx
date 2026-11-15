import { SpotifyIcon } from './icons';
import { responsive } from '../lib/img';

const GENRES = ['Deep House', 'Jazz', 'Afro House', 'R&B', 'Hip-Hop', 'Reggaeton', 'Electronic'];

export default function Hero() {
  return (
    <header className="ss-hero">
      <img {...responsive('/ss-hero.jpg', '(min-width: 901px) 62vw, 100vw')} alt="" className="ss-hero-bg" aria-hidden="true" fetchPriority="high" />
      <div className="ss-hero-overlay" aria-hidden="true" />
      <div className="ss-hero-orb ss-hero-orb--1" aria-hidden="true" />
      <div className="ss-hero-orb ss-hero-orb--2" aria-hidden="true" />
      <div className="ss-hero-orb ss-hero-orb--3" aria-hidden="true" />

      <div className="ss-hero-content">

        {/* Extruded wordmark. The "sides" are drawn by CSS from data-text
            (.ss-hero-word::before), not by a second copy of the word in the
            page: a duplicate made search engines read the heading as
            "Soul Soul Shades Shades". */}
        <h1 className="ss-hero-name">
          {(['Soul', 'Shades'] as const).map((w, i) => (
            <span key={w} className={`ss-hero-word ss-hero-${w.toLowerCase()}`} data-text={w}>
              <span className="ss-hero-word-face">{w}</span>{i === 0 ? ' ' : ''}
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
