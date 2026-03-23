# BMJ Brand Identity Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the new brand direction from the friend's art-direction rewrite and asset package — new logo system, expanded color palette, tagline, and updated brand documentation — while preserving the existing militant print-culture aesthetic and 589-test passing build.

**Architecture:** The brand brief largely *reinforces* the existing art-direction spec. The material changes are: (1) new logo mark (journal/book with star+pen nib replacing flat star), (2) expanded accent palette with section colors, (3) tagline addition ("Speak the Truth. Navigate the Consequences."), and (4) updated brand governance docs. Font migration is BLOCKED by licensing — documented but deferred. Content taxonomy expansion (3→5 lenses) is a separate plan per the existing restructuring decision.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, CSS custom properties, next/font, SVG

---

## Decisions Required Before Execution

These decisions must be resolved by the project owner before any code work begins. The plan is structured so that work can proceed on unblocked tasks while decisions are pending.

### Decision 1: Font Licensing

The friend's package includes four font families:

| Font | Role | License | Status |
|------|------|---------|--------|
| Highrise | Title/Display | **PERSONAL USE ONLY** (Indieground, $15-39 commercial) | BLOCKED |
| Linux Libertine | Body Text | GPL + OFL (free commercial) | CLEAR |
| Parkson | Display/Editorial | **PERSONAL USE ONLY** (needs license check) | BLOCKED |
| MADE TOMMY | Labels/UI | **PERSONAL USE ONLY** (MadeType, commercial license needed) | BLOCKED |

**Options:**
- **A) Purchase commercial licenses** for Highrise, Parkson, and MADE TOMMY, then execute a full font migration
- **B) Adopt only Linux Libertine** (body text, replacing Libre Baskerville) and keep Bebas Neue/Oswald/IBM Plex Mono
- **C) Defer all font changes** — keep the current Google Fonts stack until commercial fonts are secured
- **D) Find open-source alternatives** that match the condensed/editorial character of the proposed fonts

**Recommendation:** Option C (defer). The current Bebas Neue + Libre Baskerville stack already achieves the condensed militant aesthetic. Font migration can be a follow-up plan once licenses are secured. This plan proceeds assuming Option C.

### Decision 2: Purple as Sectional Accent

The current invariants explicitly prohibit purple. The friend's palette includes `#554978` (muted purple) as a sectional accent for "Technology & Entertainment."

**Options:**
- **A) Allow muted purple as a controlled sectional accent** — update invariants to permit it "sparingly, tied to a specific content domain"
- **B) Reject purple** — substitute with an existing palette color (e.g., dark brown variant)
- **C) Defer** until the 3→5 lens taxonomy expansion is planned

**Recommendation:** Option C (defer). Purple only matters once the taxonomy expands. Don't update invariants for a color that has no current use case.

### Decision 3: Content Taxonomy (3 Lenses → 5 Categories)

The palette image proposes 5 categories: Politics & Philosophy, Culture & Current Events, Health & Wellness, Business & Finance, Technology & Entertainment. The existing restructuring plan already deferred this as "Decision 5 (lenses 3→5, scoped separately)."

**This plan does NOT implement taxonomy changes.** It wires in the expanded accent palette at the CSS level so colors are available when the taxonomy plan executes. The taxonomy expansion requires its own plan (database migration, routing, component updates, seed data).

### Decision 4: Logo Format

The friend provided PNG logos only. For web use we need SVG versions for:
- Favicon (must be SVG or ICO for sharp rendering at small sizes)
- Inline nav/footer marks (currently SVG paths in components)
- OG image generation
- Placeholder covers

**Options:**
- **A) Request SVG exports from the designer** — best quality, smallest file size
- **B) Use PNGs directly** with Next.js Image optimization — functional but larger files, no inline embedding
- **C) Trace the PNGs to SVG** — acceptable for simple shapes like the submark/favicon

