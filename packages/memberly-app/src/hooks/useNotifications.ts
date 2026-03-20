'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationType } from '@/lib/notifications/types';

export interface Notification {
  id: string;
  profile_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  data: Record<string, string> | null;
  created_at: string;
  read_at: string | null;
}

const POLL_INTERVAL = 30_000;

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const markingRef = useRef<Set<string>>(new Set());

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      if (res.ok) {
        const json = await res.json();
        setUnreadCount(json.data?.count ?? 0);
      }
    } catch {
      // Silently fail — polling will retry
    }
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=10');
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data?.notifications ?? []);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (id: string) => {
      // Debounce: skip if already marking this notification
      if (markingRef.current.has(id)) return;
      markingRef.current.add(id);

      try {
        const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch {
        // Silently fail
      } finally {
        markingRef.current.delete(id);
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, read_at: n.read_at ?? new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch {
      // Silently fail
    }
  }, []);

  return { unreadCount, notifications, isLoading, markAsRead, markAllAsRead, refresh };
}
