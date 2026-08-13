import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Intelligence',
  description: 'AI-generated safety insights and fleet intelligence reports.',
};

/**
 * AI Intelligence page.
 * Phase 2+: Will display AI-generated safety reports and actionable insights.
 */
export default function AIPage() {
  return (
    <>
      <PageHeader
        title="AI Intelligence"
        description="AI-generated safety insights powered by Groq"
      />

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Brain className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Safety Intelligence
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            AI-powered fleet safety analysis, driver risk assessments, trend
            reports, and actionable recommendations will be displayed here.
          </p>
          <p className="mt-4 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Coming in Phase 3
          </p>
        </CardContent>
      </Card>
    </>
  );
}
