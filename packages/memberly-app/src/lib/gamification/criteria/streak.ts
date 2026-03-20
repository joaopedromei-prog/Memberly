/**
 * STREAK_7 / STREAK_30 criterion — checks if current_streak >= threshold.
 *
 * Both criteria types use this same function; the threshold comes from the
 * badge's criteria JSONB (7 or 30).
 *
 * Story 16.2 — AC5, AC6
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function checkStreak(
  profileId: string,
  threshold: number,
  adminClient: SupabaseClient
): Promise<boolean> {
  const { data } = await adminClient
    .from('streaks')
    .select('current_streak')
    .eq('profile_id', profileId)
    .maybeSingle();

  return (data?.current_streak ?? 0) >= threshold;
}
