/* Booking-form rules, written once and used by the form for instant,
   field-level feedback. api/booking.ts re-checks the same rules on the server
   (it can't import this file, see the note there), so a bot posting straight
   to the endpoint meets the same limits as a person using the form.

   Copy is written for people, not validators: say what's needed and how to
   fix it, never just "invalid". */

export const LIMITS = {
  name: { min: 2, max: 120 },
  email: { max: 254 },
  phone: { minDigits: 10, maxDigits: 15, max: 30 },
  location: { min: 3, max: 200 },
  message: { min: 20, max: 2000, maxLinks: 1 },
  /** How far ahead we take bookings. */
  yearsAhead: 3,
};

export type FieldKey = 'name' | 'email' | 'phone' | 'eventType' | 'eventDate' | 'eventStartTime' | 'eventEndTime' | 'location' | 'message';
export type Errors = Partial<Record<FieldKey, string>>;

export type InquiryInput = {
  name: string; email: string; phone: string; eventType: string;
  eventDate: string; eventStartTime: string; eventEndTime: string; location: string; message: string;
};

const URL_RE = /(https?:\/\/|www\.)\S+/gi;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Today's date in New York as YYYY-MM-DD (events are booked in local time). */
export function todayNY(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

/** Latest date we accept, YYYY-MM-DD. */
export function maxEventDate(now = new Date()): string {
  const [y, m, d] = todayNY(now).split('-');
  return `${Number(y) + LIMITS.yearsAhead}-${m}-${d}`;
}

/** Rejects dates like 2027-02-31 that JavaScript would silently roll over. */
const isRealDate = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso; };
const digits = (s: string) => s.replace(/\D/g, '');
const linkCount = (s: string) => (s.match(URL_RE) || []).length;

const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'me.com', 'msn.com', 'live.com', 'comcast.net', 'verizon.net', 'protonmail.com'];

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/** "jane@gmial.com" → "jane@gmail.com". Returns null when nothing looks off. */
export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain || COMMON_DOMAINS.includes(domain)) return null;
  let best: string | null = null, bestD = 3;
  for (const d of COMMON_DOMAINS) {
    const dist = editDistance(domain, d);
    if (dist < bestD) { best = d; bestD = dist; }
  }
  return best && bestD <= 2 ? `${email.slice(0, at)}@${best}` : null;
}

export function validateField(key: FieldKey, v: InquiryInput, now = new Date()): string | undefined {
  const val = (v[key] ?? '').trim();
  switch (key) {
    case 'name':
      if (!val) return 'Please tell us your name.';
      if (val.length < LIMITS.name.min || (val.match(/\p{L}/gu) || []).length < 2) return 'Please enter your full name.';
      if (val.length > LIMITS.name.max) return 'That name is a little long. Please shorten it.';
      if (linkCount(val) || /\d{3,}/.test(val)) return 'Please enter just your name.';
      return;
    case 'email':
      if (!val) return 'We’ll need an email to send your quote.';
      if (val.length > LIMITS.email.max || !EMAIL_RE.test(val)) return 'That email doesn’t look quite right. Please check it.';
      return;
    case 'phone': {
      if (!val) return 'Please add a phone number in case we need to reach you quickly.';
      if (!/^[\d\s()+.\-x]+$/i.test(val) || val.length > LIMITS.phone.max) return 'Please use numbers only, e.g. (212) 555-0148.';
      const n = digits(val).length;
      if (n < LIMITS.phone.minDigits) return 'That number looks short. Please include the area code.';
      if (n > LIMITS.phone.maxDigits) return 'That number looks too long. Please check it.';
      return;
    }
    case 'eventType':
      if (!val) return 'Please choose the type of event.';
      return;
    case 'eventDate': {
      if (!val) return 'Please choose your event date.';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val) || !isRealDate(val)) return 'Please choose a valid date.';
      if (val < todayNY(now)) return 'That date has already passed. Please choose an upcoming date.';
      if (val > maxEventDate(now)) return `We book up to ${LIMITS.yearsAhead} years ahead. Please choose an earlier date, or mention your plans in the message.`;
      return;
    }
    case 'eventStartTime':
      if (!val) return 'Please add a start time. An estimate is fine.';
      return;
    case 'eventEndTime':
      if (!val) return 'Please add an end time. An estimate is fine.';
      if (val === v.eventStartTime.trim()) return 'The end time should be after the start time.';
      return;
    case 'location':
      if (!val) return 'Please tell us the venue, or at least the city.';
      if (val.length < LIMITS.location.min) return 'Please add a little more, e.g. the venue or city.';
      if (val.length > LIMITS.location.max) return 'Please shorten the location.';
      if (linkCount(val)) return 'Please type the venue name rather than a link.';
      return;
    case 'message': {
      if (!val) return 'Tell us a little about your event.';
      if (val.length < LIMITS.message.min) return 'A little more detail helps us quote accurately, such as guest count or the vibe you want.';
      if (val.length > LIMITS.message.max) return `Please keep your message under ${LIMITS.message.max.toLocaleString()} characters.`;
      if (linkCount(val) > LIMITS.message.maxLinks) return 'To keep our inbox spam-free, please include no more than one link.';
      return;
    }
  }
}

export const FIELD_ORDER: FieldKey[] = ['name', 'email', 'phone', 'eventDate', 'eventStartTime', 'eventEndTime', 'eventType', 'location', 'message'];

export function validateAll(v: InquiryInput, now = new Date()): Errors {
  const errors: Errors = {};
  for (const k of FIELD_ORDER) {
    const e = validateField(k, v, now);
    if (e) errors[k] = e;
  }
  return errors;
}

/** True when the end time is earlier than the start, i.e. the event runs past midnight. */
export const crossesMidnight = (start: string, end: string) => !!start && !!end && end < start;
