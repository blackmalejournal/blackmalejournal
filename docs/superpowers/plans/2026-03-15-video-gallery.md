# Video Gallery Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Video Gallery page that showcases the Chairman's YouTube content in a branded grid with modal playback.

**Architecture:** Static video data file (`src/lib/content/videos.ts`) feeds a Server Component page at `/video`. Each video renders as a `VideoCard` with YouTube thumbnail and play overlay. Clicking a card opens a client-side `VideoModal` with responsive YouTube embed. No database needed — this is a config-driven page designed to be swapped to dynamic YouTube RSS fetching later.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, lucide-react (Play/X icons), Framer Motion (modal animation)

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/lib/content/videos.ts` | Video data array + `Video` type definition |
| `src/components/content/VideoCard.tsx` | Card: thumbnail, play overlay, title, date |
| `src/components/content/VideoModal.tsx` | Client component: fullscreen modal with YouTube iframe |
| `src/app/(public)/video/page.tsx` | Page: header, grid, modal integration |
| `src/app/(public)/video/VideoGallery.tsx` | Client wrapper: card click state + modal |
| `next.config.ts` | Add YouTube thumbnail domain to `remotePatterns` |

**New directory:** `src/lib/content/` — static content data files (distinct from `src/content/` which holds MDX). This is an intentional architecture expansion for config-driven content that doesn't live in Supabase.

---

## Chunk 1: Data Layer + Components + Page

### Task 1: Video Data File + Next.js Config

**Files:**
- Create: `src/lib/content/videos.ts`
- Modify: `next.config.ts` (add YouTube thumbnail domain to `remotePatterns`)

- [ ] **Step 1: Add YouTube thumbnail domain to next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
};

export default nextConfig;
```

This allows `next/image` to optimize YouTube thumbnail URLs (`https://img.youtube.com/vi/[id]/hqdefault.jpg`).

- [ ] **Step 2: Create the video data file with type and placeholder entries**

```typescript
// src/lib/content/videos.ts

export type Video = {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  publishedAt: string;
};

export const videos: Video[] = [
  {
    id: '1',
    title: 'The Discipline of Morning Routines',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'How a structured morning sets the tone for a disciplined life. The Chairman breaks down his personal protocol.',
    publishedAt: '2026-03-01',
  },
  {
    id: '2',
    title: 'Why Black Men Must Study History',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'History is not a passive subject — it is a weapon. Understanding the past is the first step to shaping the future.',
    publishedAt: '2026-02-22',
  },
  {
    id: '3',
    title: 'Martial Arts and the Masculine Frame',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'Combat training is not about violence — it is about self-mastery. How martial arts forge discipline and presence.',
    publishedAt: '2026-02-15',
  },
  {
    id: '4',
    title: 'Building Wealth Outside the System',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'Financial independence requires alternative thinking. Strategies for building generational wealth on your own terms.',
    publishedAt: '2026-02-08',
  },
  {
    id: '5',
    title: 'The Crisis of Fatherlessness',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'Examining the systemic and personal factors behind absent fathers, and the path toward intentional fatherhood.',
    publishedAt: '2026-02-01',
  },
  {
    id: '6',
    title: 'Reclaiming Your Narrative',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'The media tells one story. You must tell another. How to take control of how you are perceived and remembered.',
    publishedAt: '2026-01-25',
  },
  {
    id: '7',
    title: 'Stoicism for the Modern Black Man',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'Ancient philosophy meets modern struggle. Practical stoic principles for navigating a hostile world with composure.',
    publishedAt: '2026-01-18',
  },
  {
    id: '8',
    title: 'Community Organizing 101',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'Power is not given — it is built. A foundational guide to organizing your block, your city, your people.',
    publishedAt: '2026-01-11',
  },
  {
    id: '9',
    title: 'The Weekend Briefing Explained',
    youtubeId: 'dQw4w9WgXcQ',
    description:
      'What the Weekend Briefing is, why it exists, and how to get the most out of each issue.',
    publishedAt: '2026-01-04',
  },
];
```

