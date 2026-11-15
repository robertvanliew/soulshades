import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes';
import CookieBanner from './components/CookieBanner';
import { CartProvider } from './components/CartContext';
import { PlayerProvider } from './components/PlayerContext';
import { initAnalytics, trackPageView } from './lib/analytics';
import './index.css';

// Every page is saved as real HTML at build time (scripts/prerender.mjs) for
// crawlers and link previews that don't run JavaScript. Once the app is
// running it draws the page itself (createRoot replaces the saved markup) and
// each page supplies its own title and tags through <Helmet>, so the saved
// copies of those tags are removed first; left in place they would double.
document.head.querySelectorAll('[data-rh="true"]').forEach(el => el.remove());

initAnalytics();

/** Counts a page view when the address changes (the first view is counted when tracking loads). */
function PageViews() {
  const { pathname } = useLocation();
  useEffect(() => { trackPageView(); }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <CartProvider>
          <PlayerProvider>
            <PageViews />
            <AppRoutes />
            <CookieBanner />
          </PlayerProvider>
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
