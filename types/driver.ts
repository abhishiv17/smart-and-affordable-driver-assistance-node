// =============================================================================
// Driver Domain Types
// =============================================================================

/**
 * Status of a driver in the fleet.
 */
export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_TRIP';

/**
 * Represents a commercial vehicle driver in a logistics fleet.
 */
export interface Driver {
  id: string;
  fleetId: string;
  firstName: string;
  lastName: string;
  /** Full name for display purposes */
  fullName: string;
  licenseNumber: string;
  phoneNumber: string;
  status: DriverStatus;
  /** Current safety score (0–100) */
  safetyScore: number;
  /** Total number of trips completed */
  totalTrips: number;
  /** Total distance driven in km */
  totalDistanceKm: number;
  /** Currently assigned vehicle, if any */
  currentVehicleId: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Lightweight driver representation for list views.
 */
export interface DriverSummary {
  id: string;
  fullName: string;
  status: DriverStatus;
  safetyScore: number;
  totalTrips: number;
  currentVehicleId: string | null;
}
