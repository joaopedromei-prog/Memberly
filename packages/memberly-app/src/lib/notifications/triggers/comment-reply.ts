/**
 * COMMENT_REPLY trigger — notifies the parent comment author
 * when someone replies to their comment.
 *
 * Does NOT notify if the replier is the same as the parent comment author (self-reply).
 *
 * Story 15.3 — AC4, AC6
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createNotification } from '../create-notification';
import { NOTIFICATION_TYPES } from '../types';
import type { NotificationsConfig } from '@/types/database';

export async function notifyCommentReply(
  commentId: string,
  parentCommentId: string,
  replierId: string
): Promise<void> {
  const adminClient = createAdminClient();

  // Get parent comment author
  const { data: parentComment } = await adminClient
    .from('comments')
    .select('profile_id, lesson_id')
    .eq('id', parentCommentId)
    .single();

  if (!parentComment) return;

  // Self-reply: do not notify
  if (parentComment.profile_id === replierId) return;

  // Check product notification config for COMMENT_REPLY (AC5, AC6)
  const { data: lesson } = await adminClient
    .from('lessons')
    .select('title, module:modules!inner(product:products!inner(notifications_config))')
    .eq('id', parentComment.lesson_id)
    .single();

  if (lesson) {
    const mod = lesson.module as unknown as {
      product: { notifications_config: NotificationsConfig | null };
    };
    const isEnabled = mod.product.notifications_config?.COMMENT_REPLY ?? true;
    if (!isEnabled) return;
  }

  // Get replier name
  const { data: replier } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', replierId)
    .single();

  const replierName = replier?.full_name ?? 'Alguém';
  const lessonTitle = lesson?.title ?? 'uma aula';

  await createNotification({
    profileId: parentComment.profile_id,
    type: NOTIFICATION_TYPES.COMMENT_REPLY,
    title: 'Nova resposta ao seu comentário',
    body: `${replierName} respondeu ao seu comentário em ${lessonTitle}`,
    data: { lessonId: parentComment.lesson_id, commentId, parentCommentId },
  });
}
