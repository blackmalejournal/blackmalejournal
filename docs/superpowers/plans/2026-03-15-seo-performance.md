# SEO & Performance Optimization — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make The Black Male Journal fully discoverable by search engines and social platforms, with proper structured data, sitemaps, accessibility, and performance optimization.

**Architecture:** Add SEO utilities in `src/lib/seo.ts` for JSON-LD schema builders and site constants. Enhance root layout metadata with full OG/Twitter defaults. Add `sitemap.ts` and `robots.ts` as App Router route handlers. Upgrade every page's metadata to include OpenGraph + Twitter cards. Add accessibility fundamentals (skip link, focus styles, heading fixes).

**Tech Stack:** Next.js 14 Metadata API, JSON-LD (schema.org), `next/og` ImageResponse (future — not in scope), Tailwind CSS for a11y styles.

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/lib/seo.ts` | Site constants (URL, name, description), JSON-LD builders for Organization + Article + BreadcrumbList |
| Create | `src/app/sitemap.ts` | Dynamic sitemap.xml with all public routes, articles, briefings, courses, dispatches |
| Create | `src/app/robots.ts` | robots.txt allowing all crawlers, pointing to sitemap |
| Modify | `src/app/layout.tsx` | Expand root metadata (OG, Twitter, metadataBase), add Organization JSON-LD, add skip-to-content link |
| Modify | `src/app/(public)/page.tsx` | Add static metadata export for home page |
| Modify | `src/app/(public)/articles/page.tsx` | Add OG/Twitter to existing metadata |
| Modify | `src/app/(public)/articles/[slug]/page.tsx` | Add Article JSON-LD structured data |
| Modify | `src/app/(public)/briefings/page.tsx` | Add OG/Twitter to existing metadata |
| Modify | `src/app/(public)/briefings/[slug]/page.tsx` | Add Article JSON-LD structured data |
| Modify | `src/app/(public)/academy/page.tsx` | Add OG/Twitter to existing metadata |
| Modify | `src/app/(public)/academy/[slug]/page.tsx` | Add OG/Twitter to generateMetadata |
| Modify | `src/app/(public)/video/page.tsx` | Add OG/Twitter to existing metadata |
| Modify | `src/app/(public)/blog/page.tsx` | Add OG/Twitter to existing metadata |
| Modify | `src/app/(public)/blog/[slug]/page.tsx` | Upgrade twitter card to summary_large_image |
| Modify | `src/app/(public)/pricing/page.tsx` | Add description + OG/Twitter to metadata |
| Modify | `src/app/(public)/contact/page.tsx` | Add OG/Twitter to existing metadata |
| Modify | `src/app/(public)/support/page.tsx` | Add OG/Twitter to existing metadata |
| Modify | `src/app/(public)/privacy/page.tsx` | Add OG/Twitter, fix double-suffixed title |
| Modify | `src/app/(public)/terms/page.tsx` | Add OG/Twitter, fix double-suffixed title |
| Modify | `src/styles/globals.css` | Add focus-visible ring styles, skip-link styles |

---

## Chunk 1: SEO Foundation (seo.ts + robots.ts + sitemap.ts)

### Task 1: Create SEO utility module

**Files:**
- Create: `src/lib/seo.ts`

- [ ] **Step 1: Create `src/lib/seo.ts` with site constants and JSON-LD builders**

The module exports:
- `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `SITE_AUTHOR` — constants
- `organizationJsonLd()` — returns Organization schema object
- `articleJsonLd(opts)` — returns Article schema object (used for articles, briefings, dispatches)
- `breadcrumbJsonLd(items)` — returns BreadcrumbList schema object

Key details:
- `SITE_URL` defaults to `https://blackmalejournal.com` but reads from `NEXT_PUBLIC_SITE_URL` env var
- Organization schema includes `founder` (The Chairman), `logo` at `/logo.png`
- Article schema includes `publisher` with Organization nested inside
- All JSON-LD uses `@context: 'https://schema.org'`

The JSON-LD output will be rendered via `<script type="application/ld+json">` tags in page components. This is the standard Next.js pattern — the content passed is always `JSON.stringify()` of our own data objects (never user-generated HTML), so there is no XSS vector.

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors from `src/lib/seo.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/seo.ts
git commit -m "feat: add SEO utility module with JSON-LD builders and site constants"
```

---

### Task 2: Create robots.ts

**Files:**
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create `src/app/robots.ts`**

