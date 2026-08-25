'use client';

// =============================================================================
// Attention Panel — Critical Alerts + Actionable Items
// =============================================================================

import Link from 'next/link';
import type { DbAlert } from '@/types/database';

interface AttentionPanelProps {
  criticalAlerts: number;
  warningAlerts: number;
  vehiclesAtRisk: number;
  devicesOffline: number;
  /** Top recent alerts with vehicle info */
  recentAlerts: (DbAlert & { vehicles?: { vehicle_number: string } | null })[];
}

/**
 * Attention Required panel — answers "What should I look at right now?"
 * Red accent border when critical items exist.
 */
export function AttentionPanel({
  criticalAlerts,
  warningAlerts,
  vehiclesAtRisk,
  devicesOffline,
  recentAlerts,
}: AttentionPanelProps) {
  const totalAttention = criticalAlerts + warningAlerts;
  const hasCritical = criticalAlerts > 0;

  // Filter to critical/warning only
  const urgentAlerts = recentAlerts
    .filter((a) => a.severity === 'CRITICAL' || a.severity === 'WARNING')
    .slice(0, 4);

  return (
    <div
      className="sadan-section"
      style={{
        borderLeft: hasCritical
          ? '3px solid var(--color-sadan-critical)'
          : '3px solid var(--color-sadan-warning)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="sadan-label">Attention Required</p>
        <span
          className="sadan-metric text-2xl"
          style={{
            color: hasCritical
              ? 'var(--color-sadan-critical)'
              : totalAttention > 0
                ? 'var(--color-sadan-warning)'
                : 'var(--color-sadan-success)',
          }}
        >
          {String(totalAttention).padStart(2, '0')}
        </span>
      </div>

      {/* Summary items */}
      <div className="space-y-1.5 mb-4">
        {criticalAlerts > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="sadan-status-dot sadan-status-dot--critical" />
            <span>
              {criticalAlerts} critical alert{criticalAlerts !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {warningAlerts > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="sadan-status-dot sadan-status-dot--warning" />
            <span>
              {warningAlerts} warning{warningAlerts !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {vehiclesAtRisk > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className="sadan-status-dot"
              style={{ backgroundColor: 'var(--color-sadan-warning)' }}
            />
            <span>
              {vehiclesAtRisk} vehicle{vehiclesAtRisk !== 1 ? 's' : ''} need attention
            </span>
          </div>
        )}
        {devicesOffline > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="sadan-status-dot sadan-status-dot--offline" />
            <span>
              {devicesOffline} device{devicesOffline !== 1 ? 's' : ''} offline
            </span>
          </div>
        )}
        {totalAttention === 0 && vehiclesAtRisk === 0 && devicesOffline === 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="sadan-status-dot sadan-status-dot--online" />
            <span>All systems healthy — no action needed</span>
          </div>
        )}
      </div>

      {/* Recent urgent alerts */}
      {urgentAlerts.length > 0 && (
        <>
          <hr className="sadan-divider mb-3" />
          <div className="space-y-2">
            {urgentAlerts.map((alert) => {
              const time = new Date(alert.timestamp).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              const vehicleNum =
                alert.vehicles?.vehicle_number ?? 'Unknown';

              return (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 text-xs"
                >
                  <span
                    className="sadan-status-dot shrink-0"
                    style={{
                      backgroundColor:
                        alert.severity === 'CRITICAL'
                          ? 'var(--color-sadan-critical)'
                          : 'var(--color-sadan-warning)',
                    }}
                  />
                  <span className="font-mono font-semibold shrink-0">
                    {vehicleNum}
                  </span>
                  <span className="text-muted-foreground truncate flex-1">
                    {alert.message}
                  </span>
                  <span className="font-mono text-muted-foreground shrink-0">
                    {time}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CTA */}
      <div className="mt-4">
        <Link
          href="/alerts"
          className="text-xs font-semibold text-primary hover:underline uppercase tracking-wider"
        >
          View Alerts →
        </Link>
      </div>
    </div>
  );
}
