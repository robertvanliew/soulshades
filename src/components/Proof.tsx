import { useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import Reveal from './Reveal';
import { responsive } from '../lib/img';

const ArrowUpRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" />
  </svg>
);
const LongArrow = ({ flip = false }: { flip?: boolean }) => (
  <svg width="44" height="14" viewBox="0 0 44 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <line x1="1" y1="7" x2="43" y2="7" /><polyline points="36 1 43 7 36 13" />
  </svg>
);

type Stat = { num: string; label: string; size: 'sm' | 'md' | 'lg'; href?: string; external?: boolean };
const STATS: Stat[] = [
  { num: '10M+', label: 'Views across TikTok & Instagram', href: 'https://www.tiktok.com/@soulshadesmusic', external: true, size: 'lg' },
  { num: '14', label: 'Releases', href: '#catalog', size: 'sm' },
  { num: '1,000+', label: 'Guests at Contentsquare CX Circle', href: '#recent-booking', size: 'sm' },
  { num: 'Ninja Tune', label: 'Featured Remix', size: 'md' },
];

/* Scroll-linked entrance, matched to the recognize.com recording: the cards
   start spread apart and faint, then rise and slide inward together as the
   grid scrolls up, locking into the cluster. Top row first, bottom row
   after. dx/dy are where each card starts relative to its resting place;
   baseX is the resting horizontal offset of the staggered bottom-left card. */
const MOVE = [
  { dx: -56, dy: 70,  baseX: 0,   start: 0.0,  end: 0.5 },
  { dx: 56,  dy: 50,  baseX: 0,   start: 0.04, end: 0.55 },
  { dx: -64, dy: 150, baseX: -36, start: 0.18, end: 0.85 },
  { dx: 64,  dy: 170, baseX: 0,   start: 0.24, end: 0.92 },
];

const WIDE = '(min-width: 901px)';
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
/** The offset cluster (and its sideways travel) only exists on wide screens. */
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => true);

function StatCard({ s, n, progress, still }: { s: Stat; n: number; progress: MotionValue<number>; still: boolean }) {
  const wide = useWide();
  const m = wide ? MOVE[n] : { ...MOVE[n], dx: MOVE[n].dx * 0.5, baseX: 0 };
  const t = useTransform(progress, [m.start, m.end], [0, 1], { clamp: true });
  const transform = useTransform(t, v => {
    const e = 1 - Math.pow(1 - v, 3); // ease-out cubic: fast start, soft landing
    return `translate(${m.baseX + m.dx * (1 - e)}px, ${m.dy * (1 - e)}px) scale(${0.96 + 0.04 * e})`;
  });
  const opacity = useTransform(t, [0, 0.55], [0, 1]);
  const inner = (
    <>
      {s.href && <span className="proof-arrow"><ArrowUpRight /></span>}
      <span className="proof-num">{s.num}</span>
      <span className="proof-label">{s.label}</span>
    </>
  );
  return (
    <motion.div className={`proof-cell proof-cell--${n + 1}`} style={still ? (m.baseX ? { transform: `translateX(${m.baseX}px)` } : undefined) : { transform, opacity }}>
      {s.href ? (
        <a className={`proof-card proof-card--${s.size}`} href={s.href} {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {inner}
        </a>
      ) : (
        <div className={`proof-card proof-card--${s.size}`}>{inner}</div>
      )}
    </motion.div>
  );
}

const QUOTES = [
  {
    text: "The music was just perfect and the vibe was great. I love the uniqueness of keyboard and violin together with DJing — I don't think there are a lot of DJs who come with this built into the duo.",
    name: 'Sue Krebs',
    org: 'NautaDutilh New York P.C.',
    photo: '/nautadutilh-soul-shades-violin-nyc.jpg',
    photoAlt: 'Julie Schatz playing violin beside the keys at the NautaDutilh rooftop reception, 620 Loft & Garden, NYC',
    focus: '50% 78%',
  },
  {
    text: "Your performance set the tone for our event, and the addition of the violin amplified our guests' experience and made the evening memorable.",
    name: 'Anna Naraine',
    org: 'NautaDutilh New York P.C.',
    photo: '/nautadutilh-dj-dx-620-loft-garden-nyc.jpg',
    photoAlt: 'DJ DX at the NautaDutilh reception on the 620 Loft & Garden rooftop, NYC, with St. Patrick’s Cathedral behind',
    focus: '58% 62%',
  },
];

/* The light section: numbers in offset cards, then a client quote card with
   the event photo set into a curved corner. Layout after recognize.com. */
export default function Proof() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const q = QUOTES[i];
  const go = (d: number) => setI(v => (v + d + QUOTES.length) % QUOTES.length);
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: gridRef, offset: ['start 95%', 'start 35%'] });

  return (
    <section className="proof" aria-labelledby="proof-title">
      <div className="proof-inner">
        <div className="proof-numbers">
          <Reveal className="proof-head">
            <span className="proof-kicker">Track record</span>
            <h2 className="proof-title" id="proof-title">
              <span className="proof-wordmark" aria-label="Soul Shades">
                <span className="proof-wm-soul" aria-hidden="true">Soul</span>{' '}
                <span className="proof-wm-shades" aria-hidden="true">Shades</span>
              </span>{' '}
              <span className="proof-by">by the numbers</span>
            </h2>
          </Reveal>

          <div className="proof-grid" ref={gridRef}>
            {STATS.map((s, n) => (
              <StatCard key={s.num} s={s} n={n} progress={scrollYProgress} still={!!reduce} />
            ))}
          </div>
        </div>

        <Reveal className="quote-card" duration={0.9}>
          <div className="quote-body">
            <h2 className="quote-heading">What clients say</h2>
            <svg className="quote-mark" width="44" height="34" viewBox="0 0 44 34" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 3C9 6 3 13 3 22a8 8 0 1 0 8-8c-1 0-2 .2-3 .5C9 9 13 6 18 5M41 3c-9 3-15 10-15 19a8 8 0 1 0 8-8c-1 0-2 .2-3 .5C32 9 36 6 41 5" />
            </svg>
            <div className="quote-stage" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.figure
                  key={i}
                  className="quote-fig"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)', transform: 'translateY(8px)' }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)', transform: 'translateY(-6px)' }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <blockquote className="quote-text">{q.text}</blockquote>
                  <figcaption className="quote-cite">
                    <strong>{q.name}</strong>
                    <span>{q.org}</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
            <div className="quote-nav">
              <button type="button" className="quote-btn" onClick={() => go(-1)} aria-label="Previous testimonial"><LongArrow flip /></button>
              <button type="button" className="quote-btn" onClick={() => go(1)} aria-label="Next testimonial"><LongArrow /></button>
              <span className="quote-count" aria-hidden="true">{i + 1} / {QUOTES.length}</span>
            </div>
          </div>
          <figure className="quote-photo">
            {/* Each testimonial brings its own photo; they crossfade with the quote. */}
            <AnimatePresence initial={false}>
              <motion.img
                key={q.photo}
                {...responsive(q.photo, '(min-width: 901px) 460px, 100vw')}
                alt={q.photoAlt}
                width={1600}
                height={2133}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: q.focus }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.2 : 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </AnimatePresence>
            <figcaption>NautaDutilh reception · 620 Loft &amp; Garden</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
