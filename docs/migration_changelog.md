# Migration Changelog

## 2026-03-22

- Added `docs/ops/launch-dashboard-checklist.md` as the exact dashboard-by-dashboard runbook for Vercel, DNS, Supabase, Stripe, Resend, and Plausible during the final BMJ launch pass.
- Updated `docs/ops/README.md`, `docs/ops/launch-checklist.md`, `docs/ops/release-sequence.md`, `docs/deferrals.md`, and `docs/INDEX.md` to point to the new launch dashboard runbook.
- Added `docs/audits/2026-03-22-release-readiness-and-env-audit.md` to capture BMJ release-gate results plus the verified Vercel env, deployment, and domain state.
- Updated `docs/audits/README.md` and `docs/INDEX.md` to index the release-readiness audit note.
- Verified the repo release gates pass: secrets scan, lint, TypeScript, Jest coverage, production build, and Playwright E2E.
- Verified that the first Playwright pass was hanging on a stale local Node process already bound to port `3000`; after clearing it, `npm run test:e2e` passed cleanly.
- Verified via Vercel CLI that BMJ currently lacks Stripe, Resend, Plausible, and custom-domain launch configuration in the linked Vercel project.
- Added `docs/superpowers/plans/2026-03-22-bmj-skill-batch-build-plan.md` to define the parallel BMJ skill scaffolding, authoring waves, and validation gates.
- Updated `docs/superpowers/plans/README.md` and `docs/INDEX.md` to index the BMJ skill batch build plan.
- Refined `docs/superpowers/plans/2026-03-22-bmj-skill-workflow.md` after deeper repo review so the BMJ skill model now tracks the actual platform surfaces: public editorial, membership/paywall, admin CMS, audience ops, and release governance.
- Added `docs/superpowers/plans/2026-03-22-bmj-skill-workflow.md` to define a BMJ-specific Codex workflow and the first custom skill roadmap for this platform.
- Updated `docs/superpowers/plans/README.md` and `docs/INDEX.md` to index the new BMJ skill workflow plan.
- Ran the `archive-manager` workflow manually because `ops/consolidation_toolbox.py` is not present in this repository.
- Verified that this repository currently has no `archive/` or `_archive/` lane, so there are no duplicate filenames to reconcile between `docs/` and archived documentation.
- Ran the `information-consolidation` workflow against the committed docs set using the skill-bundled `icf_pipeline.py`.
- Rejected the initial all-files package because binary brand assets were auto-merged as duplicates, then re-ran on a Markdown-only input snapshot under `artifacts/information-consolidation/docs-markdown-2026-03-22/input`.
- Produced the accepted canonical package at `artifacts/information-consolidation/docs-markdown-2026-03-22/package` with `34` records, `34` entities, and zero duplicate, conflict, or integrity findings.
- Added `docs/audits/2026-03-22-docs-information-consolidation.md` plus audits-lane links to the accepted package and the superseded exploratory run.
- Ran the `audits-collector` workflow manually because `ops/consolidation_toolbox.py` is not present in this repository.
- Created `docs/audits/README.md` to establish the missing audits lane and index current audit references without moving source docs.
- Updated `docs/README.md` and `docs/INDEX.md` to include the audits lane.
- Ran the `doc-auditor` workflow manually because `ops/consolidation_toolbox.py` is not present in this repository.
- Verified that `docs/` contains no open placeholder markers.
- Verified README coverage for all current `docs/` subdirectories.
- Fixed a broken internal link in `docs/ops/env-audit.md` so the auth callback route points to `src/app/(auth)/auth/callback/route.ts`.
- Re-ran an internal relative-link validation pass across Markdown files in `docs/`.

## 2026-03-21

- Ran the documentation audit manually because `ops/consolidation_toolbox.py` is not present in this repository.
- Verified that `docs/` contains no open placeholder markers.
- Replaced dead `/mnt/c/...` filesystem links in operations docs with repo-relative links.
- Added `docs/INDEX.md` plus README coverage for `docs/`, `docs/brand/`, `docs/ops/`, `docs/superpowers/`, `docs/superpowers/plans/`, and `docs/superpowers/prompts/`.
- Re-ran a relative-link validation pass after the fixes.
