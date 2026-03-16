# Contact Page & Newsletter System — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Contact page ("CONNECT") and newsletter subscription system, wiring email delivery via Resend and newsletter signup into the existing Footer.

**Architecture:** Two API routes handle form submissions (contact + newsletter). The Contact page is a server component shell wrapping a client-side form. A reusable `NewsletterForm` client component is extracted for the Footer and any future CTA placements. The right column of the Contact page includes direct contact info, social links, and a support/donation card with external payment links.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Zod (new dep), Resend (new dep), Supabase (existing), Lucide icons (existing)

---

## Pre-existing Infrastructure (DO NOT rebuild)

These already exist and should be imported/used directly:

| What | Where | Notes |
|------|-------|-------|
| `ContactSubmission` type | `src/lib/supabase/types.ts:91-98` | Has id, name, email, subject, message, submitted_at |
| `NewsletterSubscriber` type | `src/lib/supabase/types.ts:83-89` | Has id, email, source, subscribed_at, unsubscribed_at |
| `submitContactForm()` | `src/lib/supabase/queries.ts:274-291` | Inserts into contact_submissions table |
| `subscribeToNewsletter()` | `src/lib/supabase/queries.ts:243-258` | Upserts into newsletter_subscribers (handles duplicates) |
| Database table definitions | `src/lib/supabase/types.ts:137-148` | Both tables in Database type |
| Footer with newsletter form shell | `src/components/layout/Footer.tsx:116-140` | Non-functional, needs wiring |
| Footer social + support links | `src/components/layout/Footer.tsx:15-26` | SOCIAL_LINKS and SUPPORT_LINKS arrays |

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/app/api/contact/route.ts` | POST handler: validate with Zod, insert via `submitContactForm`, send email via Resend |
| Create | `src/app/api/newsletter/subscribe/route.ts` | POST handler: validate email with Zod, insert via `subscribeToNewsletter` |
| Create | `src/app/(public)/contact/page.tsx` | Server component: page metadata + two-column layout shell |
| Create | `src/app/(public)/contact/ContactForm.tsx` | Client component: name/email/subject/message form with loading/success/error states |
| Create | `src/app/(public)/contact/SupportCard.tsx` | Server component: donation/support links (Patreon, PayPal, CashApp, Venmo) |
| Create | `src/components/layout/NewsletterForm.tsx` | Client component: reusable email+submit form, calls `/api/newsletter/subscribe` |
| Modify | `src/components/layout/Footer.tsx` | Replace static newsletter form with `NewsletterForm` component |
| Modify | `package.json` | Add `zod` and `resend` dependencies |

---

## Chunk 1: Dependencies & API Routes

### Task 1: Fix Query Helpers to Throw on Error

**Files:**
- Modify: `src/lib/supabase/queries.ts:243-291`

**Why:** Both `subscribeToNewsletter()` and `submitContactForm()` currently `console.error` on failure but never throw. The API routes wrap calls in `try/catch`, so without a thrown error, database failures would silently return 200 to the client.

- [ ] **Step 1: Update `subscribeToNewsletter` to throw on error**

In `src/lib/supabase/queries.ts`, find the `subscribeToNewsletter` function and add `throw error;` after the console.error:

```typescript
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
    throw error;
  }
}
```

- [ ] **Step 2: Update `submitContactForm` to throw on error**

Same file, find `submitContactForm` and add `throw error;`:

```typescript
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
    throw error;
  }
}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/queries.ts
git commit -m "fix: make contact and newsletter query helpers throw on error"
```

---

### Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install zod and resend**

```bash
npm install zod resend
```

- [ ] **Step 2: Verify installation**

```bash
npx tsc --noEmit
```

Expected: No new errors. Both packages should be in `node_modules/`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add zod and resend dependencies"
```

---

### Task 3: Contact API Route

**Files:**
- Create: `src/app/api/contact/route.ts`

**Reference:** Follow the pattern in `src/app/api/stripe/checkout/route.ts` — parse JSON body, validate, call helper, return NextResponse.json().

- [ ] **Step 1: Create the contact API route**

```typescript
// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { submitContactForm } from '@/lib/supabase/queries';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? 'Validation failed';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { name, email, subject, message } = result.data;

  try {
    // Store in database
    await submitContactForm({ name, email, subject, message });

    // Send notification email to the Chairman
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'The Black Male Journal <noreply@blackmalejournal.com>',
        to: 'chairman@blackmalejournal.com',
        subject: `[Contact] ${subject}`,
        text: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/contact/route.ts
git commit -m "feat: add contact form API route with Zod validation and Resend email"
```

---

### Task 4: Newsletter Subscribe API Route

**Files:**
- Create: `src/app/api/newsletter/subscribe/route.ts`

- [ ] **Step 1: Create the newsletter subscribe route**

```typescript
// src/app/api/newsletter/subscribe/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { subscribeToNewsletter } from '@/lib/supabase/queries';

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = subscribeSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? 'Validation failed';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { email, source } = result.data;

  try {
    await subscribeToNewsletter(email, source ?? 'website');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[newsletter/subscribe]', err);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/newsletter/subscribe/route.ts
git commit -m "feat: add newsletter subscribe API route"
```

