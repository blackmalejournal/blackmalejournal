# Scripts

Node and TypeScript utilities run from the **repository root**. They complement `package.json` scripts and Supabase SQL seeds under `supabase/`.

## Verification and tooling (npm)

| Script file | npm command | Purpose |
|-------------|-------------|---------|
| `verify-ssot-bmj.mjs` | `npm run verify:ssot-bmj` | Ensures mirrored BMJ SSOT docs under `docs/ssot-bmj/` match expectations (layout, naming). |
| `verify-docs-links.mjs` | `npm run verify:docs-links` | Validates **relative** Markdown links under `docs/` (skips `docs/templates/`). Used in CI. |
| `rep-governance-verify.mjs` | `npm run verify:rep-governance` | **REP:** Issue Form files on disk; locally can also check GitHub labels via `gh` (see [docs/DEVELOPER.md](../docs/DEVELOPER.md) — *Optional: REP governance verification*). |
| `jest-test-counts.mjs` | `npm run test:counts` | Runs Jest with JSON output to print suite/test totals for `README.md` / `CLAUDE.md`. |
| `print-repo-layout.mjs` | `npm run docs:layout` | Prints a shallow tree of key directories (override depth: `--depth=4`). |

Run any `.mjs` directly with `node scripts/<name>.mjs` if needed.

## Database seeding (TypeScript)

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and **`SUPABASE_SERVICE_ROLE_KEY`** (service role bypasses RLS — never expose client-side).

| Script file | Command | Purpose |
|-------------|---------|---------|
| `seed-all.ts` | `npx tsx scripts/seed-all.ts` | Seeds **all** scripted tables (articles, briefings, dispatches, courses, etc.). |
| `seed.ts` | `npx tsx scripts/seed.ts` | Heavier **articles** upsert path (see file header for scope). |

**SQL seeds:** `supabase/seed-*.sql` run with local Supabase workflows — see [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) and [CLAUDE.md](../CLAUDE.md) (Database / seeding).

## Related docs

- [docs/DEVELOPER.md](../docs/DEVELOPER.md) — full dev workflow and REP verify note.
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) — *Repository layout — monorepo root*.
