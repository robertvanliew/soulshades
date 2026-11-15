import { Helmet } from 'react-helmet-async';
import PageShell from '../components/PageShell';

/* Shown for any address that isn't a page. Says what happened in plain words
   and offers the three places a visitor most likely wanted. */
export default function NotFound() {
  return (
    <PageShell>
      <Helmet>
        <title>Page not found | Soul Shades</title>
        <meta name="description" content="This page doesn’t exist or has moved. Find Soul Shades formats and pricing, book the NYC DJ + live violin duo, or head back home." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="notfound">
        <p className="ss-section-label">Error 404</p>
        <h1 className="notfound-title" id="nf-title">This page missed its cue.</h1>
        <p className="notfound-text">
          The page you’re looking for doesn’t exist or has moved. Here’s where most people are headed:
        </p>
        <div className="notfound-actions">
          <a href="/" className="ss-hero-btn">Back to the home page</a>
          <a href="/#services" className="ss-hero-btn ss-hero-btn--ghost">Formats &amp; pricing</a>
          <a href="/#ss-booking" className="ss-hero-btn ss-hero-btn--ghost">Book Soul Shades</a>
        </div>
      </div>
    </PageShell>
  );
}
