'use client';

// =============================================================================
// SADAN Recommends — AI-Derived Recommendation with Simulator CTA
// =============================================================================

import Link from 'next/link';
import type { DbVehicle } from '@/types/database';
import { classifyVehicleRisk } from '@/lib/safety/risk-classification';

interface SadanRecommendsProps {
  vehicles: DbVehicle[];
  /** Optional AI report recommendations (from ai_reports table) */
  aiRecommendation?: string | null;
}

/** Maps alert/risk types to actionable recommendations */
const RECOMMENDATION_MAP: Record<string, { title: string; description: string; metric: string }> = {
  CRITICAL: {
    title: 'IMMEDIATE SAFETY REVIEW',
    description: 'has a critically low safety score. Recommend immediate driver review and vehicle inspection.',
    metric: 'risk reduction',
  },
  HIGH: {
    title: 'SCHEDULE MAINTENANCE CHECK',
    description: 'is showing elevated risk patterns. Schedule a preventive inspection to avoid further degradation.',
    metric: 'safety improvement',
  },
  ELEVATED: {
    title: 'MONITOR DRIVING PATTERNS',
    description: 'has declining safety metrics. Consider driver coaching or route optimization.',
    metric: 'efficiency gain',
  },
};

/**
 * SADAN Recommends — algorithmically derived from fleet data.
 * Identifies the worst-performing vehicle and generates an actionable recommendation.
 * CTA links to the Simulator.
 */
export function SadanRecommends({ vehicles, aiRecommendation }: SadanRecommendsProps) {
  if (vehicles.length === 0) {
    return (
      <div className="sadan-section">
        <p className="sadan-label mb-4">SADAN Recommends</p>
        <p className="text-sm text-muted-foreground">
          Collecting fleet data to generate recommendations.
        </p>
      </div>
    );
  }

  // Find the worst-performing vehicle
  const worstVehicle = [...vehicles].sort(
    (a, b) => (a.safety_score ?? 100) - (b.safety_score ?? 100)
  )[0];
  const worstScore = worstVehicle.safety_score ?? 100;
  const worstRisk = classifyVehicleRisk(worstScore);

  // Compute potential improvement
  const avgScore =
    vehicles.reduce((sum, v) => sum + (v.safety_score ?? 100), 0) / vehicles.length;
  const potentialImprovement = Math.max(
    1,
    Math.round(((avgScore - worstScore) / avgScore) * 15)
  );

  // Get recommendation based on risk level
  const rec =
    RECOMMENDATION_MAP[worstRisk.level] ?? RECOMMENDATION_MAP.ELEVATED;

  // If all vehicles are healthy, show a positive recommendation
  if (worstScore >= 80) {
    return (
      <div className="sadan-section">
        <p className="sadan-label mb-4">SADAN Recommends</p>

        <div className="relative pl-4" style={{ borderLeft: '3px solid var(--color-sadan-success)' }}>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground mb-2">
            MAINTAIN CURRENT OPERATIONS
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All vehicles are performing within safe parameters. Continue current
            driver practices and maintenance schedules.
          </p>
          <p className="mt-3">
            <span className="sadan-metric text-lg" style={{ color: 'var(--color-sadan-success)' }}>
              {Math.round(avgScore)}
            </span>
            <span className="text-xs text-muted-foreground ml-2">avg fleet score</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sadan-section">
      <p className="sadan-label mb-4">SADAN Recommends</p>

      <div className="relative pl-4" style={{ borderLeft: '3px solid var(--color-bauhaus-red)' }}>
        {/* Recommendation number */}
        <span className="sadan-metric text-lg text-foreground">01</span>

        {/* Title */}
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground mt-2 mb-2">
          {rec.title}
        </p>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-mono font-semibold text-foreground">
            {worstVehicle.vehicle_number}
          </span>{' '}
          {aiRecommendation ?? rec.description}
        </p>

        {/* Improvement metric */}
        <p className="mt-3">
          <span
            className="sadan-metric text-lg"
            style={{ color: 'var(--color-sadan-success)' }}
          >
            +{potentialImprovement}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            estimated {rec.metric}
          </span>
        </p>

        {/* CTA */}
        <Link
          href="/simulator"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Simulate →
        </Link>
      </div>
    </div>
  );
}
