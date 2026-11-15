import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import BookingForm from './components/BookingForm';
import SiteNav from './components/SiteNav';
import Hero from './components/Hero';
import StreamStrip from './components/StreamStrip';
import About from './components/About';
import FAQ from './components/FAQ';
import { BookingDialogProvider, EmailButton } from './components/BookingDialog';
import NewRelease from './components/NewRelease';
import Proof from './components/Proof';
import Roster from './components/Roster';
import RecentBookings from './components/RecentBookings';
import Reveal from './components/Reveal';
import { ExternalIcon } from './components/icons';
import SiteFooter from './components/SiteFooter';
import MusicStore from './components/MusicStore';
import ViralMomentsSection from './components/ViralMomentsSection';
import { defaultCatalog, fetchCatalog, type Track } from './catalog';

/* ── Merch — fulfilled by Creator-Spring, linked out rather than carted ── */
const MERCH_STORE = 'https://my-store-101bc91.creator-spring.com';
const merch = [
  {
    name: 'Soul Shades Heavy Tee',
    price: '$44.99',
    blurb: 'Heavyweight cotton, front logo',
    img: '/merch/heavy-tee.jpg',
    href: `${MERCH_STORE}/listing/soul-shades?product=2256&variation=106464`,
  },
  {
    name: 'Soul Shades Kids Tee',
    price: '$22.99',
    blurb: 'Premium tee, youth sizes',
    img: '/merch/kids-tee.jpg',
    href: `${MERCH_STORE}/listing/soul-shades?product=371&variation=6557`,
  },
  {
    name: 'Soul Shades Mug',
    price: '$15.11',
    blurb: 'Ceramic, 11oz',
    img: '/merch/mug.jpg',
    href: `${MERCH_STORE}/listing/soul-shades?product=1565&variation=104920`,
  },
];

/* Home page title and descriptions. index.html carries the same text as
   static tags so link previews work without JavaScript; keep them in step. */
const SEO = {
  title: 'Soul Shades | NYC DJ + Live Violin Duo for Weddings & Corporate Events',
  description: 'Soul Shades is the New York duo of DJ DX and violinist, pianist and vocalist Julie Schatz. Book the duo or either artist for weddings, corporate events and private parties. DJ + live violin from $3,500.',
  social: 'DJ DX and Julie Schatz: DJ sets with live violin, keys and vocals for weddings, corporate events and private parties in New York and beyond.',
};

/* ── Video Slider ───────────────────────────────────────── */
const videos = [
  { id: 'bji-ymxikUg', title: 'Soul Shades — I Only Smoke When I Drink x Englishman in New York' },
  { id: 'uzwvCUrr__g', title: 'Soul Shades — Chill Deep House Jazz Mix & Live Improv' },
];

function VideoSlider() {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (idx: number) => {
    if (idx === active || transitioning) return;
    setTransitioning(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive(idx);
      setTransitioning(false);
    }, 280);
  };

  const prev = () => goTo((active - 1 + videos.length) % videos.length);
  const next = () => goTo((active + 1) % videos.length);

  return (
    <section className="ss-section" id="videos">
      <div className="ss-section-label">Watch</div>
      <h2 className="ss-section-title">Featured <span>Videos</span></h2>

      <div className="ss-vslider">
        {/* Main frame */}
        <div className="ss-vslider-stage">
          <div className="ss-video-glow" aria-hidden="true" />
          <div className={`ss-vslider-frame ${transitioning ? 'ss-vslider-frame--out' : 'ss-vslider-frame--in'}`}>
            <div className="ss-video-corner ss-video-corner--tl" aria-hidden="true" />
            <div className="ss-video-corner ss-video-corner--tr" aria-hidden="true" />
            <div className="ss-video-corner ss-video-corner--bl" aria-hidden="true" />
            <div className="ss-video-corner ss-video-corner--br" aria-hidden="true" />
            <div className="ss-video-ratio">
              <iframe
                key={videos[active].id}
                src={`https://www.youtube-nocookie.com/embed/${videos[active].id}`}
                title={videos[active].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="ss-vslider-controls">
          <button className="ss-vslider-arrow" onClick={prev} aria-label="Previous video">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div className="ss-vslider-dots">
            {videos.map((v, i) => (
              <button
                key={v.id}
                className={`ss-vslider-dot ${i === active ? 'ss-vslider-dot--active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Video ${i + 1}`}
              />
            ))}
          </div>

          <button className="ss-vslider-arrow" onClick={next} aria-label="Next video">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

      </div>
    </section>
  );
}

