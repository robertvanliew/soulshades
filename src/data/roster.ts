/* Everything Soul Shades Music books, as its label and booking home.

   Descriptions here are written for this site, not copied from the member
   sites (copying would make the three sites compete in search). Each service
   links to the page on the member's own site that ranks for it.

   Prices: starting rates. DJ + live violin is from $3,500 (confirmed by the
   duo; julieschatzmusic.com/pricing still lists $4,500 and should be updated). */

export type Service = {
  id: string;
  title: string;
  blurb: string;
  price?: string;
  details: { label: string; href: string };
};

export type Act = {
  id: 'duo' | 'djdx' | 'julie';
  name: string;
  tagline: string;
  photo: { src: string; alt: string; focus: string };
  site?: { label: string; href: string };
  services: Service[];
};

export const ROSTER: Act[] = [
  {
    id: 'duo',
    name: 'Soul Shades',
    tagline: 'The duo: DJ DX and Julie Schatz together',
    photo: { src: '/ss-hero.jpg', alt: 'Soul Shades: DJ DX and Julie Schatz', focus: '62% 30%' },
    site: { label: 'the duo page', href: '/dj-violin-duo-nyc' },
    services: [
      {
        id: 'duo-dj-violin',
        title: 'DJ + Live Violin',
        blurb: 'DJ DX on the decks with Julie playing violin, keys and vocals over the mix. Our signature set for galas, receptions and dance floors.',
        price: 'From $3,500',
        details: { label: 'julieschatzmusic.com', href: 'https://julieschatzmusic.com/dj-violin-duo-nyc/' },
      },
      {
        id: 'duo-violin-piano',
        title: 'Violin + Piano Duo',
        blurb: 'Two musicians, violin and piano, for ceremonies, cocktail hours and dinners where the room should breathe.',
        price: 'Ceremony from $2,875',
        details: { label: 'julieschatzmusic.com', href: 'https://julieschatzmusic.com/pricing' },
      },
      {
        id: 'duo-dj-piano',
        title: 'DJ + Live Piano',
        blurb: 'A DJ set with live keys played on top: jazz chords over house, soul over hip-hop.',
        details: { label: 'djdxmusic.com', href: 'https://djdxmusic.com/piano-dj-duo-nyc-nj' },
      },
    ],
  },
  {
    id: 'djdx',
    name: 'DJ DX',
    tagline: 'DJ, turntablist and producer, 25+ years behind the decks',
    photo: { src: '/glasshouse-dj-dx-contentsquare-nyc.jpg', alt: 'DJ DX at the decks at The Glasshouse, NYC', focus: '40% 30%' },
    site: { label: 'djdxmusic.com', href: 'https://djdxmusic.com/' },
    services: [
      {
        id: 'djdx-corporate',
        title: 'Corporate Events & Holiday Parties',
        blurb: 'Receptions, galas, launches and office parties, with run-of-show planning and COI on request.',
        price: 'From $2,800',
        details: { label: 'djdxmusic.com', href: 'https://djdxmusic.com/corporate-event-dj-nyc-nj-ct' },
      },
      {
        id: 'djdx-wedding',
        title: 'Weddings',
        blurb: 'Ceremony through after-party, reading the room from the first dance to the last song.',
        price: 'From $2,800',
        details: { label: 'djdxmusic.com', href: 'https://djdxmusic.com/wedding-dj-nyc-nj' },
      },
      {
        id: 'djdx-private',
        title: 'Private Parties & Birthdays',
        blurb: 'Milestone birthdays, rooftops, lounges and homes.',
        price: 'From $2,800',
        details: { label: 'djdxmusic.com', href: 'https://djdxmusic.com/private-party-dj-nyc-nj' },
      },
      {
        id: 'djdx-sweet16',
        title: 'Sweet 16s, Quinceañeras & Mitzvahs',
        blurb: 'High-energy sets with an MC, built around the guest of honor.',
        price: 'From $1,500',
        details: { label: 'djdxmusic.com', href: 'https://djdxmusic.com/sweet-16-dj-nyc-nj' },
      },
    ],
  },
  {
    id: 'julie',
    name: 'Julie Schatz',
    tagline: 'Violinist, pianist, vocalist and producer',
    photo: { src: '/julie-schatz-violin-cocktail-hour.jpg', alt: 'Julie Schatz in a black dress playing violin at an evening cocktail hour under string lights', focus: '50% 18%' },
    site: { label: 'julieschatzmusic.com', href: 'https://julieschatzmusic.com/' },
    services: [
      {
        id: 'julie-ceremony',
        title: 'Wedding Ceremony Violin',
        blurb: 'Prelude, processional and recessional on solo violin, sound system included.',
        price: 'From $725',
        details: { label: 'julieschatzmusic.com', href: 'https://julieschatzmusic.com/wedding-violinist-nyc/' },
      },
      {
        id: 'julie-piano',
        title: 'Jazz Piano & Cocktail Hour',
        blurb: 'Jazz and modern piano for cocktail hours, dinners and receptions.',
        price: 'From $875',
        details: { label: 'julieschatzmusic.com', href: 'https://julieschatzmusic.com/wedding-pianist-nj-nyc/' },
      },
      {
        id: 'julie-violin-dj',
        title: 'Hip-Hop & House Violin over a DJ',
        blurb: 'Live violin layered over a DJ set, for parties that want a moment on the dance floor.',
        details: { label: 'julieschatzmusic.com', href: 'https://julieschatzmusic.com/hip-hop-violin-dj-nyc/' },
      },
      {
        id: 'julie-corporate',
        title: 'Corporate Events',
        blurb: 'Solo violin or piano for client dinners, launches and galas, from background to feature performance.',
        price: 'From $1,200',
        details: { label: 'julieschatzmusic.com', href: 'https://julieschatzmusic.com/corporate-events' },
      },
    ],
  },
];

/** "Act — Service" labels for the booking form and the inquiry email. */
export const SERVICE_OPTIONS = ROSTER.map(act => ({
  group: act.name,
  options: act.services.map(s => ({ id: s.id, label: `${act.name} — ${s.title}` })),
}));

export const serviceLabel = (id: string) =>
  SERVICE_OPTIONS.flatMap(g => g.options).find(o => o.id === id)?.label ?? '';