All `youtubeId` values are placeholders — swap with real IDs when the channel is ready. The `id` field is a simple string key for React list rendering.

- [ ] **Step 3: Verify the files compile**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add next.config.ts src/lib/content/videos.ts
git commit -m "feat: add video data file and configure YouTube image domain"
```

---

### Task 2: VideoCard Component

**Files:**
- Create: `src/components/content/VideoCard.tsx`
- Reference: `src/components/content/ArticleCard.tsx` (pattern to follow)
- Reference: `src/lib/utils.ts` (`formatDate`)

This is a **plain function component** (no `"use client"`, no hooks). It runs within the client boundary of `VideoGallery` at runtime, but has no client-specific logic itself. The click handler lives on the parent `<button>` wrapper, not on the card.

- [ ] **Step 1: Create VideoCard**

```typescript
// src/components/content/VideoCard.tsx

import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface VideoCardProps {
  title: string;
  youtubeId: string;
  publishedAt: string;
}

export function VideoCard({ title, youtubeId, publishedAt }: VideoCardProps) {
  return (
    <article className="group flex flex-col border border-bmj-tan/20 bg-bmj-brown transition-all duration-200 hover:-translate-y-1 hover:border-bmj-red/40">
      {/* Thumbnail with play overlay */}
      <div className="relative aspect-[16/9] overflow-hidden bg-bmj-black">
        <Image
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt={title}
          fill
          className="halftone object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bmj-red transition-transform duration-200 group-hover:scale-110">
            <svg
              width="20"
              height="24"
              viewBox="0 0 20 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="ml-1"
            >
              <path d="M0 0L20 12L0 24V0Z" fill="var(--bmj-white)" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-3 line-clamp-2 font-display text-xl leading-tight text-bmj-white">
          {title}
        </h3>
        <span className="font-mono text-xs text-bmj-tan">
          {formatDate(publishedAt)}
        </span>
      </div>
    </article>
  );
}
```

Design notes:
- Uses `next/image` with `fill` and `sizes` — matches `ArticleCard` pattern. YouTube domain is configured in `next.config.ts` `remotePatterns` (Task 1).
- Play button: red circle (`bg-bmj-red`, `rounded-full`) with white triangle SVG, centered on thumbnail. `rounded-full` is a deliberate exception to the "no rounded corners > 4px" rule — circular play buttons are a universal video UI convention that would look wrong any other way. Scales up on hover via `group-hover:scale-110`.
- `halftone` class applied to thumbnail for brand consistency.
- `formatDate` from utils gives uppercase date (e.g., "MARCH 15, 2026").
- `text-xl` on title matches `ArticleCard` and `CourseCard` pattern.
- No `cursor-pointer` here — it lives on the `<button>` wrapper in `VideoGallery`.
- No `Link` wrapper — clicking is handled by parent client wrapper that opens the modal.

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/content/VideoCard.tsx
git commit -m "feat: add VideoCard component with play overlay"
```

---

### Task 3: VideoModal Component

**Files:**
- Create: `src/components/content/VideoModal.tsx`

This is a **client component** — it manages open/close state and renders a responsive YouTube iframe. Uses Framer Motion for backdrop fade and modal scale-in, matching the `MobileMenu` animation pattern.

- [ ] **Step 1: Create VideoModal**

