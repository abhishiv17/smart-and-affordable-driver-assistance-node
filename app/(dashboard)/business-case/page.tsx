import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { ComparisonTable } from '@/components/business/comparison-table'; // trigger ts cache
import { RoiMetrics } from '@/components/business/roi-metrics';
import { ValueProps } from '@/components/business/value-props';
import { ShieldAlert, TrendingDown, Cpu, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Why SADAN? | Business Case',
  description: 'The MSME value proposition and business case for SADAN.',
};

export default function BusinessCasePage() {
  return (
    <div className="pb-10">
      <PageHeader
        title="Why SADAN?"
        description="The Smart & Affordable Driver Assistance Node for Indian MSMEs."
      />
      
      <div className="mt-8 space-y-12 max-w-5xl">
        {/* Core Value Proposition Cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight">The MSME Challenge</h2>
            <p className="text-sm text-muted-foreground">
              Traditional ADAS systems cost ₹1L+ per truck and require modern ECU integrations. Indian fleet owners need an affordable, retrofit solution.
            </p>
          </div>
          <ValueProps />
        </section>

        {/* Comparison Table */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight">SADAN vs Traditional GPS Tracking</h2>
            <p className="text-sm text-muted-foreground">
              A paradigm shift from reactive location tracking to proactive behavioral intervention.
            </p>
          </div>
          <ComparisonTable />
        </section>

        {/* ROI and Business Impact */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Projected Business Impact (ROI)</h2>
            <p className="text-sm text-muted-foreground">
              Direct financial and operational benefits for a standard 20-truck fleet.
            </p>
          </div>
          <RoiMetrics />
        </section>
      </div>
    </div>
  );
}
