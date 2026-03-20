/**
 * EXPLORER_3 criterion — checks if the member has access to at least 3 distinct products.
 *
 * Story 16.2 — AC8
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function checkExplorer(
  profileId: string,
  threshold: number,
  adminClient: SupabaseClient
): Promise<boolean> {
  const { count } = await adminClient
    .from('member_access')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId);

  return (count ?? 0) >= threshold;
}
