import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/dashboard/section';
import { SafetyScoreRing } from '@/components/dashboard/safety-score-ring';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EmptyState } from '@/components/dashboard/empty-state';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { Truck, Activity, WifiOff, Wrench } from 'lucide-react';
import Link from 'next/link';
import { VehicleActions } from '@/components/admin/vehicle-actions';
import { VehicleRowActions } from '@/components/admin/vehicle-row-actions';

export const metadata: Metadata = {
  title: 'Vehicles',
  description: 'Manage and monitor all vehicles in your fleet.',
};

export const dynamic = 'force-dynamic';

export default async function VehiclesPage() {
  const supabase = await createClient();

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*, drivers(name), devices:devices!vehicles_device_id_fkey(device_serial, connectivity_status)')
    .order('vehicle_number', { ascending: true });

  if (error) {
    console.error('[vehicles page] Query error:', error.message);
  }

  const allVehicles = vehicles ?? [];
  const active = allVehicles.filter(v => v.status === 'ACTIVE').length;
  const idle = allVehicles.filter(v => v.status === 'IDLE').length;
  const offline = allVehicles.filter(v => v.status === 'OFFLINE').length;
  const maintenance = allVehicles.filter(v => v.status === 'MAINTENANCE').length;

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Manage and monitor all vehicles in your fleet"
        actions={<VehicleActions />}
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        <StatCard label="Active" value={active} icon={Truck} accentColor="text-emerald-400" />
        <StatCard label="Idle" value={idle} icon={Activity} accentColor="text-amber-400" />
        <StatCard label="Offline" value={offline} icon={WifiOff} accentColor="text-zinc-400" />
        <StatCard label="Maintenance" value={maintenance} icon={Wrench} accentColor="text-blue-400" />
      </div>

      <Section title="Fleet">
        {allVehicles.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No vehicles"
            description="Vehicles will appear here once the database is seeded."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Model</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Safety</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Device</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last Seen</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allVehicles.map((vehicle) => {
                  const driver = vehicle.drivers as { name: string } | null;
                  const device = vehicle.devices as { device_serial: string; connectivity_status: string } | null;

                  return (
                    <tr key={vehicle.id} className="border-b border-border/50 transition-colors hover:bg-muted/20 last:border-b-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/vehicles/${vehicle.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {vehicle.vehicle_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{vehicle.model ?? 'â€”'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{driver?.name ?? 'â€”'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge variant="vehicle" status={vehicle.status} dot={vehicle.status === 'ACTIVE'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <SafetyScoreRing score={vehicle.safety_score ?? 100} size={32} strokeWidth={3} showLabel={false} />
                          <span className="text-sm font-medium">{vehicle.safety_score ?? 100}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {device ? (
                          <StatusBadge
                            variant="device"
                            status={device.connectivity_status as 'ONLINE' | 'OFFLINE'}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">No device</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {vehicle.last_seen ? formatRelativeTime(vehicle.last_seen) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <VehicleRowActions vehicle={vehicle} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