Use Next.js `MetadataRoute.Robots` type. Rules:
- `userAgent: '*'` — allow `/`, disallow `/portal/` and `/api/`
- `sitemap` points to `${SITE_URL}/sitemap.xml`

Import `SITE_URL` from `@/lib/seo`.

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/robots.ts
git commit -m "feat: add robots.ts disallowing portal/api, pointing to sitemap"
```

---

### Task 3: Create sitemap.ts

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Create `src/app/sitemap.ts`**

Use Next.js `MetadataRoute.Sitemap` type. The async function:
1. Defines static pages array (home, articles, briefings, academy, video, blog, pricing, contact, support, privacy, terms) with appropriate `changeFrequency` and `priority`
2. Fetches all dynamic content in parallel: `getArticles({limit:500})`, `getBriefings({limit:200})`, `getCourses({published:true})`, `getDispatches({limit:500})`
3. Maps each to sitemap entries with `url`, `lastModified` (from published_at or created_at), `changeFrequency: 'monthly'`, and priority (0.8 for articles/briefings, 0.7 for dispatches, 0.6 for courses)
4. Returns concatenated array

Import `SITE_URL` from `@/lib/seo` and all query functions from `@/lib/supabase/queries`.

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: add dynamic sitemap with articles, briefings, courses, dispatches"
```

---

## Chunk 2: Root Layout Metadata + Organization JSON-LD + Skip Link

### Task 4: Enhance root layout metadata and add Organization JSON-LD

**Files:**
- Modify: `src/app/layout.tsx`

The root layout currently has minimal metadata (title + description only). We need to add:
- `metadataBase` so relative OG image URLs resolve correctly
- Default OpenGraph metadata (type, siteName, locale)
- Default Twitter card metadata
- Organization JSON-LD as a `<script type="application/ld+json">` in `<head>`
- Skip-to-content link for accessibility
- `id="main-content"` on the `<main>` element

- [ ] **Step 1: Add imports to `src/app/layout.tsx`**

Add after existing imports:
```typescript
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, organizationJsonLd } from '@/lib/seo';
```

- [ ] **Step 2: Replace the existing `metadata` export**

New metadata uses `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION` constants:
- `metadataBase: new URL(SITE_URL)`
- `title: { default: SITE_NAME, template: '%s | ${SITE_NAME}' }`  (template literal)
- `description: SITE_DESCRIPTION`
- `openGraph: { type: 'website', locale: 'en_US', siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION }`
- `twitter: { card: 'summary_large_image', title: SITE_NAME, description: SITE_DESCRIPTION }`

- [ ] **Step 3: Add Organization JSON-LD and skip link to the body**

Inside the `<body>` element, before `<Navbar>`:
- A `<script type="application/ld+json">` containing `JSON.stringify(organizationJsonLd())` — safe because it serializes our own constants, not user HTML
- A skip-link `<a href="#main-content" className="skip-link">Skip to main content</a>`

Change `<main className="flex-1">` to `<main id="main-content" className="flex-1">`.

- [ ] **Step 4: Verify the file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add full OG/Twitter defaults, Organization JSON-LD, skip-link to root layout"
```

---

## Chunk 3: Accessibility Styles

### Task 5: Add focus-visible and skip-link styles

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Read `src/styles/globals.css` to find where to add styles**

Read the file to determine the right insertion point (after existing base styles).

- [ ] **Step 2: Add accessibility styles to `src/styles/globals.css`**

Append after existing content:

**Skip-link styles:**
- `position: absolute; left: -9999px; top: 0; z-index: 999`
- `padding: 0.75rem 1.5rem; background: var(--bmj-red); color: var(--bmj-white)`
- `font-family: var(--font-label, 'Oswald', sans-serif); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none`
- On `:focus` — `left: 1rem; top: 1rem`

**Focus-visible ring:**
- `*:focus-visible { outline: 2px solid var(--bmj-red); outline-offset: 2px; }`

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: add focus-visible ring and skip-link accessibility styles"
```

---

## Chunk 4: Static Page Metadata (OG + Twitter for all pages)

### Task 6: Add home page metadata

**Files:**
- Modify: `src/app/(public)/page.tsx`

The home page currently has NO metadata export at all.

- [ ] **Step 1: Add metadata import and export to `src/app/(public)/page.tsx`**

Add `import type { Metadata } from 'next';` and a `metadata` export with:
- `description` — reuse the site description
- `openGraph: { title: 'The Black Male Journal', description: ... }`
- `twitter: { card: 'summary_large_image', title: 'The Black Male Journal', description: ... }`

