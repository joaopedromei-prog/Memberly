'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

export function DropdownMenu({ items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Mais ações"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setOpen(false);
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
        </div>
      )}
    </div>
  );
}
