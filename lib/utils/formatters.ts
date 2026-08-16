// =============================================================================
// Display Formatting Utilities
// =============================================================================
// Consistent formatting for values displayed across the SADAN dashboard.
// =============================================================================

import type { VehicleStatus } from '@/types/vehicle';
import type { DriverStatus } from '@/types/driver';
import type { DeviceStatus } from '@/types/device';
import type { TelemetryEventType } from '@/types/telemetry';
import type { AlertSeverity } from '@/types/alert';

// =============================================================================
// Time Formatting
// =============================================================================

/**
 * Format an ISO timestamp as a relative time string.
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return new Date(isoTimestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format an ISO timestamp to a readable date-time.
 */
export function formatDateTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a duration in minutes to a readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// =============================================================================
// Value Formatting
// =============================================================================

/**
 * Format a safety score (0–100).
 */
export function formatSafetyScore(score: number | null): string {
  if (score === null || score === undefined) return '—';
  return Math.round(score).toString();
}

/**
 * Format speed in km/h.
 */
export function formatSpeed(speed: number | null): string {
  if (speed === null || speed === undefined) return '—';
  return `${Math.round(speed)} km/h`;
}

/**
 * Format distance in km.
 */
export function formatDistance(km: number | null): string {
  if (km === null || km === undefined) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Format g-force value.
 */
export function formatGForce(gForce: number): string {
  return `${gForce.toFixed(2)}g`;
}

/**
 * Format a percentage value.
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format GPS coordinates.
 */
export function formatCoordinates(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return '—';
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}

// =============================================================================
// Label Formatting
// =============================================================================

const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  ACTIVE: 'Active',
  IDLE: 'Idle',
  OFFLINE: 'Offline',
  MAINTENANCE: 'Maintenance',
};

const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  ERROR: 'Error',
  PROVISIONING: 'Provisioning',
};

const EVENT_TYPE_LABELS: Record<TelemetryEventType, string> = {
  NORMAL: 'Normal',
  DROWSINESS: 'Drowsiness Detected',
  HARSH_BRAKING: 'Harsh Braking',
  HARSH_ACCELERATION: 'Harsh Acceleration',
  DEVICE_OFFLINE: 'Device Offline',
  DEVICE_RECOVERED: 'Device Recovered',
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  INFO: 'Info',
  WARNING: 'Warning',
  CRITICAL: 'Critical',
};

export function formatVehicleStatus(status: VehicleStatus): string {
  return VEHICLE_STATUS_LABELS[status] ?? status;
}

export function formatDriverStatus(status: DriverStatus): string {
  return DRIVER_STATUS_LABELS[status] ?? status;
}

export function formatDeviceStatus(status: DeviceStatus): string {
  return DEVICE_STATUS_LABELS[status] ?? status;
}

export function formatEventType(type: TelemetryEventType): string {
  return EVENT_TYPE_LABELS[type] ?? type;
}

export function formatSeverity(severity: AlertSeverity): string {
  return SEVERITY_LABELS[severity] ?? severity;
}
