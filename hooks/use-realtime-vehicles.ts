'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DbVehicle } from '@/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Subscribe to realtime vehicle state changes (UPDATE).
 * Merges live status, safety score, location, and speed updates
 * into the initial server-rendered vehicle list.
 */
export function useRealtimeVehicles(initialVehicles: DbVehicle[]) {
  const [vehicles, setVehicles] = useState<DbVehicle[]>(initialVehicles);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<DbVehicle>) => {
      if (!payload.new) return;
      const updated = payload.new as DbVehicle;

      setVehicles(prev => {
        const exists = prev.some(v => v.id === updated.id);
        if (exists) {
          return prev.map(v => (v.id === updated.id ? { ...v, ...updated } : v));
        }
        // New vehicle added — append
        return [...prev, updated];
      });
    },
    []
  );

  useEffect(() => {
    const supabase = createClient();

    channelRef.current = supabase
      .channel('realtime-vehicles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        handleChange
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [handleChange]);

  // Sync with new SSR data
  useEffect(() => {
    setVehicles(initialVehicles);
  }, [initialVehicles]);

  return { vehicles };
}
