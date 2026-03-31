# Tests

The Black Male Journal uses **Jest** (jsdom) for unit and integration tests and **Playwright** for end-to-end browser tests.

## Layout

| Directory | Purpose |
|-----------|---------|
| `tests/actions/` | Server actions (e.g. auth) |
| `tests/admin/` | Admin CRUD and messaging flows |
| `tests/api/` | `src/app/api` route handlers |
| `tests/components/` | React components |
| `tests/e2e/` | Playwright specs |
| `tests/helpers/` | Shared mocks (`supabase-mock`, `stripe-mock`, fixtures) |
| `tests/lib/` | `src/lib` utilities, queries, SEO, email |
| `tests/metadata/` | `robots.ts`, `sitemap.ts` |
| `tests/middleware/` | `proxy.ts` / auth routing behavior |
| `tests/pages/` | App Router pages and layouts |
| `tests/portal/` | Portal-specific server actions |
| `setup.ts` | Jest environment setup |

## Commands

Full workflow: [docs/DEVELOPER.md](../docs/DEVELOPER.md) — *Testing*.

| Command | Purpose |
|---------|---------|
| `npm test` | Full Jest suite |
| `npm run test:watch` | Jest watch mode |
| `npm run test:counts` | Print suite/test totals (for `README.md` / `CLAUDE.md`) |
| `npm run test:e2e` | Playwright (Chromium) |

## Conventions

- Test files: `*.test.ts` or `*.test.tsx` (see [docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md)).
- Mirror `src/` concerns where practical (`tests/components/` ↔ `src/components/`).
