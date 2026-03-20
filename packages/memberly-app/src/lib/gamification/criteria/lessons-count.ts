/**
 * LESSONS_50 criterion — checks if the member has completed at least 50 lessons.
 *
 * Story 16.2 — AC9
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function checkLessonsCount(
  profileId: string,
  threshold: number,
  adminClient: SupabaseClient
): Promise<boolean> {
  const { count } = await adminClient
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('completed', true);

  return (count ?? 0) >= threshold;
}
