// =============================================================================
// AI Report Domain Types
// =============================================================================

/**
 * Types of AI-generated reports.
 */
export type AIReportType =
  | 'FLEET_SAFETY_SUMMARY'
  | 'DRIVER_ASSESSMENT'
  | 'RISK_ANALYSIS'
  | 'TREND_REPORT'
  | 'RECOMMENDATION';

/**
 * Status of an AI report generation request.
 */
export type AIReportStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

/**
 * Represents an AI-generated safety intelligence report.
 * Generated via the Groq API using fleet telemetry and safety data.
 */
export interface AIReport {
  id: string;
  fleetId: string;
  type: AIReportType;
  status: AIReportStatus;
  /** Human-readable title for the report */
  title: string;
  /** The generated report content (markdown) */
  content: string | null;
  /** Structured insights extracted from the report */
  insights: AIInsight[];
  /** ISO 8601 timestamp when the report was requested */
  requestedAt: string;
  /** ISO 8601 timestamp when generation completed */
  completedAt: string | null;
  /** Error message if generation failed */
  errorMessage: string | null;
}

/**
 * A single actionable insight from an AI report.
 */
export interface AIInsight {
  /** Category of the insight */
  category: 'SAFETY' | 'EFFICIENCY' | 'MAINTENANCE' | 'COMPLIANCE';
  /** Priority level */
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Short title */
  title: string;
  /** Detailed description */
  description: string;
  /** Suggested action */
  recommendation: string;
}

/**
 * Request payload for generating an AI report.
 */
export interface AIReportRequest {
  fleetId: string;
  type: AIReportType;
  /** Optional time range for the report */
  startDate?: string; // ISO 8601
  endDate?: string;   // ISO 8601
  /** Optional specific driver or vehicle to focus on */
  driverId?: string;
  vehicleId?: string;
}
