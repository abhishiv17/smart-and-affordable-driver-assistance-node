import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/dashboard/section';
import { StatCard } from '@/components/dashboard/stat-card';
import { SafetyScoreRing } from '@/components/dashboard/safety-score-ring';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EventIndicator } from '@/components/dashboard/event-indicator';
import { Timeline } from '@/components/dashboard/timeline';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import {
  formatRelativeTime,
  formatSpeed,
  formatCoordinates,
  formatDistance,
  formatDuration,
  formatDateTime,
} from '@/lib/utils/formatters';
import {
  MapPin,
  Gauge,
  Radio,
  User,
  AlertTriangle,
  Eye,
  ArrowDown,
  ArrowUp,
  Wifi,
  WifiOff,
  Clock,
  Route,
  Shield,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import type { DbAlert, DbTrip, DbTelemetry } from '@/types/database';

export const metadata: Metadata = {
  title: 'Vehicle Intelligence',
  description: 'Complete vehicle intelligence — state, safety, trips, and event history.',
};

export const dynamic = 'force-dynamic';

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const supabase = await createClient();

  // Parallel data fetches
  const [vehicleResult, alertsResult, telemetryResult, tripsResult, eventCountsResult] =
    await Promise.all([
      // Vehicle with joins
      supabase
        .from('vehicles')
        .select('*, drivers(id, name, status, phone), devices:devices!vehicles_device_id_fkey(device_serial, connectivity_status, firmware_version, last_seen)')
        .eq('id', vehicleId)
        .single(),

      // All alerts for this vehicle
      supabase
        .from('alerts')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('timestamp', { ascending: false })
        .limit(20),

      // Recent telemetry (expanded to 20)
      supabase
        .from('telemetry')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('timestamp', { ascending: false })
        .limit(20),

      // Trips for this vehicle
      supabase
        .from('trips')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('started_at', { ascending: false })
        .limit(10),

      // Safety event counts (non-NORMAL events)
      supabase
        .from('telemetry')
        .select('event_type')
        .eq('vehicle_id', vehicleId)
        .neq('event_type', 'NORMAL'),
    ]);

  if (vehicleResult.error || !vehicleResult.data) {
    notFound();
  }

  const vehicle = vehicleResult.data;
  const driver = vehicle.drivers as { id: string; name: string; status: string; phone: string | null } | null;
  const device = vehicle.devices as { device_serial: string; connectivity_status: string; firmware_version: string; last_seen: string | null } | null;
  const recentAlerts: DbAlert[] = alertsResult.data ?? [];
  const recentTelemetry: DbTelemetry[] = telemetryResult.data ?? [];
  const trips: DbTrip[] = tripsResult.data ?? [];
  const allSafetyEvents = eventCountsResult.data ?? [];

  // Count safety events by type
  const drowsinessCount = allSafetyEvents.filter(e => e.event_type === 'DROWSINESS').length;
  const harshBrakingCount = allSafetyEvents.filter(e => e.event_type === 'HARSH_BRAKING').length;
  const harshAccelCount = allSafetyEvents.filter(e => e.event_type === 'HARSH_ACCELERATION').length;
  const offlineCount = allSafetyEvents.filter(e => e.event_type === 'DEVICE_OFFLINE').length;

  // Trip stats
  const currentTrip = trips.find(t => !t.ended_at);
  const completedTrips = trips.filter(t => t.ended_at);
  const totalDistance = trips.reduce((sum, t) => sum + (t.distance ?? 0), 0);

  // Latest telemetry for "current speed"
  const latestTelemetry = recentTelemetry[0] ?? null;

  // Build timeline from alerts
  const timelineItems = recentAlerts.map(alert => ({
    id: alert.id,
    timestamp: alert.timestamp,
    title: alert.message,
    severity: alert.severity as 'INFO' | 'WARNING' | 'CRITICAL',
  }));

  return (
    <>
      {/* Header */}
      <PageHeader
        title={vehicle.vehicle_number}
        description={vehicle.model ?? 'Fleet vehicle'}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge variant="vehicle" status={vehicle.status} dot={vehicle.status === 'ACTIVE'} />
            {device && (
              <StatusBadge
                variant="device"
                status={device.connectivity_status as 'ONLINE' | 'OFFLINE'}
                dot={device.connectivity_status === 'ONLINE'}
              />
            )}
          </div>
        }
      />

      {/* ================================================================== */}
      {/* SECTION 1: Current State                                          */}
      {/* ================================================================== */}
      <Section title="Current State">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Safety Score — prominent */}
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <SafetyScoreRing score={vehicle.safety_score ?? 100} size={56} strokeWidth={4} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Safety</p>
                <p className="text-lg font-bold">{vehicle.safety_score ?? 100}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
              </div>
            </CardContent>
          </Card>

          <StatCard
            label="Speed"
            value={latestTelemetry ? formatSpeed(latestTelemetry.speed) : '—'}
            subtitle={vehicle.status === 'ACTIVE' ? 'Live' : 'Last known'}
            icon={Gauge}
            accentColor="text-emerald-400"
          />

          <StatCard
            label="Location"
            value={vehicle.latitude && vehicle.longitude
              ? formatCoordinates(vehicle.latitude, vehicle.longitude)
              : '—'}
            icon={MapPin}
            accentColor="text-blue-400"
          />

          <StatCard
            label="Driver"
            value={driver?.name ?? 'Unassigned'}
            subtitle={driver?.phone ?? undefined}
            icon={User}
            accentColor="text-violet-400"
          />

          <StatCard
            label="Last Seen"
            value={vehicle.last_seen ? formatRelativeTime(vehicle.last_seen) : '—'}
            subtitle={device ? `FW ${device.firmware_version}` : 'No device'}
            icon={Radio}
            accentColor="text-cyan-400"
          />
        </div>
      </Section>

      {/* ================================================================== */}
      {/* SECTION 2: Safety Breakdown                                       */}
      {/* ================================================================== */}
      <Section title="Safety Events" className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className={drowsinessCount > 0 ? 'border-red-500/20' : ''}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Eye className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Drowsiness</p>
                <p className="text-2xl font-bold text-foreground">{drowsinessCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={harshBrakingCount > 0 ? 'border-amber-500/20' : ''}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <ArrowDown className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Harsh Braking</p>
                <p className="text-2xl font-bold text-foreground">{harshBrakingCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={harshAccelCount > 0 ? 'border-amber-500/20' : ''}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <ArrowUp className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Harsh Accel</p>
                <p className="text-2xl font-bold text-foreground">{harshAccelCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={offlineCount > 0 ? 'border-zinc-500/20' : ''}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-500/10">
                <WifiOff className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-foreground">{offlineCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ================================================================== */}
      {/* SECTION 3: Trip Information                                        */}
      {/* ================================================================== */}
      <Section title="Trips" className="mt-6">
        {/* Current Trip Banner */}
        {currentTrip && (
          <Card className="border-emerald-500/20 bg-emerald-500/5 mb-3">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-400">Trip in Progress</p>
                <p className="text-xs text-muted-foreground">
                  Started {formatRelativeTime(currentTrip.started_at)}
                  {currentTrip.distance && ` · ${formatDistance(currentTrip.distance)}`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trip Stats */}
        <div className="grid gap-3 sm:grid-cols-3 mb-3">
          <StatCard label="Total Trips" value={trips.length} icon={Route} accentColor="text-emerald-400" />
          <StatCard label="Total Distance" value={formatDistance(totalDistance)} icon={MapPin} accentColor="text-blue-400" />
          <StatCard
            label="Avg Trip Score"
            value={completedTrips.length > 0
              ? `${Math.round(completedTrips.reduce((s, t) => s + (t.safety_score ?? 100), 0) / completedTrips.length)}`
              : '—'}
            icon={Shield}
            accentColor="text-cyan-400"
          />
        </div>

        {/* Trip Table */}
        {completedTrips.length === 0 ? (
          <EmptyState icon={Clock} title="No completed trips" description="Trip history will appear as trips are completed." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Started</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ended</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Distance</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Safety</th>
                </tr>
              </thead>
              <tbody>
                {completedTrips.map((trip) => {
                  const durationMin = trip.ended_at
                    ? (new Date(trip.ended_at).getTime() - new Date(trip.started_at).getTime()) / 60000
                    : null;

                  return (
                    <tr key={trip.id} className="border-b border-border/50 last:border-b-0">
                      <td className="px-3 py-2 text-muted-foreground">{formatDateTime(trip.started_at)}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {durationMin !== null ? formatDuration(durationMin) : '—'}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDistance(trip.distance)}</td>
                      <td className="px-3 py-2">
                        <span className={`font-semibold ${(trip.safety_score ?? 100) >= 80 ? 'text-emerald-400' : (trip.safety_score ?? 100) >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                          {trip.safety_score ?? '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ================================================================== */}
      {/* SECTION 4: History — Telemetry + Alert Timeline                    */}
      {/* ================================================================== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Telemetry Log */}
        <Section title="Telemetry Log" subtitle={`Last ${recentTelemetry.length} events`} className="lg:col-span-2">
          {recentTelemetry.length === 0 ? (
            <EmptyState
              icon={Gauge}
              title="No telemetry data"
              description="Telemetry events will appear here once the device starts sending data."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Event</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Speed</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">G-Force</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Drowsy</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">EAR</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Location</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTelemetry.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2">
                        <EventIndicator type={t.event_type} showLabel size="sm" />
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{formatSpeed(t.speed)}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <span className={t.g_force >= 0.5 ? 'text-amber-400 font-medium' : ''}>
                          {t.g_force.toFixed(2)}g
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={t.drowsiness_score >= 0.5 ? 'text-red-400 font-medium' : 'text-muted-foreground'}>
                          {(t.drowsiness_score * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{t.eye_aspect_ratio.toFixed(2)}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{formatCoordinates(t.latitude, t.longitude)}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{formatRelativeTime(t.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Alert Timeline */}
        <Section title="Event Timeline">
          {timelineItems.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No safety events"
              description="This vehicle has no safety alerts on record."
            />
          ) : (
            <Timeline items={timelineItems} />
          )}
        </Section>
      </div>
    </>
  );
}
