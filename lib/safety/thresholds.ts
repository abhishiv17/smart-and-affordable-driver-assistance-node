// =============================================================================
// Safety Thresholds — Configuration
// =============================================================================
// Defines the thresholds that determine when telemetry values trigger
// safety alerts. These values are calibrated for commercial vehicles
// in Indian road conditions.
// =============================================================================

/**
 * Drowsiness detection thresholds.
 * Source: NoIR camera + eye aspect ratio (EAR) analysis.
 */
export const DROWSINESS_THRESHOLDS = {
  /** Drowsiness score above this triggers a WARNING */
  WARNING: 0.5,
  /** Drowsiness score above this triggers a CRITICAL alert */
  CRITICAL: 0.75,
  /** Eye aspect ratio below this suggests closed eyes */
  EYE_CLOSED: 0.2,
} as const;

/**
 * G-force thresholds for harsh driving detection.
 * Source: 6-axis IMU.
 */
export const G_FORCE_THRESHOLDS = {
  /** G-force above this for braking triggers HARSH_BRAKING */
  HARSH_BRAKING: 0.5,
  /** G-force above this for acceleration triggers HARSH_ACCELERATION */
  HARSH_ACCELERATION: 0.45,
  /** G-force above this is considered a potential collision */
  COLLISION: 2.0,
} as const;

/**
 * Speed thresholds for commercial vehicles (km/h).
 */
export const SPEED_THRESHOLDS = {
  /** Speed limit for urban areas */
  URBAN_LIMIT: 50,
  /** Speed limit for highways */
  HIGHWAY_LIMIT: 80,
  /** Speed above this is always considered dangerous */
  ABSOLUTE_MAX: 100,
} as const;

/**
 * Device health thresholds.
 */
export const DEVICE_THRESHOLDS = {
  /** Seconds without heartbeat before marking device OFFLINE */
  HEARTBEAT_TIMEOUT_SECONDS: 60,
  /** Battery percentage below which to warn */
  LOW_BATTERY: 20,
} as const;
