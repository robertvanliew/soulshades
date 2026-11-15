import { Helmet } from 'react-helmet-async';
import PageShell from '../components/PageShell';
import { BookingDialogProvider, useBookingDialog } from '../components/BookingDialog';
import NewRelease, { RELEASE_URL, releaseJsonLd } from '../components/NewRelease';
import { webp } from '../lib/img';

/* /get-up: the release page for "Get Up". Only confirmed facts: the title,
   the artist, the date (Friday, December 18, 2026), the cover and where to
   follow. Add credits, a tracklist or a streaming link only once they are
   real; the countdown block switches itself to "Out now" on release day. */

const SITE = 'https://soulshadesmusic.com';
const TITLE = 'Get Up by Soul Shades | Out Friday, December 18, 2026';
const DESCRIPTION = 'Get Up is the new release from Soul Shades, the New York duo of DJ DX and violinist Julie Schatz. Out Friday, December 18, 2026, on Spotify and Apple Music.';

function Body() {
  const openBooking = useBookingDialog();
  const book = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.focus(); openBooking('duo-dj-violin'); };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { ...releaseJsonLd, '@context': undefined, description: DESCRIPTION },
      {
        '@type': 'WebPage',
        '@id': `${RELEASE_URL}#webpage`,
        url: RELEASE_URL,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${RELEASE_URL}#recording` },
        primaryImageOfPage: `${SITE}/releases/get-up.jpg`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Soul Shades', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Get Up', item: RELEASE_URL },
        ],
      },
    ],
  };

  return (
    <article className="sp gu">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={RELEASE_URL} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="music.song" />
        <meta property="og:site_name" content="Soul Shades" />
        <meta property="og:url" content={RELEASE_URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={`${SITE}${webp('/releases/get-up.jpg')}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE}${webp('/releases/get-up.jpg')}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <nav className="sp-crumbs" aria-label="Breadcrumb">
        <a href="/">Soul Shades</a><span aria-hidden="true">/</span><span aria-current="page">Get Up</span>
      </nav>

      <NewRelease asPage />

      <div className="sp-prose">
        <section>
          <h2>When does Get Up come out?</h2>
          <p>
            Get Up is out on Friday, December 18, 2026. Follow Soul Shades on Spotify or Apple Music and it will
            show up in your release feed the day it drops.
          </p>
          <p>
            Until then, you can <a href="/#catalog">hear the duo’s mixes</a> or{' '}
            <a href="/#videos">watch them perform</a> on the home page.
          </p>
        </section>
        <section>
          <h2>Who is Soul Shades?</h2>
          <p>
            Soul Shades is a New York duo: DJ DX on the decks and Julie Schatz on violin, keys and vocals. They
            formed in 2024, write and release music together, and play it live at weddings, corporate events and
            private parties.
          </p>
          <p>
            Their originals include <cite>“Beyond Your Mind,”</cite> <cite>“Wait For Me”</cite> and{' '}
            <cite>“Buzz In London.”</cite> Read more about <a href="/dj-violin-duo-nyc">the DJ + live violin duo</a>.
          </p>
        </section>
      </div>

      <section className="gig-cta sp-cta">
        <div>
          <h2>Want Soul Shades at your event?</h2>
          <p>Tell us your date. We’ll confirm availability and send a written quote within 24–48 hours.</p>
        </div>
        <button type="button" className="ss-hero-btn" aria-haspopup="dialog" onClick={book}>Check Your Date</button>
      </section>

      <nav className="sp-related" aria-label="Related">
        <a href="/dj-violin-duo-nyc"><strong>The DJ + live violin duo</strong><span>How the duo works, and what it costs</span></a>
        <a href="/events/contentsquare-cx-circle-nyc"><strong>Contentsquare CX Circle NYC</strong><span>1,000+ guests at The Glasshouse</span></a>
        <a href="/events/nautadutilh-620-loft-garden"><strong>NautaDutilh at 620 Loft &amp; Garden</strong><span>A rooftop reception at Rockefeller Center</span></a>
      </nav>
    </article>
  );
}

export default function GetUpPage() {
  return (
    <BookingDialogProvider>
      <PageShell><Body /></PageShell>
    </BookingDialogProvider>
  );
}
