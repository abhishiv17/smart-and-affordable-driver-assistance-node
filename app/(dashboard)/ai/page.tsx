import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { AIReportView } from '@/components/ai/ai-report-view';

export const metadata: Metadata = {
  title: 'AI Intelligence',
  description: 'AI-generated safety insights and fleet intelligence reports.',
};

export default function AIPage() {
  return (
    <>
      <PageHeader
        title="AI Intelligence"
        description="AI-generated safety insights powered by Groq"
      />
      <div className="mt-8">
        <AIReportView />
      </div>
    </>
  );
}
