# BMJ Brand Compliance & Art Direction Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate three explicit brand violations, build systemic image treatment readiness, strengthen the homepage hero's declaration quality, and codify visual invariants as implementation law.

**Architecture:** Surgical precision pass — no redesigns. Fix violations at their source files, create one new reusable component (`TreatedImage`), add publication identifiers to `HeroBanner`, and produce a brand invariants document. All changes are independently testable and deployable.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Framer Motion, React Testing Library (Jest), Playwright E2E

---

## Visual Audit Summary

### Aligned (no action required)
- **Color palette** — `#0D0C0B` black, `#E8DCC8` cream, `#C0281F` red, `#C8852A` amber, `#3B2417` brown, `#B8986A` tan all correct and consistently applied
- **Typography** — Bebas Neue (display, ALL-CAPS enforced via CSS), Libre Baskerville (body editorial), Oswald (labels + tracking), IBM Plex Mono (dates/metadata) — stack maps exactly to spec
- **Grain texture** — `.grain::after` applied globally at 0.09 opacity via `feTurbulence` fractal noise SVG
- **Halftone/texture utilities** — `.halftone`, `.halftone-heavy`, `.halftone-dots`, `.duotone`, `.paper-texture` all defined in `globals.css` and applied to images on cards
- **Star motif** — used as watermark (HeroBanner), section divider (StarDivider), and brand icon throughout
- **Red accent system** — `.accent-border-top/bottom`, `border-bmj-red`, `border-l-4 border-bmj-red` — consistent across all section breaks and blockquotes
- **Newspaper grid** — `NewspaperGrid.tsx` uses `border-t-[3px]` lens colors; multi-column layout with editorial hierarchy
- **Button system** — `.btn-primary` (red bg, Oswald, uppercase, tracking) and `.btn-secondary` (cream border) are correctly defined
- **No prohibited elements** — zero pastels, gradients (except one violation), neon, purple, blue, rounded corners > 4px, glassmorphism in 42 of 45 components
- **Lens color system** — health (amber), philosophy (tan), politics (red) — applied consistently in LensBadge, NewspaperGrid, ThreeLenses

### Almost There
- **HeroBanner** — headline mass and grain are correct; subheadline tone reads as editorial; missing publication-identifying metadata (vol/date stamp, three-lens footer) that would shift it from "presenting" to "declaring"
- **ThreeLenses** — layout and typography correct; `hover:shadow-[0_0_0_1px_var(--bmj-red)]` uses CSS shadow property for what is functionally a ring/border effect — technically violates the spec's shadow prohibition even though visually minimal
- **Image treatment** — utilities exist in `globals.css` but are applied ad-hoc via `className` props on individual `<img>` tags. No reusable component enforces consistent treatment. Posterized portraiture is aspirationally supported but has no systemic readiness

### Off-Brand (must fix)
| File | Line | Violation | Severity |
|------|------|-----------|----------|
| `src/components/content/PaywallGate.tsx` | 26 | `bg-gradient-to-b from-transparent to-bmj-black` — gradients explicitly prohibited | HIGH |
| `src/components/ui/BackToTop.tsx` | 27 | `shadow-lg` — drop shadows explicitly prohibited | LOW |
| `src/components/home/ThreeLenses.tsx` | 60 | `hover:shadow-[0_0_0_1px_var(--bmj-red)]` — shadow property prohibited | LOW |

### Highest-Leverage Changes
1. **PaywallGate gradient → StarDivider editorial break** — single most visible brand violation; the fix also makes the gate feel more authoritative (print curtain vs. digital fade)
2. **TreatedImage component** — turns ad-hoc class application into a reusable, enforced contract for all editorial imagery
3. **HeroBanner publication stamp** — adds the "declaration not presentation" quality with 2 lines of text
4. **Visual invariants document** — converts this spec into implementation law; future contributors have no ambiguity

---

## Governing Constraints

1. **Brand fidelity over token standardization** — any external token package is acceptable only if it preserves current BMJ output exactly. If it drifts the palette toward warmth, BMJ-specific tokens override.
2. **Halftone as utility first** — CSS/SVG/component-level support before preprocessed assets. `TreatedImage` is the right abstraction.
3. **Posterized portraiture = readiness requirement** — audit whether the system can support it once content exists. Not a content failure.
4. **Green not required now** — valid future secondary; do not wire in yet.
5. **Accessibility non-negotiable** — militant aesthetic achieved within WCAG-compliant contrast, legibility, and interaction standards.

---

## File Map

