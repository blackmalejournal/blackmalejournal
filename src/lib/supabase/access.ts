import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import { includesTier } from '@/lib/membership';
import type { AccessTier } from '@/lib/supabase/types';

/**
 * Checks whether the current user has access to content at the given tier.
 * Returns { hasAccess, user } — user is null if not authenticated.
 */
export async function checkContentAccess(requiredTier: AccessTier): Promise<{
  hasAccess: boolean;
  user: { id: string; email?: string } | null;
}> {
  if (requiredTier === 'free') {
    return { hasAccess: true, user: null };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { hasAccess: false, user: null };
  }

  const member = await getMemberById(user.id);
  const hasAccess = member ? includesTier(member.tier, requiredTier) : false;

  return { hasAccess, user };
}
