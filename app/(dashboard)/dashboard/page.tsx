import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Fleet safety overview and real-time monitoring dashboard.',
};

/**
 * Main dashboard page — fleet safety overview.
 * Phase 2+: Will display live fleet metrics, safety scores, recent alerts, and map.
 */
export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Fleet safety overview and real-time monitoring"
      />

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Fleet Dashboard
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Real-time fleet safety metrics, vehicle map, safety scores, and
            recent alerts will be displayed here.
          </p>
          <p className="mt-4 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Coming in Phase 2
          </p>
        </CardContent>
      </Card>
    </>
  );
}
