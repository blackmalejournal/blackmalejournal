---
title: BMJ — Single Source of Truth
authority: canonical
status: canonical
audience: [chairman, operators, engineers, agents, partners, designers]
last-verified: 2026-03-31
supersedes: bmj-platform-brief.md
---

# The Black Male Journal — Single Source of Truth (SSOT)

**One document** with the real substance: **nonprofit / business intent**, **plan**, **brand vibe and visual law**, **design tokens**, **lenses**, **every major reader and operator surface** (including **admin** and **dashboard** behavior), plus **roadmap** and **where code remains authoritative** when values must not drift.

**Still canonical in code (do not paraphrase for production):** `src/styles/brand.css` (colors/CSS variables), `tailwind.config.ts` (hex mirrors), `src/lib/seo.ts` (live site strings), `src/lib/supabase/types.ts` (schema shapes). This file **duplicates** them here for humans who need a **single exportable spec**; if anything disagrees, **update code first**, then this file in the same change.

**Repo process:** [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md). **Doc hygiene / agent tiers:** [`standards/agent-knowledge-protocol.md`](standards/agent-knowledge-protocol.md).

---

## 1. What BMJ is (institution & mission)

**The Black Male Journal** is an **independent media house** and **revolutionary masculinist platform**: long-form journalism, briefings, dispatches, academy (courses/lessons), handbooks, downloads, video, and **member** tools (portal, bookmarks, billing). It is organized as a **nonprofit-oriented** operation: institutional setup (incorporation, EIN, optional 501(c)(3)), domain and identity, banking and payments, and operator security are documented in **[`ops/nonprofit-setup-guide.md`](ops/nonprofit-setup-guide.md)** (phased: vault → legal/EIN → domain/email → banking → platforms).

**Elevator:** Serious editorial product for **Black male thought, discipline, and power**—not lifestyle fluff, not neutral “both sides” aggregation. Public positioning uses **five lenses** (below) so every story sits in **one** editorial frame.

**Tagline:** *Speak the Truth. Navigate the Consequences.*

**Default byline:** *The Chairman* (sole author in product defaults today).

**Site description (SEO / schema):** *Independent media house and revolutionary masculinist platform covering five lenses of Black male life.*

---

## 2. Business model & money

| Mechanism | Role |
|-----------|------|
| **Membership** | **Free**, **Basic** (~$9/mo), **Premium** (~$19/mo) via **Stripe** Checkout + Customer Portal; webhook updates `members` tier in Supabase. |
| **Donations** | One-time / recurring flows; public support copy and handles are centralized in code (`SUPPORT_PAYMENT_METHODS`, `SUPPORT_PATREON_URL` in `src/lib/seo.ts`). |
| **Patreon** | Canonical URL: `https://patreon.com/BlackMaleJournal` (also used in support surfaces). |
| **Cash App / Venmo / PayPal** | Public handles (examples): **$BlackMaleJournal**, **@BlackMaleJournal**, **paypal.me/BlackMaleJournal** — full list and links live in `seo.ts`. |

**Tier entitlements (product intent):**

| Tier | What readers get (summary) |
|------|----------------------------|
| **free** | Public articles, briefing previews, video gallery, academy catalog |
| **basic** | Full briefing archive, select handbooks, member resources |
| **premium** | All handbooks, downloads, gated content, early access |

**Code:** never compare tier strings by hand—use `includesTier` / `compareTiers` in `src/lib/membership.ts`.

---

## 3. Public identity (verbal — mirror of `src/lib/seo.ts`)

| Field | Value |
|-------|--------|
| Organization / site name | The Black Male Journal |
| Tagline | Speak the Truth. Navigate the Consequences. |
| Default author | The Chairman |
| General email | chairman@blackmalejournal.com |
| Privacy email | privacy@blackmalejournal.com |
| Support / contact email | contact@blackmalejournal.com |

**Chairman-facing checklist** (domains, handles, lenses, analytics expectations): [`ops/chairman-consistency-reference.md`](ops/chairman-consistency-reference.md).

---

## 4. Lenses (editorial taxonomy + UI)

Every lens-classified piece uses **exactly one** lens. **UI** accents come from `LENS_THEMES` in `src/lib/lens-theme.ts` (Tailwind `bmj-*` classes).

