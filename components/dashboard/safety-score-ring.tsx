'use client';

import { cn } from '@/lib/utils';
import { getSafetyBand } from '@/lib/safety/scoring';

interface SafetyScoreRingProps {
  /** Safety score (0–100) */
  score: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show numeric label inside */
  showLabel?: boolean;
  /** Additional class */
  className?: string;
}

/**
 * Circular progress ring displaying a safety score (0–100).
 * Color changes based on safety band: excellent (green), good (cyan),
 * fair (amber), poor (orange), critical (red).
 */
export function SafetyScoreRing({
  score,
  size = 64,
  strokeWidth = 5,
  showLabel = true,
  className,
}: SafetyScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const progress = (clampedScore / 100) * circumference;
  const band = getSafetyBand(clampedScore);

  const colorMap: Record<string, string> = {
    Excellent: 'stroke-[oklch(0.75_0.18_155)]',
    Good: 'stroke-[oklch(0.72_0.12_200)]',
    Fair: 'stroke-[oklch(0.80_0.16_85)]',
    Poor: 'stroke-[oklch(0.75_0.18_55)]',
    Critical: 'stroke-[oklch(0.63_0.24_25)]',
  };

  const textColorMap: Record<string, string> = {
    Excellent: 'text-[oklch(0.75_0.18_155)]',
    Good: 'text-[oklch(0.72_0.12_200)]',
    Fair: 'text-[oklch(0.80_0.16_85)]',
    Poor: 'text-[oklch(0.75_0.18_55)]',
    Critical: 'text-[oklch(0.63_0.24_25)]',
  };

  const strokeColor = colorMap[band.label] ?? colorMap.Good;
  const textColor = textColorMap[band.label] ?? textColorMap.Good;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={cn('transition-all duration-700 ease-out', strokeColor)}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-lg font-bold leading-none', textColor)}>
            {Math.round(clampedScore)}
          </span>
        </div>
      )}
    </div>
  );
}
