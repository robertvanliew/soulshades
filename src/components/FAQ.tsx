import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal';

/* Questions people (and answer engines) actually ask. The visible answers
   and the FAQPage JSON-LD are generated from this one list so they can't
   drift apart. Answers are plain text on purpose. */
const FAQS = [
  {
    q: 'Who is Soul Shades?',
    a: 'Soul Shades is a New York–based music duo of DJ DX and vocalist and multi-instrumentalist Julie Schatz, formed in 2024. They play DJ sets with live violin, vocals and keys, blending deep house, Afro house, jazz, R&B and hip-hop.',
  },
  {
    q: 'What makes a Soul Shades set different from a regular DJ?',
    a: 'It’s a live duo rather than a playlist. DJ DX mixes and produces on the decks while Julie Schatz plays violin and keys and sings over the mix, so the set changes with the room in real time.',
  },
  {
    q: 'Can I book Soul Shades for a wedding, corporate event or private party?',
    a: 'Yes. Soul Shades plays weddings, corporate receptions, private parties, birthdays, and club and venue nights. They are based in New York and available worldwide. Send a booking inquiry on this site and they reply within 24–48 hours.',
  },
  {
    q: 'How much does it cost to book Soul Shades?',
    a: 'The DJ + live violin duo starts at $3,500, and the violin and piano duo starts at $2,875 for a wedding ceremony. DJ DX on his own starts at $2,800, and Julie Schatz solo starts at $725 for a ceremony. The final quote depends on the date, hours, location and production, and every inquiry gets a written quote.',
  },
  {
    q: 'What kind of music does Soul Shades play?',
    a: 'Deep house, Afro house, jazz, R&B, hip-hop and reggaeton — originals such as “Beyond Your Mind” and “Wait For Me,” plus blends that pair records from different genres.',
  },
  {
    q: 'When does “Get Up” come out?',
    a: '“Get Up,” the new Soul Shades release, comes out on Friday, December 18, 2026, on Spotify, Apple Music and the other major platforms.',
  },
  {
    q: 'Where can I listen to Soul Shades?',
    a: 'On Spotify, Apple Music, YouTube, SoundCloud and Bandcamp. Exclusive tracks are also sold in the store on this site.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section className="ss-section faq" id="faq" aria-labelledby="faq-title">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="faq-layout">
        <div>
          <div className="ss-section-label">FAQ</div>
          <h2 className="ss-section-title" id="faq-title">Good to <span>know</span></h2>
        </div>

        <ul className="faq-list">
          {FAQS.map(({ q, a }, n) => {
            const isOpen = open === n;
            const panelId = `faq-panel-${n}`;
            return (
              <Reveal as="li" key={q} className="faq-item" delay={0.04 * n} duration={0.5}>
                <h3>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : n)}
                  >
                    <span>{q}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </button>
                </h3>
                {/* Every answer stays in the page (collapsed, not removed), so
                    search engines and AI assistants can read all of them, not
                    only the one that happens to be open. */}
                <motion.div
                  id={panelId}
                  className="faq-a"
                  aria-hidden={!isOpen}
                  initial={false}
                  animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <p>{a}</p>
                </motion.div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