Note: `title` is not set because root layout `title.default` already provides "The Black Male Journal".

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "src/app/(public)/page.tsx"
git commit -m "feat: add metadata with OG/Twitter to home page"
```

---

### Task 7: Add OG/Twitter to all static listing pages

**Files:**
- Modify: `src/app/(public)/articles/page.tsx`
- Modify: `src/app/(public)/briefings/page.tsx`
- Modify: `src/app/(public)/academy/page.tsx`
- Modify: `src/app/(public)/video/page.tsx`
- Modify: `src/app/(public)/blog/page.tsx`
- Modify: `src/app/(public)/pricing/page.tsx`
- Modify: `src/app/(public)/contact/page.tsx`
- Modify: `src/app/(public)/support/page.tsx`
- Modify: `src/app/(public)/privacy/page.tsx`
- Modify: `src/app/(public)/terms/page.tsx`

Each page already has a `metadata` export with `title` and (usually) `description`. Add `openGraph` and `twitter` fields matching the existing title/description values.

**Note on privacy/terms:** These pages use full title strings like `"Privacy Policy | The Black Male Journal"` instead of the template pattern. To avoid double-suffixing (`"Privacy Policy | The Black Male Journal | The Black Male Journal"`), change their titles to just `"Privacy Policy"` and `"Terms of Service"` and let the root template handle the suffix.

Pattern for each page — add to existing metadata:
```typescript
openGraph: {
  title: '<same as metadata.title>',
  description: '<same as metadata.description>',
},
twitter: {
  card: 'summary_large_image',
  title: '<same as metadata.title>',
  description: '<same as metadata.description>',
},
```

Specific metadata values per page:

| Page | Title | Description |
|------|-------|-------------|
| articles | Articles | Long-form articles on health, philosophy, and politics for Black men. |
| briefings | Weekend Briefing | A weekly dispatch on the politics, philosophy, and health of the Black male experience. |
| academy | Academy | Structured learning for the disciplined man. Master your body, mind, and mission. |
| video | Video | Watch. Learn. Build. Video content from The Chairman on health, philosophy, and politics. |
| blog | Dispatches | Short dispatches, updates, and commentary from The Chairman. |
| pricing | Pricing | Join the movement. Membership plans for The Black Male Journal — free, basic, and premium tiers. |
| contact | Connect | Reach the Chairman. Contact The Black Male Journal for inquiries, collaborations, and press. |
| support | Support the Mission | Fund independent media for Black men. No corporate sponsors. No advertisers. Just us. |
| privacy | Privacy Policy | How The Black Male Journal collects, uses, and protects your data. |
| terms | Terms of Service | Terms and conditions for using The Black Male Journal platform. |

- [ ] **Step 1: Update articles/page.tsx metadata**
- [ ] **Step 2: Update briefings/page.tsx metadata**
- [ ] **Step 3: Update academy/page.tsx metadata**
- [ ] **Step 4: Update video/page.tsx metadata**
- [ ] **Step 5: Update blog/page.tsx metadata**
- [ ] **Step 6: Update pricing/page.tsx metadata** (also add description -- currently missing)
- [ ] **Step 7: Update contact/page.tsx metadata**
- [ ] **Step 8: Update support/page.tsx metadata**
- [ ] **Step 9: Update privacy/page.tsx metadata** (also fix double-suffixed title)
- [ ] **Step 10: Update terms/page.tsx metadata** (also fix double-suffixed title)

- [ ] **Step 11: Verify all pages compile**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 12: Commit**

```bash
git add "src/app/(public)/articles/page.tsx" "src/app/(public)/briefings/page.tsx" "src/app/(public)/academy/page.tsx" "src/app/(public)/video/page.tsx" "src/app/(public)/blog/page.tsx" "src/app/(public)/pricing/page.tsx" "src/app/(public)/contact/page.tsx" "src/app/(public)/support/page.tsx" "src/app/(public)/privacy/page.tsx" "src/app/(public)/terms/page.tsx"
git commit -m "feat: add OpenGraph and Twitter card metadata to all static pages"
```

---

## Chunk 5: Dynamic Route Metadata Enhancements + JSON-LD

### Task 8: Add JSON-LD to article detail page

**Files:**
- Modify: `src/app/(public)/articles/[slug]/page.tsx`

This page already has full OG/Twitter metadata. We're adding Article JSON-LD structured data.

- [ ] **Step 1: Add import**

Add `import { SITE_URL, articleJsonLd } from '@/lib/seo';`

- [ ] **Step 2: Add JSON-LD script to the page component**

Inside the `ArticlePage` component, add a `<script type="application/ld+json">` as the first child of the wrapping `<div>`. Pass `JSON.stringify(articleJsonLd({...}))` with values from the article object: title, excerpt (as description), url (`${SITE_URL}/articles/${slug}`), cover_image, published_at, author.

This is safe — `JSON.stringify` on our own data objects produces valid JSON with no HTML injection vector.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/articles/[slug]/page.tsx"
git commit -m "feat: add Article JSON-LD structured data to article detail page"
```

