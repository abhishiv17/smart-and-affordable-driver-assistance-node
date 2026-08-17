import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageHeader } from '@/components/layout/page-header';
import { LiveAlertFeed } from '@/components/realtime/live-alert-feed';

export const metadata: Metadata = {
  title: 'Safety Alerts',
  description: 'Safety alerts and notifications for your fleet.',
};

export const dynamic = 'force-dynamic';

/**
 * Alerts page — SSR fetches initial alerts, LiveAlertFeed client component
 * handles realtime subscriptions for live alert updates.
 */
export default async function AlertsPage() {
  const supabase = createAdminClient();

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*, vehicles(vehicle_number), drivers(name)')
    .order('timestamp', { ascending: false })
    .limit(50);

  return (
    <>
      <PageHeader
        title="Safety Alerts"
        description="Real-time safety alerts and incident notifications"
      />
      <LiveAlertFeed initialAlerts={alerts ?? []} />
    </>
  );
}
