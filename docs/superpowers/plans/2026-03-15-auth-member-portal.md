# Authentication & Member Portal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the authentication system (login, signup, magic link) and member portal (dashboard, settings) with auth-aware navbar and content gating.

**Architecture:** Server Actions for all auth operations (signUp, signIn, signOut, updateProfile, updatePassword). Middleware handles session refresh + route protection. Root layout passes auth state to Navbar. PaywallGate receives `isLoggedIn` prop for contextual CTAs. Display names stored in Supabase Auth `user_metadata`, not the members table.

**Tech Stack:** Next.js 14 App Router, Supabase Auth (@supabase/ssr), Server Actions, TypeScript strict mode, Tailwind CSS with BMJ brand system.

---

## File Structure

### New Files (14)
| File | Responsibility |
|------|---------------|
| `src/middleware.ts` | Session refresh + portal route protection |
| `src/app/(auth)/actions.ts` | All auth Server Actions (login, signup, signOut, updateProfile, updatePassword, magicLink) |
| `src/app/(auth)/auth/callback/route.ts` | OAuth/magic-link code exchange |
| `src/app/(auth)/login/page.tsx` | Login page (server component, reads searchParams for errors/messages) |
| `src/app/(auth)/login/LoginForm.tsx` | Login form client component (password + magic link modes) |
| `src/app/(auth)/signup/page.tsx` | Signup page (server component, reads ?tier= and ?error=) |
| `src/app/(auth)/signup/SignupForm.tsx` | Signup form client component |
| `src/app/(auth)/portal/page.tsx` | Member dashboard (server component, protected) |
| `src/app/(auth)/portal/settings/page.tsx` | Member settings (server component, protected) |
| `src/app/(auth)/portal/settings/SettingsForm.tsx` | Profile edit + password change client component |
| `src/components/portal/TierBadge.tsx` | Tier indicator (FREE/BASIC/PREMIUM) |
| `src/components/layout/UserDropdown.tsx` | Auth dropdown for navbar (client component) |

### Modified Files (6)
| File | Change |
|------|--------|
| `src/lib/supabase/types.ts` | Allow `id` in members Insert type |
| `src/app/layout.tsx` | Fetch auth user, pass to Navbar |
| `src/components/layout/Navbar.tsx` | Accept `user` prop, show UserDropdown when logged in |
| `src/components/layout/MobileMenu.tsx` | Accept `user` prop, show Portal/Log Out when logged in |
| `src/components/content/PaywallGate.tsx` | Add `isLoggedIn` prop for contextual CTAs |
| `src/app/(public)/articles/[slug]/page.tsx` | Pass `isLoggedIn` to PaywallGate |

### Deleted Files (1)
| File | Reason |
|------|--------|
| `src/proxy.ts` | Superseded by `src/middleware.ts` (proxy was never active — no middleware.ts imported it) |

---

## Chunk 1: Foundation (Middleware + Types + Auth Callback)

### Task 1: Create middleware.ts

**Files:**
- Create: `src/middleware.ts`
- Delete: `src/proxy.ts`

This replaces the unused `proxy.ts` with a proper Next.js middleware that:
1. Refreshes Supabase auth tokens on every request
2. Redirects unauthenticated users away from `/portal/*`
3. Redirects authenticated users away from `/login` and `/signup`

- [ ] **Step 1: Create `src/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/portal'];
const AUTH_PAGES = ['/login', '/signup'];

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect portal routes — redirect to login
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (user && AUTH_PAGES.includes(pathname)) {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = '/portal';
    return NextResponse.redirect(portalUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 2: Delete `src/proxy.ts`**

```bash
git rm src/proxy.ts
```

- [ ] **Step 3: Verify no imports reference proxy.ts**

Run: `grep -r "proxy" src/ --include="*.ts" --include="*.tsx"`
Expected: No results (proxy.ts was never imported anywhere).

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Next.js middleware for session refresh and route protection"
```

---

### Task 2: Update Member Insert type

**Files:**
- Modify: `src/lib/supabase/types.ts:119`