| Lens key | Reader-facing label (UI) | Accent (Tailwind) | Hex |
|----------|---------------------------|-------------------|-----|
| `health` | Health/Wellness | `bmj-amber` | `#C8852A` |
| `politics` | Politics/Law | `bmj-red` | `#C0281F` |
| `culture` | Culture/Ideology | `bmj-tan` | `#B8986A` |
| `entertainment` | Entertainment/Technology | `bmj-purple` | `#554978` |
| `business` | Business/Finance | `bmj-olive` | `#416100` |

**Editorial meaning (how topics are sorted):**

| Lens | Topics |
|------|--------|
| health | Physical/mental wellness, martial arts, discipline |
| politics | Power, policy, systems, community organizing |
| culture | Philosophy, identity, ideology, editorial, cultural analysis |
| entertainment | Media, technology, reviews |
| business | Finance, economics, entrepreneurship, career strategy |

**Rule:** use `getLensTheme(lens)` for UI; **never** hardcode lens colors in components.

---

## 5. Vibe, art direction, and brand attributes

**Core positioning (visual doctrine):** BMJ looks like **revolutionary editorial culture**—**militant** in posture, **print-led** in execution, **ideologically direct**. Lineage: liberation-era newspapers, political posters, movement literature, mimeograph and street-poster logic—**not** SaaS minimalism, not soft lifestyle branding. The reader should feel **addressed, challenged, and summoned into seriousness**.

**Brand attributes:** Militant · Confrontational (editorially) · Print-born · Masculine (gravitas, restraint) · Pan-African (historically literate) · Doctrinal · Editorially authoritative · Uncompromising.

**Visual principles (summary):** (1) Militant discipline—order, heavy type, strong silhouettes. (2) Confrontational clarity—headlines as declarations. (3) Revolutionary print lineage—not startup polish. (4) Tactile materiality—grain, halftone, paper warmth. (5) Masculine gravitas through restraint. (6) Pan-African historical consciousness in layout and portraiture. (7) Editorial authority—journal/briefing organ, not generic “content brand.”

**Full prose spec:** [`brand/art-direction-spec.md`](brand/art-direction-spec.md). **Implementation law (non-negotiables):** [`brand/invariants.md`](brand/invariants.md).

---

## 6. Design tokens (runtime — from `src/styles/brand.css`)

**Core palette**

| Token | Hex | Role |
|-------|-----|------|
| `--bmj-black` | `#0D0C0B` | Structural / canvas |
| `--bmj-cream` | `#E8DCC8` | Body text warmth |
| `--bmj-red` | `#C0281F` | Command, CTAs, urgency |
| `--bmj-amber` | `#C8852A` | Secondary / health lens |
| `--bmj-brown` | `#3B2417` | Secondary |
| `--bmj-tan` | `#B8986A` | Secondary / culture lens |
| `--bmj-white` | `#F2EDE4` | Paper highlight |

**Sectional / extended accents (use sparingly, often lens- or section-tied)**

| Token | Hex | Note |
|-------|-----|------|
| `--bmj-paper` | `#F0DDBC` | Lighter paper ground, cards |
| `--bmj-deep-black` | `#1C130E` | Heavier typographic weight |
| `--bmj-crimson` | `#712414` | Politics accent |
| `--bmj-medium-brown` | `#5D3F2E` | Culture / editorial accent |
| `--bmj-olive` | `#416100` | Palette olive green; **business** lens accent in UI (`LENS_THEMES`). **Health** lens uses **amber** in UI—see §4. |
| `--bmj-gold` | `#C77A0E` | Finance accent |
| `--bmj-purple` | `#554978` | Technology / entertainment lens (restraint) |

**Semantic surfaces & text (reference)**

| Token | Typical use |
|-------|-------------|
| `--bmj-surface-canvas` | Page ground |
| `--bmj-surface-panel` / `--bmj-surface-panel-strong` | Panels |
| `--bmj-surface-paper` | Paper-like cards |
| `--bmj-text-strong` / `--bmj-text-body` / `--bmj-text-muted` / `--bmj-text-subtle` | Hierarchy |
| `--bmj-border-subtle` / `--bmj-border-strong` / `--bmj-border-command` | Rules and emphasis |
| `--bmj-feature-overlay` | Overlays |

