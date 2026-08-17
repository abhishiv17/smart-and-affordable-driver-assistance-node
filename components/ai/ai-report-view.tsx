'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, AlertTriangle, CheckCircle, ShieldAlert, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const riskColors = {
    LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse',
  };

  return (
    <div className="space-y-6">
      {!report && !loading && (
        <Card className="border-dashed bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Generate AI Intelligence</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              {type === 'DRIVER_ASSESSMENT' 
                ? 'Generate a personalized behavioral analysis and coaching plan for this driver based on their recent telemetry.' 
                : 'Our advanced Groq-powered AI will analyze the latest telemetry, alerts, and driver behavior to produce a comprehensive safety report.'}
            </p>
            <Button size="lg" onClick={generateReport} className="gap-2 font-semibold">
              <Zap className="h-4 w-4" /> Generate {type === 'DRIVER_ASSESSMENT' ? 'Driver Assessment' : 'Fleet Report'}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-6" />
            <h2 className="text-xl font-semibold tracking-tight mb-2">Analyzing Fleet Data...</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              The AI is currently processing millions of data points, cross-referencing recent alerts, and formulating actionable insights.
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-semibold">AI Generation Failed</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {report && !loading && (
        <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" /> Executive Summary
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Saved to Records
                    </Badge>
                    <Badge variant="outline" className={cn("text-sm font-bold border px-3 py-1 uppercase tracking-wider", riskColors[report.riskLevel])}>
                      {report.riskLevel} RISK
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {report.summary}
                </p>
              </CardContent>
            </Card>

            <h3 className="text-xl font-semibold tracking-tight mt-8 mb-4">Categorized Insights</h3>
            <div className="space-y-4">
              {report.insights.map((insight, idx) => (
                <Card key={idx} className="overflow-hidden border-l-4 border-l-primary bg-card/50 hover:bg-card/80 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-background">{insight.category}</Badge>
                          <span className={cn("text-xs font-semibold uppercase tracking-wider", 
                            insight.priority === 'HIGH' ? 'text-red-400' : 
                            insight.priority === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
                          )}>
                            {insight.priority} PRIORITY
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg">{insight.title}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                    <div className="bg-background/50 rounded-md p-3 border border-border/50 flex items-start gap-3">
                      <ShieldAlert className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm font-medium">{insight.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.keyFindings.map((finding, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs shrink-0">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Button variant="outline" className="w-full" onClick={generateReport}>
              Regenerate Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
