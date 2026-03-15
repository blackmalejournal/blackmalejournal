# Design System + Root Layout + Navigation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete design foundation for The Black Male Journal — brand tokens, global styles, Tailwind config, font loading, root layout, Navbar, MobileMenu, Footer, StarDivider, and GrainOverlay — so every subsequent session has a pixel-perfect, brand-correct shell to build into.

**Architecture:** Next.js 14 App Router with TypeScript. All brand colors are CSS custom properties consumed by Tailwind's config; components use Tailwind classes that reference those variables. Client-side interactivity is isolated to Navbar (scroll + menu state) and MobileMenu; everything else is a Server Component.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS v3, Framer Motion, lucide-react, next/font/google

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/styles/brand.css` | All CSS custom properties — colors, fonts, spacing, widths |
| `src/styles/globals.css` | Tailwind directives + base layer overrides + utility classes |
| `tailwind.config.ts` | Extends Tailwind with BMJ tokens |
| `src/app/layout.tsx` | Root layout — font vars on `<html>`, Navbar + Footer shell |
| `src/components/ui/StarDivider.tsx` | Star-on-line SVG horizontal rule |
| `src/components/ui/GrainOverlay.tsx` | Fixed grain texture overlay component |
| `src/components/layout/Navbar.tsx` | Sticky masthead — logo, nav links, JOIN CTA, scroll opacity |
| `src/components/layout/MobileMenu.tsx` | Full-screen slide-in mobile nav (Framer Motion) |
| `src/components/layout/Footer.tsx` | Three-column footer — brand, nav, newsletter/socials |
| `src/app/(public)/page.tsx` | Minimal homepage stub (proves layout renders) |

---

## Chunk 1: Project Scaffold + Brand Tokens

### Task 1: Bootstrap Next.js App

**Files:**
- Create: project root (run from `C:/Users/mesha/Desktop/Projects/blackmalejournal`)

- [ ] **Step 1: Scaffold Next.js 14 with TypeScript and Tailwind**

Run from the project directory (the scaffold must be created **inside** the existing folder, not as a subfolder):

```bash
cd /c/Users/mesha/Desktop/Projects/blackmalejournal
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

When prompted, accept all defaults. The `--app` flag ensures App Router. `--src-dir` puts source under `src/`. `--no-git` skips reinitializing git since we may already be in one.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion lucide-react
npm install --save-dev @types/node
```

- [ ] **Step 3: Verify scaffold runs**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -20
kill %1
```

Expected: HTML response with `<!DOCTYPE html>` — the default Next.js page.

- [ ] **Step 4: Commit scaffold**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 app with TypeScript, Tailwind, App Router"
```

---

### Task 2: Brand CSS Variables

**Files:**
- Create: `src/styles/brand.css`

- [ ] **Step 1: Create the styles directory and brand.css**

```css
/* src/styles/brand.css */
/* ─── BMJ Brand Design Tokens ─────────────────────────────── */

