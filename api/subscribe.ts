import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Mailing-list sign-ups from the site. Saves the address as a Resend contact
// (and adds it to RESEND_SEGMENT_ID, if set) so news can go out later as a
// Resend broadcast, which adds the unsubscribe link for us. Nothing is
// emailed from here, so the form can't be used to send mail to strangers.
//
// Self-contained on purpose: Vercel doesn't bundle cross-file imports under
// api/ (see api/booking.ts).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MIN_FILL_MS = 1500;

function allowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    if (host === 'soulshadesmusic.com' || host === 'www.soulshadesmusic.com' || host === 'localhost' || host === '127.0.0.1') return true;
    return host.endsWith('.vercel.app') && (host === process.env.VERCEL_URL || host.includes('soulshades'));
  } catch { return false; }
}

/* Best-effort: 5 sign-ups per connection per 10 minutes, per server instance. */
const hits = new Map<string, number[]>();
function rateLimited(ip: string, now = Date.now()): boolean {
  const windowMs = 10 * 60_000, max = 5;
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'Forbidden' });

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many requests' });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email', message: 'That email doesn’t look quite right. Please check it.' });
  }
  const rawName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
  const firstName = rawName.length <= 60 && /^[\p{L}][\p{L}' .-]*$/u.test(rawName) ? rawName : undefined;

  // Silent drops (bots get a normal-looking success): honeypot filled, or sent too fast.
  const elapsed = body.elapsedMs;
  const tooFast = typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS;
  const honeypot = typeof body.honeypot === 'string' && body.honeypot.trim() !== '';
  if (honeypot || tooFast) return res.status(200).json({ success: true });

  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Sign-ups are not set up yet' });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const segment = process.env.RESEND_SEGMENT_ID;
  try {
    const { error } = await resend.contacts.create({
      email,
      firstName,
      unsubscribed: false,
      ...(segment ? { segments: [{ id: segment }] } : {}),
    });
    // Signing up twice is fine: the visitor is already on the list.
    if (error && !/already exist/i.test(error.message)) throw error;
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('subscribe failed', err);
    return res.status(502).json({ error: 'Could not sign up right now' });
  }
}
