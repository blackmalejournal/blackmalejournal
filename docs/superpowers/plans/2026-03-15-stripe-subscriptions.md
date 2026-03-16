# Stripe Subscription System — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build end-to-end Stripe subscription payments — checkout, webhook processing, billing management, and pricing UI — so members can subscribe to Basic and Premium tiers.

**Architecture:** Stripe Checkout (hosted) for payment collection, Stripe Billing Portal for subscription management. Webhooks update the `members` table in Supabase via a service-role client that bypasses RLS. Pricing lives as a public page; subscription management lives in the member portal.

**Tech Stack:** Stripe SDK (`stripe`), Next.js API routes (App Router), Supabase service-role client, Tailwind CSS (brand system)

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/lib/stripe/config.ts` | Stripe instance, tier-to-price mapping, `getTierFromPriceId()` |
| `src/lib/stripe/helpers.ts` | `createCheckoutSession()`, `createBillingPortalSession()` |
| `src/lib/supabase/admin.ts` | Service-role Supabase client (bypasses RLS for webhooks) |
| `src/app/api/stripe/checkout/route.ts` | POST — create Stripe Checkout session, return URL |
| `src/app/api/stripe/webhook/route.ts` | POST — verify signature, handle subscription events |
| `src/app/api/stripe/manage-billing/route.ts` | POST — create Stripe Billing Portal session, return URL |
| `src/app/(public)/pricing/page.tsx` | Pricing page with tier comparison + subscribe buttons |
| `src/components/portal/CheckoutButton.tsx` | Client component: "Subscribe" button that POSTs to checkout API |
| `src/components/portal/SubscriptionManager.tsx` | Client component: shows plan, manage billing, upgrade |
| `src/app/(auth)/portal/page.tsx` | **Modify:** Add checkout success/cancel messages, update upgrade CTA |
| `src/app/(auth)/portal/settings/page.tsx` | **Modify:** Replace static subscription section with SubscriptionManager |
| `src/components/layout/Navbar.tsx` | **Modify:** Add "Pricing" nav link |
| `src/components/layout/MobileMenu.tsx` | **Modify:** Add "Pricing" nav link (mirrors Navbar) |

**Pre-existing files referenced (read-only context):**

| File | What it provides |
|------|-----------------|
| `src/lib/supabase/server.ts` | Cookie-based server client (for auth routes, NOT webhooks) |
| `src/lib/supabase/queries.ts:180-203` | `updateMemberTier(userId, tier, stripeData?)` — already handles Stripe fields |
| `src/lib/supabase/types.ts:49-56` | `Member` type with `stripe_customer_id` and `stripe_subscription_id` |
| `src/components/portal/TierBadge.tsx` | Tier badge component (free/basic/premium styling) |
| `src/middleware.ts` | Protects `/portal` routes — requires auth |
| `supabase/migrations/20260315000000_initial_schema.sql:74-81` | Members table schema with Stripe columns |

---

## Chunk 1: Foundation — Dependencies, Config, Admin Client (Tasks 1-5)

### Task 1: Install Stripe SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the Stripe Node.js SDK**

```bash
npm install stripe
```

- [ ] **Step 2: Verify installation**

```bash
npx tsc --noEmit
```

Expected: No new errors. `stripe` is now available for import.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install stripe SDK"
```

---

### Task 2: Add environment variables

**Files:**
- Modify: `.env.local` (local only, never committed)

- [ ] **Step 1: Add Stripe keys to `.env.local`**

Add these lines to the existing `.env.local` file:

Add these Stripe-related env vars (replace placeholders with real values from the Stripe dashboard):

- `STRIPE_SECRET_KEY` — Dashboard > Developers > API keys (secret key)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Dashboard > Developers > API keys (publishable key)
- `STRIPE_WEBHOOK_SECRET` — Will be set after running `stripe listen` in Task 8; leave blank for now
- `STRIPE_BASIC_PRICE_ID` — Dashboard > Products > Pricing > copy price ID for Basic tier
- `STRIPE_PREMIUM_PRICE_ID` — Dashboard > Products > Pricing > copy price ID for Premium tier
- `NEXT_PUBLIC_SITE_URL` — Set to `http://localhost:3000` for local dev