export default function App() {
  // Start from the built-in catalog so the store is never an empty list while
  // the saved order/visibility loads; the fetched version replaces it.
  const [allTracks, setAllTracks] = useState<Track[]>(() => [...defaultCatalog].sort((a, b) => a.order - b.order));

  useEffect(() => {
    fetchCatalog().then(tracks => setAllTracks(tracks));
    // Arriving with a section in the address (/#services, e.g. from our emails
    // or the Privacy page): go to it once the page has rendered, and again
    // after images have settled the layout. Otherwise start at the top.
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) { window.scrollTo(0, 0); return; }
    const go = () => document.getElementById(id)?.scrollIntoView({ block: 'start' });
    const raf = requestAnimationFrame(go);
    const t = setTimeout(go, 700);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const catalog = allTracks.filter(t => t.visible);

  return (
    <BookingDialogProvider>
    <div className="ss-page">
      <Helmet>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <link rel="canonical" href="https://soulshadesmusic.com/" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Soul Shades" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://soulshadesmusic.com/" />
        <meta property="og:title" content={SEO.title} />
        <meta property="og:description" content={SEO.social} />
        <meta property="og:image" content="https://soulshadesmusic.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Soul Shades: DJ DX and Julie Schatz, NYC DJ and live violin duo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO.title} />
        <meta name="twitter:description" content={SEO.social} />
        <meta name="twitter:image" content="https://soulshadesmusic.com/og-image.jpg" />
        <script type="application/ld+json">{`{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Soul Shades — Originals, Blends & Remixes",
          "url": "https://soulshadesmusic.com/",
          "itemListElement": [
            {"@type": "ListItem", "position": 1,  "item": {"@type": "MusicRecording", "name": "Wait For Me",                          "datePublished": "2025", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 2,  "item": {"@type": "MusicRecording", "name": "Beyond Your Mind",                     "datePublished": "2025", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 3,  "item": {"@type": "MusicRecording", "name": "Kiss Of Life",                         "datePublished": "2025", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 4,  "item": {"@type": "MusicRecording", "name": "Buzz In London",                       "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 5,  "item": {"@type": "MusicRecording", "name": "Always On Time x Fired Up",            "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 6,  "item": {"@type": "MusicRecording", "name": "Be Honest x Everything",               "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 7,  "item": {"@type": "MusicRecording", "name": "Cola x Vivrant Thing",                 "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 8,  "item": {"@type": "MusicRecording", "name": "Hannah x Everybody Everybody",         "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 9,  "item": {"@type": "MusicRecording", "name": "Money Talks (Dirty Cash) x RIZZ",      "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 10, "item": {"@type": "MusicRecording", "name": "Rock The Boat x You Are The One",      "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 11, "item": {"@type": "MusicRecording", "name": "Streets x Rapture III x Violin",       "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 12, "item": {"@type": "MusicRecording", "name": "The Way You x Everybody x Never x Beso","datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 13, "item": {"@type": "MusicRecording", "name": "Unthinkable x Life Gets Hard",         "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}},
            {"@type": "ListItem", "position": 14, "item": {"@type": "MusicRecording", "name": "Addicted x Give Me The Night",         "datePublished": "2024", "byArtist": {"@id": "https://soulshadesmusic.com/#soulshades"}}}
          ]
        }`}</script>
      </Helmet>

      {/* ── NAV ── */}
      <SiteNav />

      {/* ── HERO ── */}
      <Hero />


      <main className="ss-main">

        {/* ── NEW RELEASE ── */}
        <NewRelease />

        {/* ── ABOUT ── */}
        <About />

        {/* ── NUMBERS + CLIENT QUOTES ── */}
        <Proof />

        {/* ── RECENT BOOKINGS ── */}
        <RecentBookings />

        {/* ── LABEL & BOOKINGS: THE ROSTER ── */}
        <Roster />

        {/* ── EXCLUSIVE MUSIC STORE ── */}
        <section className="ss-section">
          <MusicStore catalog={catalog} title={<>Soul Shades <span>Store</span></>} subTitle="Exclusive Music" shareType="soul-shades" />
        </section>

        {/* ── MERCH ── */}
        <section className="ss-section" id="merch">
          <div className="ss-section-label">Merch</div>
          <h2 className="ss-section-title">Soul Shades <span>Merch</span></h2>
          <p className="ss-merch-sub">
            Printed and shipped by our merch partner. Tap any item to pick your size and check out.
          </p>

          <div className="ss-merch-grid">
            {merch.map(({ name, price, blurb, img, href }, n) => (
              <Reveal key={name} delay={0.08 * n}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="ss-merch-card"
              >
                <div className="ss-merch-shot">
                  <img
                    src={img}
                    alt={`${name} — Soul Shades merch`}
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="ss-merch-body">
                  <span className="ss-merch-name">{name}</span>
                  <span className="ss-merch-blurb">{blurb}</span>
                </div>
                <div className="ss-merch-foot">
                  <span className="ss-merch-price">{price}</span>
                  <span className="ss-merch-cta">Shop <ExternalIcon /></span>
                </div>
              </a>
              </Reveal>
            ))}
          </div>

          <a href={MERCH_STORE} target="_blank" rel="noopener noreferrer" className="ss-merch-all">
            See the full shop <ExternalIcon />
          </a>
        </section>

        {/* ── VIRAL MOMENTS ── */}
        <ViralMomentsSection subtitle="Moments that moved the crowd — now moving the internet." />

        {/* ── VIDEO SLIDER ── */}
        <VideoSlider />

        {/* ── FOLLOW & STREAM ── */}
        <StreamStrip />

        {/* ── FAQ ── */}
        <FAQ />

      </main>

      {/* ── BOOKING ── */}
      <section id="ss-booking" className="book" aria-labelledby="book-title">
        <div className="book-inner">
          <Reveal className="book-pitch">
            <div className="ss-section-label">Booking</div>
            <h2 className="book-title" id="book-title">Book Soul Shades</h2>
            <p className="book-sub">
              Book the duo, DJ DX or Julie Schatz for your wedding, corporate event or private party. Tell us
              about your date and we’ll reply within 24–48 hours with availability and a written quote.
            </p>
            <ul className="book-points">
              <li><span>Roster</span>Soul Shades (the duo), DJ DX, Julie Schatz</li>
              <li><span>Events</span>Weddings, corporate events and galas, private parties, club nights</li>
              <li><span>Area</span>New York, New Jersey and Connecticut. Available worldwide.</li>
              <li><span>Reply</span>Within 24–48 hours, with a written quote</li>
            </ul>
            <EmailButton className="book-email" />
          </Reveal>
          <Reveal className="book-form" delay={0.1}>
            <BookingForm />
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <SiteFooter />

    </div>
    </BookingDialogProvider>
  );
}
