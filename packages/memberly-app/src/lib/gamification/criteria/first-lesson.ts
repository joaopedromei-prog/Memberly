/**
 * FIRST_LESSON criterion — checks if the member has completed at least 1 lesson.
 *
 * Story 16.2 — AC3
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function checkFirstLesson(
  profileId: string,
  _threshold: number,
  adminClient: SupabaseClient
): Promise<boolean> {
  const { count } = await adminClient
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('completed', true);

  return (count ?? 0) >= 1;
}
