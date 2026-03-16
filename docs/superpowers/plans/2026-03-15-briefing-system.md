# Weekend Briefing System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Weekend Briefing system — archive page, individual briefing page, BriefingCard component, ShareButton island, and home page wiring — so the flagship content format has its own editorial presence.

**Architecture:** All data-fetching pages are async Server Components that call typed query helpers from `src/lib/supabase/queries.ts`. Client-side interactivity is isolated to a single `ShareButton` component. The paywall pattern mirrors the existing article paywall: free briefings render all sections; gated briefings render the first section then `PaywallGate`. Prev/next navigation uses `getBriefingByIssue(n ± 1)`.

**Tech Stack:** Next.js 16 App Router, TypeScript strict mode, Tailwind CSS with brand CSS variables, `@supabase/ssr` server client, lucide-react icons, `framer-motion` (archive page heading only — keep subtle)

---

## Route Note

The spec draft used `/briefing/` (no 's'), but **all existing links in the codebase already use `/briefings/`** (`BriefingPreview.tsx` line 42, `HeroBanner.tsx` line 68). Use `/briefings/` throughout.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/content/BriefingCard.tsx` | Wide editorial card: issue #, date, title, first-section preview, tier badge |
| Create | `src/components/ui/ShareButton.tsx` | Client island — copies current URL to clipboard, toggles "Copied!" |
| Create | `src/app/(public)/briefings/page.tsx` | Archive page — vertical stack of BriefingCards, URL pagination, empty state |
| Create | `src/app/(public)/briefings/[slug]/page.tsx` | Individual page — header, cover, sections, paywall, prev/next, share |
| Modify | `src/components/home/BriefingPreview.tsx` | Replace inline briefing display with `<BriefingCard>` |

**No new query helpers needed** — `getBriefings`, `getBriefingBySlug`, `getLatestBriefing`, and `getBriefingByIssue` already exist in `src/lib/supabase/queries.ts`.

**No new types needed** — `Briefing` and `BriefingSection` are already defined in `src/lib/supabase/types.ts`.

---

## Chunk 1: Components (Tasks 1–2)

### Task 1: BriefingCard Component

**Files:**
- Create: `src/components/content/BriefingCard.tsx`

The BriefingCard is the primary list item for the archive and the home page preview. It must feel distinctly different from ArticleCard — wider, more editorial, less card-like. Key visual markers: red left border, issue number in IBM Plex Mono, large Bebas Neue title.

- [ ] **Step 1: Create `src/components/content/BriefingCard.tsx`**

```tsx
// src/components/content/BriefingCard.tsx
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Briefing } from '@/lib/supabase/types';

interface BriefingCardProps {
  briefing: Briefing;
}

