import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import PageShell from '../components/PageShell';
import { BookingDialogProvider, useBookingDialog } from '../components/BookingDialog';
import { responsive, webp } from '../lib/img';

/* One page per recent event: what the event was, the room, how the set ran,
   and what the client said. Every fact here is also on the home page
   (RecentBookings, Proof) or on DJ DX's venue pages; keep them in step and
   never add a detail that hasn't been confirmed. Both clients agreed to be
   named. */

const SITE = 'https://soulshadesmusic.com';

type Fact = [label: string, value: string];
type Media =
  | { kind: 'img'; src: string; alt: string; cap: string; wide?: boolean }
  | { kind: 'video'; src: string; poster: string; alt: string; cap: string };
type Quote = { text: string; name: string; org: string };

type Study = {
  path: string;
  title: string;
  description: string;
  crumb: string;
  h1: ReactNode;
  lead: ReactNode;
  hero: { src: string; alt: string; position?: string };
  facts: Fact[];
  sections: { h: string; body: ReactNode }[];
  gallery: Media[];
  quotes: Quote[];
  event: {
    name: string;
    startDate: string;
    endDate?: string;
    organizer: string;
    place: string;
    street: string;
    postalCode: string;
    guests: number;
    image: string;
  };
  related: { href: string; label: string; note: string }[];
};

const CONTENTSQUARE: Study = {
  path: '/events/contentsquare-cx-circle-nyc',
  title: 'Contentsquare CX Circle NYC at The Glasshouse | Soul Shades',
  description: 'Soul Shades played the evening reception of Contentsquare’s CX Circle NYC at The Glasshouse: DJ plus live violin for 1,000+ guests, October 13, 2026.',
  crumb: 'Contentsquare CX Circle NYC',
  h1: <>Contentsquare CX Circle NYC <span>at The Glasshouse</span></>,
  lead: (
    <>
      On October 13, 2026, Soul Shades played the evening reception of Contentsquare’s CX Circle NYC at The
      Glasshouse, 660 12th Avenue in Hell’s Kitchen. DJ DX mixed and Julie Schatz played live violin from 5 to
      7 pm for more than 1,000 guests, as the sun went down over the Hudson behind the booth.
    </>
  ),
  hero: { src: '/glasshouse-dj-dx-contentsquare-nyc.jpg', alt: 'DJ DX at the decks at Contentsquare’s CX Circle NYC 2026, The Glasshouse, with the Hudson River at sunset behind him', position: '50% 40%' },
  facts: [['Client', 'Contentsquare'], ['Date', 'October 13, 2026'], ['Guests', '1,000+'], ['Set', 'Evening reception, 5 to 7 pm']],
  sections: [
    {
      h: 'What was the event?',
      body: (
        <>
          <p>
            CX Circle is Contentsquare’s customer-experience conference, a one-day event for marketing, product and
            digital leaders. Soul Shades played the reception as the day moved into the evening, when the sessions
            give way to networking.
          </p>
          <p>
            The set was the duo’s signature format: DJ DX on the decks with Julie Schatz playing live violin over
            the mix, so the music in the room was being made in the room.
          </p>
        </>
      ),
    },
    {
      h: 'What did a room this size need?',
      body: (
        <>
          <p>
            The Glasshouse is a large event space on the Hudson side of Midtown, with floor-to-ceiling windows onto
            the water. With more than 1,000 guests, the music had to sit under conversation while people were
            networking, then lift as the room filled.
          </p>
          <p>
            Sound was sized for the room and set up and tested before doors opened, with one point of contact for
            the music throughout. More on how corporate bookings run is on the{' '}
            <a href="/corporate-event-entertainment-nyc">corporate events page</a>.
          </p>
        </>
      ),
    },
  ],
  gallery: [
    { kind: 'video', src: '/videos/glasshouse-contentsquare-nyc.mp4', poster: '/glasshouse-contentsquare-poster.jpg', alt: 'DJ DX at the decks during Contentsquare CX Circle NYC 2026 at The Glasshouse, Hudson River at sunset behind', cap: 'On the floor during the reception' },
    { kind: 'img', src: '/glasshouse-event-space-hudson-nyc.jpg', alt: 'The Glasshouse event space at 660 12th Avenue, Hell’s Kitchen, with floor-to-ceiling windows onto the Hudson', cap: 'The Glasshouse, 660 12th Avenue' },
    { kind: 'img', src: '/glasshouse-dj-booth-setup-nyc.jpg', alt: 'The Soul Shades DJ booth set up at The Glasshouse for Contentsquare CX Circle NYC 2026', cap: 'The Soul Shades booth before doors' },
  ],
  quotes: [],
  event: {
    name: 'Contentsquare CX Circle NYC 2026 reception with Soul Shades',
    startDate: '2026-10-13T17:00:00-04:00',
    endDate: '2026-10-13T19:00:00-04:00',
    organizer: 'Contentsquare',
    place: 'The Glasshouse',
    street: '660 12th Ave',
    postalCode: '10019',
    guests: 1000,
    image: '/glasshouse-dj-dx-contentsquare-nyc.jpg',
  },
  related: [
    { href: '/events/nautadutilh-620-loft-garden', label: 'NautaDutilh at 620 Loft & Garden', note: 'A 175-guest rooftop reception' },
    { href: '/corporate-event-entertainment-nyc', label: 'Corporate event entertainment', note: 'Formats, prices and how booking works' },
    { href: '/dj-violin-duo-nyc', label: 'The DJ + live violin duo', note: 'How the duo works' },
  ],
};

