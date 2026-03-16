# Articles System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full article browsing and reading experience — archive page with lens/tag filtering, individual article page with paywall gate, and supporting components.

**Architecture:** The archive page is a Server Component that reads `?lens` and `?tag` from `searchParams` and fetches from Supabase on the server; a thin Client Component (`LensFilterTabs`) handles URL-param navigation. The article page is a Server Component with `generateMetadata`; `PaywallGate` is a Client Component that reads the Supabase session cookie and blurs content for non-members. No MDX pipeline is needed — `article.body` is a plain string rendered via a styled `<article>` prose wrapper.

**Tech Stack:** Next.js 14 App Router (Server Components), Supabase SSR client, Tailwind CSS, lucide-react for lock icon, existing `getArticles` / `getArticleBySlug` queries.

---

## Chunk 1: Shared Components

### Task 1: LensBadge component

**Files:**
- Create: `src/components/brand/LensBadge.tsx`

- [ ] **Step 1: Create LensBadge**

```tsx
// src/components/brand/LensBadge.tsx
import type { Lens } from '@/lib/supabase/types';

const LENS_STYLES: Record<Lens, string> = {
  health:     'bg-bmj-red    text-bmj-white',
  philosophy: 'bg-bmj-amber  text-bmj-black',
  politics:   'bg-bmj-brown  text-bmj-white border border-bmj-tan/40',
};

const LENS_LABELS: Record<Lens, string> = {
  health:     'Health',
  philosophy: 'Philosophy',
  politics:   'Politics',
};

interface LensBadgeProps {
  lens: Lens;
  className?: string;
}

export function LensBadge({ lens, className = '' }: LensBadgeProps) {
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 font-label text-xs uppercase tracking-widest ${LENS_STYLES[lens]} ${className}`}
    >
      {LENS_LABELS[lens]}
    </span>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/brand/LensBadge.tsx
git commit -m "feat: add LensBadge component"
```

---

### Task 2: Update ArticleCard to accept date, premium flag, and use LensBadge

**Files:**
- Modify: `src/components/content/ArticleCard.tsx`

The existing `ArticleCard` is missing: `publishedAt` date, `isPremium` indicator, and `LensBadge`. We also need the card to accept a `date` prop for the archive.

- [ ] **Step 1: Rewrite ArticleCard**

Replace the file content with:

```tsx
// src/components/content/ArticleCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { LensBadge } from '@/components/brand/LensBadge';
import type { Lens } from '@/lib/supabase/types';

interface ArticleCardProps {
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  readingTime: number;
  publishedAt: string;
  coverImage?: string | null;
  coverImageAlt?: string;
  isPremium?: boolean;
}

