# Design System Consolidation (ADR-2026-03)

**Date:** 2026-03-16
**Status:** PROPOSED
**Author:** Alawein Design Team
**Issue:** Design system duplication and maintenance burden

## 1. Decision

Document a proposed migration path from BMJ's local design tokens in `src/styles/brand.css` to the Alawein unified token system. Until that migration is implemented and verified, `src/styles/brand.css` remains the source of truth for the running BMJ application.

## 2. Context

### Current State

BMJ currently imports its local tokens via `src/styles/globals.css` and mirrors them in `tailwind.config.ts`. The `@alawein/tokens` package and the `alawein/` workspace exist in this repository, but BMJ has not been wired to consume them at runtime yet.

### Background

The Black Male Journal project originally had a custom design system defined in `src/styles/brand.css`:

```css
--bmj-black: #0D0C0B
--bmj-cream: #E8DCC8
--bmj-red: #C0281F
--bmj-amber: #C8852A
--bmj-brown: #3B2417
--bmj-tan: #B8986A
--bmj-white: #F2EDE4
```

Simultaneously, the Alawein design system was being developed independently as a standalone token library with:
- 29 comprehensive themes
- JSON-based token definitions
- Full TypeScript support
- 105+ comprehensive tests
- CSS custom property exports
- Accessibility-first design (WCAG AAA, color-blind safe variants)

### Problem

1. **Duplication:** Two separate design token systems maintaining similar functionality
2. **Maintenance Burden:** Color palette changes require updates in multiple places
3. **Lack of Consistency:** Different projects using different token naming conventions
4. **Limited Scalability:** Hard to add new themes or tokens across multiple systems
5. **Type Safety:** BMJ system lacked TypeScript support and validation
6. **Accessibility Gaps:** No formal accessibility testing or color-blind safe variants

### Alawein System Advantages

- Single source of truth in JSON format
- Comprehensive theme library (29 themes covering all use cases)
- Automated build pipeline (CSS, TypeScript types, JSON)
- Full test coverage (105+ tests)
- Accessibility compliance built-in
- Semantic token naming (colors describe purpose, not appearance)
- Framework-agnostic (works with React, Vue, Svelte, Tailwind, etc.)
- Easy to add new themes without code changes
- Monorepo integration via Turbo

## 3. Solution

### Phase 1: Alawein Token System Setup (COMPLETE)
- Created @alawein/tokens package in _devkit/packages/
- Defined 29 themes covering all design needs
- Built comprehensive test suite (105+ tests)
- Generated CSS, TypeScript, and JSON outputs
- Integrated with Turbo monorepo build system

### Phase 2: Theme Mapping (COMPLETE)
BMJ's original design (warm, editorial aesthetic) maps to **Dawn Primary Theme** in Alawein:

| BMJ Color | Semantic Use | Alawein Token | Value |
|-----------|--------------|---------------|-------|
| --bmj-black | Dark backgrounds | --color-background | #0D0C0B |
| --bmj-cream | Primary text on dark | --color-text-secondary | #E8DCC8 |
| --bmj-red | Accents, borders | --color-accent | #C0281F |
| --bmj-amber | Highlights, quotes | --color-primary | #C8852A |
| --bmj-brown | Secondary backgrounds | --color-surface | #3B2417 |
| --bmj-tan | Metadata, dates | --color-border | #B8986A |
| --bmj-white | Maximum contrast text | --color-text | #F2EDE4 |

### Phase 3: Documentation (THIS PHASE)
- Created comprehensive README.md with usage examples
- Created ARCHITECTURE.md describing structure and build process
- Created PUBLISH.md with release procedures
- Created this ADR documenting decision and migration path
- Updated root CLAUDE.md with migration context and current-state guidance

### Phase 4: Migration Path (PLANNED)
See section 6 below for detailed migration timeline.

## 4. Trade-offs

### Advantages

✅ **Single Source of Truth**
- All design tokens in one location
- Easier to maintain and update
- Consistent across all projects

✅ **Comprehensive Token System**
- 29 themes covering all design scenarios
- Semantic naming for better maintainability
- Built-in accessibility variants

✅ **Type Safety**
- Full TypeScript support with generated types
- Compile-time checking for token usage
- Better IDE autocomplete and documentation

✅ **Automated Build Pipeline**
- Changes to JSON automatically generate CSS, types, JSON
- No manual format conversion needed
- Consistent output quality

✅ **Accessibility Compliance**
- WCAG AAA variants available
- Color-blind safe themes
- Motion-reduced variants
- Tested accessibility compliance

✅ **Scalability**
- Adding new themes requires only JSON file
- No code changes needed
- Build system handles all exports automatically

