# Migration Changelog

## 2026-03-22

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
