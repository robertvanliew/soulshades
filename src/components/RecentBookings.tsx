import LightboxGroup from './LightboxGroup';
import Reveal from './Reveal';
import { useBookingDialog } from './BookingDialog';

/* "Where We've Played": each event is a short case study a planner can scan —
   who the client was, where, how many guests, what we played — followed by
   captioned photos and video. Clients are named with their OK (see
   djdx-website-new src/data/events.ts).

   `alt` describes the picture for screen readers and becomes the caption in
   the full-screen viewer; `cap` is the short label printed on the tile. */

type Media = {
  kind: 'img' | 'video';
  src: string;
  poster?: string;
  alt: string;
  cap: string;
  width?: number;
  height?: number;
  /** Don't fetch the clip until it's needed (large files above the fold of nothing). */
  lazyVideo?: boolean;
};

type Gig = {
  id: string;
  date: string;
  title: string;
  venue: string;
  sub: string;
  specs: [string, string][];
  viewerLabel: string;
  banner?: Media;
  shots: Media[];
};

const GIGS: Gig[] = [
  {
    id: 'contentsquare',
    date: 'October 13, 2026',
    title: 'Contentsquare CX Circle NYC',
    venue: 'The Glasshouse',
    sub: 'DJ DX and Julie Schatz played the evening reception of Contentsquare’s customer-experience conference, as the sun went down over the Hudson behind the booth.',
    specs: [
      ['Client', 'Contentsquare'],
      ['Venue', 'The Glasshouse, Hell’s Kitchen, Manhattan'],
      ['Guests', '1,000+'],
      ['Set', 'Evening reception, 5 to 7 pm'],
    ],
    viewerLabel: 'Contentsquare CX Circle at The Glasshouse: photos and video',
    shots: [
      {
        kind: 'video',
        src: '/videos/glasshouse-contentsquare-nyc.mp4',
        poster: '/glasshouse-contentsquare-poster.jpg',
        alt: 'DJ DX at the decks during Contentsquare CX Circle NYC 2026 at The Glasshouse, Hudson River at sunset behind',
        cap: 'On the floor during the reception',
        lazyVideo: true,
      },
      {
        kind: 'img',
        src: '/glasshouse-event-space-hudson-nyc.jpg',
        alt: 'The Glasshouse event space at 660 12th Avenue, Hell’s Kitchen, with floor-to-ceiling windows onto the Hudson',
        cap: 'The Glasshouse, 660 12th Avenue',
        width: 1200,
        height: 1600,
      },
      {
        kind: 'img',
        src: '/glasshouse-dj-booth-setup-nyc.jpg',
        alt: 'The Soul Shades DJ booth set up at The Glasshouse for Contentsquare CX Circle NYC 2026',
        cap: 'The Soul Shades booth',
        width: 1200,
        height: 1600,
      },
    ],
  },
  {
    id: 'nautadutilh',
    date: 'June 2026',
    title: 'NautaDutilh Reception',
    venue: '620 Loft & Garden',
    sub: 'Julie Schatz on live violin over DJ DX’s set for a corporate rooftop reception, steps from Rockefeller Center with St. Patrick’s Cathedral as the backdrop.',
    specs: [
      ['Client', 'NautaDutilh New York P.C.'],
      ['Venue', '620 Loft & Garden, Rockefeller Center'],
      ['Guests', '175'],
      ['Set', 'DJ set with live violin'],
    ],
    viewerLabel: 'NautaDutilh reception at 620 Loft & Garden: photos and video',
    // Every photo is shown at (or very near) its own shape: the panorama as a
    // wide banner, the three portrait shots as tiles.
    banner: {
      kind: 'img',
      src: '/nautadutilh-group-photo-cathedral-nyc.jpg',
      alt: 'NautaDutilh guests posing for a group photo on the 620 Loft & Garden rooftop in front of St. Patrick’s Cathedral',
      cap: 'The firm’s group photo, St. Patrick’s Cathedral behind',
      width: 1920,
      height: 960,
    },
    shots: [
      {
        kind: 'img',
        src: '/nautadutilh-violin-skyline-nyc.jpg',
        alt: 'Julie Schatz on violin with the Manhattan skyline and St. Patrick’s Cathedral, 620 Loft & Garden rooftop, NYC',
        cap: 'Julie Schatz, live violin',
        width: 1600,
        height: 2133,
      },
      {
        kind: 'img',
        src: '/nautadutilh-dj-dx-620-loft-garden-nyc.jpg',
        alt: 'DJ DX at the NautaDutilh corporate reception, 620 Loft & Garden rooftop, NYC, with St. Patrick’s Cathedral in the background',
        cap: 'DJ DX at the booth',
        width: 1600,
        height: 2133,
      },
      {
        kind: 'video',
        src: '/videos/nautadutilh-rooftop-night-nyc.mp4',
        poster: '/nautadutilh-rooftop-night-poster.jpg',
        alt: 'Soul Shades rooftop setup at night, Manhattan skyline, NautaDutilh reception at 620 Loft & Garden',
        cap: 'After dark on the rooftop',
      },
    ],
  },
];

