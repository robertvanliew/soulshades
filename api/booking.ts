import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// NOTE: everything this function needs is inlined below (no local relative
// imports). Vercel's builder does not bundle cross-file imports under api/ —
// keep this file fully self-contained.

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'Soul Shades <noreply@soulshadesmusic.com>';
const BOOKINGS = process.env.REPLY_TO_EMAIL || 'bookings@soulshadesmusic.com';
const SITE = 'https://soulshadesmusic.com';
// Rendered from the site's Bebas Neue wordmark (public/email/). Email apps
// can't load web fonts, so the logo travels as an image with a text fallback.
export const LOGO_ON_DARK = `${SITE}/email/soul-shades-logo-light.png`;

// Brand palette (matches src/index.css).
const C = {
  ink: '#0F0B07',     // page black
  ink2: '#1A140E',
  tan: '#C6A07A',     // --gold
  tanLight: '#E2C8AA',
  brown: '#8A6240',
  cream: '#F3ECE3',
  paper: '#FFFFFF',
  line: '#E9E0D5',
  text: '#2B231C',
  muted: '#7D6E60',
};
const SERIF = `Georgia, 'Times New Roman', Times, serif`;
const SANS = `'Helvetica Neue', Helvetica, Arial, sans-serif`;

// ── Spam & abuse guards ──────────────────────────────────────────────────────
// Mirrors src/lib/inquiryRules.ts (keep the two in step). The form shows these
// as friendly field messages; here they stop anything that skips the form.
const MIN_FILL_MS = 2500;
const URL_RE = /(https?:\/\/|www\.)\S+/gi;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const LIMITS = { name: [2, 120], email: 254, phone: [10, 15, 30], location: [3, 200], message: [20, 2000, 1], yearsAhead: 3 } as const;

// High-confidence junk only: real clients never write these. Matches are
// accepted silently (fake success) so spammers learn nothing.
const SPAM_PHRASES = /\b(seo (services|agency|expert)|backlinks?|guest post|link building|rank (your|on) google|crypto|bitcoin|forex|casino|viagra|cialis|loan offer|web ?design (services|agency)|increase (your )?traffic|dear (sir|madam)|whatsapp me)\b/i;

/** Rejects dates like 2027-02-31 that JavaScript would silently roll over. */
const isRealDate = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso; };
const linkCount = (s: string) => (s.match(URL_RE) || []).length;
const nyToday = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'eventType' | 'eventDate' | 'eventStartTime' | 'eventEndTime' | 'location' | 'message', string>>;

export function validate(b: Record<string, unknown>, now = new Date()): FieldErrors {
  const e: FieldErrors = {};
  const str = (k: string) => (typeof b[k] === 'string' ? (b[k] as string).trim() : '');
  const name = str('name'), email = str('email'), phone = str('phone'), eventType = str('eventType');
  const date = str('eventDate'), start = str('eventStartTime'), end = str('eventEndTime');
  const location = str('location'), message = str('message');

  if (name.length < LIMITS.name[0] || name.length > LIMITS.name[1] || (name.match(/\p{L}/gu) || []).length < 2 || linkCount(name) || /\d{3,}/.test(name)) e.name = 'Please enter your full name.';
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email)) e.email = 'That email doesn’t look quite right. Please check it.';
  const digits = phone.replace(/\D/g, '').length;
  if (!phone || phone.length > LIMITS.phone[2] || !/^[\d\s()+.\-x]+$/i.test(phone) || digits < LIMITS.phone[0] || digits > LIMITS.phone[1]) e.phone = 'Please enter a phone number with the area code.';
  if (!EVENT_TYPES.includes(eventType)) e.eventType = 'Please choose the type of event.';
  const today = nyToday(now);
  const [ty, tm, td] = today.split('-');
  const latest = `${Number(ty) + LIMITS.yearsAhead}-${tm}-${td}`;
  if (!DATE_RE.test(date) || !isRealDate(date)) e.eventDate = 'Please choose a valid date.';
  else if (date < today) e.eventDate = 'That date has already passed. Please choose an upcoming date.';
  else if (date > latest) e.eventDate = `We book up to ${LIMITS.yearsAhead} years ahead. Please choose an earlier date.`;
  if (!TIME_RE.test(start)) e.eventStartTime = 'Please add a start time.';
  if (!TIME_RE.test(end)) e.eventEndTime = 'Please add an end time.';
  else if (end === start) e.eventEndTime = 'The end time should be after the start time.';
  if (location.length < LIMITS.location[0] || location.length > LIMITS.location[1] || linkCount(location)) e.location = 'Please tell us the venue or city.';
  if (message.length < LIMITS.message[0] || message.length > LIMITS.message[1]) e.message = 'Please tell us a little more about your event.';
  else if (linkCount(message) > LIMITS.message[2]) e.message = 'To keep our inbox spam-free, please include no more than one link.';
  return e;
}

