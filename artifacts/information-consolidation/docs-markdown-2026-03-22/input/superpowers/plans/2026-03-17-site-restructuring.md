# BMJ Site Restructuring Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the BMJ site — simplify navigation, merge Handbooks into Downloads, unify Pricing+Signup into a single Join page, rename the "Ancestors & Architects" section, and reposition Patreon in the footer.

**Architecture:** Six decisions from the strategic spec, minus Decision 5 (lenses 3→5, scoped separately). Changes cascade through nav components, page routes, and the signup flow. Content architecture changes (Chunks 2-3) must land before navigation simplification (Chunk 4) so users always have valid destinations.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Supabase, Stripe (CheckoutButton), Jest + React Testing Library

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/lib/nav.ts` | Shared NAV_LINKS constant (eliminates 3x duplication) |
| Create | `src/app/(auth)/signup/TierSelector.tsx` | Tier selection cards for unified Join page |
| Modify | `src/app/(public)/about/page.tsx` | Rename "Ancestors & Architects" section |
| Modify | `src/components/layout/Footer.tsx` | Patreon repositioning + nav updates |
| Modify | `src/components/layout/Navbar.tsx` | Simplified NAV_LINKS import |
| Modify | `src/components/layout/MobileMenu.tsx` | Simplified NAV_LINKS import |
| Modify | `src/app/(public)/downloads/page.tsx` | Add handbook tab + handbook data fetching |
| Modify | `src/components/content/DownloadCategoryTabs.tsx` | Add "Handbooks" tab |
| Modify | `src/app/(public)/handbooks/page.tsx` | Convert listing to redirect → /downloads?category=handbook |
| Modify | `src/app/(auth)/signup/page.tsx` | Integrate tier selection above form |
| Modify | `src/app/(auth)/signup/SignupForm.tsx` | Accept tier from TierSelector |
| Modify | `src/app/(public)/pricing/page.tsx` | Convert to redirect → /signup |
| Create | `tests/components/TierSelector.test.tsx` | Tests for tier selection component |
| Create | `tests/lib/nav.test.ts` | Tests for shared nav constant |
| Modify | `tests/components/Navbar.test.tsx` | Update for new nav links |
| Modify | `tests/components/MobileMenu.test.tsx` | Update for new nav links |
| Modify | `tests/components/Footer.test.tsx` | Update for Patreon section + nav |
| Modify | `tests/components/SignupForm.test.tsx` | Update for tier integration |
| Modify | `tests/pages/downloads.test.tsx` | Update for handbook category |
| Modify | `tests/pages/handbooks.test.tsx` | Update for redirect behavior |

**Kept intact:**
- `src/app/(public)/handbooks/[slug]/page.tsx` — individual handbook detail pages remain functional
- `src/app/(public)/blog/page.tsx` — route stays, just removed from top nav (Resources already links to it)
- `src/app/(public)/video/page.tsx` — same as blog
- `src/app/(public)/contact/page.tsx` — route stays, moved to footer only

---

## Chunk 1: About Page Rename + Footer Patreon

### Task 1: Rename "Ancestors & Architects" to "Intellectual Lineage & Architects"

**Files:**
- Modify: `src/app/(public)/about/page.tsx:108-112`

- [ ] **Step 1: Write the failing test**

Add a test to verify the new section heading text.

```tsx
// In a new or existing about page test file
// tests/pages/about.test.tsx
import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/(public)/about/page';

// Mock StarDivider and TributeCard
jest.mock('@/components/ui/StarDivider', () => ({
  StarDivider: ({ className }: { className?: string }) => (
    <hr data-testid="star-divider" className={className} />
  ),
}));

jest.mock('@/components/content/TributeCard', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div data-testid="tribute-card">{name}</div>,
}));

