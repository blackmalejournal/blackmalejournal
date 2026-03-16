# Dispatches (Blog) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a "Dispatches" blog section — shorter posts, updates, and commentary — with a chronological feed page and minimal detail pages.

**Architecture:** New `dispatches` table in Supabase (separate from `articles`) with a simpler schema: no `tags[]`, no `featured`, no `access_tier` (all dispatches are free). New `Dispatch` type, two query functions (`getDispatches`, `getDispatchBySlug`), a `DispatchCard` component for the feed, and two route pages (`/blog` list, `/blog/[slug]` detail). The detail page reuses `ArticleBody` for rendering and `ShareButton` for the share link. Seed SQL provides 6 sample dispatches.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, lucide-react

---

## File Structure

| File | Responsibility |
|------|---------------|
| `supabase/migrations/create-dispatches.sql` | Schema migration for `dispatches` table |
| `supabase/seed-dispatches.sql` | 6 sample dispatches for development |
| `src/lib/supabase/types.ts` | Add `Dispatch` type + `dispatches` table to `Database` generic |
| `src/lib/supabase/queries.ts` | Add `getDispatches()` and `getDispatchBySlug()` |
| `src/components/content/DispatchCard.tsx` | Feed card: title, date, lens badge, excerpt, optional cover image |
| `src/app/(public)/blog/page.tsx` | "Dispatches" feed page with pagination |
| `src/app/(public)/blog/[slug]/page.tsx` | Individual dispatch detail page |

---

## Chunk 1: Data Layer + Components + Pages

### Task 1: Database Schema + Seed Data

**Files:**
- Create: `supabase/migrations/create-dispatches.sql`
- Create: `supabase/seed-dispatches.sql`

- [ ] **Step 1: Create the dispatches table migration**

```sql
-- supabase/migrations/create-dispatches.sql
create table if not exists public.dispatches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  lens text not null check (lens in ('health', 'philosophy', 'politics')),
  excerpt text not null,
  body text not null,
  author text not null default 'The Chairman',
  cover_image text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Index for listing (newest-first)
create index if not exists idx_dispatches_published_at
  on public.dispatches (published_at desc);

-- Enable RLS (read-only public access)
alter table public.dispatches enable row level security;
create policy "Dispatches are publicly readable"
  on public.dispatches for select
  using (true);
```

- [ ] **Step 2: Create seed data with 6 dispatches**

