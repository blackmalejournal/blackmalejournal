# Deferred Work

Items intentionally deferred from active development. Each entry includes what needs doing and what it unblocks.

---

## Stripe Integration

**Status:** Deferred — waiting on product decisions

**What to do:**
1. Create products in Stripe Dashboard: Basic ($9/mo) and Premium ($19/mo)
2. Copy price IDs into `src/lib/stripe/config.ts`
3. Wire `CheckoutButton` to the live Stripe Checkout session endpoint
4. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel env vars (see `docs/ops/env-vars.md`)

**Unblocks:** Paid membership sign-up flow, subscription management in `/portal/settings`

---

## DNS / Custom Domain

**Status:** Deferred — waiting on domain purchase

**What to do:**
1. Run `/domain-setup` skill — it walks through the full checklist
2. Add domain to Vercel project → Vercel → Settings → Domains
3. Set `NEXT_PUBLIC_SITE_URL` to the live domain in Vercel env vars
4. Update `metadataBase` in `src/app/layout.tsx` if it reads from env

**Unblocks:** Canonical URLs in SEO/JSON-LD, email deliverability for auth emails

---

## Plausible Analytics

**Status:** Deferred — waiting on Plausible account setup

**What to do:**
1. Create account at plausible.io, add site for the custom domain
2. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in Vercel env vars
3. The `<Script>` tag in `src/app/layout.tsx` is already wired — no code changes needed

**Unblocks:** Traffic analytics, goal tracking for sign-up conversions

---

## Lenses 3 → 5 (Content Taxonomy Expansion)

**Status:** Deferred — needs editorial decision on two new lens names

**What to do (once lenses are defined):**
- `src/app/(public)/about/page.tsx` — ThreeLenses section
- `src/app/(public)/resources/page.tsx` — "Browse by Lens" filter
- `src/components/content/LensFilterTabs.tsx` — add new values
- `src/components/brand/LensBadge.tsx` — add color mappings
- Supabase: update `lens` column check constraint in a migration
- Update article seed data

**Unblocks:** Richer content categorization, more precise reader targeting
