# Soul Shades — soulshadesmusic.com

Standalone site for Soul Shades (DJ DX & Julie Schatz) — ported from the
`djdx-website-new` monorepo's `/soul-shades` page into its own independent
Vite + React project.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- react-router-dom is installed but unused — this is a single-page site
  (no client-side routing; all sections are anchors on one page)
- Stripe (music store checkout), Resend (email), Cloudflare R2 (file
  storage for purchased track downloads), Vercel Blob (optional catalog
  admin persistence)

## Local development

```bash
npm install
npm run dev
```

```bash
npm run build   # tsc -b && vite build
```

## Environment variables

Copy `.env.example` to `.env` and fill in real values. **Until these are
provided, the site's design, content, navigation, and music previews will
all work normally — but purchases (Stripe checkout) and booking form
submissions (Resend email) will not actually complete.** Specifically:

| Variable | Used by | Required for |
|---|---|---|
| `STRIPE_SECRET_KEY` | `api/create-checkout.ts`, `api/webhook.ts` | Starting/verifying checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | `api/webhook.ts` | Verifying Stripe webhook signatures |
| `RESEND_API_KEY` | `api/booking.ts`, `api/webhook.ts` | Sending booking + download emails |
| `FROM_EMAIL` | `api/booking.ts`, `api/webhook.ts` | Sender identity on outgoing email |
| `R2_ENDPOINT` | `api/webhook.ts` | Cloudflare R2 S3-compatible endpoint |
| `R2_ACCESS_KEY_ID` | `api/webhook.ts` | R2 auth |
| `R2_SECRET_ACCESS_KEY` | `api/webhook.ts` | R2 auth |
| `R2_BUCKET_NAME` | `api/webhook.ts` | Bucket holding purchasable master files |
| `SITE_URL` | `api/create-checkout.ts`, `api/catalog.ts` | Stripe success/cancel URLs, CORS origin |
| `ADMIN_SECRET` | `api/catalog.ts` (optional) | Only needed if an admin UI for editing the catalog is built later; also requires Vercel Blob storage provisioned |

Without `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` set, the "Buy" flow in
the music store will fail at the `/api/create-checkout` call. Without
`RESEND_API_KEY`, the booking form will fail at `/api/booking`. Both fail
gracefully in the UI (an error message is shown) — nothing crashes.

## Notes / judgment calls made during the port

- This is a single-page app — `SiteNav`/`SiteFooter` were simplified to
  anchor links (`#about`, `#catalog`, `#ss-booking`, etc.) since there's
  no longer a "back to djdxmusic.com" multi-page context.
- Footer/booking contact email was changed to `bookings@soulshadesmusic.com`
  (from the original `soulshades@djdxmusic.com`) to match the JSON-LD
  identity already set up in `index.html`.
- `BookingForm.tsx` was simplified to a plain text location field —
  the original's `AddressAutocomplete` component depends on a Google
  Places-backed `/api/geocode` endpoint and Meta/TikTok Conversions API
  reporting that were out of scope for this first pass. The location
  value is still submitted and emailed as free text.
- `api/booking.ts` drops the Meta CAPI / TikTok Events API server-side
  conversion reporting from the original (those require additional pixel
  IDs and access tokens not part of this project's scope).
- `api/catalog.ts` was ported as-is (Vercel Blob-backed catalog override)
  even though no admin UI exists yet in this project to use it — the GET
  path is live and simply falls back to the local `defaultCatalog` in
  `src/catalog.ts` when no blob has been saved.
