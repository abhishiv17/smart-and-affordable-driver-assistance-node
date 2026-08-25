'use client';

// =============================================================================
// Recent Activity — Compact Vertical Timeline
// =============================================================================

import Link from 'next/link';
import type { DbAlert } from '@/types/database';

interface RecentActivityProps {
  alerts: (DbAlert & { vehicles?: { vehicle_number: string } | null })[];
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'var(--color-sadan-critical)',
  WARNING: 'var(--color-sadan-warning)',
  INFO: 'var(--color-bauhaus-blue)',
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  DROWSINESS: 'Drowsiness detected',
  HARSH_BRAKING: 'Harsh braking detected',
  HARSH_ACCELERATION: 'Harsh acceleration',
  DEVICE_OFFLINE: 'Device went offline',
  DEVICE_RECOVERED: 'Device recovered',
};

/**
 * Compact vertical timeline of recent fleet events.
 * Shows the most recent 6 alerts with time, vehicle, and event description.
 */
export function RecentActivity({ alerts }: RecentActivityProps) {
  const items = alerts.slice(0, 6);

  if (items.length === 0) {
    return (
      <div className="sadan-section">
        <p className="sadan-label mb-4">Recent Activity</p>
        <p className="text-sm text-muted-foreground">No recent events.</p>
      </div>
    );
  }

  return (
    <div className="sadan-section">
      <div className="flex items-center justify-between mb-4">
        <p className="sadan-label">Recent Activity</p>
        <Link
          href="/alerts"
          className="text-[10px] font-semibold text-primary hover:underline uppercase tracking-wider"
        >
          View All →
        </Link>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div
          className="absolute left-[3px] top-2 bottom-2 w-px"
          style={{ backgroundColor: 'var(--border)' }}
        />

        <div className="space-y-0">
          {items.map((alert, idx) => {
            const time = new Date(alert.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const vehicleNum =
              alert.vehicles?.vehicle_number ?? 'Unknown';
            const dotColor =
              SEVERITY_COLORS[alert.severity] ?? 'var(--border)';
            const label =
              ALERT_TYPE_LABELS[alert.type] ?? alert.message;

            return (
              <div
                key={alert.id}
                className="relative flex gap-3 py-2 pl-4"
              >
                {/* Dot */}
                <span
                  className="absolute left-0 top-3 sadan-status-dot"
                  style={{ backgroundColor: dotColor }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                      {time}
                    </span>
                    <Link
                      href={`/vehicles/${alert.vehicle_id}`}
                      className="font-mono text-xs font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {vehicleNum}
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
