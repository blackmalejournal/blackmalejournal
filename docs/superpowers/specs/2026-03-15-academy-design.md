# Academy Page — Design Spec

**Goal:** Build the Academy section — a structured learning hub with course cards, category filtering, and placeholder individual course pages.

**Status:** Approved for implementation

---

## Data Model

### CourseCategory Type

Add a union type to `src/lib/supabase/types.ts`:

```typescript
export type CourseCategory = 'martial-arts' | 'mental-health' | 'relationships' | 'purpose' | 'branding';
```

Label map (used in badges and filter tabs):

| Key              | Label          |
|------------------|----------------|
| `martial-arts`   | Martial Arts   |
| `mental-health`  | Mental Health  |
| `relationships`  | Relationships  |
| `purpose`        | Purpose        |
| `branding`       | Branding       |

### Existing Infrastructure (No Changes Needed)

- `Course` type in `types.ts` — already has: id, title, slug, description, category (string), access_tier, published, cover_image, created_at
- `getCourses({ category?, published? })` in `queries.ts` — filters by category string and published boolean
- `getCourseBySlug(slug)` in `queries.ts` — single course lookup
- `published: false` drives the "Coming Soon" state — no new fields required

---

## Components

### CourseCard (`src/components/content/CourseCard.tsx`)

Server component. Follows ArticleCard pattern.

**Props:**

```typescript
interface CourseCardProps {
  title: string;
  slug: string;
  category: string;
  description: string;
  accessTier: AccessTier;
  published: boolean;
  coverImage?: string | null;
}
```

**Visual structure (top to bottom):**

1. **3px red top-border** — `border-t-[3px] border-bmj-red`. The single accent color, used like a newspaper rule line.
2. **Cover image area** — 16:9 aspect ratio (`aspect-[16/9]`), halftone treatment via `.halftone` class, or placeholder star SVG when no image (same pattern as ArticleCard).
3. **Coming Soon overlay** — If `published === false`: semi-transparent dark overlay (`bg-bmj-black/70`) with "COMING SOON" centered in `font-label text-xs uppercase tracking-widest text-bmj-cream`.
4. **Card body** (`p-6, flex flex-col`):
   - Category badge — monochrome: `border border-bmj-tan/40 text-bmj-tan font-label text-xs uppercase tracking-widest rounded-sm px-2 py-0.5`
   - Title — `font-display text-xl text-bmj-white leading-tight line-clamp-2` (Bebas Neue, naturally all-caps)
   - Description — `font-body text-sm text-bmj-cream/70 line-clamp-3 leading-relaxed`
   - Footer — divider line (`border-t border-bmj-tan/20 pt-4 mt-4`) + access tier label:
     - Free: "FREE" in `font-label text-xs uppercase tracking-widest text-bmj-cream`
     - Premium: "PREMIUM" with Lock icon (lucide-react, size 12) in `text-bmj-amber`

**Behavior:**
- Published courses: entire card wrapped in `<Link href={/academy/${slug}}>`, hover: `-translate-y-1` + `border-bmj-red/60`
- Unpublished courses: no link wrapper, `opacity-60 cursor-default` — visible but clearly inactive

**Container:** `<article>` element with `border border-bmj-tan/20 bg-bmj-brown transition-all duration-200`

### CategoryFilterTabs (`src/components/content/CategoryFilterTabs.tsx`)

Client component (`"use client"`). Mirrors LensFilterTabs pattern exactly.

**Props:**

```typescript
interface CategoryFilterTabsProps {
  activeCategory: string; // 'all' | CourseCategory
}
```

**Tabs:** `[All] [Martial Arts] [Mental Health] [Relationships] [Purpose] [Branding]`

**Styling:**
- Active tab: `border-b-2 border-bmj-red text-bmj-white font-label text-sm uppercase tracking-widest`
- Inactive tab: `text-bmj-tan/60 hover:text-bmj-cream font-label text-sm uppercase tracking-widest`
- Container: `flex gap-6 border-b border-bmj-tan/20 pb-2 overflow-x-auto`

**Behavior:**
- Clicking a tab navigates to `?category=<value>` using `useRouter` + `useSearchParams`
- "All" clears the category param
- Must be wrapped in `<Suspense>` in the parent page (uses `useSearchParams`)

### Category Label Utility

Add to `src/lib/utils.ts`:

```typescript
const CATEGORY_LABELS: Record<string, string> = {
  'martial-arts': 'Martial Arts',
  'mental-health': 'Mental Health',
  'relationships': 'Relationships',
  'purpose': 'Purpose',
  'branding': 'Branding',
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
```

---

## Pages

### Academy Listing Page (`src/app/(public)/academy/page.tsx`)

Server component. Follows Articles page pattern.

**Metadata:**

```typescript
export const metadata: Metadata = {
  title: 'Academy',
  description: 'Structured learning for the disciplined man. Master your body, mind, and mission.',
};
```

**Props and search params:**

```typescript
interface AcademyPageProps {
  searchParams: Promise<{ category?: string }>;
}
```

`searchParams` must be awaited (Next.js 15+ async params pattern used throughout this codebase).

**Data fetching:**
- Validate `category` param against the set of valid categories
- Fetch courses via `getCourses({ category })` — fetch ALL courses (published + unpublished) so Coming Soon cards appear
- No pagination needed for v1 (small course catalog)