Also verify that `SUPABASE_SERVICE_ROLE_KEY` is already present from the auth setup (needed by the webhook handler in Task 7).

- [ ] **Step 2: Verify env vars load**

No build step needed. These are consumed at runtime. Proceed.

---

### Task 3: Stripe configuration module

**Files:**
- Create: `src/lib/stripe/config.ts`

- [ ] **Step 1: Create `src/lib/stripe/config.ts`**

```typescript
import Stripe from 'stripe';
import type { MemberTier } from '@/lib/supabase/types';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Map tier names to Stripe Price IDs (set in .env.local).
// Fail fast if missing — a silent placeholder would cause confusing Stripe 400 errors.
const TIER_PRICES: Record<Exclude<MemberTier, 'free'>, string> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID!,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
};

export function getPriceIdForTier(tier: 'basic' | 'premium'): string {
  return TIER_PRICES[tier];
}

export function getTierFromPriceId(priceId: string): 'basic' | 'premium' | null {
  for (const [tier, id] of Object.entries(TIER_PRICES)) {
    if (id === priceId) return tier as 'basic' | 'premium';
  }
  return null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS — no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/stripe/config.ts
git commit -m "feat: add Stripe config with tier-to-price mapping"
```

---

### Task 4: Supabase admin client (service role)

**Files:**
- Create: `src/lib/supabase/admin.ts`

**Why this exists:** The existing `server.ts` client uses cookies and the anon key — it respects RLS (row-level security). The webhook handler runs without a user session, so it needs the service role key to update the `members` table directly. The members table RLS only allows authenticated users to update their own row (`auth.uid() = id`). Webhooks have no `auth.uid()`.

- [ ] **Step 1: Create `src/lib/supabase/admin.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

// Service-role client — bypasses RLS. Use ONLY in trusted server contexts
// (webhooks, admin operations). Never expose to the browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/admin.ts
git commit -m "feat: add Supabase admin client for service-role operations"
```

---

### Task 5: Stripe helper functions

**Files:**
- Create: `src/lib/stripe/helpers.ts`

- [ ] **Step 1: Create `src/lib/stripe/helpers.ts`**

```typescript
import { stripe, getPriceIdForTier } from '@/lib/stripe/config';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: 'basic' | 'premium',
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: userEmail,
    line_items: [
      {
        price: getPriceIdForTier(tier),
        quantity: 1,
      },
    ],
    metadata: { userId, tier },
    success_url: `${siteUrl}/portal?checkout=success`,
    cancel_url: `${siteUrl}/portal?checkout=cancelled`,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return session.url;
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${siteUrl}/portal/settings`,
  });

  return session.url;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/stripe/helpers.ts
git commit -m "feat: add Stripe checkout and billing portal helpers"
```

---

## Chunk 2: API Routes — Checkout + Webhook (Tasks 6-8)

### Task 6: Checkout API route

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Create the checkout route**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/helpers';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: { tier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const tier = body.tier;

  if (tier !== 'basic' && tier !== 'premium') {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  try {
    const url = await createCheckoutSession(user.id, user.email, tier);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/checkout/route.ts
git commit -m "feat: add Stripe checkout API route"
```

---

### Task 7: Webhook handler

**Files:**
- Create: `src/app/api/stripe/webhook/route.ts`

**Critical context:** This route receives raw request bodies from Stripe. Next.js App Router API routes must read the raw body via `request.text()` for signature verification — do NOT use `request.json()`. The `createAdminClient()` from `src/lib/supabase/admin.ts` bypasses RLS so the webhook can update any member row.

- [ ] **Step 1: Create the webhook route**