**Recommendation:** Option A for primary/secondary logos, Option C for the simple submark and favicon shapes. Ask the friend for SVG files.

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `public/logos/primary-color.png` | New primary logo (color) |
| Create | `public/logos/primary-black.png` | New primary logo (black) |
| Create | `public/logos/primary-white.png` | New primary logo (white) |
| Create | `public/logos/secondary-color.png` | Secondary logo #BMJ (color) |
| Create | `public/logos/secondary-black.png` | Secondary logo #BMJ (black) |
| Create | `public/logos/secondary-white.png` | Secondary logo #BMJ (white) |
| Create | `public/logos/submark-color.png` | Submark/book icon (color) |
| Create | `public/logos/submark-black.png` | Submark/book icon (black) |
| Create | `public/logos/submark-white.png` | Submark/book icon (white) |
| Create | `public/logos/logo.gif` | Animated logo |
| Modify | `public/favicon.svg` | New favicon from star+pen nib mark |
| Modify | `public/logo.svg` | New logo mark SVG |
| Modify | `public/og-image.svg` | Regenerate with new logo + tagline |
| Modify | `public/placeholder-cover.svg` | Update with new book/star motif |
| Modify | `src/styles/brand.css` | Add expanded accent palette |
| Modify | `tailwind.config.ts` | Add new accent colors to theme |
| Modify | `src/components/layout/Navbar.tsx` | New logo mark, tagline, updated star SVG |
| Modify | `src/components/layout/Footer.tsx` | New logo mark, tagline |
| Modify | `src/components/ui/StarDivider.tsx` | Update star SVG path to match new pen-nib star |
| Modify | `src/components/home/HeroBanner.tsx` | New logo watermark, tagline integration |
| Modify | `src/components/content/PosterBlock.tsx` | Update inline star motif |
| Modify | `docs/brand/art-direction-spec.md` | Integrate friend's brand brief as canonical spec |
| Modify | `docs/brand/invariants.md` | Update palette section, add accent colors, update logo references |

---

## Task 1: Copy Logo Assets to Public Directory

**Files:**
- Create: `public/logos/` directory and 10 logo files
- Create: `public/logos/logo.gif` (animated version)

- [ ] **Step 1: Create the logos directory**

```bash
mkdir -p public/logos
```

- [ ] **Step 2: Copy all logo variants from the friend's package**

```bash
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Primary Logo/BMJ Primary Color.png" public/logos/primary-color.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Primary Logo/BMJ Primary Black.png" public/logos/primary-black.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Primary Logo/BMJ Primary White.png" public/logos/primary-white.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Primary Logo/BMJ Logo.gif" public/logos/logo.gif
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Secondary Logo/BMJ Secondary Color.png" public/logos/secondary-color.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Secondary Logo/BMJ Secondary Black.png" public/logos/secondary-black.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Secondary Logo/BMJ Secondary White.png" public/logos/secondary-white.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Submark/BMJ Submark Color.png" public/logos/submark-color.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Submark/BMJ Submark Black.png" public/logos/submark-black.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Submark/BMJ Submark White.png" public/logos/submark-white.png
```

- [ ] **Step 3: Copy favicon variants**

```bash
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Favicon/BMJ Favicon Color.png" public/logos/favicon-color.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Favicon/BMJ Favicon Black.png" public/logos/favicon-black.png
cp "C:/Users/mesha/Downloads/BJM-files/Logos-20260318T012446Z-1-001/Logos/Favicon/BMJ Favicon Off White.png" public/logos/favicon-offwhite.png
```

- [ ] **Step 4: Copy the palette reference image**

```bash
cp "C:/Users/mesha/Downloads/BJM-files/BMJ Palettes.png" docs/brand/bmj-palettes-reference.png
```

- [ ] **Step 5: Verify all files copied correctly**

```bash
ls -la public/logos/
```

Expected: 13 files (10 logos + 3 favicons), all non-zero size.

- [ ] **Step 6: Commit**

```bash
git add public/logos/ docs/brand/bmj-palettes-reference.png
git commit -m "chore: add new brand logo assets from designer package"
```

---

## Task 2: Expand the CSS Color Palette

**Files:**
- Modify: `src/styles/brand.css` (lines 5-12)
- Modify: `tailwind.config.ts` (lines 11-20)

The friend's palette image introduces five sectional accent colors alongside the existing core palette. We wire these in at the token level now so they're available when the taxonomy expansion plan executes.

- [ ] **Step 1: Write the failing test — verify new CSS variables exist**

Create test: `tests/lib/brand-palette.test.ts`

