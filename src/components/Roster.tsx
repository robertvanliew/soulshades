import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ROSTER } from '../data/roster';
import { useBookingDialog } from './BookingDialog';
import Reveal from './Reveal';
import { DjDxMark, JulieSchatzMark, SoulShadesMark } from './Wordmarks';

const MARK = { duo: SoulShadesMark, djdx: DjDxMark, julie: JulieSchatzMark } as const;

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
  </svg>
);
const ArrowUpRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" />
  </svg>
);

/* Soul Shades Music as label and booking home. One act at a time: tabs on
   the left, the act's services on the right as single clickable rows. Every
   row opens the same inquiry form with that service already chosen, so a
   lead never lands on the wrong site. */
export default function Roster() {
  const openBooking = useBookingDialog();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const act = ROSTER[active];
  const Mark = MARK[act.id];

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (from + d + ROSTER.length) % ROSTER.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="ss-section roster" id="services" aria-labelledby="roster-title">
      <div className="ss-section-label">Label &amp; Bookings</div>
      <h2 className="ss-section-title" id="roster-title">Book the <span>Roster</span></h2>
      <p className="ss-section-sub">
        Soul Shades Music is our label and booking home. Book the duo, or either of us on our own, for
        weddings, corporate events and private parties across New York, New Jersey and Connecticut.
      </p>

      <Reveal className="roster-wrap" duration={0.9}>
        <div className="roster-tabs" role="tablist" aria-label="Choose an act" aria-orientation="vertical">
          {ROSTER.map((a, n) => {
            const M = MARK[a.id];
            const on = n === active;
            return (
              <button
                key={a.id}
                ref={el => { tabs.current[n] = el; }}
                type="button"
                role="tab"
                id={`roster-tab-${a.id}`}
                aria-selected={on}
                aria-controls="roster-panel"
                tabIndex={on ? 0 : -1}
                className={`roster-tab${on ? ' is-active' : ''}`}
                onClick={() => setActive(n)}
                onKeyDown={e => onTabKey(e, n)}
              >
                <span className="rt-name"><M /></span>
                <span className="rt-meta">{a.services.length} {a.services.length === 1 ? 'format' : 'formats'}</span>
              </button>
            );
          })}
          <p className="roster-note">Every inquiry reaches both of us. We reply within 24–48 hours.</p>
        </div>

        <div className="roster-panel" role="tabpanel" id="roster-panel" aria-labelledby={`roster-tab-${act.id}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={act.id}
              className="rp-inner"
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(10px)' }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-6px)' }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="rp-photo">
                <img src={act.photo.src} alt={act.photo.alt} loading="lazy" decoding="async" style={{ objectPosition: act.photo.focus }} />
              </div>

              <div className="rp-body">
                <header className="rp-head">
                  <h3 className="rp-name"><Mark /></h3>
                  <p className="rp-tagline">{act.tagline}</p>
                </header>

                <ul className="rp-list">
                  {act.services.map(s => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className="rp-row"
                        aria-haspopup="dialog"
                        aria-label={`Book ${act.name}: ${s.title}${s.price ? `, ${s.price}` : ''}`}
                        onClick={e => { e.currentTarget.focus(); openBooking(s.id); }}
                      >
                        <span className="rp-row-text">
                          <span className="rp-row-title">{s.title}</span>
                          <span className="rp-row-blurb">{s.blurb}</span>
                        </span>
                        <span className="rp-row-side">
                          <span className="rp-row-price">{s.price ?? 'Quoted per event'}</span>
                          <span className="rp-row-arrow"><Arrow /></span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <footer className="rp-foot">
                  <button
                    type="button"
                    className="rp-cta"
                    aria-haspopup="dialog"
                    onClick={e => { e.currentTarget.focus(); openBooking(act.services[0].id); }}
                  >
                    Book {act.name}
                  </button>
                  {act.site && (
                    act.site.href.startsWith('/') ? (
                      <a className="rp-site" href={act.site.href}>See {act.site.label} <span aria-hidden="true">→</span></a>
                    ) : (
                      <a className="rp-site" href={act.site.href} target="_blank" rel="noopener">
                        Visit {act.site.label} <ArrowUpRight />
                      </a>
                    )
                  )}
                </footer>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}