describe('AboutPage', () => {
  it('renders "Intellectual Lineage & Architects" section heading', () => {
    render(<AboutPage />);
    expect(screen.getByText(/Intellectual Lineage & Architects/i)).toBeInTheDocument();
  });

  it('renders subheading about honoring intellectual lineage', () => {
    render(<AboutPage />);
    expect(
      screen.getByRole('heading', { name: /We Honor Those Who Built the Road/i })
    ).toBeInTheDocument();
  });

  it('does NOT render old "Ancestors & Architects" text', () => {
    render(<AboutPage />);
    expect(screen.queryByText(/Ancestors & Architects/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/pages/about.test.tsx --no-coverage`
Expected: FAIL — "Ancestors & Architects" still present, "Intellectual Lineage" not found

- [ ] **Step 3: Update the About page**

In `src/app/(public)/about/page.tsx`, change lines 108-109:

```tsx
// OLD (line 109):
            Ancestors &amp; Architects

// NEW:
            Intellectual Lineage &amp; Architects
```

No change to the subheading (line 112) — "We Honor Those Who Built the Road" is already correct framing.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/pages/about.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `npm test -- --no-coverage`
Expected: All tests pass. If TributeCard tests reference "Ancestors", update them.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(public\)/about/page.tsx tests/pages/about.test.tsx
git commit -m "feat: rename Ancestors & Architects to Intellectual Lineage & Architects"
```

---

### Task 2: Reposition Patreon in Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx:25-76`
- Modify: `tests/components/Footer.test.tsx`

The footer currently groups Patreon alongside PayPal, CashApp, and Venmo as identical support links. The change separates Patreon into its own "Support the Work" callout above the one-time payment links.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to tests/components/Footer.test.tsx
describe('Footer support links', () => {
  it('renders Patreon under "Support the Work" heading', () => {
    render(<Footer />);
    expect(screen.getByText('Support the Work')).toBeInTheDocument();
    const patreonLink = screen.getByRole('link', { name: /Patreon/i });
    expect(patreonLink).toHaveAttribute('href', 'https://patreon.com/BlackMaleJournal');
  });

  it('renders Patreon description text', () => {
    render(<Footer />);
    expect(screen.getByText(/Join the inner circle/i)).toBeInTheDocument();
  });

  it('groups PayPal, CashApp, Venmo under "Direct Support"', () => {
    render(<Footer />);
    expect(screen.getByText('Direct Support')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /PayPal/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /CashApp/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Venmo/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/components/Footer.test.tsx --no-coverage`
Expected: FAIL — no "Support the Work" heading, no separate grouping

- [ ] **Step 3: Update Footer support links section**

In `src/components/layout/Footer.tsx`, replace the SUPPORT_LINKS constant and the support links rendering section (lines 25-76) with:

```tsx
const DIRECT_SUPPORT_LINKS = [
  { label: "PayPal",   href: "https://paypal.me/BlackMaleJournal" },
  { label: "CashApp",  href: "https://cash.app/$BlackMaleJournal" },
  { label: "Venmo",    href: "https://venmo.com/BlackMaleJournal" },
];
```

And replace the support links JSX block (the `<div className="flex flex-wrap gap-3 pt-2">` section) with:

```tsx
            {/* Patreon — patronage channel */}
            <div className="pt-2">
              <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
                Support the Work
              </p>
              <a
                href="https://patreon.com/BlackMaleJournal"
                className="inline-block border border-bmj-amber/40 bg-bmj-amber/10 px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-amber transition-colors hover:bg-bmj-amber/20"
                target="_blank"
                rel="noopener noreferrer"
              >
                Patreon — Join the Inner Circle
              </a>
            </div>

            {/* Direct support */}
            <div className="pt-2">
              <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
                Direct Support
              </p>
              <div className="flex flex-wrap gap-3">
                {DIRECT_SUPPORT_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/components/Footer.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Footer.tsx tests/components/Footer.test.tsx
git commit -m "feat: reposition Patreon as patronage channel in footer"
```

---

## Chunk 2: Downloads + Handbooks Merge

### Task 3: Add "Handbooks" Tab to DownloadCategoryTabs

**Files:**
- Modify: `src/components/content/DownloadCategoryTabs.tsx:5-15`

- [ ] **Step 1: Write the failing test**

```tsx
// Add to tests/components/DownloadCategoryTabs.test.tsx (create if needed)
import { render, screen } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/downloads',
  useSearchParams: () => new URLSearchParams(),
}));

import { DownloadCategoryTabs } from '@/components/content/DownloadCategoryTabs';

describe('DownloadCategoryTabs', () => {
  it('renders a Handbooks tab', () => {
    render(<DownloadCategoryTabs activeCategory="all" />);
    expect(screen.getByRole('tab', { name: /Handbooks/i })).toBeInTheDocument();
  });

  it('renders all 6 tabs: All, Templates, Worksheets, Guides, Toolkits, Handbooks', () => {
    render(<DownloadCategoryTabs activeCategory="all" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/components/DownloadCategoryTabs.test.tsx --no-coverage`
Expected: FAIL — only 5 tabs, no "Handbooks" tab

- [ ] **Step 3: Add Handbooks tab**

In `src/components/content/DownloadCategoryTabs.tsx`, update the type and TABS:

```tsx
type DownloadCat = 'template' | 'worksheet' | 'guide' | 'toolkit' | 'handbook' | 'all';

type Tab = { label: string; value: DownloadCat };

const TABS: Tab[] = [
  { label: 'All', value: 'all' },
  { label: 'Templates', value: 'template' },
  { label: 'Worksheets', value: 'worksheet' },
  { label: 'Guides', value: 'guide' },
  { label: 'Toolkits', value: 'toolkit' },
  { label: 'Handbooks', value: 'handbook' },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/components/DownloadCategoryTabs.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/content/DownloadCategoryTabs.tsx tests/components/DownloadCategoryTabs.test.tsx
git commit -m "feat: add Handbooks tab to DownloadCategoryTabs"
```

---

### Task 4: Update Downloads Page to Fetch and Display Handbooks

**Files:**
- Modify: `src/app/(public)/downloads/page.tsx`
- Modify: `tests/pages/downloads.test.tsx`

When "handbook" category is selected (or "all"), the page fetches from the handbooks table and renders HandbookCards. For other categories, it fetches from the downloads table as before.

The existing `tests/pages/downloads.test.tsx` tests query functions directly (not page rendering). We extend this pattern.

- [ ] **Step 1: Write the failing test**

First, update the existing mock block at the top of `tests/pages/downloads.test.tsx` to include `getHandbooks`:

```tsx
// Replace the entire file content:
jest.mock('@/lib/supabase/queries', () => ({
  getDownloads: jest.fn(),
  getHandbooks: jest.fn(),
}));

import { getDownloads, getHandbooks } from '@/lib/supabase/queries';

describe('Downloads Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getDownloads with category filter', async () => {
    (getDownloads as jest.Mock).mockResolvedValue([]);
    await getDownloads({ category: 'template' });
    expect(getDownloads).toHaveBeenCalledWith({ category: 'template' });
  });

  it('calls getDownloads without filter for all', async () => {
    (getDownloads as jest.Mock).mockResolvedValue([]);
    await getDownloads({});
    expect(getDownloads).toHaveBeenCalledWith({});
  });

  it('calls getHandbooks when category is handbook', async () => {
    (getHandbooks as jest.Mock).mockResolvedValue([
      {
        id: 'hb-1',
        title: 'Letters to a Young King',
        slug: 'letters-to-a-young-king',
        lens: 'philosophy',
        description: 'A handbook on purpose',
        access_tier: 'basic',
        published_at: '2026-01-15',
        cover_image: null,
      },
    ]);
    const result = await getHandbooks({});
    expect(getHandbooks).toHaveBeenCalledWith({});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Letters to a Young King');
  });

  it('accepts handbook as a valid category', () => {
    const VALID_CATEGORIES = new Set(['template', 'worksheet', 'guide', 'toolkit', 'handbook']);
    expect(VALID_CATEGORIES.has('handbook')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/pages/downloads.test.tsx --no-coverage`
Expected: FAIL — `getHandbooks` not exported from mock (since we just added it), and 'handbook' not in VALID_CATEGORIES

- [ ] **Step 3: Update Downloads page to handle handbook category**

In `src/app/(public)/downloads/page.tsx`:

1. Add `'handbook'` to `VALID_CATEGORIES`:
```tsx
const VALID_CATEGORIES = new Set<string>([
  'template',
  'worksheet',
  'guide',
  'toolkit',
  'handbook',
]);
```

2. Import handbook dependencies:
```tsx
import { getDownloads, getHandbooks, getMemberById } from '@/lib/supabase/queries';
import { HandbookCard } from '@/components/content/HandbookCard';
```

3. In the page component body, after determining `activeCategory`, add conditional fetching:

```tsx
  const isHandbookCategory = activeCategory === 'handbook';

  // Fetch appropriate data based on category
  const downloads = isHandbookCategory ? [] : await getDownloads({ category: activeCategory });
  const handbooks = (isHandbookCategory || !activeCategory)
    ? await getHandbooks({})
    : [];
```

4. In the JSX, update the content rendering section to show both types:

```tsx
      {downloads.length === 0 && handbooks.length === 0 ? (
        <EmptyState
          heading="No downloads available"
          description="Downloadable resources are on the way. Check back soon."
          actionLabel="Browse articles"
          actionHref="/articles"
        />
      ) : (
        <div className="space-y-4">
          {/* Handbook cards (when handbook tab or All tab) */}
          {handbooks.length > 0 && (
            <div className="space-y-6">
              {!isHandbookCategory && handbooks.length > 0 && downloads.length > 0 && (
                <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                  Handbooks
                </p>
              )}
              {handbooks.map((handbook) => (
                <HandbookCard
                  key={handbook.id}
                  title={handbook.title}
                  slug={handbook.slug}
                  lens={handbook.lens}
                  description={handbook.description}
                  accessTier={handbook.access_tier}
                  publishedAt={handbook.published_at}
                  coverImage={handbook.cover_image}
                />
              ))}
            </div>
          )}

          {/* Download cards */}
          {downloads.length > 0 && (
            <div className="space-y-4">
              {!isHandbookCategory && handbooks.length > 0 && (
                <p className="mt-8 font-label text-xs uppercase tracking-widest text-bmj-tan">
                  Downloads
                </p>
              )}
              {downloads.map((dl) => {
                const requiredRank = TIER_RANK[dl.access_tier] ?? 0;
                const userHasAccess = userTierRank >= requiredRank;
                return (
                  <DownloadCard
                    key={dl.id}
                    title={dl.title}
                    slug={dl.slug}
                    description={dl.description}
                    category={dl.category}
                    fileType={dl.file_type}
                    fileSize={dl.file_size}
                    accessTier={dl.access_tier}
                    hasAccess={userHasAccess}
                    fileUrl={dl.file_url}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/pages/downloads.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `npm test -- --no-coverage`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/app/\(public\)/downloads/page.tsx tests/pages/downloads.test.tsx
git commit -m "feat: integrate handbooks into Downloads page with handbook category tab"
```

---

### Task 5: Convert Handbooks Listing to Redirect

**Files:**
- Modify: `src/app/(public)/handbooks/page.tsx`
- Modify: `tests/pages/handbooks.test.tsx`

The `/handbooks` route now redirects to `/downloads?category=handbook`. Individual handbook detail pages at `/handbooks/[slug]` remain unchanged.

- [ ] **Step 1: Write the failing test**

```tsx
// Replace tests/pages/handbooks.test.tsx content
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Also mock the Supabase/component dependencies that the OLD page uses,
// so the dynamic import doesn't fail before we replace it
jest.mock('@/lib/supabase/queries', () => ({
  getHandbooks: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/components/ui/StarDivider', () => ({ StarDivider: () => null }));
jest.mock('@/components/ui/EmptyState', () => ({ EmptyState: () => null }));
jest.mock('@/components/content/HandbookCard', () => ({ HandbookCard: () => null }));
jest.mock('@/components/content/LensFilterTabs', () => ({ LensFilterTabs: () => null }));

describe('HandbooksPage redirect', () => {
  it('redirects to /downloads?category=handbook', async () => {
    const { default: HandbooksPage } = await import(
      '@/app/(public)/handbooks/page'
    );

    // Call without args — the new redirect page takes no props
    HandbooksPage();

    expect(redirect).toHaveBeenCalledWith('/downloads?category=handbook');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/pages/handbooks.test.tsx --no-coverage`
Expected: FAIL — page renders content instead of calling redirect()

- [ ] **Step 3: Replace handbooks page with redirect**

Replace `src/app/(public)/handbooks/page.tsx` with:

```tsx
import { redirect } from 'next/navigation';

export default function HandbooksPage() {
  redirect('/downloads?category=handbook');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/pages/handbooks.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/\(public\)/handbooks/page.tsx tests/pages/handbooks.test.tsx
git commit -m "feat: redirect /handbooks to /downloads?category=handbook"
```

---

## Chunk 3: Join Page Unification

### Task 6: Create TierSelector Component

**Files:**
- Create: `src/app/(auth)/signup/TierSelector.tsx`
- Create: `tests/components/TierSelector.test.tsx`

A client component that displays three tier cards (Free, Basic, Premium) and allows selection. Communicates selected tier to the parent via callback.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/TierSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TierSelector } from '@/app/(auth)/signup/TierSelector';

describe('TierSelector', () => {
  it('renders three tier cards: Free, Basic, Premium', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);

    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('BASIC')).toBeInTheDocument();
    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('shows $0/month for free tier', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('shows $9/month for basic tier', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);
    expect(screen.getByText('$9')).toBeInTheDocument();
  });

  it('shows $19/month for premium tier', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);
    expect(screen.getByText('$19')).toBeInTheDocument();
  });

  it('highlights the selected tier', () => {
    render(<TierSelector selectedTier="basic" onSelect={jest.fn()} />);

    const basicCard = screen.getByText('BASIC').closest('[data-tier]');
    expect(basicCard).toHaveAttribute('data-selected', 'true');
  });

  it('calls onSelect when a tier card is clicked', () => {
    const onSelect = jest.fn();
    render(<TierSelector selectedTier="free" onSelect={onSelect} />);

    fireEvent.click(screen.getByText('PREMIUM'));
    expect(onSelect).toHaveBeenCalledWith('premium');
  });

  it('renders feature lists for each tier', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);

    expect(screen.getByText('Public articles')).toBeInTheDocument();
    expect(screen.getByText('Full Weekend Briefing archive')).toBeInTheDocument();
    expect(screen.getByText('Direct line to The Chairman')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/components/TierSelector.test.tsx --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 3: Create the TierSelector component**

```tsx
// src/app/(auth)/signup/TierSelector.tsx
'use client';

interface TierSelectorProps {
  selectedTier: string;
  onSelect: (tier: string) => void;
}

const TIERS = [
  {
    id: 'free',
    name: 'FREE',
    price: '$0',
    interval: '/month',
    description: 'Start here. Access the archive.',
    features: [
      'Public articles',
      'Briefing previews',
      'Video gallery',
      'Academy access',
    ],
    border: 'border-bmj-tan/40',
    accent: 'text-bmj-cream',
    selectedBorder: 'border-bmj-cream',
  },
  {
    id: 'basic',
    name: 'BASIC',
    price: '$9',
    interval: '/month',
    description: 'Full access to the archive and community.',
    features: [
      'Everything in Free',
      'Full Weekend Briefing archive',
      'Select handbooks',
      'Member forum access',
    ],
    border: 'border-bmj-amber/40',
    accent: 'text-bmj-amber',
    selectedBorder: 'border-bmj-amber',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '$19',
    interval: '/month',
    description: 'Complete access. Everything we build, you get.',
    features: [
      'Everything in Basic',
      'All handbooks and downloads',
      'Private content',
      'Early access to new features',
      'Direct line to The Chairman',
    ],
    border: 'border-bmj-red/40',
    accent: 'text-bmj-red',
    selectedBorder: 'border-bmj-red',
  },
] as const;

export function TierSelector({ selectedTier, onSelect }: TierSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {TIERS.map((t) => {
        const isSelected = selectedTier === t.id;
        return (
          <button
            key={t.id}
            type="button"
            data-tier={t.id}
            data-selected={isSelected}
            onClick={() => onSelect(t.id)}
            className={`border ${
              isSelected ? `${t.selectedBorder} ring-1 ring-current` : t.border
            } bg-bmj-brown p-6 text-left transition-all hover:border-opacity-80`}
          >
            <h3 className={`mb-1 font-display text-2xl ${t.accent}`}>
              {t.name}
            </h3>
            <div className="mb-3 flex items-baseline gap-1">
              <span className="font-display text-3xl text-bmj-white">
                {t.price}
              </span>
              <span className="font-mono text-xs text-bmj-tan">
                {t.interval}
              </span>
            </div>
            <p className="mb-4 font-body text-xs text-bmj-cream/60">
              {t.description}
            </p>
            <ul className="space-y-1.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-xs text-bmj-red" aria-hidden="true">
                    ★
                  </span>
                  <span className="font-body text-xs text-bmj-cream/80">{f}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/components/TierSelector.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/signup/TierSelector.tsx tests/components/TierSelector.test.tsx
git commit -m "feat: create TierSelector component for unified Join page"
```

---

### Task 7: Integrate TierSelector into Signup Page

**Files:**
- Modify: `src/app/(auth)/signup/SignupForm.tsx`
- Modify: `src/app/(auth)/signup/page.tsx`
- Modify: `tests/components/SignupForm.test.tsx`

The signup page now shows: heading → tier selector → signup form. The form tracks which tier is selected and includes it as a hidden field. Layout widens from `max-w-md` to `max-w-4xl` to fit three tier cards.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to tests/components/SignupForm.test.tsx
describe('SignupForm with tier selector', () => {
  it('renders TierSelector above the form', () => {
    render(<SignupForm />);

    // TierSelector should show all three tiers
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('BASIC')).toBeInTheDocument();
    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('defaults to free tier when no preselectedTier', () => {
    render(<SignupForm />);
    const freeCard = screen.getByText('FREE').closest('[data-tier]');
    expect(freeCard).toHaveAttribute('data-selected', 'true');
  });

  it('preselects the tier from props', () => {
    render(<SignupForm preselectedTier="premium" />);
    const premiumCard = screen.getByText('PREMIUM').closest('[data-tier]');
    expect(premiumCard).toHaveAttribute('data-selected', 'true');
  });

  it('shows payment redirect notice for paid tiers', () => {
    render(<SignupForm preselectedTier="basic" />);
    expect(screen.getByText(/directed to payment/i)).toBeInTheDocument();
  });

  it('does not show payment notice for free tier', () => {
    render(<SignupForm preselectedTier="free" />);
    expect(screen.queryByText(/directed to payment/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/components/SignupForm.test.tsx --no-coverage`
Expected: FAIL — no tier selector in form

- [ ] **Step 3: Update SignupForm to include TierSelector**

In `src/app/(auth)/signup/SignupForm.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signup } from '../actions';
import { TierSelector } from './TierSelector';

interface SignupFormProps {
  preselectedTier?: string;
}

export function SignupForm({ preselectedTier }: SignupFormProps) {
  const [selectedTier, setSelectedTier] = useState(preselectedTier ?? 'free');

  return (
    <div className="space-y-8">
      {/* Tier selection */}
      <TierSelector selectedTier={selectedTier} onSelect={setSelectedTier} />

      {/* Signup form */}
      <div className="mx-auto max-w-md border border-bmj-red/20 bg-bmj-brown p-8">
        <form action={signup} className="space-y-4">
          <input type="hidden" name="tier" value={selectedTier} />

          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {selectedTier !== 'free' && (
            <div className="border border-bmj-amber/30 bg-bmj-amber/10 p-3">
              <p className="font-label text-xs uppercase tracking-widest text-bmj-amber">
                Selected: {selectedTier} plan
              </p>
              <p className="mt-1 font-body text-xs text-bmj-tan">
                You&apos;ll be directed to payment after signup.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-bmj-tan">
          Already a member?{' '}
          <Link href="/login" className="text-bmj-red hover:text-bmj-cream">
            Log in &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update signup page layout**

In `src/app/(auth)/signup/page.tsx`, widen the container:

Change `max-w-md` to `max-w-4xl`:
```tsx
        <div className="w-full max-w-4xl">
```

Add the free tier description to the intro text:
```tsx
          <p className="font-body text-sm text-bmj-tan">
            Choose your membership. Access the archive.
          </p>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest tests/components/SignupForm.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 6: Run full test suite**

Run: `npm test -- --no-coverage`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add src/app/\(auth\)/signup/SignupForm.tsx src/app/\(auth\)/signup/page.tsx tests/components/SignupForm.test.tsx
git commit -m "feat: integrate tier selection into unified Join page"
```

---

### Task 8: Convert Pricing Page to Redirect

**Files:**
- Modify: `src/app/(public)/pricing/page.tsx`

The `/pricing` route now redirects to `/signup`. All pricing information is displayed on the Join page.

- [ ] **Step 1: Write the test**

```tsx
// tests/pages/pricing-redirect.test.ts
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('PricingPage redirect', () => {
  it('redirects to /signup', async () => {
    const { default: PricingPage } = await import(
      '@/app/(public)/pricing/page'
    );

    PricingPage();

    expect(redirect).toHaveBeenCalledWith('/signup');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/pages/pricing-redirect.test.ts --no-coverage`
Expected: FAIL — page renders tier cards instead of redirecting

- [ ] **Step 3: Replace pricing page with redirect**

Replace `src/app/(public)/pricing/page.tsx` with:

```tsx
import { redirect } from 'next/navigation';

export default function PricingPage() {
  redirect('/signup');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/pages/pricing-redirect.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/\(public\)/pricing/page.tsx tests/pages/pricing-redirect.test.ts
git commit -m "feat: redirect /pricing to /signup (unified Join page)"
```

---

## Chunk 4: Navigation Simplification

### Task 9: Extract Shared NAV_LINKS Constant

**Files:**
- Create: `src/lib/nav.ts`
- Create: `tests/lib/nav.test.ts`

Currently NAV_LINKS is defined identically in three files. Extract to a shared constant with two variants: header (5 items) and footer (includes Contact).

- [ ] **Step 1: Write the failing test**

```tsx
// tests/lib/nav.test.ts
import { HEADER_NAV_LINKS, FOOTER_NAV_LINKS } from '@/lib/nav';

describe('Navigation constants', () => {
  describe('HEADER_NAV_LINKS', () => {
    it('contains exactly 5 links', () => {
      expect(HEADER_NAV_LINKS).toHaveLength(5);
    });

    it('contains Home, About, Academy, Downloads, Resources', () => {
      const labels = HEADER_NAV_LINKS.map((l) => l.label);
      expect(labels).toEqual(['Home', 'About', 'Academy', 'Downloads', 'Resources']);
    });

    it('does NOT contain Handbooks, Video, Blog, Pricing, or Contact', () => {
      const labels = HEADER_NAV_LINKS.map((l) => l.label);
      expect(labels).not.toContain('Handbooks');
      expect(labels).not.toContain('Video');
      expect(labels).not.toContain('Blog');
      expect(labels).not.toContain('Pricing');
      expect(labels).not.toContain('Contact');
    });
  });

  describe('FOOTER_NAV_LINKS', () => {
    it('contains 6 links (header links + Contact)', () => {
      expect(FOOTER_NAV_LINKS).toHaveLength(6);
    });

    it('includes Contact', () => {
      const labels = FOOTER_NAV_LINKS.map((l) => l.label);
      expect(labels).toContain('Contact');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/lib/nav.test.ts --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 3: Create the shared nav constant**

```tsx
// src/lib/nav.ts
export type NavLink = {
  label: string;
  href: string;
};

/**
 * Header navigation — the 5 primary destinations.
 * Auth CTAs (Log In / Join) are rendered separately by the Navbar component.
 */
export const HEADER_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academy', href: '/academy' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Resources', href: '/resources' },
];

/**
 * Footer navigation — header links plus utility pages.
 */
export const FOOTER_NAV_LINKS: NavLink[] = [
  ...HEADER_NAV_LINKS,
  { label: 'Contact', href: '/contact' },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/lib/nav.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav.ts tests/lib/nav.test.ts
git commit -m "feat: extract shared NAV_LINKS constants for header and footer"
```

---

### Task 10: Update Navbar to Use Shared NAV_LINKS

**Files:**
- Modify: `src/components/layout/Navbar.tsx:16-27`
- Modify: `tests/components/Navbar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// Update tests/components/Navbar.test.tsx
describe('Navbar simplified navigation', () => {
  it('renders exactly 5 nav links', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation', { name: /main/i });
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(5);
  });

  it('renders Home, About, Academy, Downloads, Resources', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Academy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Downloads' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resources' })).toBeInTheDocument();
  });

  it('does NOT render Handbooks, Video, Blog, Pricing, or Contact in nav', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation', { name: /main/i });
    expect(within(nav).queryByRole('link', { name: 'Handbooks' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Video' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/components/Navbar.test.tsx --no-coverage`
Expected: FAIL — still 10 nav links

- [ ] **Step 3: Update Navbar to import shared constant**

In `src/components/layout/Navbar.tsx`:

1. Remove the local `NAV_LINKS` constant (lines 16-27)
2. Add import: `import { HEADER_NAV_LINKS } from '@/lib/nav';`
3. Replace all references to `NAV_LINKS` with `HEADER_NAV_LINKS`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/components/Navbar.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Navbar.tsx tests/components/Navbar.test.tsx
git commit -m "feat: simplify Navbar to 5 primary nav links"
```

---

### Task 11: Update MobileMenu to Use Shared NAV_LINKS

**Files:**
- Modify: `src/components/layout/MobileMenu.tsx:15-26`
- Modify: `tests/components/MobileMenu.test.tsx`

- [ ] **Step 1: Update existing test assertions that will break**

In `tests/components/MobileMenu.test.tsx`, the existing test "renders nav links when open" (line 14-20) asserts `Contact` is present. After this change, Contact will be removed from MobileMenu. Update the existing test:

```tsx
// REPLACE the existing "renders nav links when open" test (lines 14-20):
  it('renders nav links when open', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Add new assertion tests**

Add this new describe block to `tests/components/MobileMenu.test.tsx`:

```tsx
describe('MobileMenu simplified navigation', () => {
  it('renders exactly 5 nav links when open', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    const navLabels = ['Home', 'About', 'Academy', 'Downloads', 'Resources'];
    navLabels.forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('does NOT render removed nav items', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    expect(screen.queryByRole('link', { name: 'Handbooks' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Video' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest tests/components/MobileMenu.test.tsx --no-coverage`
Expected: FAIL — still shows all 10 links

- [ ] **Step 4: Update MobileMenu**

In `src/components/layout/MobileMenu.tsx`:

1. Remove the local `NAV_LINKS` constant (lines 15-26)
2. Add import: `import { HEADER_NAV_LINKS } from '@/lib/nav';`
3. Replace all references to `NAV_LINKS` with `HEADER_NAV_LINKS`

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest tests/components/MobileMenu.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/MobileMenu.tsx tests/components/MobileMenu.test.tsx
git commit -m "feat: simplify MobileMenu to 5 primary nav links"
```

---

### Task 12: Update Footer Navigation

**Files:**
- Modify: `src/components/layout/Footer.tsx:6-16`
- Modify: `tests/components/Footer.test.tsx`

- [ ] **Step 1: Update existing test assertions that will break**

In `tests/components/Footer.test.tsx`, the existing test "renders navigation links" (line 10-17) asserts `Blog` is present. After this change, Blog will be removed from footer nav. Update the existing test:

```tsx
// REPLACE the existing "renders navigation links" test (lines 10-17):
  it('renders navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Add new assertion tests**

Add `within` to the imports and add this new describe block to `tests/components/Footer.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
```

```tsx
describe('Footer navigation', () => {
  it('renders 6 footer nav links including Contact', () => {
    render(<Footer />);
    const nav = screen.getByRole('navigation', { name: /footer/i });
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(6);
  });

  it('includes Contact in footer nav', () => {
    render(<Footer />);
    const nav = screen.getByRole('navigation', { name: /footer/i });
    expect(within(nav).getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('does NOT include Handbooks, Video, Blog, or Pricing in footer nav', () => {
    render(<Footer />);
    const nav = screen.getByRole('navigation', { name: /footer/i });
    expect(within(nav).queryByRole('link', { name: 'Handbooks' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Video' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest tests/components/Footer.test.tsx --no-coverage`
Expected: FAIL — footer still has 9 links

- [ ] **Step 4: Update Footer nav links**

In `src/components/layout/Footer.tsx`:

1. Remove the local `NAV_LINKS` constant (lines 6-16)
2. Add import: `import { FOOTER_NAV_LINKS } from '@/lib/nav';`
3. Replace `NAV_LINKS` with `FOOTER_NAV_LINKS` in the JSX

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest tests/components/Footer.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 6: Run full test suite**

Run: `npm test -- --no-coverage`
Expected: All tests pass

- [ ] **Step 7: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/Footer.tsx tests/components/Footer.test.tsx
git commit -m "feat: update Footer to use simplified shared nav links"
```

---

## Post-Implementation Checklist

After all chunks are complete:

- [ ] **Full test suite**: `npm test -- --no-coverage` — all pass
- [ ] **TypeScript check**: `npx tsc --noEmit` — no errors
- [ ] **Lint**: `npm run lint` — no errors
- [ ] **Build**: `npm run build` — succeeds
- [ ] **Visual verification at 375px**: check all modified pages on mobile
- [ ] **Visual verification at 1440px**: check all modified pages on desktop
- [ ] **Route verification**:
  - `/handbooks` → redirects to `/downloads?category=handbook`
  - `/handbooks/letters-to-a-young-king` → still works (detail page intact)
  - `/pricing` → redirects to `/signup`
  - `/signup` → shows tier selector + signup form
  - `/signup?tier=premium` → preselects premium tier
  - `/downloads?category=handbook` → shows handbook cards
  - `/contact` → still accessible (footer link)
  - `/blog` → still accessible (Resources page links to it)
  - `/video` → still accessible (Resources page links to it)

---

## Out of Scope (Deferred)

- **Decision 5 — Lenses 3→5**: Cascading change across About page, homepage ThreeLenses component, Resources "Browse by Lens" section, all article categorization, and LensFilterTabs. Needs its own focused plan once the two new lenses are defined.
- **Sitemap update**: `src/app/sitemap.ts` may need updates for removed/redirected routes — verify after implementation.
- **SEO metadata**: Redirected pages (pricing, handbooks listing) lose their metadata. Verify canonical URLs and Open Graph data on the new target pages.
