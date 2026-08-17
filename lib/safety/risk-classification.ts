// =============================================================================
// Risk Classification — Vehicle Risk State System
// =============================================================================
// Classifies vehicles into 4 distinct risk levels based on safety score:
//   Normal 🟢  (≥ 80)  — Safe operations
//   Elevated 🟡  (60–79) — Requires monitoring
//   High 🟠  (40–59) — Needs intervention
//   Critical 🔴  (< 40)  — Immediate action required
//
// These risk levels provide the visual hierarchy for the Safety Command Center.
// =============================================================================

// =============================================================================
// Types
// =============================================================================

export type RiskLevel = 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface RiskClassification {
  /** Risk level enum */
  level: RiskLevel;
  /** Human-readable label */
  label: string;
  /** Emoji indicator */
  emoji: string;
  /** Tailwind text color class */
  color: string;
  /** Tailwind background color class (subtle) */
  bgColor: string;
  /** Tailwind border color class */
  borderColor: string;
  /** CSS color value for charts/non-Tailwind contexts */
  cssColor: string;
}

// =============================================================================
// Risk Level Definitions
// =============================================================================

const RISK_DEFINITIONS: Record<RiskLevel, RiskClassification> = {
  NORMAL: {
    level: 'NORMAL',
    label: 'Normal',
    emoji: '🟢',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    cssColor: '#34d399',
  },
  ELEVATED: {
    level: 'ELEVATED',
    label: 'Elevated',
    emoji: '🟡',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/40',
    cssColor: '#fbbf24',
  },
  HIGH: {
    level: 'HIGH',
    label: 'High',
    emoji: '🟠',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/40',
    cssColor: '#fb923c',
  },
  CRITICAL: {
    level: 'CRITICAL',
    label: 'Critical',
    emoji: '🔴',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/40',
    cssColor: '#f87171',
  },
};

// =============================================================================
// Classification Functions
// =============================================================================

/**
 * Classify a vehicle's risk level based on its safety score.
 *
 * @param score - Safety score (0–100), null defaults to 100 (unknown = safe)
 * @returns RiskClassification with level, label, and color information
 */
export function classifyVehicleRisk(score: number | null): RiskClassification {
  const s = score ?? 100;
  if (s >= 80) return RISK_DEFINITIONS.NORMAL;
  if (s >= 60) return RISK_DEFINITIONS.ELEVATED;
  if (s >= 40) return RISK_DEFINITIONS.HIGH;
  return RISK_DEFINITIONS.CRITICAL;
}

/**
 * Get the risk classification definition for a given risk level.
 */
export function getRiskDefinition(level: RiskLevel): RiskClassification {
  return RISK_DEFINITIONS[level];
}

// =============================================================================
// Fleet Summary
// =============================================================================

export interface FleetRiskSummary {
  /** Count of vehicles at each risk level */
  counts: Record<RiskLevel, number>;
  /** Total vehicles */
  total: number;
  /** Overall fleet risk level (worst vehicle determines) */
  worstLevel: RiskLevel;
}

/**
 * Compute a fleet-wide risk summary from an array of vehicles.
 *
 * @param vehicles - Array with safety_score property
 * @returns Counts per risk level, total, and worst risk level
 */
export function getFleetRiskSummary(
  vehicles: { safety_score: number | null }[]
): FleetRiskSummary {
  const counts: Record<RiskLevel, number> = {
    NORMAL: 0,
    ELEVATED: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  for (const v of vehicles) {
    const risk = classifyVehicleRisk(v.safety_score);
    counts[risk.level]++;
  }

  // Determine worst level present in fleet
  let worstLevel: RiskLevel = 'NORMAL';
  if (counts.ELEVATED > 0) worstLevel = 'ELEVATED';
  if (counts.HIGH > 0) worstLevel = 'HIGH';
  if (counts.CRITICAL > 0) worstLevel = 'CRITICAL';

  return {
    counts,
    total: vehicles.length,
    worstLevel,
  };
}

/**
 * Sort vehicles by risk (Critical first, Normal last).
 * Within the same risk level, lower score sorts first.
 */
export function sortByRisk<T extends { safety_score: number | null }>(
  vehicles: T[]
): T[] {
  const riskOrder: Record<RiskLevel, number> = {
    CRITICAL: 0,
    HIGH: 1,
    ELEVATED: 2,
    NORMAL: 3,
  };

  return [...vehicles].sort((a, b) => {
    const riskA = classifyVehicleRisk(a.safety_score);
    const riskB = classifyVehicleRisk(b.safety_score);
    const orderDiff = riskOrder[riskA.level] - riskOrder[riskB.level];
    if (orderDiff !== 0) return orderDiff;
    // Within same risk level, lower score first
    return (a.safety_score ?? 100) - (b.safety_score ?? 100);
  });
}

// Export all definitions for use in components
export { RISK_DEFINITIONS };