The members Insert type currently omits `id`, but we need to set `id` to match the Supabase Auth user ID when creating a member row during signup.

- [ ] **Step 1: Update the members table type**

In `src/lib/supabase/types.ts`, change line 120 from:
```typescript
        Insert: Omit<Member, 'id' | 'created_at'>;
```
to:
```typescript
        Insert: Omit<Member, 'created_at'>;
```

This allows `id` to be provided during insert (linking to `auth.users.id`).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/types.ts
git commit -m "fix: allow id in members Insert type for auth user linking"
```

---

### Task 3: Create auth callback route

**Files:**
- Create: `src/app/(auth)/auth/callback/route.ts`

Handles the code exchange when users click magic links or email confirmation links. Supabase redirects here with a `?code=` parameter.

- [ ] **Step 1: Create the route handler**

```typescript
// src/app/(auth)/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/portal';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(auth)/auth/callback/route.ts
git commit -m "feat: add auth callback route for magic link and email confirmation"
```

---

## Chunk 2: Auth Server Actions + Login Page

### Task 4: Create auth Server Actions

**Files:**
- Create: `src/app/(auth)/actions.ts`

All auth mutations live in one file. Each action uses the server Supabase client, handles errors via redirect with query params, and calls `revalidatePath` to bust the layout cache (so the navbar updates).

- [ ] **Step 1: Create `src/app/(auth)/actions.ts`**

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect('/portal');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message));
  }

  // Create member row linked to auth user
  if (data.user) {
    await supabase.from('members').insert({
      id: data.user.id,
      email,
      tier: 'free' as const,
    });
  }

  revalidatePath('/', 'layout');
  redirect('/portal');
}

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: formData.get('email') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
    },
  });

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message));
  }

  redirect('/login?message=Check your email for the magic link');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const displayName = formData.get('displayName') as string;

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  if (error) {
    redirect('/portal/settings?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect('/portal/settings?message=Profile updated');
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect('/portal/settings?error=' + encodeURIComponent(error.message));
  }

  redirect('/portal/settings?message=Password updated');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(auth)/actions.ts
git commit -m "feat: add auth Server Actions (login, signup, signOut, updateProfile, updatePassword, magicLink)"
```

---

### Task 5: Create login page + LoginForm

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/LoginForm.tsx`

The login page is a server component that reads `searchParams` for error/message display. The form is a client component with two modes: password and magic link.

- [ ] **Step 1: Create `src/app/(auth)/login/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Log In',
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-display text-4xl text-bmj-white">LOG IN</h1>
          <p className="font-body text-sm text-bmj-tan">
            Welcome back to the movement.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
            <p className="font-body text-sm text-bmj-red">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
            <p className="font-body text-sm text-bmj-amber">{message}</p>
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/(auth)/login/LoginForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login, signInWithMagicLink } from '../actions';

