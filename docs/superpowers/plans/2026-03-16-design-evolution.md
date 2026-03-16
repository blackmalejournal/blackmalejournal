# Design Evolution v1.0 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the website's visual identity to match the Instagram brand's intensity — heavier textures, new editorial components, magazine-style layouts.

**Architecture:** CSS-first changes (grain, halftone, marker, paper texture) ripple globally. Four new presentational components (QuoteCard, TributeCard, PosterBlock, MagazineCoverHero) are built in isolation, then integrated into specific pages. Two layout variants (pull-quote sidebar, newspaper grid) are applied to article and home pages.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, CSS custom properties, Framer Motion (existing rotation logic only)

**Spec:** `docs/superpowers/specs/2026-03-16-design-evolution-spec.md`

---

## File Map

### Files to Modify
| File | What Changes |
|------|-------------|
| `src/styles/brand.css:21` | `--grain-opacity: 0.04` → `0.09` |
| `src/styles/globals.css:54-57` | Add `.halftone-heavy`, `.duotone`, `.marker`, `.paper-texture` after existing `.halftone` |
| `src/components/home/RotatingQuote.tsx:48-102` | Swap inner JSX to render `QuoteCard`. Keep rotation logic. |
| `src/components/home/FeaturedArticles.tsx:22-35` | Replace uniform grid with `NewspaperGrid` for first 3 articles |
| `src/components/content/ArticleBody.tsx:38-46` | Add `<mark>` tag detection alongside existing blockquote parsing |
| `src/app/(public)/page.tsx:35-41` | Insert PosterBlock between BriefingPreview and FeaturedArticles |
| `src/app/(public)/articles/[slug]/page.tsx:130-145` | Upgrade cover to `.halftone-heavy`, wrap body in pull-quote sidebar layout |
| `src/app/(public)/briefings/[slug]/page.tsx:113-152` | Replace header block with MagazineCoverHero |
| `src/app/(public)/articles/page.tsx:89-103` | Insert NewspaperGrid for first 3 articles, keep card grid for rest |

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/content/QuoteCard.tsx` | Amber/tan/brown quote card with optional halftone portrait |
| `src/components/content/TributeCard.tsx` | B&W archival photo + serif nameplate commemoration card |
| `src/components/content/PosterBlock.tsx` | Full-bleed duotone section with bold overlay text |
| `src/components/content/MagazineCoverHero.tsx` | Weekend Briefing cream header with star logo + cover image |
| `src/components/content/NewspaperGrid.tsx` | Asymmetric lead-story + secondary grid layout |
| `src/components/content/PullQuoteSidebar.tsx` | Desktop 65/35 grid with blockquote sidebar extraction |

### Files NOT Touched
All files listed in spec Section 5: Navbar, Footer, ArticleCard, BriefingCard, VideoCard, CourseCard, StarDivider, LensBadge, PaywallGate, auth pages, support/contact/pricing/privacy/terms pages, tailwind.config.ts.

---

## Chunk 1: CSS Enhancements

### Task 1: Increase grain opacity

**Files:**
- Modify: `src/styles/brand.css:21`

- [ ] **Step 1: Update grain opacity**

In `src/styles/brand.css`, change line 21:
```css
/* Before */
--grain-opacity: 0.04;

/* After */
--grain-opacity: 0.09;
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/brand.css
git commit -m "style: increase grain opacity from 0.04 to 0.09"
```

---

### Task 2: Add halftone-heavy CSS class

**Files:**
- Modify: `src/styles/globals.css` (after line 57)

- [ ] **Step 1: Add .halftone-heavy class**

Add **inside** the existing `@layer utilities { }` block in `src/styles/globals.css`, after the `.halftone` rule (after line 57). All new CSS utilities in this plan (Tasks 2-5) must go inside `@layer utilities { }` — not outside it:

```css
.halftone-heavy {
  filter: contrast(1.6) grayscale(1) brightness(1.1);
  mix-blend-mode: multiply;
}
```

**Important:** Do NOT add `position: relative` to `.halftone-heavy` — it will break `<Image fill>` in Next.js (which uses `position: absolute`). Instead, the dot-pattern overlay is applied on a sibling element or the parent's `::after`. The parent container that holds the image must have `position: relative` (which all image wrappers in our components already do).

For the dot-pattern overlay, add a separate class that parent containers can use:

```css
.halftone-dots::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Ccircle cx='3' cy='3' r='1' fill='%230D0C0B' fill-opacity='0.3'/%3E%3C/svg%3E");
  background-size: 6px 6px;
  pointer-events: none;
  z-index: 1;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: add .halftone-heavy class with dot-pattern overlay"
