---
title: Documentation folder overview
status: reference
audience: [contributors, agents]
last-verified: 2026-03-31
---

# Documentation

This folder contains the committed BMJ documentation set. Start with [INDEX.md](INDEX.md) for the full map.

**Naming:** Markdown and directory naming for `docs/` is defined in [CONTRIBUTING.md](CONTRIBUTING.md) (File naming — documentation).

## Primary References

- [BMJ-SSOT.md](BMJ-SSOT.md) for the **single comprehensive SSOT** (vision, roadmap, where truth lives). Legacy alias: [bmj-platform-brief.md](bmj-platform-brief.md).
- [DEVELOPER.md](DEVELOPER.md) for local development, test, and deployment workflow.
- [ARCHITECTURE.md](ARCHITECTURE.md) for system design, data flow, schema, and integration patterns.
- [CONTRIBUTING.md](CONTRIBUTING.md) for code style, PR process, naming conventions, and testing.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and fixes.
- [DEFERRALS.md](DEFERRALS.md) for external setup and launch dependencies outside the codebase.

## Lanes

Entry points for each subtree (see also [ARCHITECTURE.md](ARCHITECTURE.md) — *Repository layout — monorepo root*).

- [audits/README.md](audits/README.md) — audit references and archive.
- [brand/README.md](brand/README.md) — visual identity, art direction, palette references.
- [metrics/README.md](metrics/README.md) — compliance dashboard schema (REP).
- [ops/README.md](ops/README.md) — operating procedures, environment checks, release runbooks.
- [policy/README.md](policy/README.md) — formal policy outlines (REP).
- [roadmaps/README.md](roadmaps/README.md) — REP rollout and org-enablement roadmaps.
- [ssot-bmj/README.md](ssot-bmj/README.md) — reference archive (mirrored notes/prompts); live program SSOT is [BMJ-SSOT.md](BMJ-SSOT.md).
- [superpowers/README.md](superpowers/README.md) — implementation plans, specs, and prompt assets.
- [templates/README.md](templates/README.md) — copy-ready templates for other repos.

## Repository governance (reference)

Reusable **Repo Excellence Program (REP)** standards and modules: [standards/README.md](standards/README.md). **Agents / context hygiene:** [standards/agent-knowledge-protocol.md](standards/agent-knowledge-protocol.md) (tiers A–D, conflict order). **Doc counts:** `npm run docs:inventory` from repo root. **Near-duplicate scan:** `npm run docs:duplicate-audit` (heuristic; optional `--fail`). **CI sample:** `npm run docs:duplicate-audit:ci`. **Policy** and **roadmaps** lanes above hold Legal/org rollout artifacts; **metrics** holds dashboard schema.

Also listed in [INDEX.md](INDEX.md) § *Repository standards and governance*; quick VP briefing: [standards/repo-governance-exec-readout.md](standards/repo-governance-exec-readout.md). These artifacts are **not** BMJ-specific product requirements unless adopted explicitly.
