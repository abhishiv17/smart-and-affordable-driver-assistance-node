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
  /** Show safety band text below the score */
  showBandLabel?: boolean;
  /** Additional class */
  className?: string;
}

/**
 * Circular progress ring displaying a safety score (0–100).
 * Color changes based on safety band: excellent (green), good (cyan),
 * fair (amber), poor (orange), critical (red).
 *
 * Supports smooth CSS transition animation on mount and value changes.
 */
export function SafetyScoreRing({
  score,
  size = 64,
  strokeWidth = 5,
  showLabel = true,
  showBandLabel = false,
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

  const glowColorMap: Record<string, string> = {
    Excellent: 'oklch(0.75 0.18 155 / 0.3)',
    Good: 'oklch(0.72 0.12 200 / 0.3)',
    Fair: 'oklch(0.80 0.16 85 / 0.3)',
    Poor: 'oklch(0.75 0.18 55 / 0.3)',
    Critical: 'oklch(0.63 0.24 25 / 0.3)',
  };

  const strokeColor = colorMap[band.label] ?? colorMap.Good;
  const textColor = textColorMap[band.label] ?? textColorMap.Good;
  const glowColor = glowColorMap[band.label] ?? glowColorMap.Good;

  // Determine font size based on ring size
  const fontSize = size >= 100 ? 'text-3xl' : size >= 64 ? 'text-lg' : 'text-sm';
  const bandFontSize = size >= 100 ? 'text-xs' : 'text-[9px]';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        style={{
          filter: size >= 80 ? `drop-shadow(0 0 ${size / 8}px ${glowColor})` : undefined,
        }}
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
          className={cn('transition-all duration-1000 ease-out', strokeColor)}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold leading-none', fontSize, textColor)}>
            {Math.round(clampedScore)}
          </span>
          {showBandLabel && (
            <span className={cn('mt-0.5 font-medium uppercase tracking-wider', bandFontSize, 'text-muted-foreground')}>
              {band.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
