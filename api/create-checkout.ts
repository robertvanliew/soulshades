import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as any,
});

// ── What can be bought ───────────────────────────────────────────────────────
// The server decides which file goes with each track: the browser only says
// which track numbers are in the cart. (Trusting file names from the browser
// would let anyone pay $3 and download any file in the bucket, which also
// holds the DJ DX masters.) Same list in api/create-checkout.ts and
// api/webhook.ts — Vercel doesn't bundle shared files between functions here —
// and it must match src/catalog.ts.
const TRACKS: Record<string, { title: string; file: string }> = {
  '101': { title: 'Wait For Me', file: 'Soul Shades DJ Mixes/Soul Shades, DJ DX, Julie Schatz - Wait For Me.mp3' },
  '102': { title: 'Beyond Your Mind', file: 'Soul Shades DJ Mixes/Soul Shades, Julie Schatz, DJ DX - Beyond Your Mind.mp3' },
  '103': { title: 'Buzz In London', file: 'Soul Shades DJ Mixes/Soul Shades - Buzz In London ft. (DJ DX & Julie Schatz).wav' },
  '104': { title: 'Always On Time x Fired Up', file: 'Soul Shades DJ Mixes/Soul Shades - Always on time x Fired Up by (DJ DX & Julie Schatz).mp3' },
  '105': { title: 'Be Honest x Everything', file: 'Soul Shades DJ Mixes/Soul Shades - Be honest x Everything by (DJ DX & Julie Schatz).wav' },
  '106': { title: 'Cola x Vivrant Thing', file: 'Soul Shades DJ Mixes/Soul Shades - Cola x  Vivrant Thing by(DJ DX & Julie Schatz).wav' },
  '107': { title: 'Hannah x Everybody Everybody', file: 'Soul Shades DJ Mixes/Soul Shades - Hannah x Everybody Everybody by ( DJ DX & Julie Schatz).mp3' },
  '108': { title: 'Kiss Of Life', file: 'Soul Shades DJ Mixes/Soul Shades - Kiss Of Life by (DJ DX & Julie Schatz).wav' },
  '109': { title: 'Money Talks (Dirty Cash) x RIZZ', file: 'Soul Shades DJ Mixes/Soul Shades - Money Talks (Dirty Cash) x RIZZ by (DJ DX & Julie Schatz).wav' },
  '110': { title: 'Rock The Boat x You Are The One', file: 'Soul Shades DJ Mixes/Soul Shades - Rock the boat x You are the one by (DJ DX & Julie Schatz).mp3' },
  '111': { title: 'Streets x Rapture III x Violin', file: 'Soul Shades DJ Mixes/Soul Shades - Streets x Rapture III x Violin by (DJ DX & Julie Schatz).wav' },
  '112': { title: 'The Way You x Everybody x Never x Beso', file: 'Soul Shades DJ Mixes/Soul Shades - The Way You  x Everybody  x Never x Beso by (DJ DX & Julie Schatz).wav' },
  '113': { title: 'Unthinkable x Life Gets Hard', file: 'Soul Shades DJ Mixes/Soul Shades - Unthinkable x Life Gets Hard by (DJ DX & Julie Schatz).wav' },
  '114': { title: 'Addicted x Give Me The Night', file: "Soul Shades DJ Mixes/Soul Shades - 'Addicted' Chainsmokers x 'Give me the night' (Remix).wav" },
};

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

  const { amount, email, name, trackIds: rawIds } = (req.body ?? {}) as {
    amount: number
    email: string
    name?: string
    trackIds: string[]
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' })
  }
  if (!Array.isArray(rawIds) || rawIds.length === 0 || rawIds.length > 50) {
    return res.status(400).json({ error: 'Invalid track selection' })
  }
  // Only tracks this store sells; each counted once.
  const trackIds = [...new Set(rawIds.map(String))]
  if (!trackIds.every(id => Object.prototype.hasOwnProperty.call(TRACKS, id))) {
    return res.status(400).json({ error: 'Invalid track selection' })
  }
  const cleanName = typeof name === 'string' ? name.trim().slice(0, 100) : ''

  const minRequiredAmount = trackIds.length * 3;
  if (!amount || typeof amount !== 'number' || amount < minRequiredAmount || amount > 500) {
    return res.status(400).json({ error: 'Invalid amount' })
  }

  try {
    // Send buyers back to the address they bought from (a preview address,
    // or the live domain); anything unrecognised falls back to SITE_URL.
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : ''
    const siteUrl = origin && allowedOrigin(origin) && /^https:\/\//.test(origin)
      ? origin
      : (process.env.SITE_URL || 'https://soulshadesmusic.com');


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
      // No personal details in the address: it ends up in history and logs.
      success_url: `${siteUrl}/thank-you`,
      cancel_url: `${siteUrl}/#catalog`,
      // Only track numbers are stored; the webhook looks up the files.
      metadata: {
        trackIds: trackIds.join(','),
        customerEmail: email,
        customerName: cleanName,
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