**Typography (families via CSS variables)**

| Role | Stack |
|------|--------|
| Display / headlines | Bebas Neue (`font-display`) — **uppercase** |
| Body | Libre Baskerville (`font-body`) |
| Labels / buttons | Oswald (`font-label`) — uppercase, wide tracking |
| Dates / issue stamps | IBM Plex Mono (`font-mono`) |

**Tracking scale:** `--tracking-display` (0.04em) through `--tracking-label-max` (0.4em) for display → wordmark → labels → stamps.

**Other:** `--text-micro` (10px), `--text-stamp` (11px); `--leading-article` 1.8; `--grain-opacity` 0.09; spacing `--space-xs`–`--space-2xl`; max widths `--width-content` 1200px, `--width-article` 720px, `--width-wide` 1440px.

**Tailwind:** use `bg-bmj-red`, `text-bmj-cream`, etc.; **hex in `tailwind.config.ts` must mirror** `brand.css` (opacity modifiers require literal hex in Tailwind).

---

## 7. Logo system & marks

| Asset | Use |
|-------|-----|
| **Primary logo** | Wordmark + journal/book icon — OG, about, print |
| **Alternate** | Compact wordmark — social, tight spaces |
| **Submark** | Book + star + pen nib — watermark, small UI |
| **Favicon** | Simplified star + pen nib |
| **`<BrandMark />`** | Canonical inline SVG in app |

**Files:** `public/logos/*` (naming `{type}-{variant}.{ext}`), `public/favicon.svg`, `public/og-image.svg`. **Placeholders:** `public/placeholders/{article|briefing|course|handbook|dispatch|download|cover}.svg` via `PLACEHOLDERS` in `src/lib/placeholders.ts`.

> **Extended Documentation:** See [`docs/brand/IMAGE-ASSET-ORGANIZATION.md`](brand/IMAGE-ASSET-ORGANIZATION.md) for complete asset inventory, naming conventions, and optimization standards. Use `src/lib/images.ts` for centralized logo paths and image utilities.

---

## 8. Non-negotiable UI / imagery rules (digest)

- **No** drop shadows on brand surfaces; **no** `bg-gradient-*`; **no** glassmorphism except minimal nav scroll (existing).
- **Border radius:** max **4px** (`rounded` / `rounded-sm` only).
- **Global grain** on the shell—do not duplicate a second full-screen grain.
- **Images:** editorial images use treated variants (halftone / duotone)—not raw stock polish.
- **Dividers:** `<StarDivider />` between major sections.
- **Prohibited vibes:** lifestyle grin stock, generic SaaS pills, soft “card” white boxes, random icon soup.

Full list: [`brand/invariants.md`](brand/invariants.md). **Colorful gallery (browser):** [`brand/visual-ssot.html`](brand/visual-ssot.html).

---

## 9. Services & surfaces (what the product *is* in URLs)

**Public reader / visitor** (`src/app/(public)/` — marketing + editorial)

| Path | Service |
|------|---------|
| `/` | Homepage — featured content, lenses, CTAs |
| `/articles`, `/articles/[slug]` | Long-form articles (lens, paywall by tier) |
| `/briefings`, `/briefings/[slug]` | Weekend Briefing–style issues |
| `/blog`, `/blog/[slug]` | **Dispatches** (short-form; `/blog` is intentional branding) |
| `/academy`, `/academy/[slug]`, `/academy/.../lesson` | Courses and lessons |
| `/handbooks`, `/handbooks/[slug]` | Handbook library |
| `/downloads` | Download library |
| `/records` | Records hub |
| `/video` | Video gallery |
| `/search` | Global search |
| `/about`, `/about/ethics` | About and ethics |
| `/contact`, `/support` | Contact and support (uses shared payment/support SSOT) |
| `/pricing` | Membership pricing |
| `/privacy`, `/terms` | Legal |

**Auth & account**

| Path | Service |
|------|---------|
| `/login`, `/signup` | Authentication |
| `/auth/callback` | OAuth / session callback |

**Member portal** (`(auth)/portal/` — logged-in members)

