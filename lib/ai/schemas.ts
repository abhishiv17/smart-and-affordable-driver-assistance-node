// =============================================================================
// AI Response Schemas — Phase 2+
// =============================================================================
// Zod schemas for validating structured AI responses from the Groq API.
//
// Phase 1: Stub only.
// =============================================================================

import { z } from 'zod';

/**
 * Schema for a single AI insight in the response.
 */
export const aiInsightSchema = z.object({
  category: z.enum(['SAFETY', 'EFFICIENCY', 'MAINTENANCE', 'COMPLIANCE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  title: z.string(),
  description: z.string(),
  recommendation: z.string(),
});

/**
 * Schema for the full AI report response.
 */
export const aiReportResponseSchema = z.object({
  title: z.string(),
  content: z.string(),
  insights: z.array(aiInsightSchema),
});

export type AIInsightResponse = z.infer<typeof aiInsightSchema>;
export type AIReportResponse = z.infer<typeof aiReportResponseSchema>;
