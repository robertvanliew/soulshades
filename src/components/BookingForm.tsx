import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { SERVICE_OPTIONS, serviceLabel } from '../data/roster';
import {
  FIELD_ORDER, LIMITS, crossesMidnight, maxEventDate, suggestEmail, todayNY, validateAll, validateField,
  type Errors, type FieldKey,
} from '../lib/inquiryRules';
import Turnstile, { TURNSTILE_SITE_KEY, type TurnstileHandle } from './Turnstile';
import { trackLead } from '../lib/analytics';

// Backup inbox for inquiries if /api/booking can't be reached (see sendInquiry).
const FORMSPREE = 'https://formspree.io/f/moedjlng';
const BOOKINGS_EMAIL = 'bookings@soulshadesmusic.com';

type Fields = { service: string; name: string; email: string; phone: string; eventType: string; eventDate: string; eventStartTime: string; eventEndTime: string; location: string; message: string; company: string };
const EMPTY = (service: string): Fields => ({ service, name: '', email: '', phone: '', eventType: '', eventDate: '', eventStartTime: '', eventEndTime: '', location: '', message: '', company: '' });

type SendResult =
  | { ok: true; confirmed: boolean; ref?: string }
  | { ok: false; kind: 'fields'; errors: Errors }
  | { ok: false; kind: 'rate' | 'error' };

/* Primary path: /api/booking emails the lead to bookings@ and sends the client
   a confirmation (via Resend). If that endpoint is down or missing (local dev,
   an outage), or the bot check couldn't run in this visitor's browser, the
   lead goes to Formspree instead, so a real inquiry is never lost; only the
   client's confirmation email is skipped in that case. */
async function sendInquiry(f: Fields, service: string, elapsedMs: number, turnstileToken: string | null): Promise<SendResult> {
  try {
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, serviceId: f.service, honeypot: f.company, elapsedMs, pageUrl: window.location.href, turnstileToken }),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (res.ok) return { ok: true, confirmed: true, ref: typeof data.ref === 'string' ? data.ref : undefined };
    if (res.status === 429) return { ok: false, kind: 'rate' };
    if (res.status === 400 && data.code !== 'verification') {
      const errors = (data.errors && typeof data.errors === 'object' ? data.errors : {}) as Errors;
      return { ok: false, kind: 'fields', errors };
    }
    // 'verification' (bot check unavailable in this browser) and 5xx fall through.
  } catch { /* network error: fall through to Formspree */ }
  try {
    const backup = await fetch(FORMSPREE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      // Readable keys: Formspree shows them as-is in the email and dashboard.
      body: JSON.stringify({
        _subject: `Booking inquiry: ${service}${f.eventDate ? ` on ${f.eventDate}` : ''} (${f.name})`,
        'Booking': service,
        'Name': f.name,
        email: f.email, // lowercase "email" sets Reply-To to the client
        'Phone': f.phone,
        'Event type': f.eventType,
        'Event date': f.eventDate,
        'Start time': f.eventStartTime,
        'End time': f.eventEndTime,
        'Location / venue': f.location,
        'Message': f.message,
        'Sent from': window.location.href,
      }),
    });
    return backup.ok ? { ok: true, confirmed: false } : { ok: false, kind: 'error' };
  } catch {
    return { ok: false, kind: 'error' };
  }
}

/* One inquiry per person per date: a double-click, or a second send of the
   same form, shows the confirmation again instead of emailing twice. */
const SENT_KEY = 'ss-inquiries-sent';
const sentKey = (f: Fields) => `${f.email.trim().toLowerCase()}|${f.eventDate}`;
function wasSentRecently(f: Fields): string | null {
  try {
    const all = JSON.parse(localStorage.getItem(SENT_KEY) || '{}') as Record<string, { at: number; ref?: string }>;
    const hit = all[sentKey(f)];
    return hit && Date.now() - hit.at < 12 * 3600_000 ? (hit.ref ?? '') : null;
  } catch { return null; }
}
function rememberSent(f: Fields, ref?: string) {
  try {
    const all = JSON.parse(localStorage.getItem(SENT_KEY) || '{}');
    all[sentKey(f)] = { at: Date.now(), ref };
    localStorage.setItem(SENT_KEY, JSON.stringify(all));
  } catch { /* storage unavailable: not critical */ }
}

