import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useToastStore } from './useToastStore';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

export const Toaster = () => {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-3rem)]">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={spring}
              onClick={() => remove(toast.id)}
              className={`flex items-start gap-3 border px-4 py-3 rounded-none cursor-pointer shadow-md font-onest ${
                isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}
            >
              {isError ? (
                <AlertTriangle strokeWidth={1} className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 strokeWidth={1} className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              )}
              <span className="flex-1 text-sm text-zinc-900 leading-snug">{toast.message}</span>
              <X strokeWidth={1} className="w-4 h-4 text-zinc-500 shrink-0" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
