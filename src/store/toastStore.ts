import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  position?: ToastPosition;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? 5000, // 5 segundos por defecto
      position: toast.position ?? 'top-right',
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-dismiss después del duration especificado
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

// Helper functions para usar fácilmente
export const toast = {
  success: (message: string, duration?: number, position?: ToastPosition) => {
    useToastStore.getState().addToast({ type: 'success', message, duration, position });
  },
  error: (message: string, duration?: number, position?: ToastPosition) => {
    useToastStore.getState().addToast({ type: 'error', message, duration, position });
  },
  warning: (message: string, duration?: number, position?: ToastPosition) => {
    useToastStore.getState().addToast({ type: 'warning', message, duration, position });
  },
  info: (message: string, duration?: number, position?: ToastPosition) => {
    useToastStore.getState().addToast({ type: 'info', message, duration, position });
  },
};

export default useToastStore;
