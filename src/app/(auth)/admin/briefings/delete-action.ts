'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteBriefing } from '@/lib/supabase/admin-queries';

export async function deleteBriefingAction(id: string): Promise<void> {
  const success = await deleteBriefing(id);
  if (!success) {
    redirect(`/admin/briefings?error=Failed+to+delete+briefing`);
  }
  revalidatePath('/admin/briefings');
  redirect('/admin/briefings');
}