/** Only our own pages may post here (stops other sites submitting to it). */
export function allowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // some browsers omit Origin on same-origin requests
  try {
    const host = new URL(origin).hostname;
    if (host === 'soulshadesmusic.com' || host === 'www.soulshadesmusic.com' || host === 'localhost' || host === '127.0.0.1') return true;
    // Vercel preview deployments of this project.
    return host.endsWith('.vercel.app') && (host === process.env.VERCEL_URL || host.includes('soulshades'));
  } catch { return false; }
}

/* Best-effort rate limit: 3 inquiries per connection per 10 minutes. Memory
   is per server instance, so it slows floods rather than guaranteeing a cap;
   Turnstile is the real gate. */
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, now = Date.now()): boolean {
  const windowMs = 10 * 60_000, max = 3;
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}

/** Cloudflare Turnstile check. Skipped until TURNSTILE_SECRET_KEY is set. */
async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = await r.json() as { success?: boolean; action?: string };
    return data.success === true && (!data.action || data.action === 'booking');
  } catch {
    return false;
  }
}

export { SPAM_PHRASES };

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ── What can be booked ───────────────────────────────────────────────────────
// The confirmation goes to an address typed into a public form, so it only
// ever contains text from these fixed lists (plus a cleaned-up first name).
// Nothing free-form from the visitor is echoed back to them, which keeps the
// form useless as a spam relay. Keep in sync with src/data/roster.ts.
const SERVICES: Record<string, { act: string; title: string }> = {
  'duo-dj-violin': { act: 'Soul Shades', title: 'DJ + Live Violin' },
  'duo-violin-piano': { act: 'Soul Shades', title: 'Violin + Piano Duo' },
  'duo-dj-piano': { act: 'Soul Shades', title: 'DJ + Live Piano' },
  'djdx-corporate': { act: 'DJ DX', title: 'Corporate Events & Holiday Parties' },
  'djdx-wedding': { act: 'DJ DX', title: 'Weddings' },
  'djdx-private': { act: 'DJ DX', title: 'Private Parties & Birthdays' },
  'djdx-sweet16': { act: 'DJ DX', title: 'Sweet 16s, Quinceañeras & Mitzvahs' },
  'julie-ceremony': { act: 'Julie Schatz', title: 'Wedding Ceremony Violin' },
  'julie-piano': { act: 'Julie Schatz', title: 'Jazz Piano & Cocktail Hour' },
  'julie-violin-dj': { act: 'Julie Schatz', title: 'Hip-Hop & House Violin over a DJ' },
  'julie-corporate': { act: 'Julie Schatz', title: 'Corporate Events' },
};
const EVENT_TYPES = ['Wedding', 'Corporate Event', 'Private Party', 'Club / Venue Night', 'Birthday / Celebration', 'Sweet 16 / Quinceañera / Mitzvah', 'Other'];

export type Kind = 'wedding' | 'corporate' | 'venue' | 'party' | 'general';

export function kindOf(serviceId: string, eventType: string): Kind {
  if (eventType === 'Wedding' || /wedding|ceremony/.test(serviceId)) return 'wedding';
  if (eventType === 'Corporate Event' || /corporate/.test(serviceId)) return 'corporate';
  if (eventType === 'Club / Venue Night') return 'venue';
  if (eventType !== 'Other' && eventType !== '') return 'party';
  return 'general';
}