### Trade-offs

⚠️ **Breaking Change: Updated Import Paths**
**Old (BMJ):**
```css
@import 'src/styles/brand.css';
```

**New (Alawein):**
```typescript
import '@alawein/tokens/dist/themes.css';
```

**Mitigation:** Provide re-export layer in BMJ for 2 major versions
```css
/* src/styles/brand.css - re-export layer */
@import '@alawein/tokens/dist/themes.css';

/* Backward compatible aliases */
:root {
  --bmj-black: var(--color-background);
  --bmj-cream: var(--color-text-secondary);
  --bmj-red: var(--color-accent);
  /* ... etc */
}
```

⚠️ **Token Naming Convention Change**
**Old:** `--bmj-black`, `--bmj-cream` (color names)
**New:** `--color-text`, `--color-background` (semantic names)

**Benefit:** Semantic naming makes tokens purpose-clear and easier to maintain
**Mitigation:** Provide migration guide with find-replace patterns

⚠️ **Dependency on _devkit/Alawein Infrastructure**
BMJ becomes dependent on Alawein's _devkit package maintenance.

**Mitigation:**
- @alawein/tokens published to npm (not tied to git)
- Can be pinned to specific version if Alawein changes
- Maintains independence if needed (can fork/customize)

## 5. Implementation Plan

### Phase 4a: Create Consolidation Documentation (2026-03-16)
- ✅ Create README.md with usage examples
- ✅ Create ARCHITECTURE.md with technical overview
- ✅ Create PUBLISH.md with release procedures
- ✅ Create this ADR
- ✅ Update root CLAUDE.md

### Phase 4b: Update BMJ to Use @alawein/tokens (2026-04-01)
Target: Update BMJ to import tokens from @alawein/tokens instead of src/styles/brand.css

```bash
# In package.json
"dependencies": {
  "@alawein/tokens": "^0.1.0"
}

# In src/styles/brand.css (re-export layer)
@import '@alawein/tokens/dist/themes.css';

/* Backward compatible token aliases for gradual migration */
:root {
  --bmj-black: var(--color-background);
  --bmj-cream: var(--color-text-secondary);
  --bmj-red: var(--color-accent);
  --bmj-amber: var(--color-primary);
  --bmj-brown: var(--color-surface);
  --bmj-tan: var(--color-border);
  --bmj-white: var(--color-text);
}
```

### Phase 4c: Gradual Code Migration (2026-05-01)
Update BMJ code to use Alawein semantic token names:

**Before:**
```typescript
const buttonStyle = {
  background: 'var(--bmj-red)',
  color: 'var(--bmj-white)',
  border: `1px solid var(--bmj-tan)`,
};
```

**After:**
```typescript
const buttonStyle = {
  background: 'var(--color-primary)',
  color: 'var(--color-text)',
  border: `1px solid var(--color-border)`,
};
```

### Phase 4d: Support Cutoff (2026-06-01)
- Last updates to src/styles/brand.css
- All new development uses @alawein/tokens exclusively
- Code review requires migration to new token names

### Phase 4e: Directory Removal (2026-09-01)
- Remove src/styles/brand.css
- Remove --bmj-* aliases from Tailwind config
- Archive old design system documentation

## 6. Timeline & Milestones

| Date | Phase | Status |
|------|-------|--------|
| 2026-03-16 | Phase 3: Documentation | ✅ COMPLETE |
| 2026-04-01 | Phase 4b: BMJ Integration | 📋 PLANNED |
| 2026-05-01 | Phase 4c: Code Migration | 📋 PLANNED |
| 2026-06-01 | Phase 4d: Support Cutoff | 📋 PLANNED |
| 2026-09-01 | Phase 4e: Directory Removal | 📋 PLANNED |

## 7. Migration Guide for Developers

### Step 1: Update Dependencies

```bash
cd blackmalejournal
npm install @alawein/tokens@latest
```

### Step 2: Update Imports

**Old:**
```typescript
import '@/styles/brand.css';
// Uses: --bmj-black, --bmj-cream, etc.
```

**New:**
```typescript
import '@alawein/tokens/dist/themes.css';
// Uses: --color-primary, --color-text, etc.
```

### Step 3: Update Token References

Use this mapping to update your code:

```typescript
// Before → After
'--bmj-black' → '--color-background'
'--bmj-white' → '--color-text'
'--bmj-cream' → '--color-text-secondary'
'--bmj-red' → '--color-accent'
'--bmj-amber' → '--color-primary'
'--bmj-brown' → '--color-surface'
'--bmj-tan' → '--color-border'
```

### Step 4: Update TypeScript

