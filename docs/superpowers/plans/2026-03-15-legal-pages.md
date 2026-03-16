# Legal Pages (Privacy Policy & Terms of Service) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Privacy Policy and Terms of Service pages as editorial-styled legal documents with BMJ brand treatment.

**Architecture:** Two Server Components at `/privacy` and `/terms`, each rendering structured legal content with the same typographic system used across the site. No database, no client-side logic — pure static pages. Footer already links to both routes.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, existing brand tokens and components (StarDivider).

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/app/(public)/privacy/page.tsx` | Privacy Policy page — Server Component, static content |
| Create | `src/app/(public)/terms/page.tsx` | Terms of Service page — Server Component, static content |

**No footer changes needed** — `src/components/layout/Footer.tsx:132-143` already links to `/privacy` and `/terms`.

---

## Chunk 1: Shared Patterns

Both pages share identical layout and typography patterns:

**Page shell:**
```tsx
<section className="mx-auto max-w-article px-6 py-16">
  {/* Label */}
  <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
    LEGAL
  </p>
  {/* Page title */}
  <h1 className="mb-4 font-display text-5xl uppercase text-bmj-white md:text-6xl">
    PAGE TITLE
  </h1>
  {/* Last updated */}
  <p className="mb-10 font-mono text-xs text-bmj-tan/60">
    Last updated: March 15, 2026
  </p>
  {/* Intro paragraph */}
  <p className="mb-8 font-body text-lg leading-[1.8] text-bmj-cream/90">
    ...
  </p>
  <StarDivider className="my-10" />
  {/* Sections */}
</section>
```

**Section pattern:**
```tsx
<div className="mb-10">
  <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
    SECTION TITLE
  </h2>
  <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
    ...
  </p>
</div>
```

**List pattern (for bulleted content within sections):**
```tsx
<ul className="mt-4 list-disc space-y-2 pl-6 font-body text-lg leading-[1.8] text-bmj-cream/90">
  <li>Item text</li>
</ul>
```

---

## Chunk 2: Task 1 — Privacy Policy Page

### Task 1: Privacy Policy

**Files:**
- Create: `src/app/(public)/privacy/page.tsx`

- [ ] **Step 1: Create the Privacy Policy page**

Create `src/app/(public)/privacy/page.tsx` with the following content. This is a Server Component — no "use client" directive.

```tsx
import type { Metadata } from "next";
import { StarDivider } from "@/components/ui/StarDivider";