| Path | Service |
|------|---------|
| `/portal` | Portal home |
| `/portal/settings` | Profile and subscription management |
| `/portal/bookmarks` | Saved content |

**Admin CMS & command center** (`(auth)/admin/` — role-gated editors/admins)

| Path | Service |
|------|---------|
| `/admin` | **Dashboard** — command-center home: metrics, attention queue, shortcuts (implementation uses `admin-insights` + dashboard cards) |
| `/admin/articles` | Articles CRUD + publish workflow |
| `/admin/briefings` | Briefings CRUD |
| `/admin/dispatches` | Dispatches CRUD |
| `/admin/handbooks` | Handbooks CRUD |
| `/admin/downloads` | Downloads CRUD |
| `/admin/courses` | Courses + nested lessons CRUD |
| `/admin/members` | Members |
| `/admin/subscribers` | Subscribers / list tooling |
| `/admin/messages` | Inbound messages triage |
| `/admin/campaigns` | Email / campaign tooling |

**APIs** (`src/app/api/`): Stripe checkout, webhook, billing portal, contact, newsletter, search, admin upload, exports, etc.

**Path constants in code:** `PATHS` in `src/lib/paths.ts` must stay aligned with these routes for nav, sitemap, redirects, and tests.

### 9.1 Service axes (business + product operating model)

BMJ runs on eight explicit service axes. This is the simplest map of what the organization actually operates:

| Axis | Core question | Primary surfaces |
|------|----------------|------------------|
| Editorial production | What gets written and published next? | `/admin/*` content domains, workflow statuses |
| Editorial distribution | How readers discover and consume work? | homepage, listing routes, detail routes, search |
| Education | How skill/discipline knowledge compounds? | `/academy/*`, courses, lessons |
| Membership conversion | How anonymous readers become supporters? | `/pricing`, paywall gates, support CTAs |
| Membership retention | Why paying members stay and return? | `/portal`, bookmarks, handbooks/download depth |
| Audience operations | How inbound messages/subscribers are handled? | `/admin/messages`, `/admin/subscribers`, contact/newsletter APIs |
| Revenue operations | Is billing healthy and reconcilable? | Stripe checkout/webhook/portal, `/admin/members` |
| Governance & trust | Is the institution coherent and safe? | legal routes, docs SSOT, env/secrets controls |

### 9.2 Admin dashboard mechanics (owner command center)

The admin home (`/admin`) is not a decorative overview; it is an **action dashboard** that computes pressure and routes operator attention.

**Dashboard composition**

- `KeyMetricsGrid`: top-level signals across pipeline, inbox, members, subscribers.
- `AttentionQueueSection`: prioritized incidents (backlog, stale pipeline, billing exceptions, churn).
- `PublishingQueueSection`: upcoming scheduled publish windows.
- `EditorialPipelineSection`: status mix + stale content pressure.
- `AudienceBillingSection`: member and subscriber health.
- `RecentActivitySection`: Created/Scheduled/Published timeline.
- `TopSourcesSection`: active subscriber source concentration.
- `AdminCoverageSection`: counts + deep links for all admin domains.
- `QuickActionsSection`: one-click operator actions.

**Signal logic (from `src/lib/admin-insights.ts`)**

| Signal | Rule |
|--------|------|
| **Overdue inbox** | Message is `new` or `in_progress` and age is **>= 3 days**. |
| **Stale draft/review** | Content in `draft`/`review` older than **14 days** enters stale queue. |
| **Scheduled issue** | `scheduled` item with no publish time or publish time in the past is **critical stale**. |
| **Scheduled soon** | `scheduled` item with publish time within next **7 days** appears in queue. |
| **Billing exception** | Member tier != `free` and missing Stripe customer or subscription reference. |
| **Subscriber net** | `netPast30Days = newPast30Days - churnPast30Days`; negative net is warning. |

**Operational intent:** each computed warning must map to a reachable route (`PATHS.ADMIN_*`) so the operator can clear risk quickly without manual hunting.

### 9.3 Admin information architecture (domain-level)

