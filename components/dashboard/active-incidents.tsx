'use client';

// =============================================================================
// ActiveIncidents — Unacknowledged Alert Panel
// =============================================================================
// Displays active WARNING and CRITICAL alerts that need attention.
// Provides visual urgency with severity-colored borders and pulsing indicators.
// =============================================================================

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { EventIndicator } from '@/components/dashboard/event-indicator';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { DbAlert } from '@/types/database';

// =============================================================================
// Types
// =============================================================================

interface ActiveIncidentsProps {
  alerts: (DbAlert & { vehicles?: { vehicle_number: string } | null })[];
  /** Maximum incidents to show */
  maxItems?: number;
  className?: string;
}

// =============================================================================
// Severity Styles
// =============================================================================

const INCIDENT_BORDER: Record<string, string> = {
  CRITICAL: 'border-l-red-500',
  WARNING: 'border-l-amber-500',
  INFO: 'border-l-blue-500',
};

const INCIDENT_BG: Record<string, string> = {
  CRITICAL: 'bg-red-500/[0.03]',
  WARNING: 'bg-amber-500/[0.03]',
  INFO: 'bg-transparent',
};

// =============================================================================
// Component
// =============================================================================

/**
 * Active incidents panel showing unacknowledged WARNING and CRITICAL alerts.
 * Designed for the Safety Command Center dashboard.
 */
export function ActiveIncidents({
  alerts,
  maxItems = 5,
  className,
}: ActiveIncidentsProps) {
  // Filter to unacknowledged WARNING and CRITICAL only
  const activeIncidents = alerts
    .filter((a) => !a.acknowledged && (a.severity === 'CRITICAL' || a.severity === 'WARNING'))
    .slice(0, maxItems);

  if (activeIncidents.length === 0) {
    return (
      <Card className={cn('border-dashed border-emerald-500/20', className)}>
        <CardContent className="flex items-center gap-3 py-6 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-400">All Clear</p>
            <p className="text-xs text-muted-foreground">No active incidents requiring attention</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {activeIncidents.map((incident) => {
        const vehicleNumber = incident.vehicles?.vehicle_number;
        const isCritical = incident.severity === 'CRITICAL';
        const borderStyle = INCIDENT_BORDER[incident.severity] ?? INCIDENT_BORDER.INFO;
        const bgStyle = INCIDENT_BG[incident.severity] ?? INCIDENT_BG.INFO;

        return (
          <Card
            key={incident.id}
            className={cn(
              'border-l-[3px] transition-all duration-300',
              'animate-in fade-in-0 slide-in-from-left-2',
              borderStyle,
              bgStyle,
            )}
          >
            <CardContent className="flex items-start gap-3 p-3">
              {/* Severity indicator */}
              <div className="relative mt-0.5 shrink-0">
                <EventIndicator
                  type={incident.type}
                  showLabel={false}
                  size="sm"
                />
                {/* Pulsing dot for CRITICAL */}
                {isCritical && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isCritical && (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                    )}
                    <p className="text-xs font-medium text-foreground truncate">
                      <Link href={`/alerts/${incident.id}`} className="hover:underline hover:text-violet-400 transition-colors">
                        {incident.message}
                      </Link>
                    </p>
                  </div>
                  <StatusBadge variant="severity" status={incident.severity} />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {vehicleNumber ?? 'Unknown vehicle'} · {formatRelativeTime(incident.timestamp)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