const PlayGlyph = () => (
  <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M2 1l7 4-7 4z" /></svg>
);

function Shot({ m, className, delay, duration }: { m: Media; className: string; delay?: number; duration?: number }) {
  return (
    <Reveal className={className} delay={delay} duration={duration}>
      <button type="button" className="lb-hit" aria-label={`View full screen: ${m.cap}`} />
      {m.kind === 'video' ? (
        <video
          data-lb
          src={m.src}
          poster={m.poster}
          autoPlay
          muted
          loop
          playsInline
          preload={m.lazyVideo ? 'none' : undefined}
          aria-label={m.alt}
        />
      ) : (
        <img data-lb src={m.src} alt={m.alt} width={m.width} height={m.height} loading="lazy" decoding="async" />
      )}
      {m.kind === 'video' && <span className="shot-badge"><PlayGlyph /> Video</span>}
      <span className="shot-cap" aria-hidden="true">{m.cap}</span>
    </Reveal>
  );
}

export default function RecentBookings() {
  const openBooking = useBookingDialog();

  return (
    <section className="ss-section" id="recent-booking" aria-labelledby="bookings-title">
      <div className="ss-section-label">Recent Bookings</div>
      <h2 className="ss-section-title" id="bookings-title">Where We’ve <span>Played</span></h2>
      <p className="ss-section-sub">
        Two recent corporate events in Manhattan. Select any photo or video to see it full screen.
      </p>

      {GIGS.map(g => (
        <article className="gig" key={g.id} aria-labelledby={`gig-${g.id}`}>
          <header className="gig-head">
            <div className="gig-intro">
              <p className="gig-meta">{g.date}</p>
              <h3 className="gig-title" id={`gig-${g.id}`}>
                {g.title} <span>at {g.venue}</span>
              </h3>
              <p className="gig-sub">{g.sub}</p>
            </div>
            <dl className="gig-specs">
              {g.specs.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </header>

          <LightboxGroup label={g.viewerLabel}>
            {g.banner && <Shot m={g.banner} className="cb-hero-shot" duration={0.9} />}
            <div className={`cb-gallery${g.banner ? '' : ' gig-gallery'}`}>
              {g.shots.map((m, i) => (
                <Shot key={m.src} m={m} className="cb-shot" delay={0.1 * (i + 1)} />
              ))}
            </div>
          </LightboxGroup>
        </article>
      ))}

      <Reveal className="gig-cta">
        <div>
          <h3>Planning an event like these?</h3>
          <p>
            Tell us your date. We’ll confirm availability and send a written quote within 24–48 hours.{' '}
            <a href="/corporate-event-entertainment-nyc" className="gig-cta-link">How corporate bookings work →</a>
          </p>
        </div>
        <button
          type="button"
          className="ss-hero-btn"
          aria-haspopup="dialog"
          onClick={e => { e.currentTarget.focus(); openBooking(); }}
        >
          Check Your Date
        </button>
      </Reveal>
    </section>
  );
}
