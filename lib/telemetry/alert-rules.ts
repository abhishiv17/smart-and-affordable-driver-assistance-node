// =============================================================================
// Alert Rules — Telemetry Event → Alert Classification
// =============================================================================
// Defines the rules that determine when a telemetry event should generate
// a safety alert, and what severity that alert should have.
//
// These thresholds should match the values documented in
// docs/telemetry-protocol.md for consistency.
// =============================================================================

import type { TelemetryEvent } from '@/types/telemetry';
import type { AlertSeverity, AlertType } from '@/types/alert';

/**
 * Result of alert classification for a telemetry event.
 * `null` means no alert should be generated.
 */
export interface AlertClassification {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
}

// =============================================================================
// Thresholds
// =============================================================================

/** Drowsiness score thresholds */
const DROWSINESS_CRITICAL = 0.7;
const DROWSINESS_WARNING = 0.5;

/** G-force thresholds for harsh driving */
const HARSH_DRIVING_CRITICAL = 0.8;
const HARSH_DRIVING_WARNING = 0.5;

// =============================================================================
// Classification Logic
// =============================================================================

/**
 * Classify a telemetry event and determine if it should generate an alert.
 *
 * @returns AlertClassification if an alert should be created, null otherwise.
 */
export function classifyEvent(event: TelemetryEvent): AlertClassification | null {
  switch (event.eventType) {
    case 'DROWSINESS':
      return classifyDrowsiness(event);

    case 'HARSH_BRAKING':
      return classifyHarshBraking(event);

    case 'HARSH_ACCELERATION':
      return classifyHarshAcceleration(event);

    case 'DEVICE_OFFLINE':
      return {
        type: 'DEVICE_OFFLINE',
        severity: 'INFO',
        message: `Device went offline on vehicle ${event.vehicleId}`,
      };

    case 'DEVICE_RECOVERED':
      return {
        type: 'DEVICE_RECOVERED',
        severity: 'INFO',
        message: `Device recovered connectivity on vehicle ${event.vehicleId}`,
      };

    case 'NORMAL':
    default:
      return null;
  }
}

/**
 * Classify a drowsiness event by score severity.
 */
function classifyDrowsiness(event: TelemetryEvent): AlertClassification {
  const severity: AlertSeverity =
    event.drowsinessScore >= DROWSINESS_CRITICAL ? 'CRITICAL' : 'WARNING';

  return {
    type: 'DROWSINESS',
    severity,
    message: `Drowsiness detected. Score: ${event.drowsinessScore.toFixed(2)}, EAR: ${event.eyeAspectRatio.toFixed(2)}`,
  };
}

/**
 * Classify a harsh braking event by g-force severity.
 */
function classifyHarshBraking(event: TelemetryEvent): AlertClassification {
  const severity: AlertSeverity =
    event.gForce >= HARSH_DRIVING_CRITICAL ? 'CRITICAL' : 'WARNING';

  return {
    type: 'HARSH_BRAKING',
    severity,
    message: `Harsh braking detected. G-force: ${event.gForce.toFixed(2)}g at ${event.speed.toFixed(0)} km/h`,
  };
}

/**
 * Classify a harsh acceleration event by g-force severity.
 */
function classifyHarshAcceleration(event: TelemetryEvent): AlertClassification {
  const severity: AlertSeverity =
    event.gForce >= HARSH_DRIVING_CRITICAL ? 'CRITICAL' : 'WARNING';

  return {
    type: 'HARSH_ACCELERATION',
    severity,
    message: `Harsh acceleration detected. G-force: ${event.gForce.toFixed(2)}g at ${event.speed.toFixed(0)} km/h`,
  };
}

// =============================================================================
// Exports for Testing
// =============================================================================
export const THRESHOLDS = {
  DROWSINESS_CRITICAL,
  DROWSINESS_WARNING,
  HARSH_DRIVING_CRITICAL,
  HARSH_DRIVING_WARNING,
} as const;
