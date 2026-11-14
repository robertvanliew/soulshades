import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CONSENT_EVENT, OPEN_SETTINGS_EVENT, TRACKING_CONFIGURED, getConsent, setConsent } from '../lib/analytics';

/* Shown only when analytics or ad pixels are configured and this visitor
   hasn't chosen yet. Nothing is loaded until they accept. "Decline" carries
   the same weight as "Accept" — no dark patterns — and the choice can be
   changed any time from "Cookie settings" in the footer. It is a corner card,
   not a wall: the page stays fully usable behind it. */
export default function CookieBanner() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const accept = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!TRACKING_CONFIGURED) return;
    // Let the page paint first; a banner in the first frame hurts both the
    // first impression and the layout metrics.
    const t = setTimeout(() => { if (getConsent() === null) setOpen(true); }, 1200);
    const reopen = () => { setOpen(true); requestAnimationFrame(() => accept.current?.focus()); };
    const changed = () => setOpen(false);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    window.addEventListener(CONSENT_EVENT, changed);
    return () => { clearTimeout(t); window.removeEventListener(OPEN_SETTINGS_EVENT, reopen); window.removeEventListener(CONSENT_EVENT, changed); };
  }, []);

  if (!TRACKING_CONFIGURED) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cookie"
          role="region"
          aria-label="Cookie choices"
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px)' }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(10px)' }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        >
          <h2 className="cookie-title">Your privacy</h2>
          <p className="cookie-text">
            We’d like to use cookies to see how the site is used and to measure our ads. The site works
            the same either way. <a href="/privacy#cookies">Privacy Policy</a>
          </p>
          <div className="cookie-actions">
            <button type="button" className="cookie-btn" onClick={() => setConsent('denied')}>Decline</button>
            <button type="button" className="cookie-btn cookie-btn--primary" ref={accept} onClick={() => setConsent('granted')}>Accept</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
