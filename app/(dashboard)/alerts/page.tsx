import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Alerts',
  description: 'Safety alerts and notifications for your fleet.',
};

/**
 * Safety alerts page.
 * Phase 2+: Will display real-time safety alerts with filtering and severity.
 */
export default function AlertsPage() {
  return (
    <>
      <PageHeader
        title="Safety Alerts"
        description="Real-time safety alerts and incident notifications"
      />

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Safety Alert Center
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Real-time safety alerts including drowsiness detection, harsh
            braking, speeding, and device status changes will be displayed here.
          </p>
          <p className="mt-4 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Coming in Phase 2
          </p>
        </CardContent>
      </Card>
    </>
  );
}
