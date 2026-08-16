import { cn } from '@/lib/utils';
import type { TelemetryEventType } from '@/types/telemetry';
import { formatEventType } from '@/lib/utils/formatters';
import {
  Eye,
  Zap,
  ArrowDown,
  ArrowUp,
  WifiOff,
  Wifi,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// =============================================================================
// Event Type Configuration
// =============================================================================

interface EventConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const EVENT_CONFIG: Record<TelemetryEventType, EventConfig> = {
  NORMAL: {
    icon: Activity,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
  },
  DROWSINESS: {
    icon: Eye,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  HARSH_BRAKING: {
    icon: ArrowDown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  HARSH_ACCELERATION: {
    icon: ArrowUp,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  DEVICE_OFFLINE: {
    icon: WifiOff,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
  },
  DEVICE_RECOVERED: {
    icon: Wifi,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
};

// =============================================================================
// Component
// =============================================================================

interface EventIndicatorProps {
  /** The telemetry event type */
  type: TelemetryEventType;
  /** Show text label alongside icon */
  showLabel?: boolean;
  /** Icon size */
  size?: 'sm' | 'md';
  /** Additional class */
  className?: string;
}

/**
 * Compact event type indicator with icon and optional label.
 * Used in tables, timelines, and alert cards.
 */
export function EventIndicator({
  type,
  showLabel = true,
  size = 'sm',
  className,
}: EventIndicatorProps) {
  const config = EVENT_CONFIG[type];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className={cn('flex items-center justify-center rounded-md p-1', config.bgColor)}>
        <Icon className={cn(iconSize, config.color)} />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', config.color)}>
          {formatEventType(type)}
        </span>
      )}
    </div>
  );
}

/** Export config for use in other components */
export { EVENT_CONFIG };
