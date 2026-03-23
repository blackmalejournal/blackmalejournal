# Launch Checklist

Use this checklist before any production launch, relaunch, or major campaign push.

For the exact manual dashboard work across Vercel, DNS, Supabase, Stripe, Resend, and Plausible, use [launch-dashboard-checklist.md](launch-dashboard-checklist.md).

## Application Checks

1. `npm run secrets:check`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `npm test -- --ci --coverage`
5. `npm run build`

## Runtime Checks

1. Confirm `NEXT_PUBLIC_SITE_URL` matches the production domain.
2. Confirm Supabase auth callback URLs include the production callback.
3. Confirm Stripe webhook endpoint is live at `/api/stripe/webhook`.
4. Confirm `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set for production.
5. Confirm a staging or preview checkout succeeds and returns to `/portal`.

## Operator Checks

1. Sign in to `/admin`.
2. Open `/admin/messages`.
3. Open `/admin/members`.
4. Open `/admin/subscribers`.
5. Open `/admin/courses`.
6. Publish or update one non-critical record in staging and verify the public route.

## Go / No-Go

- Go only if all checks pass.
- If Stripe, auth callbacks, or signed downloads fail, stop the launch and fix configuration first.
