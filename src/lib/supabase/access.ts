import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import type { AccessTier } from '@/lib/supabase/types';

const TIER_RANK: Record<string, number> = { free: 0, basic: 1, premium: 2 };

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
  const hasAccess = member
    ? TIER_RANK[member.tier] >= TIER_RANK[requiredTier]
    : false;

  return { hasAccess, user };
}
