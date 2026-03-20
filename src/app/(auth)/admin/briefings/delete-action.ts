'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteBriefing } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteBriefingAction(id: string): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const success = await deleteBriefing(id);
  if (!success) {
    redirect(`/admin/briefings?error=Failed+to+delete+briefing`);
  }
  revalidatePath('/admin/briefings');
  redirect('/admin/briefings');
}