```

---

### Task 3: Add duotone CSS class

**Files:**
- Modify: `src/styles/globals.css` (after halftone-heavy)

- [ ] **Step 1: Add .duotone class**

Add inside `@layer utilities { }` in `src/styles/globals.css`, after `.halftone-heavy`:

```css
.duotone {
  filter: grayscale(1) contrast(1.3);
  mix-blend-mode: multiply;
}
```

Note: This is a two-element recipe. The image needs a parent with a brand background color (`bg-bmj-amber` or `bg-bmj-brown`). The `mix-blend-mode: multiply` combines with the parent's background to produce the two-tone effect.

- [ ] **Step 2: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: add .duotone class for two-tone image treatment"
```

---

### Task 4: Add red marker highlight

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Add .marker and mark element styles**

Add inside `@layer utilities { }` in `src/styles/globals.css`:

```css
.marker,
mark {
  background-color: rgba(192, 40, 31, 0.85);
  color: var(--bmj-white);
  padding: 0.1em 0.25em;
  border-radius: 2px 4px 3px 4px;
  transform: skewX(-1deg);
  display: inline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: add .marker / <mark> red highlight effect"
```

---

### Task 5: Add paper texture utility

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Add .paper-texture class**

Add inside `@layer utilities { }` in `src/styles/globals.css`:

```css
.paper-texture {
  position: relative;
}

.paper-texture::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.5;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: soft-light;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: add .paper-texture utility for aged-paper noise overlay"
```

---

## Chunk 2: New Components

### Task 6: Create QuoteCard component

**Files:**
- Create: `src/components/content/QuoteCard.tsx`

- [ ] **Step 1: Create QuoteCard**

Create `src/components/content/QuoteCard.tsx`:

```tsx
import Image from "next/image"

interface QuoteCardProps {
  quote: string
  attribution: string
  portraitUrl?: string
  lens?: "health" | "philosophy" | "politics"
}

const lensColors = {
  health: "bg-bmj-amber",
  philosophy: "bg-bmj-tan",
  politics: "bg-bmj-brown",
} as const

const lensTextColors = {
  health: "text-bmj-brown",
  philosophy: "text-bmj-brown",
  politics: "text-bmj-cream",
} as const

export default function QuoteCard({
  quote,
  attribution,
  portraitUrl,
  lens = "health",
}: QuoteCardProps) {
  const bg = lensColors[lens]
  const textColor = lensTextColors[lens]

  return (
    <div className={`${bg} p-6 sm:p-8`}>
      <div
        className={`flex flex-col ${portraitUrl ? "sm:flex-row sm:items-center sm:gap-6" : ""}`}
      >
        {portraitUrl && (
          <div className="halftone-dots relative mb-4 h-24 w-24 flex-shrink-0 overflow-hidden sm:mb-0 sm:h-28 sm:w-28">
            <Image
              src={portraitUrl}
              alt={attribution}
              fill
              className="halftone-heavy object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <span className="font-display text-6xl leading-none text-bmj-red">
            &ldquo;
          </span>
          <blockquote
            className={`-mt-8 font-body text-base font-bold uppercase leading-snug sm:text-lg ${textColor}`}
          >
            {quote}
          </blockquote>
          <div className="mt-4 h-0.5 w-10 bg-bmj-red" />
          <p
            className={`mt-2 font-label text-xs uppercase tracking-widest ${textColor} opacity-70`}
          >
            {attribution}
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/content/QuoteCard.tsx
git commit -m "feat: add QuoteCard component — amber/tan/brown quote format from IG"
```