```typescript
/**
 * Verifies the expanded brand palette CSS variables are defined in brand.css.
 * This test reads the raw CSS file to ensure all expected variables exist.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const brandCSS = readFileSync(
  resolve(__dirname, "../../src/styles/brand.css"),
  "utf-8"
);

describe("Brand palette CSS variables", () => {
  const expectedVars = [
    // Core palette (existing)
    "--bmj-black",
    "--bmj-cream",
    "--bmj-red",
    "--bmj-amber",
    "--bmj-brown",
    "--bmj-tan",
    "--bmj-white",
    // Expanded accent palette (new)
    "--bmj-paper",
    "--bmj-deep-black",
    "--bmj-crimson",
    "--bmj-olive",
    "--bmj-gold",
    "--bmj-purple",
    "--bmj-medium-brown",
  ];

  test.each(expectedVars)("defines %s", (varName) => {
    expect(brandCSS).toContain(varName);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern=brand-palette --verbose`

Expected: FAIL — new variables (`--bmj-paper`, `--bmj-deep-black`, etc.) not found in brand.css.

- [ ] **Step 3: Add new accent colors and tagline to brand.css**

In `src/styles/brand.css`, expand the `:root` block. Add new variables after the existing palette, clearly sectioned:

```css
:root {
  /* ─── Core palette (unchanged) ─── */
  --bmj-black:  #0D0C0B;
  --bmj-cream:  #E8DCC8;
  --bmj-red:    #C0281F;
  --bmj-amber:  #C8852A;
  --bmj-brown:  #3B2417;
  --bmj-tan:    #B8986A;
  --bmj-white:  #F2EDE4;

  /* ─── Expanded accent palette (from designer package 2026-03-17) ─── */
  /* These are sectional/thematic accents — use sparingly per art-direction-spec.md */
  --bmj-paper:        #F0DDBC;  /* Lighter paper ground — backgrounds, cards */
  --bmj-deep-black:   #1C130E;  /* Near-black — heavier typographic weight */
  --bmj-crimson:      #712414;  /* Deep crimson — politics/philosophy accent */
  --bmj-medium-brown: #5D3F2E;  /* Medium brown — culture/editorial accent */
  --bmj-olive:        #416100;  /* Olive green — health/wellness accent */
  --bmj-gold:         #C77A0E;  /* Warm gold — finance/business accent */
  --bmj-purple:       #554978;  /* Muted purple — technology accent (use with restraint) */

  /* Font family references (values set by next/font CSS variables) */
  --font-display: var(--font-bebas-neue), 'Bebas Neue', sans-serif;
  --font-body:    var(--font-libre-baskerville), 'Libre Baskerville', serif;
  --font-label:   var(--font-oswald), 'Oswald', sans-serif;
  --font-mono:    var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;

  /* Grain overlay */
  --grain-opacity: 0.09;
  --texture-url: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");

  /* Spacing scale */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;
  --space-2xl: 3rem;

  /* Max-width scale */
  --width-content: 1200px;
  --width-article:  720px;
  --width-wide:    1440px;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern=brand-palette --verbose`

Expected: PASS — all 15 variables found.

- [ ] **Step 5: Add new colors to Tailwind config**

In `tailwind.config.ts`, extend the `colors.bmj` object:

```typescript
colors: {
  bmj: {
    black:         "#0D0C0B",
    cream:         "#E8DCC8",
    red:           "#C0281F",
    amber:         "#C8852A",
    brown:         "#3B2417",
    tan:           "#B8986A",
    white:         "#F2EDE4",
    // Expanded accent palette
    paper:         "#F0DDBC",
    "deep-black":  "#1C130E",
    crimson:       "#712414",
    "medium-brown":"#5D3F2E",
    olive:         "#416100",
    gold:          "#C77A0E",
    purple:        "#554978",
  },
},
```

- [ ] **Step 6: Verify the build still passes**

Run: `npx tsc --noEmit && npm run build`

