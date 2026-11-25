import { Helmet } from 'react-helmet-async';
import PageShell from '../components/PageShell';
import { BookingDialogProvider, useBookingDialog } from '../components/BookingDialog';
import { responsive } from '../lib/img';

/* /epk: the electronic press kit. One page a planner, venue or journalist can
   take everything from: bios to quote, fast facts, photos and logos to
   download, recent events, client quotes, where to listen, and who to email.

   Facts only. Everything here is already stated on the site (About,
   src/data/roster.ts, the event write-ups, public/llms.txt). Keep them in
   step. Not here yet, because nothing confirms them: a tech rider or stage
   plot, photographer credits, print-resolution files, press coverage. */

const SITE = 'https://soulshadesmusic.com';
const PATH = '/epk';
const TITLE = 'Soul Shades Press Kit (EPK) | Bios, Photos, Logos';
const DESCRIPTION = 'Press kit for Soul Shades, the New York DJ + live violin duo of DJ DX and Julie Schatz: short and long bios, fast facts, press photos, logos and booking contacts.';

const SHORT_BIO =
  'Soul Shades is a New York–based music duo of DJ DX and vocalist and multi-instrumentalist Julie Schatz. ' +
  'Formed in 2024, they blend Deep House, Afro House, Jazz, R&B and Hip-Hop, playing DJ sets with live violin, ' +
  'vocals and keys over the mix. With 14 releases, more than 10 million views across TikTok and Instagram and a ' +
  'blend featured by Ninja Tune, they play clubs, corporate events, weddings and private parties in New York and worldwide.';

const PHOTOS: { src: string; alt: string; caption: string }[] = [
  { src: '/ss-hero.jpg', alt: 'Soul Shades: DJ DX and Julie Schatz', caption: 'Soul Shades, DJ DX and Julie Schatz' },
  { src: '/glasshouse-dj-dx-contentsquare-nyc.jpg', alt: 'DJ DX at the decks at Contentsquare’s CX Circle NYC 2026, The Glasshouse, with the Hudson River at sunset behind him', caption: 'DJ DX at The Glasshouse, NYC' },
  { src: '/nautadutilh-violin-skyline-nyc.jpg', alt: 'Julie Schatz on violin with the Manhattan skyline and St. Patrick’s Cathedral, 620 Loft & Garden rooftop', caption: 'Julie Schatz, live violin, Rockefeller Center' },
  { src: '/julie-schatz-violin-cocktail-hour.jpg', alt: 'Julie Schatz in a black dress playing violin at an evening cocktail hour under string lights', caption: 'Julie Schatz at a cocktail hour' },
  { src: '/nautadutilh-dj-dx-620-loft-garden-nyc.jpg', alt: 'DJ DX at the NautaDutilh reception, 620 Loft & Garden rooftop, with St. Patrick’s Cathedral in the background', caption: 'DJ DX at 620 Loft & Garden' },
  { src: '/nautadutilh-julie-violin-cathedral-nyc.jpg', alt: 'Julie Schatz playing violin on the 620 Loft & Garden rooftop with St. Patrick’s Cathedral behind', caption: 'On the rooftop, landscape' },
];

const LOGOS: { file: string; label: string; light?: boolean }[] = [
  { file: 'soul-shades-logo-horizontal-for-dark-backgrounds.png', label: 'Horizontal, for dark backgrounds' },
  { file: 'soul-shades-logo-horizontal-for-light-backgrounds.png', label: 'Horizontal, for light backgrounds', light: true },
  { file: 'soul-shades-logo-stacked-for-dark-backgrounds.png', label: 'Stacked, for dark backgrounds' },
  { file: 'soul-shades-logo-stacked-for-light-backgrounds.png', label: 'Stacked, for light backgrounds', light: true },
  { file: 'soul-shades-logo-horizontal-all-white.png', label: 'One colour, white' },
  { file: 'soul-shades-logo-horizontal-all-black.png', label: 'One colour, black', light: true },
];

const LISTEN: [string, string][] = [
  ['Spotify', 'https://open.spotify.com/artist/2GES5fSFNcx25lv9RFcQjP'],
  ['Apple Music', 'https://music.apple.com/us/artist/soul-shades/1783698611'],
  ['YouTube', 'https://www.youtube.com/@soulshadesmusic'],
  ['TikTok', 'https://www.tiktok.com/@soulshadesmusic'],
  ['Instagram', 'https://www.instagram.com/soulshadesmusic/'],
  ['SoundCloud', 'https://soundcloud.com/soulshadesmusic'],
  ['Bandcamp', 'https://soulshadesmusic.bandcamp.com/'],
];

const fileName = (src: string) => src.split('/').pop() as string;