/* Color palette */
:root {
  --bmj-black:  #0D0C0B;
  --bmj-cream:  #E8DCC8;
  --bmj-red:    #C0281F;
  --bmj-amber:  #C8852A;
  --bmj-brown:  #3B2417;
  --bmj-tan:    #B8986A;
  --bmj-white:  #F2EDE4;

  /* Font family references (values set by next/font CSS variables) */
  --font-display: var(--font-bebas-neue), 'Bebas Neue', sans-serif;
  --font-body:    var(--font-libre-baskerville), 'Libre Baskerville', serif;
  --font-label:   var(--font-oswald), 'Oswald', sans-serif;
  --font-mono:    var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;

  /* Grain overlay */
  --grain-opacity: 0.04;
  --texture-url: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");

  /* Spacing scale */
  --space-xs:  0.25rem;   /*  4px */
  --space-sm:  0.5rem;    /*  8px */
  --space-md:  1rem;      /* 16px */
  --space-lg:  1.5rem;    /* 24px */
  --space-xl:  2rem;      /* 32px */
  --space-2xl: 3rem;      /* 48px */

  /* Max-width scale */
  --width-content: 1200px;
  --width-article:  720px;
  --width-wide:    1440px;
}
```

- [ ] **Step 2: Verify file contents look correct** (no action, just visual check)

---

### Task 3: Global CSS

**Files:**
- Modify: `src/styles/globals.css` (replace default content)

- [ ] **Step 1: Replace globals.css**

The default Next.js `globals.css` has its own Tailwind imports — replace entirely:

```css
/* src/styles/globals.css */
@import "./brand.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Base layer overrides ─────────────────────────────────── */
@layer base {
  body {
    background-color: var(--bmj-black);
    color: var(--bmj-cream);
    font-family: var(--font-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 400; /* Bebas Neue has no bold variant — weight is baked in */
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--bmj-white);
  }

  a {
    color: var(--bmj-red);
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  a:hover {
    opacity: 0.75;
  }

  ::selection {
    background-color: var(--bmj-red);
    color: var(--bmj-white);
  }
}

/* ─── Utility classes ──────────────────────────────────────── */
@layer utilities {
  /* Film grain overlay — apply to a positioned container */
  .grain::after {
    content: "";
    position: fixed;
    inset: 0;
    background-image: var(--texture-url);
    opacity: var(--grain-opacity);
    pointer-events: none;
    z-index: 9999;
  }

  /* Image halftone treatment */
  .halftone {
    filter: contrast(1.2) grayscale(0.3);
    mix-blend-mode: multiply;
  }

  /* Accent borders */
  .accent-border-top {
    border-top: 3px solid var(--bmj-red);
  }

  .accent-border-bottom {
    border-bottom: 3px solid var(--bmj-red);
  }

  /* Lens color classes */
  .lens-health {
    color: var(--bmj-amber);
  }

  .lens-philosophy {
    color: var(--bmj-tan);
  }

  .lens-politics {
    color: var(--bmj-red);
  }
}
```

- [ ] **Step 2: Commit brand tokens + globals**

```bash
git add src/styles/
git commit -m "feat: add brand CSS variables and global styles"
```

---

### Task 4: Tailwind Config

**Files:**
- Modify: `tailwind.config.ts` (replace the default)

- [ ] **Step 1: Replace tailwind.config.ts**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bmj: {
          black:  "#0D0C0B",
          cream:  "#E8DCC8",
          red:    "#C0281F",
          amber:  "#C8852A",
          brown:  "#3B2417",
          tan:    "#B8986A",
          white:  "#F2EDE4",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Bebas Neue", "sans-serif"],
        body:    ["var(--font-body)",    "Libre Baskerville", "serif"],
        label:   ["var(--font-label)",   "Oswald", "sans-serif"],
        mono:    ["var(--font-mono)",    "IBM Plex Mono", "monospace"],
      },
      maxWidth: {
        content: "1200px",
        article: "720px",
        wide:    "1440px",
      },
      backgroundImage: {
        "grain-texture": "var(--texture-url)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit Tailwind config**

```bash
git add tailwind.config.ts
git commit -m "feat: extend Tailwind with BMJ color tokens, fonts, and widths"
```

---

## Chunk 2: Font Loading + Root Layout

### Task 5: Root Layout with Fonts

**Files:**
- Modify: `src/app/layout.tsx`

`next/font/google` downloads fonts at build time and provides CSS variable names. The variables are applied to `<html>` so they cascade into `brand.css`'s `--font-*` references.

- [ ] **Step 1: Replace src/app/layout.tsx**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import {
  Bebas_Neue,
  Libre_Baskerville,
  Oswald,
  IBM_Plex_Mono,
} from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const oswald = Oswald({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Black Male Journal",
    template: "%s | The Black Male Journal",
  },
  description:
    "Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = [
    bebasNeue.variable,
    libreBaskerville.variable,
    oswald.variable,
    ibmPlexMono.variable,
  ].join(" ");

  return (
    <html lang="en" className={fontVars}>
      <body className="grain flex min-h-screen flex-col bg-bmj-black text-bmj-cream">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* Plausible analytics — uncomment when domain is live */}
        {/* <Script
          defer
          data-domain="blackmalejournal.com"
          src="https://plausible.io/js/plausible.js"
        /> */}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create placeholder Navbar and Footer** (stubs so layout.tsx compiles)

We need these to exist before TypeScript will accept the imports. We'll fill them in Tasks 8–10.

```typescript
// src/components/layout/Navbar.tsx
export function Navbar() {
  return <header>NAVBAR STUB</header>;
}
```

```typescript
// src/components/layout/Footer.tsx
export function Footer() {
  return <footer>FOOTER STUB</footer>;
}
```

Also create the ui/ directory with stubs:

```typescript
// src/components/ui/StarDivider.tsx
export function StarDivider() {
  return <hr />;
}
```

```typescript
// src/components/ui/GrainOverlay.tsx
export function GrainOverlay() {
  return null;
}
```

- [ ] **Step 3: Create homepage stub**

```typescript
// src/app/(public)/page.tsx
export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="font-display text-4xl text-bmj-white">
        THE BLACK MALE JOURNAL
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: Build passes with zero TypeScript errors. If there are errors, fix them before proceeding.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: add root layout with font variables and layout shell"
```

---

## Chunk 3: Primitive UI Components

### Task 6: StarDivider Component

**Files:**
- Modify: `src/components/ui/StarDivider.tsx`

The star motif (★) is the brand's horizontal rule replacement. It renders as a thin `--bmj-tan` line with a red star centered on it.

- [ ] **Step 1: Replace the stub**

```typescript
// src/components/ui/StarDivider.tsx
interface StarDividerProps {
  className?: string;
}

export function StarDivider({ className = "" }: StarDividerProps) {
  return (
    <div
      className={`relative flex items-center py-4 ${className}`}
      role="separator"
      aria-hidden="true"
    >
      {/* Left line */}
      <div className="flex-1 border-t border-bmj-tan/40" />

      {/* Star */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-3 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M8 0L9.8 5.8H16L10.9 9.2L12.7 15L8 11.6L3.3 15L5.1 9.2L0 5.8H6.2L8 0Z"
          fill="var(--bmj-red)"
        />
      </svg>

      {/* Right line */}
      <div className="flex-1 border-t border-bmj-tan/40" />
    </div>
  );
}
```

---

### Task 7: GrainOverlay Component

**Files:**
- Modify: `src/components/ui/GrainOverlay.tsx`

The global `.grain` class on `<body>` covers the whole page. This component version lets individual sections opt into a local grain overlay if needed.

- [ ] **Step 1: Replace the stub**

```typescript
// src/components/ui/GrainOverlay.tsx
interface GrainOverlayProps {
  opacity?: number;
  className?: string;
}

export function GrainOverlay({
  opacity = 0.04,
  className = "",
}: GrainOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9999] ${className}`}
      style={{
        backgroundImage: "var(--texture-url)",
        opacity,
      }}
    />
  );
}
```

- [ ] **Step 2: Commit primitive components**

```bash
git add src/components/ui/
git commit -m "feat: add StarDivider and GrainOverlay primitive components"
```

---

## Chunk 4: Navigation Components

### Task 8: MobileMenu Component

**Files:**
- Create: `src/components/layout/MobileMenu.tsx`

This is a client component — it uses Framer Motion animations and receives open/close handlers from Navbar.

- [ ] **Step 1: Create MobileMenu.tsx**

```typescript
// src/components/layout/MobileMenu.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Instagram, Youtube, Linkedin, Twitter } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "About",     href: "/about" },
  { label: "Academy",   href: "/academy" },
  { label: "Resources", href: "/resources" },
  { label: "Video",     href: "/video" },
  { label: "Blog",      href: "/blog" },
  { label: "Contact",   href: "/contact" },
];

const SOCIAL_LINKS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Linkedin,  href: "#", label: "LinkedIn" },
  { icon: Twitter,   href: "#", label: "Twitter / X" },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
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
            </ul>

            {/* JOIN CTA */}
            <Link
              href="/signup"
              onClick={onClose}
              className="mb-8 block bg-bmj-red py-3 text-center font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
            >
              Join
            </Link>

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

---

### Task 9: Navbar Component

**Files:**
- Modify: `src/components/layout/Navbar.tsx` (replace stub)

The Navbar is a client component so it can track scroll position (to adjust opacity) and mobile menu open state.

- [ ] **Step 1: Replace Navbar.tsx**

```typescript
// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "About",     href: "/about" },
  { label: "Academy",   href: "/academy" },
  { label: "Resources", href: "/resources" },
  { label: "Video",     href: "/video" },
  { label: "Blog",      href: "/blog" },
  { label: "Contact",   href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`accent-border-bottom sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "bg-bmj-black/95 backdrop-blur-sm"
            : "bg-bmj-black"
        }`}
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">

          {/* Logo / Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 no-underline"
            aria-label="The Black Male Journal — Home"
          >
            {/* Star mark (placeholder until Chairman provides SVG assets) */}
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
                          ? "border-b-2 border-bmj-red text-bmj-white pb-0.5"
                          : "text-bmj-cream hover:text-bmj-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right side — JOIN + hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="hidden bg-bmj-red px-5 py-2 font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90 sm:block"
            >
              Join
            </Link>

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

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit navigation components**

```bash
git add src/components/layout/
git commit -m "feat: add Navbar and MobileMenu components"
```

---

## Chunk 5: Footer + Final Build

### Task 10: Footer Component

**Files:**
- Modify: `src/components/layout/Footer.tsx` (replace stub)

Footer is a Server Component — no client state needed.

- [ ] **Step 1: Replace Footer.tsx**

```typescript
// src/components/layout/Footer.tsx
import Link from "next/link";
import { Instagram, Youtube, Linkedin, Twitter } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "About",     href: "/about" },
  { label: "Academy",   href: "/academy" },
  { label: "Resources", href: "/resources" },
  { label: "Video",     href: "/video" },
  { label: "Blog",      href: "/blog" },
  { label: "Contact",   href: "/contact" },
];

const SOCIAL_LINKS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Linkedin,  href: "#", label: "LinkedIn" },
  { icon: Twitter,   href: "#", label: "Twitter / X" },
];

const SUPPORT_LINKS = [
  { label: "Patreon",  href: "#" },
  { label: "PayPal",   href: "#" },
  { label: "CashApp",  href: "#" },
];

export function Footer() {
  return (
    <footer className="accent-border-top bg-bmj-brown">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <svg
                width="28"
                height="28"
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
              <span className="font-display text-lg tracking-wider text-bmj-white">
                The Black Male Journal
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed text-bmj-cream/70">
              Independent media house. Revolutionary masculinist platform covering
              health, philosophy, and politics for Black men.
            </p>

            {/* Support links */}
            <div className="flex flex-wrap gap-3 pt-2">
              {SUPPORT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Navigation */}
          <nav aria-label="Footer navigation">
            <h3 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Navigate
            </h3>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-bmj-cream/80 no-underline transition-colors hover:text-bmj-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Connect */}
          <div>
            <h3 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Connect
            </h3>

            {/* Social icons */}
            <div className="mb-6 flex gap-4">
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

            {/* Newsletter signup */}
            <h4 className="mb-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Newsletter
            </h4>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2"
              aria-label="Newsletter signup"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="your@email.com"
                required
                className="border border-bmj-tan/30 bg-bmj-black px-4 py-2 font-mono text-sm text-bmj-cream placeholder-bmj-tan/50 outline-none focus:border-bmj-red"
              />
              <button
                type="submit"
                className="bg-bmj-red px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-bmj-tan/20 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-bmj-tan/60">
            © 2026 The Black Male Journal. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="font-mono text-xs text-bmj-tan/60 no-underline transition-colors hover:text-bmj-tan"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-mono text-xs text-bmj-tan/60 no-underline transition-colors hover:text-bmj-tan"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

Note: The `onSubmit` handler is inline here because this is a Server Component and we just need to prevent default for now. The newsletter form will be wired to an API route in a later session.

---

### Task 11: Final Verification

**Files:** No new files

- [ ] **Step 1: TypeScript strict check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. Zero errors. You may see warnings about `<form>` inside a Server Component with an `onSubmit` handler — this is expected and will be resolved when the Footer newsletter form is converted to a Client Component in a later session.

- [ ] **Step 3: Visual verification at both breakpoints**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser:

- [ ] At 375px: hamburger icon visible, wordmark visible, footer stacks vertically
- [ ] At 1440px: full desktop nav visible, JOIN button visible, footer shows 3 columns
- [ ] Grain texture is subtly visible over the page
- [ ] Navbar has red bottom border accent
- [ ] Footer has red top border accent
- [ ] All text uses correct fonts (Bebas Neue for headlines, Libre Baskerville for body)
- [ ] Colors match BMJ brand: near-black background, cream text, red accents
- [ ] Mobile menu slides in from right on hamburger click
- [ ] Backdrop closes mobile menu on click

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Session 1 — design system, root layout, navbar, footer"
```

---

## Summary

After completing all tasks the repository will have:

```
src/
  styles/
    brand.css          — all CSS custom properties
    globals.css        — Tailwind + base layer + utility classes
  app/
    layout.tsx         — root layout with 4 fonts loaded, grain overlay, Navbar + Footer
    (public)/
      page.tsx         — homepage stub
  components/
    ui/
      StarDivider.tsx  — star-on-line horizontal rule
      GrainOverlay.tsx — reusable grain overlay
    layout/
      Navbar.tsx       — sticky masthead, scroll opacity, mobile toggle
      MobileMenu.tsx   — full-screen slide-in menu (Framer Motion)
      Footer.tsx       — 3-column footer with newsletter form
tailwind.config.ts     — BMJ tokens extended into Tailwind
```

`npm run build` will pass clean and the site will render the BMJ brand shell at all screen sizes. All 14 subsequent sessions can build into this foundation.