```sql
-- supabase/seed-dispatches.sql
insert into public.dispatches (title, slug, lens, excerpt, body, author, cover_image, published_at) values
(
  'On the Necessity of Silence',
  'on-the-necessity-of-silence',
  'philosophy',
  'Not every thought needs an audience. Some convictions must be carried in silence before they are ready to be spoken.',
  'There is a discipline in restraint that this generation has lost. Every impulse becomes a post. Every reaction becomes a thread. Every wound becomes content.

## The Problem with Performative Thought

When you externalize every idea the moment it forms, you never develop the internal pressure that forges conviction. You get applause for half-formed thoughts and mistake engagement for understanding.

The men who shaped history understood this. They sat with ideas for years before acting. They let silence do the work that noise cannot.

## What Silence Builds

Silence builds discernment. It teaches you to separate the urgent from the important. It creates space for the kind of thinking that cannot happen in public.

Practice it. Sit with your thoughts for a week before you share them. Watch how they change. Watch how the weak ones die and the strong ones sharpen.',
  'The Chairman',
  null,
  '2026-03-14T08:00:00Z'
),
(
  'Dispatch: Weekend Reading List',
  'weekend-reading-list-march-2026',
  'philosophy',
  'Five books every man should read this spring. No self-help. No productivity hacks. Just substance.',
  'Spring is the season of renewal, and your reading list should reflect that. Here are five books that will challenge your assumptions and sharpen your mind.

The Autobiography of Malcolm X — If you have not read this, stop everything and start now.

Meditations by Marcus Aurelius — The original manual for composure under pressure.

The Wretched of the Earth by Frantz Fanon — Understanding the psychology of oppression.

Man''s Search for Meaning by Viktor Frankl — Suffering has purpose, but only if you choose it.

The Art of War by Sun Tzu — Strategy is not just for the battlefield.

Read one per month. Take notes. Discuss with your circle. Knowledge without application is entertainment.',
  'The Chairman',
  null,
  '2026-03-10T08:00:00Z'
),
(
  'The Gym Is Not Optional',
  'the-gym-is-not-optional',
  'health',
  'Your body is the first thing the world sees. It is also the vehicle for everything you want to accomplish. Treat it accordingly.',
  'I am tired of the conversation about whether men should prioritize fitness. This is not a debate. Your physical condition is the foundation upon which everything else is built.

## The Non-Negotiables

Train at least four days per week. This is not negotiable. The form does not matter — weights, calisthenics, martial arts, swimming. What matters is consistency and intensity.

Eat clean six days out of seven. You know what clean means. Stop pretending you do not.

Sleep seven to eight hours. Your phone does not need you at midnight.

## Why This Matters

A strong body builds a strong mind. The discipline required to maintain physical fitness transfers to every other area of your life. When you can push through the last set, you can push through the hard conversation, the difficult decision, the long night of work.

This is not vanity. This is infrastructure.',
  'The Chairman',
  null,
  '2026-03-07T08:00:00Z'
),
(
  'Local Politics Matter More Than National',
  'local-politics-matter-more',
  'politics',
  'You are not going to change Washington from your living room. But you can change your city council district by showing up.',
  'Every election cycle, the same pattern repeats. Black men get energized about the presidential race, argue on social media for six months, vote (or do not), and then disappear from political engagement for four years.

Meanwhile, your city council passes zoning laws that determine where your children go to school. Your county board allocates police budgets. Your state legislature draws the maps that decide whether your vote counts.

## What You Can Actually Do

Attend one city council meeting this month. Just one. Sit in the back and listen. Learn who the players are. Understand how decisions get made.

Then identify one issue that affects your neighborhood directly. Housing, policing, schools, infrastructure. Pick one and follow it.

This is how power is built — from the ground up, not the top down.',
  'The Chairman',
  null,
  '2026-03-03T08:00:00Z'
),
(
  'A Note on Brotherhood',
  'a-note-on-brotherhood',
  'philosophy',
  'The men around you are either building you up or holding you back. Choose your circle with the same care you choose your investments.',
  'I received a message last week from a reader who said he had no close male friends. He is thirty-four years old, successful by most measures, and deeply isolated.

This is more common than anyone wants to admit. The epidemic of male loneliness is not an abstraction — it is your neighbor, your coworker, your brother.

## The Solution Is Uncomfortable

Building brotherhood requires vulnerability, and vulnerability requires courage. You must be willing to say: I need people. I cannot do this alone.

Find one man you respect and invite him to train with you. Or read with you. Or build something with you. Shared purpose is the foundation of every lasting bond between men.

Do not wait for community to find you. Build it.',
  'The Chairman',
  null,
  '2026-02-25T08:00:00Z'
),
(
  'Site Update: What Is Coming',
  'site-update-what-is-coming',
  'politics',
  'The Black Male Journal is growing. Here is what we are building and why.',
  'This platform started as an idea — a place where Black men could find substantive content that respects their intelligence and challenges their comfort.

We are building several new features:

The Academy will offer structured courses on martial arts, mental health, financial literacy, and leadership. These are not motivational videos — they are curricula.

The Weekend Briefing will expand to include audio editions for those who prefer to listen on their commute.

A member portal is coming that will give premium subscribers access to exclusive content, downloads, and a private discussion space.

None of this happens without your support. If this work matters to you, share it with one person today.',
  'The Chairman',
  null,
  '2026-02-18T08:00:00Z'
);
```

- [ ] **Step 3: Run the migration against your local Supabase instance**

Run the SQL in your Supabase dashboard (SQL Editor) or via CLI:
```bash
# If using Supabase CLI:
supabase db push
# Or run the SQL files manually in the Supabase SQL Editor
```

- [ ] **Step 4: Run the seed data**

Run `supabase/seed-dispatches.sql` in the Supabase SQL Editor.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/create-dispatches.sql supabase/seed-dispatches.sql
git commit -m "feat: add dispatches table schema and seed data"
```

---

### Task 2: TypeScript Types + Query Functions

**Files:**
- Modify: `src/lib/supabase/types.ts`
- Modify: `src/lib/supabase/queries.ts`

- [ ] **Step 1: Add `Dispatch` type to types.ts**

Add after the `Course` type (around line 68):

```typescript
export type Dispatch = {
  id: string;
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  body: string;
  author: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
};
```

- [ ] **Step 2: Add `dispatches` table to the `Database` generic**

Add inside `Tables` (after the `courses` entry, around line 117):

```typescript
      dispatches: {
        Row: Dispatch;
        Insert: Omit<Dispatch, 'id' | 'created_at'>;
        Update: Partial<Omit<Dispatch, 'id' | 'created_at'>>;
        Relationships: [];
      };
```

- [ ] **Step 3: Add query functions to queries.ts**

Add the `Dispatch` import to the existing import line at the top:

```typescript
import type {
  Article,
  Briefing,
  Course,
  Dispatch,
  Member,
  MemberTier,
  Lens,
  AccessTier,
} from '@/lib/supabase/types';
```

Then add at the end of the file (after the Contact section):

```typescript
// ── Dispatches ──────────────────────────────────────────────────────────────

