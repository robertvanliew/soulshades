import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import CookieBanner from './components/CookieBanner';
import { CartProvider } from './components/CartContext';
import { PlayerProvider } from './components/PlayerContext';
import { initAnalytics, trackPageView } from './lib/analytics';
import './index.css';

// The home page ships in the main bundle; the rarely visited pages load on demand.
const Privacy = lazy(() => import('./pages/Legal').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Legal').then(m => ({ default: m.Terms })));
const NotFound = lazy(() => import('./pages/NotFound'));
const ThankYou = lazy(() => import('./pages/ThankYou'));

// index.html carries the home page's title, description and link-preview tags
// as plain HTML for services that don't run JavaScript (Facebook, iMessage,
// Slack). Once the app is running, each page supplies its own through
// <Helmet>, so the static copies are removed here; left in place they would
// double every tag and give /privacy and /terms a second, wrong canonical.
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
            <Suspense fallback={<div className="route-loading" role="status" aria-label="Loading page" />}>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <CookieBanner />
          </PlayerProvider>
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
