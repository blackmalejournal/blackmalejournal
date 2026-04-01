---
title: Release sequence
status: operational
audience: [operators, engineers]
last-verified: 2026-03-31
---

# Release Sequence

Use this exact order to move BMJ from code-complete to launch-ready.

Use [launch-dashboard-checklist.md](launch-dashboard-checklist.md) alongside this sequence when the work moves out of the repo and into external dashboards.

## 1. Database and Seeds

1. Apply all pending migrations, including [20260320000000_add-contact-submission-workflow.sql](../../supabase/migrations/20260320000000_add-contact-submission-workflow.sql).
2. Run or refresh staging seed data if operator training needs realistic records.
3. Verify the new `contact_submissions` fields exist:
   - `status`
   - `internal_notes`
   - `handled_at`
   - `handled_by`

## 2. Stripe

1. Create Basic and Premium products and prices in Stripe.
2. Set:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_BASIC_PRICE_ID`
   - `STRIPE_PREMIUM_PRICE_ID`
3. Register webhooks for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Point webhook endpoints to `/api/stripe/webhook` for Preview and Production.

## 3. Domain and Auth

1. Add the production domain in Vercel.
2. Set `NEXT_PUBLIC_SITE_URL` for Development and Production. Preview can rely on the Vercel deployment URL fallback if needed.
3. Add Supabase auth callbacks for:
   - local
   - preview
   - production
4. Verify `/auth/callback` returns users to the intended path.

## 4. Analytics

1. Create the Plausible site.
2. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in Production.
3. Leave it unset in Development unless local analytics is intentional.

## 5. Validation

1. `npm run secrets:check`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `npm test -- --ci --coverage`
5. `npm run test:e2e`
6. `npm run build`

## 6. Operator Drill

1. Log into `/admin`.
2. Publish one staging article or course update.
3. Triage one staging contact message.
4. Export the staging subscriber CSV.
5. Run one staging checkout and confirm the webhook upgrades the member tier.
6. Download one gated handbook or download asset through the signed route.

## 7. Launch Gate

Ship only after these are true:

- Stripe checkout returns to `/portal` cleanly.
- Webhooks update `members.tier` correctly.
- Signed downloads work.
- The Chairman can complete the operator drill without direct database access.
- [launch-checklist.md](launch-checklist.md) is fully checked off.