Expected: Clean build, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/styles/brand.css tailwind.config.ts tests/lib/brand-palette.test.ts
git commit -m "feat: expand brand palette with sectional accent colors from designer package"
```

---

## Task 3: Update the Star Motif SVG to Match New Logo

The new logo features a **star with a fountain pen nib** emerging from its top point. This replaces the flat five-pointed star currently used as the brand divider, watermark, and inline motif across the site.

**Files:**
- Modify: `src/components/ui/StarDivider.tsx`
- Modify: `src/components/home/HeroBanner.tsx` (watermark SVG)
- Modify: `src/components/layout/Navbar.tsx` (inline star SVG)
- Modify: `src/components/layout/Footer.tsx` (inline star SVG)
- Modify: `src/components/content/PosterBlock.tsx` (inline star motif)

**NOTE:** This task requires an SVG path of the new star+pen nib mark. If SVGs are not available from the designer (see Decision 4), this task should be deferred until they are. The PNG favicon can be traced to SVG for a simplified version, or the designer can provide vector files.

**If proceeding with a traced/simplified SVG:**

- [ ] **Step 1: Write the failing test for BrandMark component**

Create: `tests/components/BrandMark.test.tsx`

```tsx
import { render } from "@testing-library/react";
import { BrandMark } from "@/components/brand/BrandMark";

