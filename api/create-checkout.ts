import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as any,
});

/** Only our own pages may start a checkout (stops other sites calling this). */
function allowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // some browsers omit Origin on same-origin requests
  try {
    const host = new URL(origin).hostname;
    if (host === 'soulshadesmusic.com' || host === 'www.soulshadesmusic.com' || host === 'localhost' || host === '127.0.0.1') return true;
    return host.endsWith('.vercel.app') && (host === process.env.VERCEL_URL || host.includes('soulshades'));
  } catch { return false; }
}

/* Best-effort rate limit: 10 checkout attempts per connection per 10 minutes.
   Memory is per server instance, so it slows card-testing and floods rather
   than guaranteeing a cap; Stripe Radar is the real defence for payments. */
const hits = new Map<string, number[]>();
function rateLimited(ip: string, now = Date.now()): boolean {
  const windowMs = 10 * 60_000, max = 10;
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!allowedOrigin(req.headers.origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' })
  }

  const { amount, email, name, trackIds, r2FileNames, trackTitles } = req.body as {
    amount: number
    email: string
    name: string
    trackIds: string[]
    r2FileNames?: string[]
    trackTitles?: string[]
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' })
  }
  if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0 || trackIds.length > 50) {
    return res.status(400).json({ error: 'Invalid track selection' })
  }
  // Only allow numeric track IDs — prevents arbitrary R2 key access
  if (!trackIds.every((id: unknown) => typeof id === 'string' && /^\d+$/.test(id))) {
    return res.status(400).json({ error: 'Invalid track IDs' })
  }

  const minRequiredAmount = trackIds.length * 3;
  if (!amount || typeof amount !== 'number' || amount < minRequiredAmount || amount > 500) {
    return res.status(400).json({ error: 'Invalid amount' })
  }

  try {
    const siteUrl = process.env.SITE_URL || 'https://soulshadesmusic.com';

    // Store r2FileNames array or strings in metadata. Metadata values are max 500 chars.
    let r2FileNamesString = '';
    if (r2FileNames && Array.isArray(r2FileNames)) {
      r2FileNamesString = r2FileNames.join('||');
      // Strip out any characters over 500 if we hit the limit, though ideally it should fit.
      if (r2FileNamesString.length > 500) {
        console.warn('r2FileNames exceeded 500 characters in metadata');
        r2FileNamesString = r2FileNamesString.substring(0, 500);
      }
    } else {
      r2FileNamesString = trackIds.map((id: string) => `${id}.mp3`).join('||');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Soul Shades Music – ${trackIds.length} track${trackIds.length > 1 ? 's' : ''}`,
            },
            unit_amount: Math.round(amount * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/thank-you?email=${encodeURIComponent(email)}`,
      cancel_url: `${siteUrl}/`,
      metadata: {
        trackIds: trackIds.join(','),
        customerEmail: email,
        customerName: name || '',
        r2FileNames: r2FileNamesString,
        trackTitles: (trackTitles || []).join('||').substring(0, 500),
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      checkoutUrl: session.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
