import type { VercelRequest, VercelResponse } from '@vercel/node'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Resend } from 'resend'
import Stripe from 'stripe'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, // https://<account-id>.r2.cloudflarestorage.com
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const resend = new Resend(process.env.RESEND_API_KEY)

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

// Set in Vercel. The DJ DX site sells the same files from its bucket
// (default name djdx-masters), and this site uses that bucket too.
const BUCKET = process.env.R2_BUCKET_NAME || 'djdx-masters'
// Signed URLs expire in 2 hours to prevent excessive sharing
const EXPIRY_SECONDS = 60 * 60 * 2

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawBody = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => { chunks.push(Buffer.from(chunk)); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

  const signature = req.headers['stripe-signature'] as string
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' })
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const trackIdsStr = session.metadata?.trackIds
  const customerEmailRaw = session.metadata?.customerEmail || session.customer_details?.email
  const customerNameRaw = session.metadata?.customerName || session.customer_details?.name || 'Music Fan'

  if (!trackIdsStr || !customerEmailRaw) {
    console.error('Missing necessary metadata on session', session.id)
    return res.status(200).json({ received: true })
  }

  // Files come from the fixed list above, never from the session.
  const trackIds = trackIdsStr.split(',').map(t => t.trim()).filter(id => Object.prototype.hasOwnProperty.call(TRACKS, id))
  const r2FileNames = trackIds.map(id => TRACKS[id].file)
  const trackTitles = trackIds.map(id => TRACKS[id].title)

  if (trackIds.length === 0) {
    console.error('Invalid track or file names array', session.id)
    return res.status(200).json({ received: true })
  }

  const customerEmail = escapeHtml(customerEmailRaw ?? '')
  const customerName = escapeHtml(customerNameRaw ?? '')
  const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0';

  try {
    // Generate a signed R2 URL for each track
    console.log(`Generating R2 signed URLs for bucket="${BUCKET}" files=[${r2FileNames.join(', ')}]`);
    const downloadLinks = await Promise.all(
      r2FileNames.map(async (fileName, index) => {
        const title = trackTitles[index] || formatTrackName(trackIds[index]);
        // Extract the raw filename for the download attachment
        const attachmentName = fileName.split('/').pop()?.replace(/"/g, '') || 'soulshades-track.wav';

        const command = new GetObjectCommand({
          Bucket: BUCKET,
          Key: fileName,
          // Force the resulting URL to trigger a 'Save As...' download dialog
          ResponseContentDisposition: `attachment; filename="${attachmentName}"`
        })
        const url = await getSignedUrl(r2, command, { expiresIn: EXPIRY_SECONDS })
        return { title, url }
      })
    )

    // Build email HTML
    const linksHtml = downloadLinks
      .map(
        ({ title, url }) =>
          `<li style="margin-bottom:12px;">
            <a href="${url}" style="color:#C9A84C;font-weight:600;text-decoration:none;">
              ⬇ ${escapeHtml(title)}
            </a>
            <span style="color:#888;font-size:12px;"> (expires in 2 hours)</span>
          </li>`
      )
      .join('')

    const fromEmail = process.env.FROM_EMAIL || 'Soul Shades <noreply@soulshadesmusic.com>';
    console.log(`Attempting to send email from="${fromEmail}" to="${customerEmailRaw}" tracks=${trackIds.join(',')}`);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      // noreply@ can't receive mail; send customer replies to the bookings inbox (ImprovMX).
      replyTo: process.env.REPLY_TO_EMAIL || 'bookings@soulshadesmusic.com',
      to: customerEmailRaw,
      subject: `Your Soul Shades download is ready 🎵`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0c0c0c;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#161616;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1500,#0c0c0c);padding:40px 40px 30px;border-bottom:1px solid #2a2a2a;">
              <p style="margin:0 0 8px;font-size:13px;color:#C9A84C;letter-spacing:3px;text-transform:uppercase;">Soul Shades</p>
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;">Your download is ready</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#aaa;font-size:15px;">Hey ${customerName},</p>
              <p style="margin:0 0 24px;color:#aaa;font-size:15px;">
                Thank you for supporting the music — you paid <strong style="color:#E2C97E;">$${amount}</strong>.
                Here ${trackIds.length === 1 ? 'is your track' : 'are your tracks'}:
              </p>

              <ul style="list-style:none;padding:0;margin:0 0 28px;">
                ${linksHtml}
              </ul>

              <p style="margin:0;color:#666;font-size:13px;">
                Links expire in 2 hours. Having trouble? Reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #222;text-align:center;">
              <p style="margin:0;color:#444;font-size:12px;">Soul Shades · All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error(`Resend API error:`, JSON.stringify(error));
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    console.log(`Email delivered successfully id=${data?.id} to=${customerEmailRaw} tracks=${trackIds.join(', ')}`)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTrackName(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
