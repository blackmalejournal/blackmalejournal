'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createArticle, updateArticle } from '@/lib/supabase/admin-queries';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  lens: z.enum(['health', 'philosophy', 'politics']),
  tags: z.string().default(''),
  excerpt: z.string().max(500).default(''),
  body: z.string().min(1, 'Body is required'),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  status: z
    .enum(['draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'])
    .default('draft'),
  featured: z.coerce.boolean().default(false),
  cover_image: z.string().optional(),
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// ── Create ──────────────────────────────────────────────────────────────────────

export async function createArticleAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string; articleId?: string }> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    return { success: false, error: firstError };
  }

  const { title, slug, lens, tags, excerpt, body, access_tier, status, featured, cover_image } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);

  const article = await createArticle({
    title,
    slug: finalSlug,
    lens,
    tags: parseTags(tags),
    excerpt,
    body,
    access_tier,
    status,
    featured,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
  });

  if (!article) {
    return { success: false, error: 'Failed to create article' };
  }

  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateArticleAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const id = formData.get('id') as string;
  if (!id) {
    return { success: false, error: 'Article ID is required' };
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    return { success: false, error: firstError };
  }

  const { title, slug, lens, tags, excerpt, body, access_tier, status, featured, cover_image } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);

  const article = await updateArticle(id, {
    title,
    slug: finalSlug,
    lens,
    tags: parseTags(tags),
    excerpt,
    body,
    access_tier,
    status,
    featured,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
  });

  if (!article) {
    return { success: false, error: 'Failed to update article' };
  }

  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}
