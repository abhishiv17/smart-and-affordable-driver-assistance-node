'use client';

// =============================================================================
// Fleet Table Compact — Redesigned Vehicle Fleet Table
// =============================================================================

import Link from 'next/link';
import { classifyVehicleRisk, sortByRisk } from '@/lib/safety/risk-classification';
import type { DbVehicle, DbAlert } from '@/types/database';

interface FleetTableCompactProps {
  vehicles: DbVehicle[];
  alerts: (DbAlert & { vehicles?: { vehicle_number: string } | null })[];
}

const STATUS_DOTS: Record<string, { color: string; symbol: string }> = {
  ACTIVE: { color: 'var(--color-status-active)', symbol: '●' },
  IDLE: { color: 'var(--color-status-idle)', symbol: '●' },
  MAINTENANCE: { color: 'var(--color-status-maintenance)', symbol: '◇' },
  OFFLINE: { color: 'var(--color-status-offline)', symbol: '○' },
};

const RISK_COLORS: Record<string, string> = {
  NORMAL: 'var(--color-sadan-success)',
  ELEVATED: 'var(--color-sadan-warning)',
  HIGH: 'var(--color-bauhaus-red)',
  CRITICAL: 'var(--color-sadan-critical)',
};

const ALERT_SHORT_LABELS: Record<string, string> = {
  DROWSINESS: 'Drowsiness',
  HARSH_BRAKING: 'Harsh braking',
  HARSH_ACCELERATION: 'Hard accel.',
  DEVICE_OFFLINE: 'Device offline',
  DEVICE_RECOVERED: 'Device recovered',
};

/**
 * Compact fleet table with health bars instead of raw numbers.
 * Shows most relevant last event instead of just "Xd ago".
 */
export function FleetTableCompact({ vehicles, alerts }: FleetTableCompactProps) {
  const sorted = sortByRisk(vehicles).slice(0, 8);

  // Build a map of vehicle_id → most recent alert
  const alertByVehicle = new Map<string, DbAlert>();
  for (const alert of alerts) {
    if (!alertByVehicle.has(alert.vehicle_id)) {
      alertByVehicle.set(alert.vehicle_id, alert);
    }
  }

  return (
    <div className="sadan-section">
      <div className="flex items-center justify-between mb-4">
        <p className="sadan-label">Vehicle Fleet</p>
        <Link
          href="/vehicles"
          className="text-[10px] font-semibold text-primary hover:underline uppercase tracking-wider"
        >
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 pr-4 sadan-label text-[10px]">Vehicle</th>
              <th className="text-left py-2.5 pr-4 sadan-label text-[10px]">Status</th>
              <th className="text-left py-2.5 pr-4 sadan-label text-[10px]">Health</th>
              <th className="text-left py-2.5 sadan-label text-[10px]">Last Event</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((vehicle) => {
              const risk = classifyVehicleRisk(vehicle.safety_score);
              const score = vehicle.safety_score ?? 100;
              const barColor = RISK_COLORS[risk.level] ?? 'var(--border)';
              const statusInfo = STATUS_DOTS[vehicle.status] ?? STATUS_DOTS.OFFLINE;

              // Get most recent alert for this vehicle
              const lastAlert = alertByVehicle.get(vehicle.id);
              const lastEventLabel = lastAlert
                ? ALERT_SHORT_LABELS[lastAlert.type] ?? lastAlert.message
                : vehicle.status === 'IDLE'
                  ? 'Idle'
                  : vehicle.status === 'MAINTENANCE'
                    ? 'In maintenance'
                    : 'Normal';

              return (
                <tr
                  key={vehicle.id}
                  className="border-b border-border/30 group hover:bg-muted/20 transition-colors"
                >
                  {/* Vehicle number */}
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/vehicles/${vehicle.id}`}
                      className="font-mono text-xs font-semibold text-foreground hover:text-primary transition-colors group-hover:text-primary"
                    >
                      {vehicle.vehicle_number}
                    </Link>
                  </td>

                  {/* Status */}
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span style={{ color: statusInfo.color, fontSize: '8px' }}>
                        {statusInfo.symbol}
                      </span>
                      <span className="uppercase tracking-wider text-[10px] font-medium">
                        {vehicle.status === 'MAINTENANCE' ? 'Maint.' : vehicle.status}
                      </span>
                    </span>
                  </td>

                  {/* Health */}
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs font-bold w-6"
                        style={{ color: barColor }}
                      >
                        {Math.round(score)}
                      </span>
                      <div className="w-16 h-1.5 bg-border/40 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${score}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Last Event */}
                  <td className="py-2.5">
                    <span className="text-xs text-muted-foreground truncate block max-w-[150px]">
                      {lastEventLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
