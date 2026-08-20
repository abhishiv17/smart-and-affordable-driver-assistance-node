import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { LiveDashboard } from '@/components/realtime/live-dashboard';
import type { DbVehicle } from '@/types/database';

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Business health and fleet operations overview.',
};

export const dynamic = 'force-dynamic';

/**
 * Overview page — SSR fetches initial data, LiveDashboard client component
 * handles realtime subscriptions and live UI updates.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const [vehiclesResult, alertsResult, devicesResult] = await Promise.all([
    supabase.from('vehicles').select('*'),
    supabase
      .from('alerts')
      .select('*, vehicles(vehicle_number)')
      .order('timestamp', { ascending: false })
      .limit(8),
    supabase.from('devices').select('connectivity_status'),
  ]);

  const vehicles: DbVehicle[] = vehiclesResult.data ?? [];
  const recentAlerts = alertsResult.data ?? [];
  const devices = devicesResult.data ?? [];
  const devicesOnline = devices.filter(d => d.connectivity_status === 'ONLINE').length;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Business health and fleet operations at a glance"
      />
      <LiveDashboard
        initialVehicles={vehicles}
        initialAlerts={recentAlerts}
        initialDevicesOnline={devicesOnline}
        initialDevicesTotal={devices.length}
      />
    </>
  );
}
