/* Analytics and ad pixels, loaded only after the visitor says yes.

   Each platform switches on by itself when its ID is set in the environment
   (Vercel → Settings → Environment Variables); with none set, nothing loads,
   no cookie is written and the cookie banner never appears.

     VITE_GA_ID            Google Analytics 4      e.g. G-XXXXXXXXXX
     VITE_GOOGLE_ADS_ID    Google Ads              e.g. AW-XXXXXXXXXX
     VITE_META_PIXEL_ID    Meta (Facebook/Instagram) pixel
     VITE_TIKTOK_PIXEL_ID  TikTok pixel

   Consent is stored in this browser only. A browser sending the Global
   Privacy Control signal is treated as "declined" without being asked. */

const GA_ID: string | undefined = import.meta.env.VITE_GA_ID || undefined;
const ADS_ID: string | undefined = import.meta.env.VITE_GOOGLE_ADS_ID || undefined;
const META_ID: string | undefined = import.meta.env.VITE_META_PIXEL_ID || undefined;
const TIKTOK_ID: string | undefined = import.meta.env.VITE_TIKTOK_PIXEL_ID || undefined;

/** True when at least one tracking ID is configured. */
export const TRACKING_CONFIGURED = Boolean(GA_ID || ADS_ID || META_ID || TIKTOK_ID);

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
type Ttq = unknown[] & {
  methods: string[];
  setAndDefer: (t: unknown, e: string) => void;
  load: (id: string) => void;
  page: () => void;
  track: (event: string, params?: Record<string, unknown>, options?: Record<string, unknown>) => void;
  _i?: Record<string, unknown[]>;
  _t?: Record<string, number>;
  _o?: Record<string, unknown>;
};
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
    ttq?: Ttq;
  }
  interface Navigator { globalPrivacyControl?: boolean }
}

// ── Consent ──────────────────────────────────────────────────────────────────
export type Consent = 'granted' | 'denied';
const KEY = 'ss-cookie-consent';
export const CONSENT_EVENT = 'ss:consent-change';
export const OPEN_SETTINGS_EVENT = 'ss:cookie-settings';

const gpc = () => typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;

/** The visitor's recorded choice, or null if they haven't been asked yet. */
export function getConsent(): Consent | null {
  if (gpc()) return 'denied';
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { choice?: Consent };
    return v.choice === 'granted' || v.choice === 'denied' ? v.choice : null;
  } catch {
    return null;
  }
}

export function setConsent(choice: Consent) {
  try { localStorage.setItem(KEY, JSON.stringify({ choice, at: new Date().toISOString() })); } catch { /* private mode: ask again next visit */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
  if (choice === 'granted') loadTracking();
  else disableTracking();
}

/** Reopens the cookie banner (footer "Cookie settings"). */
export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));

// ── Loaders ──────────────────────────────────────────────────────────────────
let loaded = false;

function script(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadGoogle() {
  const id = GA_ID || ADS_ID;
  if (!id) return;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the `arguments` object itself, not an array copy.
  window.gtag = function gtag() { window.dataLayer!.push(arguments); } as Window['gtag']; // eslint-disable-line prefer-rest-params
  window.gtag!('js', new Date());
  // send_page_view off: trackPageView() is the single source, so the first
  // view and later route changes are counted the same way.
  if (GA_ID) window.gtag!('config', GA_ID, { send_page_view: false });
  if (ADS_ID) window.gtag!('config', ADS_ID, { send_page_view: false });
  script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
}

function loadMeta() {
  if (!META_ID || window.fbq) return;
  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;
  script('https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', META_ID);
}

function loadTikTok() {
  if (!TIKTOK_ID || window.ttq) return;
  // Mirrors TikTok's base snippet: ttq is a real array used as the queue.
  const ttq = [] as unknown as Ttq;
  ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
  ttq.setAndDefer = (t, e) => { (t as Record<string, unknown>)[e] = (...args: unknown[]) => { (t as unknown[]).push([e, ...args]); }; };
  ttq.methods.forEach(m => ttq.setAndDefer(ttq, m));
  ttq.load = (id: string) => {
    ttq._i = ttq._i || {}; ttq._i[id] = [];
    ttq._t = ttq._t || {}; ttq._t[id] = Date.now();
    ttq._o = ttq._o || {};
    script(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`);
  };
  window.ttq = ttq;
  ttq.load(TIKTOK_ID);
}

function loadTracking() {
  if (loaded || !TRACKING_CONFIGURED || typeof window === 'undefined') return;
  loaded = true;
  // Off the critical path: the pixels are heavy and must never compete with
  // the page or with the tap that accepted them.
  const idle = (fn: () => void) => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 3000 }); else setTimeout(fn, 300);
  };
  idle(() => {
    loadGoogle();
    loadMeta();
    loadTikTok();
    trackPageView();
  });
}

function disableTracking() {
  // Stops Google from sending further hits in this tab; the other pixels
  // stop with the next page load because they are never loaded again.
  const w = window as unknown as Record<string, unknown>;
  if (GA_ID) w[`ga-disable-${GA_ID}`] = true;
}

/** Call once at startup: loads tracking if this visitor already said yes. */
export function initAnalytics() {
  if (TRACKING_CONFIGURED && getConsent() === 'granted') loadTracking();
}

// ── Events ───────────────────────────────────────────────────────────────────
export function trackPageView(path = window.location.pathname + window.location.search) {
  window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
  window.fbq?.('track', 'PageView');
  window.ttq?.page();
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.('event', name, { page_path: window.location.pathname, ...params });
}

/** A booking inquiry was sent: the conversion every platform optimises for. */
export function trackLead(params: Record<string, unknown> = {}) {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  trackEvent('generate_lead', { ...params, event_id: id });
  window.fbq?.('track', 'Lead', params, { eventID: id });
  window.ttq?.track('SubmitForm', params, { event_id: id });
}
