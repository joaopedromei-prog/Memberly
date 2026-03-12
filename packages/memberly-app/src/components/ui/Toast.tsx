'use client';

import { useToastStore, type ToastVariant } from '@/stores/toast-store';
import { cn } from '@/lib/utils/cn';

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-black',
};

const variantIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all animate-in slide-in-from-right',
            'min-w-[300px] max-w-[420px]',
            variantStyles[toast.variant]
          )}
        >
          <span className="text-lg font-bold">{variantIcons[toast.variant]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-70 hover:opacity-100"
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
