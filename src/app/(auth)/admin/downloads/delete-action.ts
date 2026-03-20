'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteDownload } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteDownloadAction(id: string): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const success = await deleteDownload(id);
  if (!success) {
    redirect(`/admin/downloads?error=Failed+to+delete+download`);
  }
  revalidatePath('/admin/downloads');
  redirect('/admin/downloads');
}
