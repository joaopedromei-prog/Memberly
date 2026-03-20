/**
 * BADGE_UNLOCKED trigger — notifies a member when they unlock a new badge.
 *
 * Fetches badge info by ID, then creates a notification with the badge name.
 * Returns silently if badge is not found (e.g., deleted between unlock and notify).
 *
 * Story 16.8 — AC3, AC4
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createNotification } from '../create-notification';
import { NOTIFICATION_TYPES } from '../types';

export async function notifyBadgeUnlocked(
  profileId: string,
  badgeId: string
): Promise<void> {
  const adminClient = createAdminClient();

  // Get badge info
  const { data: badge } = await adminClient
    .from('badges')
    .select('name, description')
    .eq('id', badgeId)
    .single();

  if (!badge) return;

  await createNotification({
    profileId,
    type: NOTIFICATION_TYPES.BADGE_UNLOCKED,
    title: 'Nova conquista desbloqueada!',
    body: `Voce conquistou: ${badge.name}`,
    data: { badgeId, badgeName: badge.name },
  });
}
