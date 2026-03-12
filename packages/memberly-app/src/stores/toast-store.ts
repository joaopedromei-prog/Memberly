import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, variant: ToastVariant) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, variant) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