const NAUTADUTILH: Study = {
  path: '/events/nautadutilh-620-loft-garden',
  title: 'NautaDutilh Reception at 620 Loft & Garden | Soul Shades',
  description: 'Soul Shades played a 175-guest NautaDutilh reception on the 620 Loft & Garden rooftop at Rockefeller Center: DJ with live violin, June 2, 2026.',
  crumb: 'NautaDutilh Reception',
  h1: <>NautaDutilh Reception <span>at 620 Loft &amp; Garden</span></>,
  lead: (
    <>
      On June 2, 2026, Soul Shades played a 175-guest reception for the international law firm NautaDutilh on
      the 620 Loft &amp; Garden rooftop at Rockefeller Center, facing St. Patrick’s Cathedral. DJ DX mixed and
      Julie Schatz layered live violin and keys on top, from cocktail hour through the after-party.
    </>
  ),
  hero: { src: '/nautadutilh-julie-violin-cathedral-nyc.jpg', alt: 'Julie Schatz playing violin on the 620 Loft & Garden rooftop with St. Patrick’s Cathedral behind', position: '50% 35%' },
  facts: [['Client', 'NautaDutilh New York P.C.'], ['Date', 'June 2, 2026'], ['Guests', '175'], ['Set', 'DJ set with live violin and keys']],
  sections: [
    {
      h: 'What was the event?',
      body: (
        <>
          <p>
            A corporate reception for NautaDutilh New York P.C., held on the rooftop garden above Fifth Avenue at
            Rockefeller Center. The night ran from cocktail hour through the after-party, with the music building
            as the evening went on.
          </p>
          <p>
            Julie Schatz played violin and keys over DJ DX’s set, so guests heard familiar songs turned into
            something new, live, with the cathedral and the Midtown skyline as the backdrop.
          </p>
        </>
      ),
    },
    {
      h: 'What should planners know about 620 Loft & Garden?',
      body: (
        <>
          <p>
            The venue pairs a rooftop garden with an indoor loft, so the sound has to be planned twice: for open air
            outside and for a more reflective room inside.
          </p>
          <p>
            Rockefeller Center is the busiest place in New York from late November through New Year’s. For a
            holiday party here, book the date early and plan load-in around tree-season crowds. More on formats and
            prices is on the <a href="/corporate-event-entertainment-nyc">corporate events page</a>.
          </p>
        </>
      ),
    },
  ],
  gallery: [
    { kind: 'img', src: '/nautadutilh-group-photo-cathedral-nyc.jpg', alt: 'NautaDutilh guests posing for a group photo on the 620 Loft & Garden rooftop in front of St. Patrick’s Cathedral', cap: 'The firm’s group photo, St. Patrick’s Cathedral behind', wide: true },
    { kind: 'img', src: '/nautadutilh-violin-skyline-nyc.jpg', alt: 'Julie Schatz on violin with the Manhattan skyline and St. Patrick’s Cathedral, 620 Loft & Garden rooftop', cap: 'Julie Schatz, live violin' },
    { kind: 'img', src: '/nautadutilh-dj-dx-620-loft-garden-nyc.jpg', alt: 'DJ DX at the NautaDutilh reception, 620 Loft & Garden rooftop, with St. Patrick’s Cathedral in the background', cap: 'DJ DX at the booth' },
    { kind: 'video', src: '/videos/nautadutilh-rooftop-night-nyc.mp4', poster: '/nautadutilh-rooftop-night-poster.jpg', alt: 'Soul Shades rooftop setup at night, Manhattan skyline, NautaDutilh reception at 620 Loft & Garden', cap: 'After dark on the rooftop' },
  ],
  quotes: [
    {
      text: 'The music was just perfect and the vibe was great. I love the uniqueness of keyboard and violin together with DJing — I don’t think there are a lot of DJs who come with this built into the duo.',
      name: 'Sue Krebs',
      org: 'NautaDutilh New York P.C.',
    },
    {
      text: 'Your performance set the tone for our event, and the addition of the violin amplified our guests’ experience and made the evening memorable.',
      name: 'Anna Naraine',
      org: 'NautaDutilh New York P.C.',
    },
  ],
  event: {
    name: 'NautaDutilh reception with Soul Shades at 620 Loft & Garden',
    startDate: '2026-06-02',
    organizer: 'NautaDutilh New York P.C.',
    place: '620 Loft & Garden',
    street: '620 5th Ave',
    postalCode: '10020',
    guests: 175,
    image: '/nautadutilh-group-photo-cathedral-nyc.jpg',
  },
  related: [
    { href: '/events/contentsquare-cx-circle-nyc', label: 'Contentsquare CX Circle NYC', note: '1,000+ guests at The Glasshouse' },
    { href: '/corporate-event-entertainment-nyc', label: 'Corporate event entertainment', note: 'Formats, prices and how booking works' },
    { href: '/dj-violin-duo-nyc', label: 'The DJ + live violin duo', note: 'How the duo works' },
  ],
};