### Modified
- `src/components/ui/BackToTop.tsx` — remove `shadow-lg`
- `src/components/home/ThreeLenses.tsx` — replace shadow-based hover ring with border
- `src/components/content/PaywallGate.tsx` — remove gradient overlay, add StarDivider break
- `src/components/home/HeroBanner.tsx` — add publication stamp, strengthen rule, add lens footer
- `tests/components/BackToTop.test.tsx` — add brand compliance assertion
- `tests/components/PaywallGate.test.tsx` — add no-gradient assertion, editorial break assertion

### Created
- `src/components/ui/TreatedImage.tsx` — reusable image treatment component (3 variants)
- `tests/components/TreatedImage.test.tsx` — variant class assertions
- `tests/components/ThreeLenses.test.tsx` — brand compliance assertions
- `tests/components/HeroBanner.test.tsx` — publication stamp and lens footer assertions
- `docs/brand/invariants.md` — BMJ Visual Invariants (implementation law)

---

## Task 1: Fix BackToTop Shadow Violation

**Files:**
- Modify: `src/components/ui/BackToTop.tsx:27`
- Test: `tests/components/BackToTop.test.tsx`

- [ ] **Step 1: Write the failing test**

  Add a brand-compliance test to the existing `BackToTop.test.tsx`:

  ```tsx
  // tests/components/BackToTop.test.tsx — add to existing describe block
  test('does not use drop shadows (brand compliance)', () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button.className).not.toMatch(/shadow/);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  npm test -- tests/components/BackToTop.test.tsx --no-coverage
  ```

  Expected: FAIL — `expect(button.className).not.toMatch(/shadow/)` — the class `shadow-lg` is present

- [ ] **Step 3: Remove shadow-lg**

  In `src/components/ui/BackToTop.tsx`, line 27, change:
  ```tsx
  // Before:
  className="fixed bottom-8 right-8 z-50 border border-bmj-tan/30 bg-bmj-brown p-3 text-bmj-cream shadow-lg transition-all hover:border-bmj-red hover:text-bmj-white"

  // After:
  className="fixed bottom-8 right-8 z-50 border border-bmj-tan/30 bg-bmj-brown p-3 text-bmj-cream transition-all hover:border-bmj-red hover:text-bmj-white"
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  npm test -- tests/components/BackToTop.test.tsx --no-coverage
  ```

  Expected: all 4 tests PASS

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/ui/BackToTop.tsx tests/components/BackToTop.test.tsx
  git commit -m "fix: remove prohibited drop shadow from BackToTop button"
  ```

---

## Task 2: Fix ThreeLenses Shadow Violation

**Files:**
- Modify: `src/components/home/ThreeLenses.tsx:60`
- Create: `tests/components/ThreeLenses.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `tests/components/ThreeLenses.test.tsx`:

  ```tsx
  import { render, screen } from '@testing-library/react';
  import { ThreeLenses } from '@/components/home/ThreeLenses';

  describe('ThreeLenses', () => {
    it('renders all three lens cards', () => {
      render(<ThreeLenses />);
      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Philosophy')).toBeInTheDocument();
      expect(screen.getByText('Politics')).toBeInTheDocument();
    });

    it('links each lens to the correct articles filter', () => {
      render(<ThreeLenses />);
      const healthLink = screen.getByRole('link', { name: /health/i });
      expect(healthLink).toHaveAttribute('href', '/articles?lens=health');
    });

    it('does not use shadow effects on lens cards (brand compliance)', () => {
      const { container } = render(<ThreeLenses />);
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.className).not.toMatch(/shadow-\[/);
      });
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  npm test -- tests/components/ThreeLenses.test.tsx --no-coverage
  ```

  Expected: FAIL on brand compliance test — `shadow-[0_0_0_1px_var(--bmj-red)]` is present

- [ ] **Step 3: Replace shadow with border**

  In `src/components/home/ThreeLenses.tsx`, line 60, change:
  ```tsx
  // Before:
  className={`group block bg-bmj-brown p-8 no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--bmj-red)] ${lens.borderClass}`}

  // After:
  className={`group block border border-transparent bg-bmj-brown p-8 no-underline transition-all duration-200 hover:-translate-y-1 hover:border-bmj-red ${lens.borderClass}`}
  ```

  Note: `border border-transparent` initializes the border so the hover transition doesn't cause a layout shift.

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  npm test -- tests/components/ThreeLenses.test.tsx --no-coverage
  ```

  Expected: all 3 tests PASS

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/home/ThreeLenses.tsx tests/components/ThreeLenses.test.tsx
  git commit -m "fix: replace shadow-based hover ring with border on lens cards"
  ```