export const metadata: Metadata = {
  title: "Privacy Policy | The Black Male Journal",
  description: "How The Black Male Journal collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-article px-6 py-16">
      <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
        Legal
      </p>
      <h1 className="mb-4 font-display text-5xl uppercase text-bmj-white md:text-6xl">
        PRIVACY POLICY
      </h1>
      <p className="mb-10 font-mono text-xs text-bmj-tan/60">
        Last updated: March 15, 2026
      </p>

      <p className="mb-8 font-body text-lg leading-[1.8] text-bmj-cream/90">
        The Black Male Journal (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your
        privacy and is committed to protecting the personal information you share
        with us. This policy explains what data we collect, why we collect it,
        and how we handle it.
      </p>

      <StarDivider className="my-10" />

      {/* What We Collect */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          WHAT DATA WE COLLECT
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          We collect information you provide directly when you:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 font-body text-lg leading-[1.8] text-bmj-cream/90">
          <li>Create an account (email address, password)</li>
          <li>Subscribe to a membership tier (name, payment information via Stripe)</li>
          <li>Sign up for our newsletter (email address)</li>
          <li>Submit a contact form (name, email, message content)</li>
          <li>Interact with our site (pages visited, time on site, device type)</li>
        </ul>
      </div>

      {/* How We Use It */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          HOW WE USE YOUR DATA
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 font-body text-lg leading-[1.8] text-bmj-cream/90">
          <li>To provide and maintain your account and subscription</li>
          <li>To process payments and manage billing through Stripe</li>
          <li>To send you the Weekend Briefing and other content you have opted into</li>
          <li>To respond to your inquiries and support requests</li>
          <li>To understand how our site is used and improve the experience</li>
        </ul>
      </div>

      {/* Email Communications */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          EMAIL COMMUNICATIONS
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          When you subscribe to our newsletter or create an account, you may
          receive periodic emails including the Weekend Briefing, new article
          alerts, and membership updates. Every email includes an unsubscribe
          link. We will never sell your email address to third parties.
        </p>
      </div>

      {/* Payment Processing */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          PAYMENT PROCESSING
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          All payments are processed securely through{" "}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            Stripe
          </a>
          . We never store your full credit card number, CVV, or banking details
          on our servers. Stripe handles all payment data in compliance with
          PCI-DSS standards. We retain only your Stripe customer ID and
          subscription status to manage your membership.
        </p>
      </div>

      {/* Analytics */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          ANALYTICS
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          We use privacy-focused analytics to understand how visitors interact
          with our site. We do not use Google Analytics. Our analytics do not
          track individual users across websites, do not use cookies for
          tracking, and comply with GDPR, CCPA, and PECR regulations.
        </p>
      </div>

      {/* Third-Party Services */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          THIRD-PARTY SERVICES
        </h2>
        <p className="mb-4 font-body text-lg leading-[1.8] text-bmj-cream/90">
          We use a limited number of third-party services to operate this platform:
        </p>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-[1.8] text-bmj-cream/90">
          <li><strong className="text-bmj-white">Stripe</strong> — Payment processing and subscription management</li>
          <li><strong className="text-bmj-white">Supabase</strong> — Database and authentication services</li>
          <li><strong className="text-bmj-white">Vercel</strong> — Website hosting and deployment</li>
        </ul>
        <p className="mt-4 font-body text-lg leading-[1.8] text-bmj-cream/90">
          Each service has its own privacy policy. We share only the minimum data
          necessary for each service to function.
        </p>
      </div>

      {/* Data Retention */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          DATA RETENTION
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          We retain your account data for as long as your account is active. If
          you cancel your subscription, we keep your account information for 90
          days in case you wish to resubscribe, after which it is permanently
          deleted. Newsletter subscribers can unsubscribe at any time, and their
          email address will be removed from our mailing list within 48 hours.
        </p>
      </div>

      {/* Your Rights */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          YOUR RIGHTS
        </h2>
        <p className="mb-4 font-body text-lg leading-[1.8] text-bmj-cream/90">
          You have the right to:
        </p>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-[1.8] text-bmj-cream/90">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent for email communications at any time</li>
          <li>Export your data in a portable format</li>
        </ul>
      </div>

      <StarDivider className="my-10" />

      {/* Contact */}
      <div>
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          CONTACT US
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          For any privacy-related questions or requests, contact us at{" "}
          <a
            href="mailto:privacy@blackmalejournal.com"
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            privacy@blackmalejournal.com
          </a>{" "}
          or through our{" "}
          <a
            href="/contact"
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            contact page
          </a>
          .
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`
Expected: Build succeeds with no errors. The `/privacy` route should appear in the build output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/privacy/page.tsx
git commit -m "feat: add Privacy Policy page with editorial brand styling"
```

---

## Chunk 3: Task 2 — Terms of Service Page

### Task 2: Terms of Service

**Files:**
- Create: `src/app/(public)/terms/page.tsx`

- [ ] **Step 1: Create the Terms of Service page**

Create `src/app/(public)/terms/page.tsx` with the following content:

```tsx
import type { Metadata } from "next";
import { StarDivider } from "@/components/ui/StarDivider";

export const metadata: Metadata = {
  title: "Terms of Service | The Black Male Journal",
  description: "Terms and conditions for using The Black Male Journal platform.",
};

export default function TermsOfServicePage() {
  return (
    <section className="mx-auto max-w-article px-6 py-16">
      <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
        Legal
      </p>
      <h1 className="mb-4 font-display text-5xl uppercase text-bmj-white md:text-6xl">
        TERMS OF SERVICE
      </h1>
      <p className="mb-10 font-mono text-xs text-bmj-tan/60">
        Last updated: March 15, 2026
      </p>

      <p className="mb-8 font-body text-lg leading-[1.8] text-bmj-cream/90">
        By accessing or using The Black Male Journal (&ldquo;the platform&rdquo;), you
        agree to be bound by these Terms of Service. If you do not agree with
        any part of these terms, you may not use the platform.
      </p>

      <StarDivider className="my-10" />

      {/* Account Terms */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          ACCOUNT TERMS
        </h2>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-[1.8] text-bmj-cream/90">
          <li>You must provide a valid email address to create an account.</li>
          <li>You are responsible for maintaining the security of your account and password.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
          <li>You must be at least 18 years old to create an account.</li>
          <li>One person or legal entity may not maintain more than one account.</li>
        </ul>
      </div>

      {/* Subscription & Billing */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          SUBSCRIPTION AND BILLING
        </h2>
        <p className="mb-4 font-body text-lg leading-[1.8] text-bmj-cream/90">
          Paid subscriptions are billed in advance on a monthly or annual basis.
          All payments are processed securely through{" "}
          <a
            href="https://stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            Stripe
          </a>
          .
        </p>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-[1.8] text-bmj-cream/90">
          <li>Subscription fees are non-refundable except as required by law.</li>
          <li>You may cancel your subscription at any time. Access continues until the end of the current billing period.</li>
          <li>We reserve the right to change subscription pricing with 30 days notice to existing subscribers.</li>
          <li>Failed payments may result in temporary suspension of premium access until payment is resolved.</li>
        </ul>
      </div>

      {/* Content Ownership */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          CONTENT OWNERSHIP
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          All content published on The Black Male Journal — including articles,
          briefings, images, graphics, and videos — is the intellectual property
          of The Black Male Journal unless otherwise stated. You may not
          reproduce, distribute, or create derivative works from our content
          without explicit written permission. Brief quotations for commentary,
          criticism, or news reporting are permitted under fair use, provided
          proper attribution is given.
        </p>
      </div>

      {/* Acceptable Use */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          ACCEPTABLE USE
        </h2>
        <p className="mb-4 font-body text-lg leading-[1.8] text-bmj-cream/90">
          When using the platform, you agree not to:
        </p>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-[1.8] text-bmj-cream/90">
          <li>Share your account credentials or premium content with non-subscribers</li>
          <li>Use automated systems to scrape, copy, or redistribute content</li>
          <li>Harass, threaten, or abuse other members of the community</li>
          <li>Upload malicious code or attempt to compromise the platform</li>
          <li>Impersonate The Black Male Journal or its representatives</li>
          <li>Use the platform for any unlawful purpose</li>
        </ul>
      </div>

      {/* Termination */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          TERMINATION
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          We reserve the right to suspend or terminate your account at our
          discretion if you violate these terms. You may delete your account at
          any time by contacting us. Upon termination, your right to access paid
          content ceases immediately. We are not obligated to provide refunds for
          the remaining subscription period in cases of termination for
          violations of these terms.
        </p>
      </div>

      {/* Disclaimers */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          DISCLAIMERS
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          The content published on The Black Male Journal is for informational
          and educational purposes only. It does not constitute medical, legal,
          financial, or professional advice. Health-related content under our
          Health lens is not a substitute for professional medical consultation.
          We make no warranties about the completeness, reliability, or accuracy
          of the information provided. Your use of the platform is at your own
          risk.
        </p>
      </div>

      <StarDivider className="my-10" />

      {/* Contact */}
      <div>
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          CONTACT
        </h2>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          Questions about these terms? Reach us at{" "}
          <a
            href="mailto:contact@blackmalejournal.com"
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            contact@blackmalejournal.com
          </a>{" "}
          or through our{" "}
          <a
            href="/contact"
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            contact page
          </a>
          .
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the full build passes**

Run: `npm run build`
Expected: Build succeeds. Both `/privacy` and `/terms` routes appear in the output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/terms/page.tsx
git commit -m "feat: add Terms of Service page with editorial brand styling"
```

---

## Verification

After both pages are built:

1. `npm run build` passes with zero errors
2. Both `/privacy` and `/terms` render correctly
3. Footer links at the bottom of every page navigate to the correct routes
4. Typography uses `font-body` (Libre Baskerville) for body, `font-display` (Bebas Neue) for headings
5. Content width is `max-w-article` (720px)
6. Links styled with `text-bmj-amber` and hover transition
