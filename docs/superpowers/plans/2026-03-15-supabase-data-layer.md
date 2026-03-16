# Supabase Data Layer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the BMJ codebase to Supabase — typed clients, query helpers, seed data, and a live home page pulling real content.

**Architecture:** Server Components call typed query helpers that use `@supabase/ssr`'s server client; the browser client is a separate factory for future client-side auth flows. Middleware refreshes the session on every request. UI components are updated to accept props instead of hardcoded placeholder data.

**Tech Stack:** Next.js 16 App Router, TypeScript strict mode, `@supabase/supabase-js`, `@supabase/ssr`, `clsx`, `tailwind-merge`, `tsx` (seed runner)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/lib/supabase/types.ts` | All TS interfaces + `Database` generic for typed Supabase client |
| Create | `src/lib/supabase/client.ts` | Browser client factory (for client components / auth) |
| Create | `src/lib/supabase/server.ts` | Async server client factory (used by all Server Components) |
| Create | `src/middleware.ts` | Session refresh on every request |
| Create | `src/lib/supabase/queries.ts` | All typed query helpers for articles, briefings, members, courses, etc. |
| Create | `src/lib/utils.ts` | `cn()`, `formatDate()`, `generateSlug()`, `truncateText()`, `calculateReadingTime()`, `getLensColor()`, `getLensEmoji()` |
| Create | `scripts/seed.ts` | One-time seed: 9 articles, 3 briefings, 5 courses |
| Modify | `src/components/home/BriefingPreview.tsx` | Accept `briefing: Briefing \| null` prop; remove hardcoded placeholder |
| Modify | `src/components/home/FeaturedArticles.tsx` | Accept `articles: Article[]` prop; remove hardcoded placeholder |
| Modify | `src/app/(public)/page.tsx` | Async Server Component; query Supabase; pass data to components |

---

## Chunk 1: Install + Foundations (Tasks 1–5)

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install runtime packages**

```bash
cd /c/Users/mesha/Desktop/Projects/blackmalejournal
npm install @supabase/supabase-js @supabase/ssr clsx tailwind-merge
```

Expected: `package.json` now lists `@supabase/supabase-js`, `@supabase/ssr`, `clsx`, `tailwind-merge` under `dependencies`.

- [ ] **Step 2: Install dev packages**

```bash
npm install -D tsx
```

Expected: `tsx` appears under `devDependencies`.

- [ ] **Step 3: Verify TypeScript can resolve the new packages**

```bash
npx tsc --noEmit
```

Expected: No errors (nothing yet imports these packages, so it should be clean).

---

### Task 2: Type Definitions

**Files:**
- Create: `src/lib/supabase/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/lib/supabase/types.ts

// ── Scalar enums ──────────────────────────────────────────────────────────────

export type Lens = 'health' | 'philosophy' | 'politics';
export type AccessTier = 'free' | 'basic' | 'premium';
export type MemberTier = 'free' | 'basic' | 'premium';

export interface BriefingSection {
  title: string;
  body: string;
}

// ── Application interfaces ────────────────────────────────────────────────────

export interface Article {
  id: string;
  title: string;
  slug: string;
  lens: Lens;
  tags: string[];
  excerpt: string;
  body: string;
  featured: boolean;
  access_tier: AccessTier;
  author: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
}

export interface Briefing {
  id: string;
  issue_number: number;
  title: string;
  slug: string;
  sections: BriefingSection[];
  access_tier: AccessTier;
  cover_image: string | null;
  published_at: string;
  created_at: string;
}

export interface Member {
  id: string;
  email: string;
  tier: MemberTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  access_tier: AccessTier;
  published: boolean;
  cover_image: string | null;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  submitted_at: string;
}

// ── Database generic (required by @supabase/supabase-js typed client) ─────────
// This maps table names to their Row/Insert/Update shapes so every
// supabase.from('articles').select() call returns Article[] automatically.

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at'>;
        Update: Partial<Omit<Article, 'id' | 'created_at'>>;
      };
      briefings: {
        Row: Briefing;
        Insert: Omit<Briefing, 'id' | 'created_at'>;
        Update: Partial<Omit<Briefing, 'id' | 'created_at'>>;
      };
      members: {
        Row: Member;
        Insert: Omit<Member, 'id' | 'created_at'>;
        Update: Partial<Omit<Member, 'id' | 'created_at'>>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at'>;
        Update: Partial<Omit<Course, 'id' | 'created_at'>>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, 'id' | 'subscribed_at'>;
        Update: Partial<Omit<NewsletterSubscriber, 'id'>>;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Omit<ContactSubmission, 'id' | 'submitted_at'>;
        Update: Partial<Omit<ContactSubmission, 'id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

---

### Task 3: Utility Helpers

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create utils**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Lens } from '@/lib/supabase/types';

// Merges Tailwind classes safely — conditional classes without specificity conflicts.
// Usage: cn('base-class', isActive && 'active-class', className)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Returns uppercase date string, e.g. "MARCH 15, 2026"
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();
}

// Converts a title into a URL-safe slug, e.g. "Hello World" → "hello-world"
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Truncates to maxLength with ellipsis, preserving whole words.
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

// Estimates reading time at 200 words per minute (standard editorial rate).
// Returns at least 1 minute.
export function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Returns the Tailwind text-color class for a lens label.
// These classes are hardcoded (not dynamic) so Tailwind includes them in the build.
export function getLensColor(lens: Lens): string {
  const map: Record<Lens, string> = {
    health: 'text-bmj-amber',
    philosophy: 'text-bmj-tan',
    politics: 'text-bmj-red',
  };
  return map[lens];
}

