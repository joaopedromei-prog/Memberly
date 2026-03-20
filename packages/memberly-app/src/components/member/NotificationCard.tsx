'use client';

import { BookOpen, MessageCircle, Trophy, Bell, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getNotificationUrl } from '@/lib/notifications/get-notification-url';

const ICONS: Record<string, typeof Bell> = {
  NEW_LESSON: BookOpen,
  COMMENT_REPLY: MessageCircle,
  COURSE_COMPLETED: Trophy,
};

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, unknown> | null;
  created_at: string;
  read_at?: string | null;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationCard({ notification, onMarkRead, onDelete }: NotificationCardProps) {
  const router = useRouter();
  const Icon = ICONS[notification.type] ?? Bell;

  function handleClick() {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    const url = getNotificationUrl(notification);
    router.push(url);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(notification.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors hover:bg-dark-card ${
        !notification.read
          ? 'bg-dark-card/50 border-l-2 border-primary'
          : 'bg-transparent'
      }`}
    >
      <Icon className="text-neutral-400 mt-1 shrink-0" size={20} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{notification.title}</p>
        <p className="text-sm text-neutral-400 mt-1">{notification.body}</p>
        <p className="text-xs text-neutral-500 mt-2">
          {formatDateTime(notification.created_at)}
        </p>
      </div>
      <button
        onClick={handleDelete}
        className="text-neutral-600 hover:text-red-500 transition-colors shrink-0 mt-1"
        aria-label="Deletar notificação"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
