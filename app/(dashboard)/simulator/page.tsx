import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { createClient } from '@/lib/supabase/server';
import { SimulatorClient } from '@/components/simulator/simulator-client';

export const metadata: Metadata = {
  title: 'Device Simulator',
  description: 'Simulate SADAN edge device telemetry for testing and demos.',
};

export const dynamic = 'force-dynamic';

export default async function SimulatorPage() {
  const supabase = await createClient();

  // Fetch all vehicles that have an assigned device_id
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .not('device_id', 'is', null)
    .order('vehicle_number', { ascending: true });

  return (
    <>
      <PageHeader
        title="Device Simulator"
        description="Emulate a physical SADAN edge device sending telemetry to the cloud"
      />
      <SimulatorClient vehicles={vehicles ?? []} />
    </>
  );
}
