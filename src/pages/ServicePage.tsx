import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import PageShell from '../components/PageShell';
import { BookingDialogProvider, useBookingDialog } from '../components/BookingDialog';

/* Landing pages for the two searches Soul Shades should own and that neither
   member's own site targets: the DJ + live violin duo, and corporate event
   entertainment. (Wedding-DJ and solo-violin searches stay with djdxmusic.com
   and julieschatzmusic.com; these pages link out to them.)

   Each page opens with a short, self-contained answer, uses question
   headings, and keeps prices in a real table, so both people and AI search
   can lift the facts cleanly. Every fact here is already stated elsewhere on
   the site (src/data/roster.ts, RecentBookings, Proof); keep them in step. */

const SITE = 'https://soulshadesmusic.com';

type Format = { name: string; bestFor: string; price: string };
type QA = { q: string; a: ReactNode; text: string };
type Fact = [label: string, value: string];
type Event = { title: string; venue: string; meta: string; img: string; alt: string; specs: Fact[] };
type Quote = { text: string; name: string; org: string };

type PageData = {
  path: string;
  title: string;
  description: string;
  crumb: string;
  label: string;
  h1: ReactNode;
  lead: ReactNode;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  priceFrom: number;
  hero: { src: string; alt: string; position?: string };
  facts: Fact[];
  sections: { h: string; body: ReactNode }[];
  formatsTitle: string;
  formats: Format[];
  quotes: Quote[];
  faqs: QA[];
  related: { href: string; label: string; note: string }[];
};

const EVENTS: Event[] = [
  {
    title: 'Contentsquare CX Circle NYC',
    venue: 'The Glasshouse',
    meta: 'October 13, 2026',
    img: '/glasshouse-event-space-hudson-nyc.jpg',
    alt: 'The Glasshouse event space at 660 12th Avenue, Hell’s Kitchen, during Contentsquare CX Circle NYC',
    specs: [['Client', 'Contentsquare'], ['Venue', 'The Glasshouse, Hell’s Kitchen'], ['Guests', '1,000+'], ['Set', 'Evening reception, 5 to 7 pm']],
  },
  {
    title: 'NautaDutilh Reception',
    venue: '620 Loft & Garden',
    meta: 'June 2026',
    img: '/nautadutilh-group-photo-cathedral-nyc.jpg',
    alt: 'NautaDutilh guests on the 620 Loft & Garden rooftop in front of St. Patrick’s Cathedral',
    specs: [['Client', 'NautaDutilh New York P.C.'], ['Venue', '620 Loft & Garden, Rockefeller Center'], ['Guests', '175'], ['Set', 'DJ set with live violin']],
  },
];

const SUE: Quote = {
  text: 'The music was just perfect and the vibe was great. I love the uniqueness of keyboard and violin together with DJing — I don’t think there are a lot of DJs who come with this built into the duo.',
  name: 'Sue Krebs',
  org: 'NautaDutilh New York P.C.',
};
const ANNA: Quote = {
  text: 'Your performance set the tone for our event, and the addition of the violin amplified our guests’ experience and made the evening memorable.',
  name: 'Anna Naraine',
  org: 'NautaDutilh New York P.C.',
};

const STEPS: [string, string][] = [
  ['Send your date', 'Tell us the date, times, venue and the kind of event. It takes about two minutes.'],
  ['Hear back in 24–48 hours', 'We confirm availability, recommend a format and send a written quote.'],
  ['Confirm in writing', 'A signed performance agreement secures the date. A certificate of insurance and W-9 are available on request.'],
];

const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener">{children}</a>
);