---

## Task 3: Redesign PaywallGate — Remove Gradient

**Files:**
- Modify: `src/components/content/PaywallGate.tsx`
- Modify: `tests/components/PaywallGate.test.tsx`

The gradient fade (`bg-gradient-to-b from-transparent to-bmj-black`) is an explicitly prohibited SaaS/digital pattern. The print-culture replacement is a hard editorial break — the same `StarDivider` pattern the rest of the site uses between sections. The CTA box below it already provides urgency; the break provides the "stop here" signal without softening the content gate into a consumer-UI fade.

- [ ] **Step 1: Write the failing tests**

  Add to `tests/components/PaywallGate.test.tsx`:

  ```tsx
  it('does not use gradient overlay (brand compliance)', () => {
    const { container } = render(<PaywallGate {...defaultProps} />);
    const allClassNames = Array.from(container.querySelectorAll('*'))
      .map((el) => el.className)
      .join(' ');
    expect(allClassNames).not.toMatch(/bg-gradient/);
  });

  it('renders a StarDivider editorial break between preview and CTA', () => {
    const { container } = render(<PaywallGate {...defaultProps} />);
    // StarDivider renders role="separator" with aria-hidden="true"
    // Use container.querySelector (DOM query, not accessibility tree) to find it
    const separator = container.querySelector('[role="separator"]');
    expect(separator).toBeInTheDocument();
  });
  ```

- [ ] **Step 2: Run tests to verify the gradient test fails**

  ```bash
  npm test -- tests/components/PaywallGate.test.tsx --no-coverage
  ```

  Expected: FAIL on the gradient test

