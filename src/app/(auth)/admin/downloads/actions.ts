'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createDownload, updateDownload } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const downloadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  description: z.string().max(500).default(''),
  category: z.string().min(1, 'Category is required'),
  file_url: z.string().min(1, 'File URL is required'),
  file_type: z.string().min(1, 'File type is required'),
  file_size: z.coerce.number().int().positive('File size required'),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  cover_image: z.string().optional(),
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Create ──────────────────────────────────────────────────────────────────────

export async function createDownloadAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());

  const parsed = downloadSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/downloads/new?error=${encodeURIComponent(firstError)}`);
  }

  const {
    title,
    slug,
    description,
    category,
    file_url,
    file_type,
    file_size,
    access_tier,
    cover_image,
  } = parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);

  const download = await createDownload({
    title,
    slug: finalSlug,
    description,
    category,
    file_url,
    file_type,
    file_size,
    access_tier,
    cover_image: cover_image?.trim() || null,
  });

  if (!download) {
    redirect('/admin/downloads/new?error=Failed+to+create+download');
  }

  revalidatePath('/admin/downloads');
  redirect('/admin/downloads');
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateDownloadAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  if (!id) {
    redirect('/admin/downloads?error=Download+ID+is+required');
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = downloadSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/downloads/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const {
    title,
    slug,
    description,
    category,
    file_url,
    file_type,
    file_size,
    access_tier,
    cover_image,
  } = parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);

  const download = await updateDownload(id, {
    title,
    slug: finalSlug,
    description,
    category,
    file_url,
    file_type,
    file_size,
    access_tier,
    cover_image: cover_image?.trim() || null,
  });

  if (!download) {
    redirect(`/admin/downloads/${id}/edit?error=Failed+to+update+download`);
  }

  revalidatePath('/admin/downloads');
  redirect('/admin/downloads');
}
