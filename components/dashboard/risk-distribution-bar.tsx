'use client';

// =============================================================================
// RiskDistributionBar — Fleet Risk Level Visualization
// =============================================================================
// Horizontal segmented bar showing the distribution of vehicles across
// risk levels. Provides instant visual summary of fleet health.
// =============================================================================

import { cn } from '@/lib/utils';
import {
  RISK_DEFINITIONS,
  type RiskLevel,
  type FleetRiskSummary,
} from '@/lib/safety/risk-classification';

// =============================================================================
// Types
// =============================================================================

interface RiskDistributionBarProps {
  /** Fleet risk summary with counts per level */
  summary: FleetRiskSummary;
  /** Bar height */
  height?: number;
  /** Show count labels */
  showLabels?: boolean;
  /** Additional class */
  className?: string;
}

// =============================================================================
// Segment Colors (CSS values for inline styles)
// =============================================================================

const SEGMENT_COLORS: Record<RiskLevel, string> = {
  NORMAL: '#34d399',
  ELEVATED: '#fbbf24',
  HIGH: '#fb923c',
  CRITICAL: '#f87171',
};

const SEGMENT_ORDER: RiskLevel[] = ['NORMAL', 'ELEVATED', 'HIGH', 'CRITICAL'];

// =============================================================================
// Component
// =============================================================================

/**
 * Horizontal segmented bar showing vehicle distribution across risk levels.
 * Each segment is proportionally sized and color-coded.
 */
export function RiskDistributionBar({
  summary,
  height = 8,
  showLabels = true,
  className,
}: RiskDistributionBarProps) {
  const { counts, total } = summary;

  if (total === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Bar */}
      <div
        className="flex w-full overflow-hidden rounded-full bg-muted/30"
        style={{ height }}
      >
        {SEGMENT_ORDER.map((level) => {
          const count = counts[level];
          if (count === 0) return null;
          const percentage = (count / total) * 100;

          return (
            <div
              key={level}
              className="transition-all duration-700 ease-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: SEGMENT_COLORS[level],
                minWidth: count > 0 ? '4px' : '0px',
              }}
              title={`${RISK_DEFINITIONS[level].label}: ${count} vehicle${count !== 1 ? 's' : ''}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {SEGMENT_ORDER.map((level) => {
            const count = counts[level];
            if (count === 0) return null;
            const def = RISK_DEFINITIONS[level];

            return (
              <div key={level} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: SEGMENT_COLORS[level] }}
                />
                <span className="text-[11px] text-muted-foreground">
                  {count} {def.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
