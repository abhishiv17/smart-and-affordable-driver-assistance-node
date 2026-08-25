'use client';

// =============================================================================
// Business Health Gauge — SVG Arc + Sub-Score Breakdown
// =============================================================================
// Composite business health score derived from:
//   Safety (40%) — avg vehicle safety_score
//   Fleet (30%)  — % of vehicles active
//   Devices (30%) — % of devices online
// =============================================================================

import { useEffect, useState } from 'react';

interface SubScore {
  label: string;
  value: number;
  color: string;
}

interface BusinessHealthGaugeProps {
  /** Overall composite score (0–100) */
  score: number;
  /** Sub-score breakdown */
  subScores: SubScore[];
}

/**
 * Semi-circular arc gauge with animated fill and sub-score bars.
 */
export function BusinessHealthGauge({ score, subScores }: BusinessHealthGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const healthLabel =
    score >= 80 ? 'GOOD' : score >= 60 ? 'FAIR' : score >= 40 ? 'POOR' : 'CRITICAL';
  const healthColor =
    score >= 80
      ? 'var(--color-sadan-success)'
      : score >= 60
        ? 'var(--color-sadan-warning)'
        : 'var(--color-sadan-critical)';

  // SVG arc calculations (180° semi-circle)
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2 + 10;

  // Arc from 180° to 0° (left to right, bottom semi-circle inverted to top)
  const startAngle = Math.PI; // left
  const endAngle = 0; // right
  const sweepAngle = (animatedScore / 100) * Math.PI;

  const arcStartX = centerX + radius * Math.cos(startAngle);
  const arcStartY = centerY - radius * Math.sin(startAngle);
  const arcEndX = centerX + radius * Math.cos(startAngle - sweepAngle);
  const arcEndY = centerY - radius * Math.sin(startAngle - sweepAngle);

  const bgArcEndX = centerX + radius * Math.cos(endAngle);
  const bgArcEndY = centerY - radius * Math.sin(endAngle);

  const largeArcFlag = sweepAngle > Math.PI ? 1 : 0;

  const bgPath = `M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 1 1 ${bgArcEndX} ${bgArcEndY}`;
  const fgPath =
    animatedScore > 0
      ? `M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}`
      : '';

  return (
    <div className="sadan-section">
      <p className="sadan-label mb-4">Business Health</p>

      <div className="flex flex-col items-center">
        {/* Gauge */}
        <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
          <svg
            width={size}
            height={size / 2 + 30}
            viewBox={`0 0 ${size} ${size / 2 + 30}`}
            className="overflow-visible"
          >
            {/* Background arc */}
            <path
              d={bgPath}
              fill="none"
              stroke="var(--border)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Foreground arc */}
            {fgPath && (
              <path
                d={fgPath}
                fill="none"
                stroke={healthColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
          </svg>

          {/* Score text overlaid on gauge */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-end"
            style={{ paddingBottom: 4 }}
          >
            <span
              className="sadan-metric text-5xl sadan-animate-in"
              style={{ color: healthColor }}
            >
              {score}
            </span>
            <span
              className="text-xs font-bold uppercase tracking-[0.15em] mt-1"
              style={{ color: healthColor }}
            >
              {healthLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-score breakdown */}
      {subScores.length > 0 && (
        <div className="mt-5 space-y-2.5">
          {subScores.map((sub) => (
            <div key={sub.label} className="flex items-center gap-3">
              <span className="sadan-label w-20 text-right shrink-0 text-[10px]">
                {sub.label}
              </span>
              <div className="flex-1 h-1.5 bg-border rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-1000 ease-out"
                  style={{
                    width: `${sub.value}%`,
                    backgroundColor: sub.color,
                  }}
                />
              </div>
              <span className="font-mono text-xs font-semibold w-8 text-right">
                {Math.round(sub.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
