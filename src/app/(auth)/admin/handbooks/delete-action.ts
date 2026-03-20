'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteHandbook } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteHandbookAction(id: string): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const success = await deleteHandbook(id);
  if (!success) {
    redirect(`/admin/handbooks?error=Failed+to+delete+handbook`);
  }
  revalidatePath('/admin/handbooks');
  redirect('/admin/handbooks');
}
