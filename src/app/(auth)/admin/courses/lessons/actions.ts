'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createLesson,
  deleteLesson,
  getCourseById,
  getLessonById,
  updateLesson,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/utils';

const lessonSchema = z.object({
  course_id: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  order_number: z.coerce.number().int().min(1, 'Order number must be at least 1'),
  body: z.string().min(1, 'Body is required'),
  video_url: z.string().optional(),
  duration: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(false),
});

export async function createLessonAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const parsed = lessonSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const courseId = formData.get('course_id') as string;
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/courses/${courseId}/lessons/new?error=${encodeURIComponent(firstError)}`);
  }

  const { course_id, title, slug, order_number, body, video_url, duration, published } = parsed.data;
  const lesson = await createLesson({
    course_id,
    title,
    slug: slug?.trim() || generateSlug(title),
    order_number,
    body,
    video_url: video_url?.trim() || null,
    duration,
    published,
  });

  if (!lesson) {
    redirect(`/admin/courses/${course_id}/lessons/new?error=Failed+to+create+lesson`);
  }

  revalidatePath(`/admin/courses/${course_id}/edit`);
  redirect(`/admin/courses/${course_id}/lessons/${lesson.id}/edit?message=Lesson+created`);
}

export async function updateLessonAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;

  if (!id) {
    redirect('/admin/courses?error=Lesson+ID+is+required');
  }

  const parsed = lessonSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const courseId = formData.get('course_id') as string;
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`/admin/courses/${courseId}/lessons/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const { course_id, title, slug, order_number, body, video_url, duration, published } = parsed.data;
  const lesson = await updateLesson(id, {
    title,
    slug: slug?.trim() || generateSlug(title),
    order_number,
    body,
    video_url: video_url?.trim() || null,
    duration,
    published,
  });

  if (!lesson) {
    redirect(`/admin/courses/${course_id}/lessons/${id}/edit?error=Failed+to+update+lesson`);
  }

  revalidatePath(`/admin/courses/${course_id}/edit`);
  revalidatePath(`/admin/courses/${course_id}/lessons/${id}/edit`);
  redirect(`/admin/courses/${course_id}/lessons/${id}/edit?message=Lesson+updated`);
}

export async function deleteLessonAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  const courseId = formData.get('course_id') as string;

  if (!id || !courseId) {
    redirect('/admin/courses?error=Lesson+ID+is+required');
  }

  const existing = await getLessonById(id);
  if (!existing) {
    redirect(`/admin/courses/${courseId}/edit?error=Lesson+not+found`);
  }

  const course = await getCourseById(courseId);
  if (!course) {
    redirect('/admin/courses?error=Course+not+found');
  }

  const deleted = await deleteLesson(id);
  if (!deleted) {
    redirect(`/admin/courses/${courseId}/lessons/${id}/edit?error=Failed+to+delete+lesson`);
  }

  revalidatePath(`/admin/courses/${courseId}/edit`);
  redirect(`/admin/courses/${courseId}/edit?message=Lesson+deleted`);
}
