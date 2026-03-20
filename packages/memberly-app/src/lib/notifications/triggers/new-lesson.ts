/**
 * NEW_LESSON trigger — notifies all members with access to a product
 * when a new lesson is published.
 *
 * Story 15.3 — AC3, AC6
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createNotification } from '../create-notification';
import { NOTIFICATION_TYPES } from '../types';
import type { NotificationsConfig } from '@/types/database';

export async function notifyNewLesson(lessonId: string): Promise<void> {
  const adminClient = createAdminClient();

  // Get lesson with module and product info (including notifications_config)
  const { data: lesson } = await adminClient
    .from('lessons')
    .select('title, module:modules!inner(product_id, product:products!inner(title, slug, notifications_config))')
    .eq('id', lessonId)
    .single();

  if (!lesson) return;

  const module = lesson.module as unknown as {
    product_id: string;
    product: { title: string; slug: string; notifications_config: NotificationsConfig | null };
  };

  // Check product notification config — default to true if missing (AC5, AC6)
  const isEnabled = module.product.notifications_config?.NEW_LESSON ?? true;
  if (!isEnabled) return;

  // Get all members with access to this product
  const { data: members } = await adminClient
    .from('member_access')
    .select('profile_id')
    .eq('product_id', module.product_id);

  if (!members?.length) return;

  // Create notifications for all members (fire-and-forget per member via allSettled)
  await Promise.allSettled(
    members.map((m) =>
      createNotification({
        profileId: m.profile_id,
        type: NOTIFICATION_TYPES.NEW_LESSON,
        title: 'Nova aula disponível',
        body: `${lesson.title} em ${module.product.title}`,
        data: { lessonId, productSlug: module.product.slug, moduleId: module.product_id },
      })
    )
  );
}
