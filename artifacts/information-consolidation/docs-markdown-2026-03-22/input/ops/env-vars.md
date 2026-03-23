# Environment Variables Reference

> Canonical list of every environment variable used by The Black Male Journal.
> When adding a new env var, add it here first. Run `/env-audit` to verify.

---

## Supabase (required — app won't function without these)

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | `server.ts`, `client.ts`, `admin.ts`, `proxy.ts` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | `server.ts`, `client.ts`, `proxy.ts` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | `admin.ts` (webhook handler) | Supabase service role key — bypasses RLS. Never expose to client. |

## Stripe (required — subscriptions + donations)

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `STRIPE_SECRET_KEY` | Server only | `stripe/config.ts` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Server only | `webhook/route.ts` | Stripe webhook signing secret — must match the endpoint registered in Stripe Dashboard |
| `STRIPE_BASIC_PRICE_ID` | Server only | `stripe/config.ts` | Stripe Price ID for Basic tier ($9/mo) |
| `STRIPE_PREMIUM_PRICE_ID` | Server only | `stripe/config.ts` | Stripe Price ID for Premium tier ($19/mo) |

## Resend (optional — contact form works without, just no email delivery)

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `RESEND_API_KEY` | Server only | `contact/route.ts` | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Server only | `contact/route.ts` | Sender address for outgoing email (must be verified domain in Resend) |
| `CONTACT_TO_EMAIL` | Server only | `contact/route.ts` | Recipient address for contact form submissions |

## Site Config

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Client + Server | `seo.ts`, `auth/actions.ts`, `stripe/helpers.ts`, `donate/route.ts` | Preferred canonical site URL (e.g., `https://blackmalejournal.com` or `https://blackmalejournal.vercel.app`). When unset on Vercel, the app falls back to `VERCEL_PROJECT_PRODUCTION_URL` and then `VERCEL_URL`. |
| `NEXT_PUBLIC_WHATSAPP_LINK` | Client | `contact/page.tsx` | WhatsApp contact link |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Client | `layout.tsx` | Optional Plausible domain. When set, the analytics script is injected into the root layout. |

## Environment-Specific Values

| Variable | Development | Preview | Production |
|----------|-------------|---------|------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Optional if Vercel fallback is acceptable | `https://blackmalejournal.com` or `https://blackmalejournal.vercel.app` until the custom domain is live |
| `STRIPE_WEBHOOK_SECRET` | Local Stripe CLI or dev endpoint secret | Preview webhook secret | Production webhook secret |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Unset | Usually unset | `blackmalejournal.com` |

## Callback and Webhook URLs

- Supabase auth callback:
  - `http://localhost:3000/auth/callback`
  - `https://<preview-domain>/auth/callback`
  - `https://blackmalejournal.com/auth/callback`
- Stripe webhook endpoint:
  - `http://localhost:3000/api/stripe/webhook` when using a local tunnel or Stripe CLI
  - `https://<preview-domain>/api/stripe/webhook`
  - `https://blackmalejournal.com/api/stripe/webhook`

---

## Rules

1. **Never commit `.env` files** — `.gitignore` must include `.env*`
2. **`NEXT_PUBLIC_` prefix** means the value is bundled into client-side JavaScript and visible to users. Only use this prefix for values that are safe to expose (Supabase URL, anon key, site URL, WhatsApp link, Plausible domain).
3. **Server-only variables** (Stripe secret key, Supabase service role key, Resend key) must NEVER have the `NEXT_PUBLIC_` prefix.
4. **Vercel scoping:** Set env vars for Production, Preview, and Development environments separately in the Vercel dashboard. Some values differ per environment (e.g., `NEXT_PUBLIC_SITE_URL`, `STRIPE_WEBHOOK_SECRET`).
5. **Host fallback:** On Vercel, BMJ will fall back to `VERCEL_PROJECT_PRODUCTION_URL` and then `VERCEL_URL` when `NEXT_PUBLIC_SITE_URL` is unset. Keep `NEXT_PUBLIC_SITE_URL` explicit in Production for stable canonicals and webhook/email links.
6. **Rotation:** Rotate all secret keys annually, or immediately if compromised.
7. **Backup:** Keep a copy of all env vars in Bitwarden under `Nonprofit / Developer`.

---

## Adding a New Environment Variable

1. Add it to the code where needed
2. Add a row to the appropriate table in this file
3. Set it in Vercel Dashboard > Project > Settings > Environment Variables
4. Store a copy in Bitwarden
5. Run `/env-audit` to verify consistency

## Total Count

- **13 variables** (5 client-safe, 8 server-only)
- **Required for the core app:** Supabase (3), Stripe (4), site URL (1)
- **Optional integrations:** Resend (3), WhatsApp (1), Plausible (1)