**Layout:**

```
┌─────────────────────────────────────────┐
│  THE ACADEMY              (Bebas Neue)  │
│  Structured learning for the            │
│  disciplined man.         (Baskerville) │
│  ────────── ★ ──────────                │
│                                         │
│  [All] [Martial Arts] [Mental Health]...│
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │Card 1│  │Card 2│  │Card 3│          │
│  └──────┘  └──────┘  └──────┘          │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │Card 4│  │Card 5│  │Card 6│          │
│  └──────┘  └──────┘  └──────┘          │
└─────────────────────────────────────────┘
```

- Container: `mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8`
- Title: `font-display text-5xl text-bmj-white`
- Subtitle: `font-body text-lg text-bmj-cream/70 mt-2 max-w-xl`
- StarDivider below subtitle
- CategoryFilterTabs in Suspense
- Grid: `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`
- Empty state: "No courses available yet." in `font-label text-bmj-tan` centered

### Individual Course Page (`src/app/(public)/academy/[slug]/page.tsx`)

Server component. Placeholder for future video lesson content.

**Props:**

```typescript
interface CoursePageProps {
  params: Promise<{ slug: string }>;
}
```

`params` must be awaited (Next.js 15+ async params pattern).

**Data fetching:**
- `const { slug } = await params;` then `getCourseBySlug(slug)`
- `notFound()` if not found

**Dynamic metadata** via `generateMetadata({ params }: CoursePageProps)` — awaits params, fetches course, returns title + description.

**Layout:**
- Container: `mx-auto max-w-article px-4 py-16 sm:px-6 lg:px-8` (narrower, article-width)
- Category badge (monochrome, same style as card)
- Title: `font-display text-5xl text-bmj-white mt-4`
- Description: `font-body text-lg text-bmj-cream/80 mt-6 leading-relaxed`
- Cover image (if present): full-width, halftone treatment, below description
- StarDivider
- Status message:
  - If `published === false`: "This course is currently in development. Check back soon."
  - If `published === true`: "Lessons coming soon."
  - Styled in `font-body text-bmj-tan italic`
- Back link: "Back to Academy" — `font-label text-sm uppercase tracking-widest text-bmj-tan hover:text-bmj-cream`

---

## Seed Data

6 courses across 5 categories, mix of tiers and published states:

```sql
INSERT INTO courses (title, slug, description, category, access_tier, published, cover_image) VALUES
  ('Fundamentals of Combat Discipline', 'fundamentals-of-combat-discipline',
   'Build a warrior''s foundation. This course covers striking fundamentals, defensive positioning, and the mental discipline that separates fighters from practitioners.',
   'martial-arts', 'free', true, NULL),

  ('The Stoic Man''s Framework', 'the-stoic-mans-framework',
   'Ancient philosophy meets modern manhood. Learn to apply Stoic principles to daily decisions, emotional regulation, and long-term purpose.',
   'purpose', 'free', true, NULL),

  ('Building Your Personal Brand', 'building-your-personal-brand',
   'Your name is your currency. Master the fundamentals of personal branding — from visual identity to voice, positioning, and platform strategy.',
   'branding', 'premium', true, NULL),

  ('Emotional Intelligence for Men', 'emotional-intelligence-for-men',
   'Strength isn''t silence. Develop emotional literacy, learn to read social dynamics, and build the communication skills that command respect.',
   'mental-health', 'free', true, NULL),

  ('Partnership & Power Dynamics', 'partnership-and-power-dynamics',
   'Navigate relationships with intention. Explore attachment theory, conflict resolution, and the dynamics of power and vulnerability in partnership.',
   'relationships', 'premium', false, NULL),

  ('Advanced Self-Defense Systems', 'advanced-self-defense-systems',
   'Beyond the basics. Integrate Krav Maga, Brazilian Jiu-Jitsu, and situational awareness into a personal defense system built for real-world scenarios.',
   'martial-arts', 'premium', false, NULL);
```

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/lib/supabase/types.ts` | Add `CourseCategory` union type |
| Modify | `src/lib/utils.ts` | Add `getCategoryLabel()` utility |
| Create | `src/components/content/CourseCard.tsx` | Course card component |
| Create | `src/components/content/CategoryFilterTabs.tsx` | Category filter tabs (client) |
| Create | `src/app/(public)/academy/page.tsx` | Academy listing page |
| Create | `src/app/(public)/academy/[slug]/page.tsx` | Individual course placeholder page |
| Create | `supabase/seed-courses.sql` | Seed data for courses table |

---

## Design Decisions

1. **Monochrome category badges** — All categories get the same `border-bmj-tan/40 text-bmj-tan` treatment. No per-category colors. This keeps the visual hierarchy clean and avoids diluting the brand palette. The `--bmj-red` top-border on cards is the only accent.

2. **Published field drives Coming Soon** — No new database fields. `published: false` = Coming Soon overlay + disabled interaction. Simple and already supported by the query layer.

3. **No pagination for v1** — Course catalogs are small (6-20 items). A simple grid is sufficient. Pagination can be added later if the catalog grows significantly.

4. **Category filter via URL params** — Same pattern as lens filter on Articles page. Allows shareable filtered URLs and works with server-side rendering.

5. **Placeholder course pages** — Individual course pages show title, description, and a "coming soon" message. The video lesson infrastructure will be built in a future session.