export function LoginForm() {
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  return (
    <div className="border border-bmj-red/20 bg-bmj-brown p-8">
      {/* Mode toggle */}
      <div className="mb-6 flex gap-4 border-b border-bmj-tan/20 pb-4">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'password'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'magic'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Magic Link
        </button>
      </div>

      {mode === 'password' ? (
        <form action={login} className="space-y-4">
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
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Log In
          </button>
        </form>
      ) : (
        <form action={signInWithMagicLink} className="space-y-4">
          <div>
            <label
              htmlFor="magic-email"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Email
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Send Magic Link
          </button>
        </form>
      )}

      <p className="mt-6 text-center font-body text-sm text-bmj-tan">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-bmj-red hover:text-bmj-cream">
          Join the movement &rarr;
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/app/(auth)/login/
git commit -m "feat: add login page with password and magic link modes"
```

---

### Task 6: Create signup page + SignupForm

**Files:**
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/app/(auth)/signup/SignupForm.tsx`

- [ ] **Step 1: Create `src/app/(auth)/signup/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { SignupForm } from './SignupForm';

export const metadata: Metadata = {
  title: 'Join the Movement',
};

interface SignupPageProps {
  searchParams: Promise<{ error?: string; tier?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error, tier } = await searchParams;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-display text-4xl text-bmj-white">
            JOIN THE MOVEMENT
          </h1>
          <p className="font-body text-sm text-bmj-tan">
            Create your account. Access the archive.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
            <p className="font-body text-sm text-bmj-red">{error}</p>
          </div>
        )}

        <SignupForm preselectedTier={tier} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/(auth)/signup/SignupForm.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { signup } from '../actions';

interface SignupFormProps {
  preselectedTier?: string;
}

export function SignupForm({ preselectedTier }: SignupFormProps) {
  return (
    <div className="border border-bmj-red/20 bg-bmj-brown p-8">
      <form action={signup} className="space-y-4">
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

        {preselectedTier && preselectedTier !== 'free' && (
          <div className="border border-bmj-amber/30 bg-bmj-amber/10 p-3">
            <p className="font-label text-xs uppercase tracking-widest text-bmj-amber">
              Selected: {preselectedTier} plan
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
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/signup/
git commit -m "feat: add signup page with display name, email, password, and tier preselection"
```

---

## Chunk 3: Member Portal (Dashboard + Settings)

### Task 7: Create TierBadge component

**Files:**
- Create: `src/components/portal/TierBadge.tsx`

Visual tier indicator styled like a credential. FREE = tan, BASIC = amber, PREMIUM = red.

- [ ] **Step 1: Create `src/components/portal/TierBadge.tsx`**

```tsx
import type { MemberTier } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: MemberTier;
  className?: string;
}

const TIER_STYLES: Record<
  MemberTier,
  { bg: string; text: string; border: string; label: string }
> = {
  free: {
    bg: 'bg-bmj-tan/10',
    text: 'text-bmj-tan',
    border: 'border-bmj-tan/40',
    label: 'FREE',
  },
  basic: {
    bg: 'bg-bmj-amber/10',
    text: 'text-bmj-amber',
    border: 'border-bmj-amber/40',
    label: 'BASIC',
  },
  premium: {
    bg: 'bg-bmj-red/10',
    text: 'text-bmj-red',
    border: 'border-bmj-red/40',
    label: 'PREMIUM',
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const style = TIER_STYLES[tier];
  return (
    <span
      className={cn(
        'inline-block border px-4 py-1.5 font-label text-xs tracking-widest',
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portal/TierBadge.tsx
git commit -m "feat: add TierBadge component (free/basic/premium visual indicator)"
```

---

### Task 8: Create portal dashboard page

**Files:**
- Create: `src/app/(auth)/portal/page.tsx`

Protected server component. Shows welcome header, tier badge, member-since date, access list, upgrade CTA (non-premium), latest articles, and quick links. Middleware handles the redirect if unauthenticated, but we add a server-side check as defense-in-depth.

- [ ] **Step 1: Create `src/app/(auth)/portal/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMemberById, getLatestArticles } from '@/lib/supabase/queries';
import { TierBadge } from '@/components/portal/TierBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { formatDate } from '@/lib/utils';
import type { MemberTier } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Member Portal',
};

const TIER_ACCESS: Record<MemberTier, string[]> = {
  free: [
    'Public articles',
    'Briefing previews',
    'Video gallery',
    'Academy',
  ],
  basic: [
    'Everything in Free',
    'Full briefing archive',
    'Select handbooks',
    'Member forum',
  ],
  premium: [
    'Everything in Basic',
    'All handbooks',
    'Downloads',
    'Private content',
    'Early access',
  ],
};

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const member = await getMemberById(user.id);
  const tier: MemberTier = member?.tier ?? 'free';
  const displayName =
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'Member';
  const memberSince = member?.created_at ?? user.created_at ?? '';

  const latestArticles = await getLatestArticles(5);

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-10">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Member Portal
        </p>
        <h1 className="mb-4 font-display text-4xl text-bmj-white sm:text-5xl">
          WELCOME BACK, {displayName.toUpperCase()}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <TierBadge tier={tier} />
          {memberSince && (
            <span className="font-mono text-xs text-bmj-tan">
              Member since {formatDate(memberSince)}
            </span>
          )}
        </div>
      </div>

      <StarDivider />

      {/* Your Access */}
      <section className="py-10">
        <h2 className="mb-6 font-display text-2xl text-bmj-white">
          YOUR ACCESS
        </h2>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-6">
          <ul className="space-y-2">
            {TIER_ACCESS[tier].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="text-bmj-red" aria-hidden="true">
                  ★
                </span>
                <span className="font-body text-sm text-bmj-cream">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Upgrade CTA */}
      {tier !== 'premium' && (
        <section className="mb-10 border border-bmj-red/30 bg-bmj-red/5 p-8 text-center">
          <h2 className="mb-2 font-display text-2xl text-bmj-white">
            UNLOCK MORE
          </h2>
          <p className="mb-4 font-body text-sm text-bmj-cream/70">
            {tier === 'free'
              ? 'Upgrade to Basic or Premium to access the full archive.'
              : 'Upgrade to Premium for complete access to everything.'}
          </p>
          <Link
            href="/signup?tier=premium"
            className="inline-block bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Upgrade Now
          </Link>
        </section>
      )}

      {/* Latest content */}
      <section className="py-10">
        <h2 className="mb-6 font-display text-2xl text-bmj-white">
          LATEST FOR YOU
        </h2>
        <div className="space-y-4">
          {latestArticles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="block border-l-4 border-bmj-red bg-bmj-brown p-4 no-underline transition-colors hover:bg-bmj-brown/80"
            >
              <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                {article.lens}
              </p>
              <h3 className="font-display text-xl text-bmj-white">
                {article.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-bmj-tan/60">
                {formatDate(article.published_at)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <StarDivider />

      {/* Quick links */}
      <div className="flex flex-wrap gap-4 py-10">
        <Link
          href="/portal/settings"
          className="border border-bmj-tan/30 px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Settings
        </Link>
        <Link
          href="/briefings"
          className="border border-bmj-tan/30 px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Briefings
        </Link>
        <Link
          href="/academy"
          className="border border-bmj-tan/30 px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Academy
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(auth)/portal/page.tsx
git commit -m "feat: add member portal dashboard with tier access, latest content, and upgrade CTA"
```

---

### Task 9: Create portal settings page + SettingsForm

**Files:**
- Create: `src/app/(auth)/portal/settings/page.tsx`
- Create: `src/app/(auth)/portal/settings/SettingsForm.tsx`

- [ ] **Step 1: Create `src/app/(auth)/portal/settings/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import { TierBadge } from '@/components/portal/TierBadge';
import { SettingsForm } from './SettingsForm';
import { signOut } from '../../actions';

export const metadata: Metadata = {
  title: 'Settings',
};

interface SettingsPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const { error, message } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const member = await getMemberById(user.id);
  const tier = member?.tier ?? 'free';
  const displayName = (user.user_metadata?.display_name as string) || '';

  return (
    <div className="mx-auto max-w-article px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/portal"
        className="mb-6 inline-block font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; Back to Portal
      </Link>

      <h1 className="mb-8 font-display text-4xl text-bmj-white">SETTINGS</h1>

      {error && (
        <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-body text-sm text-bmj-red">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
          <p className="font-body text-sm text-bmj-amber">{message}</p>
        </div>
      )}

      {/* Profile */}
      <section className="mb-10 border border-bmj-tan/20 bg-bmj-brown p-8">
        <h2 className="mb-6 font-display text-2xl text-bmj-white">PROFILE</h2>
        <SettingsForm displayName={displayName} email={user.email ?? ''} />
      </section>

      {/* Subscription */}
      <section className="mb-10 border border-bmj-tan/20 bg-bmj-brown p-8">
        <h2 className="mb-4 font-display text-2xl text-bmj-white">
          SUBSCRIPTION
        </h2>
        <div className="flex items-center gap-4">
          <TierBadge tier={tier} />
          <span className="font-body text-sm text-bmj-cream/70">
            Current plan
          </span>
        </div>
        {tier !== 'premium' && (
          <Link
            href="/signup?tier=premium"
            className="mt-4 inline-block bg-bmj-red px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90"
          >
            Upgrade
          </Link>
        )}
      </section>

      {/* Log Out */}
      <section className="border border-bmj-tan/20 bg-bmj-brown p-8">
        <h2 className="mb-4 font-display text-2xl text-bmj-white">SESSION</h2>
        <form action={signOut}>
          <button
            type="submit"
            className="border border-bmj-red/40 px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-red transition-colors hover:bg-bmj-red hover:text-bmj-white"
          >
            Log Out
          </button>
        </form>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/(auth)/portal/settings/SettingsForm.tsx`**

```tsx
'use client';

import { updateProfile, updatePassword } from '../../actions';

interface SettingsFormProps {
  displayName: string;
  email: string;
}

export function SettingsForm({ displayName, email }: SettingsFormProps) {
  return (
    <div className="space-y-8">
      {/* Profile form */}
      <form action={updateProfile} className="space-y-4">
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
            defaultValue={displayName}
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
          />
        </div>

        <div>
          <p className="mb-1 font-label text-xs uppercase tracking-widest text-bmj-tan">
            Email
          </p>
          <p className="font-body text-sm text-bmj-cream/70">{email}</p>
        </div>

        <button
          type="submit"
          className="bg-bmj-red px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          Save Changes
        </button>
      </form>

      <div className="border-t border-bmj-tan/20" />

      {/* Password form */}
      <form action={updatePassword} className="space-y-4">
        <h3 className="font-display text-xl text-bmj-white">
          CHANGE PASSWORD
        </h3>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
          >
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="border border-bmj-tan/30 px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/app/(auth)/portal/settings/ src/components/portal/
git commit -m "feat: add portal settings page with profile edit, password change, and logout"
```

---

## Chunk 4: Auth-Aware Navbar + MobileMenu

### Task 10: Create UserDropdown component

**Files:**
- Create: `src/components/layout/UserDropdown.tsx`

Client component. Shows user initial in a circle, dropdown with Portal/Settings/Log Out links.

- [ ] **Step 1: Create `src/components/layout/UserDropdown.tsx`**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/(auth)/actions';

interface UserDropdownProps {
  email: string;
  displayName?: string;
}

export function UserDropdown({ email, displayName }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initial = (displayName?.[0] || email[0] || '?').toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex h-9 w-9 items-center justify-center bg-bmj-red font-label text-sm text-bmj-white transition-opacity hover:opacity-90"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 border border-bmj-tan/20 bg-bmj-brown shadow-lg">
          <div className="border-b border-bmj-tan/20 px-4 py-3">
            <p className="truncate font-label text-xs uppercase tracking-widest text-bmj-tan">
              {displayName || email}
            </p>
          </div>

          <nav className="py-1">
            <Link
              href="/portal"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-body text-sm text-bmj-cream no-underline transition-colors hover:bg-bmj-black/50 hover:text-bmj-white"
            >
              Portal
            </Link>
            <Link
              href="/portal/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-body text-sm text-bmj-cream no-underline transition-colors hover:bg-bmj-black/50 hover:text-bmj-white"
            >
              Settings
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full px-4 py-2 text-left font-body text-sm text-bmj-red transition-colors hover:bg-bmj-black/50"
              >
                Log Out
              </button>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/UserDropdown.tsx
git commit -m "feat: add UserDropdown component for auth-aware navbar"
```

---

### Task 11: Update Navbar for auth state

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

Add a `user` prop. When logged in, replace the "Join" button with `<UserDropdown>`. When not logged in, show "Join" and "Log In" buttons.

- [ ] **Step 1: Update `src/components/layout/Navbar.tsx`**

Replace the entire file with:

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { UserDropdown } from './UserDropdown';

export type NavUser = {
  email: string;
  displayName?: string;
} | null;

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academy', href: '/academy' },
  { label: 'Resources', href: '/resources' },
  { label: 'Video', href: '/video' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

interface NavbarProps {
  user?: NavUser;
}

export function Navbar({ user = null }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`accent-border-bottom sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-bmj-black/95 backdrop-blur-sm'
            : 'bg-bmj-black'
        }`}
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          {/* Logo / Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 no-underline"
            aria-label="The Black Male Journal — Home"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M16 0L19.6 11.6H32L21.8 18.4L25.4 30L16 23.2L6.6 30L10.2 18.4L0 11.6H12.4L16 0Z"
                fill="var(--bmj-red)"
              />
            </svg>
            <span className="font-display text-xl tracking-wider text-bmj-white">
              The Black Male Journal
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`font-label text-xs uppercase tracking-widest transition-colors no-underline ${
                        isActive
                          ? 'border-b-2 border-bmj-red text-bmj-white pb-0.5'
                          : 'text-bmj-cream hover:text-bmj-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right side — auth-aware */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden sm:block">
                <UserDropdown
                  email={user.email}
                  displayName={user.displayName}
                />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:text-bmj-white sm:block"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="hidden bg-bmj-red px-5 py-2 font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90 sm:block"
                >
                  Join
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="text-bmj-cream transition-opacity hover:opacity-70 lg:hidden"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: make Navbar auth-aware — show user dropdown when logged in, join/login when not"
```

---

### Task 12: Update MobileMenu for auth state

**Files:**
- Modify: `src/components/layout/MobileMenu.tsx`

Add `user` prop. When logged in, show Portal and Log Out links instead of "Join" CTA.

- [ ] **Step 1: Update `src/components/layout/MobileMenu.tsx`**

Replace the entire file with:

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';
import type { NavUser } from './Navbar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: NavUser;
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academy', href: '/academy' },
  { label: 'Resources', href: '/resources' },
  { label: 'Video', href: '/video' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const SOCIAL_LINKS = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter / X' },
];

export function MobileMenu({ isOpen, onClose, user = null }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.nav
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-bmj-black px-8 py-6"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="mb-10 self-end text-bmj-cream transition-opacity hover:opacity-70"
            >
              <X size={28} aria-hidden="true" />
            </button>

            {/* Nav links */}
            <ul className="flex flex-1 flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="font-display text-5xl uppercase tracking-wide text-bmj-white transition-colors hover:text-bmj-red"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <li>
                  <Link
                    href="/portal"
                    onClick={onClose}
                    className="font-display text-5xl uppercase tracking-wide text-bmj-amber transition-colors hover:text-bmj-red"
                  >
                    Portal
                  </Link>
                </li>
              )}
            </ul>

            {/* Auth CTA */}
            {user ? (
              <form action={signOut} className="mb-8">
                <button
                  type="submit"
                  className="block w-full border border-bmj-red py-3 text-center font-label text-sm uppercase tracking-widest text-bmj-red transition-colors hover:bg-bmj-red hover:text-bmj-white"
                >
                  Log Out
                </button>
              </form>
            ) : (
              <div className="mb-8 flex flex-col gap-3">
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="block bg-bmj-red py-3 text-center font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
                >
                  Join
                </Link>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block border border-bmj-tan/30 py-3 text-center font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
                >
                  Log In
                </Link>
              </div>
            )}

            {/* Socials */}
            <div className="flex gap-6 pb-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-bmj-tan transition-colors hover:text-bmj-cream"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={20} aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/MobileMenu.tsx
git commit -m "feat: make MobileMenu auth-aware — show Portal link and Log Out when logged in"
```

---

### Task 13: Update root layout to pass auth state to Navbar

**Files:**
- Modify: `src/app/layout.tsx`

Fetch the current auth user in the root layout (server component) and pass a simplified user object to `<Navbar>`.

- [ ] **Step 1: Update `src/app/layout.tsx`**

Add the Supabase import and user fetch. The full updated file:

```tsx
import type { Metadata } from 'next';
import {
  Bebas_Neue,
  Libre_Baskerville,
  Oswald,
  IBM_Plex_Mono,
} from 'next/font/google';
import '@/styles/globals.css';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
});

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-libre-baskerville',
  display: 'swap',
});

const oswald = Oswald({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'The Black Male Journal',
    template: '%s | The Black Male Journal',
  },
  description:
    'Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navUser = user
    ? {
        email: user.email ?? '',
        displayName: user.user_metadata?.display_name as string | undefined,
      }
    : null;

  const fontVars = [
    bebasNeue.variable,
    libreBaskerville.variable,
    oswald.variable,
    ibmPlexMono.variable,
  ].join(' ');

  return (
    <html lang="en" className={fontVars}>
      <body className="grain flex min-h-screen flex-col bg-bmj-black text-bmj-cream">
        <Navbar user={navUser} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: pass auth user to Navbar from root layout for auth-aware navigation"
```

---

## Chunk 5: Auth-Aware Content Gating + Build Verification

### Task 14: Update PaywallGate for contextual CTAs

**Files:**
- Modify: `src/components/content/PaywallGate.tsx`
- Modify: `src/app/(public)/articles/[slug]/page.tsx`

Add `isLoggedIn` prop to PaywallGate so it shows "Upgrade" for logged-in users with insufficient tier, or "Log in / Sign up" for anonymous visitors. The auth check stays in the page component (body never leaks into RSC payload).

- [ ] **Step 1: Update `src/components/content/PaywallGate.tsx`**

```tsx
import Link from 'next/link';
import type { AccessTier } from '@/lib/supabase/types';

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
      {/* Preview text */}
      <div className="relative">
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          {previewBody}
          <span aria-hidden="true">&hellip;</span>
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

- [ ] **Step 2: Update `src/app/(public)/articles/[slug]/page.tsx`**

Pass `isLoggedIn` to PaywallGate. Find the line:
```tsx
          <PaywallGate requiredTier={article.access_tier} previewBody={previewBody} />
```
Replace with:
```tsx
          <PaywallGate
            requiredTier={article.access_tier}
            previewBody={previewBody}
            isLoggedIn={!!user}
          />
```

Where `user` is already available from the existing auth check (line 55 in the current file). If the variable needs to be hoisted, move the `user` declaration before the `hasAccess` block. The existing code already destructures `user` at line 55:
```tsx
    const { data: { user } } = await supabase.auth.getUser();
```

But `user` is scoped inside the `if (!isFree)` block. We need to hoist it. Change the access check section to:

```tsx
  // Access check
  const TIER_RANK: Record<string, number> = { free: 0, basic: 1, premium: 2 };
  const isFree = article.access_tier === 'free';
  let hasAccess = isFree;
  let user = null;

  if (!isFree) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
    if (user) {
      const member = await getMemberById(user.id);
      if (member) {
        hasAccess = TIER_RANK[member.tier] >= TIER_RANK[article.access_tier];
      }
    }
  }
```

Then in JSX:
```tsx
          <PaywallGate
            requiredTier={article.access_tier}
            previewBody={previewBody}
            isLoggedIn={!!user}
          />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/content/PaywallGate.tsx src/app/(public)/articles/[slug]/page.tsx
git commit -m "feat: make PaywallGate auth-aware — contextual CTAs for logged-in vs anonymous users"
```

---

### Task 15: Build verification

- [ ] **Step 1: Run TypeScript type check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors. All new routes appear in the output:
- `/(auth)/login` — static or dynamic
- `/(auth)/signup` — static or dynamic
- `/(auth)/portal` — dynamic (reads auth session)
- `/(auth)/portal/settings` — dynamic (reads auth session)
- `/(auth)/auth/callback` — route handler

- [ ] **Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "chore: fix build errors from auth implementation"
```

---

## Summary of Changes

| Category | Files | Purpose |
|----------|-------|---------|
| Middleware | 1 new, 1 deleted | Session refresh + route protection |
| Auth Actions | 1 new | 6 server actions for all auth operations |
| Auth Callback | 1 new | Magic link / email confirmation code exchange |
| Login | 2 new | Login page + form (password & magic link modes) |
| Signup | 2 new | Signup page + form (with tier preselection) |
| Portal | 2 new | Dashboard + settings pages |
| Components | 3 new | TierBadge, UserDropdown, SettingsForm |
| Modified | 5 | Layout, Navbar, MobileMenu, PaywallGate, article page |
| **Total** | **12 new, 1 deleted, 5 modified** | |
