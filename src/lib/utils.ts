// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Article, Lens } from '@/lib/supabase/types';

// Merges Tailwind classes safely — conditional classes without specificity conflicts.
// Usage: cn('base-class', isActive && 'active-class', className)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Returns uppercase date string, e.g. "MARCH 15, 2026"
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    .toUpperCase();
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

export type LensColors = {
  text: string;
  border: string;
  bg: string;
};

// Returns all Tailwind color variants for a lens.
// Classes are hardcoded (not dynamic) so Tailwind includes them in the production build.
// Usage: const { text, border } = getLensColor(article.lens)
export function getLensColor(lens: Lens): LensColors {
  const map: Record<Lens, LensColors> = {
    health: {
      text: 'text-bmj-amber',
      border: 'border-bmj-amber',
      bg: 'bg-bmj-amber',
    },
    philosophy: {
      text: 'text-bmj-tan',
      border: 'border-bmj-tan',
      bg: 'bg-bmj-tan',
    },
    politics: {
      text: 'text-bmj-red',
      border: 'border-bmj-red',
      bg: 'bg-bmj-red',
    },
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

// Returns a sorted, de-duplicated list of all tags across the given articles.
export function extractTags(articles: Article[]): string[] {
  const set = new Set<string>();
  for (const a of articles) {
    for (const t of a.tags) set.add(t);
  }
  return Array.from(set).sort();
}

// Maps course category slugs to display labels.
const CATEGORY_LABELS: Record<string, string> = {
  'martial-arts': 'Martial Arts',
  'mental-health': 'Mental Health',
  'relationships': 'Relationships',
  'purpose': 'Purpose',
  'branding': 'Branding',
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

// Adjusts amount so recipient receives the original after Stripe's 2.9% + $0.30 fee.
export function calculateFeeAdjustedAmount(amount: number): number {
  return Math.ceil(((amount + 0.30) / (1 - 0.029)) * 100) / 100;
}
