import { cn } from '@/lib/utils';
import type { AlertSeverity } from '@/types/alert';
import { formatRelativeTime } from '@/lib/utils/formatters';

// =============================================================================
// Types
// =============================================================================

export interface TimelineItem {
  id: string;
  /** ISO timestamp */
  timestamp: string;
  /** Title / heading */
  title: string;
  /** Description or detail text */
  description?: string;
  /** Severity determines dot color */
  severity?: AlertSeverity;
  /** Optional icon or custom node for the dot */
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

// =============================================================================
// Severity → Color mapping
// =============================================================================

const SEVERITY_DOT_COLORS: Record<AlertSeverity, string> = {
  INFO: 'bg-blue-400',
  WARNING: 'bg-amber-400',
  CRITICAL: 'bg-red-400',
};

const DEFAULT_DOT_COLOR = 'bg-zinc-500';

// =============================================================================
// Component
// =============================================================================

/**
 * Vertical event timeline with severity-colored dots.
 * Used for vehicle event history, alert history, and trip events.
 */
export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('relative space-y-0', className)}>
      {items.map((item, idx) => {
        const dotColor = item.severity
          ? SEVERITY_DOT_COLORS[item.severity]
          : DEFAULT_DOT_COLOR;
        const isLast = idx === items.length - 1;

        return (
          <div key={item.id} className="relative flex gap-4 pb-6">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              {item.icon ? (
                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                  {item.icon}
                </div>
              ) : (
                <div
                  className={cn(
                    'z-10 mt-1 h-2.5 w-2.5 rounded-full ring-2 ring-background',
                    dotColor
                  )}
                />
              )}
              {!isLast && (
                <div className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
