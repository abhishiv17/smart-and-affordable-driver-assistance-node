// =============================================================================
// Safety Scoring Algorithm
// =============================================================================
// Calculates a composite safety score (0–100) for a vehicle based on
// recent telemetry events. The score starts at 100 and is reduced by
// safety events in a rolling time window.
//
// Safety score range: 0–100
// - 90–100: Excellent
// - 70–89:  Good
// - 50–69:  Fair
// - 30–49:  Poor
// - 0–29:   Critical
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Safety score classification bands.
 */
export const SAFETY_SCORE_BANDS = {
  EXCELLENT: { min: 90, max: 100, label: 'Excellent' },
  GOOD: { min: 70, max: 89, label: 'Good' },
  FAIR: { min: 50, max: 69, label: 'Fair' },
  POOR: { min: 30, max: 49, label: 'Poor' },
  CRITICAL: { min: 0, max: 29, label: 'Critical' },
} as const;

/**
 * Deduction per event type in the rolling window.
 */
export const EVENT_DEDUCTIONS: Record<string, number> = {
  DROWSINESS: 8,
  HARSH_BRAKING: 5,
  HARSH_ACCELERATION: 3,
  DEVICE_OFFLINE: 2,
};

/**
 * Get the safety band for a given score.
 */
export function getSafetyBand(score: number) {
  if (score >= SAFETY_SCORE_BANDS.EXCELLENT.min) return SAFETY_SCORE_BANDS.EXCELLENT;
  if (score >= SAFETY_SCORE_BANDS.GOOD.min) return SAFETY_SCORE_BANDS.GOOD;
  if (score >= SAFETY_SCORE_BANDS.FAIR.min) return SAFETY_SCORE_BANDS.FAIR;
  if (score >= SAFETY_SCORE_BANDS.POOR.min) return SAFETY_SCORE_BANDS.POOR;
  return SAFETY_SCORE_BANDS.CRITICAL;
}

/**
 * Calculate a composite safety score for a vehicle from telemetry data
 * in the specified rolling time window.
 *
 * Algorithm:
 * 1. Start from 100
 * 2. Query telemetry events in the time window
 * 3. Deduct points per event type
 * 4. Clamp result to [0, 100]
 *
 * @param client - Supabase admin client
 * @param vehicleId - Vehicle to calculate score for
 * @param timeRangeHours - Rolling window in hours (default: 24)
 * @returns Safety score (0–100)
 */
export async function calculateSafetyScore(
  client: SupabaseClient<Database>,
  vehicleId: string,
  timeRangeHours: number = 24
): Promise<number> {
  const windowStart = new Date(
    Date.now() - timeRangeHours * 60 * 60 * 1000
  ).toISOString();

  // Query events in the time window that have deductions
  const { data: events, error } = await client
    .from('telemetry')
    .select('event_type')
    .eq('vehicle_id', vehicleId)
    .gte('timestamp', windowStart)
    .in('event_type', ['DROWSINESS', 'HARSH_BRAKING', 'HARSH_ACCELERATION', 'DEVICE_OFFLINE']);

  if (error) {
    console.error('[scoring] Error querying telemetry:', error.message);
    // Return current score unchanged on error
    return 100;
  }

  let score = 100;

  for (const event of events ?? []) {
    const deduction = EVENT_DEDUCTIONS[event.event_type] ?? 0;
    score -= deduction;
  }

  // Clamp to [0, 100]
  return Math.max(0, Math.min(100, score));
}

/**
 * Quick safety score calculation from event counts.
 * Used when we already know the event counts (e.g., from the processor).
 */
export function calculateScoreFromCounts(
  counts: Record<string, number>
): number {
  let score = 100;

  for (const [eventType, count] of Object.entries(counts)) {
    const deduction = EVENT_DEDUCTIONS[eventType] ?? 0;
    score -= deduction * count;
  }

  return Math.max(0, Math.min(100, score));
}