---

### Task 9: Add JSON-LD to briefing detail page

**Files:**
- Modify: `src/app/(public)/briefings/[slug]/page.tsx`

- [ ] **Step 1: Add import**

Add `import { SITE_URL, articleJsonLd } from '@/lib/seo';`

- [ ] **Step 2: Add JSON-LD script**

Add as first child of wrapping `<div>` in `BriefingPage`. Use:
- title: `Weekend Briefing ${issueLabel}: ${briefing.title}`
- description: `briefing.sections[0]?.body.slice(0, 160) ?? briefing.title`
- url: `${SITE_URL}/briefings/${briefing.slug}`
- imageUrl: `briefing.cover_image`
- publishedAt: `briefing.published_at`

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/briefings/[slug]/page.tsx"
git commit -m "feat: add Article JSON-LD structured data to briefing detail page"
```

---

### Task 10: Add JSON-LD to dispatch detail page + upgrade Twitter card

**Files:**
- Modify: `src/app/(public)/blog/[slug]/page.tsx`

The dispatch detail page already has OG metadata but uses `twitter.card: 'summary'` instead of `'summary_large_image'`. Fix that and add JSON-LD.

- [ ] **Step 1: Add import**

Add `import { SITE_URL, articleJsonLd } from '@/lib/seo';`

- [ ] **Step 2: Update generateMetadata — change twitter card type**

Change `card: 'summary'` to `card: 'summary_large_image'`

- [ ] **Step 3: Add JSON-LD script**

Add as first child of wrapping `<div>` in `DispatchPage`. Use dispatch.title, dispatch.excerpt, `${SITE_URL}/blog/${dispatch.slug}`, dispatch.cover_image, dispatch.published_at, dispatch.author.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add "src/app/(public)/blog/[slug]/page.tsx"
git commit -m "feat: add JSON-LD and upgrade Twitter card on dispatch detail page"
```

---

### Task 11: Add OG/Twitter to academy course detail page

**Files:**
- Modify: `src/app/(public)/academy/[slug]/page.tsx`

This page's `generateMetadata` currently only returns `title` and `description`. Add OG and Twitter.

- [ ] **Step 1: Update generateMetadata return value**

Add `openGraph` and `twitter` fields:
- `openGraph: { title: course.title, description: course.description, images: course.cover_image ? [{ url: course.cover_image }] : [] }`
- `twitter: { card: 'summary_large_image', title: course.title, description: course.description, images: course.cover_image ? [course.cover_image] : [] }`

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "src/app/(public)/academy/[slug]/page.tsx"
git commit -m "feat: add OG and Twitter card metadata to academy course page"
```

---

## Chunk 6: Build Verification

### Task 12: Full build verification

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 2: Run full Next.js build**

Run: `npm run build`
Expected: Build succeeds. Check output for:
- All routes compile
- No pages flagged with excessive JS bundle size (watch for anything over 200kb)
- sitemap.ts generates without errors

- [ ] **Step 3: Review build output for bundle sizes**

Look at the route size column in the build output. Flag any page with First Load JS over 200kb for investigation.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve build issues from SEO implementation"
```

---

## Summary of Changes

| Category | Before | After |
|----------|--------|-------|
| Root metadata | Title + description only | Full OG, Twitter, metadataBase, Organization JSON-LD |
| Home page | No metadata at all | Full metadata + OG/Twitter |
| Static pages (8) | Title + description only | OG + Twitter on all |
| Article detail | OG/Twitter | OG/Twitter + Article JSON-LD |
| Briefing detail | OG/Twitter | OG/Twitter + Article JSON-LD |
| Dispatch detail | OG + summary card | OG + summary_large_image + JSON-LD |
| Academy course | Title/description only | Full OG + Twitter |
| Sitemap | None | Dynamic sitemap with all content types |
| Robots | None | robots.txt with allow/disallow + sitemap pointer |
| Accessibility | Partial ARIA | Skip-link, focus-visible ring, ARIA maintained |
| Fonts | Already optimized (swap) | No change needed |
| Images | Already optimized (next/image) | No change needed |
