import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/dashboard/section';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Timeline } from '@/components/dashboard/timeline';
import { EmptyState } from '@/components/dashboard/empty-state';
import { AIReportView } from '@/components/ai/ai-report-view';
import { Card, CardContent } from '@/components/ui/card';
import { formatRelativeTime, formatDistance } from '@/lib/utils/formatters';
import {
  User,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { DbAlert, DbTrip } from '@/types/database';

export const metadata: Metadata = {
  title: 'Driver Details',
  description: 'Detailed driver information, safety profile, and trip history.',
};

export const dynamic = 'force-dynamic';

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;
  const supabase = createAdminClient();

  // Fetch driver
  const { data: driver, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', driverId)
    .single();

  if (error || !driver) {
    notFound();
  }

  // Fetch assigned vehicle
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, vehicle_number, status, safety_score')
    .eq('driver_id', driverId);

  // Fetch trips
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('driver_id', driverId)
    .order('started_at', { ascending: false })
    .limit(10);

  // Fetch alerts for this driver
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*, vehicles(vehicle_number)')
    .eq('driver_id', driverId)
    .order('timestamp', { ascending: false })
    .limit(10);

  const assignedVehicles = vehicles ?? [];
  const driverTrips: DbTrip[] = trips ?? [];
  const driverAlerts: (DbAlert & { vehicles?: { vehicle_number: string } | null })[] = alerts ?? [];

  const totalDistance = driverTrips.reduce((sum, t) => sum + (t.distance ?? 0), 0);
  const avgTripScore = driverTrips.length > 0
    ? Math.round(driverTrips.reduce((sum, t) => sum + (t.safety_score ?? 100), 0) / driverTrips.length)
    : null;

  // Timeline from alerts
  const timelineItems = driverAlerts.map(alert => ({
    id: alert.id,
    timestamp: alert.timestamp,
    title: alert.message,
    description: alert.vehicles?.vehicle_number ?? undefined,
    severity: alert.severity as 'INFO' | 'WARNING' | 'CRITICAL',
  }));

  return (
    <>
      <PageHeader
        title={driver.name}
        description="Driver profile"
        actions={
          <StatusBadge variant="driver" status={driver.status} dot={driver.status === 'ACTIVE'} />
        }
      />

      {/* Info Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Phone"
          value={driver.phone ?? '—'}
          icon={Phone}
          accentColor="text-blue-400"
        />
        <StatCard
          label="Assigned Vehicle"
          value={assignedVehicles.length > 0 ? assignedVehicles[0].vehicle_number : 'None'}
          icon={MapPin}
          accentColor="text-violet-400"
        />
        <StatCard
          label="Total Trips"
          value={driverTrips.length}
          subtitle={totalDistance > 0 ? formatDistance(totalDistance) : undefined}
          icon={Clock}
          accentColor="text-emerald-400"
        />
        <StatCard
          label="Current Safety Score"
          value={assignedVehicles.length > 0 && assignedVehicles[0].safety_score !== null ? `${assignedVehicles[0].safety_score}/100` : '—'}
          subtitle={assignedVehicles.length > 0 && assignedVehicles[0].safety_score !== null 
            ? assignedVehicles[0].safety_score < 50 ? 'High Risk' : assignedVehicles[0].safety_score < 80 ? 'Medium Risk' : 'Low Risk'
            : undefined}
          icon={User}
          accentColor={
            assignedVehicles.length > 0 && assignedVehicles[0].safety_score !== null
              ? assignedVehicles[0].safety_score < 50 ? 'text-red-500' : assignedVehicles[0].safety_score < 80 ? 'text-yellow-500' : 'text-emerald-500'
              : 'text-cyan-400'
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trip History */}
        <Section title="Trip History" className="lg:col-span-2">
          {driverTrips.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No trips"
              description="Trip history will appear here as trips are completed."
            />
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
                  {driverTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-border/50 last:border-b-0">
                      <td className="px-3 py-2 text-muted-foreground">{formatRelativeTime(trip.started_at)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{trip.ended_at ? formatRelativeTime(trip.ended_at) : 'In progress'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDistance(trip.distance)}</td>
                      <td className="px-3 py-2 font-medium">{trip.safety_score ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Alert Timeline */}
        <Section title="Alert History">
          {timelineItems.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No alerts"
              description="This driver has no safety alerts."
            />
          ) : (
            <Timeline items={timelineItems} />
          )}
        </Section>
      </div>

      {/* AI Coaching Section */}
      <div className="mt-6">
        <Section title="AI Safety Coach">
          <AIReportView type="DRIVER_ASSESSMENT" driverId={driverId} />
        </Section>
      </div>
    </>
  );
}
