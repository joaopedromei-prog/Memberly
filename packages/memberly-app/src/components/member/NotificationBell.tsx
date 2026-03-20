'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NotificationDropdown } from '@/components/member/NotificationDropdown';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationBell() {
  const { unreadCount, notifications, isLoading, markAsRead, markAllAsRead, refresh } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key to close
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  function handleToggle() {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      refresh();
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notificações"
        className="relative p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 md:w-96 z-50"
          >
            <NotificationDropdown
              notifications={notifications}
              isLoading={isLoading}
              onMarkRead={markAsRead}
              onMarkAllRead={markAllAsRead}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
