'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DbAlert } from '@/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Subscribe to realtime alert changes (INSERT, UPDATE).
 * Merges new alerts into the initial server-rendered list.
 *
 * @param initialAlerts - Alerts fetched during SSR
 * @param maxItems - Maximum items to keep in the list
 */
export function useRealtimeAlerts(
  initialAlerts: DbAlert[],
  maxItems = 20
) {
  const [alerts, setAlerts] = useState<DbAlert[]>(initialAlerts);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  // Track new alert arrivals for toast notifications
  const [latestNewAlert, setLatestNewAlert] = useState<DbAlert | null>(null);

  const handleInsert = useCallback(
    (payload: RealtimePostgresChangesPayload<DbAlert>) => {
      if (payload.eventType !== 'INSERT' || !payload.new) return;
      const newAlert = payload.new as DbAlert;

      setAlerts(prev => {
        // Deduplicate
        if (prev.some(a => a.id === newAlert.id)) return prev;
        // Prepend and cap
        return [newAlert, ...prev].slice(0, maxItems);
      });

      setLatestNewAlert(newAlert);
    },
    [maxItems]
  );

  const handleUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<DbAlert>) => {
      if (payload.eventType !== 'UPDATE' || !payload.new) return;
      const updated = payload.new as DbAlert;

      setAlerts(prev =>
        prev.map(a => (a.id === updated.id ? { ...a, ...updated } : a))
      );
    },
    []
  );

  useEffect(() => {
    const supabase = createClient();
    const channelName = `realtime-alerts-${Math.random().toString(36).substring(2, 9)}`;

    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        handleInsert
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alerts' },
        handleUpdate
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [handleInsert, handleUpdate]);

  // Sync with new SSR data on navigation
  useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  return { alerts, latestNewAlert };
}