---

## Chunk 2: Newsletter Form Component & Footer Wiring

### Task 5: Reusable Newsletter Form Component

**Files:**
- Create: `src/components/layout/NewsletterForm.tsx`

**Design notes:** This is a `'use client'` component that manages its own fetch/loading/success/error state. It calls `POST /api/newsletter/subscribe`. It accepts an optional `source` prop so different placements can be tracked (e.g., "footer", "contact-page", "cta-banner"). Styling matches the existing Footer input/button pattern exactly.

- [ ] **Step 1: Create the NewsletterForm component**

```typescript
// src/components/layout/NewsletterForm.tsx
'use client';

import { useState } from 'react';

interface NewsletterFormProps {
  source?: string;
}

export function NewsletterForm({ source = 'footer' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setEmail('');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="font-body text-sm text-bmj-cream">
        You&apos;re in. Watch your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
      aria-label="Newsletter signup"
    >
      <label htmlFor={`newsletter-email-${source}`} className="sr-only">
        Email address
      </label>
      <input
        id={`newsletter-email-${source}`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading'}
        className="border border-bmj-tan/30 bg-bmj-black px-4 py-2 font-mono text-sm text-bmj-cream placeholder-bmj-tan/50 outline-none focus:border-bmj-red disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-bmj-red px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p className="font-mono text-xs text-bmj-red">{errorMsg}</p>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/NewsletterForm.tsx
git commit -m "feat: add reusable NewsletterForm client component"
```

---

### Task 6: Wire Footer to Use NewsletterForm

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**What changes:** Replace the static `<form>` block (lines 120-140) with the `NewsletterForm` component. Add `'use client'` directive since the Footer now renders a client component (or keep Footer as server component and just import the client component — Next.js handles this correctly; a server component CAN render a client component as a child). No `'use client'` needed on Footer.

Also update `SUPPORT_LINKS` to add Venmo (user spec requires it).

- [ ] **Step 1: Update the Footer**

In `src/components/layout/Footer.tsx`:

1. Add import at top:
```typescript
import { NewsletterForm } from './NewsletterForm';
```

2. Add Venmo to SUPPORT_LINKS:
```typescript
const SUPPORT_LINKS = [
  { label: "Patreon",  href: "#" },
  { label: "PayPal",   href: "#" },
  { label: "CashApp",  href: "#" },
  { label: "Venmo",    href: "#" },
];
```

3. Replace lines 116-140 (the `{/* Newsletter signup */}` comment, the `<h4>`, and the `<form>`) with:
```tsx
{/* Newsletter signup */}
<h4 className="mb-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
  Newsletter
</h4>
<NewsletterForm source="footer" />
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: wire Footer newsletter form to API endpoint"
```

---

## Chunk 3: Contact Page

### Task 7: Support Card Component

**Files:**
- Create: `src/app/(public)/contact/SupportCard.tsx`

**Design notes:** A card showing donation/support platform links. Styled with bmj-brown background, red accent border. Each platform is a button-style link. When a user clicks "Donate," they go to the external platform. Include Patreon, PayPal, CashApp, Venmo. The component is a client component only if interactivity is needed (for now, server-safe — just links).

- [ ] **Step 1: Create the SupportCard component**

```typescript
// src/app/(public)/contact/SupportCard.tsx
import { Heart } from 'lucide-react';

const SUPPORT_PLATFORMS = [
  { label: 'Patreon', href: '#', description: 'Monthly support' },
  { label: 'PayPal', href: '#', description: 'One-time or recurring' },
  { label: 'CashApp', href: '#', description: '$BlackMaleJournal' },
  { label: 'Venmo', href: '#', description: '@BlackMaleJournal' },
];

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
      <div className="grid grid-cols-2 gap-3">
        {SUPPORT_PLATFORMS.map((platform) => (
          <a
            key={platform.label}
            href={platform.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-bmj-tan/20 bg-bmj-black px-4 py-3 text-center transition-colors hover:border-bmj-red/40"
          >
            <span className="block font-label text-xs uppercase tracking-widest text-bmj-cream">
              {platform.label}
            </span>
            <span className="mt-1 block font-mono text-[10px] text-bmj-tan/60">
              {platform.description}
            </span>
          </a>
        ))}
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
git commit -m "feat: add SupportCard component with donation platform links"
```

---

### Task 8: Contact Form Client Component

**Files:**
- Create: `src/app/(public)/contact/ContactForm.tsx`

**Design notes:** Client component with controlled form state. Calls `POST /api/contact`. Subject is a dropdown (not free text) with predefined options. Shows loading spinner on submit, success message on completion, inline error on failure. Styling matches `SignupForm.tsx` patterns exactly:
- Label: `font-label text-xs uppercase tracking-widest text-bmj-tan`
- Input: `w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none`
- Button: `w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90`

- [ ] **Step 1: Create the ContactForm component**