export async function getDispatches(
  options: { limit?: number; offset?: number } = {},
): Promise<Dispatch[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getDispatches]', error.message);
    return [];
  }
  return (data ?? []) as Dispatch[];
}

export async function getDispatchBySlug(
  slug: string,
): Promise<Dispatch | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Dispatch;
}
```

- [ ] **Step 4: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/types.ts src/lib/supabase/queries.ts
git commit -m "feat: add Dispatch type and query functions"
```

---

### Task 3: DispatchCard Component

**Files:**
- Create: `src/components/content/DispatchCard.tsx`
- Reference: `src/components/content/BriefingCard.tsx` (layout pattern — vertical stack, left-border accent)
- Reference: `src/components/brand/LensBadge.tsx`

The DispatchCard is simpler than ArticleCard: no cover image in the card (optional images only show on detail page), no reading time. It's a compact feed card — title, date, lens badge, excerpt. Uses a left-border accent with `border-bmj-red`, consistent with BriefingCard's visual language.

- [ ] **Step 1: Create DispatchCard**

```typescript
// src/components/content/DispatchCard.tsx

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { LensBadge } from '@/components/brand/LensBadge';
import type { Lens } from '@/lib/supabase/types';

interface DispatchCardProps {
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  publishedAt: string;
}

export function DispatchCard({
  title,
  slug,
  lens,
  excerpt,
  publishedAt,
}: DispatchCardProps) {
  return (
    <article className="group border-l-4 border-bmj-red bg-bmj-brown transition-colors duration-200 hover:border-bmj-cream">
      <Link
        href={`/blog/${slug}`}
        className="block p-6 no-underline sm:p-8"
        aria-label={title}
      >
        <div className="mb-3 flex items-center gap-4">
          <LensBadge lens={lens} />
          <span className="font-mono text-xs text-bmj-tan/60">
            {formatDate(publishedAt)}
          </span>
        </div>

        <h3 className="mb-3 font-display text-2xl leading-tight text-bmj-white transition-opacity group-hover:opacity-80 sm:text-3xl">
          {title}
        </h3>

        <p className="line-clamp-2 font-body text-sm leading-relaxed text-bmj-cream/70">
          {excerpt}
        </p>
      </Link>
    </article>
  );
}
```

