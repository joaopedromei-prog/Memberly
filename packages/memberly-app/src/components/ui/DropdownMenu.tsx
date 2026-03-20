'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

const MENU_WIDTH = 176; // w-44 = 11rem = 176px

function computePosition(
  triggerEl: HTMLElement,
  menuEl: HTMLElement | null
): { top: number; left: number } {
  const rect = triggerEl.getBoundingClientRect();
  const menuHeight = menuEl?.offsetHeight ?? 150;

  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight + 8;

  return {
    top: openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4,
    left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
  };
}

export function DropdownMenu({ items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) {
      setOpen(false);
      setPositioned(false);
      return;
    }
    // Pre-calculate position before opening so the menu doesn't flash at (0,0)
    if (triggerRef.current) {
      setPos(computePosition(triggerRef.current, null));
    }
    setOpen(true);
    setPositioned(false);
  };

  // Refine position after portal mounts (accurate menu height available)
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    setPos(computePosition(triggerRef.current, menuRef.current));
    setPositioned(true);
  }, [open]);

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setPositioned(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setPositioned(false);
      }
    }

    function handleScroll() {
      setOpen(false);
      setPositioned(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Mais ações"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            style={{
              top: pos.top,
              left: pos.left,
              opacity: positioned ? 1 : 0,
              pointerEvents: positioned ? 'auto' : 'none',
            }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                  setOpen(false);
                  setPositioned(false);
                }}
                className={cn(
                  'flex w-full items-center px-3 py-2 text-left text-sm',
                  item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
