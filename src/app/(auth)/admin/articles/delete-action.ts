'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteArticle } from '@/lib/supabase/admin-queries';

export async function deleteArticleAction(id: string): Promise<void> {
  const success = await deleteArticle(id);
  if (!success) {
    redirect(`/admin/articles?error=Failed+to+delete+article`);
  }
  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}
