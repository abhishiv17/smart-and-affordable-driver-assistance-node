import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LiveMap } from '@/components/realtime/live-map';

export const metadata: Metadata = {
  title: 'Live Map',
  description: 'Real-time GPS tracking of the entire fleet.',
};

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*');

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col -mx-8 -my-6 relative">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4">
        <div className="bg-background/90 backdrop-blur-sm border border-border px-4 py-2.5" style={{ borderRadius: 'var(--radius)' }}>
          <h1 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Live Fleet
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {vehicles?.length ?? 0} Vehicles — Bangalore Hub
          </p>
        </div>
      </div>

      {/* Full-bleed map */}
      <div className="flex-1 relative">
        <LiveMap initialVehicles={vehicles ?? []} />
      </div>
    </div>
  );
}
