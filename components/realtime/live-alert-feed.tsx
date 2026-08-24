'use client';

import { useRealtimeAlerts } from '@/hooks/use-realtime-alerts';
import { EmptyState } from '@/components/dashboard/empty-state';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { DbAlert } from '@/types/database';

interface LiveAlertFeedProps {
  initialAlerts: (DbAlert & { vehicles?: { vehicle_number: string } | null; drivers?: { name: string } | null })[];
}

/**
 * Live Alert Feed — Digital Bauhaus timeline layout.
 * Groups alerts by severity, shows as vertical timeline.
 */
export function LiveAlertFeed({ initialAlerts }: LiveAlertFeedProps) {
  const { alerts } = useRealtimeAlerts(initialAlerts, 50);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
  const infoCount = alerts.filter(a => a.severity === 'INFO').length;

  // Group alerts by severity
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const warningAlerts = alerts.filter(a => a.severity === 'WARNING');
  const infoAlerts = alerts.filter(a => a.severity !== 'CRITICAL' && a.severity !== 'WARNING');

  const severityConfig: Record<string, { color: string; label: string }> = {
    CRITICAL: { color: 'var(--color-sadan-critical)', label: 'Critical' },
    WARNING: { color: 'var(--color-sadan-warning)', label: 'Warning' },
    INFO: { color: 'var(--color-bauhaus-blue)', label: 'Info' },
  };

  // Stats strip
  return (
    <>
      <div className="flex items-center gap-8 mb-8">
        <div className="flex items-center gap-2">
          <span className="sadan-status-dot sadan-status-dot--critical" />
          <span className="text-sm font-medium">{criticalCount} Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="sadan-status-dot sadan-status-dot--warning" />
          <span className="text-sm font-medium">{warningCount} Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="sadan-status-dot" style={{ backgroundColor: 'var(--color-bauhaus-blue)' }} />
          <span className="text-sm font-medium">{infoCount} Info</span>
        </div>
      </div>

      <hr className="sadan-divider mb-8" />

      {alerts.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No alerts"
          description="Safety alerts will appear here as telemetry events are processed."
        />
      ) : (
        <div className="space-y-10">
          {/* Render each severity group */}
          {[
            { items: criticalAlerts, key: 'CRITICAL' },
            { items: warningAlerts, key: 'WARNING' },
            { items: infoAlerts, key: 'INFO' },
          ]
            .filter(group => group.items.length > 0)
            .map(group => {
              const config = severityConfig[group.key];
              return (
                <div key={group.key}>
                  <p
                    className="sadan-label mb-4"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </p>

                  <div className="space-y-0">
                    {group.items.map((alert, idx) => {
                      const vehicleNumber = (alert as DbAlert & { vehicles?: { vehicle_number: string } | null }).vehicles?.vehicle_number;
                      const driverName = (alert as DbAlert & { drivers?: { name: string } | null }).drivers?.name;
                      const timestamp = new Date(alert.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      });

                      return (
                        <div
                          key={alert.id}
                          className="flex gap-4 py-4 border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors"
                        >
                          {/* Timeline dot + time */}
                          <div className="flex flex-col items-center shrink-0 w-14">
                            <span
                              className="sadan-status-dot mt-1"
                              style={{ backgroundColor: config.color }}
                            />
                            <span className="text-[10px] font-mono text-muted-foreground mt-1">
                              {timestamp}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/alerts/${alert.id}`}
                              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {alert.message}
                            </Link>

                            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="font-mono">{vehicleNumber ?? 'Unknown'}</span>
                              {driverName && (
                                <>
                                  <span>·</span>
                                  <span>{driverName}</span>
                                </>
                              )}
                              <span>·</span>
                              <span>{formatRelativeTime(alert.timestamp)}</span>
                            </div>

                            {!alert.acknowledged && (
                              <span
                                className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border"
                                style={{
                                  color: config.color,
                                  borderColor: config.color,
                                  borderRadius: 'var(--radius)',
                                }}
                              >
                                Unacknowledged
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </>
  );
}
