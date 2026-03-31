---
type: normative
authority: canonical
audience: [agents, contributors]
last-verified: 2026-03-31
---

# AGENTS -- The Black Male Journal Governance

> **Status: Normative.** Do not modify without explicit review.

This project follows the **Morphism Categorical Governance Framework**.

## Governance Source

| Authority | Location |
|-----------|----------|
| Root governance | [AGENTS.md](AGENTS.md) (this file) |
| Project instructions | [CLAUDE.md](CLAUDE.md) |
| Brand invariants | [docs/brand/invariants.md](docs/brand/invariants.md) |
| Operations | [docs/ops/](docs/ops/) |
| Repository governance reference | [docs/standards/README.md](docs/standards/README.md) (optional; use for cross-repo/platform alignment) |

## Scope

This file governs the blackmalejournal repository -- a Next.js 16 web application for The Black Male Journal media platform, deployed on Vercel with Supabase backend.

| Directory | Governance Level | Notes |
|-----------|-----------------|-------|
| `src/app/` | **Application** | Next.js App Router -- routes, layouts, API |
| `src/components/` | **UI** | Brand components, content cards, layout |
| `src/lib/` | **Library** | Supabase queries, Stripe config, utilities |
| `src/styles/` | **Brand** | CSS custom properties, globals -- brand SSOT |
| `supabase/` | **Database** | Migrations, seed data, config |
| `tests/` | **Testing** | Jest + Playwright — [`tests/README.md`](tests/README.md) |
| `docs/` | **Documentation** | Operations, brand, audits |
| `public/` | **Assets** | Logos, fonts, images |
| `scripts/` | **Automation** | Seed scripts, utilities |

## Seven Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| I-1 | One Truth Per Domain | `src/styles/brand.css` is SSOT for brand tokens; `docs/ops/env-vars.md` is SSOT for env vars |
| I-2 | Drift Is Debt | Brand tokens in `tailwind.config.ts` must mirror `brand.css`; run `/brand-check` |
| I-3 | Observability | Log what changed, why, who, when -- conventional commits required |
| I-4 | Scope Binding | Changes must have clear, narrow boundaries -- one logical unit per commit |
| I-5 | Entropy Monotonicity | Do not increase complexity without explicit justification |
| I-6 | Refusal as Structure | Refuse scope creep -- no "while we're at it" changes |
| I-7 | Minimal Authority | Fewest permissions needed; server-only secrets never get NEXT_PUBLIC_ prefix |

## Protocol

1. Read CLAUDE.md and brand invariants before structural changes
2. State the one thing you are building
3. Verify the path (which files, which routes)
4. Execute incrementally
5. Refuse scope creep

**Deeper layout (repo root, `docs/` lanes, tooling paths):** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — *Repository layout — monorepo root*. Optional on-disk snapshot: `npm run docs:layout`.

See [CLAUDE.md](CLAUDE.md) for brand constraints, validation commands, content model, and architecture rules.
