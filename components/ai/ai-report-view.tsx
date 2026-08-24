'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Insight {
  category: string;
  priority: string;
  title: string;
  description: string;
  recommendation: string;
}

interface Report {
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyFindings: string[];
  recommendations: string[];
  insights: Insight[];
}

/**
 * AI Report View — Digital Bauhaus narrative format.
 * OBSERVATION → IMPACT → RECOMMENDATION → SIMULATE THIS
 */
export function AIReportView({ 
  type = 'FLEET_SAFETY_SUMMARY',
  driverId,
}: { 
  type?: 'FLEET_SAFETY_SUMMARY' | 'DRIVER_ASSESSMENT';
  driverId?: string;
}) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, driverId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate report');

      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const riskColors: Record<string, string> = {
    LOW: 'var(--color-sadan-success)',
    MEDIUM: 'var(--color-sadan-warning)',
    HIGH: 'var(--color-bauhaus-red)',
    CRITICAL: 'var(--color-sadan-critical)',
  };

  // ==========================================================================
  // Empty state — before generation
  // ==========================================================================
  if (!report && !loading) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <div className="flex h-12 w-12 items-center justify-center mx-auto mb-6 border border-border" style={{ borderRadius: 'var(--radius)' }}>
          <Brain className="h-6 w-6 text-foreground" />
        </div>
        <p className="sadan-label mb-3">What SADAN Sees</p>
        <h2 className="text-2xl font-bold tracking-tight uppercase mb-3">
          Generate Intelligence
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
          {type === 'DRIVER_ASSESSMENT' 
            ? 'Generate a behavioral analysis and coaching plan for this driver based on recent telemetry.' 
            : 'Analyze the latest telemetry, alerts, and driver behavior to produce actionable intelligence.'}
        </p>
        <Button onClick={generateReport} className="uppercase tracking-wider font-semibold">
          Generate {type === 'DRIVER_ASSESSMENT' ? 'Assessment' : 'Report'} →
        </Button>

        {error && (
          <div className="mt-6 flex items-start gap-2 text-sm text-left border border-border p-4" style={{ borderRadius: 'var(--radius)', color: 'var(--color-sadan-critical)' }}>
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Generation Failed</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // Loading state
  // ==========================================================================
  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-6 text-muted-foreground" />
        <p className="sadan-label mb-2">Analyzing</p>
        <p className="text-sm text-muted-foreground">
          Processing telemetry, cross-referencing alerts, formulating insights...
        </p>
      </div>
    );
  }

  // ==========================================================================
  // Report view — narrative format
  // ==========================================================================
  return (
    <div className="max-w-3xl">
      {/* Risk Level */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="sadan-status-dot"
          style={{ backgroundColor: riskColors[report!.riskLevel] }}
        />
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: riskColors[report!.riskLevel] }}
        >
          {report!.riskLevel} Risk
        </span>
      </div>

      {/* Summary */}
      <p className="sadan-label mb-2">What SADAN Sees</p>
      <p className="text-base leading-relaxed text-foreground mb-8 whitespace-pre-wrap">
        {report!.summary}
      </p>

      <hr className="sadan-divider my-8" />

      {/* Numbered Insights */}
      <div className="space-y-8">
        {report!.insights.map((insight, idx) => (
          <div key={idx}>
            <div className="flex items-start gap-3">
              <span className="sadan-nav-number font-mono text-base mt-0.5">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="sadan-label" style={{ color: 'var(--color-muted-gray)' }}>
                    {insight.category}
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{
                      color:
                        insight.priority === 'HIGH' ? 'var(--color-sadan-critical)' :
                        insight.priority === 'MEDIUM' ? 'var(--color-sadan-warning)' :
                        'var(--color-sadan-success)',
                    }}
                  >
                    {insight.priority}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2">{insight.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                <div className="border-l-2 pl-3 py-1" style={{ borderColor: 'var(--color-bauhaus-blue)' }}>
                  <p className="text-sm font-medium">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="sadan-divider my-8" />

      {/* Key Findings */}
      <div className="mb-8">
        <p className="sadan-label mb-4">Key Findings</p>
        <ul className="space-y-2">
          {report!.keyFindings.map((finding, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span className="text-foreground">—</span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <p className="sadan-label mb-4">Action Plan</p>
        <ul className="space-y-3">
          {report!.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs text-muted-foreground mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-medium">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <hr className="sadan-divider my-8" />

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link href="/simulator">
          <Button className="uppercase tracking-wider font-semibold">
            Simulate This →
          </Button>
        </Link>
        <Button variant="outline" onClick={generateReport} className="uppercase tracking-wider">
          Regenerate
        </Button>
      </div>
    </div>
  );
}
