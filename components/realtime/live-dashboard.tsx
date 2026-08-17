'use client';

// =============================================================================
// LiveDashboard — Safety Command Center
// =============================================================================
// Phase 2 redesign: Transforms the dashboard from a generic admin view into
// a Safety Command Center with 4 visual zones:
//   Zone A — Fleet Safety Hero Panel (large score ring + risk distribution)
//   Zone B — KPI Strip (compact stat cards)
//   Zone C — Active Incidents Panel (unacknowledged alerts)
//   Zone D — Vehicle Fleet Grid (risk-sorted, color-coded)
// =============================================================================

import { useRealtimeAlerts } from '@/hooks/use-realtime-alerts';
import { useRealtimeVehicles } from '@/hooks/use-realtime-vehicles';
import { StatCard } from '@/components/dashboard/stat-card';
import { Section } from '@/components/dashboard/section';
import { SafetyScoreRing } from '@/components/dashboard/safety-score-ring';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { ActiveIncidents } from '@/components/dashboard/active-incidents';
import { RiskDistributionBar } from '@/components/dashboard/risk-distribution-bar';
import { formatRelativeTime } from '@/lib/utils/formatters';
import {
  classifyVehicleRisk,
  getFleetRiskSummary,
  sortByRisk,
} from '@/lib/safety/risk-classification';
import { Card, CardContent } from '@/components/ui/card';
import {
  Truck,
  Shield,
  AlertTriangle,
  Radio,
} from 'lucide-react';
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

/**
 * Safety Command Center — client-side dashboard with realtime updates.
 * Receives SSR data as props, then merges live changes from Supabase Realtime.
 */
export function LiveDashboard({
  initialVehicles,
  initialAlerts,
  initialDevicesOnline,
  initialDevicesTotal,
}: LiveDashboardProps) {
  const { vehicles } = useRealtimeVehicles(initialVehicles);
  const { alerts } = useRealtimeAlerts(initialAlerts);

  // =========================================================================
  // Computed Values
  // =========================================================================

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const offlineVehicles = vehicles.filter(v => v.status === 'OFFLINE').length;
  const avgSafetyScore = vehicles.length > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.safety_score ?? 100), 0) / vehicles.length)
    : 100;
  const criticalAlerts = alerts.filter(
    a => a.severity === 'CRITICAL' && !a.acknowledged
  ).length;

  const fleetRiskSummary = getFleetRiskSummary(vehicles);
  const sortedVehicles = sortByRisk(vehicles);

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Zone A + B — Hero Panel + KPI Strip */}
      {/* ================================================================= */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        {/* Zone A — Fleet Safety Hero Panel */}
        <Card className="relative overflow-hidden">
          {/* Subtle gradient top accent based on fleet risk */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: avgSafetyScore >= 80
                ? 'linear-gradient(90deg, #34d399, transparent)'
                : avgSafetyScore >= 60
                  ? 'linear-gradient(90deg, #fbbf24, transparent)'
                  : avgSafetyScore >= 40
                    ? 'linear-gradient(90deg, #fb923c, transparent)'
                    : 'linear-gradient(90deg, #f87171, transparent)',
            }}
          />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Large Safety Score Ring */}
              <div className="shrink-0">
                <SafetyScoreRing
                  score={avgSafetyScore}
                  size={120}
                  strokeWidth={8}
                  showLabel
                  showBandLabel
                />
              </div>

              {/* Fleet Info */}
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Fleet Safety Score
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {totalVehicles} vehicles monitored · {activeVehicles} active
                  </p>
                </div>

                {/* Risk Distribution Bar */}
                <RiskDistributionBar
                  summary={fleetRiskSummary}
                  height={10}
                  showLabels
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone B — KPI Strip */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:w-[220px]">
          <StatCard
            label="Active Vehicles"
            value={activeVehicles}
            subtitle={`${totalVehicles} total`}
            icon={Truck}
            accentColor="text-emerald-400"
            accentCssColor="#34d399"
          />
          <StatCard
            label="Critical Alerts"
            value={criticalAlerts}
            subtitle={criticalAlerts > 0 ? 'Requires action' : 'All clear'}
            icon={AlertTriangle}
            accentColor={criticalAlerts > 0 ? 'text-red-400' : 'text-emerald-400'}
            accentCssColor={criticalAlerts > 0 ? '#f87171' : '#34d399'}
            pulse={criticalAlerts > 0}
          />
          <StatCard
            label="Devices Online"
            value={`${initialDevicesOnline}/${initialDevicesTotal}`}
            subtitle={offlineVehicles > 0 ? `${offlineVehicles} offline` : 'All connected'}
            icon={Radio}
            accentColor="text-blue-400"
            accentCssColor="#60a5fa"
          />
          <StatCard
            label="Fleet Safety"
            value={`${avgSafetyScore}/100`}
            subtitle={avgSafetyScore >= 80 ? 'Good standing' : avgSafetyScore >= 60 ? 'Needs monitoring' : 'Needs attention'}
            icon={Shield}
            accentColor={avgSafetyScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}
            accentCssColor={avgSafetyScore >= 80 ? '#34d399' : '#fbbf24'}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* Zone C — Active Incidents */}
      {/* ================================================================= */}
      <Section
        title="Active Incidents"
        subtitle={criticalAlerts > 0
          ? `${criticalAlerts} critical alert${criticalAlerts !== 1 ? 's' : ''} requiring immediate action`
          : undefined
        }
      >
        <ActiveIncidents alerts={alerts} maxItems={6} />
      </Section>

      {/* ================================================================= */}
      {/* Zone D — Vehicle Fleet Grid (risk-sorted) */}
      {/* ================================================================= */}
      <Section
        title="Vehicle Fleet"
        subtitle={`${totalVehicles} vehicles · Sorted by risk level`}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedVehicles.map((vehicle) => {
            const risk = classifyVehicleRisk(vehicle.safety_score);

            return (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="block"
              >
                <Card
                  className={`border-l-[3px] transition-all duration-300 hover:bg-muted/30 ${risk.borderColor}`}
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <SafetyScoreRing
                      score={vehicle.safety_score ?? 100}
                      size={44}
                      strokeWidth={4}
                      showLabel
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {vehicle.vehicle_number}
                        </p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${risk.bgColor} ${risk.color}`}>
                          {risk.emoji} {risk.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.model ?? 'Unknown model'}
                        {vehicle.last_seen && ` · ${formatRelativeTime(vehicle.last_seen)}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
