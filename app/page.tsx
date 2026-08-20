import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SADAN — Run Your Business With Clarity',
  description:
    'SADAN brings business intelligence, operational visibility and decision simulation into one intelligent workspace.',
};

/**
 * SADAN Homepage — Digital Bauhaus editorial landing.
 * Exists before authentication. Communicates the product
 * through SEE → SIMULATE → ACT narrative.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ================================================================= */}
      {/* Navigation */}
      {/* ================================================================= */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-border">
        <h1 className="text-sm font-bold tracking-[0.2em] uppercase">SADAN</h1>
        <Link
          href="/login"
          className="text-xs font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
        >
          Enter SADAN →
        </Link>
      </nav>

      {/* ================================================================= */}
      {/* Hero */}
      {/* ================================================================= */}
      <section className="px-8 pt-20 pb-24 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Message */}
          <div>
            <p className="sadan-label mb-6">Smart & Affordable Driver Assistance Node</p>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] uppercase">
              Run Your
              <br />
              Business With
              <br />
              <span style={{ color: 'var(--color-bauhaus-blue)' }}>Clarity.</span>
            </h2>
            <p className="mt-8 text-lg text-muted-foreground max-w-md leading-relaxed">
              SADAN brings business intelligence, operational visibility
              and decision simulation into one intelligent workspace.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-foreground/90 transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Enter SADAN →
              </Link>
              <a
                href="#philosophy"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                Explore the System ↓
              </a>
            </div>
          </div>

          {/* Right — Live Mini Dashboard Preview */}
          <div className="border border-border p-6 bg-card" style={{ borderRadius: 'var(--radius)' }}>
            <p className="sadan-label mb-4">Business Health</p>
            <div className="sadan-metric sadan-metric-lg sadan-animate-in">84</div>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-sadan-success)' }}>
              Good
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ↑ 12.4% from last month
            </p>

            <hr className="sadan-divider my-6" />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="sadan-label">Revenue</p>
                <p className="sadan-metric sadan-metric-sm mt-1">₹8.4L</p>
              </div>
              <div>
                <p className="sadan-label">Cash Flow</p>
                <p className="sadan-metric sadan-metric-sm mt-1">₹4.2L</p>
              </div>
              <div>
                <p className="sadan-label">Risk</p>
                <p className="sadan-metric sadan-metric-sm mt-1" style={{ color: 'var(--color-sadan-success)' }}>LOW</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Philosophy — SEE → SIMULATE → ACT */}
      {/* ================================================================= */}
      <section id="philosophy" className="border-t border-border px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="sadan-label mb-4">Product Philosophy</p>
          <h2 className="text-3xl font-bold tracking-tight uppercase mb-16">
            See → Simulate → Act
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* SEE */}
            <div>
              <span className="sadan-nav-number font-mono text-lg block mb-2">01</span>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4" style={{ color: 'var(--color-bauhaus-blue)' }}>
                See
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Understand your entire business at a glance. Revenue, cash flow,
                inventory, risk — all in one view.
              </p>
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-mono font-semibold">₹8.4L</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cash Flow</span>
                  <span className="font-mono font-semibold">₹4.2L</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inventory</span>
                  <span className="font-mono font-semibold">82%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--color-sadan-success)' }}>LOW</span>
                </div>
              </div>
            </div>

            {/* SIMULATE */}
            <div>
              <span className="sadan-nav-number font-mono text-lg block mb-2">02</span>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4" style={{ color: 'var(--color-bauhaus-yellow)' }}>
                Simulate
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Change a decision. See what happens. Test inventory allocation,
                pricing, and driver behavior in real time.
              </p>
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue Impact</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--color-sadan-success)' }}>+14%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cash Flow</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--color-sadan-critical)' }}>-8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--color-sadan-warning)' }}>MEDIUM</span>
                </div>
              </div>
            </div>

            {/* ACT */}
            <div>
              <span className="sadan-nav-number font-mono text-lg block mb-2">03</span>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4" style={{ color: 'var(--color-bauhaus-red)' }}>
                Act
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Turn insight into the next move. SADAN recommends actions
                with projected business impact.
              </p>
              <div className="border-t border-border pt-4 space-y-3">
                <div className="border border-border p-3" style={{ borderRadius: 'var(--radius)' }}>
                  <p className="sadan-label mb-1">SADAN Recommends</p>
                  <p className="text-sm font-medium">
                    Reduce inventory allocation by 12%.
                  </p>
                </div>
                <div>
                  <p className="sadan-label mb-1">Expected Impact</p>
                  <p className="sadan-metric sadan-metric-sm" style={{ color: 'var(--color-sadan-success)' }}>
                    +₹46,000
                  </p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Comparison — Traditional vs SADAN */}
      {/* ================================================================= */}
      <section className="border-t border-border px-8 py-24 bg-card">
        <div className="max-w-4xl mx-auto">
          <p className="sadan-label mb-4">Why SADAN?</p>
          <h2 className="text-3xl font-bold tracking-tight uppercase mb-12">
            SMEs Don&apos;t Need<br />More Dashboards.
          </h2>
          <p className="text-muted-foreground mb-12 max-w-lg">
            They need to understand what is happening inside their business — and what to do next.
          </p>

          <div className="grid grid-cols-2 gap-0 border border-border" style={{ borderRadius: 'var(--radius)' }}>
            <div className="p-6 border-r border-b border-border">
              <p className="sadan-label mb-3">Traditional GPS</p>
              <p className="text-lg font-semibold">Track</p>
            </div>
            <div className="p-6 border-b border-border">
              <p className="sadan-label mb-3">SADAN</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--color-bauhaus-blue)' }}>Understand</p>
            </div>
            <div className="p-6 border-r border-b border-border">
              <p className="text-lg font-semibold">Record</p>
            </div>
            <div className="p-6 border-b border-border">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-bauhaus-blue)' }}>Predict</p>
            </div>
            <div className="p-6 border-r border-b border-border">
              <p className="text-lg font-semibold">React</p>
            </div>
            <div className="p-6 border-b border-border">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-bauhaus-blue)' }}>Simulate</p>
            </div>
            <div className="p-6 border-r border-border">
              <p className="text-lg font-semibold">Data</p>
            </div>
            <div className="p-6">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-bauhaus-blue)' }}>Decision</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA */}
      {/* ================================================================= */}
      <section className="border-t border-border px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight uppercase mb-6">
            Your Business.
            <br />
            One Intelligent Space.
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">
            See everything. Simulate anything. Act with confidence.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            Enter SADAN →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            SADAN — Smart & Affordable Driver Assistance Node
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            MSME Hackathon 6.0
          </p>
        </div>
      </footer>
    </div>
  );
}
