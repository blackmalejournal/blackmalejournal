# Wiring Matrix

This document tracks planned data and asset wiring status across the BMJ app.

## Status Legend

- Wired: Planned item is connected from source to runtime consumer.
- Partial: Source exists, but one or more runtime consumers are missing.
- Deferred: Planned but intentionally postponed.
- Removed: Intentionally dropped from scope.

## Brand Assets

| Planned Item | Source | Runtime Consumer | Status | Notes |
|---|---|---|---|---|
| Primary logo variants | public/logos/primary-*.svg,png | Public pages and metadata | Partial | Metadata wired; additional variants remain optional unless used by component-level theme switching. |
| Favicon set | public/favicon.svg, public/logos/favicon-*.svg,png | App metadata icons | Wired | Root metadata icon now includes default and red variant. |
| Apple touch icon | public/logos/primary-light.png | App metadata icons | Wired | iOS icon points to PNG asset in logos set. |
| OG image | public/og-image.svg | OpenGraph/Twitter metadata | Wired | Used in root metadata. |
| Palette reference | docs/brand/bmj-palettes.png | Documentation only | Wired | Intended for docs and editorial references, not runtime UI. |

## Content Model

| Planned Item | Source | Runtime Consumer | Status | Notes |
|---|---|---|---|---|
| Article lens | supabase schema + queries | Lens badge and filtering tabs | Wired | End-to-end across query and UI. |
| Article access tier | supabase schema + access filters | Card lock indicator and gating | Wired | Card shows lock when tier is not free. |
| Article featured flag | supabase schema + featured query | Article card featured badge | Wired | Added visible featured label on cards. |
| Briefing sections JSON | supabase schema + query types | Briefing detail section renderer | Wired | Rendered in briefing views. |

## Environment and URL Resolution

| Planned Item | Source | Runtime Consumer | Status | Notes |
|---|---|---|---|---|
| Canonical site URL | NEXT_PUBLIC_SITE_URL | SEO, auth redirects, Stripe URLs | Wired | Fallback chain documented in env vars reference. |
| Vercel preview/prod fallback | VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL | Site URL helper | Wired | Used only when canonical URL is unset. |
| Analytics domain | NEXT_PUBLIC_PLAUSIBLE_DOMAIN | Root layout script injection | Wired | Conditionally loaded. |

## Verification Checklist

- Run lint: npm run lint
- Run types: npx tsc --noEmit
- Run tests: npm test
- Run build: npm run build
- Deploy preview and verify metadata + logo rendering in browser
