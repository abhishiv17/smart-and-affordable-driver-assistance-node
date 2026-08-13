// =============================================================================
// Safety Alert Domain Types
// =============================================================================

/**
 * Severity levels for safety alerts.
 */
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Types of safety alerts the platform can generate.
 */
export type AlertType =
  | 'DROWSINESS_DETECTED'
  | 'HARSH_BRAKING'
  | 'HARSH_ACCELERATION'
  | 'SPEEDING'
  | 'DEVICE_OFFLINE'
  | 'LOW_SAFETY_SCORE';

/**
 * Status of a safety alert.
 */
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

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
  status: AlertStatus;
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
  /** ISO 8601 timestamp when the alert was resolved */
  resolvedAt: string | null;
}
