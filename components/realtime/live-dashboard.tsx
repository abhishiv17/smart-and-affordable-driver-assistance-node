'use client';

// =============================================================================
// LiveDashboard — SADAN Overview (Digital Bauhaus)
// =============================================================================
// Typography-first business health view.
// Replaces the card-heavy Safety Command Center with:
//   - Large metric hero (Business Health score)
//   - KPI strip (Revenue, Cash Flow, Fleet)
//   - Live Business Signals
//   - Vehicle Fleet list
// =============================================================================

import { useRealtimeAlerts } from '@/hooks/use-realtime-alerts';
import { useRealtimeVehicles } from '@/hooks/use-realtime-vehicles';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { useTranslation } from '@/components/layout/language-provider';
import {
  classifyVehicleRisk,
  sortByRisk,
} from '@/lib/safety/risk-classification';
import Link from 'next/link';
import type { DbVehicle, DbAlert } from '@/types/database';

// =============================================================================
// Types
// =============================================================================

interface LiveDashboardProps {
  initialVehicles: DbVehicle[];
  initialAlerts: (DbAlert & { vehicles?: { vehicle_number: string } | null })[];
  initialDevicesOnline: number;
  initialDevicesTotal: number;
}

// =============================================================================
// Component
// =============================================================================

export function LiveDashboard({
  initialVehicles,
  initialAlerts,
  initialDevicesOnline,
  initialDevicesTotal,
}: LiveDashboardProps) {
  const { vehicles } = useRealtimeVehicles(initialVehicles);
  const { alerts } = useRealtimeAlerts(initialAlerts);
  const { t } = useTranslation();

  // Computed
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const avgSafetyScore = vehicles.length > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.safety_score ?? 100), 0) / vehicles.length)
    : 100;
  const criticalAlerts = alerts.filter(
    a => a.severity === 'CRITICAL' && !a.acknowledged
  ).length;
  const warningAlerts = alerts.filter(
    a => a.severity === 'WARNING' && !a.acknowledged
  ).length;

  const sortedVehicles = sortByRisk(vehicles);

  const healthLabel = avgSafetyScore >= 80 ? t('healthGood') : avgSafetyScore >= 60 ? t('healthFair') : t('healthCritical');
  const healthColor = avgSafetyScore >= 80
    ? 'var(--color-sadan-success)'
    : avgSafetyScore >= 60
      ? 'var(--color-sadan-warning)'
      : 'var(--color-sadan-critical)';

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 17 ? t('goodAfternoon') : t('goodEvening');
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div>
      {/* Greeting */}
      <p className="text-sm text-muted-foreground mb-1">{greeting}.</p>
      <p className="sadan-label">{dateStr}</p>

      <hr className="sadan-divider my-6" />

      {/* ================================================================= */}
      {/* Hero — Business Health Score */}
      {/* ================================================================= */}
      <div className="text-center py-8">
        <div className="sadan-metric sadan-metric-lg sadan-animate-in" style={{ color: healthColor }}>
          {avgSafetyScore}
        </div>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider" style={{ color: healthColor }}>
          {healthLabel}
        </p>
        <p className="sadan-label mt-1">{t('businessHealth')}</p>
      </div>

      <hr className="sadan-divider my-6" />

      {/* ================================================================= */}
      {/* KPI Strip */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6">
        <div>
          <p className="sadan-label">{t('activeVehicles')}</p>
          <p className="sadan-metric sadan-metric-md mt-1">{activeVehicles}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalVehicles} {t('total')}</p>
        </div>
        <div>
          <p className="sadan-label">{t('criticalAlerts')}</p>
          <p className="sadan-metric sadan-metric-md mt-1" style={{ color: criticalAlerts > 0 ? 'var(--color-sadan-critical)' : 'var(--color-sadan-success)' }}>
            {criticalAlerts}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {criticalAlerts > 0 ? t('requiresAction') : t('allClear')}
          </p>
        </div>
        <div>
          <p className="sadan-label">{t('devicesOnline')}</p>
          <p className="sadan-metric sadan-metric-md mt-1">{initialDevicesOnline}</p>
          <p className="text-xs text-muted-foreground mt-1">{initialDevicesTotal} {t('total')}</p>
        </div>
        <div>
          <p className="sadan-label">{t('fleetSafety')}</p>
          <p className="sadan-metric sadan-metric-md mt-1">{avgSafetyScore}</p>
          <p className="text-xs text-muted-foreground mt-1">/ 100</p>
        </div>
      </div>

      <hr className="sadan-divider my-6" />

      {/* ================================================================= */}
      {/* Live Business Signals */}
      {/* ================================================================= */}
      <div className="py-6">
        <p className="sadan-label mb-4">Live Business Signals</p>
        <div className="space-y-2">
          {activeVehicles > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="sadan-status-dot sadan-status-dot--online" />
              <span>{activeVehicles} {t('vehiclesCurrentlyActive')}</span>
            </div>
          )}
          {criticalAlerts > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="sadan-status-dot sadan-status-dot--critical" />
              <span style={{ color: 'var(--color-sadan-critical)' }}>
                {criticalAlerts} {t('criticalAlertsRequiringAttention')}
              </span>
            </div>
          )}
          {warningAlerts > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="sadan-status-dot sadan-status-dot--warning" />
              <span>{warningAlerts} {t('warningsToMonitor')}</span>
            </div>
          )}
          {criticalAlerts === 0 && warningAlerts === 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="sadan-status-dot sadan-status-dot--online" />
              <span>{t('allSystemsHealthy')}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <span className="sadan-status-dot sadan-status-dot--online" />
            <span>{initialDevicesOnline}/{initialDevicesTotal} {t('devicesConnected')}</span>
          </div>
        </div>
      </div>

      <hr className="sadan-divider my-6" />

      {/* ================================================================= */}
      {/* Vehicle Fleet */}
      {/* ================================================================= */}
      <div className="py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="sadan-label">{t('vehicleFleet')}</p>
          <Link href="/vehicles" className="text-xs font-medium text-primary hover:underline uppercase tracking-wider">
            {t('viewAll')}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 sadan-label">{t('vehicleCol')}</th>
                <th className="text-left py-3 pr-4 sadan-label">{t('statusCol')}</th>
                <th className="text-left py-3 pr-4 sadan-label">{t('healthCol')}</th>
                <th className="text-left py-3 sadan-label">{t('lastSeenCol')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedVehicles.slice(0, 8).map((vehicle) => {
                const risk = classifyVehicleRisk(vehicle.safety_score);
                return (
                  <tr key={vehicle.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="font-mono font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {vehicle.vehicle_number}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge variant="vehicle" status={vehicle.status} dot={vehicle.status === 'ACTIVE'} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono font-semibold" style={{ color: risk.borderColor ? undefined : healthColor }}>
                        {vehicle.safety_score ?? 100}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {vehicle.last_seen ? formatRelativeTime(vehicle.last_seen) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
