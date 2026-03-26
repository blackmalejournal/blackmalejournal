# Contributing

> Code conventions, PR process, and quality standards for The Black Male Journal.

## Prerequisites

- Read [DEVELOPER.md](DEVELOPER.md) for local setup
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Familiarize yourself with [CLAUDE.md](../CLAUDE.md) (project instructions)

## Code Style

### TypeScript

- Strict mode enabled
- All form inputs and API bodies validated with **Zod**
- Use `type` imports where possible: `import type { Article } from '...'`
- Server Components by default — add `'use client'` only when you need hooks, event handlers, or browser APIs

### Styling

- **Tailwind CSS only** — no CSS modules, no styled-components
- Use brand tokens via Tailwind classes: `bg-bmj-black`, `text-bmj-cream`, etc.
- Never hardcode colors — use `var(--bmj-*)` in CSS, Tailwind `bmj-*` classes in components
- **Exception:** `tailwind.config.ts` uses hex values (not CSS vars) because opacity modifiers require it

### Components

- Icons: **lucide-react** only
- Animation: **Framer Motion** for page transitions and scroll reveals only — keep it subtle
- Content cards: follow existing card patterns in `src/components/content/`
- Admin components: use existing components from `src/components/admin/`

### Imports

- Use `@/` path alias (maps to `src/`)
- Import order: external packages, then `@/` imports, then relative imports
- Use centralized constants: `PATHS` from `@/lib/paths`, `PLACEHOLDERS` from `@/lib/placeholders`

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ArticleCard.tsx` |
| Pages | lowercase | `page.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Database slugs | kebab-case | `weekend-briefing-001` |
| Placeholder images | `{content-type}.svg` | `article.svg` |
| Test files | `*.test.ts` or `*.test.tsx` | `ArticleCard.test.tsx` |

## Asset Naming Convention

### Public Directory

```
public/
  logos/          Brand identity — filename describes variant
  placeholders/   Content fallbacks — named by content type
  textures/       CSS patterns — named by effect
  fonts/          Typeface files — named by foundry convention
```

- Logos: `{variant}-{colorMode}.{ext}` (e.g., `primary-color.png`, `favicon-red.svg`)
- Placeholders: `{content-type}.svg` (e.g., `article.svg`, `briefing.svg`)
- All placeholders are registered in `src/lib/placeholders.ts`

### Supabase Storage

Content images uploaded via the admin UI go to Supabase Storage buckets:
- `covers` — cover images for articles, briefings, courses, handbooks
- `downloads` — downloadable files (PDFs, templates)

## Branching and Commits

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Weekend Briefing archive with lens filter
fix: correct fee calculation in donation flow
refactor: split admin queries into domain modules
test: add coverage for membership tier comparison
docs: update operator manual with billing SOP
chore: update dependencies
style: fix inconsistent card padding
```

### Branch Naming

```
feat/briefing-archive
fix/donation-calculation
refactor/admin-queries
docs/operator-manual
```

### Pull Requests

- Keep PRs focused — one feature or fix per PR
- Include a test plan in the PR description
- All CI checks must pass (tests, lint, build, TypeScript)

## Testing

### Requirements

Before any commit:
1. `npm test` — all 867 tests must pass
2. `npm run lint` — no ESLint errors
3. `npx tsc --noEmit` — no TypeScript errors
4. `npm run build` — clean production build

### Test Structure

```
tests/
  components/     Component rendering tests
  lib/            Utility and query function tests
  pages/          Page-level rendering tests
  api/            API route tests
  admin/          Admin panel tests
  helpers/        Test utilities and mocks
  setup.ts        Global test setup (mocks for Next.js, Supabase, Framer Motion)
```

### Writing Tests

- Use Jest with jsdom
- Mock Supabase via `tests/helpers/supabase-mock.ts`
- Mock Stripe via `tests/helpers/stripe-mock.ts`
- Framer Motion is globally mocked in `tests/setup.ts` (including `useInView`, `useReducedMotion`)
- Test user-facing behavior, not implementation details

## Adding New Content

### New Content Type

1. Add type to `src/lib/supabase/types.ts`
2. Add queries to `src/lib/supabase/queries.ts`
3. Add admin queries to `src/lib/supabase/admin-queries/<domain>.ts`
4. Export from `src/lib/supabase/admin-queries/index.ts`
5. Create public route: `src/app/(public)/<route>/`
6. Create admin CRUD: `src/app/(auth)/admin/<domain>/` (6 files — see ARCHITECTURE.md)
7. Add nav link in `AdminNav.tsx`
8. Add dashboard card in admin `page.tsx`
9. Add placeholder SVG in `public/placeholders/<type>.svg`
10. Register in `src/lib/placeholders.ts`
11. Add tests in `tests/`

### New API Route

1. Create `src/app/api/<path>/route.ts`
2. Add Zod schema for input validation
3. Add rate limiting via `rateLimit()`
4. Admin routes: check role via `src/lib/admin-auth.ts`
5. Add tests in `tests/api/`

### New Public Page

1. Create `src/app/(public)/<route>/page.tsx`
2. Add metadata via `generateMetadata()`
3. Add to sitemap in `src/app/sitemap.ts`
4. Add nav link if needed in `src/lib/nav.ts`
5. Add tests in `tests/pages/`

## Brand Compliance

Every visual change must comply with the brand system:

- **Colors:** Only use `--bmj-*` variables / `bmj-*` Tailwind classes
- **Fonts:** Highrise (display), Libre Baskerville (body), Oswald (labels), IBM Plex Mono (data)
- **Prohibited:** Pastels, gradients, blue, neon, rounded corners > 4px, drop shadows, glassmorphism
- **Image treatment:** All editorial images must use halftone/duotone CSS filters
- **Placeholders:** Use `PLACEHOLDERS` from `@/lib/placeholders` for missing images

Full brand spec: [docs/brand/invariants.md](brand/invariants.md) and [.claude/rules/brand.md](../.claude/rules/brand.md)

## Governance

See [AGENTS.md](../AGENTS.md) for the Morphism Categorical Framework governing this repository — invariants, scope boundaries, and protocol for changes.