---

### Task 7: Create TributeCard component

**Files:**
- Create: `src/components/content/TributeCard.tsx`

- [ ] **Step 1: Create TributeCard**

Create `src/components/content/TributeCard.tsx`:

```tsx
import Image from "next/image"

interface TributeCardProps {
  name: string
  honorific?: string
  dates: string
  imageUrl: string
  description?: string
}

export default function TributeCard({
  name,
  honorific,
  dates,
  imageUrl,
  description,
}: TributeCardProps) {
  return (
    <div className="flex flex-col overflow-hidden sm:flex-row">
      <div className="relative h-48 w-full sm:h-auto sm:w-2/5">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover grayscale contrast-[1.2]"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center border-bmj-red bg-bmj-black p-6 sm:border-l-[3px] sm:p-8">
        <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          In Memoriam
        </span>
        {honorific && (
          <span className="mt-2 font-body text-sm italic text-bmj-tan">
            {honorific}
          </span>
        )}
        <h3 className="mt-1 font-display text-2xl text-bmj-white sm:text-3xl">
          {name}
        </h3>
        <div className="mt-3 h-px w-full bg-bmj-tan/30" />
        <span className="mt-2 font-mono text-xs text-bmj-tan">{dates}</span>
        {description && (
          <p className="mt-4 font-body text-sm leading-relaxed text-bmj-cream/80">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/content/TributeCard.tsx
git commit -m "feat: add TributeCard component — B&W archival commemoration format"
```

---

### Task 8: Create PosterBlock component

**Files:**
- Create: `src/components/content/PosterBlock.tsx`

- [ ] **Step 1: Create PosterBlock**

Create `src/components/content/PosterBlock.tsx`:

```tsx
import Image from "next/image"
import Link from "next/link"

interface PosterBlockProps {
  title: string
  lens: "health" | "philosophy" | "politics"
  excerpt?: string
  backgroundImageUrl?: string
  linkUrl: string
}

const lensColors = {
  health: "text-bmj-amber",
  philosophy: "text-bmj-tan",
  politics: "text-bmj-red",
} as const

export default function PosterBlock({
  title,
  lens,
  excerpt,
  backgroundImageUrl,
  linkUrl,
}: PosterBlockProps) {
  return (
    <Link
      href={linkUrl}
      className="group relative block w-full overflow-hidden transition-opacity hover:opacity-90"
    >
      <div
        className={`relative flex min-h-[320px] items-end sm:min-h-[400px] ${
          backgroundImageUrl ? "bg-bmj-brown" : "paper-texture bg-bmj-brown"
        }`}
      >
        {backgroundImageUrl && (
          <Image
            src={backgroundImageUrl}
            alt=""
            fill
            className="duotone object-cover"
          />
        )}

        {/* Star motif */}
        <svg
          className="absolute right-6 top-6 z-10 h-8 w-8"
          viewBox="0 0 24 24"
          fill="var(--bmj-red)"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>

        {/* Content overlay */}
        <div className="relative z-10 w-full p-6 sm:p-10">
          <span
            className={`font-label text-xs uppercase tracking-widest ${lensColors[lens]}`}
          >
            {lens}
          </span>
          <h2 className="mt-2 font-display text-4xl text-bmj-white sm:text-5xl md:text-6xl">
            {title}
          </h2>
          <div className="mt-4 h-[3px] w-[60px] bg-bmj-red" />
          {excerpt && (
            <p className="mt-4 max-w-[500px] font-body text-sm leading-relaxed text-bmj-cream sm:text-base">
              {excerpt}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/content/PosterBlock.tsx
git commit -m "feat: add PosterBlock component — full-bleed duotone poster section"
```

---

### Task 9: Create MagazineCoverHero component

**Files:**
- Create: `src/components/content/MagazineCoverHero.tsx`

