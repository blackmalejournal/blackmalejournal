# Placeholder Tracking

All temporary placeholder assets in the codebase. Every entry must have a replacement deadline.
Review this document weekly. Remove entries as they are replaced.

## Policy

- Chairman's photos: acceptable as temporary assets if processed through TreatedImage portrait variant
- Chairman's excerpts: acceptable as owned editorial content when attributed
- All placeholders must be replaced within 90 days of addition
- Alt text required on all placeholder images (descriptive, not "placeholder")
- Mark placeholder content in code with `{/* PLACEHOLDER: Replace with final copy */}`

## Active Placeholders

| File | Source | Date Added | Replacement Deadline | Status |
|------|--------|------------|---------------------|--------|
| `public/placeholder-cover.svg` | Custom branded SVG (book/star motif) | Pre-launch | Permanent (intentional fallback) | Retained |
| `supabase/seed-*.sql` | Seed data (test articles, briefings, etc.) | Pre-launch | Replace with real content before launch | Pending |
| Social links in `src/components/layout/Footer.tsx` | `#` href placeholders | Pre-launch | Replace when social accounts created | Pending |
| Social links in `src/app/(public)/contact/page.tsx` | `#` href placeholders | Pre-launch | Replace when social accounts created | Pending |
| `sameAs: []` in `src/lib/seo.ts` | Empty array | Pre-launch | Replace when social accounts created | Pending |

## Replaced Placeholders

| File | Original Source | Date Added | Date Replaced | Replaced With |
|------|----------------|------------|---------------|---------------|
| (none yet) | | | | |