// What happens next, per kind of inquiry. Every path promises 24–48 hours.
const NEXT: Record<Kind, { lead: string; steps: [string, string][]; helpful: string }> = {
  wedding: {
    lead: 'Congratulations, and thank you for considering us for your wedding. We’re checking your date against both of our calendars now.',
    steps: [
      ['Availability', 'We confirm your date and hold it while you decide.'],
      ['Recommendation', 'The format we’d suggest for your ceremony, cocktail hour and reception.'],
      ['Written quote', 'A clear, itemised proposal, with no surprises later.'],
    ],
    helpful: 'Your rough timeline (ceremony, cocktail hour, reception), your guest count, and any songs you already know you want, or never want to hear.',
  },
  corporate: {
    lead: 'Thank you for considering Soul Shades for your event. Our team is reviewing the details now.',
    steps: [
      ['Availability', 'We confirm your date and hold it while you finalise.'],
      ['Recommendation', 'A format and set length suited to your room and run of show.'],
      ['Written proposal', 'An itemised quote. A certificate of insurance (COI) and W-9 are available on request.'],
    ],
    helpful: 'Your run of show, expected headcount, and any brand, dress or AV guidelines.',
  },
  venue: {
    lead: 'Thank you for reaching out about a night at your venue. We’re reviewing the details now.',
    steps: [
      ['Availability', 'We confirm the date and hours.'],
      ['Technical', 'Set length and what we need from your sound system.'],
      ['Rate', 'Our rate for the night, in writing.'],
    ],
    helpful: 'Your sound system details and the hours you’d like covered.',
  },
  party: {
    lead: 'Thank you for reaching out, it sounds like a great celebration. We’re reviewing the details now.',
    steps: [
      ['Availability', 'We confirm your date and hold it while you decide.'],
      ['Recommendation', 'The format that fits your party best.'],
      ['Written quote', 'A clear, itemised proposal.'],
    ],
    helpful: 'Your guest count, the atmosphere you’re going for, and any must-play songs.',
  },
  general: {
    lead: 'Thank you for reaching out. We’re reviewing your note now.',
    steps: [
      ['Availability', 'We confirm your date.'],
      ['Recommendation', 'Which of our formats fits your event best.'],
      ['Written quote', 'A clear, itemised proposal.'],
    ],
    helpful: 'Anything else that would help us plan, such as guest count, venue or the atmosphere you want.',
  },
};

// ── Formatting helpers ────────────────────────────────────────────────────────
export function firstNameOf(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? '';
  const clean = first.replace(/[^\p{L}'’-]/gu, '').slice(0, 30);
  return clean ? clean[0].toUpperCase() + clean.slice(1) : 'there';
}

export function prettyDate(iso: string, style: 'long' | 'short' = 'long'): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: style === 'long' ? 'long' : 'short', month: style === 'long' ? 'long' : 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

export function prettyTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function durationLabel(start: string, end: string): string {
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  let mins = toMin(end) - toMin(start);
  if (mins <= 0) mins += 24 * 60; // runs past midnight
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h ? `${h} hr${h === 1 ? '' : 's'}` : ''}${h && m ? ' ' : ''}${m ? `${m} min` : ''}`;
}

/** Days from today (New York) to the event date. */
function daysUntil(iso: string, now = new Date()): number {
  const today = now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); // YYYY-MM-DD
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

/** Short, human-quotable reference, e.g. SS-261113-7KQ2. */
export function makeRef(now = new Date()): string {
  const d = now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }).replace(/-/g, '').slice(2);
  const r = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  return `SS-${d}-${r}`;
}

/** Google Calendar "hold" link for the lead email (New York time). */
function calendarLink(o: { title: string; date: string; start: string; end: string; location: string; details: string }): string {
  const compact = (iso: string) => iso.replace(/-/g, '');
  const plusDay = (iso: string) => { const t = new Date(`${iso}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10); };
  const endDate = o.end <= o.start ? plusDay(o.date) : o.date;
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: o.title,
    dates: `${compact(o.date)}T${o.start.replace(':', '')}00/${compact(endDate)}T${o.end.replace(':', '')}00`,
    ctz: 'America/New_York',
    location: o.location,
    details: o.details,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// ── Shared email chrome ───────────────────────────────────────────────────────