Design notes:
- Left-border accent (`border-l-4 border-bmj-red`) — same as BriefingCard, keeping the "dispatch" visual language consistent.
- Hover: border shifts to cream, title fades slightly — same pattern as BriefingCard.
- `LensBadge` reused from the articles system — compact, color-coded pill.
- Title in `text-2xl`/`text-3xl` (smaller than BriefingCard's `text-3xl`/`text-4xl`) to reflect that dispatches are lighter-weight.
- No cover image in the card — keeps the feed compact and scannable. Images show on detail page only.
- No reading time — dispatches are short by nature.

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/content/DispatchCard.tsx
git commit -m "feat: add DispatchCard component for blog feed"
```

---

### Task 4: Dispatches Feed Page

**Files:**
- Create: `src/app/(public)/blog/page.tsx`
- Reference: `src/app/(public)/briefings/page.tsx` (pagination pattern)

The feed page follows the exact pagination pattern from the Briefings page: fetch `PAGE_SIZE * page + 1` to detect if more exist, show a "Load More" / "Older Posts" button.

- [ ] **Step 1: Create the dispatches feed page**

```typescript
// src/app/(public)/blog/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { getDispatches } from '@/lib/supabase/queries';
import { StarDivider } from '@/components/ui/StarDivider';
import { DispatchCard } from '@/components/content/DispatchCard';

export const metadata: Metadata = {
  title: 'Dispatches',
  description:
    'Short dispatches, updates, and commentary from The Chairman.',
};

const PAGE_SIZE = 10;

interface DispatchesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DispatchesPage({
  searchParams,
}: DispatchesPageProps) {
  const { page: rawPage } = await searchParams;
  const parsedPage = parseInt(rawPage ?? '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  const dispatches = await getDispatches({
    limit: PAGE_SIZE * page + 1,
    offset: 0,
  });

  const hasMore = dispatches.length > PAGE_SIZE * page;
  const visible = dispatches.slice(0, PAGE_SIZE * page);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-bmj-white">Dispatches</h1>
      <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
        Short posts, updates, and commentary from The Chairman.
      </p>
      <StarDivider className="mb-12" />

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-label text-bmj-tan">No dispatches yet.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan/60">
            The first dispatch is being drafted.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((dispatch) => (
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

          {hasMore && (
            <div className="mt-12 text-center">
              <Link
                href={`/blog?page=${page + 1}`}
                className="inline-block border border-bmj-tan/40 px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
              >
                Older Posts &rarr;
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

Design notes:
- Title "Dispatches" rather than "Blog" — on-brand.
- `space-y-4` vertical stack (not grid) — dispatches are a chronological feed, not a gallery.
- Pagination button says "Older Posts" with right arrow — directional, fits the chronological context.
- Exact same pagination logic as Briefings: fetch `PAGE_SIZE * page + 1`, slice, check `hasMore`.

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "src/app/(public)/blog/page.tsx"
git commit -m "feat: add Dispatches feed page with pagination"
```

---

### Task 5: Dispatch Detail Page

**Files:**
- Create: `src/app/(public)/blog/[slug]/page.tsx`
- Reference: `src/app/(public)/briefings/[slug]/page.tsx` (simpler detail pattern)
- Reuse: `src/components/content/ArticleBody.tsx`, `src/components/ui/ShareButton.tsx`, `src/components/brand/LensBadge.tsx`

The detail page is intentionally minimal: title, date, lens badge, body, share button. No sidebar, no related posts, no paywall (all dispatches are free).

- [ ] **Step 1: Create the dispatch detail page**

```typescript
// src/app/(public)/blog/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getDispatchBySlug } from '@/lib/supabase/queries';
import { formatDate } from '@/lib/utils';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { ArticleBody } from '@/components/content/ArticleBody';
import { ShareButton } from '@/components/ui/ShareButton';

interface DispatchPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: DispatchPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const dispatch = await getDispatchBySlug(slug);
  if (!dispatch) return { title: 'Dispatch Not Found' };

  return {
    title: dispatch.title,
    description: dispatch.excerpt,
    openGraph: {
      title: dispatch.title,
      description: dispatch.excerpt,
      images: dispatch.cover_image ? [{ url: dispatch.cover_image }] : [],
    },
    twitter: {
      card: 'summary',
      title: dispatch.title,
      description: dispatch.excerpt,
    },
  };
}

export default async function DispatchPage({ params }: DispatchPageProps) {
  const { slug } = await params;
  const dispatch = await getDispatchBySlug(slug);
  if (!dispatch) notFound();

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/blog"
        className="font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; All Dispatches
      </Link>

      {/* Header */}
      <header className="mt-8">
        <div className="mb-4 flex items-center gap-4">
          <LensBadge lens={dispatch.lens} />
          <span className="font-mono text-xs text-bmj-tan/60">
            {formatDate(dispatch.published_at)}
          </span>
        </div>

        <h1 className="mb-4 font-display text-4xl leading-tight text-bmj-white sm:text-5xl">
          {dispatch.title}
        </h1>

        <p className="mb-6 font-body text-lg italic leading-relaxed text-bmj-tan">
          {dispatch.excerpt}
        </p>

        <div className="accent-border-bottom mb-0 pb-0" />
      </header>

      {/* Cover image (optional) */}
      {dispatch.cover_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-bmj-black">
          <Image
            src={dispatch.cover_image}
            alt={dispatch.title}
            fill
            className="halftone object-cover"
            priority
          />
        </div>
      )}

      {/* Body */}
      <div className="py-12">
        <ArticleBody body={dispatch.body} />
      </div>

      {/* Share */}
      <StarDivider className="mb-6" />
      <ShareButton />
    </div>
  );
}
```

Design notes:
- Uses `max-w-content` (1200px) as container — `ArticleBody` internally constrains to `max-w-article` (720px).
- Reuses `ArticleBody` for prose rendering — dispatches use the same markdown-like text format as articles.
- Reuses `ShareButton` for the copy-link at the bottom.
- Twitter card type is `summary` (not `summary_large_image`) since dispatches may not have cover images.
- No paywall check — all dispatches are free per CLAUDE.md access tiers.
- No related posts — keeps it clean as requested.
- Optional cover image with standard `halftone` treatment.

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run full build**

Run: `npm run build`
Expected: Build succeeds, `/blog` and `/blog/[slug]` routes compile.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/blog/[slug]/page.tsx"
git commit -m "feat: add dispatch detail page with ArticleBody and ShareButton"
```

---

### Task 6: Build Verification

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Clean build, `/blog` and `/blog/[slug]` listed in routes.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Visual verification**

Start dev server: `npm run dev`

Check:
- `/blog` loads with "DISPATCHES" headline, subtitle, star divider
- 6 seed dispatches shown in chronological order (newest first)
- Each card has: left red border, lens badge, date, title, excerpt
- Card hover: border shifts to cream, title fades
- Clicking a card navigates to `/blog/[slug]`
- Detail page: back link, lens badge + date, title, excerpt in italic, body text
- Body renders headings (##, ###) and blockquotes correctly via ArticleBody
- ShareButton at bottom copies URL
- No cover images on seed data — verify the page still looks clean without them
- Mobile: cards stack properly, text is readable at 375px
