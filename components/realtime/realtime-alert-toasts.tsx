'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, AlertTriangle, Bell, Info } from 'lucide-react';
import type { DbAlert } from '@/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface AlertToast {
  id: string;
  alert: DbAlert;
  visible: boolean;
}

const SEVERITY_STYLES = {
  CRITICAL: 'border-red-500/40 bg-red-950/80',
  WARNING: 'border-amber-500/40 bg-amber-950/80',
  INFO: 'border-blue-500/40 bg-blue-950/80',
} as const;

const SEVERITY_ICONS = {
  CRITICAL: AlertTriangle,
  WARNING: Bell,
  INFO: Info,
} as const;

/**
 * Global realtime alert toast provider.
 * Listens to new alert INSERTs and shows toast notifications
 * for WARNING and CRITICAL alerts.
 *
 * Place once in the dashboard layout.
 */
export function RealtimeAlertToasts() {
  const [toasts, setToasts] = useState<AlertToast[]>([]);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const supabase = createClient();

    channelRef.current = supabase
      .channel('alert-toasts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload: RealtimePostgresChangesPayload<DbAlert>) => {
          if (payload.eventType !== 'INSERT' || !payload.new) return;
          const newAlert = payload.new as DbAlert;

          // Only toast for WARNING and CRITICAL
          if (newAlert.severity === 'INFO') return;

          const toastId = newAlert.id;
          setToasts(prev => {
            if (prev.some(t => t.id === toastId)) return prev;
            return [...prev, { id: toastId, alert: newAlert, visible: true }];
          });

          // Auto-dismiss after 8 seconds
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toastId));
          }, 8000);
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(({ id, alert }) => {
        const styles = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.INFO;
        const Icon = SEVERITY_ICONS[alert.severity] ?? SEVERITY_ICONS.INFO;

        return (
          <div
            key={id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-right-5 duration-300 ${styles}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-current opacity-80" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {alert.severity === 'CRITICAL' ? '🚨 Critical Alert' : '⚠️ Warning'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {alert.message}
              </p>
            </div>
            <button
              onClick={() => dismiss(id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