function Body() {
  const openBooking = useBookingDialog();
  const book = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.focus(); openBooking('duo-dj-violin'); };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE}${PATH}#webpage`,
        url: `${SITE}${PATH}`,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#soulshades` },
        mainEntity: { '@id': `${SITE}/#soulshades` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/ss-hero.jpg` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Soul Shades', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Press Kit', item: `${SITE}${PATH}` },
        ],
      },
    ],
  };

  return (
    <article className="sp epk">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE}${PATH}`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="Soul Shades" />
        <meta property="og:url" content={`${SITE}${PATH}`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={`${SITE}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <nav className="sp-crumbs" aria-label="Breadcrumb">
        <a href="/">Soul Shades</a><span aria-hidden="true">/</span><span aria-current="page">Press Kit</span>
      </nav>

      <header className="sp-hero">
        <div className="sp-hero-text">
          <p className="ss-section-label">Electronic Press Kit</p>
          <h1 className="sp-h1">Soul Shades <span>Press Kit</span></h1>
          <p className="sp-lead">
            Bios, fast facts, photos and logos for press, promoters, venues and event planners. Everything on this
            page is free to use when writing about or promoting Soul Shades.
          </p>
          <div className="sp-actions">
            <a href="#photos" className="ss-hero-btn">Photos &amp; logos</a>
            <button type="button" className="ss-hero-btn ss-hero-btn--ghost" aria-haspopup="dialog" onClick={book}>Booking inquiry</button>
          </div>
        </div>
        <div className="sp-hero-photo">
          <img {...responsive('/ss-hero.jpg', '(min-width: 901px) 460px, 100vw')} alt="Soul Shades: DJ DX and Julie Schatz" style={{ objectPosition: '62% 28%' }} fetchPriority="high" />
        </div>
      </header>

      <dl className="sp-facts">
        <div><dt>Members</dt><dd>DJ DX and Julie Schatz</dd></div>
        <div><dt>Formed</dt><dd>2024, New York City</dd></div>
        <div><dt>Sound</dt><dd>Deep House, Afro House, Jazz, R&amp;B, Hip-Hop</dd></div>
        <div><dt>Live show</dt><dd>DJ set with live violin, vocals and keys</dd></div>
      </dl>

      <section className="sp-block" aria-labelledby="epk-short">
        <div className="epk-bio-head">
          <h2 id="epk-short" className="sp-h2">Short bio</h2>
          <span className="epk-count">About 75 words</span>
        </div>
        <blockquote className="epk-copy"><p>{SHORT_BIO}</p></blockquote>
      </section>

      <section className="sp-block" aria-labelledby="epk-long">
        <div className="epk-bio-head">
          <h2 id="epk-long" className="sp-h2">Long bio</h2>
          <span className="epk-count">About 250 words</span>
        </div>
        <div className="epk-copy epk-copy--long">
          <p>
            Soul Shades is a New York–based duo of DJ DX and Julie Schatz. DJ DX is a DJ, turntablist, producer
            and rapper with more than 25 years behind the decks. Julie Schatz is a vocalist, violinist, pianist and
            producer. Together since 2024, they make music that moves between Deep House, Afro House, Jazz, R&amp;B,
            Hip-Hop and Reggaeton, and they perform it the same way: DJ DX mixes while Julie plays violin and keys
            and sings over the set, live.
          </p>
          <p>
            Both came up crate-digging in New York, DJ DX in the vinyl racks and Julie through the CD stacks, and
            the catalogue reflects it. Originals including <cite>“Beyond Your Mind,”</cite>{' '}
            <cite>“Wait For Me,”</cite> <cite>“Kiss Of Life”</cite> and <cite>“Buzz In London”</cite> sit beside
            blends of songs that rarely share a playlist. Their pairing of <cite>“I Only Smoke When I Drink”</cite>{' '}
            with <cite>“Englishman in New York”</cite> was featured by the label Ninja Tune.
          </p>
          <p>
            The duo has 14 releases and more than 10 million views across TikTok and Instagram. Their new release,{' '}
            <cite>“Get Up,”</cite> is out on Friday, December 18, 2026.
          </p>
          <p>
            On stage, Soul Shades plays clubs, weddings, private parties and corporate events across New York, New
            Jersey and Connecticut, and further afield by arrangement. Recent dates include Contentsquare’s CX Circle
            NYC at The Glasshouse in October 2026, a reception for more than 1,000 guests, and a rooftop reception
            for the law firm NautaDutilh at 620 Loft &amp; Garden in Rockefeller Center. Their motto sums up the
            approach: blending genres, creating moods.
          </p>
        </div>
      </section>

      <section className="sp-block" aria-labelledby="epk-highlights">
        <h2 id="epk-highlights" className="sp-h2">Highlights</h2>
        <ul className="epk-stats">
          <li><strong>10M+</strong><span>Views across TikTok and Instagram</span></li>
          <li><strong>14</strong><span>Releases</span></li>
          <li><strong>Ninja Tune</strong><span>Featured blend</span></li>
          <li><strong>1,000+</strong><span>Guests at Contentsquare CX Circle NYC</span></li>
        </ul>
      </section>

      <section className="sp-block" id="photos" aria-labelledby="epk-photos">
        <h2 id="epk-photos" className="sp-h2">Press photos</h2>
        <p className="sp-note epk-note">Web resolution. For print-resolution files, email <a href="mailto:hello@soulshadesmusic.com">hello@soulshadesmusic.com</a>.</p>
        <ul className="epk-photos">
          {PHOTOS.map(p => (
            <li key={p.src}>
              <figure>
                <img {...responsive(p.src, '(min-width: 901px) 360px, (min-width: 521px) 50vw, 100vw')} alt={p.alt} loading="lazy" decoding="async" />
                <figcaption>
                  <span>{p.caption}</span>
                  <a href={p.src} download={fileName(p.src)} aria-label={`Download photo: ${p.caption}`}>Download</a>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <section className="sp-block" aria-labelledby="epk-logos">
        <h2 id="epk-logos" className="sp-h2">Logos</h2>
        <p className="sp-note epk-note">Transparent PNG, 1200 pixels wide. Please don’t recolour, stretch or add effects.</p>
        <ul className="epk-logos">
          {LOGOS.map(l => (
            <li key={l.file}>
              <div className={`epk-logo-tile${l.light ? ' epk-logo-tile--light' : ''}`}>
                <img src={`/press/${l.file}`} alt={`Soul Shades logo, ${l.label.toLowerCase()}`} loading="lazy" decoding="async" />
              </div>
              <div className="epk-logo-meta">
                <span>{l.label}</span>
                <a href={`/press/${l.file}`} download={l.file} aria-label={`Download logo: ${l.label}`}>Download</a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="sp-block" aria-labelledby="epk-events">
        <h2 id="epk-events" className="sp-h2">Recent events</h2>
        <ul className="epk-list">
          <li>
            <a href="/events/contentsquare-cx-circle-nyc"><strong>Contentsquare CX Circle NYC</strong></a>
            <span>The Glasshouse, Hell’s Kitchen · October 13, 2026 · 1,000+ guests</span>
          </li>
          <li>
            <a href="/events/nautadutilh-620-loft-garden"><strong>NautaDutilh reception</strong></a>
            <span>620 Loft &amp; Garden, Rockefeller Center · June 2, 2026 · 175 guests</span>
          </li>
        </ul>
        <div className="sp-quotes">
          <figure className="sp-quote">
            <blockquote><p>“The music was just perfect and the vibe was great. I love the uniqueness of keyboard and violin together with DJing — I don’t think there are a lot of DJs who come with this built into the duo.”</p></blockquote>
            <figcaption><strong>Sue Krebs</strong><span>NautaDutilh New York P.C.</span></figcaption>
          </figure>
          <figure className="sp-quote">
            <blockquote><p>“Your performance set the tone for our event, and the addition of the violin amplified our guests’ experience and made the evening memorable.”</p></blockquote>
            <figcaption><strong>Anna Naraine</strong><span>NautaDutilh New York P.C.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="sp-block" aria-labelledby="epk-listen">
        <h2 id="epk-listen" className="sp-h2">Listen and watch</h2>
        <ul className="epk-links">
          {LISTEN.map(([name, href]) => (
            <li key={name}><a href={href} target="_blank" rel="noopener noreferrer">{name} <span aria-hidden="true">↗</span></a></li>
          ))}
        </ul>
        <p className="sp-note">
          Live performance videos are on the <a href="/#videos" className="gig-cta-link">home page</a>, and the new
          release has its own page: <a href="/get-up" className="gig-cta-link">Get Up</a>.
        </p>
      </section>

      <section className="sp-block" aria-labelledby="epk-members">
        <h2 id="epk-members" className="sp-h2">The members</h2>
        <ul className="epk-list">
          <li>
            <a href="https://djdxmusic.com/" target="_blank" rel="noopener"><strong>DJ DX</strong> <span aria-hidden="true">↗</span></a>
            <span>DJ, turntablist, producer and rapper. 25+ years behind the decks. djdxmusic.com</span>
          </li>
          <li>
            <a href="https://julieschatzmusic.com/" target="_blank" rel="noopener"><strong>Julie Schatz</strong> <span aria-hidden="true">↗</span></a>
            <span>Vocalist, violinist, pianist and producer. julieschatzmusic.com</span>
          </li>
        </ul>
      </section>

      <section className="gig-cta sp-cta">
        <div>
          <h2>Contact</h2>
          <p>
            Bookings: <a href="mailto:bookings@soulshadesmusic.com" className="gig-cta-link">bookings@soulshadesmusic.com</a><br />
            Press and everything else: <a href="mailto:hello@soulshadesmusic.com" className="gig-cta-link">hello@soulshadesmusic.com</a>
          </p>
        </div>
        <button type="button" className="ss-hero-btn" aria-haspopup="dialog" onClick={book}>Booking inquiry</button>
      </section>
    </article>
  );
}

export default function EpkPage() {
  return (
    <BookingDialogProvider>
      <PageShell><Body /></PageShell>
    </BookingDialogProvider>
  );
}