describe("BrandMark", () => {
  it("renders an SVG with aria-hidden", () => {
    const { container } = render(<BrandMark />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts a custom size", () => {
    const { container } = render(<BrandMark size={64} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
  });

  it("defaults to size 32", () => {
    const { container } = render(<BrandMark />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
  });

  it("uses bmj-white for the nib hole (never raw white)", () => {
    const { container } = render(<BrandMark color="var(--bmj-red)" />);
    const circle = container.querySelector("circle");
    expect(circle).toHaveAttribute("fill", "#F2EDE4");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern=BrandMark --verbose`

Expected: FAIL — `@/components/brand/BrandMark` module not found.

- [ ] **Step 3: Create the BrandMark component**

Create: `src/components/brand/BrandMark.tsx`

```tsx
/**
 * The BMJ brand mark — star with fountain pen nib.
 * Used inline in nav, footer, dividers, and as watermark.
 * Traced from the designer's favicon mark.
 *
 * Design decisions:
 * - The pen nib is always --bmj-deep-black (#1C130E), regardless of the color prop.
 *   This preserves the two-tone mark identity at any size.
 * - The nib hole is always --bmj-white (#F2EDE4), never raw CSS white.
 * - The star body takes the color prop.
 *
 * Props:
 * - size: width/height in pixels (default 32)
 * - color: star body fill color (default "currentColor")
 * - className: additional Tailwind classes
 */
interface BrandMarkProps {
  size?: number;
  color?: string;
  className?: string;
}

export function BrandMark({ size = 32, color = "currentColor", className = "" }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Pen nib — always deep-black, part of mark identity */}
      <path
        d="M50 0 C45 15, 38 20, 35 28 L50 22 L65 28 C62 20, 55 15, 50 0Z"
        fill="#1C130E"
      />
      {/* Nib hole — always bmj-white, never raw white */}
      <circle cx="50" cy="18" r="3" fill="#F2EDE4" />
      {/* Five-pointed star body — takes color prop */}
      <path
        d="M50 28 L61 58 L95 58 L67 74 L78 100 L50 82 L22 100 L33 74 L5 58 L39 58 Z"
        fill={color}
      />
    </svg>
  );
}
```

**IMPORTANT:** The SVG paths above are approximate traces. Replace with exact paths from the designer's vector files when available. The component structure and API are what matter here.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern=BrandMark --verbose`

Expected: PASS — all 4 tests green.

- [ ] **Step 5: Update StarDivider to use BrandMark**

Read `src/components/ui/StarDivider.tsx`, then replace the inline star SVG with `<BrandMark>`. Keep the horizontal line pattern and accessibility attributes.

- [ ] **Step 6: Update Navbar inline star**

Read `src/components/layout/Navbar.tsx`, find the 32x32 inline star SVG (lines 60-72), and replace with `<BrandMark size={32} color="var(--bmj-red)" />`.

- [ ] **Step 7: Update Footer inline star**

Read `src/components/layout/Footer.tsx`, find the 28x28 inline star SVG (lines 29-41), and replace with `<BrandMark size={28} color="var(--bmj-red)" />`.

- [ ] **Step 8: Update HeroBanner watermark**

Read `src/components/home/HeroBanner.tsx`, find the 700x700 watermark star SVG. The existing fill is `var(--bmj-cream)` — preserve this color to maintain the current subtle watermark effect. Replace with `<BrandMark size={700} color="var(--bmj-cream)" className="opacity-[0.025]" />`.

- [ ] **Step 9: Update PosterBlock inline star**

Read `src/components/content/PosterBlock.tsx`, find the star motif (lines 45-51, styled with `className="absolute right-6 top-6 z-10 h-8 w-8"` = 32x32 pixels). Replace the inline SVG with `<BrandMark size={32} color="var(--bmj-red)" className="absolute right-6 top-6 z-10" />`. Keep the positioning classes.

- [ ] **Step 10: Run full test suite**

Run: `npm test`

Expected: All 589+ tests pass. No visual regressions in the star rendering.

- [ ] **Step 11: Commit**

```bash
git add src/components/brand/BrandMark.tsx tests/components/BrandMark.test.tsx src/components/ui/StarDivider.tsx src/components/layout/Navbar.tsx src/components/layout/Footer.tsx src/components/home/HeroBanner.tsx src/components/content/PosterBlock.tsx
git commit -m "feat: replace flat star motif with new brand mark (star + pen nib)"
```

---

## Task 4: Add Tagline to Navbar and Footer

The new logo includes the tagline: **"Speak the Truth. Navigate the Consequences."**

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Write test for tagline in Navbar**

Add to the existing Navbar test file at `tests/components/Navbar.test.tsx`:

```typescript
it("displays the brand tagline on desktop", () => {
  render(<Navbar />);
  expect(screen.getByText(/Speak the Truth/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern=Navbar --verbose`

Expected: FAIL — tagline text not found.

- [ ] **Step 3: Add tagline to Navbar**

Read `src/components/layout/Navbar.tsx`. Below the wordmark ("The Black Male Journal"), add a tagline element visible only at `lg:` breakpoint and above:

```tsx
<span className="hidden lg:block font-label text-[10px] uppercase tracking-[0.2em] text-bmj-tan">
  Speak the Truth. Navigate the Consequences.
</span>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern=Navbar --verbose`

Expected: PASS

- [ ] **Step 5: Add tagline to Footer**

Read `src/components/layout/Footer.tsx`. Below the footer wordmark, add:

```tsx
<p className="font-label text-xs uppercase tracking-[0.15em] text-bmj-tan/70 mt-1">
  Speak the Truth. Navigate the Consequences.
</p>
```

- [ ] **Step 6: Run full test suite**

Run: `npm test`

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/Footer.tsx
git commit -m "feat: add brand tagline to Navbar and Footer"
```

---

## Task 5: Update Favicon and OG Image

**Files:**
- Modify: `public/favicon.svg`
- Modify: `public/og-image.svg`
- Modify: `public/placeholder-cover.svg`

**NOTE:** If SVG versions of the new mark are not available (pending Decision 4), use the PNG favicon at `public/logos/favicon-color.png` and reference it in `layout.tsx` metadata as a PNG icon instead.

- [ ] **Step 1: Update favicon.svg with new star+pen mark**

Replace the contents of `public/favicon.svg` with the new brand mark SVG (same path data as `BrandMark.tsx` but as a standalone file, with the crimson/brown star fill and black pen nib).

- [ ] **Step 2: Update og-image.svg**

Regenerate `public/og-image.svg` as a 1200x630 composition:
- Background: `#0D0C0B` (bmj-black)
- New brand mark centered, large, in `#712414` (crimson) at 20% opacity as watermark
- "THE BLACK MALE JOURNAL" in condensed caps (Bebas Neue style)
- Tagline below: "Speak the Truth. Navigate the Consequences."
- Three lens labels at bottom: HEALTH | PHILOSOPHY | POLITICS in `#B8986A` (tan)

- [ ] **Step 3: Update placeholder-cover.svg**

Regenerate `public/placeholder-cover.svg` with the new book/star mark centered on a `#3B2417` (brown) background with grain texture.

- [ ] **Step 4: Verify metadata references in layout.tsx**

Read `src/app/layout.tsx` and ensure the `metadata.icons` and `metadata.openGraph.images` paths still point to the correct files.

- [ ] **Step 5: Run build to verify**

Run: `npm run build`

Expected: Clean build.

- [ ] **Step 6: Commit**

```bash
git add public/favicon.svg public/og-image.svg public/placeholder-cover.svg
git commit -m "feat: update favicon, OG image, and placeholder with new brand mark"
```

---

## Task 6: Update Art Direction Spec

Integrate the friend's brand brief into the canonical art-direction document. The friend's writeup is richer and more specific than the current spec — it should replace the existing content while preserving the governing decisions section.

**Files:**
- Modify: `docs/brand/art-direction-spec.md`

- [ ] **Step 1: Read current spec**

Read `docs/brand/art-direction-spec.md` (already read — 114 lines).

- [ ] **Step 2: Rewrite the spec**

Replace the spec content with the friend's elevated art-direction text, structured under the existing headings. Preserve the "Governing Decisions" section and add new decisions. The new spec should include:

1. **Core Positioning** — use the friend's opening paragraph ("The Black Male Journal's visual identity is rooted in revolutionary editorial culture...")
2. **Tone** — use the militant + confrontational + print-driven sections
3. **Brand Attributes** — keep existing list, add "Pan-African" and "Doctrinal" as explicit attributes
4. **Visual Principles** — keep existing 7 principles, enriched with the friend's language
5. **Color Hierarchy** — update to reflect the expanded palette:
   - Primary (ideological core): Red, Off-black, Cream/paper
   - Secondary (controlled accents): Brown, Green, Gold, Purple — "sectional accents rather than co-equal primaries"
6. **Typography Direction** — keep existing (no font change yet)
7. **Image Direction** — keep existing, enriched with "iconic rather than casual" language
8. **Texture & Surface** — enriched with "reproduced, circulated, handled, posted, archived" language
9. **Do/Don't** — keep existing, add "Don't: let the site feel like a social-content brand or think-piece aggregator"
10. **One-Paragraph Spec** — replace with friend's tightened version
11. **Elevated Art-Direction Statement** — add friend's final paragraph as a premium reference
12. **Governing Decisions** — preserve existing Decisions 1-3, 5. **Update Decision 4** from "Green not required now" to "Green (olive) wired at CSS level as `--bmj-olive`; component-level use deferred to taxonomy expansion plan." Then add new:
    - Decision 6: Tagline adopted — "Speak the Truth. Navigate the Consequences."
    - Decision 7: Logo mark updated — journal/book with star+pen nib
    - Decision 8: Expanded accent palette (7 new colors) wired at CSS level; sectional component use deferred to taxonomy plan
    - Decision 9: Font changes deferred pending commercial license acquisition for Highrise, Parkson, and MADE TOMMY

- [ ] **Step 3: Commit**

```bash
git add docs/brand/art-direction-spec.md
git commit -m "docs: integrate designer's brand brief into art-direction spec"
```

---

## Task 7: Update Brand Invariants

**Files:**
- Modify: `docs/brand/invariants.md`

- [ ] **Step 1: Read current invariants**

Read `docs/brand/invariants.md` (already read — 86 lines).

- [ ] **Step 2: Update the Color section**

Add the expanded accent palette under a new "Sectional Accents" sub-section:

```markdown
### Color
- **Core palette only:** `#0D0C0B` (black), `#E8DCC8` (cream), `#F2EDE4` (white), `#C0281F` (red)
- **Secondaries (use sparingly):** `#C8852A` (amber), `#3B2417` (brown), `#B8986A` (tan)
- **Sectional accents (use only when tied to a specific content domain):**
  - `#F0DDBC` (paper) — lighter paper ground for card backgrounds
  - `#1C130E` (deep-black) — heavier typographic weight
  - `#712414` (crimson) — politics/philosophy accent
  - `#5D3F2E` (medium-brown) — culture/editorial accent
  - `#416100` (olive) — health/wellness accent
  - `#C77A0E` (gold) — finance/business accent
  - `#554978` (purple) — technology accent (**deferred until taxonomy expansion**)
- **PROHIBITED:** pastels, gradients, blue, neon, any color not in the brand.css palette
- Red is for urgency and command — accents, CTAs, active states, section breaks
```

Note: "purple" moves from PROHIBITED to "deferred sectional accent." This is intentional — it is wired in the CSS but not yet used in any component. The prohibition on purple *as a primary or casual decorative color* remains.

- [ ] **Step 3: Update the Logo section**

Add a new section after Typography:

```markdown
### Logo System
- **Primary logo:** Wordmark with journal/book icon — used in OG images, about page, print
- **Secondary logo:** #BMJ with book icon — used for social media, compact spaces
- **Submark:** Book icon only (star + pen nib) — used for watermarks, small marks
- **Favicon:** Star + pen nib — derived from submark, simplified for 16x16/32x32
- **BrandMark component** (`src/components/brand/BrandMark.tsx`) is the canonical inline SVG — use it instead of inline SVG paths in components
- Logo files: `public/logos/` (PNG variants), `public/favicon.svg`, `public/logo.svg`
```

- [ ] **Step 4: Update the File Locations table**

Add new entries:

```markdown
| Logo assets (PNG)         | `public/logos/` |
| Brand mark component      | `src/components/brand/BrandMark.tsx` |
| Palette reference image   | `docs/brand/bmj-palettes-reference.png` |
```

- [ ] **Step 5: Commit**

```bash
git add docs/brand/invariants.md
git commit -m "docs: update invariants with expanded palette, logo system, and brand mark"
```

---

## Task 8: Update CLAUDE.md Project Instructions

**Files:**
- Modify: `CLAUDE.md` (project root)

- [ ] **Step 1: Read current CLAUDE.md**

Read `CLAUDE.md`.

- [ ] **Step 2: Update the Brand System section**

Update the color palette section to include new accent colors. Add the tagline. Update the logo description. Add a note about the new BrandMark component.

Key changes:
- Add `--bmj-paper`, `--bmj-deep-black`, `--bmj-crimson`, `--bmj-olive`, `--bmj-gold`, `--bmj-medium-brown` to the color list with notes like "(sectional accent — deferred)"
- Update PROHIBITED line: remove "purple" from blanket prohibition, add "purple outside its designated section context"
- Add: `Tagline: "Speak the Truth. Navigate the Consequences."`
- Add: `Logo: Journal/book icon with star + pen nib (see public/logos/ for all variants)`
- Add `BrandMark` component reference under Components section

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with expanded brand palette and logo system"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: All tests pass (589+ existing + new brand palette test + BrandMark test).

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: No errors.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: Clean production build.

- [ ] **Step 5: Visual check**

Start the dev server and verify:
- Navbar shows new brand mark + tagline (desktop only for tagline)
- Footer shows new brand mark + tagline
- StarDivider uses new pen-nib star
- HeroBanner watermark uses new mark
- All existing pages render without visual regression
- Check at 375px (mobile) and 1440px (desktop)

Run: `npm run dev`

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: visual adjustments from brand identity review"
```

---

## Deferred Work (Separate Plans Required)

### Font Migration Plan (blocked on licensing)
Once commercial licenses are secured for Highrise, Parkson, and/or MADE TOMMY:
1. Self-host fonts in `public/fonts/` (OTF/WOFF2)
2. Update `src/app/layout.tsx` to use `next/font/local` instead of `next/font/google`
3. Update font variable declarations in `brand.css`
4. Update Tailwind `fontFamily` config
5. Update invariants and CLAUDE.md
6. Visual regression test across all pages

### Content Taxonomy Expansion Plan (3 → 5 Lenses)
Already scoped as a separate plan from the site restructuring. Requires:
1. Database migration — add new lens enum values
2. Update `src/lib/supabase/queries.ts` — new lens filters
3. Update `LensBadge.tsx` — new lens colors using the expanded accent palette
4. Update all filter components (`LensFilterTabs`, `CategoryFilterTabs`)
5. New seed data for new categories
6. Routing updates if category URLs change
7. This is where `--bmj-olive`, `--bmj-gold`, `--bmj-purple`, `--bmj-crimson`, `--bmj-medium-brown` get their first real component-level use

### SVG Vectorization
Request SVG exports from the designer for:
- Primary logo → `public/logo.svg`
- Submark → inline in `BrandMark.tsx`
- Favicon → `public/favicon.svg`
This enables proper inline SVG rendering, smaller file sizes, and color customization.
