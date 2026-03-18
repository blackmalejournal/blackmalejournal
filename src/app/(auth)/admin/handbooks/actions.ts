'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createHandbook, updateHandbook } from '@/lib/supabase/admin-queries';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const handbookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  lens: z.enum(['health', 'philosophy', 'politics']),
  description: z.string().max(500).default(''),
  body: z.string().min(1, 'Body is required'),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  status: z
    .enum(['draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'])
    .default('draft'),
  cover_image: z.string().optional(),
  file_url: z.string().optional(),
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Create ──────────────────────────────────────────────────────────────────────

export async function createHandbookAction(formData: FormData): Promise<void> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = handbookSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/handbooks/new?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, lens, description, body, access_tier, status, cover_image, file_url } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);

  const handbook = await createHandbook({
    title,
    slug: finalSlug,
    lens,
    description,
    body,
    access_tier,
    status,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
    file_url: file_url?.trim() || null,
  });

  if (!handbook) {
    redirect('/admin/handbooks/new?error=Failed+to+create+handbook');
  }

  revalidatePath('/admin/handbooks');
  redirect('/admin/handbooks');
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateHandbookAction(formData: FormData): Promise<void> {
  const id = formData.get('id') as string;
  if (!id) {
    redirect('/admin/handbooks?error=Handbook+ID+is+required');
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = handbookSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/handbooks/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, lens, description, body, access_tier, status, cover_image, file_url } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);

  const handbook = await updateHandbook(id, {
    title,
    slug: finalSlug,
    lens,
    description,
    body,
    access_tier,
    status,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
    file_url: file_url?.trim() || null,
  });

  if (!handbook) {
    redirect(`/admin/handbooks/${id}/edit?error=Failed+to+update+handbook`);
  }

  revalidatePath('/admin/handbooks');
  redirect('/admin/handbooks');
}
