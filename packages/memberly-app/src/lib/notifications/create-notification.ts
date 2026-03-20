/**
 * Core notification creation service.
 * Checks user preferences before creating a notification.
 * Uses admin client (service role) to bypass RLS.
 *
 * Story 15.3 — AC1, AC2
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { CreateNotificationParams } from './types';

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const adminClient = createAdminClient();

  // Check user preference — if preference exists and is disabled, skip (AC2)
  const { data: pref } = await adminClient
    .from('notification_preferences')
    .select('enabled')
    .eq('profile_id', params.profileId)
    .eq('notification_type', params.type)
    .maybeSingle();

  // If preference exists and is disabled, do not create notification
  if (pref && !pref.enabled) return;

  // Default: enabled (no preference record = enabled)
  await adminClient.from('notifications').insert({
    profile_id: params.profileId,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data ?? null,
  });
}
