/**
 * Badge evaluation engine.
 * Evaluates all active badges against a member's progress and unlocks new ones.
 *
 * Story 16.2 — AC1, AC2, AC10
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { notifyBadgeUnlocked } from '@/lib/notifications/triggers/badge-unlocked';
import { criteriaCheckers } from './criteria';
import type { BadgeCriteria } from './types';

/**
 * Evaluate all active badges for a member and unlock any newly earned ones.
 *
 * @param profileId - The member's profile ID
 * @returns Array of badge IDs that were newly unlocked
 */
export async function evaluateBadges(profileId: string): Promise<string[]> {
  const adminClient = createAdminClient();

  // 1. Get all active badges
  const { data: badges } = await adminClient
    .from('badges')
    .select('id, criteria')
    .eq('active', true);

  if (!badges?.length) return [];

  // 2. Get member's existing badges
  const { data: existing } = await adminClient
    .from('member_badges')
    .select('badge_id')
    .eq('profile_id', profileId);

  const existingIds = new Set(existing?.map((b) => b.badge_id) ?? []);

  // 3. Filter badges member doesn't have yet
  const candidates = badges.filter((b) => !existingIds.has(b.id));
  if (!candidates.length) return [];

  // 4. Evaluate each candidate
  const unlocked: string[] = [];

  for (const badge of candidates) {
    const criteria = badge.criteria as BadgeCriteria;
    const checker = criteriaCheckers[criteria.type];
    if (!checker) continue;

    const met = await checker(profileId, criteria.threshold, adminClient);
    if (met) {
      // Insert — UNIQUE constraint on (profile_id, badge_id) prevents duplicates
      const { error } = await adminClient.from('member_badges').insert({
        profile_id: profileId,
        badge_id: badge.id,
      });

      // Silently ignore unique_violation (race condition safe)
      if (error && error.code !== '23505') {
        throw error;
      }

      // Only count as unlocked if no error (or duplicate)
      if (!error) {
        unlocked.push(badge.id);

        // Fire-and-forget notification — failure must NOT block badge unlock (AC5, AC6)
        notifyBadgeUnlocked(profileId, badge.id).catch(() => {/* silent */});
      }
    }
  }

  return unlocked;
}
