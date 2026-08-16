'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { AlertSeverity } from '@/types/alert';

// =============================================================================
// Types
// =============================================================================

export interface Toast {
  id: string;
  title: string;
  description?: string;
  severity: AlertSeverity;
  /** Auto-dismiss after ms (0 = manual only) */
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// =============================================================================
// Context
// =============================================================================

const ToastContext = createContext<ToastContextType | null>(null);

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within a ToastProvider');
  return ctx;
}

// =============================================================================
// Provider
// =============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// =============================================================================
// Container
// =============================================================================

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  INFO: 'border-blue-500/30 bg-blue-500/10',
  WARNING: 'border-amber-500/30 bg-amber-500/10',
  CRITICAL: 'border-red-500/30 bg-red-500/10',
};

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  INFO: 'bg-blue-400',
  WARNING: 'bg-amber-400',
  CRITICAL: 'bg-red-400',
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5',
        SEVERITY_STYLES[toast.severity]
      )}
    >
      <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', SEVERITY_DOT[toast.severity])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
