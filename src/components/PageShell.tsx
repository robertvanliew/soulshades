import type { ReactNode } from 'react';
import { TRACKING_CONFIGURED, openCookieSettings } from '../lib/analytics';

/* Frame for the pages outside the home page (Privacy, Terms, Not Found): the
   wordmark links home, and a slim footer carries the legal links. The home
   page's own nav and footer are built around in-page anchors, so they aren't
   reused here. */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="ss-page page-shell">
      <a className="skip-link" href="#page-main">Skip to content</a>
      <header className="page-top">
        <a href="/" className="nav-logo" aria-label="Soul Shades, home">
          <span className="nav-logo-soul" aria-hidden="true">Soul</span>
          <span className="nav-logo-shades" aria-hidden="true">Shades</span>
        </a>
        <nav className="page-top-links" aria-label="Site">
          <a href="/">Home</a>
          <a href="/#ss-booking" className="page-top-book">Book Now</a>
        </nav>
      </header>

      <main id="page-main" className="page-main">{children}</main>

      <footer className="page-foot">
        <p>© {new Date().getFullYear()} Soul Shades Music. All rights reserved.</p>
        <nav aria-label="Site">
          <a href="/dj-violin-duo-nyc">DJ + live violin duo</a>
          <a href="/wedding-dj-violin-duo-nyc">Weddings</a>
          <a href="/corporate-event-entertainment-nyc">Corporate events</a>
          <a href="/get-up">Get Up, the new release</a>
          <a href="/epk">Press kit</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          {TRACKING_CONFIGURED && <button type="button" onClick={openCookieSettings}>Cookie settings</button>}
          <a href="mailto:hello@soulshadesmusic.com">hello@soulshadesmusic.com</a>
        </nav>
        <p className="footer-credit">
          <a href="https://robertvanliew.com/" target="_blank" rel="noopener noreferrer">Design, development &amp; SEO by Robert Van Liew</a>
        </p>
      </footer>
    </div>
  );
}