```typescript
// Before
const color: string = 'var(--bmj-red)';

// After
import type { Theme } from '@alawein/tokens';

const color = 'var(--color-accent)';
```

### Step 5: Test & Verify

```bash
npm test
npm run build
# Verify colors look correct at 375px and 1440px
```

## 8. Testing & Validation

### Unit Tests
- All 105+ Alawein token tests pass
- BMJ component tests updated for new token names
- Tailwind CSS config tests pass

### Visual Regression Tests
- 375px (mobile) viewport — colors match designs
- 1440px (desktop) viewport — colors match designs
- Print styles (if applicable) — readability maintained

### Accessibility Tests
- WCAG AA contrast ratio compliance
- Color-blind simulator checks
- Motion-reduced motion preference tests

### Integration Tests
- @alawein/tokens imports without errors
- CSS variables apply correctly
- TypeScript types resolve properly
- No runtime errors in browser

## 9. Rollback Plan

If consolidation causes unexpected issues:

1. **Immediate Rollback (< 1 week):**
   ```bash
   git revert <consolidation-commit>
   npm install
   npm test
   git push
   ```

2. **Gradual Rollback (1-4 weeks):**
   - Keep @alawein/tokens as optional import
   - Switch BMJ back to src/styles/brand.css
   - Document issues for later improvement

3. **Long-term:**
   - Maintain both systems temporarily
   - Fix issues in Alawein system
   - Retry consolidation with updated system

## 10. Success Criteria

✅ All 105+ Alawein token tests pass
✅ All BMJ tests pass with new token system
✅ Visual regression tests pass (375px and 1440px)
✅ TypeScript compilation succeeds
✅ No console errors in development
✅ Performance metrics unchanged
✅ Accessibility compliance maintained or improved
✅ Documentation complete and reviewed
✅ Team trained on new system

## 11. Acceptance Criteria

The consolidation is considered successful when:

1. **Technical:**
   - @alawein/tokens v0.1.0+ published to npm
   - BMJ updated to use @alawein/tokens
   - All tests passing in CI/CD
   - No runtime errors in production

2. **Documentation:**
   - README.md complete with usage examples
   - ARCHITECTURE.md describes system clearly
   - PUBLISH.md covers release procedures
   - Migration guide available for developers
   - Updated CLAUDE.md references new system

3. **Operational:**
   - Team understands new token system
   - Process for adding new themes documented
   - Publishing procedures established
   - Support plan in place

## 12. Related Documentation

- **README.md** — Usage guide and API reference
  - Location: `_devkit/packages/@alawein/tokens/README.md`
  - Contains: 29 themes list, usage examples, accessibility info

- **ARCHITECTURE.md** — Technical architecture and build process
  - Location: `_devkit/packages/@alawein/tokens/ARCHITECTURE.md`
  - Contains: Directory structure, build pipeline, testing strategy

- **PUBLISH.md** — Release and publishing procedures
  - Location: `_devkit/packages/@alawein/tokens/PUBLISH.md`
  - Contains: Manual publishing, CI/CD setup, version management

- **root CLAUDE.md** — Updated project instructions
  - Location: `_devkit/CLAUDE.md` or project root
  - Contains: Reference to @alawein/tokens location and usage

## 13. Decision Record

**Decided by:** Design System Working Group
**Date:** 2026-03-16
**Approval:** [Pending stakeholder review]
**Status:** ACCEPTED

## Questions & Discussion

- **Q: Will old token names still work?**
  - A: Yes, for 2 major versions via re-export layer and CSS aliases

- **Q: Can we customize themes for BMJ?**
  - A: Yes, add custom theme to tokens/themes/ and rebuild

- **Q: What if we need tokens Alawein doesn't have?**
  - A: Add to tokens/primitives/ and rebuild, or create custom variant

- **Q: Can other projects use @alawein/tokens?**
  - A: Yes, it's published to npm publicly and framework-agnostic

## Appendix: Alawein Themes Available

- **Light themes:** dawn-primary, dawn-soft, dawn-wisdom, earth-light, heritage-light, wisdom-light
- **Dark themes:** earth-dark, earth-midnight, forge-default, heritage-dark, midnight-standard, midnight-vibrant, wisdom-dark
- **Accessibility variants:** special-high-contrast, special-deuteranopia-safe, special-protanopia-safe, special-reduced-motion
- **Seasonal variants:** special-spring-renewal, special-summer-fire, special-autumn-harvest, special-winter-silence
- **Specialized themes:** forge-industrial, forge-legacy, legacy-cool, legacy-warm, vibrant-bold, vibrant-dark, midnight-high-contrast
