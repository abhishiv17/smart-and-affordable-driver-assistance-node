// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Format a number as a safety score with appropriate precision.
 */
export function formatSafetyScore(score: number): string {
  return Math.round(score).toString();
}

/**
 * Format speed in km/h.
 */
export function formatSpeed(speedKmh: number): string {
  return `${Math.round(speedKmh)} km/h`;
}

/**
 * Format distance in km.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
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
 * Format coordinates for display.
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
