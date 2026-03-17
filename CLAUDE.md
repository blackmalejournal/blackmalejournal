# THE BLACK MALE JOURNAL — Project Instructions

## What This Project Is
A full-stack website for The Black Male Journal, an independent media house and revolutionary
masculinist platform. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase,
and Stripe. Deployed on Vercel.

## Quick Start
```bash
npm install
npm run dev          # Development server (Next.js 16)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Jest unit/integration tests
npm run test:e2e     # Playwright E2E tests
npx tsc --noEmit     # TypeScript check
```

## Brand System — NEVER deviate from these values
Colors (use CSS variables from src/styles/brand.css):
- --bmj-black: #0D0C0B (backgrounds)
- --bmj-cream: #E8DCC8 (primary text on dark)
- --bmj-red: #C0281F (accents, star icon, borders)
- --bmj-amber: #C8852A (quote cards, highlights)
- --bmj-brown: #3B2417 (secondary backgrounds)
- --bmj-tan: #B8986A (metadata, dates)
- --bmj-white: #F2EDE4 (maximum contrast text)

Fonts (loaded via next/font/google):
- Display/Headlines: Bebas Neue — always ALL-CAPS
- Body: Libre Baskerville — editorial serif
- Labels: Oswald — caps, wide tracking
- Mono: IBM Plex Mono — dates, issue numbers

PROHIBITED: pastels, gradients, purple, blue, neon, rounded corners > 4px,
drop shadows, glassmorphism, or any "modern SaaS" aesthetic.

Visual: Vintage propaganda poster + newspaper grid + Black Panther pamphlet energy.
Textures: grain overlay on all sections, halftone dots on images.

## Three Lenses (Content Taxonomy)
All articles and content are categorized under exactly one lens:
- health — physical/mental wellness, martial arts, discipline
- philosophy — purpose, identity, masculinity, mindset
- politics — power, policy, systems, community organizing

## Architecture Rules
- App Router only (no pages/ directory)
- All routes under src/app/(public)/ for public pages
- Auth routes under src/app/(auth)/
- API routes under src/app/api/
- Components: src/components/ui/ (primitives), /brand/ (logo, headers), /content/ (cards), /home/ (homepage sections), /layout/ (nav, footer), /portal/ (member area), /seo/ (metadata, structured data)
- Content: database-driven via Supabase (articles, briefings, handbooks, downloads, courses, lessons)
- Lib: src/lib/supabase/, src/lib/stripe/, src/lib/content/

## Key Files
- `src/app/layout.tsx` — Root layout, font loading, global providers
- `src/middleware.ts` — Auth middleware (Supabase session handling)
- `src/lib/supabase/queries.ts` — All database query functions
- `src/lib/supabase/access.ts` — Tier-based content access control
- `src/lib/stripe/config.ts` — Stripe configuration
- `src/styles/brand.css` — CSS custom properties (--bmj-* variables)
- `tailwind.config.ts` — Tailwind theme extending brand tokens
- `supabase/config.toml` — Local Supabase configuration

## Code Style
- Use TypeScript strict mode
- Tailwind for all styling — no CSS modules, no styled-components
- Use CSS variables (var(--bmj-*)) for all brand colors in Tailwind config
- Server Components by default, "use client" only when needed
- Zod for all form validation and API input validation
- Use lucide-react for icons
- Framer Motion for page transitions and scroll animations only — keep it subtle

## Content Model
- Articles: title, slug, lens, tags[], excerpt, body, featured, access_tier (free|basic|premium), author, cover_image, published_at
- Briefings: issue_number, title, slug, sections (JSON array of {title, body}), access_tier, cover_image, published_at
- Members: email, tier (free|basic|premium), stripe_customer_id, stripe_subscription_id

## Access Tiers
- free: all public articles, briefing previews, video gallery, academy
- basic: full briefing archive, select handbooks, member forum access
- premium: everything — all handbooks, downloads, private content, early access

## File Naming
- Components: PascalCase (ArticleCard.tsx)
- Pages: lowercase with hyphens if needed
- Utilities: camelCase
- Database slugs: kebab-case (e.g., weekend-briefing-001)

## Git Commits
Follow conventional commits: feat:, fix:, chore:, docs:, style:, refactor:, test:
Example: "feat: add Weekend Briefing archive page with lens filter"

## Database (Supabase)
- Migrations: `supabase/migrations/`
- Seed data: `supabase/seed-*.sql` (courses, dispatches, downloads, handbooks, lessons)
- Seed scripts: `scripts/seed.ts` (single table), `scripts/seed-all.ts` (all tables)
- Run seeds: `npx tsx scripts/seed-all.ts`

## Testing
- Run `npm test` — Jest with jsdom (72 test files)
- Run `npm run test:watch` — Jest watch mode for development
- Run `npm test -- --coverage` — Coverage report
- Run `npm run test:e2e` — E2E tests with Playwright (chromium)
- Verify `npm run build` passes before any commit
- Check TypeScript with `npx tsc --noEmit`
- Run `npm run lint` — ESLint checks
- Visual check: every page must look correct at 375px (mobile) and 1440px (desktop)
- **CI/CD:** GitHub Actions validates all tests + lint + build on every commit and PR

## Important Notes
- Weekend Briefing is the flagship content format — it gets special design treatment
- The Chairman is the sole author for now — default all author fields to "The Chairman"
- Star motif from the logo is used as section dividers (horizontal rule replacement)
- All images should have grain/halftone treatment applied via CSS

## Design System (@alawein/tokens)

The BMJ design system has been consolidated into the unified Alawein token system:

- **Location:** `@alawein/tokens` (published to npm)
- **Themes:** 29 comprehensive JSON-based themes (Dawn Primary for BMJ aesthetic)
- **Tokens:** Colors, typography, spacing, animations with semantic naming
- **Documentation:**
  - API & Usage: https://github.com/alawein/alawein/tree/main/_devkit/packages/@alawein/tokens/README.md
  - Architecture: https://github.com/alawein/alawein/tree/main/_devkit/packages/@alawein/tokens/ARCHITECTURE.md
  - Publishing: https://github.com/alawein/alawein/tree/main/_devkit/packages/@alawein/tokens/PUBLISH.md
- **Migration Guide:** docs/design-system-consolidation.md (see section on mapping BMJ colors to Alawein tokens)
- **CSS Import:** `import '@alawein/tokens/dist/themes.css'`
- **Token Mapping:**
  - Old: `--bmj-black` → New: `--color-background`
  - Old: `--bmj-white` → New: `--color-text`
  - Old: `--bmj-red` → New: `--color-accent`
  - Old: `--bmj-amber` → New: `--color-primary`
  - See consolidation ADR for complete mapping

## Operations & Infrastructure
- Full nonprofit setup guide: docs/ops/nonprofit-setup-guide.md
- Environment variable reference: docs/ops/env-vars.md (canonical source of truth)
- When adding a new environment variable: add it to docs/ops/env-vars.md first, then set it in Vercel
- Never commit .env files, API keys, or credentials — .gitignore must cover .env*
- Only NEXT_PUBLIC_ prefix for values safe to expose in client bundles (Supabase URL/anon key, site URL, WhatsApp link)
- Server-only secrets (Stripe secret key, Supabase service role key, Resend key) must NEVER have NEXT_PUBLIC_ prefix
- Org accounts use founder@ or role aliases on the org domain — never personal email for service accounts
- Run /secrets-audit before deploys, /backup-check weekly, /env-audit after adding new integrations
- Run /domain-setup once when the custom domain is purchased (consolidates all domain-dependent tasks)