// ── The two pages ────────────────────────────────────────────────────────────
const DUO: PageData = {
  path: '/dj-violin-duo-nyc',
  title: 'DJ + Live Violin Duo NYC | Weddings & Events | Soul Shades',
  description: 'Soul Shades is a New York DJ and live violin duo: DJ DX on the decks, Julie Schatz on violin, keys and vocals. Weddings, corporate events and parties from $3,500.',
  crumb: 'DJ + Live Violin Duo',
  label: 'The Duo',
  h1: <>DJ + Live Violin Duo <span>in New York City</span></>,
  lead: (
    <>
      Soul Shades is a New York DJ and live violin duo. DJ DX mixes on the decks while Julie Schatz plays violin
      and keys and sings over the set, live, so the music moves with the room. Book the duo for weddings,
      corporate events and private parties in New York, New Jersey and Connecticut. Bookings start at $3,500.
    </>
  ),
  serviceId: 'duo-dj-violin',
  serviceName: 'DJ + Live Violin Duo',
  serviceType: 'Live music and DJ entertainment for weddings and events',
  priceFrom: 3500,
  hero: { src: '/ss-hero.jpg', alt: 'Soul Shades: DJ DX and Julie Schatz', position: '62% 28%' },
  facts: [['Starting at', '$3,500'], ['Artists', 'DJ DX and Julie Schatz'], ['Area', 'New York, New Jersey, Connecticut'], ['Reply', 'Within 24–48 hours']],
  sections: [
    {
      h: 'What is a DJ + live violin duo?',
      body: (
        <>
          <p>
            A DJ + live violin duo is a DJ set with a violinist playing over it in real time. The DJ carries the
            records and the dance floor; the violin adds a live performance on top, so a familiar song becomes
            something the room hasn’t heard before.
          </p>
          <p>
            With Soul Shades the two parts are one act. DJ DX and Julie Schatz formed the duo in 2024, write and
            release music together, and are the two artists who play when you book it, rather than a DJ and a
            violinist hired separately.
          </p>
        </>
      ),
    },
    {
      h: 'What does a Soul Shades set sound like?',
      body: (
        <>
          <p>
            Deep House, Afro House, Jazz, R&amp;B, Hip-Hop and Reggaeton, blended across the night. Julie sings,
            writes and plays violin and keys; DJ DX cuts, produces and raps.
          </p>
          <p>
            Their originals include <cite>“Beyond Your Mind,”</cite> <cite>“Wait For Me”</cite> and{' '}
            <cite>“Buzz In London.”</cite> Their blend of <cite>“I Only Smoke When I Drink”</cite> with{' '}
            <cite>“Englishman in New York”</cite> was featured by Ninja Tune, and their videos have passed 10
            million views across TikTok and Instagram. You can <a href="/#videos">watch them perform</a> or{' '}
            <a href="/#catalog">hear the music</a> on the home page.
          </p>
        </>
      ),
    },
  ],
  formatsTitle: 'Duo formats and starting prices',
  formats: [
    { name: 'DJ + Live Violin', bestFor: 'Receptions, galas and dance floors. The signature set: DJ DX on the decks with Julie on violin, keys and vocals.', price: 'From $3,500' },
    { name: 'Violin + Piano Duo', bestFor: 'Ceremonies, cocktail hours and dinners, where the room should breathe.', price: 'Ceremony from $2,875' },
    { name: 'DJ + Live Piano', bestFor: 'A DJ set with live keys on top: jazz chords over house, soul over hip-hop.', price: 'Quoted per event' },
  ],
  quotes: [SUE],
  faqs: [
    {
      q: 'How much does a DJ and violinist duo cost in NYC?',
      text: 'Soul Shades’ DJ + live violin duo starts at $3,500. The violin and piano duo starts at $2,875 for a wedding ceremony. The final quote depends on the date, hours, location and production, and every inquiry gets a written quote.',
      a: <>Soul Shades’ DJ + live violin duo starts at $3,500. The violin and piano duo starts at $2,875 for a wedding ceremony. The final quote depends on the date, hours, location and production, and every inquiry gets a written quote.</>,
    },
    {
      q: 'Can we book just the DJ or just the violinist?',
      text: 'Yes. DJ DX books solo from $2,800 for weddings, corporate events and private parties, and Julie Schatz books solo from $725 for a wedding ceremony. One inquiry reaches both of them.',
      a: <>Yes. DJ DX books solo from $2,800 for weddings, corporate events and private parties (<Ext href="https://djdxmusic.com/">djdxmusic.com</Ext>), and Julie Schatz books solo from $725 for a wedding ceremony (<Ext href="https://julieschatzmusic.com/">julieschatzmusic.com</Ext>). One inquiry here reaches both of them.</>,
    },
    {
      q: 'Who plays when we book Soul Shades?',
      text: 'Soul Shades is DJ DX and Julie Schatz. When you book the duo, those are the two artists who play.',
      a: <>Soul Shades is DJ DX and Julie Schatz. When you book the duo, those are the two artists who play.</>,
    },
    {
      q: 'Where does Soul Shades play?',
      text: 'New York City, New Jersey and Connecticut, and worldwide by arrangement.',
      a: <>New York City, New Jersey and Connecticut, and worldwide by arrangement.</>,
    },
    {
      q: 'How soon will we hear back?',
      text: 'Within 24 to 48 hours, with availability, a recommended format and a written quote.',
      a: <>Within 24 to 48 hours, with availability, a recommended format and a written quote.</>,
    },
  ],
  related: [
    { href: '/corporate-event-entertainment-nyc', label: 'Corporate event entertainment', note: 'Receptions, galas and launches' },
    { href: '/#services', label: 'Every format and price', note: 'The duo, DJ DX and Julie Schatz' },
    { href: '/#recent-booking', label: 'Where we’ve played', note: 'Photos and video from recent events' },
  ],
};

