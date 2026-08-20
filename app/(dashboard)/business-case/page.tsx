import type { Metadata } from 'next';
import { ComparisonTable } from '@/components/business/comparison-table';
import { RoiMetrics } from '@/components/business/roi-metrics';
import { ValueProps } from '@/components/business/value-props';

export const metadata: Metadata = {
  title: 'Why SADAN? | Business Case',
  description: 'The MSME value proposition and business case for SADAN.',
};

export default function BusinessCasePage() {
  return (
    <div className="pb-16 max-w-4xl">
      {/* Opening Manifesto */}
      <div className="mb-16">
        <p className="sadan-label mb-6">The Proposition</p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight uppercase leading-[1.1] mb-8">
          SMEs Don&apos;t Need
          <br />
          More Dashboards.
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
          They need to understand what is happening inside their business —
          and what to do next.
        </p>
        <span className="sadan-accent-line mt-4" />
      </div>

      <hr className="sadan-divider my-12" />

      {/* Traditional vs SADAN */}
      <section className="mb-16">
        <p className="sadan-label mb-4">The Difference</p>
        <h2 className="text-2xl font-bold tracking-tight uppercase mb-8">
          SADAN vs Traditional GPS
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-lg">
          A paradigm shift from reactive location tracking to proactive behavioral intervention.
        </p>

        <div className="grid grid-cols-2 gap-0 border border-border" style={{ borderRadius: 'var(--radius)' }}>
          <div className="p-5 border-r border-b border-border">
            <p className="sadan-label mb-2">Traditional GPS</p>
            <p className="text-lg font-semibold">Track</p>
          </div>
          <div className="p-5 border-b border-border">
            <p className="sadan-label mb-2">SADAN</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-bauhaus-blue)' }}>Understand</p>
          </div>
          <div className="p-5 border-r border-b border-border">
            <p className="text-lg font-semibold">Record</p>
          </div>
          <div className="p-5 border-b border-border">
            <p className="text-lg font-semibold" style={{ color: 'var(--color-bauhaus-blue)' }}>Predict</p>
          </div>
          <div className="p-5 border-r border-b border-border">
            <p className="text-lg font-semibold">React</p>
          </div>
          <div className="p-5 border-b border-border">
            <p className="text-lg font-semibold" style={{ color: 'var(--color-bauhaus-blue)' }}>Simulate</p>
          </div>
          <div className="p-5 border-r border-border">
            <p className="text-lg font-semibold">Data</p>
          </div>
          <div className="p-5">
            <p className="text-lg font-semibold" style={{ color: 'var(--color-bauhaus-blue)' }}>Decision</p>
          </div>
        </div>
      </section>

      <hr className="sadan-divider my-12" />

      {/* MSME Challenge */}
      <section className="mb-16">
        <p className="sadan-label mb-4">The Challenge</p>
        <h2 className="text-2xl font-bold tracking-tight uppercase mb-4">
          The MSME Problem
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-lg">
          Traditional ADAS systems cost ₹1L+ per truck and require modern ECU integrations.
          Indian fleet owners need an affordable, retrofit solution.
        </p>
        <ValueProps />
      </section>

      <hr className="sadan-divider my-12" />

      {/* ROI */}
      <section>
        <p className="sadan-label mb-4">The Impact</p>
        <h2 className="text-2xl font-bold tracking-tight uppercase mb-4">
          Projected Business Impact
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-lg">
          Direct financial and operational benefits for a standard 20-truck fleet.
        </p>
        <RoiMetrics />
      </section>
    </div>
  );
}
