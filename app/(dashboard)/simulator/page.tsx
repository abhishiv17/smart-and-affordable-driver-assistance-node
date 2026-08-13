import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Radio } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Device Simulator',
  description: 'Simulate DriverGuard edge device telemetry for testing and demos.',
};

/**
 * Device Simulator page.
 * Phase 2+: Will simulate telemetry from the ARM edge device for testing,
 * development, and presentation/demo purposes.
 */
export default function SimulatorPage() {
  return (
    <>
      <PageHeader
        title="Device Simulator"
        description="Simulate DriverGuard edge device telemetry"
      />

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Radio className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Edge Device Simulator
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Simulate telemetry from the DriverGuard ARM edge device including
            GPS, IMU, drowsiness detection, and network state changes.
            The simulator will be replaced by the physical device in production.
          </p>
          <p className="mt-4 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Coming in Phase 3
          </p>
        </CardContent>
      </Card>
    </>
  );
}