- [ ] **Step 1: Create MagazineCoverHero**

Create `src/components/content/MagazineCoverHero.tsx`:

```tsx
import Image from "next/image"

interface MagazineCoverHeroProps {
  title: string
  date: string
  issueNumber: number
  coverImageUrl: string
}

export default function MagazineCoverHero({
  title,
  date,
  issueNumber,
  coverImageUrl,
}: MagazineCoverHeroProps) {
  const formattedIssue = String(issueNumber).padStart(3, "0")

  return (
    <div className="mx-auto max-w-content bg-bmj-cream">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 pt-6">
        <svg
          className="h-7 w-7 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="var(--bmj-red)"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
        <h1 className="font-display text-3xl text-bmj-black sm:text-4xl md:text-5xl">
          Weekend Briefing
        </h1>
      </div>

      {/* Red rule */}
      <div className="mx-6 mt-2 h-[3px] bg-bmj-red" />

      {/* Date + issue */}
      <div className="px-6 py-2">
        <span className="font-mono text-xs uppercase tracking-widest text-bmj-brown">
          {date} &middot; Issue No. {formattedIssue}
        </span>
      </div>

      {/* Cover image */}
      <div className="paper-texture relative mx-6 mb-6 aspect-[16/10] overflow-hidden">
        <Image
          src={coverImageUrl}
          alt={title}
          fill
          className="halftone object-cover"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/content/MagazineCoverHero.tsx
git commit -m "feat: add MagazineCoverHero — cream header with star logo and cover image"
```

---

## Chunk 3: Layout Components

### Task 10: Create NewspaperGrid component

**Files:**
- Create: `src/components/content/NewspaperGrid.tsx`

- [ ] **Step 1: Create NewspaperGrid**

Create `src/components/content/NewspaperGrid.tsx`:

```tsx
import Link from "next/link"
import Image from "next/image"
import LensBadge from "@/components/brand/LensBadge"

interface Article {
  slug: string
  title: string
  excerpt: string | null
  lens: "health" | "philosophy" | "politics"
  cover_image: string | null
  published_at: string | null
}

interface NewspaperGridProps {
  articles: Article[]
}

const lensBorderColors = {
  health: "border-t-bmj-amber",
  philosophy: "border-t-bmj-tan",
  politics: "border-t-bmj-red",
} as const

export default function NewspaperGrid({ articles }: NewspaperGridProps) {
  if (articles.length === 0) return null
  const [lead, ...secondary] = articles.slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr] lg:grid-rows-2">
      {/* Lead story — spans 2 rows on desktop */}
      <Link
        href={`/articles/${lead.slug}`}
        className={`group relative flex min-h-[280px] items-end overflow-hidden border-t-[3px] bg-bmj-brown ${lensBorderColors[lead.lens]} lg:row-span-2 lg:min-h-0`}
      >
        {lead.cover_image && (
          <Image
            src={lead.cover_image}
            alt=""
            fill
            className="halftone object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
        <div className="relative z-10 w-full bg-bmj-black/70 p-5">
          <LensBadge lens={lead.lens} />
          <h3 className="mt-2 font-display text-2xl text-bmj-white sm:text-3xl">
            {lead.title}
          </h3>
          {lead.excerpt && (
            <p className="mt-2 line-clamp-2 font-body text-sm text-bmj-cream/80">
              {lead.excerpt}
            </p>
          )}
        </div>
      </Link>

      {/* Secondary stories */}
      {secondary.map((article) => (
        <Link
          key={article.slug}
          href={`/articles/${article.slug}`}
          className={`group border-t-2 bg-bmj-brown p-4 transition-colors hover:bg-bmj-brown/80 ${lensBorderColors[article.lens]}`}
        >
          <LensBadge lens={article.lens} />
          <h3 className="mt-2 font-display text-lg text-bmj-white sm:text-xl">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-1 line-clamp-2 font-body text-sm text-bmj-cream/70">
              {article.excerpt}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/content/NewspaperGrid.tsx
git commit -m "feat: add NewspaperGrid — asymmetric lead + secondary article layout"
```

