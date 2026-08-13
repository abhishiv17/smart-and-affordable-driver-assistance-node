// =============================================================================
// Application Constants
// =============================================================================

/**
 * Safety state visual representation.
 * Used for consistent color-coding across the entire application.
 */
export const SAFETY_STATES = {
  NORMAL: {
    label: 'Normal',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    dotColor: 'bg-emerald-500',
  },
  WARNING: {
    label: 'Warning',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    dotColor: 'bg-amber-500',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    dotColor: 'bg-red-500',
  },
  OFFLINE: {
    label: 'Offline',
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/20',
    dotColor: 'bg-zinc-500',
  },
} as const;

export type SafetyState = keyof typeof SAFETY_STATES;

/**
 * Application-wide pagination defaults.
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Map defaults for MapLibre GL.
 */
export const MAP_DEFAULTS = {
  /** Center of India — default map center */
  CENTER: { lat: 20.5937, lng: 78.9629 },
  /** Default zoom level */
  ZOOM: 5,
  /** Zoom level for individual vehicle view */
  VEHICLE_ZOOM: 14,
} as const;
