import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { AIReportView } from '@/components/ai/ai-report-view';

export const metadata: Metadata = {
  title: 'Intelligence',
  description: 'AI-generated safety insights and fleet intelligence reports.',
};

export default function AIPage() {
  return (
    <>
      <PageHeader
        title="Intelligence"
        description="What SADAN sees in your operations"
      />
      <div className="mt-4">
        <AIReportView />
      </div>
    </>
  );
}
