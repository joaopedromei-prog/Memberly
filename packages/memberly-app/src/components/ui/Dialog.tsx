'use client';

import { useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const sizeClasses: Record<NonNullable<DialogProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

function DialogRoot({ open, onClose, size = 'md', children }: DialogProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
        data-testid="dialog-overlay"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${sizeClasses[size]} rounded-xl bg-white p-6 shadow-xl`}
        data-testid="dialog-content"
      >
        {children}
      </div>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{children}</h2>
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <div className="mb-6">{children}</div>;
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-3">{children}</div>;
}

const Dialog = Object.assign(DialogRoot, {
  Header,
  Body,
  Footer,
});

export { Dialog };
