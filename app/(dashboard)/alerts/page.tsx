import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/dashboard/section';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EventIndicator } from '@/components/dashboard/event-indicator';
import { EmptyState } from '@/components/dashboard/empty-state';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import type { DbAlert } from '@/types/database';

export const metadata: Metadata = {
  title: 'Safety Alerts',
  description: 'Safety alerts and notifications for your fleet.',
};

export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
  const supabase = createAdminClient();

  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*, vehicles(vehicle_number), drivers(name)')
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[alerts page] Query error:', error.message);
  }

  const allAlerts = alerts ?? [];
  const criticalCount = allAlerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = allAlerts.filter(a => a.severity === 'WARNING').length;
  const unacknowledged = allAlerts.filter(a => !a.acknowledged).length;

  return (
    <>
      <PageHeader
        title="Safety Alerts"
        description="Real-time safety alerts and incident notifications"
      />

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatCard
          label="Critical"
          value={criticalCount}
          icon={AlertTriangle}
          accentColor="text-red-400"
        />
        <StatCard
          label="Warning"
          value={warningCount}
          icon={Bell}
          accentColor="text-amber-400"
        />
        <StatCard
          label="Unacknowledged"
          value={unacknowledged}
          icon={CheckCircle}
          accentColor="text-blue-400"
        />
      </div>

      <Section title="Alert Feed">
        {allAlerts.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No alerts"
            description="Safety alerts will appear here as telemetry events are processed."
          />
        ) : (
          <div className="space-y-2">
            {allAlerts.map((alert: DbAlert & { vehicles?: { vehicle_number: string } | null; drivers?: { name: string } | null }) => (
              <Card
                key={alert.id}
                className={`transition-colors hover:bg-muted/30 ${!alert.acknowledged ? 'border-l-2 border-l-amber-500/50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <EventIndicator type={alert.type} showLabel={false} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">
                          {alert.message}
                        </p>
                        <StatusBadge variant="severity" status={alert.severity} />
                        {!alert.acknowledged && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>{alert.vehicles?.vehicle_number ?? 'Unknown vehicle'}</span>
                        {alert.drivers?.name && (
                          <>
                            <span>·</span>
                            <span>{alert.drivers.name}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatRelativeTime(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
