/**
 * COURSE_COMPLETE criterion — checks if the member has completed 100%
 * of published lessons for at least 1 product they have access to.
 *
 * Reuses the completion-check logic from certificates.
 *
 * Story 16.2 — AC4
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { checkProductCompletion } from '@/lib/certificates/completion-check';

export async function checkCourseComplete(
  profileId: string,
  _threshold: number,
  adminClient: SupabaseClient
): Promise<boolean> {
  // Get all products the member has access to
  const { data: accessList } = await adminClient
    .from('member_access')
    .select('product_id')
    .eq('profile_id', profileId);

  if (!accessList?.length) return false;

  // Check completion for each product — return true on first complete
  for (const access of accessList) {
    const result = await checkProductCompletion(adminClient, profileId, access.product_id);
    if (result.completed) return true;
  }

  return false;
}
