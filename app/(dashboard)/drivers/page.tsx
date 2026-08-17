import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/dashboard/section';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EmptyState } from '@/components/dashboard/empty-state';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Users, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Drivers',
  description: 'Manage and monitor all drivers in your fleet.',
};

export const dynamic = 'force-dynamic';

export default async function DriversPage() {
  const supabase = createAdminClient();

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
        description="Manage and monitor all drivers in your fleet"
      />

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatCard label="Active" value={activeDrivers} icon={UserCheck} accentColor="text-emerald-400" />
        <StatCard label="Inactive" value={inactiveDrivers} icon={Users} accentColor="text-zinc-400" />
        <StatCard label="Suspended" value={suspendedDrivers} icon={UserX} accentColor="text-red-400" />
      </div>

      <Section title="All Drivers">
        {allDrivers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No drivers"
            description="Drivers will appear here once the database is seeded."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {allDrivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-border/50 transition-colors hover:bg-muted/20 last:border-b-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/drivers/${driver.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {driver.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{driver.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant="driver" status={driver.status} dot={driver.status === 'ACTIVE'} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatRelativeTime(driver.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
