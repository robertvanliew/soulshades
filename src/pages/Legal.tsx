import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import PageShell from '../components/PageShell';

/* Privacy Policy and Terms. Written to describe what this site actually
   does — the booking form, the music store, the embeds, optional analytics —
   rather than a generic template. The operator name and governing law below
   were confirmed by the owners on 2026-11-13; change them here and both pages
   update. The pages have not had a lawyer's review. */
const OPERATOR = 'Soul Shades Music';
const GOVERNING_LAW = 'the State of New York';
const CONTACT = 'hello@soulshadesmusic.com';
const UPDATED = 'November 13, 2026';
const SITE = 'https://soulshadesmusic.com';

const Mail = () => <a href={`mailto:${CONTACT}`}>{CONTACT}</a>;
const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);

type Section = { id: string; title: string; body: ReactNode };

function LegalPage({ path, title, description, intro, sections }: { path: string; title: string; description: string; intro: ReactNode; sections: Section[] }) {
  return (
    <PageShell>
      <Helmet>
        <title>{`${title} | Soul Shades`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE}${path}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Soul Shades" />
        <meta property="og:image" content={`${SITE}/og-image.jpg`} />
        <meta property="og:title" content={`${title} | Soul Shades`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE}${path}`} />
        <meta name="twitter:title" content={`${title} | Soul Shades`} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      <article className="legal">
        <header className="legal-head">
          <p className="ss-section-label">Legal</p>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-updated">Last updated {UPDATED}</p>
          <div className="legal-intro">{intro}</div>
        </header>

        <div className="legal-layout">
          <nav className="legal-toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              {sections.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
            </ol>
          </nav>
          <div className="legal-body">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </article>
    </PageShell>
  );
}

// ── Privacy ──────────────────────────────────────────────────────────────────
const PRIVACY: Section[] = [
  {
    id: 'collect',
    title: 'What we collect',
    body: (
      <>
        <p><strong>When you send a booking inquiry</strong>, we collect what you type into the form: your name, email, phone number, the event type, date, times and location, the act or service you’re interested in, and your message.</p>
        <p><strong>When you buy music</strong>, we collect your email address (to deliver your download) and your name if you give it. Card details go straight to Stripe; we never see or store them.</p>
        <p><strong>When you browse</strong>, our hosting provider records standard technical data such as IP address, browser type and the pages requested. If you accept cookies, analytics tools also record how you use the site (see <a href="#cookies">Cookies and analytics</a>).</p>
        <p>We don’t ask for, and don’t want, sensitive personal information. Please don’t include it in your message.</p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use it',
    body: (
      <>
        <ul>
          <li>To reply to your inquiry, check our availability and prepare a quote.</li>
          <li>To send you a confirmation that we received your inquiry.</li>
          <li>To process your purchase and email your download link.</li>
          <li>To keep the site secure and stop spam and abuse.</li>
          <li>To understand which pages are useful, if you’ve accepted analytics cookies.</li>
        </ul>
        <p>We don’t sell or rent your personal information, and sending an inquiry does not add you to a mailing list.</p>
      </>
    ),
  },
  {
    id: 'services',
    title: 'Services that process data for us',
    body: (
      <>
        <p>We use a small number of providers to run the site. Each receives only what it needs to do its job:</p>
        <ul>
          <li><strong>Vercel</strong>: website hosting.</li>
          <li><strong>Resend</strong>: sends booking notifications, inquiry confirmations and purchase emails.</li>
          <li><strong>Formspree</strong>: a backup route for booking inquiries if our own system is unavailable.</li>
          <li><strong>ImprovMX and Google (Gmail)</strong>: receive and store email sent to our addresses.</li>
          <li><strong>Stripe</strong>: payment processing for the music store. See <Ext href="https://stripe.com/privacy">Stripe’s Privacy Policy</Ext>.</li>
          <li><strong>Cloudflare</strong>: stores purchased audio files and delivers time-limited download links. Where enabled, Cloudflare Turnstile checks that form submissions come from a person rather than a bot.</li>
          <li><strong>Google Fonts</strong>: serves the site’s typefaces; your browser requests them from Google.</li>
        </ul>
        <p>Videos on the site are embedded from <strong>YouTube</strong> and <strong>TikTok</strong>, and merchandise is sold by our partner <strong>Spring (Creator-Spring)</strong> on its own site. When you play an embedded video or follow a link to another service, that service’s own privacy policy applies.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and analytics',
    body: (
      <>
        <p>The site works without cookies of our own. Your browser’s local storage is used for two practical things: remembering your cookie choice, and stopping the same inquiry from being sent twice.</p>
        <p>With your permission, we may use <strong>Google Analytics</strong> and advertising tools from <strong>Google, Meta and TikTok</strong> to measure visits and the performance of our ads. These tools set cookies and may combine your visit with other information they hold. They load only after you choose “Accept” on the cookie notice. If you decline, they are not loaded at all.</p>
        <p>You can change your mind at any time using “Cookie settings” at the bottom of any page. We also honor the Global Privacy Control signal: if your browser sends it, analytics and advertising tools stay off without your having to ask.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <>
        <p>We keep booking inquiries and the emails that follow for as long as needed to plan and deliver your event, and afterwards as ordinary business records. We keep purchase records for as long as needed to support your purchase and to meet tax and accounting obligations.</p>
        <p>You can ask us to delete your information at any time (see below), and we will unless we’re required to keep it.</p>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your choices and rights',
    body: (
      <>
        <p>Depending on where you live, you may have the right to access the personal information we hold about you, correct it, delete it, or object to how it’s used, and to complain to your local data protection authority.</p>
        <p>To make a request, email <Mail />. We’ll respond within 30 days and won’t treat you differently for asking.</p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <p>The site is served over HTTPS. Payments are handled entirely by Stripe, download links are time-limited, and our forms are protected against automated abuse. No system is perfectly secure, but we take reasonable care with the information you give us.</p>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>This site is intended for adults planning events and for music fans. It is not directed to children under 13, and we don’t knowingly collect their personal information. If you believe a child has sent us personal information, contact us and we’ll delete it.</p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <>
        <p>If we change this policy, we’ll post the new version here and update the date at the top.</p>
        <p>Questions or requests: <Mail />.</p>
      </>
    ),
  },
];

export function Privacy() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy Policy"
      description="How Soul Shades Music collects, uses and protects your information when you send a booking inquiry, buy music or browse soulshadesmusic.com."
      intro={<p>{OPERATOR} (“Soul Shades,” “we,” “us”) runs soulshadesmusic.com. This policy explains what we collect when you use the site, why, and the choices you have. In short: we use your details to answer you and deliver what you asked for, and nothing else.</p>}
      sections={PRIVACY}
    />
  );
}

// ── Terms ────────────────────────────────────────────────────────────────────
const TERMS: Section[] = [
  {
    id: 'agreement',
    title: 'Using this site',
    body: (
      <p>These terms apply to soulshadesmusic.com, operated by {OPERATOR} (“Soul Shades,” “we,” “us”). By using the site, sending an inquiry or making a purchase, you agree to them. If you don’t agree, please don’t use the site.</p>
    ),
  },
  {
    id: 'bookings',
    title: 'Booking inquiries',
    body: (
      <>
        <p>Sending a booking inquiry is a request for information. It does not reserve a date or create a contract. A booking is confirmed only when both sides have signed a written performance agreement, which sets out the fee, the schedule and the other terms for that event.</p>
        <p>Prices shown on the site are starting rates and can change. Your quote depends on the date, hours, location and production needs.</p>
        <p>Soul Shades Music also takes inquiries for DJ DX and Julie Schatz as solo artists. Their own websites, djdxmusic.com and julieschatzmusic.com, have their own terms.</p>
      </>
    ),
  },
  {
    id: 'store',
    title: 'Music store',
    body: (
      <>
        <p>Music sold on this site is delivered as digital audio files. After payment, a secure, time-limited download link is emailed to the address you provide.</p>
        <p><strong>Price.</strong> The store is pay-what-you-want, with a minimum of $3.00 USD per track and a maximum of $500 per order. Payments are processed by Stripe; we never see or store your card details.</p>
        <p><strong>License.</strong> You are buying a personal, non-exclusive, non-transferable license to listen to the files. You may not resell, redistribute or sublicense them, share download links, use the files commercially without a separate written license, or claim them as your own work.</p>
        <p><strong>Refunds.</strong> Because digital files can’t be returned, all sales are final once the download link has been delivered. If a file is corrupted or your link never arrives, email <Mail /> and we’ll make it right.</p>
      </>
    ),
  },
  {
    id: 'merch',
    title: 'Merchandise',
    body: (
      <p>Soul Shades merchandise is printed, sold and shipped by our partner Spring (Creator-Spring) on its own website. Orders, payment, shipping and returns for merchandise are handled by Spring under its terms and policies.</p>
    ),
  },
  {
    id: 'ip',
    title: 'Content and intellectual property',
    body: (
      <>
        <p>The music, recordings, photographs, video, artwork, logos and text on this site belong to Soul Shades Music or to their respective rights holders. Blends and remixes may include elements of third-party recordings, which remain the property of their owners. Buying a file does not transfer any ownership rights to you.</p>
        <p>Please don’t copy or reuse site content without asking us first.</p>
      </>
    ),
  },
  {
    id: 'conduct',
    title: 'Acceptable use',
    body: (
      <p>Please use the site as intended. Don’t send spam or unlawful content through the forms, try to disrupt the site or get around its security, or use automated tools to submit inquiries or scrape the store.</p>
    ),
  },
  {
    id: 'links',
    title: 'Other websites',
    body: (
      <p>The site links to and embeds content from services we don’t control, including streaming platforms, YouTube, TikTok and Spring. We aren’t responsible for their content or practices.</p>
    ),
  },
  {
    id: 'warranty',
    title: 'Disclaimers and liability',
    body: (
      <>
        <p>The site and its digital products are provided “as is,” without warranties of any kind, to the fullest extent the law allows. We don’t guarantee that the site will always be available or error-free.</p>
        <p>To the fullest extent the law allows, Soul Shades Music is not liable for indirect, incidental or consequential damages arising from your use of the site, and our total liability for any claim relating to a purchase on the site is limited to the amount you paid for that purchase. Liability for a live performance is governed by the performance agreement for that event.</p>
      </>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    body: (
      <p>These terms are governed by the laws of {GOVERNING_LAW}, without regard to its conflict-of-law rules.</p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <>
        <p>We may update these terms from time to time. The new version will be posted here with a new date, and applies from then on.</p>
        <p>Questions: <Mail />.</p>
      </>
    ),
  },
];

export function Terms() {
  return (
    <LegalPage
      path="/terms"
      title="Terms of Service"
      description="The terms for using soulshadesmusic.com: booking inquiries, the pay-what-you-want music store, merchandise and site content."
      intro={<p>Plain-language terms for using this site, sending us a booking inquiry and buying music. See also our <a href="/privacy">Privacy Policy</a>.</p>}
      sections={TERMS}
    />
  );
}
