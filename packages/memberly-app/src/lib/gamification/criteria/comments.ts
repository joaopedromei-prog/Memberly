/**
 * COMMENTS_10 criterion — checks if the member has at least 10 comments.
 *
 * Story 16.2 — AC7
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function checkComments(
  profileId: string,
  threshold: number,
  adminClient: SupabaseClient
): Promise<boolean> {
  const { count } = await adminClient
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId);

  return (count ?? 0) >= threshold;
}
