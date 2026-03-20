'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteArticle } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteArticleAction(id: string): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const success = await deleteArticle(id);
  if (!success) {
    redirect(`/admin/articles?error=Failed+to+delete+article`);
  }
  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}
