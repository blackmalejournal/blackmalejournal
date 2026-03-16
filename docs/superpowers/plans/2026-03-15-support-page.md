# Support Page ("Fund the Mission") — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `/support` page that serves as the unified donation experience for BMJ — amount selection, Stripe checkout with Apple Pay/Google Pay, optional donor note, newsletter capture, and alternative payment methods (CashApp, Venmo, PayPal, Patreon).

**Architecture:** A server component page shell wraps a `SupportFlow` client component that manages amount/frequency/note state and triggers Stripe Checkout via a new `/api/stripe/donate` route. One-time donations use `mode: 'payment'` and recurring use `mode: 'subscription'`, both with inline `price_data` for dynamic amounts. Alternative peer-to-peer methods (CashApp, Venmo) are displayed as static handles below the fold. The existing SupportCard on `/contact` is updated to funnel users to `/support`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Stripe (existing), Zod (existing), Supabase (existing for newsletter capture), Lucide icons (existing)

---

## Pre-existing Infrastructure (DO NOT rebuild)

| What | Where | Notes |
|------|-------|-------|
| `getStripe()` singleton | `src/lib/stripe/config.ts` | Lazy Stripe client — reuse for donation sessions |
| `createCheckoutSession()` | `src/lib/stripe/helpers.ts` | Subscription checkout pattern — donations follow same shape |
| Stripe checkout API route | `src/app/api/stripe/checkout/route.ts` | Reference for request handling pattern (but donations differ: no auth required, dynamic pricing) |
| `subscribeToNewsletter()` | `src/lib/supabase/queries.ts:243-259` | Upserts into newsletter_subscribers — reuse for donation-page newsletter capture |
| `StarDivider` | `src/components/ui/StarDivider.tsx` | Section separator with BMJ star motif |
| `NewsletterForm` | `src/components/layout/NewsletterForm.tsx` | Reference for form state pattern |
| Brand colors + fonts | `src/styles/brand.css` | All `--bmj-*` CSS variables |
| Footer | `src/components/layout/Footer.tsx` | Support links array already exists at line 23-28 |
| SupportCard | `src/app/(public)/contact/SupportCard.tsx` | Will be modified to link to /support |
| Navbar | `src/components/layout/Navbar.tsx` | NOT modified — support page is reached via CTAs, not nav |

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/app/api/stripe/donate/route.ts` | POST: validate with Zod, create Stripe Checkout session (payment or subscription mode), return checkout URL |
| Create | `src/app/(public)/support/page.tsx` | Server component: metadata, hero section with mission copy, assembles SupportFlow + AlternativeMethods |
| Create | `src/app/(public)/support/SupportFlow.tsx` | Client component: amount presets, monthly/one-time toggle, cover-fees checkbox, note textarea, newsletter checkbox, Stripe redirect |
| Create | `src/app/(public)/support/AlternativeMethods.tsx` | Server component: CashApp tag, Venmo handle, PayPal link, Patreon CTA |
| Modify | `src/app/(public)/contact/SupportCard.tsx` | Replace 4-button grid with single "Support the Mission" CTA linking to /support + quick CashApp/Venmo handles |

---

## Chunk 1: Donation API Route

### Task 1: Create Donation Checkout API Route

**Files:**
- Create: `src/app/api/stripe/donate/route.ts`

**Design notes:** Unlike the subscription checkout (`/api/stripe/checkout`), this route does NOT require authentication — anyone can donate. It accepts a dynamic amount and creates a Stripe Checkout session with inline `price_data`. For one-time gifts: `mode: 'payment'`. For monthly recurring: `mode: 'subscription'` with `recurring.interval: 'month'`. The donor's note is stored in session `metadata`. Stripe's checkout page natively supports Apple Pay and Google Pay — no extra code needed.

**Key difference from subscription flow:** Subscriptions use pre-created Price IDs (`STRIPE_BASIC_PRICE_ID`). Donations use inline `price_data` because the amount is user-selected.

- [ ] **Step 1: Create the donation API route**

```typescript
// src/app/api/stripe/donate/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe/config';