const CORPORATE: PageData = {
  path: '/corporate-event-entertainment-nyc',
  title: 'Corporate Event Entertainment NYC | DJ + Live Violin | Soul Shades',
  description: 'Live music for corporate events in New York: a DJ set with live violin, keys and vocals. Clients include Contentsquare and NautaDutilh. From $1,200 solo, $3,500 duo.',
  crumb: 'Corporate Events',
  label: 'Corporate Events',
  h1: <>Corporate Event Entertainment <span>in New York City</span></>,
  lead: (
    <>
      Soul Shades provides live music for corporate events in New York: a DJ set with live violin, keys and
      vocals, played by DJ DX and Julie Schatz. Recent clients include Contentsquare, with more than 1,000 guests
      at The Glasshouse, and NautaDutilh New York P.C., with 175 guests at 620 Loft &amp; Garden in Rockefeller
      Center. Corporate bookings start at $1,200 for a solo musician and $3,500 for the duo.
    </>
  ),
  serviceId: 'duo-dj-violin',
  serviceName: 'Corporate Event Entertainment',
  serviceType: 'Live music and DJ entertainment for corporate events',
  priceFrom: 1200,
  hero: { src: '/nautadutilh-group-photo-cathedral-nyc.jpg', alt: 'Guests at the NautaDutilh corporate reception on the 620 Loft & Garden rooftop, Rockefeller Center', position: '64% 50%' },
  facts: [['Starting at', '$1,200 solo · $3,500 duo'], ['Recent events', '175 to 1,000+ guests'], ['Paperwork', 'COI and W-9 on request'], ['Reply', 'Within 24–48 hours']],
  sections: [
    {
      h: 'What kind of corporate events does Soul Shades play?',
      body: (
        <>
          <p>
            Receptions, galas, product launches, conference evenings, client dinners and holiday parties. The duo
            can hold a room as background during arrivals and dinner, then turn it into a dance floor, with the
            violin as a featured moment in between.
          </p>
          <p>
            For a smaller footprint, either artist plays solo: DJ DX for receptions and office parties, or Julie
            Schatz on violin or piano for client dinners and cocktail hours.
          </p>
        </>
      ),
    },
    {
      h: 'What do event planners get?',
      body: (
        <>
          <p>
            A reply within 24 to 48 hours, usually sooner on business days, with availability, a recommended
            format and set length for your room, and an itemised written quote.
          </p>
          <p>
            We plan the set around your run of show. A certificate of insurance (COI) and W-9 are available on
            request, and the booking is confirmed with a signed performance agreement.
          </p>
        </>
      ),
    },
  ],
  formatsTitle: 'Corporate formats and starting prices',
  formats: [
    { name: 'Soul Shades duo: DJ + live violin', bestFor: 'Receptions, galas and launches where the music is part of the event.', price: 'From $3,500' },
    { name: 'DJ DX, solo', bestFor: 'Receptions, launches, holiday and office parties, with run-of-show planning.', price: 'From $2,800' },
    { name: 'Julie Schatz, solo violin or piano', bestFor: 'Client dinners, cocktail hours and galas, from background to feature performance.', price: 'From $1,200' },
  ],
  quotes: [ANNA, SUE],
  faqs: [
    {
      q: 'How much does corporate event entertainment cost in NYC?',
      text: 'With Soul Shades, corporate bookings start at $1,200 for Julie Schatz on solo violin or piano, $2,800 for DJ DX, and $3,500 for the DJ + live violin duo. The final quote depends on the date, hours, location and production.',
      a: <>With Soul Shades, corporate bookings start at $1,200 for Julie Schatz on solo violin or piano, $2,800 for DJ DX, and $3,500 for the DJ + live violin duo. The final quote depends on the date, hours, location and production.</>,
    },
    {
      q: 'Can you provide a certificate of insurance?',
      text: 'Yes. A certificate of insurance (COI) and W-9 are available on request.',
      a: <>Yes. A certificate of insurance (COI) and W-9 are available on request.</>,
    },
    {
      q: 'What size of event can you play?',
      text: 'Recent corporate events range from 175 guests on a Rockefeller Center rooftop to more than 1,000 guests at The Glasshouse.',
      a: <>Recent corporate events range from 175 guests on a Rockefeller Center rooftop to more than 1,000 guests at The Glasshouse.</>,
    },
    {
      q: 'Where do you play?',
      text: 'New York City, New Jersey and Connecticut, and worldwide by arrangement.',
      a: <>New York City, New Jersey and Connecticut, and worldwide by arrangement.</>,
    },
    {
      q: 'How do we book?',
      text: 'Send an inquiry with your date, times and venue. We reply within 24 to 48 hours with availability and a written quote, and a signed performance agreement confirms the booking.',
      a: <>Send an inquiry with your date, times and venue. We reply within 24 to 48 hours with availability and a written quote, and a signed performance agreement confirms the booking.</>,
    },
  ],
  related: [
    { href: '/dj-violin-duo-nyc', label: 'The DJ + live violin duo', note: 'How the duo works, and what it costs' },
    { href: '/#recent-booking', label: 'Where we’ve played', note: 'Photos and video from both events' },
    { href: '/#services', label: 'Every format and price', note: 'The duo, DJ DX and Julie Schatz' },
  ],
};

