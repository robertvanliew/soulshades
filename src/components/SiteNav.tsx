import { useState, useEffect, useRef, useCallback } from 'react';

const EXIT_MS = 260;

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Play the exit animation before unmounting — vanishing instantly reads as broken.
  const close = useCallback(() => {
    setOpen(current => {
      if (!current) return current;
      setClosing(true);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      exitTimer.current = setTimeout(() => setClosing(false), EXIT_MS);
      return false;
    });
  }, []);

  useEffect(() => () => { if (exitTimer.current) clearTimeout(exitTimer.current); }, []);

  // Lock the page behind the drawer, and preserve scroll position on close.
  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    const { body } = document;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, y);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      <nav className="nav">
        <a
          href="#"
          className="nav-logo"
          aria-label="Soul Shades — back to top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); close(); }}
        >
          <span className="nav-logo-soul" aria-hidden="true">Soul</span>
          <span className="nav-logo-shades" aria-hidden="true">Shades</span>
        </a>

        {/* Desktop links */}
        <ul className="nav-links">
          <li className="nav-link--anchor"><a href="#about">About</a></li>
          <li className="nav-link--anchor"><a href="#services">Services</a></li>
          <li className="nav-link--anchor"><a href="#catalog">Music</a></li>
          <li className="nav-link--anchor"><a href="#merch">Merch</a></li>
          <li className="nav-link--anchor"><a href="#viral">Viral</a></li>
          <li className="nav-stream-group">
            <a href="https://open.spotify.com/artist/2GES5fSFNcx25lv9RFcQjP?autoplay=true" target="_blank" rel="noopener noreferrer" className="nav-stream-btn" aria-label="Listen on Spotify">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.318a.75.75 0 0 1-1.032.25c-2.827-1.727-6.39-2.117-10.585-1.16a.75.75 0 0 1-.334-1.463c4.592-1.048 8.533-.597 11.701 1.341a.75.75 0 0 1 .25 1.032zm1.472-3.27a.937.937 0 0 1-1.288.308c-3.232-1.987-8.158-2.563-11.984-1.402a.937.937 0 1 1-.543-1.794c4.37-1.323 9.8-.682 13.507 1.6a.937.937 0 0 1 .308 1.288zm.127-3.408C15.37 8.39 9.386 8.2 5.896 9.26a1.124 1.124 0 1 1-.651-2.151c4.07-1.233 10.83-1.003 15.102 1.585a1.124 1.124 0 0 1-1.232 1.936z" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@soulshadesmusic" target="_blank" rel="noopener noreferrer" className="nav-stream-btn" aria-label="Watch on YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@soulshadesmusic" target="_blank" rel="noopener noreferrer" className="nav-stream-btn" aria-label="Follow on TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
          </li>
          <li><a href="#ss-booking" className="nav-book">Book Now</a></li>
        </ul>

        {/* Hamburger — mobile only */}
        <button
          className="nav-hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span className={`nav-ham-line${open ? ' nav-ham-line--open' : ''}`} />
          <span className={`nav-ham-line${open ? ' nav-ham-line--open' : ''}`} />
          <span className={`nav-ham-line${open ? ' nav-ham-line--open' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {(open || closing) && (
        <div
          className={`nav-drawer${closing ? ' nav-drawer--closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="nav-drawer-backdrop" onClick={close} />
          <div className="nav-drawer-panel">
            <button className="nav-drawer-close" onClick={close} aria-label="Close menu">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="4" y1="4" x2="20" y2="20"/>
                <line x1="20" y1="4" x2="4" y2="20"/>
              </svg>
            </button>
            <ul className="nav-drawer-links">
              <li><a href="#about" onClick={close}>About</a></li>
              <li><a href="#services" onClick={close}>Book the Roster</a></li>
              <li><a href="#catalog" onClick={close}>Music Store</a></li>
              <li><a href="#merch" onClick={close}>Merch</a></li>
              <li><a href="#viral" onClick={close}>Viral Moments</a></li>
              <li><a href="#ss-booking" onClick={close} className="nav-drawer-book">Book Now</a></li>
            </ul>
            <div className="nav-drawer-streams">
              <a href="https://open.spotify.com/artist/2GES5fSFNcx25lv9RFcQjP" target="_blank" rel="noopener noreferrer" aria-label="Spotify">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.318a.75.75 0 0 1-1.032.25c-2.827-1.727-6.39-2.117-10.585-1.16a.75.75 0 0 1-.334-1.463c4.592-1.048 8.533-.597 11.701 1.341a.75.75 0 0 1 .25 1.032zm1.472-3.27a.937.937 0 0 1-1.288.308c-3.232-1.987-8.158-2.563-11.984-1.402a.937.937 0 1 1-.543-1.794c4.37-1.323 9.8-.682 13.507 1.6a.937.937 0 0 1 .308 1.288zm.127-3.408C15.37 8.39 9.386 8.2 5.896 9.26a1.124 1.124 0 1 1-.651-2.151c4.07-1.233 10.83-1.003 15.102 1.585a1.124 1.124 0 0 1-1.232 1.936z"/></svg>
              </a>
              <a href="https://www.youtube.com/@soulshadesmusic" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@soulshadesmusic" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