```typescript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, getTierFromPriceId } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as 'basic' | 'premium' | undefined;

        if (!userId || !tier) {
          console.error('[webhook] Missing metadata on checkout session');
          break;
        }

        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        await supabase
          .from('members')
          .update({
            tier,
            stripe_customer_id: customerId ?? null,
            stripe_subscription_id: subscriptionId ?? null,
          })
          .eq('id', userId);

        console.log(`[webhook] checkout.session.completed: user=${userId} tier=${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        // Only upgrade tier for active subscriptions. If the subscription
        // moved to past_due/unpaid/incomplete, don't change the tier here —
        // let subscription.deleted handle the downgrade if it comes to that.
        if (subscription.status !== 'active') {
          console.log(`[webhook] subscription.updated: customer=${customerId} status=${subscription.status} — skipping tier change`);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const newTier = priceId ? getTierFromPriceId(priceId) : null;

        if (!newTier) {
          console.warn('[webhook] subscription.updated: unknown price ID', priceId);
          break;
        }

        await supabase
          .from('members')
          .update({ tier: newTier })
          .eq('stripe_customer_id', customerId);

        console.log(`[webhook] subscription.updated: customer=${customerId} tier=${newTier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        await supabase
          .from('members')
          .update({
            tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId);

        console.log(`[webhook] subscription.deleted: customer=${customerId} downgraded to free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          `[webhook] payment_failed: customer=${
            typeof invoice.customer === 'string'
              ? invoice.customer
              : invoice.customer?.id
          }`,
        );
        // Out of scope for v1. Future: send warning email or flag account.
        break;
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts
git commit -m "feat: add Stripe webhook handler for subscription events"
```

---

### Task 8: Test webhook locally with Stripe CLI

- [ ] **Step 1: Install Stripe CLI (if not installed)**

Download from https://stripe.com/docs/stripe-cli or use:

```bash
# Windows (scoop)
scoop install stripe

# Or download the binary from Stripe docs
```

- [ ] **Step 2: Log in to Stripe**

```bash
stripe login
```

- [ ] **Step 3: Forward webhooks to local dev server**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret (`whsec_...`) it prints and paste it into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

- [ ] **Step 4: Start the dev server**

In a separate terminal:

```bash
npm run dev
```

- [ ] **Step 5: Trigger a test event (connectivity check)**

```bash
stripe trigger checkout.session.completed
```

Expected: Terminal running `stripe listen` shows the event forwarded. Dev server logs `[webhook] Missing metadata on checkout session` — this is correct because synthetic `stripe trigger` events don't include our custom metadata (userId, tier). This step validates:
- Webhook URL is reachable
- Stripe signature verification works
- Event parsing succeeds

**Full end-to-end testing** requires completing Chunk 3 (UI), then: log in as a test user > visit `/pricing` > click Subscribe > complete Stripe test checkout with card `4242 4242 4242 4242` > verify webhook log shows correct userId/tier > confirm members table updated in Supabase.

---

## Chunk 3: UI — Pricing Page, Subscription Manager, Portal Updates (Tasks 9-15)

### Task 9: Pricing page

**Files:**
- Create: `src/app/(public)/pricing/page.tsx`

**Design notes:** Two tier cards side-by-side. Brand colors: amber border for Basic, red border for Premium. Bebas Neue headers, Libre Baskerville body. No rounded corners > 4px. Propaganda poster energy. Feature comparison as a checklist with star bullets.

- [ ] **Step 1: Create `src/components/portal/CheckoutButton.tsx`**

The pricing page needs a client component to POST to the checkout API and redirect. Create this first:

```tsx
'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  tier: 'basic' | 'premium';
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({ tier, className, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned:', data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? 'Redirecting...' : children}
    </button>
  );
}
```

- [ ] **Step 2: Create `src/app/(public)/pricing/page.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import { CheckoutButton } from '@/components/portal/CheckoutButton';
import { StarDivider } from '@/components/ui/StarDivider';
import type { MemberTier } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Pricing',
};

const TIERS = [
  {
    name: 'BASIC' as const,
    tier: 'basic' as const,
    price: '$9',
    interval: '/month',
    description: 'Full access to the archive and community.',
    features: [
      'Everything in Free',
      'Full Weekend Briefing archive',
      'Select handbooks',
      'Member forum access',
    ],
    border: 'border-bmj-amber',
    accent: 'text-bmj-amber',
    buttonBg: 'bg-bmj-amber',
  },
  {
    name: 'PREMIUM' as const,
    tier: 'premium' as const,
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
    border: 'border-bmj-red',
    accent: 'text-bmj-red',
    buttonBg: 'bg-bmj-red',
  },
] as const;

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier: MemberTier = 'free';
  if (user) {
    const member = await getMemberById(user.id);
    currentTier = member?.tier ?? 'free';
  }

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Membership
        </p>
        <h1 className="mb-4 font-display text-5xl text-bmj-white sm:text-6xl">
          JOIN THE MOVEMENT
        </h1>
        <p className="mx-auto max-w-xl font-body text-sm leading-relaxed text-bmj-cream/70">
          Free members get public articles, briefing previews, the video gallery, and
          the academy. Upgrade for the full experience.
        </p>
      </div>

      <StarDivider />

      <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2">
        {TIERS.map((t) => {
          const isCurrent = currentTier === t.tier;
          return (
            <div
              key={t.tier}
              className={`border ${t.border} bg-bmj-brown p-8 ${
                isCurrent ? 'ring-2 ring-bmj-white/20' : ''
              }`}
            >
              <h2 className={`mb-1 font-display text-3xl ${t.accent}`}>
                {t.name}
              </h2>
              <div className="mb-4 flex items-baseline gap-1">
                <span className="font-display text-4xl text-bmj-white">
                  {t.price}
                </span>
                <span className="font-mono text-xs text-bmj-tan">
                  {t.interval}
                </span>
              </div>
              <p className="mb-6 font-body text-sm text-bmj-cream/70">
                {t.description}
              </p>
              <ul className="mb-8 space-y-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 text-bmj-red" aria-hidden="true">
                      ★
                    </span>
                    <span className="font-body text-sm text-bmj-cream">{f}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="inline-block w-full border border-bmj-tan/30 px-6 py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-tan">
                  Current Plan
                </span>
              ) : currentTier === 'premium' ? (
                <span className="inline-block w-full border border-bmj-tan/20 px-6 py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-tan/40">
                  Included in Premium
                </span>
              ) : user ? (
                <CheckoutButton
                  tier={t.tier}
                  className={`w-full ${t.buttonBg} px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50`}
                >
                  Subscribe
                </CheckoutButton>
              ) : (
                <Link
                  href={`/signup?tier=${t.tier}`}
                  className={`block w-full ${t.buttonBg} px-6 py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90`}
                >
                  Get Started
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/pricing/page.tsx src/components/portal/CheckoutButton.tsx
git commit -m "feat: add pricing page with tier comparison and checkout buttons"
```

---

### Task 10: Billing portal API route

**Files:**
- Create: `src/app/api/stripe/manage-billing/route.ts`

**Build this BEFORE Task 11** — the SubscriptionManager component calls this endpoint.

- [ ] **Step 1: Create the billing portal route**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import { createBillingPortalSession } from '@/lib/stripe/helpers';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const member = await getMemberById(user.id);

  if (!member?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
  }

  try {
    const url = await createBillingPortalSession(member.stripe_customer_id);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[manage-billing]', err);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/manage-billing/route.ts
git commit -m "feat: add Stripe billing portal API route"
```

---

### Task 11: Subscription Manager component

**Files:**
- Create: `src/components/portal/SubscriptionManager.tsx`

**Note:** This component calls `/api/stripe/manage-billing` (created in Task 10). The billing portal route looks up the Stripe customer ID server-side via the authenticated user — the client does not send it.

- [ ] **Step 1: Create `src/components/portal/SubscriptionManager.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { MemberTier } from '@/lib/supabase/types';
import { TierBadge } from '@/components/portal/TierBadge';

interface SubscriptionManagerProps {
  tier: MemberTier;
  hasSubscription: boolean;
}

export function SubscriptionManager({
  tier,
  hasSubscription,
}: SubscriptionManagerProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

  async function handleManageBilling() {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/manage-billing', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Billing portal error:', err);
    } finally {
      setLoadingPortal(false);
    }
  }

  async function handleUpgrade() {
    setLoadingUpgrade(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'premium' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Upgrade error:', err);
    } finally {
      setLoadingUpgrade(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <TierBadge tier={tier} />
        <span className="font-body text-sm text-bmj-cream/70">Current plan</span>
      </div>

      {hasSubscription && (
        <p className="mt-2 font-mono text-xs text-bmj-tan/60">
          Subscription active
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {tier === 'basic' && (
          <button
            onClick={handleUpgrade}
            disabled={loadingUpgrade}
            className="bg-bmj-red px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loadingUpgrade ? 'Redirecting...' : 'Upgrade to Premium'}
          </button>
        )}

        {tier === 'free' && (
          <a
            href="/pricing"
            className="bg-bmj-red px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90"
          >
            View Plans
          </a>
        )}

        {hasSubscription && (
          <button
            onClick={handleManageBilling}
            disabled={loadingPortal}
            className="border border-bmj-tan/30 px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white disabled:opacity-50"
          >
            {loadingPortal ? 'Loading...' : 'Manage Billing'}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/portal/SubscriptionManager.tsx
git commit -m "feat: add SubscriptionManager component for billing and upgrades"
```

---

### Task 12: Update portal page with checkout feedback

**Files:**
- Modify: `src/app/(auth)/portal/page.tsx`

Add success/cancel banners based on `?checkout=success` or `?checkout=cancelled` query params. Update the "Upgrade Now" link to point to `/pricing` instead of `/signup?tier=premium`.

- [ ] **Step 1: Update `src/app/(auth)/portal/page.tsx`**

Add `searchParams` prop and checkout feedback banner. Changes:

1. Add `searchParams` to the component props
2. Add success/cancel banner below the welcome section
3. Change upgrade link from `/signup?tier=premium` to `/pricing`

In the component signature, change:

```tsx
// OLD
export default async function PortalPage() {
```

to:

```tsx
// NEW
interface PortalPageProps {
  searchParams: Promise<{ checkout?: string }>;
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const params = await searchParams;
```

After the welcome `</div>` (after line 73, before `<StarDivider />`), insert:

```tsx
      {params.checkout === 'success' && (
        <div className="mb-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
          <p className="font-body text-sm text-bmj-amber">
            Welcome aboard. Your subscription is active.
          </p>
        </div>
      )}

      {params.checkout === 'cancelled' && (
        <div className="mb-6 border border-bmj-tan/30 bg-bmj-tan/5 p-4">
          <p className="font-body text-sm text-bmj-tan">
            Checkout was cancelled. No charges were made.
          </p>
        </div>
      )}
```

In the upgrade CTA section (line 108), change:

```tsx
// OLD
            href="/signup?tier=premium"
```

to:

```tsx
// NEW
            href="/pricing"
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/portal/page.tsx
git commit -m "feat: add checkout feedback banners and pricing link to portal"
```

---

### Task 13: Update settings page with SubscriptionManager

**Files:**
- Modify: `src/app/(auth)/portal/settings/page.tsx`

Replace the static subscription section (lines 86-104) with the `SubscriptionManager` client component, passing in the member's tier and Stripe IDs.

- [ ] **Step 1: Update `src/app/(auth)/portal/settings/page.tsx`**

Add import at top:

```tsx
import { SubscriptionManager } from '@/components/portal/SubscriptionManager';
```

Replace the subscription section (lines 86-104). The old code:

```tsx
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
```

Becomes:

```tsx
      {/* Subscription */}
      <section className="mb-10 border border-bmj-tan/20 bg-bmj-brown p-8">
        <h2 className="mb-4 font-display text-2xl text-bmj-white">
          SUBSCRIPTION
        </h2>
        <SubscriptionManager
          tier={tier}
          hasSubscription={!!member?.stripe_subscription_id}
        />
      </section>
```

The `TierBadge` import can be removed since `SubscriptionManager` handles it internally. But `TierBadge` is not used elsewhere in this file after the replacement, so remove the import.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/portal/settings/page.tsx
git commit -m "feat: replace static subscription section with SubscriptionManager"
```

---

### Task 14: Add Pricing link to navigation

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/MobileMenu.tsx`

Both files have their own `NAV_LINKS` arrays (duplicated). Add "Pricing" to both.

- [ ] **Step 1: Update `src/components/layout/Navbar.tsx`**

In the `NAV_LINKS` array (line 15-23), add the Pricing entry after Contact:

```typescript
// OLD
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academy', href: '/academy' },
  { label: 'Resources', href: '/resources' },
  { label: 'Video', href: '/video' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];
```

```typescript
// NEW
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academy', href: '/academy' },
  { label: 'Resources', href: '/resources' },
  { label: 'Video', href: '/video' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];
```

- [ ] **Step 2: Update `src/components/layout/MobileMenu.tsx`**

Same change to `NAV_LINKS` at line 15-23 — add `{ label: 'Pricing', href: '/pricing' }` before Contact.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/MobileMenu.tsx
git commit -m "feat: add pricing link to navigation"
```

---

### Task 15: Build verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors. All pages compile. No type errors.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Final commit**

If any build fixes were needed, stage only the affected files:

```bash
git add <files-that-were-fixed>
git commit -m "fix: resolve build errors in Stripe subscription system"
```

---

## End-to-End Verification Checklist

After all tasks are complete, verify the full flow:

1. **Unauthenticated user** visits `/pricing` — sees tier cards with "Get Started" links to signup
2. **Free member** visits `/pricing` — sees "Subscribe" buttons that trigger Stripe Checkout
3. **Stripe Checkout completes** — webhook fires `checkout.session.completed`, updates `members` table with tier + Stripe IDs
4. **Member redirected to `/portal?checkout=success`** — sees success banner, tier badge updates
5. **Member visits `/portal/settings`** — SubscriptionManager shows current tier, "Manage Billing" button opens Stripe Customer Portal
6. **Basic member** sees "Upgrade to Premium" button in SubscriptionManager
7. **Subscription canceled** via Stripe portal — webhook fires `customer.subscription.deleted`, member downgraded to free
8. **Subscription updated** (plan change) — webhook fires `customer.subscription.updated`, tier updated

## Files Created (9)

| File | Lines (est.) |
|------|-------------|
| `src/lib/stripe/config.ts` | ~25 |
| `src/lib/stripe/helpers.ts` | ~40 |
| `src/lib/supabase/admin.ts` | ~10 |
| `src/app/api/stripe/checkout/route.ts` | ~35 |
| `src/app/api/stripe/webhook/route.ts` | ~110 |
| `src/app/api/stripe/manage-billing/route.ts` | ~30 |
| `src/app/(public)/pricing/page.tsx` | ~120 |
| `src/components/portal/CheckoutButton.tsx` | ~45 |
| `src/components/portal/SubscriptionManager.tsx` | ~90 |

## Files Modified (4)

| File | What changes |
|------|-------------|
| `src/app/(auth)/portal/page.tsx` | Add searchParams, checkout banners, pricing link |
| `src/app/(auth)/portal/settings/page.tsx` | Replace static subscription section with SubscriptionManager |
| `src/components/layout/Navbar.tsx` | Add "Pricing" nav link |
| `src/components/layout/MobileMenu.tsx` | Add "Pricing" nav link (mirrors Navbar) |
