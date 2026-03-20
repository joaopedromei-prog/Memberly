/**
 * Returns the target URL for a notification based on its type and data.
 * Shared between NotificationDropdown (15.4) and NotificationsPage (15.5).
 */
export function getNotificationUrl(notification: {
  type: string;
  data?: Record<string, unknown> | null;
}): string {
  const data = notification.data ?? {};

  switch (notification.type) {
    case 'NEW_LESSON': {
      const slug = data.productSlug as string | undefined;
      const lessonId = data.lessonId as string | undefined;
      if (slug && lessonId) return `/products/${slug}/lessons/${lessonId}`;
      if (slug) return `/products/${slug}`;
      return '/';
    }
    case 'COMMENT_REPLY': {
      const slug = data.productSlug as string | undefined;
      const lessonId = data.lessonId as string | undefined;
      if (slug && lessonId) return `/products/${slug}/lessons/${lessonId}`;
      return '/';
    }
    case 'COURSE_COMPLETED': {
      const slug = data.productSlug as string | undefined;
      if (slug) return `/products/${slug}`;
      return '/';
    }
    default:
      return '/';
  }
}