- [ ] **Step 3: Rewrite PaywallGate**

  In `src/components/content/PaywallGate.tsx`:

  ```tsx
  import Link from 'next/link';
  import type { AccessTier } from '@/lib/supabase/types';
  import { StarDivider } from '@/components/ui/StarDivider';

  interface PaywallGateProps {
    requiredTier: AccessTier;
    previewBody: string;
    isLoggedIn?: boolean;
  }

  export function PaywallGate({
    requiredTier,
    previewBody,
    isLoggedIn = false,
  }: PaywallGateProps) {
    const tierLabel = requiredTier === 'basic' ? 'Basic' : 'Premium';

    return (
      <div>
        {/* Preview text — hard cutoff, no gradient fade */}
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          {previewBody}
          <span aria-hidden="true">&hellip;</span>
        </p>

        {/* Editorial break — consistent with the site's section divider language */}
        <StarDivider className="my-8" />

        {/* CTA */}
        <div className="border border-bmj-red/40 bg-bmj-brown p-8 text-center">
          <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
            Members Only
          </p>
          <h3 className="mb-4 font-display text-2xl text-bmj-white">
            {isLoggedIn
              ? `Upgrade to ${tierLabel} to read this`
              : `This article is for ${tierLabel} members`}
          </h3>
          <p className="mb-6 font-body text-sm text-bmj-cream/70">
            {isLoggedIn
              ? `Your current plan doesn\u2019t include ${tierLabel.toLowerCase()} content. Upgrade to unlock.`
              : `Upgrade to read the full article and all ${tierLabel.toLowerCase()} content.`}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/signup?tier=${requiredTier}`}
              className="inline-block bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-85"
            >
              {isLoggedIn ? `Upgrade — ${tierLabel}` : `Subscribe — ${tierLabel}`}
            </Link>
            {!isLoggedIn && (
              <Link
                href="/login"
                className="font-body text-sm text-bmj-tan underline hover:text-bmj-cream"
              >
                Already a member? Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Run all PaywallGate tests**

  ```bash
  npm test -- tests/components/PaywallGate.test.tsx --no-coverage
  ```

  Expected: all tests PASS (including the 4 original tests + 2 new brand tests)

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/content/PaywallGate.tsx tests/components/PaywallGate.test.tsx
  git commit -m "fix: replace gradient overlay with StarDivider editorial break in PaywallGate"
  ```

---

## Task 4: Create TreatedImage Component

The halftone/duotone utilities exist in `globals.css` but are applied ad-hoc via className strings on individual `<img>` tags across 8+ components. A reusable `TreatedImage` component enforces consistent treatment, documents the three editorial variants, and makes posterized portraiture readiness systemic rather than aspirational.

**Files:**
- Create: `src/components/ui/TreatedImage.tsx`
- Create: `tests/components/TreatedImage.test.tsx`

- [ ] **Step 1: Write the failing tests**

  Create `tests/components/TreatedImage.test.tsx`:

  ```tsx
  import { render } from '@testing-library/react';
  import { TreatedImage } from '@/components/ui/TreatedImage';

  const baseProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    width: 400,
    height: 300,
  };

  describe('TreatedImage', () => {
    it('applies halftone class by default (editorial variant)', () => {
      const { container } = render(<TreatedImage {...baseProps} />);
      const img = container.querySelector('img');
      expect(img?.className).toMatch(/halftone/);
    });

    it('applies halftone class for editorial variant', () => {
      const { container } = render(<TreatedImage {...baseProps} variant="editorial" />);
      const img = container.querySelector('img');
      expect(img?.className).toMatch(/halftone/);
      expect(img?.className).not.toMatch(/halftone-heavy/);
    });

    it('wraps portrait variant in halftone-dots container', () => {
      const { container } = render(<TreatedImage {...baseProps} variant="portrait" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toMatch(/halftone-dots/);
      const img = wrapper.querySelector('img');
      expect(img?.className).toMatch(/halftone-heavy/);
    });

    it('applies duotone class for hero variant', () => {
      const { container } = render(<TreatedImage {...baseProps} variant="hero" />);
      const img = container.querySelector('img');
      expect(img?.className).toMatch(/duotone/);
    });

    it('passes through additional className', () => {
      const { container } = render(
        <TreatedImage {...baseProps} className="w-full object-cover" />
      );
      const img = container.querySelector('img');
      expect(img?.className).toMatch(/w-full/);
      expect(img?.className).toMatch(/object-cover/);
    });

    it('renders accessible alt text', () => {
      const { getByAltText } = render(
        <TreatedImage {...baseProps} alt="Portrait of a man reading" />
      );
      expect(getByAltText('Portrait of a man reading')).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  npm test -- tests/components/TreatedImage.test.tsx --no-coverage
  ```

  Expected: FAIL — module not found

- [ ] **Step 3: Implement TreatedImage**

  Create `src/components/ui/TreatedImage.tsx`:

  ```tsx
  import Image from 'next/image';

  type ImageVariant = 'editorial' | 'portrait' | 'hero';

  interface TreatedImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    variant?: ImageVariant;
    className?: string;
    priority?: boolean;
  }

  const imageClasses: Record<ImageVariant, string> = {
    editorial: 'halftone',
    portrait: 'halftone-heavy',
    hero: 'duotone',
  };

  export function TreatedImage({
    src,
    alt,
    width,
    height,
    variant = 'editorial',
    className = '',
    priority = false,
  }: TreatedImageProps) {
    const imgClass = [imageClasses[variant], className].filter(Boolean).join(' ');

    if (variant === 'portrait') {
      return (
        <div className="halftone-dots relative">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={imgClass}
            priority={priority}
          />
        </div>
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={imgClass}
        priority={priority}
      />
    );
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  npm test -- tests/components/TreatedImage.test.tsx --no-coverage
  ```

  Expected: all 6 tests PASS

- [ ] **Step 5: Run full test suite to catch regressions before committing**

  ```bash
  npm test --no-coverage
  ```

  Expected: all existing tests still pass

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/ui/TreatedImage.tsx tests/components/TreatedImage.test.tsx
  git commit -m "feat: add TreatedImage component for systemic editorial image treatment"
  ```

---

## Task 5: Strengthen HeroBanner for Declaration Quality

The spec requires: "feel like it is making a declaration, not merely presenting content." The current hero is structurally correct but lacks two elements that shift it from editorial presentation to publication declaration: a **publication identifier stamp** (Vol/year/independence line above the headline) and a **three-lens footer** below the mission copy. These additions signal that this is an ongoing publication with history and structure, not a launch landing page.

Additionally, the current `h-px w-24 bg-bmj-red` horizontal rule is too thin (1px) and too short (96px) for a poster/broadside aesthetic. The spec explicitly calls for "strong typographic scale contrast" and print materiality.

**Files:**
- Modify: `src/components/home/HeroBanner.tsx`
- Create: `tests/components/HeroBanner.test.tsx`

- [ ] **Step 1: Write the failing tests**

  Create `tests/components/HeroBanner.test.tsx`:

  ```tsx
  import { render, screen } from '@testing-library/react';
  import { HeroBanner } from '@/components/home/HeroBanner';

  // No local framer-motion mock needed — tests/setup.ts provides a global Proxy mock
  // that strips Framer-specific props and renders the correct HTML tag.

  describe('HeroBanner', () => {
    it('renders the publication name', () => {
      render(<HeroBanner />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('THE BLACK MALE JOURNAL');
    });

    it('renders a publication identifier stamp', () => {
      render(<HeroBanner />);
      expect(screen.getByText(/Vol\. I/i)).toBeInTheDocument();
    });

    it('renders the three-lens footer', () => {
      render(<HeroBanner />);
      expect(screen.getByText(/Health.*Philosophy.*Politics/i)).toBeInTheDocument();
    });

    it('renders a CTA link to briefings', () => {
      render(<HeroBanner />);
      const cta = screen.getByRole('link', { name: /Read the Latest Briefing/i });
      expect(cta).toHaveAttribute('href', '/briefings');
    });

    it('does not use drop shadows or gradients (brand compliance)', () => {
      const { container } = render(<HeroBanner />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        expect(el.className).not.toMatch(/shadow-lg|bg-gradient/);
      });
    });
  });
  ```

- [ ] **Step 2: Run tests to verify stamp and lens footer tests fail**

  ```bash
  npm test -- tests/components/HeroBanner.test.tsx --no-coverage
  ```

  Expected: FAIL on "publication identifier stamp" and "three-lens footer" tests

- [ ] **Step 3: Update HeroBanner**

  In `src/components/home/HeroBanner.tsx`, make these changes:

  **Add publication stamp** (before `<motion.h1>`):
  ```tsx
  {/* Publication identifier — shifts tone from launch page to ongoing declaration */}
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="mb-6 font-mono text-xs uppercase tracking-[0.4em] text-bmj-tan"
  >
    Vol. I &nbsp;&middot;&nbsp; Est. MMXXV &nbsp;&middot;&nbsp; Independent
  </motion.p>
  ```

  **Strengthen the horizontal rule** (inside the third `motion.div`):
  ```tsx
  // Before:
  <div className="mx-auto my-8 h-px w-24 bg-bmj-red" />

  // After:
  <div className="mx-auto my-8 h-[3px] w-32 bg-bmj-red" />
  ```

  **Add three-lens footer** (after the mission `<p>` tag, before the CTA `<div>`):
  ```tsx
  <p className="mt-4 font-mono text-xs uppercase tracking-[0.4em] text-bmj-tan/60">
    Health &nbsp;&middot;&nbsp; Philosophy &nbsp;&middot;&nbsp; Politics
  </p>
  ```

  Full updated `HeroBanner.tsx`:

  ```tsx
  // src/components/home/HeroBanner.tsx
  "use client";

  import { motion } from "framer-motion";
  import Link from "next/link";

  export function HeroBanner() {
    return (
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-bmj-black">
        {/* Large star watermark — low opacity background texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ opacity: 0.025 }}
        >
          <svg
            width="700"
            height="700"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 0L19.6 11.6H32L21.8 18.4L25.4 30L16 23.2L6.6 30L10.2 18.4L0 11.6H12.4L16 0Z"
              fill="var(--bmj-cream)"
            />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-content px-6 py-24 text-center">
          {/* Publication identifier — declaration, not just a brand name */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6 font-mono text-xs uppercase tracking-[0.4em] text-bmj-tan"
          >
            Vol. I &nbsp;&middot;&nbsp; Est. MMXXV &nbsp;&middot;&nbsp; Independent
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-display text-6xl leading-none tracking-wide text-bmj-white sm:text-7xl md:text-9xl"
          >
            THE BLACK MALE JOURNAL
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-6 font-body text-base italic text-bmj-cream/70 md:text-xl"
          >
            Independent Media House · Revolutionary Masculinist Platform
          </motion.p>

          {/* Rule + mission + three-lens footer + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <div className="mx-auto my-8 h-[3px] w-32 bg-bmj-red" />

            <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-bmj-cream/70 md:text-lg">
              We chronicle the full complexity of Black male life — mind, body, and power. No
              apology. No dilution. This is the record of men who choose to be deliberate.
            </p>

            <p className="mt-4 font-mono text-xs uppercase tracking-[0.4em] text-bmj-tan/60">
              Health &nbsp;&middot;&nbsp; Philosophy &nbsp;&middot;&nbsp; Politics
            </p>

            <div className="mt-12">
              <Link
                href="/briefings"
                className="inline-block btn-primary btn-lg"
              >
                Read the Latest Briefing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 4: Run all HeroBanner tests**

  ```bash
  npm test -- tests/components/HeroBanner.test.tsx --no-coverage
  ```

  Expected: all 5 tests PASS

- [ ] **Step 5: Run full test suite to catch regressions**

  ```bash
  npm test --no-coverage
  ```

  Expected: all tests pass (537+)

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/home/HeroBanner.tsx tests/components/HeroBanner.test.tsx
  git commit -m "feat: add publication stamp and lens footer to HeroBanner for declaration quality"
  ```

---

## Task 6: Save Full Art Direction Spec

The art direction spec must be saved before the invariants document, which references it by path. Creating it first eliminates dangling references in the commit history.

**Files:**
- Create: `docs/brand/art-direction-spec.md`

- [ ] **Step 1: Ensure docs/brand/ directory exists**

  ```bash
  mkdir -p docs/brand
  ```

- [ ] **Step 2: Create docs/brand/art-direction-spec.md with the following content**

  ```markdown
  # Black Male Journal — Visual Tone & Art Direction Spec

  ## Core Positioning

  The Black Male Journal's visual identity is a militant, print-driven editorial system rooted in
  revolutionary Black political culture. It draws from liberation-era newspapers, political posters,
  underground presses, and Pan-African movement graphics, then reframes that lineage as a contemporary
  media platform for Black male thought, discipline, and power. The result is not simply bold branding,
  but a visual doctrine: historically conscious, ideologically explicit, and editorially authoritative.

  ## Tone

  Militant, but disciplined rather than theatrical. Communicates readiness, seriousness, self-command,
  and ideological clarity. The visual system should feel like it is making a declaration, not merely
  presenting content. Confrontational in an editorial sense — not neutral, not softened, not corporate-safe.
  Historically grounded — the visual language should signal lineage, memory, and continuity with Black
  radical intellectual and political traditions.

  ## Brand Attributes

  - **Militant** — disciplined, forceful, serious, prepared
  - **Confrontational** — declarative, unsoftened, ideologically direct
  - **Print-born** — material, tactile, textured, reproduced rather than frictionless
  - **Masculine** — weighty, restrained, structured, unsentimental
  - **Pan-African** — historically literate, movement-conscious, globally Black in lineage
  - **Editorially authoritative** — journal-like, composed, hierarchical, archival, accountable
  - **Uncompromising** — not optimized for corporate comfort, mass appeasement, or trend aesthetics

  ## Visual Principles

  1. **Militant Discipline** — order, seriousness, readiness for intellectual and political struggle; condensed and heavy type, strong silhouettes, structured compositions
  2. **Confrontational Clarity** — the design takes a position; headlines read as declarations; portrait treatment creates direct psychological presence
  3. **Revolutionary Print Lineage** — liberation newspapers, pamphlets, movement posters, screenprint logic, underground press; not startup minimalism or luxury editorial polish
  4. **Tactile Materiality** — paper, ink, toner, physical reproduction; grain, halftone texture, print density, aged grounds, slight distress
  5. **Masculine Gravitas** — weight through restraint: geometry, hierarchy, contrast, scale, disciplined color use
  6. **Pan-African Historical Consciousness** — connection to Black international political and intellectual traditions expressed through tone, structure, iconization, and symbolic gravity
  7. **Editorial Authority** — serious publication, not a content brand; journal, archive, briefing organ, doctrinal publication

  ## Color Hierarchy

  **Primary (ideological core):**
  - Red — urgency, command, ideological emphasis
  - Off-black / near-black — typographic authority and structural grounding
  - Cream / paper-toned off-white — material warmth and print lineage

  **Secondary (use with restraint):**
  - Green, Brown, Gold, Purple — sectional, thematic, or tonal accents only; support the system, do not fragment it

  **Rules:**
  - Red is the dominant accent
  - Off-black carries typographic authority
  - Cream preserves material warmth
  - Secondary colors appear sparingly and deliberately
  - Never rainbow-coded, overly expressive, or softened into lifestyle warmth

  ## Typography Direction

  - Condensed, bold, headline-driven, declarative, newspaper/poster adjacent, highly hierarchical
  - Strong typographic scale contrast — headlines frame content ideologically, not merely label it
  - Type belongs to posters, banners, issue covers, and movement press — not product marketing or app UI

  ## Image Direction

  - Posterized portraiture
  - High-contrast black-and-white or limited-palette treatment
  - Strong silhouettes
  - Iconic rather than casual framing
  - Visual seriousness over spontaneity
  - Portraits feel studied, symbolic, and authoritative — not influencer photography or aspirational brand imagery

  ## Texture & Surface

  - Printed, handled, archival, slightly distressed, materially present
  - Halftone dots, paper grain, ink spread, reproduction noise, slight edge wear, flat color fields with physical warmth
  - Closer to a political pamphlet or movement broadside than a polished tech publication

  ## Do / Don't

  **Do:**
  - Use commanding, condensed, highly legible headline systems
  - Let hierarchy carry ideological force
  - Preserve materiality through paper tones, grain, and print texture
  - Treat portraits as symbols of thought, discipline, and seriousness
  - Build layouts that feel archival, editorial, and intentional
  - Use red sparingly but decisively
  - Keep the experience structured, weighty, and historically situated

  **Don't:**
  - Soften the system into generic editorial elegance
  - Drift into luxury branding, startup minimalism, or lifestyle polish
  - Overuse secondary colors
  - Make the visual identity feel playful, whimsical, or decorative
  - Use overly clean digital surfaces that erase the print lineage
  - Rely on trend aesthetics that weaken ideological clarity
  - Let the site feel like a social-content brand or think-piece aggregator

  ## One-Paragraph Spec

  The Black Male Journal's visual identity is a militant, print-born editorial system shaped by
  revolutionary Black political culture. It combines commanding condensed typography, posterized
  portraiture, paper-toned surfaces, and restrained ideological color to communicate discipline,
  authority, and Pan-African historical consciousness. The system is confrontational rather than neutral,
  tactile rather than frictionless, and journalistic rather than lifestyle-driven. It should always feel
  serious, structured, historically literate, and uncompromising: a publication of thought, power, and
  self-mastery rather than a brand optimized for comfort or trend alignment.

  ## Governing Decisions (2026-03-17)

  1. Brand fidelity over token standardization — any external token package is acceptable only if it preserves BMJ visual output exactly
  2. Halftone as reusable implementation utility first — CSS/SVG/component-level, not preprocessed asset dependency
  3. Posterized portraiture = readiness requirement — audit system readiness, not presence of editorial assets
  4. Green not required now — valid future secondary, do not wire in yet
  5. Accessibility non-negotiable — militant aesthetic achieved within WCAG-compliant standards
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add docs/brand/art-direction-spec.md
  git commit -m "docs: add Visual Tone & Art Direction Spec as canonical brand reference"
  ```

---

## Task 7: Create BMJ Visual Invariants Document

This document converts the brand spec into implementation law. It is the authoritative reference for any contributor working on BMJ components — shorter than the full spec, structured as rules with rationale rather than philosophy. Must be done after Task 6 so the `docs/brand/art-direction-spec.md` reference resolves.

**Files:**
- Create: `docs/brand/invariants.md`

No tests required. Commit separately as documentation.

- [ ] **Step 1: Create docs/brand/invariants.md**

  ```markdown
  # BMJ Visual Invariants

  Implementation law for The Black Male Journal's visual system.
  These rules apply to all components, pages, and future contributors.
  When in doubt, default to the militant print culture spec in docs/brand/art-direction-spec.md.

  ---

  ## Non-Negotiables (never override)

  ### Color
  - **Core palette only:** `#0D0C0B` (black), `#E8DCC8` (cream), `#F2EDE4` (white), `#C0281F` (red)
  - **Secondaries (use sparingly):** `#C8852A` (amber), `#3B2417` (brown), `#B8986A` (tan)
  - **PROHIBITED:** pastels, gradients, purple, blue, neon, any color not in the brand.css palette
  - Red is for urgency and command — accents, CTAs, active states, section breaks

  ### Typography
  - **Bebas Neue** for ALL display/headline text — always uppercase, always `font-display`
  - **Libre Baskerville** for body copy — `font-body`, never used for headlines
  - **Oswald** for labels, buttons, metadata labels — `font-label`, uppercase, tracked wide
  - **IBM Plex Mono** for dates, issue numbers, publication identifiers — `font-mono`
  - No system fonts, no other Google Fonts, no CSS font stacks with fallbacks as primary typefaces

  ### Surfaces & Effects
  - **NO drop shadows** — `shadow-*` Tailwind classes are prohibited on brand components
  - **NO gradients** — `bg-gradient-*` classes are prohibited; fade effects must use solid color + opacity
  - **NO glassmorphism** — `backdrop-blur-*` is prohibited except on nav scroll state (pre-existing, minimal)
  - **NO rounded corners > 4px** — `rounded` (4px) and `rounded-sm` (2px) are allowed; `rounded-md` and above are prohibited
  - **Grain texture** is global via `.grain::after` — do not remove it; do not add a second instance

  ### Image Treatment
  - All editorial images must use one of three `TreatedImage` variants:
    - `editorial` — `.halftone` filter (contrast + partial grayscale)
    - `portrait` — `.halftone-heavy` + `.halftone-dots` wrapper (full newsprint treatment)
    - `hero` — `.duotone` filter (full grayscale + contrast, multiply blend)
  - Raw, untreated photographs are not permitted in editorial contexts
  - Placeholder images must use `/placeholder-cover.svg` (branded SVG, not generic gray boxes)

  ### Section Structure
  - **StarDivider** (`<StarDivider />`) is the canonical section separator — use it between content sections and as editorial break points
  - **Red accent borders** (`.accent-border-top`, `.accent-border-bottom`) are used on CTAs and section-level containers, not on individual cards
  - **Lens colors** are scoped to their lens: health (amber), philosophy (tan), politics (red) — never mixed

  ### Prohibited Patterns
  - Lifestyle photography (smiling, aspirational, consumer-coded)
  - Generic UI icons (checkmarks, thumbs up, heart, star rating) — use the brand star motif
  - Hover states that soften the design (color lightening, opacity reduction on text) — hover states should increase visual weight or clarity
  - "Cards" with rounded corners, soft shadows, or white backgrounds
  - Generic SaaS button patterns (pill shapes, icon-only buttons without context)

  ---

  ## Accessibility Invariants (non-negotiable alongside brand)

  - All interactive elements must have `focus-visible` styles (currently enforced globally via `*:focus-visible` in globals.css)
  - Color contrast: all text must meet WCAG AA at minimum
  - When brand color and contrast conflict: adjust opacity/weight of the brand color, preserve the intent
  - Images must have descriptive `alt` text; decorative images must have `alt=""`
  - `aria-hidden="true"` on all decorative SVGs, grain overlays, texture elements

  ---

  ## External Token Migration Rule

  The BMJ color palette in `src/styles/brand.css` is the source of truth for the running application. If BMJ ever evaluates a migration to any external token package:

  1. Verify that every `--bmj-*` variable maps to an identical hex value in the token output
  2. If the token theme softens, warms, or alters any color, reject the migration for that token and keep the CSS variable
  3. Brand fidelity overrides token standardization

  ---

  ## File Locations for Brand Work

  | Asset | Location |
  |-------|----------|
  | CSS variables | `src/styles/brand.css` |
  | Utility classes (grain, halftone, etc.) | `src/styles/globals.css` |
  | Tailwind theme extension | `tailwind.config.ts` |
  | OG image | `public/og-image.svg` |
  | Placeholder cover | `public/placeholder-cover.svg` |
  | Logo / favicon | `public/logo.svg`, `public/favicon.svg` |
  | Image treatment component | `src/components/ui/TreatedImage.tsx` |
  | Star divider | `src/components/ui/StarDivider.tsx` |
  | Full art direction spec | `docs/brand/art-direction-spec.md` |
  ```

- [ ] **Step 2: Commit the invariants document**

  ```bash
  git add docs/brand/invariants.md
  git commit -m "docs: add BMJ Visual Invariants document — brand implementation law"
  ```

---

## Verification

After all tasks are complete:

- [ ] **Run full test suite**

  ```bash
  npm test --no-coverage
  ```

  Expected: all tests pass (537 base + new tests for ThreeLenses, HeroBanner, TreatedImage)

- [ ] **TypeScript check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors

- [ ] **Build check**

  ```bash
  npm run build
  ```

  Expected: builds cleanly

- [ ] **Visual spot check** — open dev server and verify:
  - `http://localhost:3000` — hero shows publication stamp + three-lens footer
  - Any briefing detail page — PaywallGate shows StarDivider break instead of gradient fade
  - ThreeLenses cards — hover shows a border, not a shadow ring
  - BackToTop button — no visible drop shadow

  ```bash
  npm run dev
  ```

- [ ] **Run superpowers:finishing-a-development-branch** to merge/PR

---

## Deferred (out of scope for this plan)

- Green secondary color token — add only when a specific editorial use case requires it
- External token migration audit — validate hex values match before adopting; track in `docs/deferrals.md`
- Posterized portraiture — `TreatedImage` is now ready; execution depends on editorial content upload
- Article body image treatment — verify images inside `ArticleBody.tsx` use `TreatedImage` component when content is available
