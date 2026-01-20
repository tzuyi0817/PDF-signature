import type { ComponentInternalInstance } from 'vue';

export type ToastType = 'success' | 'error' | 'warn';

export interface ToastOptions {
  message?: string;
  duration?: number;
  zIndex?: number;
  type?: ToastType;
  onClosed?: () => void;
}

export type ToastParams = string | ToastOptions;

export interface ToastProps extends ToastOptions {
  id: string;
  onClose: () => void;
  onClosed: () => void;
  onMounted: (height: number) => void;
}

export interface ToastContext {
  id: string;
  component: ComponentInternalInstance;
  close: () => void;
}
