'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createDispatch, updateDispatch } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const dispatchSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  lens: z.enum(['health', 'philosophy', 'politics']),
  excerpt: z.string().max(500).default(''),
  body: z.string().min(1, 'Body is required'),
  status: z
    .enum(['draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'])
    .default('draft'),
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

export async function createDispatchAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());

  const parsed = dispatchSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/dispatches/new?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, lens, excerpt, body, status, cover_image } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);

  const dispatch = await createDispatch({
    title,
    slug: finalSlug,
    lens,
    excerpt,
    body,
    status,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
  });

  if (!dispatch) {
    redirect('/admin/dispatches/new?error=Failed+to+create+dispatch');
  }

  revalidatePath('/admin/dispatches');
  redirect('/admin/dispatches');
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateDispatchAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  if (!id) {
    redirect('/admin/dispatches?error=Dispatch+ID+is+required');
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = dispatchSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/dispatches/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, lens, excerpt, body, status, cover_image } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);

  const dispatch = await updateDispatch(id, {
    title,
    slug: finalSlug,
    lens,
    excerpt,
    body,
    status,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
  });

  if (!dispatch) {
    redirect(`/admin/dispatches/${id}/edit?error=Failed+to+update+dispatch`);
  }

  revalidatePath('/admin/dispatches');
  redirect('/admin/dispatches');
}
