// =============================================================================
// Telemetry Validation — Zod Schemas
// =============================================================================
// Validates telemetry data from the edge device or simulator before
// processing. The same schema is used regardless of the data source.
// =============================================================================

import { z } from 'zod';

/**
 * Valid telemetry event types.
 */
export const telemetryEventTypeSchema = z.enum([
  'NORMAL',
  'DROWSINESS',
  'HARSH_BRAKING',
  'HARSH_ACCELERATION',
  'DEVICE_OFFLINE',
  'DEVICE_RECOVERED',
]);

/**
 * Valid network status values.
 */
export const telemetryNetworkStatusSchema = z.enum(['ONLINE', 'OFFLINE']);

/**
 * Schema for a single telemetry event.
 */
export const telemetryEventSchema = z.object({
  id: z.string().uuid(),
  deviceId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  timestamp: z.string().datetime(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).max(300), // km/h, commercial vehicles
  gForce: z.number().min(0).max(10), // g-force magnitude
  drowsinessScore: z.number().min(0).max(1),
  eyeAspectRatio: z.number().min(0).max(1),
  eventType: telemetryEventTypeSchema,
  networkStatus: telemetryNetworkStatusSchema,
});

/**
 * Schema for a batch telemetry submission.
 */
export const telemetrySubmissionSchema = z.object({
  events: z.array(telemetryEventSchema).min(1).max(100),
  deviceId: z.string().uuid(),
  submittedAt: z.string().datetime(),
});

/**
 * Validates a single telemetry event.
 */
export function validateTelemetryEvent(data: unknown) {
  return telemetryEventSchema.safeParse(data);
}

/**
 * Validates a batch telemetry submission.
 */
export function validateTelemetrySubmission(data: unknown) {
  return telemetrySubmissionSchema.safeParse(data);
}
