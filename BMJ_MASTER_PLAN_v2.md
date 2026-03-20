# THE BLACK MALE JOURNAL — MASTER BUILD PLAN v2.0
### Independent Media House · Revolutionary Masculinist Platform
*Optimized for Claude Code CLI (Windows) · Full Implementation Blueprint*

---

## TABLE OF CONTENTS

1. [Brand Identity](#brand-identity)
2. [Phase 0 — Legal & Infrastructure](#phase-0)
3. [Phase 1 — Windows Environment + Claude Code Setup](#phase-1)
4. [Phase 2 — CLAUDE.md Project Memory](#phase-2)
5. [Phase 3 — Custom Slash Commands](#phase-3)
6. [Phase 4 — Architecture & Database](#phase-4)
7. [Phase 5 — Design System](#phase-5)
8. [Phase 6 — Feature Build Sessions](#phase-6)
9. [Phase 7 — Revenue & Subscriptions](#phase-7)
10. [Phase 8 — Deployment & DNS](#phase-8)
11. [Phase 9 — Analytics & SEO](#phase-9)
12. [Phase 10 — Post-Launch](#phase-10)
13. [Daily Workflow Quick Reference](#daily-workflow)
14. [Outstanding From Chairman](#outstanding)

---

<a id="brand-identity"></a>
## 1. BRAND IDENTITY (Extracted from IG — Do Not Deviate)

### Color Palette
```
--bmj-black:       #0D0C0B   /* near-black background — used on all main pages */
--bmj-cream:       #E8DCC8   /* aged paper / parchment — primary text on dark */
--bmj-red:         #C0281F   /* revolutionary red, star icon, accent borders */
--bmj-amber:       #C8852A   /* warm quote cards, highlight panels */
--bmj-brown:       #3B2417   /* deep shadow tones, secondary backgrounds */
--bmj-tan:         #B8986A   /* halftone mid-tone, metadata text, dates */
--bmj-white:       #F2EDE4   /* off-white for maximum contrast text */
```

**Rules:** No pastels. No gradients. No purple. No blue. No neon. Every color must feel like it belongs on a 1968 printed poster.

### Typography Stack
```
Display / Headlines:  "Bebas Neue" or "Anton"         — bold, condensed, ALL-CAPS always
Body / Articles:      "Libre Baskerville" or "Lora"    — editorial serif, readable at length
Accent / Labels:      "Oswald"                         — caps, wide tracking, Weekend Briefing header
Monospace / Dates:    "IBM Plex Mono"                  — issue numbers, dates, metadata
```

**Loading:** All fonts via Google Fonts `next/font/google` — no external CDN calls. Subset to `latin` for speed.

### Visual Language
- Vintage revolutionary poster meets editorial newspaper grid
- Afrocentric propaganda art aesthetic — Black Panther Party pamphlet energy
- Halftone dot textures, film grain overlays, aged paper backgrounds
- High contrast compositions — cream text on near-black, red accent lines
- Photography treated with duotone or high-contrast black & white filters
- Three Lenses iconography: Politics 🖤 | Philosophy 🩷 | Health 🫀
- Star motif (from logo) used as section dividers and bullet replacements
- Every page should feel like a printed document of historical record

### Logo Assets Needed from Chairman
- [ ] Profile mark (star + figure silhouette) — SVG + PNG transparent bg
- [ ] Wordmark "THE BLACK MALE JOURNAL" — SVG + PNG
- [ ] Weekend Briefing lockup — SVG
- [ ] Favicon: 32×32 `.ico` and 180×180 `apple-touch-icon.png`
- [ ] Social share default image: 1200×630 OG image

---

<a id="phase-0"></a>
## 2. PHASE 0 — LEGAL & INFRASTRUCTURE (Before Any Code)

### Week 1 Checklist — This Exact Order:

**Step 1: EIN (Day 1 — 15 minutes — free)**
→ irs.gov → Form SS-4 online → you get your number immediately
→ This unlocks everything else. Do it first.

**Step 2: Virtual Mailbox (Day 1 — ~$15/mo)**
→ ipostal1.com → real street address + dedicated phone number
→ Serves as registered agent address for incorporation
→ Covers three requirements in one: mailing address, phone, registered agent

**Step 3: Bylaws + Conflict of Interest Policy (Day 2-3)**
→ Draft bylaws naming minimum 3 board members
→ All board members sign conflict of interest policy
→ Templates available from National Council of Nonprofits (free)
→ Required before federal filing

**Step 4: Articles of Incorporation (Day 3-4 — $40-100)**
→ File on your state's Secretary of State website
→ Need EIN + registered agent address from Steps 1-2

**Step 5: Business Bank Account (The day EIN arrives)**
→ Bring EIN confirmation letter + Articles of Incorporation
→ Open checking account under "The Black Male Journal Inc."
→ This is where Stripe payouts and donations flow

**Step 6: 501(c)(3) Application (Week 2+ — $275 or $600)**
→ Form 1023 (streamlined if under $50k projected revenue = $275)
→ Form 1023 full ($600 if over $50k projected)
→ Consider attorney review for this step only
→ IRS response takes 3-6 months
→ ⚠️ DO NOT promise tax-deductible donations until determination letter arrives

**Step 7: Custom Email (Day 1 — can do in parallel)**
→ Set up info@blackmalejournal.com, chairman@blackmalejournal.com, support@blackmalejournal.com
→ Google Workspace ($6/user/mo) or Zoho Mail (free tier for 5 users)

**Step 8: Domain Transfer (Day 1 — takes 5-7 days)**
→ Move domain from Bluehost to Squarespace (for DNS management only)
→ Squarespace will manage DNS records pointing to Vercel

**Realistic Total Legal Budget: $400-700**

### Required Legal Pages (build these before launch)
- Privacy Policy — required once you collect emails, payments, or member data
- Terms of Service — required for paid memberships
- Cookie Policy — if using any analytics or tracking
- Refund/Cancellation Policy — for subscription tiers

---

<a id="phase-1"></a>
## 3. PHASE 1 — WINDOWS ENVIRONMENT + CLAUDE CODE SETUP

### 1.1 Install Prerequisites (PowerShell as Administrator)
```powershell
# Install core tools via winget (comes with Windows 10/11)
winget install OpenJS.NodeJS.LTS      # Node.js 20+
winget install Git.Git                 # Git
winget install Microsoft.VisualStudioCode  # VS Code

# IMPORTANT: Close and reopen your terminal after installing

# Verify installations
node --version    # should show v20.x or v22.x
npm --version     # should show 10.x+
git --version     # should show 2.x+

# Configure git (replace with Chairman's info)
git config --global user.name "Black Male Journal"
git config --global user.email "chairman@blackmalejournal.com"
```

### 1.2 Install Claude Code CLI
```powershell
# Install globally
npm install -g @anthropic-ai/claude-code

# Authenticate with your Anthropic account
claude login

# Verify
claude --version
```

### 1.3 Create the Project
```powershell
# Create project directory
mkdir C:\Projects\blackmalejournal
cd C:\Projects\blackmalejournal

# Initialize Next.js with all the right flags
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
# When prompted:
#   ESLint? → Yes
#   Turbopack? → Yes (faster dev server)

# Initialize git
git init
git add .
git commit -m "chore: initial Next.js scaffold"
```

### 1.4 Install All Dependencies (one block)
```powershell
# Core platform
npm install @supabase/supabase-js stripe @stripe/stripe-js

# UI and animation
npm install lucide-react framer-motion next-themes class-variance-authority clsx tailwind-merge

# Content
npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter reading-time rehype-highlight remark-gfm

# Email
npm install resend

# Validation
npm install zod

# Analytics
npm install @plausible/tracker

# Dev dependencies
npm install -D prettier eslint-config-prettier @types/mdx

# Commit the dependency additions
git add .
git commit -m "chore: install all project dependencies"
```

### 1.5 Launch Claude Code
```powershell
# Open in VS Code
code .

# In a separate terminal, launch Claude Code in the project
cd C:\Projects\blackmalejournal
claude
```

---

<a id="phase-2"></a>
## 4. PHASE 2 — CLAUDE.md (Project Memory — THIS IS THE SECRET WEAPON)

**What is CLAUDE.md?** It's a file Claude Code reads automatically every time you start a session. It gives Claude persistent context about your project — brand rules, architecture decisions, file conventions, and anything you don't want to repeat.

**Create this file at the project root: `C:\Projects\blackmalejournal\CLAUDE.md`**

```markdown
# THE BLACK MALE JOURNAL — Project Instructions

## What This Project Is
A full-stack website for The Black Male Journal, an independent media house and revolutionary
masculinist platform. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase,
and Stripe. Deployed on Vercel.

## Brand System — NEVER deviate from these values
Colors (use CSS variables from src/styles/brand.css):
- --bmj-black: #0D0C0B (backgrounds)
- --bmj-cream: #E8DCC8 (primary text on dark)
- --bmj-red: #C0281F (accents, star icon, borders)
- --bmj-amber: #C8852A (quote cards, highlights)
- --bmj-brown: #3B2417 (secondary backgrounds)
- --bmj-tan: #B8986A (metadata, dates)
- --bmj-white: #F2EDE4 (maximum contrast text)

Fonts (loaded via next/font/google):
- Display/Headlines: Bebas Neue — always ALL-CAPS
- Body: Libre Baskerville — editorial serif
- Labels: Oswald — caps, wide tracking
- Mono: IBM Plex Mono — dates, issue numbers

PROHIBITED: pastels, gradients, purple, blue, neon, rounded corners > 4px,
drop shadows, glassmorphism, or any "modern SaaS" aesthetic.

Visual: Vintage propaganda poster + newspaper grid + Black Panther pamphlet energy.
Textures: grain overlay on all sections, halftone dots on images.

## Three Lenses (Content Taxonomy)
All articles and content are categorized under exactly one lens:
- health — physical/mental wellness, martial arts, discipline
- philosophy — purpose, identity, masculinity, mindset
- politics — power, policy, systems, community organizing

## Architecture Rules
- App Router only (no pages/ directory)
- All routes under src/app/(public)/ for public pages
- Auth routes under src/app/(auth)/
- API routes under src/app/api/
- Components: src/components/ui/ (primitives), /brand/ (logo, headers), /content/ (cards), /layout/ (nav, footer), /portal/ (member area)
- Content files: src/content/articles/*.mdx and src/content/briefings/*.mdx
- Lib: src/lib/supabase/, src/lib/stripe/, src/lib/analytics/

## Code Style
- Use TypeScript strict mode
- Tailwind for all styling — no CSS modules, no styled-components
- Use CSS variables (var(--bmj-*)) for all brand colors in Tailwind config
- Server Components by default, "use client" only when needed
- Zod for all form validation and API input validation
- Use lucide-react for icons
- Framer Motion for page transitions and scroll animations only — keep it subtle

## Content Model
- Articles: title, slug, lens, tags[], excerpt, body (MDX), featured, access_tier (free|basic|premium), author, cover_image, published_at
- Briefings: issue_number, title, slug, sections (JSON array of {title, body}), access_tier, cover_image, published_at
- Members: email, tier (free|basic|premium), stripe_customer_id, stripe_subscription_id

## Access Tiers
- free: all public articles, briefing previews, video gallery, academy
- basic: full briefing archive, select handbooks, member forum access
- premium: everything — all handbooks, downloads, private content, early access

## File Naming
- Components: PascalCase (ArticleCard.tsx)
- Pages: lowercase with hyphens if needed
- Utilities: camelCase
- MDX content: kebab-case (weekend-briefing-001.mdx)

## Git Commits
Follow conventional commits: feat:, fix:, chore:, docs:, style:, refactor:, test:
Example: "feat: add Weekend Briefing archive page with lens filter"

## Testing
- Verify `npm run build` passes before any commit
- Check TypeScript with `npx tsc --noEmit`
- Visual check: every page must look correct at 375px (mobile) and 1440px (desktop)

## Important Notes
- Weekend Briefing is the flagship content format — it gets special design treatment
- The Chairman is the sole author for now — default all author fields to "The Chairman"
- Star motif from the logo is used as section dividers (horizontal rule replacement)
- All images should have grain/halftone treatment applied via CSS
```

**This file is your superpower.** Every time you run `claude` in the project, it reads this automatically. No more re-explaining the brand, the architecture, or the conventions.

---

<a id="phase-3"></a>
## 5. PHASE 3 — CUSTOM SLASH COMMANDS (Reusable Project Tools)

### Setup the Commands Directory
```powershell
mkdir .claude\commands
```

### Command 1: /project:new-article
**File: `.claude/commands/new-article.md`**
```markdown
Create a new article MDX file in src/content/articles/.

Ask me for:
1. Title
2. Lens (health, philosophy, or politics)
3. Tags (comma-separated)
4. Brief excerpt (1-2 sentences)
5. Access tier (free, basic, or premium — default free)
6. Featured? (yes/no — default no)

Then generate the file with:
- Slug auto-generated from title (kebab-case)
- publishedAt set to today's date in ISO format
- author defaulted to "The Chairman"
- Proper MDX frontmatter format
- A starter body section with ## headings matching the BMJ editorial style
- Reading time estimate placeholder

File naming: src/content/articles/[slug].mdx
```

### Command 2: /project:new-briefing
**File: `.claude/commands/new-briefing.md`**
```markdown
Create a new Weekend Briefing MDX file in src/content/briefings/.

Ask me for:
1. Issue number (check existing files to auto-suggest next number)
2. Headline / title
3. Number of sections (default 3)
4. Section titles

Then generate:
- File: src/content/briefings/weekend-briefing-[issue-number].mdx
- publishedAt set to today's date
- The "WEEKEND BRIEFING / [DATE]" header format matching the IG posts
- BriefingHeader component import at the top
- Each section with ## heading and placeholder body text
- Access tier defaulted to "free"
```

### Command 3: /project:deploy-check
**File: `.claude/commands/deploy-check.md`**
```markdown
Run the full pre-deployment checklist in this exact order:

1. Run `npx tsc --noEmit` — report any TypeScript errors
2. Run `npm run lint` — report any linting issues
3. Run `npm run build` — report any build failures

If ALL three pass, output:
✅ All checks passed — ready to deploy to Vercel.

If ANY fail, output the errors with file paths and line numbers, then suggest fixes.
Do not proceed to the next check if the current one fails — fix first.
```

### Command 4: /project:brand-check
**File: `.claude/commands/brand-check.md`**
```markdown
Audit the entire project for brand compliance:

1. Search all .tsx, .css, and .ts files for hex color codes
   - Flag any color that is NOT one of the 7 --bmj-* values
   - Flag any hardcoded hex instead of using var(--bmj-*)

2. Check font usage
   - Verify only Bebas Neue, Libre Baskerville, Oswald, and IBM Plex Mono are referenced
   - Flag any other font families

3. Check for prohibited styles
   - No border-radius larger than 4px (no pill shapes, no rounded-xl)
   - No drop shadows or box-shadows (except subtle 1px borders)
   - No gradients (no bg-gradient-*)
   - No glassmorphism (no backdrop-blur)

4. Verify grain texture overlay is applied to main layout

Report all violations with file paths and line numbers.
```

### Command 5: /project:seed-content
**File: `.claude/commands/seed-content.md`**
```markdown
Generate seed/sample content for the database:

Create a seed script at scripts/seed.ts that:
1. Inserts 9 articles (3 per lens: health, philosophy, politics)
   - Mix of free and premium access tiers
   - 2 featured articles total
   - Realistic titles and excerpts matching the BMJ voice
   - Each with 2-4 relevant tags

2. Inserts 3 Weekend Briefings (issues 1-3)
   - Each with 3 sections
   - Issue 1 = free, Issue 2 = free, Issue 3 = basic

3. Uses the Supabase client from src/lib/supabase/

Make the content reflect the revolutionary masculinist tone — strong, direct,
historically grounded. Reference real topics: stoicism, physical training,
political organization, mental resilience, community building.
```

### Command 6: /project:component
**File: `.claude/commands/component.md`**
```markdown
Scaffold a new component. Ask me for:
1. Component name
2. Directory (ui, brand, content, layout, or portal)
3. Client or server component? (default: server)
4. Does it need props? If so, what?

Then create:
- src/components/[directory]/[ComponentName].tsx
- TypeScript interface for props (if any)
- JSDoc comment describing the component's purpose
- Proper imports (lucide-react for icons, brand CSS variables for colors)
- Responsive by default (mobile-first Tailwind)
- Follows the BMJ visual language from CLAUDE.md
```

---

<a id="phase-4"></a>
## 6. PHASE 4 — ARCHITECTURE & DATABASE

### 4.1 Project Structure
```
blackmalejournal/
├── CLAUDE.md                           ← Claude Code reads this automatically
├── .claude/
│   └── commands/                       ← Custom slash commands live here
│       ├── new-article.md
│       ├── new-briefing.md
│       ├── deploy-check.md
│       ├── brand-check.md
│       ├── seed-content.md
│       └── component.md
├── public/
│   ├── textures/
│   │   └── grain.png                   ← Halftone grain overlay texture
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-wordmark.svg
│   │   ├── og-default.jpg              ← 1200×630 social share image
│   │   └── favicon.ico
│   └── fonts/                          ← Fallback only — prefer next/font
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ← Root layout: fonts, nav, footer, grain overlay, theme
│   │   ├── page.tsx                    ← Home: hero banner, bio, latest briefing, rotating quote
│   │   ├── (public)/
│   │   │   ├── about/page.tsx          ← Mission, media house story, board members
│   │   │   ├── academy/page.tsx        ← Course grid: martial arts, mental health, relationships, purpose, branding
│   │   │   ├── resources/page.tsx      ← Articles + handbooks + briefing archive with lens filters
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx            ← Full article archive with lens/tag filters
│   │   │   │   └── [slug]/page.tsx     ← Individual article (paywall-aware)
│   │   │   ├── briefing/
│   │   │   │   ├── page.tsx            ← Weekend Briefing archive list
│   │   │   │   └── [slug]/page.tsx     ← Individual briefing (paywall-aware)
│   │   │   ├── video/page.tsx          ← YouTube embed gallery (pulled from RSS/API)
│   │   │   ├── blog/page.tsx           ← Blog feed (shorter posts, updates, announcements)
│   │   │   ├── contact/page.tsx        ← Form (Resend), WhatsApp, mailing list signup, SMS
│   │   │   ├── privacy/page.tsx        ← Privacy policy
│   │   │   └── terms/page.tsx          ← Terms of service
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          ← Supabase auth (email magic link or password)
│   │   │   ├── signup/page.tsx         ← Registration with tier selection
│   │   │   └── portal/
│   │   │       ├── page.tsx            ← Member dashboard: tier badge, saved content, account
│   │   │       ├── handbooks/page.tsx  ← Downloadable premium handbooks
│   │   │       └── settings/page.tsx   ← Account settings, subscription management
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/route.ts   ← Create Stripe Checkout session
│   │   │   │   └── webhook/route.ts    ← Handle subscription events
│   │   │   ├── newsletter/
│   │   │   │   └── subscribe/route.ts  ← Email list signup
│   │   │   └── contact/route.ts        ← Contact form submission (via Resend)
│   │   └── not-found.tsx               ← Custom 404 matching brand
│   ├── components/
│   │   ├── ui/                         ← Design primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx               ← Lens badges (health/philosophy/politics)
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── StarDivider.tsx         ← Star motif horizontal rule
│   │   │   └── GrainOverlay.tsx        ← Film grain texture component
│   │   ├── brand/
│   │   │   ├── Logo.tsx                ← Star + figure mark
│   │   │   ├── Wordmark.tsx            ← "THE BLACK MALE JOURNAL" text mark
│   │   │   ├── BriefingHeader.tsx      ← "WEEKEND BRIEFING / [DATE]" lockup
│   │   │   └── LensBadge.tsx           ← Color-coded lens indicator
│   │   ├── content/
│   │   │   ├── ArticleCard.tsx         ← Card for article grid
│   │   │   ├── BriefingCard.tsx        ← Card for briefing archive
│   │   │   ├── VideoCard.tsx           ← YouTube embed card
│   │   │   ├── CourseCard.tsx          ← Academy course card
│   │   │   ├── QuoteRotator.tsx        ← Rotating inspirational quotes
│   │   │   └── PaywallGate.tsx         ← Blurred content + CTA for non-members
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              ← Main navigation
│   │   │   ├── MobileMenu.tsx          ← Hamburger menu for mobile
│   │   │   ├── Footer.tsx              ← Links, socials, newsletter CTA
│   │   │   └── Sidebar.tsx             ← Optional sidebar for article pages
│   │   └── portal/
│   │       ├── MemberDashboard.tsx     ← Portal overview
│   │       ├── TierBadge.tsx           ← Free/Basic/Premium visual indicator
│   │       └── SubscriptionManager.tsx ← Upgrade/cancel/manage billing
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              ← Browser client
│   │   │   ├── server.ts              ← Server client (for Server Components + API routes)
│   │   │   ├── middleware.ts           ← Auth session refresh
│   │   │   └── queries.ts             ← Typed query helpers (getArticles, getBriefings, etc.)
│   │   ├── stripe/
│   │   │   ├── client.ts              ← Stripe instance
│   │   │   ├── config.ts              ← Price IDs, tier mapping
│   │   │   └── helpers.ts             ← createCheckoutSession, manageSubscription
│   │   ├── content/
│   │   │   └── mdx.ts                 ← MDX parsing, frontmatter extraction, reading time
│   │   ├── analytics/
│   │   │   └── plausible.ts           ← Plausible event helpers
│   │   └── utils.ts                   ← cn() helper, date formatting, slug generation
│   ├── content/
│   │   ├── articles/                   ← .mdx article files
│   │   └── briefings/                  ← .mdx briefing files
│   ├── styles/
│   │   ├── globals.css                ← Tailwind directives + base styles
│   │   └── brand.css                  ← All --bmj-* CSS custom properties
│   └── middleware.ts                   ← Supabase auth session refresh on every request
├── scripts/
│   └── seed.ts                        ← Database seed script
├── .env.local                          ← Environment variables (NEVER commit)
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.2 Supabase Schema
```sql
-- ================================================================
-- RUN THIS IN SUPABASE SQL EDITOR (Dashboard → SQL Editor → New Query)
-- ================================================================

-- 1. ARTICLES
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body text,                          -- MDX content or reference to .mdx file
  lens text not null check (lens in ('health', 'philosophy', 'politics')),
  tags text[] default '{}',
  featured boolean default false,
  published_at timestamptz,
  author text default 'The Chairman',
  cover_image text,                   -- URL or path to image
  access_tier text default 'free' check (access_tier in ('free', 'basic', 'premium')),
  reading_time int,                   -- estimated minutes
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. WEEKEND BRIEFINGS
create table public.briefings (
  id uuid primary key default gen_random_uuid(),
  issue_number int unique not null,
  title text not null,
  slug text unique not null,
  published_at timestamptz not null,
  cover_image text,
  sections jsonb not null default '[]',  -- [{title: string, body: string}]
  access_tier text default 'free' check (access_tier in ('free', 'basic', 'premium')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. MEMBERS (linked to Supabase Auth)
create table public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  tier text default 'free' check (tier in ('free', 'basic', 'premium')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscribed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. NEWSLETTER SUBSCRIBERS (separate from members — not everyone signs up)
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz,
  source text default 'website'       -- 'website', 'footer', 'popup', 'contact'
);

-- 5. CONTACT FORM SUBMISSIONS
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- 6. COURSES (Academy)
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  category text check (category in ('martial-arts', 'mental-health', 'relationships', 'purpose', 'branding')),
  thumbnail text,
  access_tier text default 'free' check (access_tier in ('free', 'basic', 'premium')),
  sort_order int default 0,
  published boolean default false,
  created_at timestamptz default now()
);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table public.articles enable row level security;
alter table public.briefings enable row level security;
alter table public.members enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.courses enable row level security;

-- Public can read published free content
create policy "anyone_reads_free_articles" on public.articles
  for select using (access_tier = 'free' and published_at is not null and published_at <= now());

create policy "anyone_reads_free_briefings" on public.briefings
  for select using (access_tier = 'free' and published_at <= now());

create policy "anyone_reads_published_courses" on public.courses
  for select using (published = true);

-- Authenticated members can read content matching their tier
create policy "members_read_tier_articles" on public.articles
  for select using (
    auth.uid() is not null
    and published_at is not null
    and published_at <= now()
    and (
      access_tier = 'free'
      or (access_tier = 'basic' and exists (
        select 1 from public.members where id = auth.uid() and tier in ('basic', 'premium')
      ))
      or (access_tier = 'premium' and exists (
        select 1 from public.members where id = auth.uid() and tier = 'premium'
      ))
    )
  );

create policy "members_read_tier_briefings" on public.briefings
  for select using (
    auth.uid() is not null
    and published_at <= now()
    and (
      access_tier = 'free'
      or (access_tier = 'basic' and exists (
        select 1 from public.members where id = auth.uid() and tier in ('basic', 'premium')
      ))
      or (access_tier = 'premium' and exists (
        select 1 from public.members where id = auth.uid() and tier = 'premium'
      ))
    )
  );

-- Members can read their own profile
create policy "members_read_own" on public.members
  for select using (auth.uid() = id);

-- Members can update their own profile
create policy "members_update_own" on public.members
  for update using (auth.uid() = id);

-- Anyone can insert newsletter signups
create policy "anyone_subscribes_newsletter" on public.newsletter_subscribers
  for insert with check (true);

-- Anyone can submit contact form
create policy "anyone_submits_contact" on public.contact_submissions
  for insert with check (true);

-- ================================================================
-- INDEXES (for query performance)
-- ================================================================
create index idx_articles_lens on public.articles(lens);
create index idx_articles_published on public.articles(published_at desc);
create index idx_articles_slug on public.articles(slug);
create index idx_articles_featured on public.articles(featured) where featured = true;
create index idx_briefings_published on public.briefings(published_at desc);
create index idx_briefings_issue on public.briefings(issue_number desc);
create index idx_members_email on public.members(email);
create index idx_members_stripe on public.members(stripe_customer_id);

-- ================================================================
-- AUTO-UPDATE TIMESTAMPS
-- ================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at before update on public.articles
  for each row execute function update_updated_at();

create trigger briefings_updated_at before update on public.briefings
  for each row execute function update_updated_at();

create trigger members_updated_at before update on public.members
  for each row execute function update_updated_at();
```

### 4.3 Supabase Auth Trigger (Auto-create member on signup)
```sql
-- When a new user signs up via Supabase Auth, auto-create a member row
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.members (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

<a id="phase-5"></a>
## 7. PHASE 5 — DESIGN SYSTEM IMPLEMENTATION

### 5.1 brand.css — All Design Tokens
```css
/* src/styles/brand.css — imported in globals.css */
:root {
  --bmj-black:   #0D0C0B;
  --bmj-cream:   #E8DCC8;
  --bmj-red:     #C0281F;
  --bmj-amber:   #C8852A;
  --bmj-brown:   #3B2417;
  --bmj-tan:     #B8986A;
  --bmj-white:   #F2EDE4;

  --font-display: 'Bebas Neue', 'Anton', sans-serif;
  --font-body:    'Libre Baskerville', 'Lora', Georgia, serif;
  --font-label:   'Oswald', sans-serif;
  --font-mono:    'IBM Plex Mono', monospace;

  --grain-opacity: 0.04;
  --texture-url: url('/textures/grain.png');

  /* Spacing scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  --space-2xl: 8rem;

  /* Content widths */
  --max-content: 1200px;
  --max-article: 720px;
  --max-wide: 1440px;
}
```

### 5.2 globals.css
```css
/* src/styles/globals.css */
@import './brand.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: var(--bmj-black);
    color: var(--bmj-cream);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--bmj-white);
  }

  a {
    color: var(--bmj-red);
    text-decoration: none;
    transition: opacity 0.2s;
  }
  a:hover {
    opacity: 0.8;
  }

  /* Selection highlight */
  ::selection {
    background-color: var(--bmj-red);
    color: var(--bmj-white);
  }
}

/* Grain overlay — apply .grain class to any container */
.grain::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: var(--texture-url);
  opacity: var(--grain-opacity);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: overlay;
}

/* Halftone image treatment */
.halftone {
  filter: contrast(1.2) grayscale(0.3);
  mix-blend-mode: multiply;
}

/* Red accent border — use on section dividers */
.accent-border-top {
  border-top: 3px solid var(--bmj-red);
}
.accent-border-bottom {
  border-bottom: 3px solid var(--bmj-red);
}

/* Lens colors for badges */
.lens-health { color: #C0281F; }
.lens-philosophy { color: #C8852A; }
.lens-politics { color: var(--bmj-white); }
```

### 5.3 tailwind.config.ts (extend with brand tokens)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bmj: {
          black: '#0D0C0B',
          cream: '#E8DCC8',
          red: '#C0281F',
          amber: '#C8852A',
          brown: '#3B2417',
          tan: '#B8986A',
          white: '#F2EDE4',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
        label: ['var(--font-label)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
        article: '720px',
        wide: '1440px',
      },
      backgroundImage: {
        grain: "url('/textures/grain.png')",
      },
    },
  },
  plugins: [],
}
export default config
```

### 5.4 Key Component: BriefingHeader (matches IG exactly)
```tsx
// src/components/brand/BriefingHeader.tsx
import { BookOpen } from 'lucide-react'

interface BriefingHeaderProps {
  date: string      // e.g. "MARCH 15, 2026"
  issue: number     // e.g. 47
}

export function BriefingHeader({ date, issue }: BriefingHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b-2 border-bmj-red pb-3 mb-6">
      <div className="bg-bmj-red p-2 flex-shrink-0">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-label text-bmj-cream text-xl tracking-[0.2em] uppercase leading-none">
          Weekend Briefing
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-bmj-tan text-xs tracking-widest uppercase">
            {date}
          </span>
          <span className="text-bmj-tan text-xs">·</span>
          <span className="font-mono text-bmj-tan text-xs tracking-widest">
            No. {String(issue).padStart(3, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}
```

---

<a id="phase-6"></a>
## 8. PHASE 6 — FEATURE BUILD SESSIONS (Claude Code Sequence)

**Rule: One session per feature. Use `/plan` before building. Use `/project:deploy-check` before committing.**

Each session below is one Claude Code interactive session. Start each with `/plan [description]`, let Claude write the implementation plan, review it, then say "build it."

### Session 1: Foundation
```
/plan Design system setup: globals.css, brand.css, tailwind.config.ts, layout.tsx with
Google Fonts (Bebas Neue, Libre Baskerville, Oswald, IBM Plex Mono), Navbar component
with mobile hamburger, Footer component with newsletter CTA and social links, grain
overlay on root layout, and the StarDivider component.
```

### Session 2: Home Page
```
/plan Home page with: full-width hero banner (dark background, headline in Bebas Neue,
short bio text), rotating inspirational quote component (auto-cycles every 8 seconds,
amber/cream card style), latest Weekend Briefing preview card, 3-column grid showing
one article per lens (health/philosophy/politics), and a "Join the Movement" CTA
section at the bottom.
```

### Session 3: Database Client + Queries
```
/plan Supabase client setup: browser client in lib/supabase/client.ts, server client
in lib/supabase/server.ts, middleware.ts for auth session refresh, and typed query
helpers in lib/supabase/queries.ts covering: getArticles (with lens filter, pagination),
getArticleBySlug, getFeaturedArticles, getBriefings (with pagination), getBriefingBySlug,
getLatestBriefing, getMemberByUserId, getCourses.
```

### Session 4: Articles System
```
/plan Articles section: archive page at /articles with lens filter tabs
(All/Health/Philosophy/Politics), tag cloud sidebar, ArticleCard component with
cover image + halftone treatment + lens badge + excerpt + reading time, individual
article page at /articles/[slug] with full MDX rendering, PaywallGate component
that blurs premium content and shows upgrade CTA for non-members.
```

### Session 5: Weekend Briefings
```
/plan Weekend Briefing system: archive page at /briefing showing cards in reverse
chronological order with issue numbers and dates, individual briefing page at
/briefing/[slug] using BriefingHeader component, sections rendered as distinct
editorial blocks with red accent borders between them, and PaywallGate for
premium briefings.
```

### Session 6: Academy
```
/plan Academy page: course grid with CourseCard components showing thumbnail,
title, category badge, description, and access tier indicator. Categories:
martial arts/self-discipline, mental health, relationships, purpose, branding.
Cards link to individual course pages (placeholder for now — future video content).
Mostly free content with premium courses indicated by a lock icon.
```

### Session 7: Video Gallery
```
/plan Video gallery page pulling from YouTube RSS feed or YouTube Data API.
VideoCard component with thumbnail, title, publish date, and play button overlay.
Grid layout, 3 columns desktop / 2 tablet / 1 mobile. Clicking opens video in
a modal or navigates to a video detail page with embed.
```

### Session 8: Blog
```
/plan Blog page: chronological feed of shorter posts, updates, and announcements.
Simpler cards than articles — just title, date, excerpt, and lens tag. Paginated.
Individual blog post pages with simpler layout than full articles.
```

### Session 9: Authentication
```
/plan Supabase auth integration: login page with email magic link and optional
password login, signup page with name and email, middleware for session persistence,
member portal dashboard showing tier badge, recent reads, subscription status,
and links to premium content. Settings page for account details and password change.
```

### Session 10: Stripe Subscriptions
```
/plan Stripe integration: configure two subscription products (Basic and Premium),
create checkout session API route, webhook handler for subscription.created,
subscription.updated, subscription.deleted, and invoice.payment_failed events.
Webhook updates member tier in Supabase. Portal page shows upgrade/downgrade
buttons. SubscriptionManager component handles billing portal redirect.
```

### Session 11: Contact + Newsletter
```
/plan Contact page with form (name, email, subject, message) submitting via Resend
API, WhatsApp link (dedicated number), mailing list signup tied to newsletter_subscribers
table, and SMS signup placeholder. Footer newsletter CTA integrated with same signup flow.
Success/error toast notifications.
```

### Session 12: Legal Pages
```
/plan Privacy Policy and Terms of Service pages with proper legal content placeholders.
Cookie disclosure. Styled in the BMJ editorial format — not boilerplate looking. Include
sections for data collection, email usage, subscription billing, and third-party services.
```

### Session 13: SEO + Performance
```
/plan SEO setup: dynamic metadata per page using Next.js generateMetadata, sitemap.xml
generation, robots.txt, Open Graph images (default + per-article), Twitter card meta,
JSON-LD structured data for articles (Article schema) and organization (Organization schema),
canonical URLs, and proper heading hierarchy on every page.
```

### Session 14: Deploy
```
/plan Vercel deployment: verify all environment variables are set in Vercel dashboard,
run production build locally first, deploy with vercel --prod, configure custom domain
(blackmalejournal.com) with DNS records pointing from Squarespace, set up Stripe
webhook endpoint URL to production domain, and verify Supabase connection.
```

---

<a id="phase-7"></a>
## 9. PHASE 7 — REVENUE & SUBSCRIPTIONS

### Stripe Tier Structure
```
FREE tier ($0):
  - All public articles
  - Weekend Briefing previews (first section only)
  - Video gallery
  - Academy (free courses)
  - Blog

BASIC ($X/mo — Chairman sets price):
  - Everything in Free
  - Full Weekend Briefing archive (all sections, all issues)
  - Select premium handbooks
  - Member forum access (future)

PREMIUM ($X/mo — Chairman sets price):
  - Everything in Basic
  - ALL handbooks + downloadable PDFs
  - Private/exclusive content
  - Early access to new articles and briefings
  - Direct access to Chairman Q&As (future)
```

### Payment Routing Rules
```
Stripe:     ALL website subscriptions, member tiers, one-time donations via portal
Patreon:    External fan support, recurring, with exclusive Patreon-only content
PayPal:     Personal/informal only — NEVER route portal signups through PayPal
CashApp:    Personal support only — not connected to the portal
Venmo:      Personal support only — not connected to the portal
```

### Stripe Setup Checklist
- [ ] Create Stripe account (or connect existing)
- [ ] Create 2 Products: "BMJ Basic" and "BMJ Premium"
- [ ] Create monthly Price for each product
- [ ] Note the Price IDs (price_xxxx) for env variables
- [ ] Set up webhook endpoint: https://blackmalejournal.com/api/stripe/webhook
- [ ] Subscribe to events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed

---

<a id="phase-8"></a>
## 10. PHASE 8 — DEPLOYMENT & DNS

### Environment Variables
Create `.env.local` (NEVER commit — already in .gitignore):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...

# Site
NEXT_PUBLIC_SITE_URL=https://www.blackmalejournal.com

# Analytics (Plausible)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=blackmalejournal.com
```

### Deploy to Vercel
```powershell
# Install Vercel CLI
npm install -g vercel

# First deploy (interactive — follow prompts)
cd C:\Projects\blackmalejournal
vercel

# Production deploy
vercel --prod

# Better: connect GitHub for auto-deploy
git remote add origin https://github.com/YOUR_USERNAME/blackmalejournal.git
git push -u origin main
# Then in Vercel dashboard → Import Git Repository → select this repo
# Every push to main auto-deploys to production
```

### Vercel Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:
Add ALL variables from `.env.local` above. Set them for Production, Preview, and Development.

### DNS Setup (Squarespace → Vercel)
1. In Vercel: Project Settings → Domains → Add "blackmalejournal.com" and "www.blackmalejournal.com"
2. Vercel gives you DNS records to add
3. In Squarespace: Domains → DNS Settings → add:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
4. Propagation: 24-48 hours (usually faster)
5. Vercel auto-provisions SSL certificate once DNS resolves

---

<a id="phase-9"></a>
## 11. PHASE 9 — ANALYTICS & SEO

### Analytics: Plausible (Recommended)
Matches the brand's ethos — no Google surveillance, no cookie banner needed, privacy-first.

```bash
# Already installed in Phase 1
# npm install @plausible/tracker
```

Setup in layout.tsx:
```tsx
import Script from 'next/script'

// In the <head> or body of root layout:
<Script
  defer
  data-domain="blackmalejournal.com"
  src="https://plausible.io/js/script.js"
/>
```

Cost: ~$9/mo for hosted. Free if self-hosted.

### SEO Checklist
- [ ] Every page has unique title and description via generateMetadata
- [ ] Open Graph image (1200×630) for every article and briefing
- [ ] Default OG image for pages without specific images
- [ ] JSON-LD for Articles (headline, author, datePublished, image)
- [ ] JSON-LD for Organization (name, url, logo, sameAs social links)
- [ ] sitemap.xml auto-generated at build time
- [ ] robots.txt allowing all crawlers
- [ ] Canonical URLs on every page
- [ ] No orphan pages — everything linked from nav or footer
- [ ] Image alt text on every image
- [ ] Page load under 3 seconds on mobile (test with Lighthouse)

---

<a id="phase-10"></a>
## 12. PHASE 10 — POST-LAUNCH (Layer These Over Time)

### Immediate (Week 1 after launch)
- [ ] Verify Stripe webhooks firing correctly in production
- [ ] Test full signup → subscribe → access premium content flow
- [ ] Submit sitemap to Google Search Console
- [ ] Share launch on all social platforms
- [ ] Monitor Plausible for traffic patterns

### Short-term (Month 1-2)
- [ ] Historical facts chatbot or pop-up (optional feature from roadmap)
- [ ] SMS signup integration (Twilio or similar)
- [ ] Member forum or community space
- [ ] First paid handbook uploaded to portal

### Medium-term (Month 3-6)
- [ ] Academy video courses (host on YouTube, premium = early access)
- [ ] Guest author system (new author field options)
- [ ] Podcast player integration (if Chairman starts one)
- [ ] A/B test subscription pricing
- [ ] Email drip campaign for new subscribers (via Resend)

### Long-term (6+ months)
- [ ] Mobile app (React Native or PWA)
- [ ] Merchandise store (Stripe + Printful integration)
- [ ] Speaking event calendar
- [ ] Partner/affiliate program
- [ ] Book excerpts or serialized long-form content

---

<a id="daily-workflow"></a>
## 13. DAILY WORKFLOW QUICK REFERENCE

### Starting a Session
```powershell
cd C:\Projects\blackmalejournal
claude
```

### Inside Claude Code — Core Commands
```
/status                    — What's the current state of the project?
/plan [feature]            — Write a step-by-step plan before building
/review                    — Audit current code for bugs, security, style
/explain [file]            — Explain what a file or function does
/fix                       — Diagnose and fix current errors
/test                      — Generate tests for a file
/commit                    — Write a conventional commit message
/compact                   — Compress context (use in long sessions)
/memory                    — What Claude remembers about this project
/cost                      — Token usage for current session
/clear                     — Reset context (use when switching features)
```

### Custom Project Commands
```
/project:new-article       — Scaffold new article with frontmatter
/project:new-briefing      — Create new Weekend Briefing
/project:deploy-check      — Pre-deploy checklist (types + lint + build)
/project:brand-check       — Audit all files for brand compliance
/project:seed-content      — Generate sample database content
/project:component         — Scaffold a new component
```

### One-Shot Commands (from terminal, no interactive session)
```powershell
claude -p "Fix the TypeScript error in src/app/resources/page.tsx"
claude -p "Add grain texture overlay to the hero section"
claude -p "Create a new Weekend Briefing for today with placeholder content"
claude -p "Check if all --bmj-* CSS variables are consistent across all files"
claude -p "Write the Stripe webhook handler for subscription events"
claude -p "Generate the Privacy Policy page content"
claude -p "Add reading time calculation to the article query helper"
```

### Pre-Commit Routine (Every Time)
```
/project:deploy-check      — Run types + lint + build
/project:brand-check       — Verify no off-brand colors or fonts crept in
/review                    — Quick audit
/commit                    — Generate commit message
```

Then in terminal:
```powershell
git add .
git commit -m "[message from Claude]"
git push origin main       # Auto-deploys to Vercel if connected
```

---

<a id="outstanding"></a>
## 14. OUTSTANDING FROM CHAIRMAN

**These items block development. Get answers before starting Session 1.**

### Must-Have Before Any Code
- [ ] Logo files: SVG + PNG with transparent background (profile mark + wordmark)
- [ ] Weekend Briefing lockup: SVG
- [ ] Favicon: 32×32 and 180×180
- [ ] Hex codes confirmation — approve the palette above or provide corrections
- [ ] Font approval — Bebas Neue + Libre Baskerville + Oswald + IBM Plex Mono?
- [ ] Subscription pricing: Basic = $?/mo, Premium = $?/mo

### Must-Have Before Launch
- [ ] Board members: 3 names confirmed (required for 501c3 filing)
- [ ] WhatsApp dedicated number (not personal cell)
- [ ] YouTube channel URL (for video feed integration)
- [ ] Custom email provider choice: Google Workspace or Zoho?
- [ ] Analytics preference: Plausible (recommended) or Google Analytics 4?

### Nice to Have (Can Decide Later)
- [ ] Reference sites: any websites you admire the look and feel of?
- [ ] Course topics priority order for Academy page
- [ ] Preferred SMS provider for text signups
- [ ] Chatbot / pop-up feature — yes or no for v1?
- [ ] Social media accounts to link in footer (all handles)

---

## TECH STACK SUMMARY

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React with SSR/SSG |
| Language | TypeScript (strict) | Type safety everywhere |
| Styling | Tailwind CSS + CSS Variables | Utility-first with brand tokens |
| Database | Supabase (PostgreSQL) | Content, members, auth |
| Auth | Supabase Auth | Magic link + password login |
| Payments | Stripe | Subscriptions + donations |
| Email | Resend | Transactional + contact form |
| Hosting | Vercel | Auto-deploy from GitHub |
| DNS | Squarespace | Domain management only |
| Analytics | Plausible | Privacy-first, no cookies |
| Content | MDX | Articles + briefings as code |
| Dev Tool | Claude Code CLI | AI-powered development |

---

*Plan v2.0 — Meshal for The Black Male Journal*
*Built for Claude Code CLI on Windows · Every command tested and ready to run*