function shell(opts: { title: string; preheader: string; body: string; footer: string }): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${opts.title}</title>
<style>
  @media (max-width: 620px) {
    .px { padding-left: 24px !important; padding-right: 24px !important; }
    .h1 { font-size: 26px !important; line-height: 1.25 !important; }
    .stack { display: block !important; width: 100% !important; }
    .stack-gap { padding-top: 10px !important; }
    .btn a { display: block !important; }
  }
  a { text-decoration: none; }
</style>
</head>
<body style="margin:0;padding:0;background:${C.cream};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${opts.preheader}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
  <tr><td align="center" style="padding:36px 12px 40px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
      <!-- Masthead -->
      <tr><td style="background:${C.ink};border-radius:14px 14px 0 0;padding:30px 40px 26px;" class="px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle"><img src="${LOGO_ON_DARK}" width="190" height="32" alt="SOUL SHADES" style="display:block;border:0;outline:none;width:190px;height:auto;color:${C.tan};font-family:${SANS};font-size:22px;font-weight:700;letter-spacing:2px;"></td>
          <td valign="middle" align="right" style="font-family:${SANS};font-size:10px;letter-spacing:2.4px;text-transform:uppercase;color:rgba(255,255,255,0.5);">Bookings</td>
        </tr></table>
      </td></tr>
      <tr><td style="height:3px;line-height:3px;font-size:0;background:${C.tan};background-image:linear-gradient(90deg,${C.tanLight},${C.tan},${C.brown});">&nbsp;</td></tr>
      <!-- Body -->
      <tr><td style="background:${C.paper};padding:40px 40px 36px;font-family:${SANS};color:${C.text};" class="px">
        ${opts.body}
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:${C.ink2};border-radius:0 0 14px 14px;padding:24px 40px;font-family:${SANS};font-size:11.5px;line-height:1.7;color:rgba(255,255,255,0.5);" class="px">
        ${opts.footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const label = (t: string) => `<div style="font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};margin:0 0 6px;">${t}</div>`;

function detailRows(rows: [string, string][]): string {
  return rows.map(([k, v], i) => `
    <tr>
      <td class="stack" valign="top" style="padding:13px 0;${i ? `border-top:1px solid ${C.line};` : ''}width:150px;font-family:${SANS};font-size:10.5px;letter-spacing:1.8px;text-transform:uppercase;color:${C.muted};">${k}</td>
      <td class="stack" valign="top" style="padding:13px 0;${i ? `border-top:1px solid ${C.line};` : ''}font-family:${SANS};font-size:15px;line-height:1.5;color:${C.ink};">${v}</td>
    </tr>`).join('');
}

function button(href: string, text: string, primary = true): string {
  return `<td class="btn stack stack-gap" style="padding-right:10px;">
    <a href="${href}" style="display:inline-block;font-family:${SANS};font-size:13px;font-weight:600;letter-spacing:0.4px;padding:13px 22px;border-radius:999px;text-align:center;${primary ? `background:${C.ink};color:#ffffff;` : `background:${C.paper};color:${C.ink};border:1px solid ${C.ink};`}">${text}</a>
  </td>`;
}

// ── 1. Confirmation to the client ────────────────────────────────────────────
export function confirmationEmail(o: { ref: string; first: string; serviceId: string; eventType: string; eventDate: string; start: string; end: string; kind: Kind }) {
  const next = NEXT[o.kind];
  const svc = SERVICES[o.serviceId];
  const what = svc ? `${svc.act}: ${svc.title}` : (o.eventType && o.eventType !== 'Other' ? o.eventType : 'Your event');
  const date = prettyDate(o.eventDate);
  const time = `${prettyTime(o.start)} – ${prettyTime(o.end)}`;

  const body = `
    ${label(`Reference ${o.ref}`)}
    <h1 class="h1" style="margin:0 0 18px;font-family:${SERIF};font-weight:400;font-size:30px;line-height:1.2;color:${C.ink};">Thank you, ${esc(o.first)}.<br>Your inquiry is with us.</h1>
    <p style="margin:0 0 30px;font-size:16px;line-height:1.7;color:${C.text};">${next.lead} You’ll hear from us personally within <strong style="color:${C.ink};">24–48 hours</strong>.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};border-radius:12px;">
      <tr><td style="padding:8px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRows([
            ['Inquiry', esc(what)],
            ...(svc && o.eventType !== 'Other' ? [['Occasion', esc(o.eventType)] as [string, string]] : []),
            ['Date', esc(date)],
            ['Time', `${esc(time)} <span style="color:${C.muted};">(${esc(durationLabel(o.start, o.end))})</span>`],
          ])}
        </table>
      </td></tr>
    </table>

    <div style="height:34px;line-height:34px;font-size:0;">&nbsp;</div>
    ${label('What happens next')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
      ${next.steps.map(([title, text], i) => `
      <tr>
        <td valign="top" width="44" style="padding:0 0 18px;">
          <div style="width:30px;height:30px;line-height:30px;border-radius:50%;background:${C.ink};color:${C.tan};text-align:center;font-family:${SERIF};font-size:15px;">${i + 1}</div>
        </td>
        <td valign="top" style="padding:3px 0 18px;font-family:${SANS};font-size:15px;line-height:1.55;color:${C.text};">
          <strong style="color:${C.ink};">${title}.</strong> ${text}
        </td>
      </tr>`).join('')}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 32px;">
      <tr><td style="border-left:3px solid ${C.tan};padding:4px 0 4px 18px;font-family:${SANS};font-size:14.5px;line-height:1.65;color:${C.text};">
        <strong style="color:${C.ink};">To move faster,</strong> simply reply to this email with ${next.helpful.charAt(0).toLowerCase()}${next.helpful.slice(1)}
      </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px;"><tr>
      ${button(`${SITE}/#videos`, 'Watch us perform')}
      ${button(`${SITE}/#services`, 'Explore our formats', false)}
    </tr></table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};">
      <tr><td style="padding-top:26px;">
        <p style="margin:0 0 14px;font-family:${SERIF};font-size:17px;font-style:italic;color:${C.text};">With gratitude,</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td class="stack" valign="top" style="padding-right:36px;font-family:${SANS};">
            <div style="font-size:15px;font-weight:700;color:${C.ink};">DJ DX</div>
            <div style="font-size:12.5px;color:${C.muted};line-height:1.5;">DJ, Turntablist &amp; Producer</div>
          </td>
          <td class="stack stack-gap" valign="top" style="font-family:${SANS};">
            <div style="font-size:15px;font-weight:700;color:${C.ink};">Julie Schatz</div>
            <div style="font-size:12.5px;color:${C.muted};line-height:1.5;">Violin, Piano &amp; Vocals</div>
          </td>
        </tr></table>
        <div style="margin-top:14px;font-family:${SANS};font-size:12.5px;color:${C.muted};">Soul Shades Music · New York</div>
      </td></tr>
    </table>`;

  const footer = `
    <a href="mailto:${BOOKINGS}" style="color:${C.tan};">${BOOKINGS}</a> &nbsp;·&nbsp; <a href="${SITE}" style="color:${C.tan};">soulshadesmusic.com</a><br>
    Weddings, corporate events and private celebrations across New York, New Jersey, Connecticut and beyond.<br>
    <span style="color:rgba(255,255,255,0.35);">You’re receiving this because this address was used on the booking form at soulshadesmusic.com. If that wasn’t you, no action is needed.</span>`;

  const text = [
    `Thank you, ${o.first}. Your inquiry is with us.`,
    `Reference: ${o.ref}`,
    '',
    `${next.lead} You’ll hear from us personally within 24–48 hours.`,
    '',
    `Inquiry: ${what}`,
    `Date: ${date}`,
    `Time: ${time} (${durationLabel(o.start, o.end)})`,
    '',
    'What happens next',
    ...next.steps.map(([t, d], i) => `${i + 1}. ${t}. ${d}`),
    '',
    `To move faster, simply reply to this email with ${next.helpful.charAt(0).toLowerCase()}${next.helpful.slice(1)}`,
    '',
    'With gratitude,',
    'DJ DX: DJ, Turntablist & Producer',
    'Julie Schatz: Violin, Piano & Vocals',
    'Soul Shades Music · New York',
    `${BOOKINGS} · ${SITE}`,
    '',
    'You’re receiving this because this address was used on the booking form at soulshadesmusic.com. If that wasn’t you, no action is needed.',
  ].join('\n');

  return {
    subject: `Your Soul Shades inquiry is confirmed · Ref. ${o.ref}`,
    html: shell({ title: 'Your inquiry is confirmed', preheader: `Thank you, ${esc(o.first)}. You’ll hear from us personally within 24–48 hours.`, body, footer }),
    text,
  };
}

// ── 2. The lead, to the bookings inbox ───────────────────────────────────────
export function leadEmail(o: {
  ref: string; kind: Kind; serviceId: string; name: string; email: string; phone: string; eventType: string;
  eventDate: string; start: string; end: string; location: string; message: string; pageUrl: string; now?: Date;
}) {
  const svc = SERVICES[o.serviceId];
  const service = svc ? `${svc.act}: ${svc.title}` : 'Not sure yet (recommend the right fit)';
  const first = firstNameOf(o.name);
  const days = daysUntil(o.eventDate, o.now);
  const when = days < 0 ? 'Date is in the past' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days < 60 ? `In ${days} days` : `In ${Math.round(days / 30.4)} months`;
  const urgent = days >= 0 && days <= 30;
  const kindLabel = { wedding: 'Wedding', corporate: 'Corporate', venue: 'Venue night', party: 'Private event', general: 'General' }[o.kind];
  const received = (o.now ?? new Date()).toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' ET';
  const telHref = o.phone.replace(/[^\d+]/g, '');

  const replySubject = encodeURIComponent(`Re: Your Soul Shades inquiry · Ref. ${o.ref}`);
  const replyBody = encodeURIComponent(`Hi ${first},\n\nThank you for reaching out about ${prettyDate(o.eventDate)}. \n\n`);
  const cal = calendarLink({
    title: `HOLD: ${svc ? svc.title : o.eventType} · ${o.name.slice(0, 60)} (${o.ref})`,
    date: o.eventDate, start: o.start, end: o.end, location: o.location,
    details: `${service}\n${o.name} · ${o.email} · ${o.phone}\nRef. ${o.ref}`,
  });

  const chip = (t: string, strong = false) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 11px;border-radius:999px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.6px;${strong ? `background:${C.ink};color:${C.tan};` : `background:${C.cream};color:${C.brown};`}">${t}</span>`;

  const body = `
    ${label(`New booking inquiry · ${o.ref}`)}
    <h1 class="h1" style="margin:0 0 6px;font-family:${SERIF};font-weight:400;font-size:30px;line-height:1.2;color:${C.ink};">${esc(o.name)}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.text};">${esc(service)}</p>
    <div style="margin:0 0 26px;">
      ${chip(kindLabel, true)}${chip(esc(prettyDate(o.eventDate, 'short')))}${chip(when + (urgent ? ' · respond today' : ''), urgent)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px;"><tr>
      ${button(`mailto:${encodeURIComponent(o.email)}?subject=${replySubject}&body=${replyBody}`, `Reply to ${esc(first)}`)}
      ${telHref ? button(`tel:${esc(telHref)}`, 'Call', false) : ''}
      ${button(esc(cal), 'Hold the date', false)}
    </tr></table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};border-radius:12px;">
      <tr><td style="padding:8px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRows([
            ['Client', `<strong>${esc(o.name)}</strong>`],
            ['Email', `<a href="mailto:${esc(o.email)}" style="color:${C.brown};">${esc(o.email)}</a>`],
            ['Phone', `<a href="tel:${esc(telHref)}" style="color:${C.brown};">${esc(o.phone)}</a>`],
            ['Booking', esc(service)],
            ['Occasion', esc(o.eventType)],
            ['Date', esc(prettyDate(o.eventDate))],
            ['Time', `${esc(prettyTime(o.start))} – ${esc(prettyTime(o.end))} <span style="color:${C.muted};">(${esc(durationLabel(o.start, o.end))})</span>`],
            ['Location', esc(o.location)],
          ])}
        </table>
      </td></tr>
    </table>

    <div style="height:30px;line-height:30px;font-size:0;">&nbsp;</div>
    ${label('In their words')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="border-left:3px solid ${C.tan};padding:6px 0 6px 18px;font-family:${SERIF};font-size:16.5px;line-height:1.7;color:${C.ink};">
        ${esc(o.message).replace(/\n/g, '<br>')}
      </td></tr>
    </table>

    <div style="height:28px;line-height:28px;font-size:0;">&nbsp;</div>
    <p style="margin:0;font-size:12.5px;line-height:1.6;color:${C.muted};">
      ${esc(first)} has been sent a confirmation (Ref. ${o.ref}) promising a reply within 24–48 hours. Replying to this email goes straight to ${esc(first)}.
    </p>`;

  const footer = `
    Received ${esc(received)} via ${o.pageUrl ? `<a href="${esc(o.pageUrl)}" style="color:${C.tan};">${esc(o.pageUrl.replace(/^https?:\/\//, '').slice(0, 60))}</a>` : 'soulshadesmusic.com'}<br>
    <span style="color:rgba(255,255,255,0.35);">Soul Shades Music · internal booking notification</span>`;

  const text = [
    `New booking inquiry · ${o.ref}`,
    '',
    `${o.name}: ${service}`,
    `${kindLabel} · ${prettyDate(o.eventDate)} · ${when}`,
    '',
    `Email: ${o.email}`,
    `Phone: ${o.phone}`,
    `Occasion: ${o.eventType}`,
    `Time: ${prettyTime(o.start)} – ${prettyTime(o.end)} (${durationLabel(o.start, o.end)})`,
    `Location: ${o.location}`,
    '',
    'In their words:',
    o.message,
    '',
    `Hold the date: ${cal}`,
    `Received ${received}${o.pageUrl ? ` via ${o.pageUrl}` : ''}`,
  ].join('\n');

  return {
    subject: `${urgent ? '⚡ ' : ''}New inquiry: ${svc ? svc.title : o.eventType} · ${prettyDate(o.eventDate, 'short')} · ${o.name.slice(0, 60)} [${o.ref}]`,
    html: shell({ title: `New inquiry ${o.ref}`, preheader: `${o.name} · ${service} · ${prettyDate(o.eventDate, 'short')} · ${o.location}`.slice(0, 140).replace(/[<>&"]/g, ''), body, footer }),
    text,
  };
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'Forbidden' });

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many requests' });

  const errors = validate(body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Invalid input', errors });

  const name = String(body.name).trim(), email = String(body.email).trim(), phone = String(body.phone).trim();
  const eventType = String(body.eventType), eventDate = String(body.eventDate);
  const start = String(body.eventStartTime), end = String(body.eventEndTime);
  const location = String(body.location).trim(), message = String(body.message).trim();

  // Silent drops: honeypot filled, sent too fast, or obvious spam content.
  const elapsed = body.elapsedMs;
  const tooFast = typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS;
  const honeypot = typeof body.honeypot === 'string' && body.honeypot.trim() !== '';
  if (honeypot || tooFast || SPAM_PHRASES.test(`${name} ${location} ${message}`)) {
    return res.status(200).json({ success: true });
  }

  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return res.status(400).json({ error: 'Verification failed', code: 'verification' });
  }

  const serviceId = typeof body.serviceId === 'string' && SERVICES[body.serviceId] ? body.serviceId : '';
  const kind = kindOf(serviceId, eventType);
  const ref = makeRef();
  // Only our own pages are shown as the source in the lead email.
  const pageUrl = typeof body.pageUrl === 'string' && /^https:\/\/(www\.)?soulshadesmusic\.com\//.test(body.pageUrl) ? body.pageUrl.slice(0, 200) : '';

  try {
    const lead = leadEmail({ ref, kind, serviceId, name, email, phone, eventType, eventDate, start, end, location, message, pageUrl });
    const team = await resend.emails.send({ from: FROM, to: [BOOKINGS], replyTo: email, subject: lead.subject, html: lead.html, text: lead.text });
    if (team.error) throw team.error;

    // A failure here shouldn't lose the lead, which has already reached the inbox.
    const c = confirmationEmail({ ref, first: firstNameOf(name), serviceId, eventType, eventDate, start, end, kind });
    const confirm = await resend.emails.send({ from: FROM, to: [email], replyTo: BOOKINGS, subject: c.subject, html: c.html, text: c.text });
    if (confirm.error) console.error('Booking confirmation failed:', confirm.error);

    return res.status(200).json({ success: true, ref });
  } catch (err) {
    console.error('Booking email error:', err);
    return res.status(500).json({ error: 'Failed to send inquiry' });
  }
}
