'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { NotificationCard, type Notification } from './NotificationCard';

const FILTER_TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'NEW_LESSON', label: 'Novas aulas' },
  { key: 'COMMENT_REPLY', label: 'Respostas' },
  { key: 'COURSE_COMPLETED', label: 'Concluídos' },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]['key'];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async (append = false, currentCursor?: string | null) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams({ limit: '20' });
      const cursorToUse = append ? currentCursor : null;
      if (cursorToUse) params.set('cursor', cursorToUse);

      const res = await fetch(`/api/notifications?${params}`);
      if (!res.ok) throw new Error('Fetch failed');

      const json = await res.json();
      const data = json.data;
      const newNotifications: Notification[] = data.notifications;
      const nextCursor: string | null = data.nextCursor;

      if (append) {
        setNotifications((prev) => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setCursor(nextCursor);
      setHasMore(nextCursor !== null);
    } catch {
      // Silently fail — user sees what was previously loaded
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  const handleLoadMore = useCallback(() => {
    fetchNotifications(true, cursor);
  }, [fetchNotifications, cursor]);

  const handleMarkRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
      )
    );

    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Mark read failed');
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: false, read_at: null } : n
        )
      );
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setIsMarkingAll(true);

    // Optimistic update
    const prevNotifications = notifications;
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, read_at: n.read_at ?? new Date().toISOString() }))
    );

    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (!res.ok) throw new Error('Mark all read failed');
    } catch {
      // Revert on failure
      setNotifications(prevNotifications);
    } finally {
      setIsMarkingAll(false);
    }
  }, [notifications]);

  const handleDelete = useCallback(async (id: string) => {
    // Optimistic delete
    const prevNotifications = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    } catch {
      // Revert on failure
      setNotifications(prevNotifications);
    }
  }, [notifications]);

  // Client-side filter
  const filtered =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const hasUnread = notifications.some((n) => !n.read);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-surface rounded w-48" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 bg-dark-surface rounded-full w-24" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-dark-surface rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Notificações</h1>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            {isMarkingAll ? 'Marcando...' : 'Marcar todas como lidas'}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary text-white'
                : 'bg-dark-surface text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list or empty state */}
      {notifications.length === 0 ? (
        <EmptyState type="none" />
      ) : filtered.length === 0 ? (
        <EmptyState type="filtered" />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && filter === 'all' && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 bg-dark-surface hover:bg-dark-card text-neutral-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ type }: { type: 'none' | 'filtered' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Bell className="text-neutral-600 mb-4" size={48} />
      <p className="text-neutral-500 text-lg">
        {type === 'none'
          ? 'Você não tem notificações'
          : 'Nenhuma notificação deste tipo'}
      </p>
    </div>
  );
}
