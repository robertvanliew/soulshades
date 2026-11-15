import { Helmet } from 'react-helmet-async';
import PageShell from '../components/PageShell';

/* Where Stripe sends buyers after paying. The download links arrive by email
   (api/webhook.ts) within a minute or two; this page says so, and what to do
   if they don't. Nothing personal is passed in the address. */
export default function ThankYou() {
  return (
    <PageShell>
      <Helmet>
        <title>Thank you for your order | Soul Shades</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="notfound">
        <p className="ss-section-label">Order complete</p>
        <h1 className="notfound-title">Thank you. Your music is on its way.</h1>
        <p className="notfound-text">
          We’re emailing your download links now, to the address you used at checkout. They usually
          arrive within a couple of minutes and work for two hours, so download your tracks soon after
          they land.
        </p>
        <p className="notfound-text" style={{ marginTop: 14 }}>
          Nothing after ten minutes? Check your spam folder, then email{' '}
          <a href="mailto:bookings@soulshadesmusic.com" style={{ color: 'var(--gold2)' }}>bookings@soulshadesmusic.com</a>{' '}
          and we’ll send fresh links.
        </p>
        <div className="notfound-actions">
          <a href="/#catalog" className="ss-hero-btn">Back to the music</a>
          <a href="/" className="ss-hero-btn ss-hero-btn--ghost">Home</a>
        </div>
      </div>
    </PageShell>
  );
}
