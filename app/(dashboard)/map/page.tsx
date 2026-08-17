import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LiveMap } from '@/components/realtime/live-map';

export const metadata: Metadata = {
  title: 'Fleet Map',
  description: 'Real-time GPS tracking of the entire fleet.',
};

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*');

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col -m-6 relative">
      {/* We use negative margin to make the map fill the main area completely */}
      <div className="p-4 bg-background/80 backdrop-blur-sm border-b absolute top-0 left-0 right-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Live Fleet Map
          </h1>
          <p className="text-xs text-muted-foreground">Real-time GPS tracking (Bangalore Hub)</p>
        </div>
      </div>
      
      <div className="flex-1 relative mt-[72px]">
        <LiveMap initialVehicles={vehicles ?? []} />
      </div>
    </div>
  );
}
