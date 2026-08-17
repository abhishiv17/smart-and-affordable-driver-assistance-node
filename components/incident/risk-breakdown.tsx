import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Activity, AlertCircle, TrendingUp } from 'lucide-react';
import type { IncidentAnalysis } from '@/lib/safety/incident-intelligence';

interface RiskBreakdownProps {
  analysis: IncidentAnalysis;
}

export function RiskBreakdown({ analysis }: RiskBreakdownProps) {
  const { alert, baseDeduction, contributingFactors, totalDeduction, isCompoundRisk } = analysis;

  return (
    <Card className={isCompoundRisk ? 'border-red-500/20' : 'border-amber-500/20'}>
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          {isCompoundRisk ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          <CardTitle className="text-sm font-semibold">Risk Engine Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Base Factor */}
        <div className="flex items-start justify-between gap-4 border border-border/50 rounded-lg p-3 bg-background">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-500/10 p-1.5">
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{analysis.primaryFactor}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Base penalty for this event type.</p>
            </div>
          </div>
          <div className="text-sm font-semibold text-amber-500">-{baseDeduction} pts</div>
        </div>

        {/* Compound Factors */}
        {contributingFactors.map((factor, idx) => (
          <div key={idx} className="flex items-start justify-between gap-4 border border-red-500/20 rounded-lg p-3 bg-red-500/5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-500/10 p-1.5">
                <TrendingUp className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-400">{factor.name}</p>
                <p className="text-xs text-red-400/70 mt-0.5">{factor.description}</p>
              </div>
            </div>
            <div className="text-sm font-semibold text-red-400">×{factor.multiplier}</div>
          </div>
        ))}

        {/* Divider if compound */}
        {isCompoundRisk && <div className="border-t border-border/50 my-2" />}

        {/* Total */}
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Total Safety Impact</span>
          <span className={`text-lg font-bold ${isCompoundRisk ? 'text-red-500' : 'text-amber-500'}`}>
            -{totalDeduction} pts
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
