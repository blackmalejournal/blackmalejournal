# Production Deploy v1.0 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship The Black Male Journal to production — clean console output, verify build, push, deploy to Vercel, and validate the live site.

**Architecture:** This is a deploy-readiness plan, not a feature plan. We audit code quality, remove dev artifacts, verify environment variables, push to Vercel, and validate post-deploy. No new features.

**Tech Stack:** Next.js 16, Vercel, Stripe, Supabase, Resend

---

## Chunk 1: Pre-Deploy Code Cleanup

### Task 1: Remove console.log from production source code

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts` (lines 60, 76, 93, 113, 131)

The webhook route has 5 `console.log` statements. In production, these should use a structured approach. However, for a webhook handler, server-side logging is actually useful for debugging Stripe events. The pragmatic call: keep them but downgrade to `console.info` for operational logs, which signals intent (these are informational, not debug noise).

- [ ] **Step 1: Replace console.log with console.info in webhook route**

Replace all 5 `console.log` calls in `src/app/api/stripe/webhook/route.ts` with `console.info` — these are operational logs for webhook event processing, not debug statements. Vercel captures `console.info` in function logs.

- [ ] **Step 2: Verify no other console.log in src/**

Run: `grep -r "console\.log" src/`
Expected: No matches. (`scripts/` files are fine — they don't ship to production.)

- [ ] **Step 3: Verify no TODO/FIXME blockers**

Run: `grep -rn "TODO\|FIXME\|HACK\|XXX" src/`
Expected: No matches (already confirmed clean).

---

### Task 2: Verify TypeScript compiles cleanly

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Clean build with no errors. Note any warnings (Next.js 16 middleware deprecation warning is expected and safe to ignore).

---

## Chunk 2: Environment Variable Inventory

### Task 3: Document all required environment variables

**Files:**
- Reference only (no changes): `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/admin.ts`, `src/lib/stripe/config.ts`, `src/app/api/contact/route.ts`, `src/app/api/stripe/webhook/route.ts`, `src/app/api/stripe/donate/route.ts`, `src/lib/seo.ts`, `src/app/(public)/contact/page.tsx`

- [ ] **Step 1: Compile the full env var list**

All environment variables used in production code:

**Supabase (required — app won't function without these):**
| Variable | Prefix | Used In |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_` (client) | `server.ts`, `client.ts`, `admin.ts`, `middleware.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_` (client) | `server.ts`, `client.ts`, `middleware.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | `admin.ts` (webhook handler) |

**Stripe (required — subscriptions + donations):**
| Variable | Prefix | Used In |
|----------|--------|---------|
| `STRIPE_SECRET_KEY` | server-only | `stripe/config.ts` |
| `STRIPE_WEBHOOK_SECRET` | server-only | `webhook/route.ts` |
| `STRIPE_BASIC_PRICE_ID` | server-only | `stripe/config.ts` |
| `STRIPE_PREMIUM_PRICE_ID` | server-only | `stripe/config.ts` |

**Resend (optional — contact form works without, just no email):**
| Variable | Prefix | Used In |
|----------|--------|---------|
| `RESEND_API_KEY` | server-only | `contact/route.ts` |
| `RESEND_FROM_EMAIL` | server-only | `contact/route.ts` |
| `CONTACT_TO_EMAIL` | server-only | `contact/route.ts` |

**Site config:**
| Variable | Prefix | Used In |
|----------|--------|---------|
| `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_` (client) | `seo.ts`, `auth/actions.ts`, `stripe/helpers.ts`, `donate/route.ts` |
| `NEXT_PUBLIC_WHATSAPP_LINK` | `NEXT_PUBLIC_` (client) | `contact/page.tsx` |

- [ ] **Step 2: Verify env vars are set in Vercel Dashboard**

Go to Vercel Dashboard > Project > Settings > Environment Variables.
Ensure all 13 variables above are set for **Production** environment.

Critical: `NEXT_PUBLIC_SITE_URL` must be set to the production URL (e.g., `https://blackmalejournal.com` or `https://blackmalejournal.vercel.app`).

Critical: `STRIPE_WEBHOOK_SECRET` must match the webhook endpoint registered in Stripe Dashboard pointing to `https://<production-domain>/api/stripe/webhook`.

- [ ] **Step 3: Verify NEXT_PUBLIC_ prefix correctness**

Only variables that need to be in the browser bundle should have `NEXT_PUBLIC_` prefix:
- `NEXT_PUBLIC_SUPABASE_URL` — correct (Supabase client SDK needs this)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — correct (Supabase client SDK needs this)
- `NEXT_PUBLIC_SITE_URL` — correct (used in client-side meta tags)
- `NEXT_PUBLIC_WHATSAPP_LINK` — correct (used in client-rendered contact page)

All Stripe keys, Supabase service role key, and Resend keys are server-only — correct.

---

## Chunk 3: Final File Checks

### Task 4: Verify .gitignore coverage

- [ ] **Step 1: Confirm .gitignore includes all required entries**

Already verified. Current `.gitignore` includes:
- `.env*.local` and `.env` — env files
- `node_modules` — dependencies
- `.next/` — build output
- `.vercel` — Vercel config
- `.playwright-mcp/` — dev tool

No changes needed.

- [ ] **Step 2: Verify no secrets are tracked**

Run: `git ls-files | grep -i "\.env\|secret\|credential"`
Expected: No matches.

---