| Domain | Primary list route | Typical create/edit routes |
|--------|---------------------|----------------------------|
| Articles | `/admin/articles` | `/admin/articles/new`, `/admin/articles/[id]/edit` |
| Briefings | `/admin/briefings` | `/admin/briefings/new`, `/admin/briefings/[id]/edit` |
| Dispatches | `/admin/dispatches` | `/admin/dispatches/new`, `/admin/dispatches/[id]/edit` |
| Handbooks | `/admin/handbooks` | `/admin/handbooks/new`, `/admin/handbooks/[id]/edit` |
| Downloads | `/admin/downloads` | `/admin/downloads/new`, `/admin/downloads/[id]/edit` |
| Courses | `/admin/courses` | `/admin/courses/new`, `/admin/courses/[id]/edit` |
| Lessons (nested) | `/admin/courses/[id]` | `/admin/courses/[id]/lessons/new`, `/admin/courses/[id]/lessons/[lessonId]/edit` |
| Members | `/admin/members` | `/admin/members/[id]` |
| Subscribers | `/admin/subscribers` | list/ops currently route-first |
| Messages | `/admin/messages` | list/triage currently route-first |
| Campaigns | `/admin/campaigns` | `/admin/campaigns/new`, `/admin/campaigns/[id]/edit` |

---

## 10. Content model & editorial status

**Types (fields summarized):** Articles, Briefings (structured sections), Dispatches, Handbooks, Downloads, Courses, Lessons, Members — **full shapes** in `src/lib/supabase/types.ts`.

**Status workflow:** `draft → review → scheduled → published → archived → withdrawn`.

**Access:** each content row carries `access_tier`; gating uses `checkContentAccess` and `PaywallGate` on public pages.

---

## 11. Technical stack & integrations

| Layer | Technology |
|-------|-------------|
| App | Next.js 16 App Router, React 19, TypeScript strict |
| Styling | Tailwind + `brand.css` variables |
| Data | Supabase (Postgres, Auth, Storage) |
| Payments | Stripe |
| Email | Resend (e.g. contact) |
| Hosting | Vercel |
| Analytics | Plausible (optional) |

**Security:** service-role Supabase and Stripe secrets are **server-only**—never `NEXT_PUBLIC_*`. **Env catalog:** [`ops/env-vars.md`](ops/env-vars.md).

---

## 12. Plan & roadmap (execution)

### Audit remediation — **Done**

Admin query coverage, admin modularization, `PATHS` governance, E2E smoke + optional admin/member journeys (see [`audits/2026-03-25-codebase-audit-remediation-plan.md`](audits/2026-03-25-codebase-audit-remediation-plan.md)).

### Superpowers plans

| Priority | Plan | Status |
|----------|------|--------|
| P1 | Search enhancement | Shipped |
| P2 | Member bookmarks | Shipped |
| P3 | Email campaigns (admin) | Shipped |
| P4 | Repo cleanup / UI audit | In progress — residual layers per plan |
| — | Admin command center roadmap | Largely shipped |

**External blockers** (dashboards, DNS, Stripe products): [`DEFERRALS.md`](DEFERRALS.md), [`ops/launch-dashboard-checklist.md`](ops/launch-dashboard-checklist.md).

---

## 13. Quality gates (before release)

`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run test:e2e`; `verify:docs-links`, `verify:docs-frontmatter`, `secrets:check` as applicable. Details: [`CLAUDE.md`](../CLAUDE.md), [`DEVELOPER.md`](DEVELOPER.md).

---

## 14. Governance invariants (digest)

| ID | Rule |
|----|------|
| I-1 | One truth per domain—tokens in `brand.css`; env in `ops/env-vars.md`; types in `types.ts`; **this file** for rolled-up human SSOT. |
| I-2 | Tailwind hex mirrors `brand.css`. |
| I-3–I-7 | Commits, scope, entropy, refusal, minimal `NEXT_PUBLIC_` — see [`AGENTS.md`](../AGENTS.md). |

---

## 15. Revision log

| Date | Note |
|------|------|
| 2026-03-31 | Expanded into **substantive** SSOT: nonprofit/business, tokens, vibe, lenses, services (public/member/admin), dashboard/admin routes, integrations. |
| 2026-03-31 | Prior: single-file program SSOT; `bmj-platform-brief.md` remains alias. |
