'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createCourse, deleteCourse, getCourseById, updateCourse } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/utils';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().min(1, 'Category is required'),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  published: z.coerce.boolean().default(false),
  cover_image: z.string().optional(),
});

export async function createCourseAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const parsed = courseSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/courses/new?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, description, category, access_tier, published, cover_image } = parsed.data;
  const course = await createCourse({
    title,
    slug: slug?.trim() || generateSlug(title),
    description,
    category,
    access_tier,
    published,
    cover_image: cover_image?.trim() || null,
  });

  if (!course) {
    redirect('/admin/courses/new?error=Failed+to+create+course');
  }

  revalidatePath('/admin/courses');
  redirect(`/admin/courses/${course.id}/edit?message=Course+created`);
}

export async function updateCourseAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;

  if (!id) {
    redirect('/admin/courses?error=Course+ID+is+required');
  }

  const parsed = courseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/courses/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, description, category, access_tier, published, cover_image } = parsed.data;
  const course = await updateCourse(id, {
    title,
    slug: slug?.trim() || generateSlug(title),
    description,
    category,
    access_tier,
    published,
    cover_image: cover_image?.trim() || null,
  });

  if (!course) {
    redirect(`/admin/courses/${id}/edit?error=Failed+to+update+course`);
  }

  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${id}/edit`);
  redirect(`/admin/courses/${id}/edit?message=Course+updated`);
}

export async function deleteCourseAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;

  if (!id) {
    redirect('/admin/courses?error=Course+ID+is+required');
  }

  const existing = await getCourseById(id);
  if (!existing) {
    redirect('/admin/courses?error=Course+not+found');
  }

  const deleted = await deleteCourse(id);
  if (!deleted) {
    redirect(`/admin/courses/${id}/edit?error=Failed+to+delete+course`);
  }

  revalidatePath('/admin/courses');
  redirect('/admin/courses?message=Course+deleted');
}