### Task 5: Verify Plausible analytics comment is intentional

**Files:**
- Reference: `src/app/layout.tsx` (lines 100-105)

- [ ] **Step 1: Confirm analytics script is intentionally commented out**

The Plausible script in `layout.tsx` is commented out with `{/* Plausible analytics — uncomment when domain is live */}`. This is correct — enable it after the domain is live and Plausible is configured. No action needed now.

---

## Chunk 4: Deploy

### Task 6: Commit and push

- [ ] **Step 1: Stage untracked plan files**

```bash
git add docs/superpowers/plans/
```

- [ ] **Step 2: Commit all changes**

```bash
git commit -m "chore: pre-deploy cleanup — console.info in webhook, add deploy plans"
```

- [ ] **Step 3: Push to origin**

```bash
git push origin main
```

Vercel auto-deploys on push to `main`. Wait for the Vercel build to complete.

- [ ] **Step 4: Monitor Vercel build**

Check Vercel Dashboard > Deployments for the latest deployment.
Expected: Build succeeds, deployment goes live.

If build fails: check the build log for the specific error, fix locally, commit, push again.

---

## Chunk 5: Post-Deploy Verification

### Task 7: Verify production site loads

- [ ] **Step 1: Hit the production URL**

Navigate to production URL (Vercel URL or custom domain).
Expected: Home page renders with HeroBanner, ThreeLenses, FeaturedArticles, RotatingQuote, JoinCTA, Footer.

- [ ] **Step 2: Verify all public pages load (no 404s)**

Check each route:
- `/` — Home
- `/articles` — Articles archive
- `/briefings` — Briefings archive
- `/academy` — Academy listing
- `/video` — Video gallery
- `/blog` — Dispatches feed
- `/pricing` — Pricing page
- `/contact` — Contact page
- `/support` — Support/donation page
- `/privacy` — Privacy policy
- `/terms` — Terms of service
- `/login` — Login page
- `/signup` — Signup page

- [ ] **Step 3: Verify mobile rendering**

Open browser DevTools, set viewport to 375px wide.
Check: Home, Articles, Pricing, Contact pages render without horizontal overflow.

---

### Task 8: Verify Stripe integration

- [ ] **Step 1: Register production webhook**

In Stripe Dashboard > Webhooks:
- Add endpoint: `https://<production-domain>/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Copy the signing secret to Vercel env var `STRIPE_WEBHOOK_SECRET`
- Redeploy after updating the env var

- [ ] **Step 2: Test checkout flow (test mode)**

If Stripe is still in test mode:
1. Go to `/pricing`, click "Get Started" on Basic
2. Should redirect to Stripe Checkout
3. Use test card `4242 4242 4242 4242`
4. Complete payment — should redirect back to `/portal?checkout=success`

- [ ] **Step 3: Test donation flow**

1. Go to `/support`
2. Select $15, click donate
3. Should redirect to Stripe Checkout
4. Complete with test card
5. Should redirect back to `/support?success=true`

---

### Task 9: Verify contact form and newsletter

- [ ] **Step 1: Test contact form submission**

1. Go to `/contact`
2. Fill out name, email, select subject, write message
3. Submit
4. Expected: Success message appears, submission stored in Supabase `contact_submissions` table
5. If Resend env vars are configured: email delivered to `CONTACT_TO_EMAIL`

- [ ] **Step 2: Test newsletter signup**

1. Scroll to Footer on any page
2. Enter email in newsletter form
3. Submit
4. Expected: Success message, email stored in Supabase `newsletter_subscribers` table

---

### Task 10: Post-deploy configuration (manual steps)

- [ ] **Step 1: Custom domain (if not already configured)**

In Vercel Dashboard > Project > Settings > Domains:
- Add `blackmalejournal.com` (and `www.blackmalejournal.com`)
- Configure DNS records as Vercel instructs
- Vercel auto-provisions SSL certificate

- [ ] **Step 2: Update NEXT_PUBLIC_SITE_URL**

After custom domain is live, update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to `https://blackmalejournal.com`. Redeploy.

- [ ] **Step 3: Update Stripe webhook URL**

Update Stripe webhook endpoint to use custom domain instead of `.vercel.app` URL.

- [ ] **Step 4: Submit sitemap to Google Search Console**

1. Go to Google Search Console
2. Add property for `blackmalejournal.com`
3. Submit sitemap URL: `https://blackmalejournal.com/sitemap.xml`

- [ ] **Step 5: Configure Supabase Auth redirect URLs**

In Supabase Dashboard > Authentication > URL Configuration:
- Set Site URL to `https://blackmalejournal.com`
- Add `https://blackmalejournal.com/auth/callback` to Redirect URLs
- Add `https://blackmalejournal.vercel.app/auth/callback` to Redirect URLs (for preview deploys)

---

## Summary: What ships vs. what's deferred

**Ships now:**
- Full public site (12 pages)
- Auth system (login, signup, portal, settings)
- Stripe subscriptions (checkout, webhook, billing portal)
- Stripe donations (one-time + monthly)
- Contact form + newsletter
- SEO (sitemap, robots.txt, structured data, meta tags)

**Deferred (not blocking launch):**
- Resend email delivery (works without — submissions still stored in DB)
- Plausible analytics (uncomment when ready)
- Academy individual course pages (placeholder exists)
- Search functionality
- RLS-based content gating (app-layer gating works for now)
- Real CashApp/Venmo/PayPal/Patreon account URLs