---

### Task 11: Create PullQuoteSidebar component

**Files:**
- Create: `src/components/content/PullQuoteSidebar.tsx`

- [ ] **Step 1: Create PullQuoteSidebar**

Create `src/components/content/PullQuoteSidebar.tsx`:

```tsx
interface PullQuoteSidebarProps {
  children: React.ReactNode
  body: string
}

function extractBlockquotes(body: string): string[] {
  return body
    .split("\n\n")
    .filter((block) => block.trimStart().startsWith("> "))
    .map((block) => block.replace(/^>\s?/gm, "").trim())
    .slice(0, 3)
}

export default function PullQuoteSidebar({
  children,
  body,
}: PullQuoteSidebarProps) {
  const quotes = extractBlockquotes(body)

  if (quotes.length === 0) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto max-w-content">
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        {/* Main content column — children (ArticleBody) handle their own max-w-article */}
        <div>{children}</div>

        {/* Pull-quote sidebar — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            {quotes.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-[3px] border-bmj-red pl-4"
              >
                <p className="font-body text-base italic leading-relaxed text-bmj-amber">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-2 h-px w-full bg-bmj-tan/30" />
              </blockquote>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/content/PullQuoteSidebar.tsx
git commit -m "feat: add PullQuoteSidebar — desktop 65/35 layout with extracted blockquotes"
```

---

## Chunk 4: ArticleBody Enhancement

### Task 12: Add mark tag detection to ArticleBody

**Files:**
- Modify: `src/components/content/ArticleBody.tsx:38-52`

- [ ] **Step 1: Add mark tag rendering**

In `src/components/content/ArticleBody.tsx`, the current paragraph rendering (the default case around lines 48-52) outputs raw text. Add a helper function at the top of the file (before the component) to parse `<mark>` tags:

```tsx
function renderInlineMarks(text: string): React.ReactNode {
  const parts = text.split(/(<mark>.*?<\/mark>)/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    const match = part.match(/^<mark>(.*?)<\/mark>$/)
    if (match) {
      return (
        <mark key={i} className="marker">
          {match[1]}
        </mark>
      )
    }
    return part
  })
}
```

Then update the paragraph rendering to use this function. In every `<p>` and `<blockquote>` element rendered by `ArticleBody`, replace `{block.content}` or the raw text output with `{renderInlineMarks(block.content || text)}`.

The exact edit depends on the current structure — apply `renderInlineMarks()` to the text content of paragraphs and blockquotes.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/content/ArticleBody.tsx
git commit -m "feat: ArticleBody detects <mark> tags and renders with .marker class"
```

---

## Chunk 5: Page Integration — Home Page

### Task 13: Integrate PosterBlock into home page

**Files:**
- Modify: `src/app/(public)/page.tsx:3-9,35-41`

- [ ] **Step 1: Add PosterBlock import and render**

In `src/app/(public)/page.tsx`:

1. Add import: `import PosterBlock from "@/components/content/PosterBlock"`
2. Insert PosterBlock between `<BriefingPreview />` and `<FeaturedArticles />`:

```tsx
<BriefingPreview />
<PosterBlock
  title="The Architecture of Power"
  lens="politics"
  excerpt="A deep analysis of institutional power dynamics and the deliberate architecture of disenfranchisement."
  linkUrl="/articles"
/>
<FeaturedArticles />
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/page.tsx
git commit -m "feat: add PosterBlock to home page between briefing and articles"
```

---

### Task 14: Update RotatingQuote to use QuoteCard

**Files:**
- Modify: `src/components/home/RotatingQuote.tsx:48-102`

- [ ] **Step 1: Import QuoteCard and update JSX**

In `src/components/home/RotatingQuote.tsx`:

1. Add import at top: `import QuoteCard from "@/components/content/QuoteCard"`
2. The QUOTES array already has `{ text: string; attribution: string }`. No renaming needed.
3. Replace the inner JSX (the `<p>` with the quotation mark, the quote text, and the attribution span) with a `<QuoteCard>` component. Keep the `AnimatePresence` and `motion.div` wrapper for the rotation animation.

The core change: inside the `motion.div` that wraps the current quote content, render:
```tsx
<QuoteCard
  quote={QUOTES[currentIndex].text}
  attribution={QUOTES[currentIndex].attribution}
  lens="philosophy"