export function ArticleCard({
  title,
  slug,
  lens,
  excerpt,
  readingTime,
  publishedAt,
  coverImage,
  coverImageAlt,
  isPremium = false,
}: ArticleCardProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="flex flex-col border border-bmj-tan/20 bg-bmj-brown transition-all duration-200 hover:-translate-y-1 hover:border-bmj-red/40">
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-bmj-black">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={coverImageAlt || title}
            fill
            className="halftone object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="opacity-10"
            >
              <path
                d="M16 0L19.6 11.6H32L21.8 18.4L25.4 30L16 23.2L6.6 30L10.2 18.4L0 11.6H12.4L16 0Z"
                fill="var(--bmj-cream)"
              />
            </svg>
          </div>
        )}
        {isPremium && (
          <div className="absolute right-2 top-2 rounded-sm bg-bmj-black/80 p-1">
            <Lock size={12} className="text-bmj-amber" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <LensBadge lens={lens} className="mb-3 self-start" />

        <h3 className="mb-3 line-clamp-2 font-display text-xl leading-tight text-bmj-white">
          <Link
            href={`/articles/${slug}`}
            className="no-underline transition-opacity hover:opacity-75"
          >
            {title}
          </Link>
        </h3>

        <p className="line-clamp-2 flex-1 font-body text-sm leading-relaxed text-bmj-cream/70">
          {excerpt}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-bmj-tan/20 pt-4">
          <span className="font-mono text-xs text-bmj-tan">
            {Math.max(1, readingTime)} min read
          </span>
          <span className="font-mono text-xs text-bmj-tan/60">{formattedDate}</span>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Update FeaturedArticles to pass publishedAt**

In `src/components/home/FeaturedArticles.tsx`, find the `ArticleCard` usage and add `publishedAt={article.published_at}`. Read the file first to see current props.

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/content/ArticleCard.tsx src/components/home/FeaturedArticles.tsx
git commit -m "feat: update ArticleCard with date, premium lock, LensBadge"
```

---

## Chunk 2: Archive Page

### Task 3: LensFilterTabs (Client Component)

The archive page is a Server Component that renders filter tabs. The tabs must change the URL (`?lens=health`) — this requires a Client Component wrapper for the navigation logic.

**Files:**
- Create: `src/components/content/LensFilterTabs.tsx`

- [ ] **Step 1: Create LensFilterTabs**

```tsx
// src/components/content/LensFilterTabs.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Lens } from '@/lib/supabase/types';

type Tab = { label: string; value: Lens | 'all' };

const TABS: Tab[] = [
  { label: 'All',        value: 'all' },
  { label: 'Health',     value: 'health' },
  { label: 'Philosophy', value: 'philosophy' },
  { label: 'Politics',   value: 'politics' },
];

interface LensFilterTabsProps {
  activeLens: Lens | 'all';
}

export function LensFilterTabs({ activeLens }: LensFilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(value: Lens | 'all') {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('lens');
    } else {
      params.set('lens', value);
    }
    // Reset tag when changing lens
    params.delete('tag');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-6 border-b border-bmj-tan/20 pb-0" role="tablist">
      {TABS.map((tab) => {
        const isActive = tab.value === activeLens;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.value)}
            className={[
              'pb-3 font-label text-sm uppercase tracking-widest transition-colors',
              isActive
                ? 'border-b-2 border-bmj-red text-bmj-white'
                : 'text-bmj-tan hover:text-bmj-cream',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/content/LensFilterTabs.tsx
git commit -m "feat: add LensFilterTabs client component with URL param navigation"
```

---

### Task 4: TagFilterRow (Client Component)

**Files:**
- Create: `src/components/content/TagFilterRow.tsx`

- [ ] **Step 1: Create TagFilterRow**

```tsx
// src/components/content/TagFilterRow.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface TagFilterRowProps {
  tags: string[];
  activeTag: string | null;
}

export function TagFilterRow({ tags, activeTag }: TagFilterRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (tags.length === 0) return null;

  function handleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag === activeTag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {tags.map((tag) => {
        const isActive = tag === activeTag;
        return (
          <button
            key={tag}
            onClick={() => handleTag(tag)}
            className={[
              'shrink-0 rounded-sm px-3 py-1 font-label text-xs uppercase tracking-wide transition-colors',
              isActive
                ? 'bg-bmj-red text-bmj-white'
                : 'bg-bmj-brown text-bmj-cream hover:bg-bmj-tan/20',
            ].join(' ')}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/content/TagFilterRow.tsx
git commit -m "feat: add TagFilterRow client component"
```

---

### Task 5: Add getArticleTags query helper

We need to derive a de-duplicated list of tags for the tag filter from the articles already fetched — no extra query needed. We'll add a utility function in `src/lib/utils.ts`.

**Files:**
- Modify: `src/lib/utils.ts`

- [ ] **Step 1: Read the existing utils file**

Read `src/lib/utils.ts` first to see what's there.

- [ ] **Step 2: Add extractTags helper**

Append to `src/lib/utils.ts`:

```ts
import type { Article } from '@/lib/supabase/types';

/** Returns a sorted, de-duplicated list of all tags across the given articles. */
export function extractTags(articles: Article[]): string[] {
  const set = new Set<string>();
  for (const a of articles) {
    for (const t of a.tags) set.add(t);
  }
  return Array.from(set).sort();
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add extractTags utility"
```

---

### Task 6: Article Archive Page

**Files:**
- Create: `src/app/(public)/articles/page.tsx`

This is a Server Component. It reads `searchParams.lens` and `searchParams.tag`, fetches from Supabase, and renders the grid + filter UI.

- [ ] **Step 1: Create the archive page**

```tsx
// src/app/(public)/articles/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getArticles } from '@/lib/supabase/queries';
import { extractTags } from '@/lib/utils';
import { StarDivider } from '@/components/ui/StarDivider';
import { ArticleCard } from '@/components/content/ArticleCard';
import { LensFilterTabs } from '@/components/content/LensFilterTabs';
import { TagFilterRow } from '@/components/content/TagFilterRow';
import type { Lens } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Long-form articles on health, philosophy, and politics for Black men.',
};

const VALID_LENSES = new Set<string>(['health', 'philosophy', 'politics']);
const PAGE_SIZE = 9;

interface ArticlesPageProps {
  searchParams: Promise<{ lens?: string; tag?: string; page?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { lens: rawLens, tag, page: rawPage } = await searchParams;

  const activeLens = VALID_LENSES.has(rawLens ?? '')
    ? (rawLens as Lens)
    : undefined;
  const activeTag = tag ?? null;
  const page = Math.max(1, parseInt(rawPage ?? '1', 10));

  // Fetch one extra to know if there's a next page
  const articles = await getArticles({
    lens: activeLens,
    tag: activeTag ?? undefined,
    limit: PAGE_SIZE * page + 1,
    offset: 0,
  });

  const hasMore = articles.length > PAGE_SIZE * page;
  const visible = articles.slice(0, PAGE_SIZE * page);

  // Extract tags from the full unfiltered set for the tag row
  const allArticles = activeLens
    ? await getArticles({ lens: activeLens, limit: 200 })
    : await getArticles({ limit: 200 });
  const tags = extractTags(allArticles);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      {/* Page header */}
      <h1 className="font-display text-5xl text-bmj-white">Articles</h1>
      <StarDivider className="mb-6" />

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <Suspense>
          <LensFilterTabs activeLens={activeLens ?? 'all'} />
        </Suspense>
        <Suspense>
          <TagFilterRow tags={tags} activeTag={activeTag} />
        </Suspense>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-label text-bmj-tan">No articles found.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan/60">
            Try selecting a different lens or clearing the tag filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                slug={article.slug}
                lens={article.lens}
                excerpt={article.excerpt}
                readingTime={Math.ceil(article.body.split(' ').length / 200)}
                publishedAt={article.published_at}
                coverImage={article.cover_image}
                isPremium={article.access_tier !== 'free'}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <a
                href={`/articles?${new URLSearchParams({
                  ...(activeLens ? { lens: activeLens } : {}),
                  ...(activeTag ? { tag: activeTag } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="inline-block border border-bmj-tan/40 px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
              >
                Load More
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/articles/page.tsx
git commit -m "feat: add articles archive page with lens and tag filters"
```

---

## Chunk 3: Individual Article Page

### Task 7: PaywallGate component

**Files:**
- Create: `src/components/content/PaywallGate.tsx`

This is a **Server Component** — it reads the Supabase session server-side to determine whether to show the gate. No `'use client'` needed.

- [ ] **Step 1: Create PaywallGate**

```tsx
// src/components/content/PaywallGate.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import type { AccessTier } from '@/lib/supabase/types';

const TIER_RANK: Record<AccessTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

interface PaywallGateProps {
  requiredTier: AccessTier;
  previewBody: string; // First ~300 chars of article body
}

export async function PaywallGate({ requiredTier, previewBody }: PaywallGateProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userTierRank = -1;
  if (user) {
    const member = await getMemberById(user.id);
    if (member) userTierRank = TIER_RANK[member.tier];
  }

  const requiredRank = TIER_RANK[requiredTier];
  const hasAccess = userTierRank >= requiredRank;

  if (hasAccess) return null; // Caller renders full article

  const tierLabel = requiredTier === 'basic' ? 'Basic' : 'Premium';

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div
        className="pointer-events-none select-none font-body text-lg leading-relaxed text-bmj-cream/80"
        aria-hidden="true"
      >
        {previewBody}
      </div>

      {/* Fade overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-bmj-black/60 to-bmj-black"
        aria-hidden="true"
      />

      {/* CTA card */}
      <div className="relative mt-0 border border-bmj-red/40 bg-bmj-brown p-8 text-center">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Members Only
        </p>
        <h3 className="mb-4 font-display text-2xl text-bmj-white">
          This article is for {tierLabel} members
        </h3>
        <p className="mb-6 font-body text-sm text-bmj-cream/70">
          Upgrade your membership to read the full article and access all{' '}
          {tierLabel.toLowerCase()} content.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/signup?tier=${requiredTier}`}
            className="inline-block bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-85"
          >
            Subscribe — {tierLabel}
          </Link>
          <Link
            href="/login"
            className="font-body text-sm text-bmj-tan underline hover:text-bmj-cream"
          >
            Already a member? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/content/PaywallGate.tsx
git commit -m "feat: add PaywallGate server component with tier-based access check"
```

---

### Task 8: ArticleBody prose wrapper

**Files:**
- Create: `src/components/content/ArticleBody.tsx`

This component renders the article's raw string body with proper editorial typography. Because `article.body` is plain text (possibly with newline-separated paragraphs), we split on double newlines and render `<p>` tags.

> **Design decision:** The article body uses a styled prose wrapper defined entirely in Tailwind. We do NOT install `@tailwindcss/typography` — the brand aesthetic is too specific for the plugin's defaults.

- [ ] **Step 1: Create ArticleBody**

```tsx
// src/components/content/ArticleBody.tsx
interface ArticleBodyProps {
  body: string;
}

export function ArticleBody({ body }: ArticleBodyProps) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-article space-y-6">
      {paragraphs.map((para, i) => {
        // Render headings: lines starting with ## or #
        if (para.startsWith('## ')) {
          return (
            <h2
              key={i}
              className="mt-10 font-display text-2xl text-bmj-white"
            >
              {para.slice(3)}
            </h2>
          );
        }
        if (para.startsWith('# ')) {
          return (
            <h2
              key={i}
              className="mt-12 font-display text-3xl text-bmj-white"
            >
              {para.slice(2)}
            </h2>
          );
        }
        // Blockquote: lines starting with >
        if (para.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-bmj-red bg-bmj-amber/10 px-6 py-4 font-body text-lg italic text-bmj-amber"
            >
              {para.slice(2)}
            </blockquote>
          );
        }
        return (
          <p
            key={i}
            className="font-body text-lg leading-[1.8] text-bmj-cream/90"
          >
            {para}
          </p>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/content/ArticleBody.tsx
git commit -m "feat: add ArticleBody prose renderer"
```

---

### Task 9: Individual Article Page

**Files:**
- Create: `src/app/(public)/articles/[slug]/page.tsx`

- [ ] **Step 1: Create the article page**

```tsx
// src/app/(public)/articles/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleBySlug, getArticles } from '@/lib/supabase/queries';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { ArticleCard } from '@/components/content/ArticleCard';
import { ArticleBody } from '@/components/content/ArticleBody';
import { PaywallGate } from '@/components/content/PaywallGate';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: ArticlePageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.cover_image ? [{ url: article.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.cover_image ? [article.cover_image] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const isFree = article.access_tier === 'free';
  const readingTime = Math.ceil(article.body.split(' ').length / 200);

  const related = await getArticles({ lens: article.lens, limit: 4 });
  const relatedFiltered = related
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  const formattedDate = new Date(article.published_at).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  const previewBody = article.body.slice(0, 300);

  // Determine if PaywallGate should run (non-free articles)
  // PaywallGate returns null if user has access — in that case render full body
  const gate = isFree ? null : (
    <PaywallGate requiredTier={article.access_tier} previewBody={previewBody} />
  );

  return (
    <div className="mx-auto max-w-wide">
      {/* Back link */}
      <div className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/articles"
          className="font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
        >
          ← Back to Articles
        </Link>
      </div>

      {/* Article header */}
      <header className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <LensBadge lens={article.lens} className="mb-4" />

        <h1 className="mb-4 font-display text-4xl leading-tight text-bmj-white sm:text-5xl lg:text-6xl">
          {article.title}
        </h1>

        <p className="mb-6 font-body text-xl italic leading-relaxed text-bmj-tan">
          {article.excerpt}
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="font-label text-xs uppercase tracking-widest text-bmj-cream/80">
            By {article.author}
          </span>
          <span className="font-mono text-xs text-bmj-tan/60">
            {formattedDate} · {Math.max(1, readingTime)} min read
          </span>
        </div>

        <div className="accent-border-bottom mb-0 pb-0" />
      </header>

      {/* Cover image */}
      {article.cover_image && (
        <div className="relative mt-8 h-64 w-full overflow-hidden sm:h-96 lg:h-[32rem]">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="halftone object-cover"
            priority
          />
        </div>
      )}

      {/* Article body */}
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {isFree ? (
          <ArticleBody body={article.body} />
        ) : (
          <>
            {/* PaywallGate returns null when user has access — render full body too */}
            {gate}
            {/* Full body shown only if gate is null (user has access).
                Since gate is a Server Component that returns null for authorized users,
                we render it and also render ArticleBody; gate's non-null render
                covers/replaces the body visually for unauthorized users.
                Simplest approach: always render gate, which either shows CTA or nothing,
                then conditionally show full body only client-side via a wrapper.

                SIMPLER: render gate + body below it. Gate=null means user has access.
                But we can't know gate's value here (it's async JSX).

                Actual pattern: ArticleBody always renders. PaywallGate overlays it
                when user lacks access. Use CSS positioning. */}
            <ArticleBody body={article.body} />
          </>
        )}
      </div>

      <StarDivider className="mx-auto max-w-content px-4 sm:px-6 lg:px-8" />

      {/* Related articles */}
      {relatedFiltered.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-display text-2xl text-bmj-white">
            More from {article.lens.charAt(0).toUpperCase() + article.lens.slice(1)}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedFiltered.map((a) => (
              <ArticleCard
                key={a.id}
                title={a.title}
                slug={a.slug}
                lens={a.lens}
                excerpt={a.excerpt}
                readingTime={Math.ceil(a.body.split(' ').length / 200)}
                publishedAt={a.published_at}
                coverImage={a.cover_image}
                isPremium={a.access_tier !== 'free'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

> **Note on paywall rendering:** For non-free articles, both `PaywallGate` and `ArticleBody` render. `PaywallGate` returns `null` when the user has access (so only `ArticleBody` shows). When the user lacks access, `PaywallGate` renders the CTA overlay that visually covers the body (the body renders below but is obscured by the gate's `bg-bmj-black` bottom). This avoids complex async coordination while keeping the Server Component pattern clean.

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/articles/[slug]/page.tsx
git commit -m "feat: add individual article page with paywall gate and related articles"
```

---

## Chunk 4: Build Verification

### Task 10: Fix PaywallGate render ordering

The comment in Task 9 exposes a design issue: `PaywallGate` and `ArticleBody` both render for non-free articles. Fix this by restructuring so the gate wraps the body.

**Files:**
- Modify: `src/components/content/PaywallGate.tsx`
- Modify: `src/app/(public)/articles/[slug]/page.tsx`

- [ ] **Step 1: Refactor PaywallGate to accept children**

Update `PaywallGate` to accept `children` (the full body) and render them or the CTA:

```tsx
// src/components/content/PaywallGate.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import type { AccessTier } from '@/lib/supabase/types';

const TIER_RANK: Record<AccessTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

interface PaywallGateProps {
  requiredTier: AccessTier;
  previewBody: string;
  children: React.ReactNode; // Full article body rendered when user has access
}

export async function PaywallGate({ requiredTier, previewBody, children }: PaywallGateProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userTierRank = -1;
  if (user) {
    const member = await getMemberById(user.id);
    if (member) userTierRank = TIER_RANK[member.tier];
  }

  const hasAccess = userTierRank >= TIER_RANK[requiredTier];

  if (hasAccess) return <>{children}</>;

  const tierLabel = requiredTier === 'basic' ? 'Basic' : 'Premium';

  return (
    <div>
      {/* Preview text */}
      <div className="relative">
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          {previewBody}
          <span aria-hidden="true">…</span>
        </p>
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent to-bmj-black"
          aria-hidden="true"
        />
      </div>

      {/* CTA */}
      <div className="mt-8 border border-bmj-red/40 bg-bmj-brown p-8 text-center">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Members Only
        </p>
        <h3 className="mb-4 font-display text-2xl text-bmj-white">
          This article is for {tierLabel} members
        </h3>
        <p className="mb-6 font-body text-sm text-bmj-cream/70">
          Upgrade to read the full article and all {tierLabel.toLowerCase()} content.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/signup?tier=${requiredTier}`}
            className="inline-block bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-85"
          >
            Subscribe — {tierLabel}
          </Link>
          <Link
            href="/login"
            className="font-body text-sm text-bmj-tan underline hover:text-bmj-cream"
          >
            Already a member? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update article page to pass children to PaywallGate**

In `src/app/(public)/articles/[slug]/page.tsx`, replace the non-free body render section with:

```tsx
{isFree ? (
  <ArticleBody body={article.body} />
) : (
  <PaywallGate requiredTier={article.access_tier} previewBody={previewBody}>
    <ArticleBody body={article.body} />
  </PaywallGate>
)}
```

Remove the old `gate` variable and the confusing comment block.

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: Compiled successfully, no type errors

- [ ] **Step 5: Final commit**

```bash
git add src/components/content/PaywallGate.tsx src/app/(public)/articles/[slug]/page.tsx
git commit -m "feat: refactor PaywallGate to accept children for clean access control"
```

---

## Quick Reference: Key Files

| File | Role |
|------|------|
| `src/components/brand/LensBadge.tsx` | Pill badge for lens category |
| `src/components/content/ArticleCard.tsx` | Updated card with date, lock icon, LensBadge |
| `src/components/content/LensFilterTabs.tsx` | Client: tab bar that updates `?lens=` URL param |
| `src/components/content/TagFilterRow.tsx` | Client: scrollable tag pills that update `?tag=` URL param |
| `src/components/content/ArticleBody.tsx` | Prose renderer for article.body string |
| `src/components/content/PaywallGate.tsx` | Server: checks auth, renders children or CTA |
| `src/app/(public)/articles/page.tsx` | Archive page — Server Component |
| `src/app/(public)/articles/[slug]/page.tsx` | Article page — Server Component with generateMetadata |
| `src/lib/utils.ts` | Add `extractTags()` helper |

## Testing Checklist

- [ ] Archive page loads at `/articles` with all articles
- [ ] `?lens=health` filters to health articles only
- [ ] `?tag=discipline` filters to tagged articles
- [ ] Changing lens clears the tag param
- [ ] Empty state shows when no articles match
- [ ] Load More increments via `?page=2`
- [ ] Premium articles show lock icon on card
- [ ] Article page at `/articles/[slug]` renders full article for free articles
- [ ] Premium article shows paywall gate when not logged in
- [ ] Related articles section shows 3 same-lens articles
- [ ] `npm run build` passes with no errors
- [ ] Mobile (375px): single column grid, tabs scroll horizontally if needed
- [ ] Desktop (1440px): 3-column grid, full header layout
