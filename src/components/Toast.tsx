import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastCardProps {
  key?: string;
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastCard({ toast, onRemove }: ToastCardProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-900/60',
      text: 'text-emerald-800 dark:text-emerald-200',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle2,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/80 dark:border-rose-900/60',
      text: 'text-rose-800 dark:text-rose-200',
      iconText: 'text-rose-600 dark:text-rose-400',
      icon: XCircle,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/80 dark:border-blue-900/60',
      text: 'text-blue-800 dark:text-blue-200',
      iconText: 'text-blue-600 dark:text-blue-400',
      icon: Info,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/80 dark:border-amber-900/60',
      text: 'text-amber-800 dark:text-amber-200',
      iconText: 'text-amber-600 dark:text-amber-400',
      icon: AlertTriangle,
    },
  };

  const current = config[toast.type];
  const Icon = current.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto border rounded-xl p-4 shadow-lg ${current.bg} flex items-start gap-3`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${current.iconText}`} />
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold leading-5 ${current.text}`}>
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5 rounded-lg hover:bg-black/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