function Body({ d }: { d: Study }) {
  const openBooking = useBookingDialog();
  const book = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.focus(); openBooking('duo-dj-violin'); };
  const url = `${SITE}${d.path}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: d.title,
        description: d.description,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${url}#event` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}${d.event.image}` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'Event',
        '@id': `${url}#event`,
        name: d.event.name,
        startDate: d.event.startDate,
        ...(d.event.endDate ? { endDate: d.event.endDate } : {}),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        maximumAttendeeCapacity: d.event.guests,
        image: `${SITE}${d.event.image}`,
        description: d.description,
        organizer: { '@type': 'Organization', name: d.event.organizer },
        performer: { '@id': `${SITE}/#soulshades` },
        location: {
          '@type': 'Place',
          name: d.event.place,
          address: { '@type': 'PostalAddress', streetAddress: d.event.street, addressLocality: 'New York', addressRegion: 'NY', postalCode: d.event.postalCode, addressCountry: 'US' },
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Soul Shades', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Corporate Events', item: `${SITE}/corporate-event-entertainment-nyc` },
          { '@type': 'ListItem', position: 3, name: d.crumb, item: url },
        ],
      },
    ],
  };

  return (
    <article className="sp">
      <Helmet>
        <title>{d.title}</title>
        <meta name="description" content={d.description} />
        <link rel="canonical" href={url} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Soul Shades" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={d.title} />
        <meta property="og:description" content={d.description} />
        <meta property="og:image" content={`${SITE}${webp(d.event.image)}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={d.title} />
        <meta name="twitter:description" content={d.description} />
        <meta name="twitter:image" content={`${SITE}${webp(d.event.image)}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <nav className="sp-crumbs" aria-label="Breadcrumb">
        <a href="/">Soul Shades</a><span aria-hidden="true">/</span>
        <a href="/corporate-event-entertainment-nyc">Corporate Events</a><span aria-hidden="true">/</span>
        <span aria-current="page">{d.crumb}</span>
      </nav>

      <header className="sp-hero">
        <div className="sp-hero-text">
          <p className="ss-section-label">Recent event</p>
          <h1 className="sp-h1">{d.h1}</h1>
          <p className="sp-lead">{d.lead}</p>
          <div className="sp-actions">
            <button type="button" className="ss-hero-btn" aria-haspopup="dialog" onClick={book}>Check Your Date</button>
            <a href="#photos" className="ss-hero-btn ss-hero-btn--ghost">Photos &amp; video</a>
          </div>
        </div>
        <div className="sp-hero-photo">
          <img {...responsive(d.hero.src, '(min-width: 901px) 460px, 100vw')} alt={d.hero.alt} style={{ objectPosition: d.hero.position }} fetchPriority="high" />
        </div>
      </header>

      <dl className="sp-facts">
        {d.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>

      <div className="sp-prose">
        {d.sections.map(s => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.body}
          </section>
        ))}
      </div>

      <section className="sp-block" id="photos" aria-labelledby="cs-photos">
        <h2 id="cs-photos" className="sp-h2">Photos and video</h2>
        <div className="cs-gallery">
          {d.gallery.map(m => (
            <figure key={m.src} className={`cs-shot${m.kind === 'img' && m.wide ? ' cs-shot--wide' : ''}`}>
              {m.kind === 'video' ? (
                <video controls playsInline muted preload="none" poster={webp(m.poster)} aria-label={m.alt}>
                  <source src={m.src} type="video/mp4" />
                </video>
              ) : (
                <img {...responsive(m.src, m.wide ? '(min-width: 901px) 1136px, 100vw' : '(min-width: 901px) 370px, 100vw')} alt={m.alt} loading="lazy" decoding="async" />
              )}
              <figcaption>{m.cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {d.quotes.length > 0 && (
        <section className="sp-block" aria-labelledby="cs-quotes">
          <h2 id="cs-quotes" className="sp-h2">What the client said</h2>
          <div className="sp-quotes">
            {d.quotes.map(q => (
              <figure className="sp-quote" key={q.name}>
                <blockquote><p>“{q.text}”</p></blockquote>
                <figcaption><strong>{q.name}</strong><span>{q.org}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="gig-cta sp-cta">
        <div>
          <h2>Planning an event like this?</h2>
          <p>Tell us your date, venue and guest count. We’ll confirm availability and send a written quote within 24–48 hours.</p>
        </div>
        <button type="button" className="ss-hero-btn" aria-haspopup="dialog" onClick={book}>Check Your Date</button>
      </section>

      <nav className="sp-related" aria-label="Related">
        {d.related.map(r => (
          <a key={r.href} href={r.href}><strong>{r.label}</strong><span>{r.note}</span></a>
        ))}
      </nav>
    </article>
  );
}

const make = (d: Study) => function CaseStudyPage() {
  return (
    <BookingDialogProvider>
      <PageShell><Body d={d} /></PageShell>
    </BookingDialogProvider>
  );
};

export const ContentsquarePage = make(CONTENTSQUARE);
export const NautaDutilhPage = make(NAUTADUTILH);