// Returns a single character glyph used as a lens icon.
export function getLensEmoji(lens: Lens): string {
  const map: Record<Lens, string> = {
    health: '🫀',
    philosophy: '🩷',
    politics: '🖤',
  };
  return map[lens];
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

---

### Task 4: Browser Client

**Files:**
- Create: `src/lib/supabase/client.ts`

> `createBrowserClient` from `@supabase/ssr` wraps the standard Supabase client
> with cookie-based session storage so auth works in client components without
> any additional setup.

- [ ] **Step 1: Create browser client**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

---

### Task 5: Server Client

**Files:**
- Create: `src/lib/supabase/server.ts`

> The server client is `async` because `cookies()` from `next/headers` is async
> in Next.js 15+. Every Server Component and Route Handler that needs Supabase
> must `await createClient()`.

- [ ] **Step 1: Create server client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore.
            // Middleware handles session refresh for read-only server components.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 3: Commit Chunk 1**

```bash
cd /c/Users/mesha/Desktop/Projects/blackmalejournal
git add package.json package-lock.json src/lib/supabase/types.ts src/lib/supabase/client.ts src/lib/supabase/server.ts src/lib/utils.ts
git commit -m "feat: add supabase clients, types, and utility helpers"
```

---

## Chunk 2: Middleware + Queries (Tasks 6–7)

### Task 6: Auth Session Middleware

**Files:**
- Create: `src/middleware.ts`

> Middleware runs on every request before the page renders.
> Calling `supabase.auth.getUser()` causes `@supabase/ssr` to silently refresh
> an expiring token and write the new session back to the cookie.
> Without this, long-lived sessions break on the next Server Component render.

- [ ] **Step 1: Create middleware**

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes expiring tokens and writes the updated session to cookies.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and images.
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

---

### Task 7: Query Helpers

**Files:**
- Create: `src/lib/supabase/queries.ts`

> All query helpers are async Server-side functions. They call `await createClient()`
> on each invocation — no module-level singleton, because the server client needs
> fresh cookies per request in the App Router.

- [ ] **Step 1: Create queries file**

```typescript
// src/lib/supabase/queries.ts
import { createClient } from '@/lib/supabase/server';
import type {
  Article,
  Briefing,
  Course,
  Member,
  MemberTier,
  Lens,
  AccessTier,
} from '@/lib/supabase/types';

// ── Articles ──────────────────────────────────────────────────────────────────

export async function getArticles(options: {
  lens?: Lens;
  tag?: string;
  limit?: number;
  offset?: number;
  tier?: AccessTier;
} = {}): Promise<Article[]> {
  const { lens, tag, limit = 20, offset = 0, tier } = options;
  const supabase = await createClient();

  let query = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (lens) query = query.eq('lens', lens);
  if (tag) query = query.contains('tags', [tag]);
  if (tier) query = query.eq('access_tier', tier);

  const { data, error } = await query;
  if (error) {
    console.error('[getArticles]', error.message);
    return [];
  }
  return data ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getFeaturedArticles]', error.message);
    return [];
  }
  return data ?? [];
}

export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getLatestArticles]', error.message);
    return [];
  }
  return data ?? [];
}

// ── Briefings ─────────────────────────────────────────────────────────────────

export async function getBriefings(options: {
  limit?: number;
  offset?: number;
} = {}): Promise<Briefing[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .order('issue_number', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getBriefings]', error.message);
    return [];
  }
  return data ?? [];
}

export async function getBriefingBySlug(slug: string): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getLatestBriefing(): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .order('issue_number', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function getBriefingByIssue(
  issueNumber: number,
): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('issue_number', issueNumber)
    .single();

  if (error) return null;
  return data;
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function getMemberById(userId: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
}

export async function updateMemberTier(
  userId: string,
  tier: MemberTier,
  stripeData?: { customerId: string; subscriptionId: string },
): Promise<void> {
  const supabase = await createClient();
  const update: Partial<Member> = { tier };
  if (stripeData) {
    update.stripe_customer_id = stripeData.customerId;
    update.stripe_subscription_id = stripeData.subscriptionId;
  }

  const { error } = await supabase
    .from('members')
    .update(update)
    .eq('id', userId);

  if (error) {
    console.error('[updateMemberTier]', error.message);
  }
}

// ── Courses ───────────────────────────────────────────────────────────────────

export async function getCourses(options: {
  category?: string;
  published?: boolean;
} = {}): Promise<Course[]> {
  const { category, published } = options;
  const supabase = await createClient();

  let query = supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (published !== undefined) query = query.eq('published', published);

  const { data, error } = await query;
  if (error) {
    console.error('[getCourses]', error.message);
    return [];
  }
  return data ?? [];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function subscribeToNewsletter(
  email: string,
  source?: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, source: source ?? null, unsubscribed_at: null },
      { onConflict: 'email' },
    );

  if (error) {
    console.error('[subscribeToNewsletter]', error.message);
  }
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email);

  if (error) {
    console.error('[unsubscribeFromNewsletter]', error.message);
  }
}

// ── Contact ───────────────────────────────────────────────────────────────────

export async function submitContactForm(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('contact_submissions').insert({
    name: data.name,
    email: data.email,
    subject: data.subject ?? null,
    message: data.message,
  });

  if (error) {
    console.error('[submitContactForm]', error.message);
  }
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 3: Commit Chunk 2**

```bash
git add src/middleware.ts src/lib/supabase/queries.ts
git commit -m "feat: add middleware session refresh and typed query helpers"
```

---

## Chunk 3: Seed + UI Wiring (Tasks 8–10)

### Task 8: Seed Script

**Files:**
- Create: `scripts/seed.ts`

> The seed script uses `createClient` from `@supabase/supabase-js` directly
> (not the server helper) because it runs as a CLI script, not inside Next.js.
> Use `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security during seeding.
> Add it to `.env.local` if it is not already there.

- [ ] **Step 1: Add service role key to .env.local** (if not present)

Open `.env.local` and confirm these lines exist (values from your Supabase dashboard → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 2: Create the seed script**

```typescript
// scripts/seed.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Articles ──────────────────────────────────────────────────────────────────

const articles = [
  // HEALTH (3)
  {
    title: 'The Discipline of Iron: Why Every Man Needs a Physical Practice',
    slug: 'discipline-of-iron-physical-practice',
    lens: 'health',
    tags: ['fitness', 'discipline', 'sovereignty'],
    excerpt:
      'Most men approach fitness as aesthetics. We approach it as politics. The body is a site of resistance, and every rep is a vote for or against your own liberation.',
    body: `The gym is not neutral territory. When Frederick Douglass wrote about the moment he fought back against the overseer Covey, he noted that the physical confrontation changed something fundamental in him — gave him a sense of his own manhood that no sermon or book could provide. That is the truth about physical training that the fitness industry will never sell you: the iron builds more than muscle. It builds the self.

There is a long tradition in the African diaspora of understanding the body as contested ground. The plantation deliberately targeted physical vitality — overwork, inadequate nutrition, the deliberate destruction of the male body as a warning. The response, when possible, was to reclaim that body. To run faster. To lift heavier. To endure more. Not as performance for the master, but as private knowledge of one's own capacity.

That tradition belongs to us. Every man reading this exists downstream of men who survived by staying physically capable. The question is whether we honor that inheritance or let it go soft.

**What a Physical Practice Actually Does**

A serious physical practice — not three days a week when you feel like it, but a systematic, progressive commitment — restructures your relationship with discomfort. Most modern life is engineered to remove discomfort entirely. One-click delivery. Temperature-controlled everything. Frictionless entertainment. The body that never pushes against resistance becomes the mind that never pushes against resistance.

Stoic philosophy understood this. Marcus Aurelius trained for physical hardship deliberately, not because the emperor of Rome needed to be in fighting shape, but because he understood that comfort corrupts judgment. The man who has never voluntarily suffered cannot be trusted with difficulty.

**The Protocol**

Here is a non-negotiable minimum: four sessions per week, each containing some combination of heavy compound lifts (squat, deadlift, press, pull), conditioning work (sprints, rows, carries), and deliberate recovery. That is the floor. The ceiling is whatever your life can sustain without breaking the other disciplines.

Track everything. Not for Instagram — for yourself. The log becomes a record of what you are capable of. On the days you don't feel it, the log tells the truth about who you have been, and who you are building toward.

Do not let this be optional.`,
    featured: true,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-01T09:00:00Z',
  },
  {
    title: 'Iron Mind: The Mental Discipline That Makes the Physical Possible',
    slug: 'iron-mind-mental-discipline',
    lens: 'health',
    tags: ['mindset', 'discipline', 'mental-health'],
    excerpt:
      'You cannot build the body without first building the mind that will sustain it. The men who quit do not lack strength — they lack the mental architecture to use it.',
    body: `Every man who has ever trained seriously has encountered the moment where the body still has reserves and the mind sends the abort signal. That moment is the actual workout. Everything before it was warm-up.

Mental discipline is not a personality trait. It is not something you have or don't have. It is a practice, exactly like physical training — something you build through progressive overload, not through inspiration or willpower as a finite resource.

The mistake most men make is treating willpower as a battery: something that depletes and needs recharging. Research by Roy Baumeister and others suggests this framing is partly wrong. What we call willpower depletion is often attention depletion — we exhaust our capacity to care about the thing we're trying to do, not the underlying ability to do it.

**Structure Over Motivation**

Motivation is a feeling. Discipline is a system. The man who trains only when motivated will train inconsistently. The man who has structured his life so that training happens regardless of how he feels will train consistently, and consistency is the only variable that matters at the macro level.

This means: same time each day. Same sequence. Minimal decisions before you start. The cognitive load of deciding whether to train is often greater than the load of the training itself. Remove the decision. The session happens. What happens in the session is up to you.

**The Internal Voice**

Learn to identify the voice that says stop when stopping is not necessary. That voice is not wisdom — it is the accumulated comfort-seeking of every soft option you have taken in the past. Every time you listen to it when you should not, you teach it that it works. Every time you override it, you teach your mind that it cannot be trusted to quit you prematurely.

This is the work. Not the sets and reps. The relationship with that voice.`,
    featured: false,
    access_tier: 'basic',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-02-15T09:00:00Z',
  },
  {
    title: 'Fasting as a Political Act: Reclaiming Control Over Your Own Body',
    slug: 'fasting-political-act-body-control',
    lens: 'health',
    tags: ['fasting', 'health', 'sovereignty', 'discipline'],
    excerpt:
      'The food system was not designed with your health in mind. Fasting is not a diet trend — it is a daily assertion that you, not the market, control your body.',
    body: `In 1965, the Student Nonviolent Coordinating Committee organized a fast in solidarity with imprisoned civil rights workers. In 1981, Bobby Sands led the Maze Prison hunger strike. Fasting as a form of protest runs through political history not because hunger is comfortable but because the deliberate control of one's own consumption — in the face of a system designed to manage that consumption for its own benefit — is a radical act.

I am not asking you to hunger strike. I am asking you to consider what a 16-hour fast, done consistently, says about your relationship with the food-industrial complex.

**What the System Wants**

The processed food industry spent decades engineering products specifically to override your body's satiety signals. High fructose corn syrup, refined seed oils, engineered textures and flavor combinations that never appear in nature — all of it designed to make you consume more than you need, more reliably than you would without intervention. The body that never fasts is the body that has fully surrendered its hunger regulation to an industry with no interest in your health.

Fasting resets the relationship. When you have gone 18 hours without food, you learn what actual hunger feels like — not boredom, not stress, not the Pavlovian response to a food advertisement. Actual hunger. And then you choose when to respond to it.

**The Physiology**

At around 12–14 hours of fasting, the body begins to shift from glucose metabolism toward fat oxidation. By 18–24 hours, autophagy — the cellular cleanup process that may be among the most powerful anti-aging interventions we have access to — ramps up meaningfully. These are not marginal benefits.

A 16:8 protocol (16 hours fasted, 8-hour eating window) is the minimum viable practice. Eat your last meal by 8pm. Break your fast at noon. Drink water, black coffee, or plain tea in the window. That is the entire intervention. Do it every day.

The body you build through fasting is not just leaner. It is more capable of operating without external inputs — more autonomous, more resilient, more yours.`,
    featured: false,
    access_tier: 'premium',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-01-20T09:00:00Z',
  },

  // PHILOSOPHY (3)
  {
    title: 'Marcus Aurelius Had It Right: Stoic Principles for the Modern Black Man',
    slug: 'marcus-aurelius-stoic-principles-modern-black-man',
    lens: 'philosophy',
    tags: ['stoicism', 'philosophy', 'marcus-aurelius', 'mindset'],
    excerpt:
      'Stoicism was not written for comfortable men. It was written for men who carried enormous responsibility in a world that did not always bend to their will. Sound familiar?',
    body: `Marcus Aurelius was the most powerful man in the Roman world. He was also, by his own account in the Meditations, perpetually at war with his own weaknesses — his temper, his preference for rest over duty, his tendency toward self-pity. He wrote his journal not as a monument to wisdom but as a daily corrective, a document of a man arguing himself back into right action.

That is what makes Stoicism relevant to us. Not the calm, marble-faced philosopher of popular imagination. The actual Stoic: the one who wakes up every morning to face circumstances beyond his control and has to choose, again, how he will respond.

**The Dichotomy of Control**

Epictetus opens the Enchiridion with what might be the most useful distinction in the history of philosophy: some things are in our power, and some are not. In our power: judgment, desire, aversion, our own mental and moral actions. Not in our power: the body, reputation, position, external circumstances.

For a Black man navigating American institutions — which were not built for him and often actively resist him — this distinction is not abstract. The hiring manager's bias is not in your power. Your response to it is. The quality of your preparation before the interview is. The system's structural hostility is not in your power. Your decision about which systems to engage, which to circumvent, and which to build alternatives to, is.

This is not passivity. This is the most sophisticated form of agency available: knowing exactly where your leverage is, and applying maximum force there.

**Amor Fati**

Nietzsche borrowed the concept from the Stoics: love of fate. Not resignation to what is, but active embrace of it as the material with which you must work. The Stoic does not ask "why is this happening to me?" He asks "what does this require of me?"

James Baldwin understood this intuitively. "Not everything that is faced can be changed, but nothing can be changed until it is faced." That is Stoicism without the Latin. Face the condition. Work with what is. Do not wait for better conditions to begin the work.

**The Practical Protocol**

Each morning: review what the day will demand. Anticipate where you may be tempted toward reaction rather than response. At each moment of friction: pause. Ask whether your response is in service of your values or in service of your emotional state. Each evening: what went wrong? Why? What will you do differently?

That is the entire practice. Unremarkable in description. Transformative in execution.`,
    featured: true,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-02-28T09:00:00Z',
  },
  {
    title: 'The Examined Life Is the Only Life Worth Living',
    slug: 'examined-life-worth-living',
    lens: 'philosophy',
    tags: ['philosophy', 'socrates', 'self-knowledge', 'mindset'],
    excerpt:
      'Socrates said it plainly and paid with his life. What does it actually mean to examine your existence — not as an intellectual exercise, but as a daily practice of reckoning?',
    body: `Socrates delivered his verdict in the Apology: the unexamined life is not worth living. He said this in his own defense, at his own trial, knowing the statement would cost him. The jury of Athens found him guilty and sentenced him to death. He drank the hemlock without complaint.

That is the model. Not the comfortable philosopher in the academy. The man who took his own principles so seriously that he accepted death rather than compromise them.

Most men live unexamined lives. Not because they are stupid or lazy, but because the infrastructure of modern life is specifically designed to prevent examination. Constant stimulation. Algorithmic content tuned to keep the attention on the screen and off the self. Work that demands presence but not reflection. Entertainment that fills every quiet moment that might otherwise become contemplation.

The examined life requires taking back that time — and that is harder than it sounds.

**What Examination Actually Means**

Socratic examination is not journaling about your feelings. It is rigorous questioning of your beliefs: why do you hold this value? Is it actually yours, or did you absorb it without scrutiny? Does your behavior actually align with what you claim to believe? Where are the contradictions?

Most men who do this work discover that large portions of what they thought were their own convictions are actually inherited — from parents, from culture, from the particular cohort of men they happened to grow up around. Some of those inherited beliefs are worth keeping. Some are not. The only way to know is to examine them.

**The Practice of Reckoning**

Weekly: sit without a phone. Review the week. Not the external events — your responses to them. Where did you react from fear? Where from pride? Where did you do the difficult thing? Where did you avoid it? What would you do differently?

This is not self-flagellation. The Stoics were clear on this: the point of reviewing failures is not guilt but correction. You are not building a case against yourself. You are building the self who will do better.

The examined life is uncomfortable. That is the point.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-02-10T09:00:00Z',
  },
  {
    title: 'On the Necessity of Solitude: Why the Connected Man Is the Distracted Man',
    slug: 'necessity-of-solitude-connected-distracted-man',
    lens: 'philosophy',
    tags: ['solitude', 'philosophy', 'mindset', 'focus'],
    excerpt:
      'The man who is never alone is the man who never knows himself. Solitude is not a luxury — it is the laboratory in which the self is made.',
    body: `Every major tradition of masculine development includes a period of deliberate isolation. The vision quest. The desert fathers. The forty days in the wilderness. The monk's cell. These are not coincidental convergences — they reflect a persistent recognition that the self cannot be built in the crowd.

This is not introversion as personality type. It is the recognition that certain kinds of thinking — the deep, generative kind — require the absence of social stimulus. Not forever. Not as a permanent condition. As a practice. As a regular return to the self before returning to others.

The modern world has made this nearly impossible and made us think that is fine. Social media has created a permanent crowd in every pocket. The anxiety of missing something — FOMO as a design feature, not a bug — has made many men constitutionally unable to be alone without reaching for the phone.

What is lost is not just peace. What is lost is the capacity for original thought. The connected man is a curator of other people's thinking. The solitary man is a generator of his own.

**The Biology of Distraction**

Each notification, each scroll, each tab opened is a micro-dose of dopamine — a reward for novelty-seeking behavior. The brain that receives these micro-doses constantly becomes less capable of tolerating the necessary discomfort of sustained attention. Deep work, long-form thinking, creative synthesis — all of these require tolerating an uncomfortable absence of stimulation. The chronically connected brain cannot do it.

The fix is not willpower applied against the phone. The fix is structural removal: scheduled periods of non-connectivity, physical distance from devices, regular practice of doing one thing for extended periods without interruption.

**The Protocol**

Two hours per day without a phone. One day per month in deliberate solitude — no social media, no podcasts, no company. One weekend per quarter in full retreat from the social world. These are not large asks. They are the minimum investment in the self that serious development requires.

What you will discover, in the silence, is what you actually think. And then the real work can begin.`,
    featured: false,
    access_tier: 'basic',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-01-05T09:00:00Z',
  },

  // POLITICS (3)
  {
    title: 'Understanding Power: A Framework for Community Organizing',
    slug: 'understanding-power-community-organizing-framework',
    lens: 'politics',
    tags: ['power', 'organizing', 'community', 'politics'],
    excerpt:
      'Power does not yield to good arguments or moral appeals alone. It yields to organized, sustained pressure from people who understand their leverage. Here is the framework.',
    body: `Saul Alinsky's Rules for Radicals was written in 1971 and remains one of the clearest analyses of how power actually works — not how we wish it worked or how civics class describes it, but how it operates in practice. The central insight: power responds to organized power, and little else.

Frederick Douglass said it before Alinsky, and more elegantly: "Power concedes nothing without a demand. It never did and it never will." The demand must come from an organized constituency that can credibly threaten consequences. No organization, no credible threat. No credible threat, no concession.

This is not cynicism. This is operational reality. The civil rights movement succeeded not because it appealed to the conscience of the nation — though it did that too — but because it was organized, disciplined, economically disruptive, and capable of making the continuation of segregation more costly than desegregation. The Birmingham campaign worked because Bull Connor's dogs and hoses were photographed and broadcast to a national audience that included international allies the Kennedy administration was trying to cultivate. The pressure point was real. The leverage was real.

**Mapping Power**

The first tool of organizing is a power analysis: who makes decisions that affect your community? Who influences them? Who funds them? What do they want? What do they fear? What are their pressure points?

This is not abstract. Draw the actual map. The school board that controls your neighborhood schools — who sits on it? Who votes for them? Who donates to their campaigns? Who are their employers or clients? What are their stated priorities? Where do their stated priorities conflict with their actions?

Once you have the map, you can see where your leverage is. Voter registration in a district where a school board member's margin was 300 votes. Business relationships with a board member's employer. Connections to community institutions the decision-maker wants to preserve goodwill with.

**The Building Block: The One-on-One**

Every organizing tradition, from unions to the Black church, begins with the individual conversation. Not the mass rally, not the petition, not the social media campaign. The conversation between two people in which one learns the other's interests, values, fears, and capacities.

This is how you identify who is in the fight and who is sympathetic but not ready to act. This is how you build the trust that collective action requires. This is how you find leadership you didn't know existed.

Start with ten people. Have real conversations with them. Find out what they are actually angry about, what they are afraid of, what they would actually risk. Build from there.

The mass rally is the output of months of one-on-ones. It is not the beginning. It is the demonstration of organized power that was built in private.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-10T09:00:00Z',
  },
  {
    title: 'Why Black Men Need to Stop Waiting on Institutions',
    slug: 'black-men-stop-waiting-institutions',
    lens: 'politics',
    tags: ['institutions', 'self-determination', 'politics', 'power'],
    excerpt:
      'The institution was never designed with your liberation in mind. The sooner we internalize this fully, the sooner we can begin building what we actually need.',
    body: `The American institution — the school, the hospital, the bank, the court — was not designed to serve the Black man's interests. This is not a conspiracy theory; it is a historical fact inscribed in founding documents, legislative records, and case law. The question of what to do about it is one of the defining debates in Black political thought.

Booker T. Washington argued for accommodation and self-development within the existing order. W.E.B. Du Bois argued for full political engagement and the demand for equal citizenship. Marcus Garvey argued for building entirely parallel institutions. Malcolm X argued that liberation would never come from an order built on subjugation.

All of them were partly right. The synthesis that Black men need in 2026 draws from all four.

**The Waiting Problem**

The waiting problem is this: many Black men have oriented their lives around waiting for institutions to change. Waiting for the school to improve. Waiting for the police to reform. Waiting for the economy to become more fair. Waiting for recognition of historical wrongs.

The waiting is not irrational — the institutions genuinely should change, and some of them genuinely have, in response to organized pressure. But the waiting posture, when it becomes the dominant orientation, is catastrophic for the man who adopts it. It makes your liberation contingent on the decisions of people who do not prioritize it.

**The Builder's Posture**

The alternative is not separatism or withdrawal. It is the insistence on building what you need, parallel to whatever engagement with the existing order makes strategic sense.

Build the school the public school cannot be. Build the economic relationships the formal economy does not offer your community. Build the health infrastructure the hospital system has shown it will not provide equitably. Build the social organizations — the mutual aid networks, the investment clubs, the political formations — that translate individual capacity into collective power.

This is not new. Greenwood, Oklahoma — "Black Wall Street" — was this. The Black church was this. The Harlem Renaissance was this. The tradition is ours. The question is whether we will use it.

Do not wait for permission. Do not wait for the system to become what it was never designed to be. Build.`,
    featured: false,
    access_tier: 'basic',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-02-01T09:00:00Z',
  },
  {
    title: 'The Economics of Black Masculinity: How the Market Profits From Our Pain',
    slug: 'economics-black-masculinity-market-profits-pain',
    lens: 'politics',
    tags: ['economics', 'capitalism', 'culture', 'politics'],
    excerpt:
      'The image of the Black man in crisis is not just a social problem — it is a profitable product. Understanding the economics changes how you respond to it.',
    body: `In 2020, corporations pledged over $50 billion to "racial equity" initiatives in the weeks following George Floyd's murder. By 2023, most of those pledges had been quietly reduced, delayed, or redirected. The pattern is instructive: the pain of Black men is worth something in the market — as content, as brand positioning, as short-term political capital — but the structural changes that would actually address it are not.

This is not incidental. The commodification of Black pain has a long history: from the spectacle of lynching photographs sold as postcards, to the exploitation of Black musical innovation that created the recording industry's first fortunes, to the prison-industrial complex's conversion of Black bodies into revenue streams for private contractors. The market has never lacked for ways to profit from our condition.

Understanding this changes the analysis. The question is not only what the social problem is. The question is who benefits from its continuation.

**The Attention Economy**

Social media platforms discovered early that anger and outrage generate more engagement than any other emotion. Black pain — filmed, shared, debated, outrage-marketed — is among the most consistently engaging content categories on every major platform.

The man who spends hours consuming footage of police violence, reading comment sections about Black suffering, engaging in outrage cycles on Twitter, is generating revenue for platforms that have no interest in the conditions that produce the footage. His attention is the product. His pain is the feed.

This does not mean look away. It means be intentional about what you consume, why, and to what end. Information that produces action is different from information that produces only emotional churn.

**The Alternative Economic Orientation**

Direct your money toward Black-owned enterprises with demonstrated commitment to community reinvestment. Build economic relationships within your community that keep capital circulating rather than immediately exiting. Understand the economics of your own neighborhood: where does money come in, where does it go, who controls the flow?

These are not sufficient responses to structural racism. They are necessary complements to the political work of changing the structure. The man who both organizes for policy change and redirects his economic activity toward community building is operating at the highest level of the tradition.

Both. Always both.`,
    featured: false,
    access_tier: 'premium',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-01-15T09:00:00Z',
  },
];

// ── Briefings ─────────────────────────────────────────────────────────────────

const briefings = [
  {
    issue_number: 3,
    title: 'On the Weight of Visibility',
    slug: 'weekend-briefing-003',
    sections: [
      {
        title: 'The Burden',
        body: 'There is a particular exhaustion that comes with being seen — not just looked at, but tracked, assessed, catalogued. Every Black man who moves through predominantly non-Black spaces understands this weight intimately. This issue, we examine visibility as both burden and weapon: how it is used against us, and how we reclaim the terms of our own appearance in the world.',
      },
      {
        title: 'Surveillance and Sovereignty',
        body: 'The history of watching Black men in America is not subtle. From the slave patrols that required enslaved people to carry passes to move freely, to the broken-windows policing doctrine that treated the presence of Black men in certain spaces as inherently suspicious, to the social media pile-ons that can end a man\'s career based on a decontextualized video — the mechanisms change but the underlying project is consistent: to make Black male presence conditional, always subject to review, never fully at home in public space.',
      },
      {
        title: 'Reclaiming the Frame',
        body: 'The response is not to disappear. It is to develop what I call a sovereign presence — the capacity to move through space with full awareness of how you are being read, while refusing to let that reading determine how you occupy the space. This is not code-switching as capitulation. It is strategic awareness combined with uncompromising self-possession. You know the room. You know the read. You remain yourself. The space adjusts to you, not the other way around.',
      },
    ],
    access_tier: 'free',
    cover_image: null,
    published_at: '2026-03-10T09:00:00Z',
  },
  {
    issue_number: 2,
    title: 'Brotherhood in the Age of Isolation',
    slug: 'weekend-briefing-002',
    sections: [
      {
        title: 'The Loneliness Crisis',
        body: 'The data on male loneliness is unambiguous and worsening. Over 15% of American men report having no close friends — a figure that has tripled since 1990. Black men face this crisis at the intersection of general male isolation and the specific dynamics of racial stress, hypermasculine performance expectations, and institutional mistrust that make vulnerability particularly costly. The result is men who are increasingly alone in ways they cannot or will not name.',
      },
      {
        title: 'What Brotherhood Actually Requires',
        body: 'Brotherhood is not proximity. Men who work together, play together, and drink together can remain strangers to each other\'s interior lives for decades. Actual brotherhood — the kind that sustains men through genuine difficulty — requires the capacity for disclosure and the willingness to receive it. It requires the ability to say I am struggling without immediately framing it as a temporary condition or a logistical problem to be solved.',
      },
      {
        title: 'The Path Back',
        body: 'Building real male friendship in adulthood requires intentionality that feels unnatural to men trained to let relationships form passively. You have to initiate. You have to follow up. You have to be the one who says this conversation was valuable to me and I want to continue it. The discomfort of doing this is worth tolerating. The alternative is the slow drift toward the kind of isolation that kills men by degrees.',
      },
    ],
    access_tier: 'basic',
    cover_image: null,
    published_at: '2026-03-03T09:00:00Z',
  },
  {
    issue_number: 1,
    title: 'What It Means to Be a Revolutionary Masculinist',
    slug: 'weekend-briefing-001',
    sections: [
      {
        title: 'The Stakes',
        body: 'This platform exists because the dominant conversation about Black men in America is a conversation about pathology. The statistics of incarceration, unemployment, educational failure, violence — these are real, and they demand engagement. But statistics describe populations, not individuals, and the relentless focus on pathology has produced a generation of Black men who are better acquainted with the reasons they might fail than with the traditions and practices that enable men to thrive.',
      },
      {
        title: 'Revolutionary Masculinism Defined',
        body: 'Revolutionary masculinism is not the assertion that men are victims, or that feminism is the enemy, or that the old hierarchies were good. It is the assertion that Black male flourishing — intellectual, physical, moral, political — is a legitimate project deserving serious, rigorous attention. That the cultivation of Black male character and capacity is not in tension with the liberation of Black people as a whole, but is necessary to it. That the Black man who is disciplined, knowledgeable, capable, and connected is a more powerful agent of transformation than the Black man who is merely aggrieved.',
      },
      {
        title: 'The Invitation',
        body: 'This journal is an invitation to a more demanding version of yourself. Not demanding in the sense of punishment or self-criticism. Demanding in the sense of high expectation — the refusal to accept less than your full potential as sufficient. The men who built this country against every resistance it threw at them were not operating on low expectations. They were operating on the conviction that they deserved the full fruits of their humanity, and that building toward that was the work. That is still the work.',
      },
    ],
    access_tier: 'free',
    cover_image: null,
    published_at: '2026-02-24T09:00:00Z',
  },
];

// ── Courses ───────────────────────────────────────────────────────────────────

const courses = [
  {
    title: 'The Physical Sovereignty Protocol',
    slug: 'physical-sovereignty-protocol',
    description:
      'A 12-week progressive training system built around compound lifts, conditioning, and the mental discipline that makes it sustainable. This is not a fitness program. This is a practice.',
    category: 'health',
    access_tier: 'basic',
    published: true,
    cover_image: null,
  },
  {
    title: 'Stoic Foundations: A 30-Day Philosophical Practice',
    slug: 'stoic-foundations-30-day-practice',
    description:
      'Daily readings and exercises drawn from Marcus Aurelius, Epictetus, and Seneca — applied specifically to the conditions Black men navigate in contemporary America.',
    category: 'philosophy',
    access_tier: 'free',
    published: true,
    cover_image: null,
  },
  {
    title: 'Organizing 101: Building Power in Your Community',
    slug: 'organizing-101-building-community-power',
    description:
      'A practical curriculum in community organizing: power analysis, the one-on-one, coalition building, direct action, and sustaining a campaign over time.',
    category: 'politics',
    access_tier: 'basic',
    published: true,
    cover_image: null,
  },
  {
    title: 'The Reading Room: Essential Black Political Thought',
    slug: 'reading-room-black-political-thought',
    description:
      'A curated curriculum through Douglass, Du Bois, Garvey, Malcolm, Baldwin, and their intellectual descendants — with discussion guides and application exercises.',
    category: 'philosophy',
    access_tier: 'premium',
    published: true,
    cover_image: null,
  },
  {
    title: 'Economic Sovereignty: Money, Ownership, and Community Wealth',
    slug: 'economic-sovereignty-money-ownership-community-wealth',
    description:
      'Personal finance through the lens of collective economics: how to manage your own money and how to deploy it in ways that build community wealth, not just individual net worth.',
    category: 'politics',
    access_tier: 'premium',
    published: false,
    cover_image: null,
  },
];

// ── Seed runner ───────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding articles...');
  const { error: artErr } = await supabase.from('articles').upsert(articles, {
    onConflict: 'slug',
  });
  if (artErr) {
    console.error('Articles seed failed:', artErr.message);
    process.exit(1);
  }
  console.log(`  ✓ ${articles.length} articles`);

  console.log('Seeding briefings...');
  const { error: briErr } = await supabase.from('briefings').upsert(briefings, {
    onConflict: 'slug',
  });
  if (briErr) {
    console.error('Briefings seed failed:', briErr.message);
    process.exit(1);
  }
  console.log(`  ✓ ${briefings.length} briefings`);

  console.log('Seeding courses...');
  const { error: courErr } = await supabase.from('courses').upsert(courses, {
    onConflict: 'slug',
  });
  if (courErr) {
    console.error('Courses seed failed:', courErr.message);
    process.exit(1);
  }
  console.log(`  ✓ ${courses.length} courses`);

  console.log('\nSeed complete.');
}

seed();
```

- [ ] **Step 3: Run the seed**

```bash
cd /c/Users/mesha/Desktop/Projects/blackmalejournal
npx tsx scripts/seed.ts
```

Expected output:
```
Seeding articles...
  ✓ 9 articles
Seeding briefings...
  ✓ 3 briefings
Seeding courses...
  ✓ 5 courses

Seed complete.
```

If you see `SUPABASE_SERVICE_ROLE_KEY is undefined`, verify `.env.local` contains the key.

---

### Task 9: Update BriefingPreview to Accept Props

**Files:**
- Modify: `src/components/home/BriefingPreview.tsx`

> The component currently owns its data (hardcoded placeholder). After this task,
> it becomes a pure presentation component — it receives a `Briefing | null` and
> renders it. Data fetching moves entirely to the page.

- [ ] **Step 1: Replace BriefingPreview with prop-driven version**

```typescript
// src/components/home/BriefingPreview.tsx
import Link from "next/link";
import { StarDivider } from "@/components/ui/StarDivider";
import { formatDate } from "@/lib/utils";
import type { Briefing } from "@/lib/supabase/types";

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
          <div className="mx-auto max-w-article border border-bmj-tan/20 p-8 md:p-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-bmj-tan">
              Issue #{String(briefing.issue_number).padStart(3, "0")}
              &nbsp;&nbsp;·&nbsp;&nbsp;
              {formatDate(briefing.published_at)}
            </p>

            <h3 className="font-display text-4xl leading-tight text-bmj-white md:text-5xl">
              {briefing.title}
            </h3>

            <div className="my-6 h-px w-16 bg-bmj-red" />

            {briefing.sections[0] && (
              <p className="font-body text-base leading-relaxed text-bmj-cream/80">
                {briefing.sections[0].body}
              </p>
            )}

            <Link
              href={`/briefings/${briefing.slug}`}
              className="mt-8 inline-block font-label text-sm uppercase tracking-widest text-bmj-red no-underline transition-opacity hover:opacity-75"
            >
              Read Full Briefing →
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-article border border-bmj-tan/20 p-8 text-center md:p-12">
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

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

---

### Task 10: Update FeaturedArticles to Accept Props

**Files:**
- Modify: `src/components/home/FeaturedArticles.tsx`

- [ ] **Step 1: Replace FeaturedArticles with prop-driven version**

```typescript
// src/components/home/FeaturedArticles.tsx
import { ArticleCard } from "@/components/content/ArticleCard";
import { StarDivider } from "@/components/ui/StarDivider";
import { calculateReadingTime } from "@/lib/utils";
import type { Article } from "@/lib/supabase/types";

interface FeaturedArticlesProps {
  articles: Article[];
}

export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  return (
    <section className="bg-bmj-black py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Featured
        </h2>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                title={article.title}
                slug={article.slug}
                lens={article.lens}
                excerpt={article.excerpt}
                readingTime={calculateReadingTime(article.body)}
                coverImage={article.cover_image ?? undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-center font-body text-base text-bmj-cream/50">
            Featured articles coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

---

### Task 11: Wire Up Home Page

**Files:**
- Modify: `src/app/(public)/page.tsx`

> The page becomes an `async` Server Component. It calls two query helpers in
> parallel with `Promise.all` to avoid waterfall fetches. Each query returns a
> safe empty value on Supabase error, so the page never hard-crashes.

- [ ] **Step 1: Update page.tsx**

```typescript
// src/app/(public)/page.tsx
import { HeroBanner } from "@/components/home/HeroBanner";
import { ThreeLenses } from "@/components/home/ThreeLenses";
import { BriefingPreview } from "@/components/home/BriefingPreview";
import { FeaturedArticles } from "@/components/home/FeaturedArticles";
import { RotatingQuote } from "@/components/home/RotatingQuote";
import { JoinCTA } from "@/components/home/JoinCTA";
import { getLatestBriefing, getFeaturedArticles } from "@/lib/supabase/queries";

export default async function HomePage() {
  const [briefing, articles] = await Promise.all([
    getLatestBriefing(),
    getFeaturedArticles(3),
  ]);

  return (
    <>
      <HeroBanner />
      <ThreeLenses />
      <BriefingPreview briefing={briefing} />
      <FeaturedArticles articles={articles} />
      <RotatingQuote />
      <JoinCTA />
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 3: Commit Chunk 3**

```bash
git add scripts/seed.ts src/components/home/BriefingPreview.tsx src/components/home/FeaturedArticles.tsx src/app/(public)/page.tsx
git commit -m "feat: seed database and wire home page to live Supabase queries"
```

---

## Chunk 4: Verification (Task 12)

### Task 12: Full Build Verification

- [ ] **Step 1: Confirm .env.local has required keys**

```bash
grep -q 'NEXT_PUBLIC_SUPABASE_URL' .env.local && echo "URL: OK" || echo "URL: MISSING"
grep -q 'NEXT_PUBLIC_SUPABASE_ANON_KEY' .env.local && echo "ANON KEY: OK" || echo "ANON KEY: MISSING"
```

Both should print `OK`. If either is missing, add it from your Supabase dashboard
(Project Settings → API).

- [ ] **Step 2: TypeScript strict check**

```bash
npx tsc --noEmit
```

Expected: Zero errors. If errors, fix before proceeding.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: Build completes with no errors. Warnings about image optimization or
metadata are acceptable. TypeScript errors are not.

- [ ] **Step 4: Dev server smoke test**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

Verify:
- [ ] Home page loads without a white screen or JavaScript error in the console
- [ ] Latest Briefing section shows Issue #003 "On the Weight of Visibility"
- [ ] Featured section shows 2 articles (the ones marked `featured: true`)
- [ ] Article cards display lens badge in correct color (amber for health, tan for philosophy, red for politics)
- [ ] "Read Full Briefing →" link points to `/briefings/weekend-briefing-003`
- [ ] Page renders correctly at 375px mobile width

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verify supabase data layer — build passing, home page live"
```

---

## Environment Variables Reference

Add these to `.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # seed script only — never expose client-side
```

For Vercel deployment, add the first two as environment variables in the Vercel
dashboard (Settings → Environment Variables). The service role key should only
ever be in local `.env.local` and server-side secret stores.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `createBrowserClient is not a function` | `@supabase/ssr` not installed | `npm install @supabase/ssr` |
| `cookies is not a function` | Importing from wrong package | Import `cookies` from `next/headers` |
| Seed error: `relation "articles" does not exist` | Schema not run yet | Run the schema SQL in Supabase SQL editor first |
| Seed error: `invalid api key` | Wrong key in `.env.local` | Use service role key, not anon key, for seed |
| Home page shows empty states after seed | RLS blocking reads | Check Supabase table policies — anon role needs SELECT on all tables |
| TypeScript error on `supabase.from('articles')` | `Database` type not threaded through | Ensure `createServerClient<Database>` and `createBrowserClient<Database>` |
