'use client';

import { useRealtimeAlerts } from '@/hooks/use-realtime-alerts';
import { useRealtimeVehicles } from '@/hooks/use-realtime-vehicles';
import { useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Section } from '@/components/dashboard/section';
import { SafetyScoreRing } from '@/components/dashboard/safety-score-ring';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EventIndicator } from '@/components/dashboard/event-indicator';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Card, CardContent } from '@/components/ui/card';
import {
  Truck,
  Shield,
  AlertTriangle,
  Activity,
  Radio,
} from 'lucide-react';
import Link from 'next/link';
import type { DbVehicle, DbAlert } from '@/types/database';

interface LiveDashboardProps {
  initialVehicles: DbVehicle[];
  initialAlerts: (DbAlert & { vehicles?: { vehicle_number: string } | null })[];
  initialDevicesOnline: number;
  initialDevicesTotal: number;
}

/**
 * Client-side dashboard wrapper that subscribes to realtime updates.
 * Receives SSR data as props, then merges live changes from Supabase Realtime.
 */
export function LiveDashboard({
  initialVehicles,
  initialAlerts,
  initialDevicesOnline,
  initialDevicesTotal,
}: LiveDashboardProps) {
  const { vehicles } = useRealtimeVehicles(initialVehicles);
  const { alerts, latestNewAlert } = useRealtimeAlerts(initialAlerts);

  // Compute live fleet stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const offlineVehicles = vehicles.filter(v => v.status === 'OFFLINE').length;
  const avgSafetyScore = vehicles.length > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.safety_score ?? 100), 0) / vehicles.length)
    : 100;
  const criticalAlerts = alerts.filter(
    a => a.severity === 'CRITICAL' && !a.acknowledged
  ).length;

  return (
    <>
      {/* KPI Stats Row */}
      <Section title="Fleet Overview">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Vehicles"
            value={totalVehicles}
            subtitle={`${activeVehicles} active`}
            icon={Truck}
            accentColor="text-emerald-400"
          />
          <StatCard
            label="Fleet Safety"
            value={`${avgSafetyScore}/100`}
            subtitle={avgSafetyScore >= 80 ? 'Good standing' : 'Needs attention'}
            icon={Shield}
            accentColor={avgSafetyScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}
          />
          <StatCard
            label="Active Alerts"
            value={criticalAlerts}
            subtitle={criticalAlerts > 0 ? 'Requires action' : 'All clear'}
            icon={AlertTriangle}
            accentColor={criticalAlerts > 0 ? 'text-red-400' : 'text-emerald-400'}
          />
          <StatCard
            label="Devices Online"
            value={`${initialDevicesOnline}/${initialDevicesTotal}`}
            subtitle={offlineVehicles > 0 ? `${offlineVehicles} offline` : 'All connected'}
            icon={Radio}
            accentColor="text-blue-400"
          />
          <StatCard
            label="Events Today"
            value={alerts.length}
            subtitle="Recent events"
            icon={Activity}
            accentColor="text-violet-400"
          />
        </div>
      </Section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Vehicle Status Grid — live */}
        <Section title="Vehicle Fleet" className="lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2">
            {vehicles.slice(0, 6).map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="block"
              >
                <Card className="transition-colors hover:bg-muted/30">
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
                        <StatusBadge variant="vehicle" status={vehicle.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.model ?? 'Unknown model'}
                        {vehicle.last_seen && ` · ${formatRelativeTime(vehicle.last_seen)}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {vehicles.length > 6 && (
            <Link
              href="/vehicles"
              className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all {vehicles.length} vehicles →
            </Link>
          )}
        </Section>

        {/* Recent Alerts — live */}
        <Section title="Recent Alerts">
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center py-8">
                  <Shield className="h-6 w-6 text-emerald-400 mb-2" />
                  <p className="text-xs text-muted-foreground">No recent alerts</p>
                </CardContent>
              </Card>
            ) : (
              alerts.slice(0, 6).map((alert) => {
                const vehicleNumber = (alert as DbAlert & { vehicles?: { vehicle_number: string } | null }).vehicles?.vehicle_number;

                return (
                  <Card key={alert.id} className="transition-colors hover:bg-muted/30 animate-in fade-in-0 duration-300">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <EventIndicator
                          type={alert.type}
                          showLabel={false}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-foreground truncate">
                              {alert.message}
                            </p>
                            <StatusBadge variant="severity" status={alert.severity} />
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {vehicleNumber ?? 'Unknown'} · {formatRelativeTime(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
            {alerts.length > 6 && (
              <Link
                href="/alerts"
                className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all alerts →
              </Link>
            )}
          </div>
        </Section>
      </div>
    </>
  );
}
