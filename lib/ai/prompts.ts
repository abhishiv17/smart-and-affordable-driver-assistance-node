// =============================================================================
// AI Prompt Templates — Phase 2+
// =============================================================================
// Will contain the prompt templates used to generate AI safety reports
// via the Groq API.
//
// Phase 1: Stub only.
// =============================================================================

/**
 * System prompt for fleet safety analysis.
 * Phase 2+: Will be refined based on Groq model capabilities.
 */
export const FLEET_SAFETY_SYSTEM_PROMPT = `You are SADAN AI, a fleet safety intelligence analyst. 
You analyze telemetry data from commercial vehicle fleets and provide 
actionable safety insights, risk assessments, and recommendations.

Your analysis should be:
- Data-driven and specific
- Actionable with clear recommendations
- Prioritized by safety impact
- Written for fleet operations managers`;

/**
 * Get the appropriate prompt template for a report type.
 * Phase 2+: Will return structured prompt templates.
 */
export function getPromptTemplate(_reportType: string): string {
  // Phase 2: Implement prompt template selection
  return FLEET_SAFETY_SYSTEM_PROMPT;
}
