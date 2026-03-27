---
name: bmj-content-authoring
description: Use when creating content records, managing the editorial pipeline, working with status workflows, or seeding the database. Triggers on "new article", "create briefing", "dispatch", "seed data", "editorial workflow", "publish", "draft".
---

# BMJ Content Authoring

How content is structured, created, and moved through the editorial pipeline.

## Content Types

| Type | Schema | Key Fields | Seed File |
|------|--------|------------|-----------|
| Article | `src/lib/supabase/types.ts` | title, slug, lens, tags[], excerpt, body, access_tier, status, author, cover_image, published_at | `scripts/seed-all.ts` |
| Briefing | `src/lib/supabase/types.ts` | title, slug, issue_number, sections[{title,body}], access_tier, status, cover_image, published_at | `scripts/seed-all.ts` |
| Dispatch | `src/lib/supabase/types.ts` | title, slug, body, access_tier, status, published_at | `supabase/seed-dispatches.sql` |
| Handbook | `src/lib/supabase/types.ts` | title, slug, description, body, access_tier, status, cover_image | `supabase/seed-handbooks.sql` |
| Download | `src/lib/supabase/types.ts` | title, slug, description, file_url, category, access_tier | `supabase/seed-downloads.sql` |
| Course | `src/lib/supabase/types.ts` | title, slug, description, access_tier, status | `supabase/seed-courses.sql` |
| Lesson | `src/lib/supabase/types.ts` | title, slug, body, course_id, order, access_tier | `supabase/seed-lessons.sql` |

## Status Workflow

```
draft → review → scheduled → published → archived → withdrawn
```

- **draft**: Work in progress, not visible to public
- **review**: Ready for editorial review
- **scheduled**: Approved, `published_at` set in future
- **published**: Live on the site
- **archived**: Removed from listings but accessible via direct URL
- **withdrawn**: Fully hidden

## Lenses

Every article must have exactly one lens:
`health | politics | culture | entertainment | business`

Use `getLensTheme(lens)` for UI styling. Never hardcode lens colors.

## Creating Content via CLI

Use the Claude commands:
- `/new-article` — generates SQL INSERT for articles table
- `/new-briefing` — generates SQL INSERT for Weekend Briefing table

## Seeding the Database

```bash
npx tsx scripts/seed-all.ts    # All tables (delete + insert, clean slate)
npx tsx scripts/seed.ts         # Articles only (upsert, non-destructive)
```

SQL seeds in `supabase/seed-*.sql` for individual tables.

## Author Default

All content defaults to `author: "The Chairman"` — sole author for now.

## Slugs

Format: kebab-case. Examples: `weekend-briefing-001`, `the-discipline-of-documentation`

Must be unique per content type. Used in URLs.
