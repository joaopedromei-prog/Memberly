'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
            data-testid="dialog-overlay"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className={`relative z-10 w-full ${sizeClasses[size]} rounded-xl bg-white p-6 shadow-xl`}
            data-testid="dialog-content"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
