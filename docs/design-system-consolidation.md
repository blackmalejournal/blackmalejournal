# Design System Consolidation (ADR-2026-03)

**Date:** 2026-03-16
**Status:** SUPERSEDED
**Previous status:** PROPOSED

## Summary

This document previously proposed migrating The Black Male Journal from its local
brand tokens in `src/styles/brand.css` to a shared external token package. That
proposal is no longer the direction for BMJ.

BMJ operates as an independent organization and keeps its design system in-repo:
- `src/styles/brand.css` remains the runtime source of truth
- `src/styles/globals.css` imports the local BMJ tokens
- `tailwind.config.ts` mirrors the BMJ brand tokens
- `docs/brand/invariants.md` defines the brand guardrails

The vendored design-system subtree that once lived inside this repository has
been removed because it was not part of the BMJ runtime and created unnecessary
coupling in tests, docs, and repository structure.

## Decision

BMJ does not adopt a shared external token package as part of the current
application architecture.

Any future move to an external token package requires:
1. An explicit architectural decision.
2. Proof that every BMJ token maps exactly without visual drift.
3. Updated tests and docs showing the migration is fully independent from
   historical shared-workstream artifacts.

Until that happens, BMJ remains on its local brand-token system.

## Why This Was Superseded

The original proposal became a liability because:
- it documented a dependency direction BMJ did not actually use
- the vendored subtree was not a runtime dependency
- the subtree leaked into repository maintenance, especially test scope and docs
- BMJ now needs clean organizational and architectural separation from legacy
  shared-workstream artifacts

## Current Rule

Use BMJ local brand tokens only:
- `src/styles/brand.css`
- `src/styles/globals.css`
- `tailwind.config.ts`
- `docs/brand/invariants.md`

Do not introduce a shared external token package into BMJ without a new approved
ADR.