export function BriefingCard({ briefing }: BriefingCardProps) {
  const issueLabel = `No. ${String(briefing.issue_number).padStart(3, '0')}`;
  const previewText = briefing.sections[0]?.title ?? '';
  const isPremium = briefing.access_tier !== 'free';

  return (
    <article className="group relative border-l-4 border-bmj-red bg-bmj-brown transition-colors duration-200 hover:bg-bmj-brown/80">
      <Link
        href={`/briefings/${briefing.slug}`}
        className="block p-6 no-underline sm:p-8"
      >
        {/* Issue + date row */}
        <div className="mb-3 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-bmj-tan">
            {issueLabel}
          </span>
          <span className="font-mono text-xs text-bmj-tan/60">
            {formatDate(briefing.published_at)}
          </span>
          {isPremium && (
            <span className="ml-auto flex items-center gap-1 font-label text-xs uppercase tracking-widest text-bmj-amber">
              <Lock size={10} />
              Premium
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-3 font-display text-3xl leading-tight text-bmj-white transition-opacity group-hover:opacity-80 sm:text-4xl">
          {briefing.title}
        </h3>

        {/* First section title as preview */}
        {previewText && (
          <p className="font-label text-sm uppercase tracking-wider text-bmj-tan/70">
            {previewText}
          </p>
        )}
      </Link>
    </article>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors for the new file

- [ ] **Step 3: Commit**

```bash
git add src/components/content/BriefingCard.tsx
git commit -m "feat: add BriefingCard editorial list component"
```

---

### Task 2: ShareButton Client Island

**Files:**
- Create: `src/components/ui/ShareButton.tsx`

The share button needs the browser `navigator.clipboard` API, so it must be a Client Component. Keep it as a pure island — no state leaks to the Server Component above.

- [ ] **Step 1: Create `src/components/ui/ShareButton.tsx`**

```tsx
// src/components/ui/ShareButton.tsx
'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available (e.g. HTTP in dev) — silently ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
      aria-label="Copy link to this page"
    >
      <Link2 size={14} />
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ShareButton.tsx
git commit -m "feat: add ShareButton client island for clipboard copy"
```

---

## Chunk 2: Pages (Tasks 3–4)

### Task 3: Briefing Archive Page

**Files:**
- Create: `src/app/(public)/briefings/page.tsx`

The archive is a vertical editorial stack — NOT a grid. Each BriefingCard should feel like a newspaper headline row. Pagination mirrors the articles page: `?page=N` URL params, "Load More" link.

- [ ] **Step 1: Create `src/app/(public)/briefings/page.tsx`**

```tsx
// src/app/(public)/briefings/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { getBriefings } from '@/lib/supabase/queries';
import { StarDivider } from '@/components/ui/StarDivider';
import { BriefingCard } from '@/components/content/BriefingCard';

export const metadata: Metadata = {
  title: 'Weekend Briefing',
  description:
    'A weekly dispatch on the politics, philosophy, and health of the Black male experience.',
};

const PAGE_SIZE = 10;

interface BriefingsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BriefingsPage({ searchParams }: BriefingsPageProps) {
  const { page: rawPage } = await searchParams;
  const parsedPage = parseInt(rawPage ?? '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  // Fetch one extra to detect if more pages exist
  const briefings = await getBriefings({ limit: PAGE_SIZE * page + 1, offset: 0 });

  const hasMore = briefings.length > PAGE_SIZE * page;
  const visible = briefings.slice(0, PAGE_SIZE * page);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-2 flex items-center gap-3">
        <BookOpen size={28} className="text-bmj-red" aria-hidden="true" />
        <h1 className="font-display text-5xl text-bmj-white">
          Weekend Briefing
        </h1>
      </div>

      <p className="mb-4 font-body text-base italic text-bmj-tan">
        A weekly dispatch on the politics, philosophy, and health of the Black male experience.
      </p>

      <StarDivider className="mb-12" />

      {/* Briefing list */}
      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-label text-bmj-tan">No briefings published yet.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan/60">
            The first dispatch is being prepared.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((briefing) => (
              <BriefingCard key={briefing.id} briefing={briefing} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <Link
                href={`/briefings?page=${page + 1}`}
                className="inline-block border border-bmj-tan/40 px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
              >
                Load More
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/briefings/page.tsx
git commit -m "feat: add Weekend Briefing archive page"
```

---

### Task 4: Individual Briefing Page

**Files:**
- Create: `src/app/(public)/briefings/[slug]/page.tsx`

This is the most complex file in the system. Key decisions locked in here:

1. **Access check** — mirrors the article page exactly: `TIER_RANK` map, get user from Supabase auth, check member tier.
2. **Section rendering** — map over `briefing.sections` array; show all if user has access; show only `sections[0]` + `PaywallGate` if gated.
3. **PaywallGate reuse** — pass `sections[1]?.body.slice(0, 300)` as `previewBody` (the teaser that fades out under the gate).
4. **Prev/next navigation** — call `getBriefingByIssue(issue_number - 1)` and `getBriefingByIssue(issue_number + 1)` in parallel.
5. **ShareButton** — client island, placed after the last section.

- [ ] **Step 1: Create `src/app/(public)/briefings/[slug]/page.tsx`**

```tsx
// src/app/(public)/briefings/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import {
  getBriefingBySlug,
  getBriefingByIssue,
  getMemberById,
} from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { StarDivider } from '@/components/ui/StarDivider';
import { ShareButton } from '@/components/ui/ShareButton';
import { PaywallGate } from '@/components/content/PaywallGate';

interface BriefingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: BriefingPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const briefing = await getBriefingBySlug(slug);
  if (!briefing) return { title: 'Briefing Not Found' };

  const issueLabel = `No. ${String(briefing.issue_number).padStart(3, '0')}`;
  const description =
    briefing.sections[0]?.body.slice(0, 160) ?? briefing.title;

  return {
    title: `${issueLabel} — ${briefing.title}`,
    description,
    openGraph: {
      title: `Weekend Briefing ${issueLabel}: ${briefing.title}`,
      description,
      images: briefing.cover_image ? [{ url: briefing.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Weekend Briefing ${issueLabel}: ${briefing.title}`,
      description,
      images: briefing.cover_image ? [briefing.cover_image] : [],
    },
  };
}

export default async function BriefingPage({ params }: BriefingPageProps) {
  const { slug } = await params;

  // Await briefing first (issue_number needed for adjacent queries),
  // then fan out prev/next in parallel.
  const briefing = await getBriefingBySlug(slug);
  if (!briefing) notFound();

  const [prevBriefing, nextBriefing] = await Promise.all([
    getBriefingByIssue(briefing.issue_number - 1),
    getBriefingByIssue(briefing.issue_number + 1),
  ]);

  // Access check — same TIER_RANK pattern as article page
  const TIER_RANK: Record<string, number> = { free: 0, basic: 1, premium: 2 };
  const isFree = briefing.access_tier === 'free';
  let hasAccess = isFree;

  if (!isFree) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const member = await getMemberById(user.id);
      if (member) {
        hasAccess =
          TIER_RANK[member.tier] >= TIER_RANK[briefing.access_tier];
      }
    }
  }

  const issueLabel = `No. ${String(briefing.issue_number).padStart(3, '0')}`;
  // PaywallGate preview: first 300 chars of section[1] body, or section[0] body if only one section
  const paywallPreview = briefing.sections[1]?.body.slice(0, 300)
    ?? briefing.sections[0]?.body.slice(0, 300)
    ?? '';

  return (
    <div className="mx-auto max-w-wide">
      {/* Back link */}
      <div className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/briefings"
          className="font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
        >
          ← All Briefings
        </Link>
      </div>

      {/* Briefing header */}
      <header className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        {/* Label row */}
        <div className="mb-4 flex items-center gap-3">
          <BookOpen size={20} className="text-bmj-red" aria-hidden="true" />
          <span className="font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
            Weekend Briefing
          </span>
        </div>

        {/* Issue + date */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-bmj-tan">
            {issueLabel}
          </span>
          <span className="font-mono text-xs text-bmj-tan/60">
            {formatDate(briefing.published_at)}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 font-display text-5xl leading-tight text-bmj-white sm:text-6xl lg:text-7xl">
          {briefing.title}
        </h1>

        <div className="accent-border-bottom mb-0 pb-0" />
      </header>

      {/* Cover image */}
      {briefing.cover_image && (
        <div className="relative mt-8 h-64 w-full overflow-hidden sm:h-96 lg:h-[32rem]">
          <Image
            src={briefing.cover_image}
            alt={briefing.title}
            fill
            className="halftone object-cover"
            priority
          />
        </div>
      )}

      {/* Sections */}
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {hasAccess ? (
          // Full access: render all sections
          <div className="space-y-0">
            {briefing.sections.map((section, index) => (
              <div key={index}>
                {index > 0 && <StarDivider className="my-10" />}
                <section>
                  <div className="accent-border-top mb-6 pt-6">
                    <h2 className="font-display text-3xl text-bmj-white sm:text-4xl">
                      {section.title}
                    </h2>
                  </div>
                  <div className="mx-auto max-w-article">
                    <p className="font-body text-lg leading-[1.9] text-bmj-cream/90 whitespace-pre-line">
                      {section.body}
                    </p>
                  </div>
                </section>
              </div>
            ))}
          </div>
        ) : (
          // Gated: show first section only + paywall
          <div>
            {briefing.sections[0] && (
              <section className="mb-10">
                <div className="accent-border-top mb-6 pt-6">
                  <h2 className="font-display text-3xl text-bmj-white sm:text-4xl">
                    {briefing.sections[0].title}
                  </h2>
                </div>
                <div className="mx-auto max-w-article">
                  <p className="font-body text-lg leading-[1.9] text-bmj-cream/90 whitespace-pre-line">
                    {briefing.sections[0].body}
                  </p>
                </div>
              </section>
            )}
            <PaywallGate
              requiredTier={briefing.access_tier}
              previewBody={paywallPreview}
            />
          </div>
        )}
      </div>

      {/* Share */}
      <div className="mx-auto max-w-content px-4 pb-8 sm:px-6 lg:px-8">
        <StarDivider className="mb-6" />
        <ShareButton />
      </div>

      {/* Prev / Next navigation */}
      <nav
        aria-label="Issue navigation"
        className="mx-auto max-w-content border-t border-bmj-tan/20 px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          {prevBriefing ? (
            <Link
              href={`/briefings/${prevBriefing.slug}`}
              className="group flex flex-col no-underline"
            >
              <span className="mb-1 font-mono text-xs text-bmj-tan/60">
                ← Previous Issue
              </span>
              <span className="font-display text-xl text-bmj-cream transition-opacity group-hover:opacity-75">
                {prevBriefing.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {nextBriefing ? (
            <Link
              href={`/briefings/${nextBriefing.slug}`}
              className="group flex flex-col items-start text-left no-underline sm:items-end sm:text-right"
            >
              <span className="mb-1 font-mono text-xs text-bmj-tan/60">
                Next Issue →
              </span>
              <span className="font-display text-xl text-bmj-cream transition-opacity group-hover:opacity-75">
                {nextBriefing.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/briefings/[slug]/page.tsx
git commit -m "feat: add individual briefing page with paywall, sections, and prev/next nav"
```

---

## Chunk 3: Home Page Integration (Task 5)

### Task 5: Update BriefingPreview to use BriefingCard

**Files:**
- Modify: `src/components/home/BriefingPreview.tsx`

The existing `BriefingPreview` already fetches real data (wired in the previous session). The update replaces the inline display with the new `BriefingCard` component for consistency across the site. The section wrapper and heading stay; only the inner card display changes.

- [ ] **Step 1: Open `src/components/home/BriefingPreview.tsx` and read it**

Current structure: section wrapper → StarDivider → heading → inline briefing display. We replace the inline display with `<BriefingCard>`.

- [ ] **Step 2: Replace the inline display with BriefingCard**

Replace the full file content with:

```tsx
// src/components/home/BriefingPreview.tsx
import { StarDivider } from '@/components/ui/StarDivider';
import { BriefingCard } from '@/components/content/BriefingCard';
import type { Briefing } from '@/lib/supabase/types';

interface BriefingPreviewProps {
  briefing: Briefing | null;
}

export function BriefingPreview({ briefing }: BriefingPreviewProps) {
  return (
    <section className="bg-bmj-brown py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Latest Briefing
        </h2>

        {briefing ? (
          <div className="mx-auto max-w-article">
            <BriefingCard briefing={briefing} />
          </div>
        ) : (
          <div className="mx-auto max-w-article border border-bmj-tan/20 p-8 text-center">
            <p className="font-body text-base text-bmj-cream/50">
              The next briefing is in preparation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/home/BriefingPreview.tsx
git commit -m "feat: wire home BriefingPreview to use BriefingCard component"
```

---

## Chunk 4: Verification (Task 6)

### Task 6: Full Build Verification

**Files:**
- No new files — verification only

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Compiled successfully. No errors. Pages for `/briefings` and `/briefings/[slug]` appear in the route output.

- [ ] **Step 3: Visual checklist (manual)**

Start dev server (`npm run dev`) and verify:

| Check | URL | Expected |
|-------|-----|----------|
| Archive page loads | `/briefings` | "WEEKEND BRIEFING" heading, vertical stack of BriefingCards |
| Empty state | `/briefings` (if no seed data) | "No briefings published yet." message |
| Individual briefing | `/briefings/weekend-briefing-001` | Header, sections, StarDividers, PaywallGate if premium |
| Prev/next nav | individual page | Shows links to adjacent issues if they exist |
| Share button | individual page | Clicking "Copy Link" briefly shows "Copied!" |
| Home page preview | `/` | Latest Briefing section shows BriefingCard |
| Mobile 375px | all pages | No overflow, readable at small viewport |

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify briefing system build passes"
```
