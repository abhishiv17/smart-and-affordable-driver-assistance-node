// =============================================================================
// Trip Domain Types
// =============================================================================

/**
 * Status of a trip.
 */
export type TripStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Represents a single trip made by a driver in a vehicle.
 * Trips are reconstructed from telemetry data and provide
 * aggregated safety and performance metrics.
 */
export interface Trip {
  id: string;
  fleetId: string;
  vehicleId: string;
  driverId: string;
  status: TripStatus;
  /** ISO 8601 timestamp when the trip started */
  startTime: string;
  /** ISO 8601 timestamp when the trip ended, null if in progress */
  endTime: string | null;
  /** Start location */
  startLatitude: number;
  startLongitude: number;
  /** End location, null if in progress */
  endLatitude: number | null;
  endLongitude: number | null;
  /** Total distance traveled in km */
  distanceKm: number;
  /** Average speed during the trip in km/h */
  averageSpeedKmh: number;
  /** Maximum speed recorded during the trip in km/h */
  maxSpeedKmh: number;
  /** Trip safety score (0–100) */
  safetyScore: number;
  /** Number of safety events during this trip */
  alertCount: number;
  /** Number of harsh braking events */
  harshBrakingCount: number;
  /** Number of harsh acceleration events */
  harshAccelerationCount: number;
  /** Number of drowsiness events */
  drowsinessEventCount: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
