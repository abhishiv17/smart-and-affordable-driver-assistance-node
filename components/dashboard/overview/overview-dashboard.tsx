'use client';

// =============================================================================
// Overview Dashboard — Digital Bauhaus Command Center
// =============================================================================
// Main orchestrator component for the Overview page.
// Composes all sub-components into a responsive 12-column grid.
// Uses existing realtime hooks to maintain live data updates.
// =============================================================================

import { useRealtimeAlerts } from '@/hooks/use-realtime-alerts';
import { useRealtimeVehicles } from '@/hooks/use-realtime-vehicles';
import type { DbVehicle, DbAlert } from '@/types/database';

import { OverviewHeader } from './overview-header';
import { BusinessHealthGauge } from './business-health-gauge';
import { FleetStatusDonut } from './fleet-status-donut';
import { AttentionPanel } from './attention-panel';
import { PerformanceChart } from './performance-chart';
import { FleetHealthBars } from './fleet-health-bars';
import { SadanRecommends } from './sadan-recommends';
import { RecentActivity } from './recent-activity';
import { FleetTableCompact } from './fleet-table-compact';

// =============================================================================
// Types
// =============================================================================

interface OverviewDashboardProps {
  initialVehicles: DbVehicle[];
  initialAlerts: (DbAlert & { vehicles?: { vehicle_number: string } | null })[];
  initialDevicesOnline: number;
  initialDevicesTotal: number;
}

// =============================================================================
// Component
// =============================================================================

