# Design Evolution Spec — The Black Male Journal

> Evolve the website's visual identity to match the intensity, texture, and editorial
> energy of the Instagram presence. Approach B: Component + CSS Evolution.

**Informed by:** [Instagram Brand Analysis](./2026-03-16-instagram-brand-analysis.md)

**Scope:** CSS enhancements + 4 new components + 2 new layout variants + page-level integration. No changes to existing working components (ArticleCard, BriefingCard, VideoCard, Navbar, Footer).

**Goal:** The site should feel like reading a printed revolutionary newspaper — tactile, textured, cinematic. Not a clean SaaS dashboard. Not a blog template.

---

## 1. CSS Enhancements

### 1A. Grain Intensity

**File:** `src/styles/brand.css`

Change `--grain-opacity` from `0.04` to `0.09`. The grain should be perceptible — you should feel the newsprint texture when looking at the page, especially on dark backgrounds.

**Testing:** Compare before/after at 1440px viewport. The grain should be visible without being distracting. It should disappear when you're reading body text but be noticeable on hero sections and dark backgrounds.

### 1B. Halftone Variants

**File:** `src/styles/globals.css`

Keep existing `.halftone` unchanged. Add two new utility classes:

**`.halftone-heavy`** — aggressive newsprint effect for portraits and iconographic images.
```
filter: contrast(1.6) grayscale(1) brightness(1.1);
mix-blend-mode: multiply;
```
Plus a CSS `::after` pseudo-element that overlays a dot-pattern SVG (circular dots in a grid, simulating halftone printing). The dots should be subtle enough not to interfere with facial recognition but strong enough to feel printed.

**`.duotone`** — reduces an image to two tones: black + one brand color.
```
filter: grayscale(1) contrast(1.3);
```
Combined with a parent container that has `background-color: var(--bmj-amber)` (or `--bmj-brown`) and the image set to `mix-blend-mode: multiply`. The result is a high-contrast image tinted with the brand color — the propaganda poster look.

**Note on `.duotone`:** This is a two-element recipe, not a standalone utility. The image needs a parent wrapper with a brand background color:
```html
<div class="bg-bmj-amber"> <!-- or bg-bmj-brown -->
  <img class="duotone" src="..." />
</div>
```
The image's `mix-blend-mode: multiply` combines with the parent's background to produce the two-tone effect.

**Dot-pattern SVG for `.halftone-heavy`:** The dot overlay should be inlined as a data URI in the `::after` content, consistent with how `--texture-url` works in `brand.css`. No external file.

**Usage convention:**
- `.halftone` — article cover images (existing, unchanged)
- `.halftone-heavy` — QuoteCard portraits, TributeCard photos
- `.duotone` — PosterBlock backgrounds, hero backgrounds

### 1C. Red Marker Highlight

**File:** `src/styles/globals.css`

A `.marker` class (and `<mark>` element styling) that renders text as if highlighted with a red marker on paper.

**Implementation:**
- Background: `var(--bmj-red)` at ~85% opacity
- The background extends slightly beyond the text bounds (padding 0.1em 0.25em)
- A slight rotation (`skewX(-1deg)`) and rough edge via `border-radius: 2px 4px 3px 4px` to avoid looking digitally perfect
- Text color: `var(--bmj-white)` for contrast
- Used inline within body text to highlight key phrases

**Alternative considered:** Using a CSS decoration with `text-decoration: underline wavy` — rejected because the "highlight behind text" effect is more visually striking and matches the user's description of "red marker highlights on paper."

### 1D. Paper Texture Utility

**File:** `src/styles/globals.css`

A `.paper-texture` class that layers a subtle aged-paper noise over a section.

**Implementation:**
- An SVG-based `feTurbulence` noise pattern (similar to existing grain but at lower frequency, higher opacity)
- Warm cream tint (`var(--bmj-cream)` at 3-5% opacity)
- Applied via `::before` pseudo-element with `pointer-events: none`
- Intended for editorial content sections, the MagazineCoverHero header area, and blockquote backgrounds

**Usage:** Apply sparingly. Not every section needs paper texture. Primary targets: briefing detail page, article body sections, MagazineCoverHero.

---

## 2. New Components

### 2A. QuoteCard

**File:** `src/components/content/QuoteCard.tsx`

Translates the Instagram quote post format to a web component.

**Props:**
```typescript
interface QuoteCardProps {
  quote: string
  attribution: string
  portraitUrl?: string   // optional halftone-heavy portrait
  lens?: 'health' | 'philosophy' | 'politics'  // shifts background color
}
```

