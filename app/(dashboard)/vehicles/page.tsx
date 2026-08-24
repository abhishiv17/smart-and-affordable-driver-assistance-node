import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EmptyState } from '@/components/dashboard/empty-state';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Truck } from 'lucide-react';
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
        title="Fleet"
        description={`${allVehicles.length} vehicles in your fleet`}
        actions={<VehicleActions />}
      />

      {/* Stats strip */}
      <div className="flex items-center gap-8 mb-8">
        <div className="flex items-center gap-2">
          <span className="sadan-status-dot sadan-status-dot--online" />
          <span className="text-sm font-medium">{active} Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="sadan-status-dot sadan-status-dot--warning" />
          <span className="text-sm font-medium">{idle} Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="sadan-status-dot sadan-status-dot--offline" />
          <span className="text-sm font-medium">{offline} Offline</span>
        </div>
        {maintenance > 0 && (
          <div className="flex items-center gap-2">
            <span className="sadan-status-dot" style={{ backgroundColor: 'var(--color-bauhaus-blue)' }} />
            <span className="text-sm font-medium">{maintenance} Maintenance</span>
          </div>
        )}
      </div>

      <hr className="sadan-divider mb-6" />

      {allVehicles.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No vehicles"
          description="Vehicles will appear here once the database is seeded."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 sadan-label">Vehicle</th>
                <th className="text-left py-3 pr-4 sadan-label">Model</th>
                <th className="text-left py-3 pr-4 sadan-label">Driver</th>
                <th className="text-left py-3 pr-4 sadan-label">Status</th>
                <th className="text-left py-3 pr-4 sadan-label">Health</th>
                <th className="text-left py-3 pr-4 sadan-label">Device</th>
                <th className="text-left py-3 pr-4 sadan-label">Last Seen</th>
                <th className="text-right py-3 sadan-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allVehicles.map((vehicle) => {
                const driver = vehicle.drivers as { name: string } | null;
                const device = vehicle.devices as { device_serial: string; connectivity_status: string } | null;

                return (
                  <tr key={vehicle.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="font-mono font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {vehicle.vehicle_number}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{vehicle.model ?? '—'}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{driver?.name ?? '—'}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge variant="vehicle" status={vehicle.status} dot={vehicle.status === 'ACTIVE'} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono font-semibold">{vehicle.safety_score ?? 100}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {device ? (
                        <StatusBadge
                          variant="device"
                          status={device.connectivity_status as 'ONLINE' | 'OFFLINE'}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No device</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {vehicle.last_seen ? formatRelativeTime(vehicle.last_seen) : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <VehicleRowActions vehicle={vehicle} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