```typescript
// src/components/content/VideoModal.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Video } from '@/lib/content/videos';

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!video) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [video, handleKeyDown]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-bmj-black/90"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-4xl"
            role="dialog"
            aria-modal="true"
            aria-label={video.title}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-bmj-cream transition-opacity hover:opacity-75"
              aria-label="Close video"
            >
              <X size={24} />
            </button>

            {/* YouTube embed — 16:9 aspect ratio */}
            <div className="relative aspect-video w-full overflow-hidden bg-bmj-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>

            {/* Title and description */}
            <div className="mt-6">
              <h2 className="font-display text-2xl text-bmj-white">
                {video.title}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-bmj-cream/70">
                {video.description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Design notes:
- Uses `youtube-nocookie.com` for privacy-enhanced embed mode.
- `autoplay=1` starts playback on open; `rel=0` hides related videos.
- `aspect-video` (Tailwind built-in) gives 16:9 ratio.
- Escape key and backdrop click both close the modal.
- Body scroll locked while modal is open.
- Framer Motion: backdrop fades in, modal scales from 0.95 with 200ms duration — subtle, matching existing animation style.

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/content/VideoModal.tsx
git commit -m "feat: add VideoModal with responsive YouTube embed"
```

---

### Task 4: Video Gallery Page

**Files:**
- Create: `src/app/(public)/video/page.tsx`
- Reference: `src/app/(public)/academy/page.tsx` (page structure pattern)

The page is a Server Component that renders the header and video grid. A thin client wrapper (`VideoGallery`) handles card click state and modal rendering.

- [ ] **Step 1: Create the video page**

```typescript
// src/app/(public)/video/page.tsx

import type { Metadata } from 'next';
import { StarDivider } from '@/components/ui/StarDivider';
import { videos } from '@/lib/content/videos';
import { VideoGallery } from './VideoGallery';

export const metadata: Metadata = {
  title: 'Video',
  description:
    'Watch. Learn. Build. Video content from The Chairman on health, philosophy, and politics.',
};

export default function VideoPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-bmj-white">Video</h1>
      <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
        Watch. Learn. Build.
      </p>
      <StarDivider className="mb-6" />

      <VideoGallery videos={videos} />
    </div>
  );
}
```

- [ ] **Step 2: Create the VideoGallery client wrapper**

```typescript
// src/app/(public)/video/VideoGallery.tsx
'use client';

import { useState } from 'react';
import type { Video } from '@/lib/content/videos';
import { VideoCard } from '@/components/content/VideoCard';
import { VideoModal } from '@/components/content/VideoModal';

interface VideoGalleryProps {
  videos: Video[];
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (videos.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-label text-bmj-tan">No videos available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setSelectedVideo(video)}
            className="cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-bmj-red"
          >
            <VideoCard
              title={video.title}
              youtubeId={video.youtubeId}
              publishedAt={video.publishedAt}
            />
          </button>
        ))}
      </div>

      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}
```

Design notes:
- Uses `<button type="button">` instead of `<div onClick>` — keyboard-accessible and focusable by default.
- `text-left` on button prevents the default centered text alignment.
- Empty state matches Academy page pattern (centered text, `font-label text-bmj-tan`).
- This wrapper is the only client component on the page. The `VideoCard` itself stays a plain function component (no hooks, no interactivity) — the click handler wraps it from above. This follows the "push client boundaries down" pattern from the existing codebase.

- [ ] **Step 3: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: Build succeeds, `/video` route compiles with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/video/page.tsx src/app/(public)/video/VideoGallery.tsx
git commit -m "feat: add Video Gallery page with modal playback"
```

---

### Task 5: Verify and Final Commit

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Clean build, no warnings, `/video` listed in routes.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Visual verification**

Start dev server: `npm run dev`

Check:
- `/video` loads with "VIDEO" headline, "Watch. Learn. Build." subtitle, star divider
- 3-column grid on desktop, 2 on tablet, 1 on mobile
- Each card shows YouTube thumbnail with halftone filter
- Red play button centered on each thumbnail
- Card hover: lifts up (-translate-y-1), border shifts to red
- Play button scales up on hover
- Title in Bebas Neue below thumbnail
- Date in IBM Plex Mono, tan color
- Clicking a card opens modal with YouTube embed
- Modal has dark backdrop, close button (X), video auto-plays
- Escape key and backdrop click close the modal
- Body scroll is locked while modal is open
- Title and description shown below the video in modal