**Layout:**
- Background color determined by lens: amber (default/health), tan (philosophy), brown with red accent (politics)
- Optional portrait image on the left (halftone-heavy treated), quote text on the right
- If no portrait, quote fills the full width
- Large opening quotation mark in `var(--bmj-red)` using display font
- Quote text: body font, bold, uppercase, tight leading
- Red horizontal rule (40px wide, 2px tall) below quote
- Attribution: label font, small caps, wide tracking, darker shade of background color
- No rounded corners (brand rule: max 2px border-radius)

**Responsive:** Portrait stacks above quote on mobile (below sm breakpoint).

### 2B. TributeCard

**File:** `src/components/content/TributeCard.tsx`

Commemorating historical Black figures — the reverential Instagram format.

**Props:**
```typescript
interface TributeCardProps {
  name: string
  honorific?: string     // "The Reverend", "Baba", "Dr."
  dates: string          // "Oct. 8, 1941 — Feb. 17, 2026"
  imageUrl: string       // B&W archival photo
  description?: string   // brief context paragraph
}
```

**Layout:**
- Horizontal layout: B&W photo (40% width) + text panel (60% width)
- Photo: `filter: grayscale(1) contrast(1.2)` — archival, documentary feel
- Text panel: `bg-bmj-black` with `border-l-[3px] border-bmj-red`
- "In Memoriam" label: label font, uppercase, wide tracking, tan color
- Honorific: body font, italic, tan color
- Name: display font, large, white, uppercase
- Dates: mono font, tan color
- Optional description: body font, cream, below a thin tan separator

**Responsive:** Photo stacks above text panel on mobile.

**Page integration:** TributeCard is built as a reusable component but not placed on any specific page in this iteration. It will be integrated when tribute/commemoration content is added to the CMS or when the admin dashboard enables creating tribute posts. The component is ready to drop into any page.

### 2C. PosterBlock

**File:** `src/components/content/PosterBlock.tsx`

Full-bleed section with duotone background image and bold overlay text. The propaganda poster aesthetic.

**Props:**
```typescript
interface PosterBlockProps {
  title: string
  lens: 'health' | 'philosophy' | 'politics'
  excerpt?: string
  backgroundImageUrl?: string  // gets duotone treatment
  linkUrl: string
}
```

**Layout:**
- Full-width section (breaks out of max-w-content)
- Background: duotone-treated image, or solid `bg-bmj-brown` with `.paper-texture` overlay if no image
- Star motif: absolute positioned top-right, `fill: var(--bmj-red)`, 32px
- Content aligned bottom-left with generous padding
- Lens label: label font, uppercase, lens color
- Title: display font, very large (text-4xl md:text-6xl), white, uppercase
- Red horizontal rule (60px wide, 3px tall) below title
- Excerpt: body font, cream, max-width 500px for readability
- Entire block is a link (cursor pointer, subtle opacity transition on hover)

**Responsive:** Padding and title size scale down. Min-height reduces on mobile.

### 2D. MagazineCoverHero

**File:** `src/components/content/MagazineCoverHero.tsx`

The iconic Weekend Briefing header template adapted from Instagram.

**Props:**
```typescript
interface MagazineCoverHeroProps {
  title: string
  date: string
  issueNumber: number
  coverImageUrl: string
}
```

**Layout:**
- Background: `var(--bmj-cream)` — the cream header is a signature BMJ visual element
- Header bar: star SVG (28px, red) + "WEEKEND BRIEFING" in display font, black text
- Red horizontal rule (3px, full width of header area)
- Date + issue number: mono font, brown text, uppercase, wide tracking
- Cover image below: full-width within the component, with `.halftone` treatment and `.paper-texture` overlay
- Entire component has `max-w-content` and centers on page

**Integration:** Used on the briefing detail page (`/briefings/[slug]`) to replace the current header block. The existing BriefingCard component on list pages stays unchanged.

---

## 3. Layout Variants

### 3A. Pull-Quote Sidebar

**Where:** Article detail page body, briefing detail page sections (desktop only).

**Structure:**
- On viewports >= `lg` (1024px), article body shifts to a 65/35 grid
- Main column (65%): article text at max-w-article
- Sidebar column (35%): pull-quotes extracted from the article, styled as blockquotes with `border-l-[3px] border-bmj-red`
- Pull-quote text: body font, italic, amber color, ~1.1rem
- Pull-quote attribution: label font, tan, below a thin separator
- On mobile/tablet: pull-quotes render inline as standard blockquotes (no sidebar)

**Data:** Articles are stored in Supabase with a plain `body: string` field (no MDX pipeline). Pull-quotes are extracted at render time from blockquotes already present in the article body — any line starting with `>` in the body text becomes a candidate pull-quote. The `ArticleBody` component already detects blockquote syntax. The sidebar displays up to 3 blockquotes from the article; on mobile they render inline as standard blockquotes (existing behavior).