const Send = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const LABELS: Record<FieldKey, string> = {
  name: 'Full name', email: 'Email', phone: 'Phone', eventType: 'Event type', eventDate: 'Event date',
  eventStartTime: 'Start time', eventEndTime: 'End time', location: 'Location', message: 'About your event',
};

export default function BookingForm({ autoFocus = false, initialService = '' }: { autoFocus?: boolean; initialService?: string }) {
  // Unique per instance: the form appears both on the page and in the pop-up.
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<Fields>(() => EMPTY(initialService));
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [notice, setNotice] = useState<ReactNode>(null);
  // 'check' notices are recounted live from the current errors (see below).
  const [checkNotice, setCheckNotice] = useState(false);
  const [confirmed, setConfirmed] = useState(true);
  const [ref, setRef] = useState<string | undefined>();
  const [duplicate, setDuplicate] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [botCheckDown, setBotCheckDown] = useState(false);
  const turnstile = useRef<TurnstileHandle>(null);
  const mountedAt = useRef(Date.now());

  const today = useMemo(() => todayNY(), []);
  const latest = useMemo(() => maxEventDate(), []);
  const id = (k: string) => `${uid}-${k}`;
  const emailSuggestion = touched.email && !errors.email ? suggestEmail(fields.email.trim()) : null;

  const set = (k: keyof Fields, v: string) => {
    const next = { ...fields, [k]: v };
    setFields(next);
    // Once a field has been visited, re-check it as the visitor types so the
    // message disappears the moment it's fixed.
    const recheck: Errors = {};
    if (k !== 'service' && k !== 'company' && touched[k as FieldKey]) recheck[k as FieldKey] = validateField(k as FieldKey, next);
    if (k === 'eventStartTime' && touched.eventEndTime) recheck.eventEndTime = validateField('eventEndTime', next);
    if (Object.keys(recheck).length) setErrors(e => ({ ...e, ...recheck }));
  };

  const blur = (k: FieldKey) => {
    setTouched(t => ({ ...t, [k]: true }));
    setErrors(e => ({ ...e, [k]: validateField(k, fields) }));
  };

  const fieldProps = (k: FieldKey) => ({
    id: id(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': [errors[k] ? id(`${k}-err`) : '', id(`${k}-hint`)].filter(Boolean).join(' ') || undefined,
    onBlur: () => blur(k),
  });

  const Err = ({ k }: { k: FieldKey }) =>
    errors[k] ? <p className="field-error" id={id(`${k}-err`)}><span aria-hidden="true">!</span>{errors[k]}</p> : null;

  const focusField = (k: FieldKey) => {
    const el = formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(k))}`);
    el?.focus();
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    setNotice(null);
    setCheckNotice(false);

    const all = validateAll(fields);
    setErrors(all);
    setTouched(Object.fromEntries(FIELD_ORDER.map(k => [k, true])));
    const firstBad = FIELD_ORDER.find(k => all[k]);
    if (firstBad) {
      setCheckNotice(true);
      focusField(firstBad);
      return;
    }

    // Bots fill the hidden field or submit within seconds: show them the
    // success screen but send nothing.
    const elapsed = Date.now() - mountedAt.current;
    if (fields.company !== '' || elapsed < 2500) { setConfirmed(true); setRef(undefined); setStatus('sent'); return; }

    const already = wasSentRecently(fields);
    if (already !== null) { setDuplicate(true); setRef(already || undefined); setConfirmed(true); setStatus('sent'); return; }

    if (TURNSTILE_SITE_KEY && !token && !botCheckDown) {
      setNotice('One moment while we confirm you’re not a bot, then press Send again.');
      return;
    }

    setStatus('sending');
    const service = serviceLabel(fields.service) || 'Not sure yet — recommend the right fit';
    const res = await sendInquiry(fields, service, elapsed, token);
    turnstile.current?.reset(); // tokens are single-use

    if (res.ok) {
      // No personal details go to analytics: only what was asked about.
      trackLead({ service: fields.service || 'unsure', event_type: fields.eventType });
      rememberSent(fields, res.ref);
      setConfirmed(res.confirmed);
      setRef(res.ref);
      setDuplicate(false);
      setStatus('sent');
      setFields(EMPTY(initialService));
      setErrors({}); setTouched({});
      mountedAt.current = Date.now();
      return;
    }
    setStatus('idle');
    if (res.kind === 'fields') {
      setErrors(res.errors);
      const first = FIELD_ORDER.find(k => res.errors[k]);
      setCheckNotice(true);
      if (first) focusField(first);
    } else if (res.kind === 'rate') {
      setNotice(<>You’ve sent several inquiries in a short time. Please wait a few minutes, or email us at <a href={`mailto:${BOOKINGS_EMAIL}`}>{BOOKINGS_EMAIL}</a>.</>);
    } else {
      setNotice(<>We couldn’t send that just now. Please try again in a moment, or email us at <a href={`mailto:${BOOKINGS_EMAIL}`}>{BOOKINGS_EMAIL}</a>.</>);
    }
  };

  if (status === 'sent') return (
    <div className="booking-success" role="status">
      <div className="booking-success-icon" aria-hidden="true">✓</div>
      <h3>{duplicate ? 'We already have your inquiry' : 'Inquiry received'}</h3>
      <p>
        {duplicate
          ? 'You don’t need to send it again. We’ll be in touch within 24–48 hours.'
          : <>We’ll get back to you personally within 24–48 hours.{confirmed && ' A confirmation is on its way to your inbox.'}</>}
      </p>
      {ref && <p className="booking-ref">Reference {ref}</p>}
    </div>
  );

  const msgLen = fields.message.trim().length;
  const openErrors = FIELD_ORDER.filter(k => errors[k]).length;
  const banner = checkNotice && openErrors
    ? <>Please check {openErrors === 1 ? 'one field' : `${openErrors} fields`} below.</>
    : notice;
  const overnight = crossesMidnight(fields.eventStartTime, fields.eventEndTime);

  return (
    <form ref={formRef} className="booking-form" onSubmit={handleSubmit} noValidate aria-describedby={id('privacy')}>
      {/* Honeypot: hidden from real visitors, bots fill it blindly. Deliberately
          NOT named/labeled "Company"/"Organization", which matches a saved
          browser autofill field and used to drop real corporate leads. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <label htmlFor={id('hp')}>Leave this field blank</label>
        <input id={id('hp')} name="bf-hp" type="text" tabIndex={-1} autoComplete="off" value={fields.company} onChange={e => set('company', e.target.value)} />
      </div>

      {banner && <div className="form-notice" role="alert">{banner}</div>}

      <div className="form-field">
        <label htmlFor={id('service')}>What would you like to book?</label>
        <select id={id('service')} value={fields.service} onChange={e => set('service', e.target.value)}>
          <option value="">Not sure yet, recommend the right fit</option>
          {SERVICE_OPTIONS.map(g => (
            <optgroup key={g.group} label={g.group}>
              {g.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor={id('name')}>{LABELS.name}</label>
          <input {...fieldProps('name')} autoFocus={autoFocus} type="text" name="name" autoComplete="name" placeholder="Jane Smith" maxLength={LIMITS.name.max} required value={fields.name} onChange={e => set('name', e.target.value)} />
          <Err k="name" />
        </div>
        <div className="form-field">
          <label htmlFor={id('email')}>{LABELS.email}</label>
          <input {...fieldProps('email')} type="email" name="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="jane@company.com" maxLength={LIMITS.email.max} required value={fields.email} onChange={e => set('email', e.target.value)} />
          <Err k="email" />
          {emailSuggestion && (
            <p className="field-hint" id={id('email-hint')}>
              Did you mean{' '}
              <button type="button" className="field-suggest" onClick={() => { set('email', emailSuggestion); setErrors(e => ({ ...e, email: undefined })); }}>
                {emailSuggestion}
              </button>?
            </p>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor={id('phone')}>{LABELS.phone}</label>
          <input {...fieldProps('phone')} type="tel" name="tel" autoComplete="tel" inputMode="tel" placeholder="(212) 555-0148" maxLength={LIMITS.phone.max} required value={fields.phone} onChange={e => set('phone', e.target.value)} />
          <Err k="phone" />
        </div>
        <div className="form-field">
          <label htmlFor={id('eventDate')}>{LABELS.eventDate}</label>
          <input {...fieldProps('eventDate')} type="date" min={today} max={latest} required value={fields.eventDate} onChange={e => set('eventDate', e.target.value)} />
          <Err k="eventDate" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor={id('eventStartTime')}>{LABELS.eventStartTime}</label>
          <input {...fieldProps('eventStartTime')} type="time" step={900} required value={fields.eventStartTime} onChange={e => set('eventStartTime', e.target.value)} />
          <Err k="eventStartTime" />
        </div>
        <div className="form-field">
          <label htmlFor={id('eventEndTime')}>{LABELS.eventEndTime}</label>
          <input {...fieldProps('eventEndTime')} type="time" step={900} required value={fields.eventEndTime} onChange={e => set('eventEndTime', e.target.value)} />
          <Err k="eventEndTime" />
          {overnight && !errors.eventEndTime && <p className="field-hint" id={id('eventEndTime-hint')}>Ends after midnight, the following morning.</p>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor={id('eventType')}>{LABELS.eventType}</label>
          <select {...fieldProps('eventType')} required value={fields.eventType} onChange={e => { set('eventType', e.target.value); setTouched(t => ({ ...t, eventType: true })); setErrors(er => ({ ...er, eventType: undefined })); }}>
            <option value="" disabled>Select type…</option>
            <option>Wedding</option>
            <option>Corporate Event</option>
            <option>Private Party</option>
            <option>Club / Venue Night</option>
            <option>Birthday / Celebration</option>
            <option>Sweet 16 / Quinceañera / Mitzvah</option>
            <option>Other</option>
          </select>
          <Err k="eventType" />
        </div>
        <div className="form-field">
          <label htmlFor={id('location')}>Event location</label>
          <input {...fieldProps('location')} type="text" autoComplete="off" placeholder="Venue name, city, state" maxLength={LIMITS.location.max} required value={fields.location} onChange={e => set('location', e.target.value)} />
          <Err k="location" />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor={id('message')}>Tell us about your event</label>
        <textarea {...fieldProps('message')} placeholder="Guest count, the atmosphere you want, any special moments or requests…" maxLength={LIMITS.message.max} required value={fields.message} onChange={e => set('message', e.target.value)} />
        <Err k="message" />
        {msgLen > LIMITS.message.max * 0.8 && (
          <p className="field-hint field-count" id={id('message-hint')} aria-live="polite">{msgLen.toLocaleString()} / {LIMITS.message.max.toLocaleString()}</p>
        )}
      </div>

      <Turnstile ref={turnstile} onToken={setToken} onUnavailable={() => setBotCheckDown(true)} />

      <button type="submit" className="form-submit" disabled={status === 'sending'} aria-busy={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : <><span>Send Inquiry</span> <Send /></>}
      </button>
      <p className="form-privacy" id={id('privacy')}>
        We reply within 24–48 hours. Your details are used only to respond to your inquiry, never shared or added to a mailing list.
      </p>
    </form>
  );
}
