import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes, { PRERENDER_PATHS } from './routes';
import { CartProvider } from './components/CartContext';
import { PlayerProvider } from './components/PlayerContext';

/* Build-time rendering (scripts/prerender.mjs). Produces the same markup the
   browser would, as a string, so the HTML file for each page already contains
   its text, headings and links. Crawlers that don't run JavaScript — most AI
   search bots and every link-preview service — read that directly. */
export { PRERENDER_PATHS };

export function render(path: string): string {
  return renderToString(
    <HelmetProvider>
      <StaticRouter location={path}>
        <CartProvider>
          <PlayerProvider>
            <AppRoutes />
          </PlayerProvider>
        </CartProvider>
      </StaticRouter>
    </HelmetProvider>,
  );
}
