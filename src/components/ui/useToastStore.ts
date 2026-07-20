import { create } from 'zustand';

export type ToastType = 'error' | 'success';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  add: (type: ToastType, message: string) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  remove: (id: number) => void;
}

const DISMISS_MS = 4000;

let nextId = 1;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (type, message) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, DISMISS_MS);
  },

  error: (message) => useToastStore.getState().add('error', message),
  success: (message) => useToastStore.getState().add('success', message),

  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
