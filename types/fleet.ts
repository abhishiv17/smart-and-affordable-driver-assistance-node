// =============================================================================
// Fleet Domain Types
// =============================================================================

/**
 * Represents a logistics fleet — the top-level organizational entity.
 * A fleet owns vehicles, employs drivers, and is the scope for safety reports.
 */
export interface Fleet {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  /** Total number of vehicles registered to this fleet */
  vehicleCount: number;
  /** Total number of drivers registered to this fleet */
  driverCount: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Summary statistics for a fleet, used in dashboard overview.
 */
export interface FleetSummary {
  fleetId: string;
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  totalAlerts: number;
  criticalAlerts: number;
  averageSafetyScore: number;
}
