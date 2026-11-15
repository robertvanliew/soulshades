import { Route, Routes } from 'react-router-dom';
import App from './App';
import { Privacy, Terms } from './pages/Legal';
import NotFound from './pages/NotFound';
import ThankYou from './pages/ThankYou';
import { CorporatePage, DuoPage } from './pages/ServicePage';

/* Every page on the site, in one place. The browser entry (main.tsx) and the
   build-time prerenderer (entry-server.tsx) both render this, so a page can't
   exist for visitors but be missing from the HTML that search engines get. */
export const PRERENDER_PATHS = ['/', '/dj-violin-duo-nyc', '/corporate-event-entertainment-nyc', '/privacy', '/terms', '/thank-you'] as const;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dj-violin-duo-nyc" element={<DuoPage />} />
      <Route path="/corporate-event-entertainment-nyc" element={<CorporatePage />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