const donateSchema = z.object({
  amount: z.number().min(1, 'Minimum $1').max(10000, 'Maximum $10,000'),
  frequency: z.enum(['monthly', 'once']),
  coverFees: z.boolean().optional().default(false),
  note: z.string().max(500).optional(),
  email: z.string().email().optional(),
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = donateSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Validation failed';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { frequency, coverFees, note, email } = result.data;
  let { amount } = result.data;

  // If covering fees, adjust amount so BMJ receives the original amount after Stripe's cut
  // Stripe charges 2.9% + $0.30
  if (coverFees) {
    amount = Math.ceil(((amount + 0.30) / (1 - 0.029)) * 100) / 100;
  }

  const unitAmount = Math.round(amount * 100); // Convert to cents

  const isRecurring = frequency === 'monthly';
  const productName = isRecurring
    ? 'Monthly Support — The Black Male Journal'
    : 'Support — The Black Male Journal';

  try {
    const stripe = getStripe();

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: isRecurring ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: productName },
            unit_amount: unitAmount,
            ...(isRecurring && { recurring: { interval: 'month' as const } }),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'donation',
        frequency,
        ...(note && { note }),
      },
      success_url: `${siteUrl}/support?status=success`,
      cancel_url: `${siteUrl}/support?status=cancel`,
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[donate]', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/donate/route.ts
git commit -m "feat: add donation checkout API route with dynamic Stripe pricing"
```

---

## Chunk 2: Support Page Components

### Task 2: SupportFlow Client Component

**Files:**
- Create: `src/app/(public)/support/SupportFlow.tsx`

**Design notes:** This is the core interactive component. It manages all form state:
- Preset amount buttons ($5, $15, $25, $50) in a grid, plus a custom amount input
- Monthly / One-time toggle (monthly pre-selected — research shows 35% lift)
- "Cover processing fees" checkbox with dynamic adjusted amount display
- Optional note textarea with a row of BMJ brand symbols (star, fist) users can tap to insert
- Newsletter signup checkbox
- "Support BMJ" submit button that POSTs to `/api/stripe/donate` and redirects to Stripe

The $15 preset is visually highlighted as the default selection. Impact labels appear next to each amount.

**User decision point:** The impact labels that map amounts to what they fund (e.g., "$15/mo = one Weekend Briefing") are business logic that only the project owner can define accurately. These are marked with a `TODO` for the user to fill in.

- [ ] **Step 1: Create the SupportFlow component**

```typescript
// src/app/(public)/support/SupportFlow.tsx
'use client';

import { useState } from 'react';

const PRESETS = [
  { amount: 5, label: '$5' },
  { amount: 15, label: '$15' },
  { amount: 25, label: '$25' },
  { amount: 50, label: '$50' },
];

// TODO: Fill in impact descriptions that map to each amount.
// These appear below the amount when selected.
// Examples: "$5/mo keeps the lights on", "$15/mo produces a Weekend Briefing"
const IMPACT_LABELS: Record<number, string> = {
  5: 'Keeps the platform running',
  15: 'Produces one Weekend Briefing',
  25: 'Funds a full week of dispatches',
  50: 'Sponsors original investigations',
};

const BRAND_SYMBOLS = ['★', '✊', '✦'];

type Frequency = 'monthly' | 'once';

export function SupportFlow() {
  const [selectedAmount, setSelectedAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [coverFees, setCoverFees] = useState(false);
  const [note, setNote] = useState('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const activeAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  // Stripe fee calculation: (amount + $0.30) / (1 - 0.029)
  const feeAdjusted = coverFees
    ? Math.ceil(((activeAmount + 0.30) / (1 - 0.029)) * 100) / 100
    : activeAmount;
  const feeDiff = coverFees ? (feeAdjusted - activeAmount).toFixed(2) : '0.00';

  function handlePreset(amount: number) {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  }

  function handleCustomFocus() {
    setIsCustom(true);
  }

  function insertSymbol(symbol: string) {
    setNote((prev) => prev + symbol);
  }

  async function handleSubmit() {
    if (activeAmount < 1) {
      setErrorMsg('Please enter at least $1.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // If newsletter checkbox is checked and email provided, subscribe before Stripe redirect
      if (subscribeNewsletter && newsletterEmail) {
        await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newsletterEmail, source: 'support-page' }),
        }).catch(() => {
          // Don't block donation flow if newsletter fails
        });
      }

      const res = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeAmount,
          frequency,
          coverFees,
          note: note.trim() || undefined,
          email: newsletterEmail || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Frequency toggle */}
      <div className="flex border border-bmj-tan/30">
        <button
          type="button"
          onClick={() => setFrequency('monthly')}
          className={`flex-1 py-3 font-label text-xs uppercase tracking-widest transition-colors ${
            frequency === 'monthly'
              ? 'bg-bmj-red text-bmj-white'
              : 'bg-bmj-black text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setFrequency('once')}
          className={`flex-1 py-3 font-label text-xs uppercase tracking-widest transition-colors ${
            frequency === 'once'
              ? 'bg-bmj-red text-bmj-white'
              : 'bg-bmj-black text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          One-time
        </button>
      </div>

      {/* Amount presets */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRESETS.map(({ amount, label }) => (
          <button
            key={amount}
            type="button"
            onClick={() => handlePreset(amount)}
            className={`border py-4 font-display text-2xl uppercase transition-colors ${
              !isCustom && selectedAmount === amount
                ? 'border-bmj-red bg-bmj-red/10 text-bmj-white'
                : 'border-bmj-tan/30 bg-bmj-black text-bmj-cream hover:border-bmj-red/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div>
        <label
          htmlFor="custom-amount"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Custom Amount
        </label>
        <div className="flex items-center border border-bmj-tan/30 bg-bmj-black">
          <span className="pl-4 font-display text-lg text-bmj-tan">$</span>
          <input
            id="custom-amount"
            type="number"
            min="1"
            max="10000"
            step="1"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setIsCustom(true);
            }}
            onFocus={handleCustomFocus}
            placeholder="Other amount"
            className="w-full bg-transparent px-2 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Impact label */}
      {!isCustom && IMPACT_LABELS[selectedAmount] && (
        <p className="font-body text-sm italic text-bmj-amber">
          {frequency === 'monthly' ? `$${selectedAmount}/mo` : `$${selectedAmount}`}
          {' — '}
          {IMPACT_LABELS[selectedAmount]}
        </p>
      )}

      {/* Cover fees checkbox */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={coverFees}
          onChange={(e) => setCoverFees(e.target.checked)}
          className="mt-1 accent-bmj-red"
        />
        <span className="font-body text-sm text-bmj-cream/80">
          Cover processing fees
          {coverFees && activeAmount >= 1 && (
            <span className="text-bmj-tan"> (+${feeDiff})</span>
          )}
        </span>
      </label>

      {/* Note */}
      <div>
        <label
          htmlFor="donor-note"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Leave a Note <span className="text-bmj-tan/50">(optional)</span>
        </label>
        <div className="mb-1 flex gap-2">
          {BRAND_SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => insertSymbol(symbol)}
              className="border border-bmj-tan/20 px-2 py-1 text-sm transition-colors hover:border-bmj-red/40"
              aria-label={`Insert ${symbol}`}
            >
              {symbol}
            </button>
          ))}
        </div>
        <textarea
          id="donor-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="A message for the Chairman..."
          className="w-full resize-none border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
        />
      </div>

      {/* Newsletter checkbox + conditional email input */}
      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
            className="mt-1 accent-bmj-red"
          />
          <span className="font-body text-sm text-bmj-cream/80">
            Subscribe to the newsletter
          </span>
        </label>
        {subscribeNewsletter && (
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-2 font-mono text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
          />
        )}
      </div>

      {/* Error message */}
      {status === 'error' && (
        <p className="font-mono text-xs text-bmj-red">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={status === 'loading' || activeAmount < 1}
        className="w-full bg-bmj-red py-4 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'loading'
          ? 'Redirecting to checkout...'
          : `Support BMJ — $${activeAmount >= 1 ? (coverFees ? feeAdjusted.toFixed(2) : activeAmount.toFixed(2)) : '0.00'}${frequency === 'monthly' ? '/mo' : ''}`}
      </button>

      <p className="text-center font-mono text-[10px] text-bmj-tan/50">
        Secure payment via Stripe. Apple Pay &amp; Google Pay accepted.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/support/SupportFlow.tsx
git commit -m "feat: add SupportFlow client component with amount selection and Stripe checkout"
```

---

### Task 3: AlternativeMethods Component

**Files:**
- Create: `src/app/(public)/support/AlternativeMethods.tsx`

**Design notes:** Static server component. Displays peer-to-peer payment handles (CashApp, Venmo) and links to PayPal and Patreon. Styled with a muted background to visually separate from the primary Stripe flow. Each platform shows a handle/link users can copy or tap.

- [ ] **Step 1: Create the AlternativeMethods component**

```typescript
// src/app/(public)/support/AlternativeMethods.tsx
import { ExternalLink } from 'lucide-react';

const METHODS = [
  {
    label: 'CashApp',
    handle: '$BlackMaleJournal',
    href: 'https://cash.app/$BlackMaleJournal',
    description: 'Tap to open CashApp',
  },
  {
    label: 'Venmo',
    handle: '@BlackMaleJournal',
    href: 'https://venmo.com/BlackMaleJournal',
    description: 'Tap to open Venmo',
  },
  {
    label: 'PayPal',
    handle: 'paypal.me/BlackMaleJournal',
    href: 'https://paypal.me/BlackMaleJournal',
    description: 'One-time or recurring',
  },
];

export function AlternativeMethods() {
  return (
    <div className="space-y-6">
      <h2 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
        More Ways to Support
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {METHODS.map((method) => (
          <a
            key={method.label}
            href={method.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-bmj-tan/20 bg-bmj-brown px-4 py-3 transition-colors hover:border-bmj-red/40"
          >
            <div>
              <span className="block font-label text-xs uppercase tracking-widest text-bmj-cream">
                {method.label}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-bmj-tan">
                {method.handle}
              </span>
            </div>
            <ExternalLink size={14} className="shrink-0 text-bmj-tan/50" />
          </a>
        ))}
      </div>

      {/* Patreon — separate treatment */}
      <a
        href="https://patreon.com/BlackMaleJournal"
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-bmj-amber/30 bg-bmj-brown px-4 py-4 text-center transition-colors hover:border-bmj-amber/60"
      >
        <span className="block font-label text-sm uppercase tracking-widest text-bmj-amber">
          Join the Inner Circle on Patreon
        </span>
        <span className="mt-1 block font-body text-xs text-bmj-cream/60">
          Exclusive community access, early content, direct line to the Chairman
        </span>
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/support/AlternativeMethods.tsx
git commit -m "feat: add AlternativeMethods component with CashApp, Venmo, PayPal, Patreon"
```

---

### Task 4: Support Page Shell

**Files:**
- Create: `src/app/(public)/support/page.tsx`

**Design notes:** Server component. Hero section leads with the mission (not the ask) — research shows this converts better. The `SupportFlow` handles the interactive donation form. A `StarDivider` separates the primary flow from alternative methods. Success/cancel states are handled via `searchParams` — after Stripe redirects back, the page shows a thank-you banner or a "didn't complete" message.

- [ ] **Step 1: Create the support page**

```typescript
// src/app/(public)/support/page.tsx
import type { Metadata } from 'next';
import { StarDivider } from '@/components/ui/StarDivider';
import { SupportFlow } from './SupportFlow';
import { AlternativeMethods } from './AlternativeMethods';

export const metadata: Metadata = {
  title: 'Support the Mission',
  description:
    'Fund independent media for Black men. No corporate sponsors. No advertisers. Just us.',
};

interface SupportPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const { status } = await searchParams;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      {/* Success / Cancel banners */}
      {status === 'success' && (
        <div className="mb-8 border border-bmj-red/30 bg-bmj-brown p-6 text-center">
          <p className="font-display text-2xl uppercase text-bmj-cream">
            Thank You
          </p>
          <p className="mt-2 font-body text-sm text-bmj-tan">
            Your support keeps The Black Male Journal independent. The Chairman salutes you.
          </p>
        </div>
      )}
      {status === 'cancel' && (
        <div className="mb-8 border border-bmj-tan/20 bg-bmj-brown p-4 text-center">
          <p className="font-body text-sm text-bmj-tan">
            Checkout was not completed. You can try again below.
          </p>
        </div>
      )}

      {/* Hero */}
      <h1 className="mb-2 font-display text-5xl uppercase text-bmj-white md:text-7xl">
        Fund the Mission
      </h1>
      <p className="mb-10 max-w-lg font-body text-sm leading-relaxed text-bmj-cream/70">
        No corporate sponsors. No advertisers. No compromise. The Black Male
        Journal runs on the direct support of readers who believe independent
        media for Black men matters. Every dollar funds reporting, analysis, and
        the Weekend Briefing.
      </p>

      {/* Primary donation flow */}
      <SupportFlow />

      <StarDivider className="my-12" />

      {/* Alternative methods */}
      <AlternativeMethods />
    </section>
  );
}
```

- [ ] **Step 2: Full build verification**

```bash
npm run build
```

Expected: Build succeeds. `/support` route compiles.

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/support/page.tsx
git commit -m "feat: add /support page with mission hero, donation flow, and alternative methods"
```

---

## Chunk 3: Integration + Polish

### Task 5: Update SupportCard on Contact Page

**Files:**
- Modify: `src/app/(public)/contact/SupportCard.tsx`

**Design notes:** Replace the 4-button grid with a single prominent CTA button linking to `/support`, plus CashApp and Venmo handles displayed as quick-access text. This funnels users to the full donation experience rather than splitting their attention across 4 equal-weight options.

- [ ] **Step 1: Rewrite the SupportCard**

Replace the entire contents of `src/app/(public)/contact/SupportCard.tsx` with:

```typescript
// src/app/(public)/contact/SupportCard.tsx
import Link from 'next/link';
import { Heart } from 'lucide-react';

export function SupportCard() {
  return (
    <div className="border border-bmj-red/20 bg-bmj-brown p-6">
      <div className="mb-4 flex items-center gap-2">
        <Heart size={18} className="text-bmj-red" />
        <h3 className="font-label text-sm uppercase tracking-widest text-bmj-cream">
          Support the Mission
        </h3>
      </div>
      <p className="mb-5 font-body text-sm leading-relaxed text-bmj-cream/70">
        The Black Male Journal runs on community support. Every contribution
        fuels independent media for Black men.
      </p>

      <Link
        href="/support"
        className="mb-4 block bg-bmj-red py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
      >
        Fund the Mission
      </Link>

      <div className="flex justify-between text-center">
        <div>
          <span className="block font-label text-[10px] uppercase tracking-widest text-bmj-tan/60">
            CashApp
          </span>
          <span className="font-mono text-xs text-bmj-cream">
            $BlackMaleJournal
          </span>
        </div>
        <div>
          <span className="block font-label text-[10px] uppercase tracking-widest text-bmj-tan/60">
            Venmo
          </span>
          <span className="font-mono text-xs text-bmj-cream">
            @BlackMaleJournal
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/contact/SupportCard.tsx
git commit -m "refactor: update SupportCard to link to /support page with CashApp/Venmo quick handles"
```

---

### Task 6: Full Build & Visual Verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: Build succeeds, all routes compile including `/support`.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Dev server visual check**

```bash
npm run dev
```

Test these pages manually:

1. **`/support`** — hero text renders, amount presets visible, $15 pre-selected (highlighted), monthly toggle active
2. **Amount selection** — click $5, $25, $50 → highlight moves. Type custom amount → presets deselect
3. **Monthly / One-time toggle** — switches between modes, button text updates with frequency suffix
4. **Cover fees checkbox** — check it → button shows adjusted amount, fee diff displays next to checkbox
5. **Note field** — type text, click brand symbols → symbols insert into textarea
6. **Submit with $15/monthly** — button reads "Support BMJ — $15.00/mo". Click → "Redirecting to checkout..." → (fails gracefully in dev without Stripe key)
7. **`/support?status=success`** — thank-you banner appears above hero
8. **`/support?status=cancel`** — "not completed" banner appears
9. **Alternative methods** — CashApp, Venmo, PayPal cards render. Patreon CTA renders with amber border
10. **`/contact`** — SupportCard shows single "Fund the Mission" button + CashApp/Venmo handles
11. **Mobile (375px)** — all elements stack, amount grid goes 2-col, everything fits
12. **Desktop (1440px)** — centered layout (max-w-2xl), clean proportions

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: add /support page with Stripe donations, alternative methods, and updated SupportCard"
```

---

## Environment Variables

No new env vars required. The donation API route reuses the existing `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL`.

For the route to actually create Stripe Checkout sessions, `STRIPE_SECRET_KEY` must be set. Without it, the API returns a 500 error — but the page itself renders fine for visual testing.

## CashApp / Venmo / PayPal / Patreon URLs

The plan uses placeholder URLs (`https://cash.app/$BlackMaleJournal`, etc.). Replace these with actual account URLs once created:

| Platform | Placeholder | Replace with |
|----------|-------------|--------------|
| CashApp | `https://cash.app/$BlackMaleJournal` | Actual CashApp cashtag URL |
| Venmo | `https://venmo.com/BlackMaleJournal` | Actual Venmo profile URL |
| PayPal | `https://paypal.me/BlackMaleJournal` | Actual PayPal.me link |
| Patreon | `https://patreon.com/BlackMaleJournal` | Actual Patreon page URL |

## User Decision Required

The **impact labels** in `SupportFlow.tsx` (lines in `IMPACT_LABELS`) are placeholder copy. These map donation amounts to what they fund:

```typescript
const IMPACT_LABELS: Record<number, string> = {
  5: 'Keeps the platform running',
  15: 'Produces one Weekend Briefing',
  25: 'Funds a full week of dispatches',
  50: 'Sponsors original investigations',
};
```

**Review these and update them** to accurately reflect what each amount covers in reality. Impact framing is the single biggest driver of donation conversion — 63% of supporters want to know how their money makes a difference before giving.

## Future Enhancements (Not in Scope)

- **Donor wall:** Public page showing supporter names/notes (requires a `donations` Supabase table to track confirmed payments via webhook)
- **Custom BMJ symbol picker:** Expand the brand symbols row with custom SVG icons beyond Unicode characters
- **Email receipt:** Branded thank-you email via Resend triggered by Stripe webhook (`checkout.session.completed` with `metadata.type === 'donation'`)
- **Goal meter:** "X% of monthly goal reached" progress bar (requires tracking monthly donation totals)
- **Stripe embedded checkout:** Replace redirect with embedded checkout form for a fully on-brand experience (requires `@stripe/react-stripe-js`)
