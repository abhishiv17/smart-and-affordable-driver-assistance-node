import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EmptyState } from '@/components/dashboard/empty-state';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Users } from 'lucide-react';
import Link from 'next/link';
import { DriverActions } from '@/components/admin/driver-actions';
import { DriverRowActions } from '@/components/admin/driver-row-actions';

export const metadata: Metadata = {
  title: 'Drivers',
  description: 'Manage and monitor all drivers in your fleet.',
};

export const dynamic = 'force-dynamic';

export default async function DriversPage() {
  const supabase = await createClient();

  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[drivers page] Query error:', error.message);
  }

  const allDrivers = drivers ?? [];
  const activeDrivers = allDrivers.filter(d => d.status === 'ACTIVE').length;
  const inactiveDrivers = allDrivers.filter(d => d.status === 'INACTIVE').length;
  const suspendedDrivers = allDrivers.filter(d => d.status === 'SUSPENDED').length;

  return (
    <>
      <PageHeader
        title="Drivers"
        description={`${allDrivers.length} drivers in your fleet`}
        actions={<DriverActions />}
      />

      {/* Stats strip */}
      <div className="flex items-center gap-8 mb-8">
        <div className="flex items-center gap-2">
          <span className="sadan-status-dot sadan-status-dot--online" />
          <span className="text-sm font-medium">{activeDrivers} Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="sadan-status-dot sadan-status-dot--offline" />
          <span className="text-sm font-medium">{inactiveDrivers} Inactive</span>
        </div>
        {suspendedDrivers > 0 && (
          <div className="flex items-center gap-2">
            <span className="sadan-status-dot sadan-status-dot--critical" />
            <span className="text-sm font-medium">{suspendedDrivers} Suspended</span>
          </div>
        )}
      </div>

      <hr className="sadan-divider mb-6" />

      {allDrivers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No drivers"
          description="Drivers will appear here once the database is seeded."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 sadan-label">Name</th>
                <th className="text-left py-3 pr-4 sadan-label">Phone</th>
                <th className="text-left py-3 pr-4 sadan-label">Status</th>
                <th className="text-left py-3 pr-4 sadan-label">Joined</th>
                <th className="text-right py-3 sadan-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allDrivers.map((driver) => (
                <tr key={driver.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/drivers/${driver.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {driver.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">{driver.phone ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge variant="driver" status={driver.status} dot={driver.status === 'ACTIVE'} />
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">
                    {formatRelativeTime(driver.created_at)}
                  </td>
                  <td className="py-3 text-right">
                    <DriverRowActions driver={driver} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
