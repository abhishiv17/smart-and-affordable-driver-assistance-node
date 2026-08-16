// =============================================================================
// Telemetry Deduplication — Idempotency Check
// =============================================================================
// Prevents duplicate telemetry events from being processed.
// Each telemetry event has a unique UUID `id`. If the same event is
// submitted again (e.g., due to retry logic in the device), it is
// skipped and counted as a duplicate.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Check if a telemetry event ID already exists in the database.
 *
 * @returns true if the event already exists (is a duplicate).
 */
export async function isDuplicateEvent(
  client: SupabaseClient<Database>,
  eventId: string
): Promise<boolean> {
  const { data, error } = await client
    .from('telemetry')
    .select('id')
    .eq('id', eventId)
    .limit(1)
    .maybeSingle();

  if (error) {
    // If there's a DB error, don't block — let the insert fail naturally
    console.error('[dedup] Error checking duplicate:', error.message);
    return false;
  }

  return data !== null;
}

/**
 * Check multiple event IDs for duplicates in a single query.
 * Returns the set of IDs that already exist.
 */
export async function findDuplicateEventIds(
  client: SupabaseClient<Database>,
  eventIds: string[]
): Promise<Set<string>> {
  if (eventIds.length === 0) return new Set();

  const { data, error } = await client
    .from('telemetry')
    .select('id')
    .in('id', eventIds);

  if (error) {
    console.error('[dedup] Error checking duplicates:', error.message);
    return new Set();
  }

  return new Set((data ?? []).map(row => row.id));
}
