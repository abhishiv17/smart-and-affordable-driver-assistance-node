'use client';

// =============================================================================
// Fleet Health Bars — Ranked Horizontal Vehicle Health Visualization
// =============================================================================

import Link from 'next/link';
import { classifyVehicleRisk, sortByRisk } from '@/lib/safety/risk-classification';
import type { DbVehicle } from '@/types/database';

interface FleetHealthBarsProps {
  vehicles: DbVehicle[];
}

const RISK_COLORS: Record<string, string> = {
  NORMAL: 'var(--color-sadan-success)',
  ELEVATED: 'var(--color-sadan-warning)',
  HIGH: 'var(--color-bauhaus-red)',
  CRITICAL: 'var(--color-sadan-critical)',
};

/**
 * Horizontal bar chart ranking all vehicles by safety score.
 * Worst-first ordering. Color coded by risk band.
 */
export function FleetHealthBars({ vehicles }: FleetHealthBarsProps) {
  const sorted = sortByRisk(vehicles);

  return (
    <div className="sadan-section">
      <p className="sadan-label mb-4">Fleet Performance</p>

      <div className="space-y-1.5">
        {sorted.map((vehicle) => {
          const risk = classifyVehicleRisk(vehicle.safety_score);
          const score = vehicle.safety_score ?? 100;
          const barColor = RISK_COLORS[risk.level] ?? 'var(--border)';

          return (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}`}
              className="group flex items-center gap-3 py-1.5 hover:bg-muted/30 transition-colors px-1 -mx-1"
            >
              {/* Vehicle number */}
              <span className="font-mono text-xs font-semibold w-14 shrink-0">
                {vehicle.vehicle_number}
              </span>

              {/* Score */}
              <span
                className="font-mono text-xs font-bold w-8 text-right shrink-0"
                style={{ color: barColor }}
              >
                {Math.round(score)}
              </span>

              {/* Bar */}
              <div className="flex-1 h-3 bg-border/40 relative overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${score}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>

              {/* Risk label */}
              <span
                className="text-[9px] font-bold uppercase tracking-wider w-16 text-right shrink-0"
                style={{ color: barColor }}
              >
                {risk.label}
              </span>

              {/* Hover action */}
              <span className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider shrink-0">
                View →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
