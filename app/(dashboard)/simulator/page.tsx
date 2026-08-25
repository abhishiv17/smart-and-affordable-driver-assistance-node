import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { createClient } from '@/lib/supabase/server';
import { SimulatorClient } from '@/components/simulator/simulator-client';

export const metadata: Metadata = {
  title: 'Simulation',
  description: 'Simulate SADAN edge device telemetry for testing and demos.',
};

export const dynamic = 'force-dynamic';

export default async function SimulatorPage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .not('device_id', 'is', null)
    .order('vehicle_number', { ascending: true });

  return (
    <>
      <PageHeader
        title="Simulation"
        description="What happens when you change one decision?"
      />
      <SimulatorClient vehicles={vehicles ?? []} />
    </>
  );
}
