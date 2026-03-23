# 2026-03-22 Release Readiness And Env Audit

This audit captures the verified BMJ launch state after the local release gates and the accessible external configuration checks.

## Code Verification

Verified locally on `2026-03-22`:

- `npm run secrets:check` passed
- `npm run lint` passed
- `npx tsc --noEmit` passed
- `npm test -- --ci --coverage --runInBand` passed with `109/109` suites and `797/797` tests
- `npm run build` passed
- `npm run test:e2e` passed with `10/10` tests

Notes:

- The first `coverage` and `build` attempts failed only because sandboxed writes to generated artifacts were denied. The unrestricted reruns passed.
- The first Playwright run hung because a stale Node process was already listening on port `3000`, which caused Playwright to reuse a bad local dev server. After stopping that process and rerunning the suite, E2E passed cleanly.

## Vercel Verification

Verified via Vercel CLI under account `alawein` on `2026-03-22`.

### Project Link

- Local repo is linked to Vercel project `blackmalejournal`
- `.vercel/project.json` points to project ID `prj_d9AoAlwyXJxYvHEmsfnSn8LSaELX`

### Deployments

Recent BMJ deployments exist and are healthy:

- multiple `Production` deployments are `Ready`
- multiple `Preview` deployments are `Ready`
- latest observed production deployment: `https://blackmalejournal-65hr6v6z2-alawein.vercel.app`

### Environment Variable Coverage

Present in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_LINK`

Missing from Vercel at audit time:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BASIC_PRICE_ID`
- `STRIPE_PREMIUM_PRICE_ID`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_TO_EMAIL`
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

Scoping observations from Vercel:

- `NEXT_PUBLIC_SITE_URL` exists for `Development` and `Production`
- `NEXT_PUBLIC_SITE_URL` was not present for `Preview`
- `NEXT_PUBLIC_WHATSAPP_LINK` exists for `Development`, `Preview`, and `Production`
- Supabase variables exist for `Development`, `Preview`, and `Production`

### Domain State

- `vercel domains ls` returned `0` domains under `alawein`
- No custom domain attachment was verified during this audit
- Production currently appears to rely on the `vercel.app` domain footprint

## Supabase And Stripe Verification Limits

This workstation does not currently have the `supabase` CLI or the `stripe` CLI available, so those platforms could not be queried directly from the terminal.

Still not directly verified from live dashboards:

- Supabase production callback URLs
- Stripe products and prices for Basic and Premium
- Stripe webhook endpoint registration and signing secrets
- Plausible site setup
- Resend production sender and recipient configuration

## Launch Status

### Green

- Repo code gates
- Production build
- Playwright smoke coverage
- Vercel project linkage
- Vercel deployment health

### Blocked

- Stripe is not launch-ready from the Vercel environment state alone
- Contact email delivery is not launch-ready from the Vercel environment state alone
- Plausible is not configured in Vercel
- Custom domain is not attached in Vercel
- Supabase callback configuration still requires dashboard verification

## Required Manual Follow-Up

1. Add the four Stripe variables to Vercel for the appropriate environments.
2. Add the three Resend variables to Vercel if contact-form email delivery is required.
3. Add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in `Production` once the Plausible site exists.
4. Attach the production domain in Vercel and confirm `NEXT_PUBLIC_SITE_URL` matches it.
5. Confirm Supabase redirect URLs include:
   - `http://localhost:3000/auth/callback`
   - preview callback URL
   - production callback URL
6. Confirm Stripe webhooks target `/api/stripe/webhook` for Preview and Production.
