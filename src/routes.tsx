import { Route, Routes } from 'react-router-dom';
import App from './App';
import { Privacy, Terms } from './pages/Legal';
import NotFound from './pages/NotFound';
import ThankYou from './pages/ThankYou';
import { CorporatePage, DuoPage, WeddingPage } from './pages/ServicePage';
import { ContentsquarePage, NautaDutilhPage } from './pages/CaseStudy';
import GetUpPage from './pages/GetUp';
import EpkPage from './pages/Epk';

/* Every page on the site, in one place. The browser entry (main.tsx) and the
   build-time prerenderer (entry-server.tsx) both render this, so a page can't
   exist for visitors but be missing from the HTML that search engines get. */
export const PRERENDER_PATHS = ['/', '/dj-violin-duo-nyc', '/wedding-dj-violin-duo-nyc', '/corporate-event-entertainment-nyc', '/epk', '/events/contentsquare-cx-circle-nyc', '/events/nautadutilh-620-loft-garden', '/get-up', '/privacy', '/terms', '/thank-you'] as const;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dj-violin-duo-nyc" element={<DuoPage />} />
      <Route path="/wedding-dj-violin-duo-nyc" element={<WeddingPage />} />
      <Route path="/corporate-event-entertainment-nyc" element={<CorporatePage />} />
      <Route path="/epk" element={<EpkPage />} />
      <Route path="/events/contentsquare-cx-circle-nyc" element={<ContentsquarePage />} />
      <Route path="/events/nautadutilh-620-loft-garden" element={<NautaDutilhPage />} />
      <Route path="/get-up" element={<GetUpPage />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