export function OverviewDashboard({
  initialVehicles,
  initialAlerts,
  initialDevicesOnline,
  initialDevicesTotal,
}: OverviewDashboardProps) {
  // Realtime data hooks
  const { vehicles } = useRealtimeVehicles(initialVehicles);
  const { alerts } = useRealtimeAlerts(initialAlerts);

  // =========================================================================
  // Derived Metrics (all from real data)
  // =========================================================================

  const totalVehicles = vehicles.length;

  // Vehicle status counts
  const activeVehicles = vehicles.filter((v) => v.status === 'ACTIVE').length;
  const idleVehicles = vehicles.filter((v) => v.status === 'IDLE').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'MAINTENANCE').length;
  const offlineVehicles = vehicles.filter((v) => v.status === 'OFFLINE').length;

  // Safety
  const avgSafetyScore =
    totalVehicles > 0
      ? Math.round(
          vehicles.reduce((sum, v) => sum + (v.safety_score ?? 100), 0) / totalVehicles
        )
      : 100;

  // Fleet utilization (% of vehicles active)
  const fleetUtilization =
    totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  // Device uptime (% online)
  const deviceUptime =
    initialDevicesTotal > 0
      ? Math.round((initialDevicesOnline / initialDevicesTotal) * 100)
      : 100;

  // Composite Business Health Score
  // Weights: Safety 40%, Fleet Utilization 30%, Device Uptime 30%
  const businessHealthScore = Math.round(
    avgSafetyScore * 0.4 + fleetUtilization * 0.3 + deviceUptime * 0.3
  );

  // Sub-scores for the gauge
  const subScores = [
    {
      label: 'Safety',
      value: avgSafetyScore,
      color:
        avgSafetyScore >= 80
          ? 'var(--color-sadan-success)'
          : avgSafetyScore >= 60
            ? 'var(--color-sadan-warning)'
            : 'var(--color-sadan-critical)',
    },
    {
      label: 'Fleet',
      value: fleetUtilization,
      color:
        fleetUtilization >= 70
          ? 'var(--color-sadan-success)'
          : fleetUtilization >= 40
            ? 'var(--color-sadan-warning)'
            : 'var(--color-sadan-critical)',
    },
    {
      label: 'Devices',
      value: deviceUptime,
      color:
        deviceUptime >= 80
          ? 'var(--color-sadan-success)'
          : deviceUptime >= 60
            ? 'var(--color-sadan-warning)'
            : 'var(--color-sadan-critical)',
    },
  ];

  // Alert counts
  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'CRITICAL' && !a.acknowledged
  ).length;
  const warningAlerts = alerts.filter(
    (a) => a.severity === 'WARNING' && !a.acknowledged
  ).length;

  // Vehicles at risk (safety score < 60)
  const vehiclesAtRisk = vehicles.filter(
    (v) => (v.safety_score ?? 100) < 60
  ).length;

  // Devices offline
  const devicesOffline = initialDevicesTotal - initialDevicesOnline;

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div>
      {/* Header */}
      <OverviewHeader />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ============================================================= */}
        {/* Row 1: Business Health + Fleet Status                         */}
        {/* ============================================================= */}
        <div className="lg:col-span-6">
          <BusinessHealthGauge score={businessHealthScore} subScores={subScores} />
        </div>
        <div className="lg:col-span-6">
          <FleetStatusDonut
            active={activeVehicles}
            idle={idleVehicles}
            maintenance={maintenanceVehicles}
            offline={offlineVehicles}
            devicesOnline={initialDevicesOnline}
            devicesTotal={initialDevicesTotal}
          />
        </div>

        {/* ============================================================= */}
        {/* Row 2: Attention Required + Fleet Safety Score KPI            */}
        {/* ============================================================= */}
        <div className="lg:col-span-6">
          <AttentionPanel
            criticalAlerts={criticalAlerts}
            warningAlerts={warningAlerts}
            vehiclesAtRisk={vehiclesAtRisk}
            devicesOffline={devicesOffline}
            recentAlerts={alerts}
          />
        </div>
        <div className="lg:col-span-6">
          <div className="sadan-section">
            <p className="sadan-label mb-3">Fleet Safety</p>
            <div className="flex items-end gap-3">
              <span
                className="sadan-metric text-5xl sadan-animate-in"
                style={{
                  color:
                    avgSafetyScore >= 80
                      ? 'var(--color-sadan-success)'
                      : avgSafetyScore >= 60
                        ? 'var(--color-sadan-warning)'
                        : 'var(--color-sadan-critical)',
                }}
              >
                {avgSafetyScore}
              </span>
              <span className="text-sm text-muted-foreground mb-1">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average across {totalVehicles} vehicles
            </p>

            {/* Mini risk distribution */}
            <div className="mt-4 flex gap-1 h-2">
              {totalVehicles > 0 && (
                <>
                  {vehicles.filter((v) => (v.safety_score ?? 100) >= 80).length > 0 && (
                    <div
                      className="h-full"
                      style={{
                        width: `${(vehicles.filter((v) => (v.safety_score ?? 100) >= 80).length / totalVehicles) * 100}%`,
                        backgroundColor: 'var(--color-sadan-success)',
                      }}
                      title={`${vehicles.filter((v) => (v.safety_score ?? 100) >= 80).length} Normal`}
                    />
                  )}
                  {vehicles.filter((v) => (v.safety_score ?? 100) >= 60 && (v.safety_score ?? 100) < 80).length > 0 && (
                    <div
                      className="h-full"
                      style={{
                        width: `${(vehicles.filter((v) => (v.safety_score ?? 100) >= 60 && (v.safety_score ?? 100) < 80).length / totalVehicles) * 100}%`,
                        backgroundColor: 'var(--color-sadan-warning)',
                      }}
                      title={`${vehicles.filter((v) => (v.safety_score ?? 100) >= 60 && (v.safety_score ?? 100) < 80).length} Elevated`}
                    />
                  )}
                  {vehicles.filter((v) => (v.safety_score ?? 100) >= 40 && (v.safety_score ?? 100) < 60).length > 0 && (
                    <div
                      className="h-full"
                      style={{
                        width: `${(vehicles.filter((v) => (v.safety_score ?? 100) >= 40 && (v.safety_score ?? 100) < 60).length / totalVehicles) * 100}%`,
                        backgroundColor: 'var(--color-bauhaus-red)',
                      }}
                      title={`${vehicles.filter((v) => (v.safety_score ?? 100) >= 40 && (v.safety_score ?? 100) < 60).length} High`}
                    />
                  )}
                  {vehicles.filter((v) => (v.safety_score ?? 100) < 40).length > 0 && (
                    <div
                      className="h-full"
                      style={{
                        width: `${(vehicles.filter((v) => (v.safety_score ?? 100) < 40).length / totalVehicles) * 100}%`,
                        backgroundColor: 'var(--color-sadan-critical)',
                      }}
                      title={`${vehicles.filter((v) => (v.safety_score ?? 100) < 40).length} Critical`}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-muted-foreground">Normal</span>
              <span className="text-[9px] text-muted-foreground">Critical</span>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* Row 3: Performance Trend (full width)                         */}
        {/* ============================================================= */}
        <div className="lg:col-span-12">
          <PerformanceChart vehicles={vehicles} />
        </div>

        {/* ============================================================= */}
        {/* Row 4: Fleet Health Bars (full width)                         */}
        {/* ============================================================= */}
        <div className="lg:col-span-12">
          <FleetHealthBars vehicles={vehicles} />
        </div>

        {/* ============================================================= */}
        {/* Row 5: SADAN Recommends + Recent Activity                     */}
        {/* ============================================================= */}
        <div className="lg:col-span-6">
          <SadanRecommends vehicles={vehicles} />
        </div>
        <div className="lg:col-span-6">
          <RecentActivity alerts={alerts} />
        </div>

        {/* ============================================================= */}
        {/* Row 6: Compact Fleet Table (full width)                       */}
        {/* ============================================================= */}
        <div className="lg:col-span-12">
          <FleetTableCompact vehicles={vehicles} alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
