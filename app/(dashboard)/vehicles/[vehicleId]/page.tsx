import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vehicle Details',
  description: 'Detailed vehicle information, telemetry, and safety data.',
};

/**
 * Individual vehicle detail page.
 * Phase 2+: Will display vehicle telemetry, trips, safety history, and live map.
 */
export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;

  return (
    <>
      <PageHeader
        title="Vehicle Details"
        description={`Vehicle ID: ${vehicleId}`}
      />

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Truck className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Vehicle Telemetry & Safety
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Live telemetry, trip history, safety events, device status, and
            location tracking for this vehicle will be displayed here.
          </p>
          <p className="mt-4 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Coming in Phase 2
          </p>
        </CardContent>
      </Card>
    </>
  );
}
