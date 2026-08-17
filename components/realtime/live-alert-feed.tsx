'use client';

import { useRealtimeAlerts } from '@/hooks/use-realtime-alerts';
import { Section } from '@/components/dashboard/section';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EventIndicator } from '@/components/dashboard/event-indicator';
import { EmptyState } from '@/components/dashboard/empty-state';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import Link from 'next/link';
import type { DbAlert } from '@/types/database';

interface LiveAlertFeedProps {
  initialAlerts: (DbAlert & { vehicles?: { vehicle_number: string } | null; drivers?: { name: string } | null })[];
}

/**
 * Client-side live alert feed with realtime subscription.
 * New alerts appear automatically without page refresh.
 */
export function LiveAlertFeed({ initialAlerts }: LiveAlertFeedProps) {
  const { alerts } = useRealtimeAlerts(initialAlerts, 50);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
  const unacknowledged = alerts.filter(a => !a.acknowledged).length;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatCard
          label="Critical"
          value={criticalCount}
          icon={AlertTriangle}
          accentColor="text-red-400"
        />
        <StatCard
          label="Warning"
          value={warningCount}
          icon={Bell}
          accentColor="text-amber-400"
        />
        <StatCard
          label="Unacknowledged"
          value={unacknowledged}
          icon={CheckCircle}
          accentColor="text-blue-400"
        />
      </div>

      <Section title="Alert Feed">
        {alerts.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No alerts"
            description="Safety alerts will appear here as telemetry events are processed."
          />
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const vehicleNumber = (alert as DbAlert & { vehicles?: { vehicle_number: string } | null }).vehicles?.vehicle_number;
              const driverName = (alert as DbAlert & { drivers?: { name: string } | null }).drivers?.name;

              return (
                <Card
                  key={alert.id}
                  className={`transition-all hover:bg-muted/30 animate-in fade-in-0 duration-300 ${!alert.acknowledged ? 'border-l-2 border-l-amber-500/50' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <EventIndicator type={alert.type} showLabel={false} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">
                            <Link href={`/alerts/${alert.id}`} className="hover:underline hover:text-violet-400 transition-colors">
                              {alert.message}
                            </Link>
                          </p>
                          <StatusBadge variant="severity" status={alert.severity} />
                          {!alert.acknowledged && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>{vehicleNumber ?? 'Unknown vehicle'}</span>
                          {driverName && (
                            <>
                              <span>·</span>
                              <span>{driverName}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{formatRelativeTime(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