// ── Layout ───────────────────────────────────────────────────────────────────
function Body({ d }: { d: PageData }) {
  const openBooking = useBookingDialog();
  const book = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.focus(); openBooking(d.serviceId); };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE}${d.path}#service`,
        name: d.serviceName,
        serviceType: d.serviceType,
        description: d.description,
        url: `${SITE}${d.path}`,
        provider: { '@id': `${SITE}/#soulshades` },
        areaServed: ['New York', 'New Jersey', 'Connecticut'],
        offers: { '@type': 'Offer', priceCurrency: 'USD', priceSpecification: { '@type': 'PriceSpecification', minPrice: d.priceFrom, priceCurrency: 'USD' } },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Soul Shades', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: d.crumb, item: `${SITE}${d.path}` },
        ],
      },
    ],
  };

  return (
    <article className="sp">
      <Helmet>
        <title>{d.title}</title>
        <meta name="description" content={d.description} />
        <link rel="canonical" href={`${SITE}${d.path}`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Soul Shades" />
        <meta property="og:url" content={`${SITE}${d.path}`} />
        <meta property="og:title" content={d.title} />
        <meta property="og:description" content={d.description} />
        <meta property="og:image" content={`${SITE}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={d.title} />
        <meta name="twitter:description" content={d.description} />
        <meta name="twitter:image" content={`${SITE}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <nav className="sp-crumbs" aria-label="Breadcrumb">
        <a href="/">Soul Shades</a><span aria-hidden="true">/</span><span aria-current="page">{d.crumb}</span>
      </nav>

      <header className="sp-hero">
        <div className="sp-hero-text">
          <p className="ss-section-label">{d.label}</p>
          <h1 className="sp-h1">{d.h1}</h1>
          <p className="sp-lead">{d.lead}</p>
          <div className="sp-actions">
            <button type="button" className="ss-hero-btn" aria-haspopup="dialog" onClick={book}>Check Your Date</button>
            <a href="#formats" className="ss-hero-btn ss-hero-btn--ghost">Formats &amp; pricing</a>
          </div>
        </div>
        <div className="sp-hero-photo">
          <img src={d.hero.src} alt={d.hero.alt} style={{ objectPosition: d.hero.position }} fetchPriority="high" />
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

      <section className="sp-block" id="formats" aria-labelledby="sp-formats">
        <h2 id="sp-formats" className="sp-h2">{d.formatsTitle}</h2>
        <div className="sp-table-wrap">
          <table className="sp-table">
            <thead>
              <tr><th scope="col">Format</th><th scope="col">Best for</th><th scope="col">Starting price</th></tr>
            </thead>
            <tbody>
              {d.formats.map(f => (
                <tr key={f.name}><th scope="row">{f.name}</th><td>{f.bestFor}</td><td className="sp-price">{f.price}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sp-note">Prices are starting rates in US dollars. Your quote depends on the date, hours, location and production, and always arrives in writing.</p>
      </section>

      <section className="sp-block" aria-labelledby="sp-events">
        <h2 id="sp-events" className="sp-h2">Recent events</h2>
        <div className="sp-events">
          {EVENTS.map(ev => (
            <article className="sp-event" key={ev.title}>
              <div className="sp-event-photo"><img src={ev.img} alt={ev.alt} loading="lazy" decoding="async" /></div>
              <div className="sp-event-body">
                <p className="gig-meta">{ev.meta}</p>
                <h3>{ev.title} <span>at {ev.venue}</span></h3>
                <dl className="gig-specs">
                  {ev.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                </dl>
              </div>
            </article>
          ))}
        </div>
        <div className="sp-quotes">
          {d.quotes.map(q => (
            <figure className="sp-quote" key={q.name}>
              <blockquote><p>“{q.text}”</p></blockquote>
              <figcaption><strong>{q.name}</strong><span>{q.org}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="sp-block" aria-labelledby="sp-steps">
        <h2 id="sp-steps" className="sp-h2">How booking works</h2>
        <ol className="sp-steps">
          {STEPS.map(([t, body], i) => (
            <li key={t}><span className="sp-step-n" aria-hidden="true">{i + 1}</span><div><h3>{t}</h3><p>{body}</p></div></li>
          ))}
        </ol>
      </section>

      <section className="sp-block" aria-labelledby="sp-faq">
        <h2 id="sp-faq" className="sp-h2">Questions planners ask</h2>
        <dl className="sp-faq">
          {d.faqs.map(f => (
            <div key={f.q}><dt><h3>{f.q}</h3></dt><dd>{f.a}</dd></div>
          ))}
        </dl>
      </section>

      <section className="gig-cta sp-cta">
        <div>
          <h2>Ready to check your date?</h2>
          <p>Tell us about your event. We’ll confirm availability and send a written quote within 24–48 hours.</p>
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

const make = (d: PageData) => function ServicePage() {
  return (
    <BookingDialogProvider>
      <PageShell><Body d={d} /></PageShell>
    </BookingDialogProvider>
  );
};

export const DuoPage = make(DUO);
export const CorporatePage = make(CORPORATE);