### 3B. Newspaper Grid

**Where:** Home page FeaturedArticles section. Articles list page (first 3 items only).

**Structure:**
- 2-column asymmetric grid: lead story takes left column spanning 2 rows, 2 secondary stories stack on the right
- Lead story card: larger, with cover image as background, text overlaid at bottom, lens-colored top border (3px)
- Secondary cards: compact, no cover image, lens-colored top border (2px)
- Below the newspaper grid, remaining articles continue in the standard 3-column card grid

**Responsive:**
- Desktop (lg+): 2-column asymmetric grid
- Tablet (sm-lg): Lead story full-width, secondary stories 2-column
- Mobile: All stories stack vertically as standard ArticleCards

---

## 4. Page-Level Changes

### Home Page
1. FeaturedArticles: swap card grid for Newspaper Grid (first 3 articles)
2. RotatingQuote: replace internals with QuoteCard — keep the existing `RotatingQuote.tsx` wrapper (useState, useEffect, AnimatePresence rotation logic) but swap its inner markup to render a `QuoteCard` instead of the current custom layout. The wrapper stays `"use client"`, `QuoteCard` itself is a presentational Server Component used inside it.
3. Add one PosterBlock between BriefingPreview and FeaturedArticles as a section break. Data is hardcoded in `page.tsx` — a curated editorial callout (title, lens, excerpt, link to a featured article). Updated manually by the developer when content changes. When the admin dashboard exists, this becomes dynamic.
4. HeroBanner, ThreeLenses, JoinCTA: **no changes** — they work

### Briefing Detail Page (`/briefings/[slug]`)
1. Replace current header block with MagazineCoverHero
2. Add pull-quote sidebar on desktop for section content
3. Section dividers (StarDivider): unchanged
4. Navigation (prev/next): unchanged

### Article Detail Page (`/articles/[slug]`)
1. Cover image: upgrade from `.halftone` to `.halftone-heavy`
2. Add pull-quote sidebar on desktop
3. `ArticleBody` parser: detect `<mark>` tags in the body string and render them with the `.marker` CSS class. Authors write `<mark>key phrase</mark>` directly in the Supabase body text.
4. Article metadata, related articles: unchanged

### Articles List Page (`/articles`)
1. First 3 articles: Newspaper Grid layout
2. Remaining articles: keep current card grid
3. Filters, load more: unchanged

### All Pages (Global)
1. Grain opacity increase: `0.04` → `0.09`
2. New CSS utilities available: `.halftone-heavy`, `.duotone`, `.marker`, `.paper-texture`
3. No changes to: Navbar, Footer, StarDivider, LensBadge, or any existing component internals

---

## 5. What Does NOT Change

Explicitly listing what stays untouched to prevent scope creep:

- **Navbar.tsx** — navigation, auth buttons, mobile menu
- **Footer.tsx** — newsletter form, social links, site links
- **ArticleCard.tsx** — used in grids, working fine
- **BriefingCard.tsx** — used on briefings list page, working fine
- **VideoCard.tsx** — used on video page
- **CourseCard.tsx** — used on academy page
- **StarDivider.tsx** — section separators
- **LensBadge.tsx** — lens category labels
- **PaywallGate.tsx** — subscription gating
- **Auth pages** — login, signup, portal, settings
- **Support, Contact, Pricing, Privacy, Terms pages**
- **Tailwind config** — color palette, font families, max-widths (already correct)
- **Brand color values** — confirmed to match Instagram. No changes.

---

## 6. Technical Constraints

- All new components: Server Components by default, `"use client"` only if needed (QuoteCard rotation needs it)
- All styling via Tailwind + CSS variables — no CSS modules, no styled-components
- No `border-radius` larger than 4px anywhere (brand rule)
- No shadows, no gradients, no glassmorphism (brand rule)
- Framer Motion only for page transitions and scroll animations — keep subtle
- Images: grain/halftone applied via CSS, not image processing
- Mobile-first responsive: all layouts must work at 375px

---

## 7. Success Criteria

After implementation:
1. `npm run build` passes cleanly
2. `npx tsc --noEmit` passes with no errors
3. Home page at 375px and 1440px renders without horizontal overflow
4. Grain is visibly textured on hero sections at 1440px
5. Weekend Briefing detail page uses MagazineCoverHero with cream header
6. At least one QuoteCard visible on the home page
7. At least one PosterBlock visible on the home page
8. Article detail pages show pull-quote sidebar on desktop (1024px+)
9. Red marker highlight renders on `<mark>` elements in article body
10. No changes to Navbar, Footer, or any page listed in "What Does NOT Change"