```typescript
// src/app/(public)/contact/ContactForm.tsx
'use client';

import { useState } from 'react';

const SUBJECTS = [
  'General Inquiry',
  'Membership Question',
  'Content Submission',
  'Partnership / Collaboration',
  'Press / Media',
  'Report an Issue',
];

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-bmj-red/20 bg-bmj-brown p-8 text-center">
        <p className="font-display text-2xl uppercase text-bmj-cream">
          Message Sent
        </p>
        <p className="mt-2 font-body text-sm text-bmj-tan">
          The Chairman will respond.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 font-label text-xs uppercase tracking-widest text-bmj-red transition-colors hover:text-bmj-cream"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Subject
        </label>
        <select
          id="contact-subject"
          name="subject"
          required
          defaultValue=""
          className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
        >
          <option value="" disabled className="text-bmj-tan/50">
            Select a subject
          </option>
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          minLength={10}
          className="w-full resize-none border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
          placeholder="What's on your mind?"
        />
      </div>

      {status === 'error' && (
        <p className="font-mono text-xs text-bmj-red">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/contact/ContactForm.tsx
git commit -m "feat: add ContactForm client component with validation and API submission"
```

---

### Task 9: Contact Page

**Files:**
- Create: `src/app/(public)/contact/page.tsx`

**Design notes:** Server component. Two-column grid layout (stacked on mobile). Left column: ContactForm. Right column: direct contact info (email, WhatsApp, social links), then SupportCard. Page title "CONNECT" in Bebas Neue, all-caps, matching existing page patterns.

Social links use the same icons as the Footer (`Instagram`, `Youtube`, `Linkedin`, `Twitter` from lucide-react). Contact info styled with `font-mono` for addresses, `font-label` for section headings.

- [ ] **Step 1: Create the Contact page**

```typescript
// src/app/(public)/contact/page.tsx
import type { Metadata } from 'next';
import {
  Mail,
  MessageCircle,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { ContactForm } from './ContactForm';
import { SupportCard } from './SupportCard';

export const metadata: Metadata = {
  title: 'Connect',
  description:
    'Reach the Chairman. Contact The Black Male Journal for inquiries, collaborations, and press.',
};

const SOCIAL_LINKS = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'X (Twitter)' },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16">
      {/* Page header */}
      <h1 className="mb-2 font-display text-5xl uppercase text-bmj-white md:text-7xl">
        Connect
      </h1>
      <p className="mb-12 max-w-xl font-body text-sm leading-relaxed text-bmj-cream/70">
        Questions, ideas, collaborations, or just want to build with us — reach
        out. The Chairman reads every message.
      </p>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* LEFT — Contact Form */}
        <div>
          <h2 className="mb-6 font-label text-xs uppercase tracking-widest text-bmj-tan">
            Send a Message
          </h2>
          <ContactForm />
        </div>

        {/* RIGHT — Contact Info + Support */}
        <div className="space-y-8">
          {/* Direct contact */}
          <div>
            <h2 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Direct
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-bmj-red" />
                <a
                  href="mailto:chairman@blackmalejournal.com"
                  className="font-mono text-sm text-bmj-cream transition-colors hover:text-bmj-red"
                >
                  chairman@blackmalejournal.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-bmj-red" />
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-bmj-cream transition-colors hover:text-bmj-red"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h2 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Follow
            </h2>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-bmj-tan transition-colors hover:text-bmj-cream"
                >
                  <Icon size={18} />
                  <span className="font-label text-xs uppercase tracking-widest">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Support / Donate */}
          <SupportCard />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/contact/page.tsx
git commit -m "feat: add Contact page with two-column layout, form, and support card"
```

---

## Chunk 4: Final Verification

### Task 10: Full Build & Visual Check

- [ ] **Step 1: Full build verification**

```bash
npm run build
```

Expected: Build succeeds. All routes compile.

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
1. `/contact` — form renders, two-column layout, social links, support card visible
2. Submit contact form with valid data — success message appears
3. Submit with empty fields — browser validation prevents submission
4. Footer newsletter form — type email, click Subscribe, success message appears
5. Check at 375px (mobile) — columns stack, form is full-width
6. Check at 1440px (desktop) — two-column grid renders correctly

- [ ] **Step 4: Final commit (all remaining changes)**

```bash
git add -A
git commit -m "feat: add contact page and newsletter system with Resend email delivery"
```

---

## Environment Variables Required

Add these to `.env.local` (and Vercel dashboard for production):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** The contact API route gracefully skips email sending if `RESEND_API_KEY` is not set (see the `if (process.env.RESEND_API_KEY)` guard). This means the form will work in development even without the key — submissions still get stored in Supabase.

## Future Enhancements (Not in Scope)

- **Donation modal:** Unified donation page with Apple Pay integration, custom note field. Requires payment processor integration beyond simple links.
- **Rate limiting:** Add basic IP-based rate limiting to prevent spam on contact/newsletter endpoints.
- **Welcome email:** Send a branded welcome email via Resend when someone subscribes to the newsletter.
- **Resend domain verification:** Configure DNS records for `blackmalejournal.com` in Resend dashboard for deliverability.
