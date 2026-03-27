'use server';

import { createClient } from '@/lib/supabase/server';

type ToggleResult =
  | { bookmarked: boolean; error?: never }
  | { bookmarked?: never; error: string };

export async function toggleBookmark(
  contentType: string,
  contentId: string,
): Promise<ToggleResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  const memberId = user.id;

  // Check if bookmark already exists
  const { data: existing, error: selectError } = await supabase
    .from('member_bookmarks')
    .select('id')
    .eq('member_id', memberId)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .limit(1);

  if (selectError) {
    return { error: selectError.message };
  }

  const alreadyBookmarked = Array.isArray(existing) && existing.length > 0;

  if (alreadyBookmarked) {
    // Delete the bookmark
    const { error: deleteError } = await supabase
      .from('member_bookmarks')
      .delete()
      .eq('member_id', memberId)
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    return { bookmarked: false };
  } else {
    // Insert a new bookmark
    const { error: insertError } = await supabase
      .from('member_bookmarks')
      .insert({ member_id: memberId, content_type: contentType, content_id: contentId });

    if (insertError) {
      return { error: insertError.message };
    }

    return { bookmarked: true };
  }
}
