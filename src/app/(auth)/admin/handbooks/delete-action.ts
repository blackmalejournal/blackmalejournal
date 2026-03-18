'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteHandbook } from '@/lib/supabase/admin-queries';

export async function deleteHandbookAction(id: string): Promise<void> {
  const success = await deleteHandbook(id);
  if (!success) {
    redirect(`/admin/handbooks?error=Failed+to+delete+handbook`);
  }
  revalidatePath('/admin/handbooks');
  redirect('/admin/handbooks');
}
