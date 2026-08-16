// =============================================================================
// Safety Alert Domain Types
// =============================================================================

/**
 * Severity levels for safety alerts.
 */
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

/**
 * Types of safety alerts the platform can generate.
 */
export type AlertType =
  | 'DROWSINESS'
  | 'HARSH_BRAKING'
  | 'HARSH_ACCELERATION'
  | 'DEVICE_OFFLINE'
  | 'DEVICE_RECOVERED';

/**
 * Represents a safety alert generated from telemetry analysis.
 */
export interface SafetyAlert {
  id: string;
  /** Fleet this alert belongs to */
  fleetId: string;
  /** Vehicle that triggered the alert */
  vehicleId: string;
  /** Driver operating the vehicle at the time, if known */
  driverId: string | null;
  /** The telemetry event that triggered this alert, if applicable */
  telemetryEventId: string | null;
  type: AlertType;
  severity: AlertSeverity;
  /** Whether the alert has been acknowledged by an operator */
  acknowledged: boolean;
  /** Human-readable alert title */
  title: string;
  /** Human-readable alert description */
  description: string;
  /** Location where the alert was triggered */
  latitude: number | null;
  longitude: number | null;
  /** ISO 8601 timestamp when the alert was created */
  createdAt: string;
  /** ISO 8601 timestamp when the alert was acknowledged */
  acknowledgedAt: string | null;
}
