// =============================================================================
// Device Domain Types
// =============================================================================

/**
 * Status of a DriverGuard edge device.
 */
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'ERROR' | 'PROVISIONING';

/**
 * Network connectivity state of the edge device.
 */
export type NetworkStatus = 'ONLINE' | 'OFFLINE';

/**
 * Represents a DriverGuard edge device (ARM-based processor with
 * NoIR camera, 6-axis IMU, GPS, cellular modem, and safety buzzer).
 *
 * In the MVP, the Device Simulator produces telemetry that mimics
 * the physical device. The platform is designed so that the physical
 * device can replace the simulator without architectural changes.
 */
export interface Device {
  id: string;
  /** The vehicle this device is installed in */
  vehicleId: string;
  /** Firmware version string (semver) */
  firmwareVersion: string;
  status: DeviceStatus;
  networkStatus: NetworkStatus;
  /** Whether this device is a simulator instance */
  isSimulated: boolean;
  /** Last time the device sent a heartbeat */
  lastHeartbeat: string | null; // ISO 8601
  /** Last known battery level percentage (0–100), if applicable */
  batteryLevel: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
