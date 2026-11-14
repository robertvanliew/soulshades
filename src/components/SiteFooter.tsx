import { EmailButton } from './BookingDialog';
import { TRACKING_CONFIGURED, openCookieSettings } from '../lib/analytics';

const Out = () => <span className="footer-out" aria-hidden="true">↗</span>;

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

/* Four columns on one grid: who we are, the page, the roster (with each
   member's own site), and where to follow. The bottom bar carries the
   copyright, the site credit and one last way to book. */
export default function SiteFooter({ email = 'bookings@soulshadesmusic.com', bookLabel = 'Book Soul Shades', bookHref = '#ss-booking' }: { email?: string; bookLabel?: string; bookHref?: string }) {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-main">

          <div className="footer-brand-col">
            <div className="footer-brand-name">
              <span className="footer-brand-soul">Soul</span>
              <span className="footer-brand-shades">Shades</span>
            </div>
            <div className="footer-tagline">Blending genres, creating moods.</div>
            <p className="footer-brand-bio">
              The label and booking home of DJ DX and Julie Schatz. Weddings, corporate events and private
              celebrations in New York, New Jersey, Connecticut and worldwide.
            </p>
            <EmailButton className="footer-email">{email}</EmailButton>
          </div>

          <nav className="footer-nav-col" aria-label="On this page">
            <span className="footer-nav-heading">Explore</span>
            <a href="#new-release" className="footer-nav-link">New Release</a>
            <a href="#about" className="footer-nav-link">About</a>
            <a href="#recent-booking" className="footer-nav-link">Where We’ve Played</a>
            <a href="#catalog" className="footer-nav-link">Music Store</a>
            <a href="#merch" className="footer-nav-link">Merch</a>
            <a href="#videos" className="footer-nav-link">Videos</a>
            <a href="#faq" className="footer-nav-link">FAQ</a>
          </nav>

          <nav className="footer-nav-col" aria-label="Roster and booking">
            <span className="footer-nav-heading">Roster</span>
            <a href="#services" className="footer-nav-link">Soul Shades, the duo</a>
            <a href="https://djdxmusic.com/" {...ext} className="footer-nav-link">DJ DX <Out /></a>
            <a href="https://julieschatzmusic.com/" {...ext} className="footer-nav-link">Julie Schatz <Out /></a>
            <a href="#services" className="footer-nav-link">Formats &amp; pricing</a>
            <a href="#ss-booking" className="footer-nav-link">Booking inquiry</a>
          </nav>

          <nav className="footer-nav-col" aria-label="Follow Soul Shades">
            <span className="footer-nav-heading">Follow</span>
            <a href="https://open.spotify.com/artist/2GES5fSFNcx25lv9RFcQjP" {...ext} className="footer-nav-link">Spotify</a>
            <a href="https://music.apple.com/us/artist/soul-shades/1783698611" {...ext} className="footer-nav-link">Apple Music</a>
            <a href="https://www.youtube.com/@soulshadesmusic" {...ext} className="footer-nav-link">YouTube</a>
            <a href="https://www.instagram.com/soulshadesmusic/" {...ext} className="footer-nav-link">Instagram</a>
            <a href="https://www.tiktok.com/@soulshadesmusic" {...ext} className="footer-nav-link">TikTok</a>
            <a href="https://soundcloud.com/soulshadesmusic" {...ext} className="footer-nav-link">SoundCloud</a>
            <a href="https://soulshadesmusic.bandcamp.com/" {...ext} className="footer-nav-link">Bandcamp</a>
            <a href="https://www.threads.net/@soulshadesmusic" {...ext} className="footer-nav-link">Threads</a>
            <a href="https://x.com/soulshadesmusic" {...ext} className="footer-nav-link">X</a>
          </nav>

        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} Soul Shades Music. All rights reserved.
            <span className="footer-sep" aria-hidden="true">·</span>
            <a href="https://robertvanliew.com" {...ext} className="footer-designer-link">Site by Robert Van Liew</a>
          </p>
          <nav className="footer-legal" aria-label="Legal">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            {TRACKING_CONFIGURED && <button type="button" onClick={openCookieSettings}>Cookie settings</button>}
          </nav>
          <a href={bookHref} className="footer-book-cta">{bookLabel} <span aria-hidden="true">→</span></a>
        </div>

      </div>
    </footer>
  );
}
