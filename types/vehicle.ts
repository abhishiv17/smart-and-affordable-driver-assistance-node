// =============================================================================
// Vehicle Domain Types
// =============================================================================

/**
 * Status of a vehicle in the fleet.
 */
export type VehicleStatus = 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE';

/**
 * Represents a commercial vehicle in a logistics fleet.
 * Each vehicle may have one SADAN device attached.
 */
export interface Vehicle {
  id: string;
  fleetId: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
  /** The SADAN device currently attached to this vehicle, if any */
  deviceId: string | null;
  /** Currently assigned driver, if any */
  currentDriverId: string | null;
  status: VehicleStatus;
  /** Latest known latitude */
  lastLatitude: number | null;
  /** Latest known longitude */
  lastLongitude: number | null;
  /** Latest known speed in km/h */
  lastSpeed: number | null;
  /** Current safety score (0–100) */
  safetyScore: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Lightweight vehicle representation for list views.
 */
export interface VehicleSummary {
  id: string;
  vehicleNumber: string;
  make: string;
  model: string;
  status: VehicleStatus;
  safetyScore: number;
  currentDriverId: string | null;
  lastSpeed: number | null;
}
