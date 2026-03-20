'use client';

import Link from 'next/link';
import { BookOpen, MessageCircle, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { getRelativeTime } from '@/lib/utils/relative-time';
import type { Notification } from '@/hooks/useNotifications';
import type { NotificationType } from '@/lib/notifications/types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<{ size?: number; className?: string }>> = {
  NEW_LESSON: BookOpen,
  COMMENT_REPLY: MessageCircle,
  COURSE_COMPLETED: Trophy,
};

function getNotificationUrl(notification: Notification): string {
  const data = notification.data;
  if (!data) return '/notifications';

  switch (notification.type) {
    case 'NEW_LESSON':
      return `/products/${data.productSlug}/lessons/${data.lessonId}`;
    case 'COMMENT_REPLY':
      return `/products/${data.productSlug}/lessons/${data.lessonId}`;
    case 'COURSE_COMPLETED':
      return `/products/${data.productSlug}`;
    default:
      return '/notifications';
  }
}

interface NotificationDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onClose: () => void;
}

function NotificationItemSkeleton() {
  return (
    <div className="flex gap-3 p-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
  );
}

export function NotificationDropdown({
  notifications,
  isLoading,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationDropdownProps) {
  const hasUnread = notifications.some((n) => !n.read);

  async function handleClickNotification(notification: Notification) {
    if (!notification.read) {
      await onMarkRead(notification.id);
    }
    onClose();
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <h3 className="text-sm font-semibold text-white">Notificações</h3>
        {hasUnread && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div data-testid="notification-skeleton">
            <NotificationItemSkeleton />
            <NotificationItemSkeleton />
            <NotificationItemSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p className="text-sm text-neutral-500">Nenhuma notificação</p>
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] ?? BookOpen;
              const url = getNotificationUrl(notification);

              return (
                <li key={notification.id}>
                  <Link
                    href={url}
                    onClick={() => handleClickNotification(notification)}
                    className={`flex gap-3 p-3 hover:bg-dark-card transition-colors ${
                      !notification.read
                        ? 'bg-dark-card/50 border-l-2 border-l-primary'
                        : 'bg-transparent border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <Icon size={18} className={notification.read ? 'text-neutral-500' : 'text-primary'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          notification.read ? 'text-neutral-400 font-normal' : 'text-white font-medium'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-sm text-neutral-400 truncate mt-0.5">{notification.body}</p>
                      <p className="text-xs text-neutral-500 mt-1">{getRelativeTime(notification.created_at)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-dark-border px-4 py-2.5">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block text-center text-xs text-neutral-400 hover:text-white transition-colors"
        >
          Ver todas
        </Link>
      </div>
    </div>
  );
}
