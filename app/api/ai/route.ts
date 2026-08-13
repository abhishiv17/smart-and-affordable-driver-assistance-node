import { notImplementedResponse } from '@/lib/api/errors';

/**
 * POST /api/ai
 *
 * Generate an AI safety report.
 *
 * Request body: AIReportRequest (see types/ai.ts)
 * Response: AIReport
 *
 * Phase 3: Will integrate with Groq API for report generation.
 */
export async function POST() {
  return notImplementedResponse('AI report generation');
}
