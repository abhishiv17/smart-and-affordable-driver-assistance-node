import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { OverviewDashboard } from '@/components/dashboard/overview/overview-dashboard';
import type { DbVehicle } from '@/types/database';

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Business health and fleet operations overview.',
};

export const dynamic = 'force-dynamic';

/**
 * Overview page — SSR fetches initial data, OverviewDashboard client component
 * handles realtime subscriptions and live UI updates.
 *
 * Digital Bauhaus Command Center — high information density with strong hierarchy.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const [vehiclesResult, alertsResult, devicesResult] = await Promise.all([
    supabase.from('vehicles').select('*'),
    supabase
      .from('alerts')
      .select('*, vehicles(vehicle_number)')
      .order('timestamp', { ascending: false })
      .limit(20),
    supabase.from('devices').select('connectivity_status'),
  ]);

  const vehicles: DbVehicle[] = vehiclesResult.data ?? [];
  const recentAlerts = alertsResult.data ?? [];
  const devices = devicesResult.data ?? [];
  const devicesOnline = devices.filter(d => d.connectivity_status === 'ONLINE').length;

  return (
    <OverviewDashboard
      initialVehicles={vehicles}
      initialAlerts={recentAlerts}
      initialDevicesOnline={devicesOnline}
      initialDevicesTotal={devices.length}
    />
  );
}
