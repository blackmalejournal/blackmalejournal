# Migration Changelog

## 2026-03-25

- Added `docs/audits/2026-03-25-codebase-audit.md` and `docs/audits/2026-03-25-codebase-audit-remediation-plan.md`, and updated `docs/audits/README.md` plus `docs/INDEX.md` so the audit outputs are discoverable.
- Added `tests/lib/admin-queries-remediation.test.ts` to raise coverage on previously sparse admin query branches and failure paths.
- Refactored `src/lib/supabase/admin-queries.ts` into domain modules under `src/lib/supabase/admin-queries/` while preserving the existing import surface through a barrel export.
- Introduced a centralized `PATHS` constant map in `src/lib/paths.ts` and migrated core route literals in auth, admin auth guards, navigation, proxy, sitemap, and not-found flows.
- Attempted `python ops/consolidation_toolbox.py doc-auditor` for closeout docs hygiene; the toolbox is absent in this repository, so README coverage and new-doc path checks were run manually as fallback.
- Added `docs/superpowers/plans/2026-03-25-admin-command-center-roadmap.md` to capture the remaining admin-owner roadmap, batch order, and repo-native versus externally blocked platform work.
- Added `docs/superpowers/prompts/bmj-admin-command-center-superprompt.md` as the reusable prompt for autonomous BMJ admin command-center execution.
- Updated `docs/superpowers/plans/README.md`, `docs/superpowers/prompts/README.md`, and `docs/INDEX.md` to index the new admin roadmap and prompt artifacts.
- Upgraded `/admin` from a count-only dashboard into an owner command center with attention queue, publishing queue, editorial pipeline health, audience and billing summaries, and linked admin coverage cards.
- Added a new server-side admin insight layer in `src/lib/admin-insights.ts` and `src/lib/supabase/admin-queries.ts` for publishing backlog, inbox pressure, member billing exceptions, and subscriber growth/source intelligence.
- Upgraded `/admin/members`, `/admin/messages`, and `/admin/subscribers` with operational metric cards so the owner can see billing exceptions, message backlog, overdue response pressure, subscriber growth, churn, and source mix without leaving the page.
- Updated `docs/ops/chairman-operator-manual.md`, `docs/ops/member-billing-sop.md`, and `docs/ops/inbox-subscriber-sop.md` to reflect the new command-center-first operator workflow and the new billing, inbox, and subscriber summary surfaces.
- Added `tests/lib/admin-insights.test.ts` and refreshed `tests/pages/admin-dashboard.test.tsx` to cover the new admin insight logic and command-center rendering.
- Deleted stray untracked repo-root helper files that were not part of BMJ delivery: `.blackboxrules`, `claude-code-guide.jsx`, and `claude-code-superprompt.jsx`.
- Added `src/lib/admin-list-filters.ts` plus richer search and filter workflows across `/admin/articles`, `/admin/briefings`, `/admin/dispatches`, `/admin/handbooks`, and `/admin/downloads`.
- Extended server-side content queries in `src/lib/supabase/admin-queries.ts` so content desks can search by title or slug or excerpt or description and combine those searches with status, lens, category, and tier filters.
- Added `tests/pages/admin-handbooks.test.tsx` and refreshed the article, briefing, dispatch, and download admin page tests so the new content-desk search and filter workflows are covered.
- Updated `docs/superpowers/plans/2026-03-25-admin-command-center-roadmap.md` and `docs/ops/publishing-sop.md` to reflect the newly shipped content-desk search and filtering batch.
- Added `src/lib/admin-publishing.ts` plus `src/components/admin/PublishReadinessBadge.tsx` so BMJ content desks can score publish readiness and surface blocked or warning states inline.
- Extended `/admin` with recent editorial activity and updated the article, briefing, dispatch, handbook, and download desks with publish-readiness summary cards and row-level readiness callouts.
- Added `tests/lib/admin-publishing.test.ts` and refreshed `tests/lib/admin-insights.test.ts`, `tests/pages/admin-dashboard.test.tsx`, and the content-desk page tests to cover readiness logic and recent activity rendering.
- Updated `docs/superpowers/plans/2026-03-25-admin-command-center-roadmap.md` and `docs/ops/publishing-sop.md` so the remaining admin backlog now narrows to editorial audit trails and external platform parity.
- Added `src/lib/admin-publish-time.ts` plus `src/components/admin/PublishScheduleField.tsx` so BMJ admin content forms can finally set explicit UTC publish timestamps instead of leaving scheduled or published timing implicit.
- Added `src/components/admin/EditorialAuditPanel.tsx` and upgraded the article, briefing, dispatch, handbook, and download edit routes with owner audit panels that surface lifecycle timing, readiness issues, verification checks, and public or protected route links.
- Added `tests/lib/admin-publish-time.test.ts`, `tests/pages/admin-handbook-form.test.tsx`, and `tests/pages/admin-handbook-pages.test.tsx`, and refreshed the existing content form and edit-page tests to cover the new publish-time controls and owner audit surfaces.
- Updated `docs/superpowers/plans/2026-03-25-admin-command-center-roadmap.md`, `docs/ops/publishing-sop.md`, and `docs/ops/chairman-operator-manual.md` to reflect the new explicit publish-time workflow and edit-route audit verification step.
- Added `supabase/migrations/20260325193000_create-admin-activity-log.sql` and extended `src/lib/supabase/types.ts` so BMJ now has a durable `admin_activity_log` table and typed row coverage for content-owner history.
- Added `createAdminActivityLogEntry()` and `getAdminActivityLogForEntity()` in `src/lib/supabase/admin-queries.ts`, then wired the article, briefing, dispatch, handbook, and download create, update, and delete actions to persist operator history after successful mutations.
- Upgraded `src/components/admin/EditorialAuditPanel.tsx` and the five content edit routes so the owner audit surface now shows persisted recent activity instead of only inferred lifecycle data.
- Added `tests/lib/admin-activity.test.ts`, refreshed `tests/lib/admin-queries.test.ts`, and updated the content edit-page test suites to cover persisted admin activity rendering and log-query behavior.
- Updated `docs/superpowers/plans/2026-03-25-admin-command-center-roadmap.md`, `docs/ops/publishing-sop.md`, and `docs/ops/chairman-operator-manual.md` so the remaining BMJ admin backlog now moves past audit persistence and toward bulk desk actions, owner notes, and external telemetry parity.
- Added `src/lib/admin-bulk-actions.ts`, `src/components/admin/AdminBulkActionForm.tsx`, and `src/components/admin/AdminNotice.tsx` so the BMJ content desks now support branded batch actions with visible operator feedback instead of one-record-at-a-time queue cleanup.
- Extended `src/lib/supabase/admin-queries.ts` with bulk article, briefing, dispatch, handbook, and download mutation helpers that keep service-role writes on the server and preserve existing publish-time behavior.
- Wired bulk status actions into `/admin/articles`, `/admin/briefings`, `/admin/dispatches`, and `/admin/handbooks`, plus bulk access-tier changes into `/admin/downloads`, and logged those batch mutations into `admin_activity_log`.
- Added `tests/components/admin-bulk-action-form.test.tsx` and refreshed `tests/lib/admin-queries.test.ts` plus the five content-desk page suites to cover the new bulk operator workflow.
- Updated `docs/superpowers/plans/2026-03-25-admin-command-center-roadmap.md`, `docs/ops/publishing-sop.md`, and `docs/ops/chairman-operator-manual.md` so the remaining BMJ admin backlog now narrows past bulk desk actions to owner notes, handoff context, and external telemetry parity.

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
