/**
 * Notification type constants and interfaces for the notification system.
 * Story 15.3 — AC7
 */

export const NOTIFICATION_TYPES = {
  NEW_LESSON: 'NEW_LESSON',
  COMMENT_REPLY: 'COMMENT_REPLY',
  COURSE_COMPLETED: 'COURSE_COMPLETED',
  BADGE_UNLOCKED: 'BADGE_UNLOCKED',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface CreateNotificationParams {
  profileId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}