/>
```

Keep the progress dots below unchanged.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/RotatingQuote.tsx
git commit -m "feat: RotatingQuote now renders QuoteCard instead of custom markup"
```

---

### Task 15: Update FeaturedArticles to use NewspaperGrid

**Files:**
- Modify: `src/components/home/FeaturedArticles.tsx:22-35`

- [ ] **Step 1: Import NewspaperGrid and replace grid**

In `src/components/home/FeaturedArticles.tsx`:

1. Add import: `import NewspaperGrid from "@/components/content/NewspaperGrid"`
2. Replace the existing `<div className="grid grid-cols-1 gap-6 md:grid-cols-3">` and its ArticleCard mapping with:

```tsx
<NewspaperGrid articles={articles} />
```

Remove the ArticleCard import if it's no longer used in this file.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/FeaturedArticles.tsx
git commit -m "feat: FeaturedArticles uses NewspaperGrid layout on home page"
```

---

## Chunk 6: Page Integration — Briefing Detail

### Task 16: Replace briefing header with MagazineCoverHero

**Files:**
- Modify: `src/app/(public)/briefings/[slug]/page.tsx:113-152`

- [ ] **Step 1: Import and swap header**

In `src/app/(public)/briefings/[slug]/page.tsx`:

1. Add import: `import MagazineCoverHero from "@/components/content/MagazineCoverHero"`
2. Replace the header block (lines 113-152 — the `<header>` with BookOpen icon, issue number, title, accent border, and cover image) with:

```tsx
<MagazineCoverHero
  title={briefing.title}
  date={new Date(briefing.published_at!).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
  issueNumber={briefing.issue_number}
  coverImageUrl={briefing.cover_image || "/placeholder-briefing.jpg"}
/>
```

Remove the `BookOpen` import from lucide-react if it's no longer used elsewhere in the file.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/briefings/[slug]/page.tsx
git commit -m "feat: briefing detail uses MagazineCoverHero with cream header"
```

---

## Chunk 7: Page Integration — Article Detail

### Task 17: Upgrade article cover to halftone-heavy

**Files:**
- Modify: `src/app/(public)/articles/[slug]/page.tsx:130-140`

- [ ] **Step 1: Change halftone class on cover image**

In `src/app/(public)/articles/[slug]/page.tsx`, find the cover image element (around line 136 where `className="halftone"` is applied) and change:

```tsx
/* Before */
className="halftone object-cover"

/* After */
className="halftone-heavy object-cover"
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(public)/articles/[slug]/page.tsx
git commit -m "style: upgrade article cover image to halftone-heavy treatment"
```

---

### Task 18: Add PullQuoteSidebar to article detail

**Files:**
- Modify: `src/app/(public)/articles/[slug]/page.tsx:145`

- [ ] **Step 1: Import and wrap ArticleBody**

In `src/app/(public)/articles/[slug]/page.tsx`:

1. Add import: `import PullQuoteSidebar from "@/components/content/PullQuoteSidebar"`
2. Find where `<ArticleBody>` is rendered (around line 145). Wrap it with PullQuoteSidebar, placing it **inside** the existing `max-w-content` padding div:

```tsx
<PullQuoteSidebar body={article.body}>
  <ArticleBody body={article.body} />
</PullQuoteSidebar>
```

**Important:** `ArticleBody.tsx` has its own `mx-auto max-w-article` wrapper on line 12. `PullQuoteSidebar` also wraps children in `mx-auto max-w-article`. To avoid nesting, remove the `mx-auto max-w-article` div **inside PullQuoteSidebar** — let `ArticleBody` keep its own. The `PullQuoteSidebar` component should use `max-w-content` for the outer grid and let children handle their own width constraints.

Update PullQuoteSidebar's main column from `<div className="mx-auto max-w-article">{children}</div>` to just `<div>{children}</div>` — the children (ArticleBody) already constrain themselves.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/articles/[slug]/page.tsx
git commit -m "feat: article detail page uses PullQuoteSidebar on desktop"
```

---

## Chunk 8: Page Integration — Articles List

### Task 19: Add NewspaperGrid to articles list page

**Files:**
- Modify: `src/app/(public)/articles/page.tsx:89-103`

- [ ] **Step 1: Import NewspaperGrid and split articles**

In `src/app/(public)/articles/page.tsx`:

1. Add import: `import NewspaperGrid from "@/components/content/NewspaperGrid"`
2. In the render section (around line 89), split the visible articles:

```tsx
const leadArticles = visible.slice(0, 3)
const remainingArticles = visible.slice(3)
```

3. Replace the grid with:

```tsx
{leadArticles.length > 0 && (
  <NewspaperGrid articles={leadArticles} />
)}

{remainingArticles.length > 0 && (
  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {remainingArticles.map((article) => (
      <ArticleCard key={article.slug} {...article} />
    ))}
  </div>
)}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/articles/page.tsx
git commit -m "feat: articles list uses NewspaperGrid for first 3 articles"
```

---

## Chunk 9: Final Verification

### Task 20: Full build verification and visual check

**Files:**
- None (verification only)

- [ ] **Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: Clean build with no errors.

- [ ] **Step 3: Visual check against success criteria**

Start dev server: `npm run dev`

Verify each success criterion from the spec:

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | Build passes | Step 2 above |
| 2 | TypeScript clean | Step 1 above |
| 3 | Home page at 375px and 1440px — no horizontal overflow | DevTools responsive mode |
| 4 | Grain visible on hero sections at 1440px | Visual inspection of home page |
| 5 | Briefing detail uses MagazineCoverHero | Navigate to `/briefings/[any-slug]` |
| 6 | QuoteCard visible on home page | Scroll to rotating quote section |
| 7 | PosterBlock visible on home page | Scroll between briefing preview and articles |
| 8 | Pull-quote sidebar on desktop (1024px+) article | Navigate to `/articles/[any-slug]` at 1024px+ |
| 9 | Red marker highlight on `<mark>` elements | Requires article body with `<mark>` tags in Supabase |
| 10 | No changes to Navbar, Footer, etc. | Spot-check navigation, footer, and excluded pages |

- [ ] **Step 4: Final commit (if any cleanup needed)**

Stage only the specific files that needed cleanup, then commit:
```bash
git commit -m "chore: design evolution v1 — final cleanup"
```

---

## Summary: What ships vs. what's deferred

**Ships now (this plan):**
- Grain intensity increase (global)
- 4 new CSS utilities: `.halftone-heavy`, `.duotone`, `.marker`, `.paper-texture`
- 4 new components: QuoteCard, TributeCard, PosterBlock, MagazineCoverHero
- 2 layout components: NewspaperGrid, PullQuoteSidebar
- Home page: PosterBlock + NewspaperGrid + QuoteCard-powered RotatingQuote
- Briefing detail: MagazineCoverHero header
- Article detail: halftone-heavy cover + PullQuoteSidebar
- Articles list: NewspaperGrid for first 3
- ArticleBody: `<mark>` tag parsing

**Deferred (spec deviation, acknowledged):**
- TributeCard page integration (component is built, ready to use when content exists)
- PullQuoteSidebar on briefing detail page — spec Section 3A and 4 include this, but briefing sections use a different data shape (JSON array of `{title, body}` sections, not a single body string with blockquotes). Integrating pull-quotes into the briefing section renderer requires changes to the section rendering loop, which is better done as a focused follow-up rather than risking breakage in this plan.
- Admin dashboard theme controls (Phase 2 — admin ecosystem)
- Dynamic PosterBlock data (currently hardcoded, becomes CMS-driven when admin exists)
