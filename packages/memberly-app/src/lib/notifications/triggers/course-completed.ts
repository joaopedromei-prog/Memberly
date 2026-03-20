/**
 * COURSE_COMPLETED trigger — notifies a member when they complete
 * 100% of published lessons in a product.
 *
 * Reuses checkProductCompletion() from certificates module.
 *
 * Story 15.3 — AC5, AC6
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { checkProductCompletion } from '@/lib/certificates/completion-check';
import { createNotification } from '../create-notification';
import { NOTIFICATION_TYPES } from '../types';
import type { NotificationsConfig } from '@/types/database';

export async function notifyCourseCompleted(
  profileId: string,
  lessonId: string
): Promise<void> {
  const adminClient = createAdminClient();

  // Get product info for this lesson (including notifications_config)
  const { data: lesson } = await adminClient
    .from('lessons')
    .select('module:modules!inner(product_id, product:products!inner(title, slug, notifications_config))')
    .eq('id', lessonId)
    .single();

  if (!lesson) return;

  const module = lesson.module as unknown as {
    product_id: string;
    product: { title: string; slug: string; notifications_config: NotificationsConfig | null };
  };

  // Check product notification config — default to true if missing (AC5, AC6)
  const isEnabled = module.product.notifications_config?.COURSE_COMPLETED ?? true;
  if (!isEnabled) return;

  // Check if all published lessons are completed
  const result = await checkProductCompletion(adminClient, profileId, module.product_id);

  if (!result.completed) return;

  await createNotification({
    profileId,
    type: NOTIFICATION_TYPES.COURSE_COMPLETED,
    title: 'Curso concluído!',
    body: `Parabéns! Você completou ${module.product.title}`,
    data: { productId: module.product_id, productSlug: module.product.slug },
  });
}
