'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createBriefing, updateBriefing } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';
import type { BriefingSection } from '@/lib/supabase/types';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const briefingSchema = z.object({
  issue_number: z.coerce.number().int().positive('Issue number required'),
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  status: z
    .enum(['draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'])
    .default('draft'),
  cover_image: z.string().optional(),
  sections_json: z.string().min(1, 'At least one section required'),
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseSections(raw: string): BriefingSection[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    for (const section of parsed) {
      if (typeof section.title !== 'string' || typeof section.body !== 'string') {
        return null;
      }
    }
    return parsed as BriefingSection[];
  } catch {
    return null;
  }
}

// ── Create ──────────────────────────────────────────────────────────────────────

export async function createBriefingAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());

  const parsed = briefingSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/briefings/new?error=${encodeURIComponent(firstError)}`);
  }

  const { issue_number, title, slug, access_tier, status, cover_image, sections_json } =
    parsed.data;

  const sections = parseSections(sections_json);
  if (!sections) {
    redirect('/admin/briefings/new?error=Invalid+sections+JSON');
  }

  const finalSlug = slug?.trim() || generateSlug(title);

  const briefing = await createBriefing({
    issue_number,
    title,
    slug: finalSlug,
    sections,
    access_tier,
    status,
    cover_image: cover_image?.trim() || null,
  });

  if (!briefing) {
    redirect('/admin/briefings/new?error=Failed+to+create+briefing');
  }

  revalidatePath('/admin/briefings');
  redirect('/admin/briefings');
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateBriefingAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  if (!id) {
    redirect('/admin/briefings?error=Briefing+ID+is+required');
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = briefingSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/briefings/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const { issue_number, title, slug, access_tier, status, cover_image, sections_json } =
    parsed.data;

  const sections = parseSections(sections_json);
  if (!sections) {
    redirect(`/admin/briefings/${id}/edit?error=Invalid+sections+JSON`);
  }

  const finalSlug = slug?.trim() || generateSlug(title);

  const briefing = await updateBriefing(id, {
    issue_number,
    title,
    slug: finalSlug,
    sections,
    access_tier,
    status,
    cover_image: cover_image?.trim() || null,
  });

  if (!briefing) {
    redirect(`/admin/briefings/${id}/edit?error=Failed+to+update+briefing`);
  }

  revalidatePath('/admin/briefings');
  redirect('/admin/briefings');
}
