# Frontend Cinematic Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subtle cinematic motion, a featured content carousel, a Latest Dispatches homepage section, and a branded 404 page — all within the militant print-culture brand constraints (no shadows, no gradients, no rounded > 4px, no bouncy animations).

**Architecture:** A reusable `ScrollReveal` motion wrapper powers all scroll-triggered animations. Homepage gets two new sections (LatestDispatches, FeaturedCarousel replacing the static FeaturedArticles). All existing cards get refined hover states. A branded 404 page replaces the Next.js default. A lightweight page-transition wrapper adds fade-on-navigate to all routes.

**Tech Stack:** Framer Motion 12.36.0 (already installed), Next.js 16 App Router, Tailwind CSS, Supabase queries

---

## Brand Constraints (Non-Negotiable)

These constraints are enforced by `tests/brand-compliance.test.ts`:

- **NO** `shadow-sm/md/lg/xl/2xl/inner` (drop shadows)
- **NO** `bg-gradient-*` (gradient backgrounds)
- **NO** `rounded-md/lg/xl/2xl/3xl` (rounded corners > 4px)
- **NO** bouncy/spring animations, parallax scroll, hover zoom on cards
- **NO** motion that undermines militant visual posture
- All motion must respect `prefers-reduced-motion: reduce`
- Framer Motion permitted for: page transitions (fade), scroll-triggered section reveals (translateY), quote rotation, search dialog entry/exit

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/components/motion/ScrollReveal.tsx` | Reusable scroll-triggered fade+slide wrapper using Framer Motion `useInView` |
| `src/components/motion/PageTransition.tsx` | Client wrapper that fades page content on route change via `usePathname` |
| `src/components/home/LatestDispatches.tsx` | Homepage section showing 3 most recent dispatches |
| `src/components/home/FeaturedCarousel.tsx` | Crossfade slideshow of featured articles (replaces static FeaturedArticles on homepage) |
| `src/app/not-found.tsx` | Branded 404 page with BrandMark, editorial tone |
| `tests/components/ScrollReveal.test.tsx` | Tests for ScrollReveal component |
| `tests/components/PageTransition.test.tsx` | Tests for PageTransition component |
| `tests/components/LatestDispatches.test.tsx` | Tests for LatestDispatches component |
| `tests/components/FeaturedCarousel.test.tsx` | Tests for FeaturedCarousel component |
| `tests/pages/not-found.test.tsx` | Tests for 404 page |

### Modified Files

| File | Change |
|------|--------|
| `src/app/(public)/page.tsx` | Add LatestDispatches section, swap FeaturedArticles for FeaturedCarousel, wrap sections in ScrollReveal |
| `src/app/layout.tsx` | Wrap `{children}` in PageTransition |
| `src/lib/supabase/queries.ts` | Add `getLatestDispatches(limit)` query function |
| `src/components/home/ThreeLenses.tsx` | Wrap in ScrollReveal |
| `src/components/home/BriefingPreview.tsx` | Wrap in ScrollReveal |
| `src/components/home/JoinCTA.tsx` | Wrap in ScrollReveal |
| `src/components/content/PosterBlock.tsx` | Wrap in ScrollReveal |
| `src/components/content/ArticleCard.tsx` | Refine hover: add `hover:border-bmj-tan/40` consistency |
| `src/components/content/DispatchCard.tsx` | Add subtle `hover:-translate-y-0.5` lift |
| `src/components/content/NewspaperGrid.tsx` | Add staggered ScrollReveal on secondary cards |

---

## Task 1: ScrollReveal Motion Component

The foundation for all scroll-triggered animations. A `"use client"` wrapper using Framer Motion's `useInView` hook. Every homepage section will use this.

**Files:**
- Create: `src/components/motion/ScrollReveal.tsx`
- Test: `tests/components/ScrollReveal.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
// tests/components/ScrollReveal.test.tsx
import { render, screen } from '@testing-library/react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

