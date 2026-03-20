'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteDispatch } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteDispatchAction(id: string): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const success = await deleteDispatch(id);
  if (!success) {
    redirect(`/admin/dispatches?error=Failed+to+delete+dispatch`);
  }
  revalidatePath('/admin/dispatches');
  redirect('/admin/dispatches');
}
