// =============================================================================
// Telemetry Processor — Full Pipeline
// =============================================================================
// Processes incoming telemetry events through the complete pipeline:
//   1. Deduplication check
//   2. Insert telemetry event
//   3. Update vehicle current state
//   4. Update device status
//   5. Generate safety alert if needed
//   6. Recalculate safety score
//
// This is the core of the SADAN backend engine.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { TelemetryEvent } from '@/types/telemetry';
import { classifyEvent } from './alert-rules';
import { isDuplicateEvent } from './deduplication';
import { calculateSafetyScore } from '@/lib/safety/scoring';

// =============================================================================
// Types
// =============================================================================

/** Result of processing a single telemetry event */
export interface EventProcessingResult {
  eventId: string;
  status: 'ingested' | 'duplicate' | 'error';
  alertCreated: boolean;
  error?: string;
}

/** Result of processing a batch of telemetry events */
export interface BatchProcessingResult {
  eventsIngested: number;
  eventsDuplicated: number;
  eventsErrored: number;
  alertsCreated: number;
  results: EventProcessingResult[];
}

// =============================================================================
// Main Pipeline
// =============================================================================

/**
 * Processes a batch of validated telemetry events through the full pipeline.
 *
 * Each event is processed sequentially to maintain ordering guarantees
 * (especially important for DEVICE_OFFLINE → DEVICE_RECOVERED sequences).
 */
export async function processTelemetryBatch(
  events: TelemetryEvent[],
  client: SupabaseClient<Database>
): Promise<BatchProcessingResult> {
  const results: EventProcessingResult[] = [];
  let alertsCreated = 0;

  for (const event of events) {
    const result = await processSingleEvent(event, client);
    if (result.alertCreated) alertsCreated++;
    results.push(result);
  }

  return {
    eventsIngested: results.filter(r => r.status === 'ingested').length,
    eventsDuplicated: results.filter(r => r.status === 'duplicate').length,
    eventsErrored: results.filter(r => r.status === 'error').length,
    alertsCreated,
    results,
  };
}

/**
 * Process a single telemetry event through the full pipeline.
 */
async function processSingleEvent(
  event: TelemetryEvent,
  client: SupabaseClient<Database>
): Promise<EventProcessingResult> {
  try {
    // Step 1: Deduplication check
    const isDuplicate = await isDuplicateEvent(client, event.id);
    if (isDuplicate) {
      return { eventId: event.id, status: 'duplicate', alertCreated: false };
    }

    // Step 2: Insert telemetry event
    await insertTelemetryEvent(event, client);

    // Step 3: Update vehicle current state
    await updateVehicleState(event, client);

    // Step 4: Update device status
    await updateDeviceStatus(event, client);

    // Step 5: Generate alert if needed
    const alertCreated = await generateAlertIfNeeded(event, client);

    // Step 6: Recalculate safety score
    await recalculateSafetyScore(event.vehicleId, client);

    return { eventId: event.id, status: 'ingested', alertCreated };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[processor] Error processing event ${event.id}:`, message);
    return { eventId: event.id, status: 'error', alertCreated: false, error: message };
  }
}

// =============================================================================
// Pipeline Steps
// =============================================================================

/**
 * Step 2: Insert a telemetry event into the database.
 *
 * Maps camelCase domain fields to snake_case database columns.
 */
async function insertTelemetryEvent(
  event: TelemetryEvent,
  client: SupabaseClient<Database>
): Promise<void> {
  const { error } = await client.from('telemetry').insert({
    id: event.id,
    device_id: event.deviceId,
    vehicle_id: event.vehicleId,
    timestamp: event.timestamp,
    latitude: event.latitude,
    longitude: event.longitude,
    speed: event.speed,
    g_force: event.gForce,
    drowsiness_score: event.drowsinessScore,
    eye_aspect_ratio: event.eyeAspectRatio,
    event_type: event.eventType,
    network_status: event.networkStatus,
  });

  if (error) {
    throw new Error(`Failed to insert telemetry: ${error.message}`);
  }
}

/**
 * Step 3: Update the vehicle's current state from the telemetry event.
 *
 * Updates: latitude, longitude, status, last_seen.
 * Sets vehicle status to ACTIVE if it was IDLE/OFFLINE.
 */
async function updateVehicleState(
  event: TelemetryEvent,
  client: SupabaseClient<Database>
): Promise<void> {
  // Determine vehicle status based on event type
  let vehicleStatus: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE' = 'ACTIVE';

  if (event.eventType === 'DEVICE_OFFLINE') {
    vehicleStatus = 'OFFLINE';
  }

  const { error } = await client
    .from('vehicles')
    .update({
      latitude: event.latitude,
      longitude: event.longitude,
      status: vehicleStatus,
      last_seen: event.timestamp,
    })
    .eq('id', event.vehicleId);

  if (error) {
    console.error(`[processor] Failed to update vehicle state: ${error.message}`);
  }
}

/**
 * Step 4: Update the device connectivity status and last_seen.
 */
async function updateDeviceStatus(
  event: TelemetryEvent,
  client: SupabaseClient<Database>
): Promise<void> {
  const connectivityStatus = event.networkStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE';

  const { error } = await client
    .from('devices')
    .update({
      connectivity_status: connectivityStatus,
      last_seen: event.timestamp,
    })
    .eq('id', event.deviceId);

  if (error) {
    console.error(`[processor] Failed to update device status: ${error.message}`);
  }
}

/**
 * Step 5: Generate a safety alert if the event warrants one.
 *
 * Uses the alert classification rules to determine severity and type.
 * Looks up the driver_id from the vehicle for the alert record.
 *
 * @returns true if an alert was created.
 */
async function generateAlertIfNeeded(
  event: TelemetryEvent,
  client: SupabaseClient<Database>
): Promise<boolean> {
  const classification = classifyEvent(event);
  if (!classification) return false;

  // Look up the driver assigned to this vehicle
  const { data: vehicle } = await client
    .from('vehicles')
    .select('driver_id')
    .eq('id', event.vehicleId)
    .single();

  const { error } = await client.from('alerts').insert({
    vehicle_id: event.vehicleId,
    driver_id: vehicle?.driver_id ?? null,
    type: classification.type,
    severity: classification.severity,
    timestamp: event.timestamp,
    latitude: event.latitude,
    longitude: event.longitude,
    message: classification.message,
    acknowledged: false,
  });

  if (error) {
    console.error(`[processor] Failed to create alert: ${error.message}`);
    return false;
  }

  return true;
}

/**
 * Step 6: Recalculate and update the vehicle's safety score.
 */
async function recalculateSafetyScore(
  vehicleId: string,
  client: SupabaseClient<Database>
): Promise<void> {
  const score = await calculateSafetyScore(client, vehicleId);

  const { error } = await client
    .from('vehicles')
    .update({ safety_score: score })
    .eq('id', vehicleId);

  if (error) {
    console.error(`[processor] Failed to update safety score: ${error.message}`);
  }
}