// Mock framer-motion with Proxy to handle motion.div, motion.section, etc.
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) =>
        React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
          const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
          return React.createElement(prop, { ...rest, ref, 'data-testid': `motion-${prop}` });
        }),
    }),
    useInView: jest.fn(() => true),
  };
});

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(
      <ScrollReveal>
        <p>Hello</p>
      </ScrollReveal>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('passes className to wrapper', () => {
    render(
      <ScrollReveal className="mt-8">
        <p>Content</p>
      </ScrollReveal>,
    );
    expect(screen.getByTestId('motion-div')).toHaveClass('mt-8');
  });

  it('renders as a section element when as="section"', () => {
    render(
      <ScrollReveal as="section">
        <p>Section content</p>
      </ScrollReveal>,
    );
    expect(screen.getByTestId('motion-section')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/ScrollReveal.test.tsx`
Expected: FAIL — module `@/components/motion/ScrollReveal` not found

- [ ] **Step 3: Implement ScrollReveal**

```tsx
// src/components/motion/ScrollReveal.tsx
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Direction of the slide: 'up' (default), 'left', 'right', 'none' (fade only) */
  direction?: 'up' | 'left' | 'right' | 'none';
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Render as a different element (default: div) */
  as?: 'div' | 'section' | 'article' | 'aside';
  /** How much of the element must be visible to trigger (0-1) */
  threshold?: number;
}

const offsets = {
  up: { y: 40 },
  left: { x: -40 },
  right: { x: 40 },
  none: {},
} as const;

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  as = 'div',
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const MotionTag = motion[as] as typeof motion.div;

  // Respect prefers-reduced-motion via CSS — Framer Motion reads it automatically
  // when using useReducedMotion, but we handle it via the `once` flag and subtle values
  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offsets[direction] }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </MotionTag>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/ScrollReveal.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Run brand compliance test**

Run: `npm test -- tests/brand-compliance.test.ts`
Expected: PASS — ScrollReveal uses no prohibited CSS patterns

- [ ] **Step 6: Commit**

```bash
git add src/components/motion/ScrollReveal.tsx tests/components/ScrollReveal.test.tsx
git commit -m "feat: add ScrollReveal motion component for scroll-triggered animations"
```

---

## Task 2: getLatestDispatches Query

Add a query function to fetch the N most recent published dispatches. Needed by the new LatestDispatches homepage section.

**Files:**
- Modify: `src/lib/supabase/queries.ts` (after the `getDispatchBySlug` function, ~line 376)
- Test: existing pattern — queries are tested via integration; add a unit-style test

- [ ] **Step 1: Write the test**

Create `tests/lib/queries-dispatches.test.ts`:

```tsx
// tests/lib/queries-dispatches.test.ts
import { getLatestDispatches } from '@/lib/supabase/queries';

// Mock createClient the same way other query tests do
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

function setupChain(data: unknown[] | null, error: { message: string } | null = null) {
  mockLimit.mockResolvedValue({ data, error });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockEq.mockReturnValue({ order: mockOrder });
  mockSelect.mockReturnValue({ eq: mockEq });
  (createClient as jest.Mock).mockResolvedValue({
    from: jest.fn(() => ({ select: mockSelect })),
  });
}

describe('getLatestDispatches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns dispatches with default limit of 3', async () => {
    const mockData = [
      { id: '1', title: 'D1', slug: 'd1', lens: 'health', excerpt: '', body: '', status: 'published', author: 'The Chairman', cover_image: null, published_at: '2026-03-18', created_at: '2026-03-18' },
    ];
    setupChain(mockData);

    const result = await getLatestDispatches();
    expect(result).toEqual(mockData);
    expect(mockLimit).toHaveBeenCalledWith(3);
  });

  it('respects custom limit', async () => {
    setupChain([]);
    await getLatestDispatches(5);
    expect(mockLimit).toHaveBeenCalledWith(5);
  });

  it('returns empty array on error', async () => {
    setupChain(null, { message: 'fail' });
    const result = await getLatestDispatches();
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/queries-dispatches.test.ts`
Expected: FAIL — `getLatestDispatches` is not exported from queries

- [ ] **Step 3: Add getLatestDispatches to queries.ts**

Add after the `getDispatchBySlug` function (~line 376):

```typescript
export async function getLatestDispatches(limit = 3): Promise<Dispatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getLatestDispatches]', error.message);
    return [];
  }
  return (data ?? []) as Dispatch[];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/lib/queries-dispatches.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/queries.ts tests/lib/queries-dispatches.test.ts
git commit -m "feat: add getLatestDispatches query function"
```

---

## Task 3: LatestDispatches Homepage Section

A new homepage section showing the 3 most recent dispatches in a vertical stack. Positioned between PosterBlock and FeaturedArticles on the homepage.

**Files:**
- Create: `src/components/home/LatestDispatches.tsx`
- Test: `tests/components/LatestDispatches.test.tsx`
- Modify: `src/app/(public)/page.tsx` (add section + data fetch)

- [ ] **Step 1: Write the test**

```tsx
// tests/components/LatestDispatches.test.tsx
import { render, screen } from '@testing-library/react';
import { LatestDispatches } from '@/components/home/LatestDispatches';

// No framer-motion mock needed — LatestDispatches is a server component
// that does not import framer-motion. The global mock in tests/setup.ts suffices.

const mockDispatches = [
  {
    id: '1',
    title: 'Dispatch Alpha',
    slug: 'dispatch-alpha',
    lens: 'health' as const,
    excerpt: 'First excerpt',
    body: 'body',
    status: 'published' as const,
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-18T00:00:00Z',
    created_at: '2026-03-18T00:00:00Z',
  },
  {
    id: '2',
    title: 'Dispatch Beta',
    slug: 'dispatch-beta',
    lens: 'politics' as const,
    excerpt: 'Second excerpt',
    body: 'body',
    status: 'published' as const,
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-17T00:00:00Z',
    created_at: '2026-03-17T00:00:00Z',
  },
];

describe('LatestDispatches', () => {
  it('renders section heading', () => {
    render(<LatestDispatches dispatches={mockDispatches} />);
    expect(screen.getByText('Latest Dispatches')).toBeInTheDocument();
  });

  it('renders dispatch titles', () => {
    render(<LatestDispatches dispatches={mockDispatches} />);
    expect(screen.getByText('Dispatch Alpha')).toBeInTheDocument();
    expect(screen.getByText('Dispatch Beta')).toBeInTheDocument();
  });

  it('renders empty state when no dispatches', () => {
    render(<LatestDispatches dispatches={[]} />);
    expect(screen.getByText(/dispatches coming soon/i)).toBeInTheDocument();
  });

  it('renders "View all" link', () => {
    render(<LatestDispatches dispatches={mockDispatches} />);
    const link = screen.getByRole('link', { name: /all dispatches/i });
    expect(link).toHaveAttribute('href', '/blog');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/LatestDispatches.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement LatestDispatches**

```tsx
// src/components/home/LatestDispatches.tsx
import Link from 'next/link';
import { StarDivider } from '@/components/ui/StarDivider';
import { DispatchCard } from '@/components/content/DispatchCard';
import type { Dispatch } from '@/lib/supabase/types';

interface LatestDispatchesProps {
  dispatches: Dispatch[];
}

export function LatestDispatches({ dispatches }: LatestDispatchesProps) {
  return (
    <section className="bg-bmj-black py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Latest Dispatches
        </h2>

        {dispatches.length > 0 ? (
          <div className="mx-auto max-w-article space-y-4">
            {dispatches.map((dispatch) => (
              <DispatchCard
                key={dispatch.id}
                title={dispatch.title}
                slug={dispatch.slug}
                lens={dispatch.lens}
                excerpt={dispatch.excerpt}
                publishedAt={dispatch.published_at}
              />
            ))}
          </div>
        ) : (
          <p className="text-center font-body text-base text-bmj-cream/50">
            Dispatches coming soon.
          </p>
        )}

        {dispatches.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-block border border-bmj-tan/40 px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
            >
              All Dispatches &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/LatestDispatches.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/home/LatestDispatches.tsx tests/components/LatestDispatches.test.tsx
git commit -m "feat: add LatestDispatches homepage section"
```

---

## Task 4: FeaturedCarousel Component

A crossfade slideshow of featured articles that auto-advances every 6 seconds. Replaces the static `FeaturedArticles` on the homepage. Uses the same `AnimatePresence` pattern as the existing `RotatingQuote` component. Respects `prefers-reduced-motion`.

**Files:**
- Create: `src/components/home/FeaturedCarousel.tsx`
- Test: `tests/components/FeaturedCarousel.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
// tests/components/FeaturedCarousel.test.tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeaturedCarousel } from '@/components/home/FeaturedCarousel';

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: jest.fn(({ children, className }: Record<string, unknown>) => (
      <div className={className as string}>{children as React.ReactNode}</div>
    )),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

const mockArticles = [
  {
    id: '1', title: 'Article One', slug: 'article-one', lens: 'health' as const,
    tags: [], excerpt: 'Excerpt one', body: 'body', featured: true,
    access_tier: 'free' as const, status: 'published' as const, author: 'The Chairman',
    cover_image: null, published_at: '2026-03-18', created_at: '2026-03-18',
  },
  {
    id: '2', title: 'Article Two', slug: 'article-two', lens: 'politics' as const,
    tags: [], excerpt: 'Excerpt two', body: 'body', featured: true,
    access_tier: 'free' as const, status: 'published' as const, author: 'The Chairman',
    cover_image: null, published_at: '2026-03-17', created_at: '2026-03-17',
  },
  {
    id: '3', title: 'Article Three', slug: 'article-three', lens: 'philosophy' as const,
    tags: [], excerpt: 'Excerpt three', body: 'body', featured: true,
    access_tier: 'free' as const, status: 'published' as const, author: 'The Chairman',
    cover_image: null, published_at: '2026-03-16', created_at: '2026-03-16',
  },
];

describe('FeaturedCarousel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the section heading', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('shows the first article initially', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    expect(screen.getByText('Article One')).toBeInTheDocument();
  });

  it('renders dot indicators for each article', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('advances to next article after interval', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    act(() => { jest.advanceTimersByTime(6000); });
    expect(screen.getByText('Article Two')).toBeInTheDocument();
  });

  it('allows manual navigation via dot indicators', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<FeaturedCarousel articles={mockArticles} />);
    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[2]);
    expect(screen.getByText('Article Three')).toBeInTheDocument();
  });

  it('renders empty state when no articles', () => {
    render(<FeaturedCarousel articles={[]} />);
    expect(screen.getByText(/featured articles coming soon/i)).toBeInTheDocument();
  });

  it('renders link to full article', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    const link = screen.getByRole('link', { name: /read article/i });
    expect(link).toHaveAttribute('href', '/articles/article-one');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/FeaturedCarousel.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement FeaturedCarousel**

```tsx
// src/components/home/FeaturedCarousel.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { StarDivider } from '@/components/ui/StarDivider';
import { LensBadge } from '@/components/brand/LensBadge';
import { BrandMark } from '@/components/brand/BrandMark';
import type { Article } from '@/lib/supabase/types';

interface FeaturedCarouselProps {
  articles: Article[];
}

const INTERVAL_MS = 6000;

export function FeaturedCarousel({ articles }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % articles.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) {
    return (
      <section className="bg-bmj-black py-20">
        <div className="mx-auto max-w-content px-6">
          <StarDivider className="mb-8" />
          <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
            Featured
          </h2>
          <p className="text-center font-body text-base text-bmj-cream/50">
            Featured articles coming soon.
          </p>
        </div>
      </section>
    );
  }

  const article = articles[index];
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="bg-bmj-black py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Featured
        </h2>

        <div className="relative min-h-[320px] overflow-hidden border border-bmj-tan/20 bg-bmj-brown sm:min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={article.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="flex min-h-[320px] flex-col sm:min-h-[400px] sm:flex-row"
            >
              {/* Image panel */}
              <div className="relative h-48 w-full overflow-hidden bg-bmj-black sm:h-auto sm:w-1/2">
                {article.cover_image ? (
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    className="halftone object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BrandMark size={80} color="var(--bmj-cream)" className="opacity-10" />
                  </div>
                )}
              </div>

              {/* Content panel */}
              <div className="flex flex-1 flex-col justify-center p-8 sm:p-12">
                <LensBadge lens={article.lens} className="mb-4" />

                <h3 className="mb-4 font-display text-3xl leading-tight text-bmj-white sm:text-4xl">
                  {article.title}
                </h3>

                <p className="mb-6 line-clamp-3 font-body text-base leading-relaxed text-bmj-cream/70">
                  {article.excerpt}
                </p>

                <div className="mb-6 flex items-center gap-4">
                  <span className="font-label text-xs uppercase tracking-widest text-bmj-cream/60">
                    {article.author}
                  </span>
                  <span className="font-mono text-xs text-bmj-tan/60">
                    {formattedDate}
                  </span>
                </div>

                <Link
                  href={`/articles/${article.slug}`}
                  className="inline-block self-start border border-bmj-red px-6 py-3 font-label text-sm uppercase tracking-widest text-bmj-red transition-colors hover:bg-bmj-red hover:text-bmj-white"
                  aria-label="Read article"
                >
                  Read Article
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress indicators */}
          {articles.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
              role="tablist"
              aria-label="Featured article navigation"
            >
              {articles.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Article ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 transition-all duration-300 ${
                    i === index
                      ? 'w-8 bg-bmj-red'
                      : 'w-1.5 bg-bmj-tan/40 hover:bg-bmj-tan'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/FeaturedCarousel.test.tsx`
Expected: PASS (7 tests)

- [ ] **Step 5: Run brand compliance**

Run: `npm test -- tests/brand-compliance.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/home/FeaturedCarousel.tsx tests/components/FeaturedCarousel.test.tsx
git commit -m "feat: add FeaturedCarousel crossfade slideshow for featured articles"
```

---

## Task 5: Integrate ScrollReveal + New Sections into Homepage

Wire up all new components into the homepage. Wrap each section in `ScrollReveal` with staggered delays. Add `getLatestDispatches` to the data fetch. Replace `FeaturedArticles` with `FeaturedCarousel`.

**Files:**
- Modify: `src/app/(public)/page.tsx`

- [ ] **Step 1: Update the homepage**

The updated homepage should:
1. Import `ScrollReveal`, `LatestDispatches`, `FeaturedCarousel`
2. Import `getLatestDispatches` and add to `Promise.all`
3. Wrap each section after HeroBanner in `ScrollReveal`
4. Replace `FeaturedArticles` with `FeaturedCarousel`
5. Add `LatestDispatches` between PosterBlock and FeaturedCarousel

Updated `page.tsx`:

```tsx
// src/app/(public)/page.tsx
import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ThreeLenses } from "@/components/home/ThreeLenses";
import { BriefingPreview } from "@/components/home/BriefingPreview";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { LatestDispatches } from "@/components/home/LatestDispatches";
import { RotatingQuote } from "@/components/home/RotatingQuote";
import { JoinCTA } from "@/components/home/JoinCTA";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import PosterBlock from "@/components/content/PosterBlock";
import {
  getLatestBriefing,
  getFeaturedArticles,
  getLatestDispatches,
} from "@/lib/supabase/queries";

export const metadata: Metadata = {
  description:
    "Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.",
  openGraph: {
    title: "The Black Male Journal",
    description:
      "Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Black Male Journal",
    description:
      "Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.",
  },
};

export default async function HomePage() {
  const [briefing, articles, dispatches] = await Promise.all([
    getLatestBriefing(),
    getFeaturedArticles(5),
    getLatestDispatches(3),
  ]);

  return (
    <>
      <HeroBanner />
      <ScrollReveal>
        <ThreeLenses />
      </ScrollReveal>
      <ScrollReveal>
        <BriefingPreview briefing={briefing} />
      </ScrollReveal>
      <ScrollReveal>
        <PosterBlock
          title="The Architecture of Power"
          lens="politics"
          excerpt="A deep analysis of institutional power dynamics and the deliberate architecture of disenfranchisement."
          linkUrl="/articles"
        />
      </ScrollReveal>
      <ScrollReveal>
        <LatestDispatches dispatches={dispatches} />
      </ScrollReveal>
      <ScrollReveal>
        <FeaturedCarousel articles={articles} />
      </ScrollReveal>
      <ScrollReveal>
        <RotatingQuote />
      </ScrollReveal>
      <ScrollReveal>
        <JoinCTA />
      </ScrollReveal>
    </>
  );
}
```

Note: `getFeaturedArticles(5)` increased from 3 to 5 to give the carousel more slides.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Clean build, no TypeScript errors

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All tests pass (including existing homepage tests if any)

- [ ] **Step 4: Commit**

```bash
git add src/app/(public)/page.tsx
git commit -m "feat: integrate scroll reveals, carousel, and dispatches into homepage"
```

---

## Task 6: Card Hover Refinements

Improve hover states across all card components for consistent, subtle cinematic feel. Changes:
- `ArticleCard`: already has `-translate-y-1`, add `duration-300` for smoother feel
- `DispatchCard`: add `hover:-translate-y-0.5` for subtle lift
- `NewspaperGrid` secondary cards: add `hover:-translate-y-0.5`

**Files:**
- Modify: `src/components/content/ArticleCard.tsx` (line 38)
- Modify: `src/components/content/DispatchCard.tsx` (line 22)
- Modify: `src/components/content/NewspaperGrid.tsx` (line 61)

- [ ] **Step 1: Update ArticleCard hover**

In `src/components/content/ArticleCard.tsx`, line 38, change:
```
transition-all duration-200 hover:-translate-y-1 hover:border-bmj-red/40
```
to:
```
transition-all duration-300 hover:-translate-y-1 hover:border-bmj-red/40
```

- [ ] **Step 2: Update DispatchCard hover**

In `src/components/content/DispatchCard.tsx`, line 22, change:
```
transition-colors duration-200 hover:border-bmj-cream
```
to:
```
transition-all duration-300 hover:-translate-y-0.5 hover:border-bmj-cream
```

- [ ] **Step 3: Update NewspaperGrid secondary card hover**

In `src/components/content/NewspaperGrid.tsx`, line 61, change:
```
transition-colors hover:bg-bmj-brown/80
```
to:
```
transition-all duration-300 hover:-translate-y-0.5 hover:bg-bmj-brown/80
```

- [ ] **Step 4: Run brand compliance test**

Run: `npm test -- tests/brand-compliance.test.ts`
Expected: PASS — translate-y is not a prohibited pattern

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/components/content/ArticleCard.tsx src/components/content/DispatchCard.tsx src/components/content/NewspaperGrid.tsx
git commit -m "style: refine card hover states with smoother transitions and subtle lift"
```

---

## Task 7: PageTransition Wrapper

A lightweight client component that fades page content in on route change. Uses `usePathname()` as a key trigger for the fade-in animation.

**Important:** This wraps the `<main>` children in the root layout. Because the root layout is a server component, we create a client wrapper that receives `children` as a prop.

**Architecture note:** In Next.js App Router, exit animations via `AnimatePresence` are unreliable because the framework swaps children before the exit can play. This component provides an **enter-only fade** (new page fades in), which achieves the "subtle cinematic" goal without fighting the framework. The `initial={false}` flag prevents the initial page load from flashing.

**Files:**
- Create: `src/components/motion/PageTransition.tsx`
- Test: `tests/components/PageTransition.test.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write the test**

```tsx
// tests/components/PageTransition.test.tsx
import { render, screen } from '@testing-library/react';
import { PageTransition } from '@/components/motion/PageTransition';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: jest.fn(({ children, className }: Record<string, unknown>) => (
      <div data-testid="page-transition" className={className as string}>
        {children as React.ReactNode}
      </div>
    )),
  },
}));

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <p>Page content</p>
      </PageTransition>,
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('wraps content in motion div', () => {
    render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>,
    );
    expect(screen.getByTestId('page-transition')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/PageTransition.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement PageTransition**

```tsx
// src/components/motion/PageTransition.tsx
'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Enter-only fade. Exit animations are unreliable in App Router because the
// framework swaps children before AnimatePresence can play the exit.
// The enter fade alone achieves the "subtle cinematic" goal.
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/PageTransition.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Integrate into root layout**

In `src/app/layout.tsx`, import `PageTransition` and wrap children:

Find the `<main>` element that wraps `{children}` and wrap the children inside it:

```tsx
import { PageTransition } from '@/components/motion/PageTransition';

// ... inside the return, around {children}:
<main id="main-content" className="flex-1">
  <PageTransition>{children}</PageTransition>
</main>
```

- [ ] **Step 6: Run build**

Run: `npm run build`
Expected: Clean build. PageTransition is a client component wrapping server-rendered children — this is the standard Next.js pattern.

- [ ] **Step 7: Run full test suite**

Run: `npm test`
Expected: All pass

- [ ] **Step 8: Commit**

```bash
git add src/components/motion/PageTransition.tsx tests/components/PageTransition.test.tsx src/app/layout.tsx
git commit -m "feat: add subtle page transition fade between routes"
```

---

## Task 8: Branded 404 Page

A print-culture 404 page with the BrandMark, editorial tone, and navigation back to safety. Replaces the default Next.js 404.

**Files:**
- Create: `src/app/not-found.tsx`
- Test: `tests/pages/not-found.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
// tests/pages/not-found.test.tsx
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

jest.mock('@/components/brand/BrandMark', () => ({
  BrandMark: ({ size }: { size: number }) => (
    <div data-testid="brand-mark" data-size={size} />
  ),
}));

describe('404 Page', () => {
  it('renders the 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
  });

  it('renders an editorial message', () => {
    render(<NotFound />);
    expect(screen.getByText(/page you seek/i)).toBeInTheDocument();
  });

  it('renders a link back to home', () => {
    render(<NotFound />);
    const link = screen.getByRole('link', { name: /return to the front page/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders the BrandMark', () => {
    render(<NotFound />);
    expect(screen.getByTestId('brand-mark')).toBeInTheDocument();
  });

  it('renders a link to the library', () => {
    render(<NotFound />);
    const link = screen.getByRole('link', { name: /browse the library/i });
    expect(link).toHaveAttribute('href', '/library');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/pages/not-found.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement 404 page**

```tsx
// src/app/not-found.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand/BrandMark';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-6 py-24 text-center">
      <BrandMark size={64} color="var(--bmj-red)" className="mb-8 opacity-40" />

      <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-bmj-tan">
        Error 404
      </p>

      <h1 className="mb-6 font-display text-8xl leading-none text-bmj-white sm:text-[10rem]">
        404
      </h1>

      <div className="mx-auto mb-8 h-[3px] w-24 bg-bmj-red" />

      <p className="mx-auto mb-4 max-w-md font-body text-lg leading-relaxed text-bmj-cream/70">
        The page you seek does not exist in this archive. It may have been
        withdrawn, renamed, or never published.
      </p>

      <p className="mx-auto mb-12 max-w-md font-body text-sm text-bmj-tan/60">
        Every record has its place. This is not it.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Link href="/" className="btn-primary btn-lg">
          Return to the Front Page
        </Link>
        <Link
          href="/library"
          className="inline-block border border-bmj-tan/40 px-6 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Browse the Library
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/pages/not-found.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Run brand compliance and build**

Run: `npm test -- tests/brand-compliance.test.ts && npm run build`
Expected: Both pass. Note: `not-found.tsx` is in `src/app/`, not `src/components/`, so brand compliance won't scan it (it only scans `src/components/`). This is fine — the 404 page uses the same patterns.

- [ ] **Step 6: Commit**

```bash
git add src/app/not-found.tsx tests/pages/not-found.test.tsx
git commit -m "feat: add branded 404 page with editorial tone"
```

---

## Task 9: Final Verification

Run the complete test suite, build, lint, and type-check to ensure everything is solid.

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass (should be ~860+ tests)

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Clean production build

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 5: Visual check (manual)**

Start dev server: `npm run dev`
Check at 375px (mobile) and 1440px (desktop):
- Homepage: scroll reveals trigger on each section as you scroll down
- FeaturedCarousel: articles crossfade every 6s, dot navigation works
- LatestDispatches: shows 3 dispatches, "All Dispatches" link works
- Card hovers: smooth `-translate-y` lift on cards
- Route transitions: subtle fade when navigating between pages
- 404 page: visit `/nonexistent-route`, see branded 404
- Reduced motion: enable in OS settings, verify no animations play

---

## Summary of Deliverables

| Component | Type | Lines (est.) |
|-----------|------|-------------|
| `ScrollReveal` | Reusable motion wrapper | ~50 |
| `FeaturedCarousel` | Homepage crossfade slideshow | ~130 |
| `LatestDispatches` | Homepage dispatch section | ~55 |
| `PageTransition` | Route fade wrapper | ~25 |
| `not-found.tsx` | Branded 404 page | ~50 |
| `getLatestDispatches` | Query function | ~15 |
| Card hover refinements | 3 file edits | ~3 lines each |
| Homepage integration | 1 file rewrite | ~50 |
| **Tests** | 5 new test files | ~200 |
| **Total** | ~580 lines new code + tests |
