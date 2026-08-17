'use client';

// =============================================================================
// TelemetryGauges — Visual Live Data
// =============================================================================
// Animated visual gauges for telemetry data during the simulation.
// =============================================================================

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Eye, Gauge } from 'lucide-react';
import type { TelemetrySubmission } from '@/types/telemetry';
import { formatSpeed, formatGForce } from '@/lib/utils/formatters';

interface TelemetryGaugesProps {
  payload: TelemetrySubmission | null;
  className?: string;
}

export function TelemetryGauges({ payload, className }: TelemetryGaugesProps) {
  // If no payload, show zero state
  const speed = payload?.events?.[0]?.speed ?? 0;
  const drowsiness = payload?.events?.[0]?.drowsinessScore ?? 0;
  const gForce = payload?.events?.[0]?.gForce ?? 0;

  // Drowsiness colors: 0-0.4 = Green, 0.4-0.7 = Yellow, >0.7 = Red
  let drowsinessColor = 'bg-emerald-500';
  if (drowsiness >= 0.7) drowsinessColor = 'bg-red-500';
  else if (drowsiness >= 0.4) drowsinessColor = 'bg-amber-500';

  // G-Force colors: <0.2 = Green, 0.2-0.5 = Yellow, >0.5 = Red
  let gForceColor = 'bg-emerald-500';
  if (gForce >= 0.5) gForceColor = 'bg-red-500';
  else if (gForce >= 0.2) gForceColor = 'bg-amber-500';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <Activity className="h-4 w-4" />
          Live Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid divide-y divide-border">
          {/* Speed Gauge */}
          <div className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <Gauge className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium">Speed</span>
                <span className="text-2xl font-bold tracking-tight text-blue-400">
                  {formatSpeed(speed)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((speed / 120) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Drowsiness Gauge */}
          <div className="p-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${drowsinessColor.replace('bg-', 'bg-').replace('500', '500/10')}`}>
              <Eye className={`h-5 w-5 ${drowsinessColor.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium">Drowsiness Risk</span>
                <span className={`text-lg font-bold tracking-tight ${drowsinessColor.replace('bg-', 'text-')}`}>
                  {Math.round(drowsiness * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500 ease-out", drowsinessColor)}
                  style={{ width: `${Math.min(drowsiness * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* G-Force Gauge */}
          <div className="p-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${gForceColor.replace('bg-', 'bg-').replace('500', '500/10')}`}>
              <Activity className={`h-5 w-5 ${gForceColor.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium">G-Force (Intensity)</span>
                <span className={`text-lg font-bold tracking-tight ${gForceColor.replace('bg-', 'text-')}`}>
                  {formatGForce(gForce)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500 ease-out", gForceColor)}
                  style={{ width: `${Math.min((gForce / 1.5) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
