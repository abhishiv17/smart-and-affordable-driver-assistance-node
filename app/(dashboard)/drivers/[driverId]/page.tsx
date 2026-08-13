import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Driver Details',
  description: 'Detailed driver information, safety profile, and trip history.',
};

/**
 * Individual driver detail page.
 * Phase 2+: Will display driver safety profile, trip history, and analytics.
 */
export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;

  return (
    <>
      <PageHeader
        title="Driver Profile"
        description={`Driver ID: ${driverId}`}
      />

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Driver Safety Profile
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Safety score, trip history, driving behavior analysis, and
            performance trends for this driver will be displayed here.
          </p>
          <p className="mt-4 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Coming in Phase 2
          </p>
        </CardContent>
      </Card>
    </>
  );
}
