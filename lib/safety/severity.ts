// =============================================================================
// Alert Severity Utilities
// =============================================================================

import type { AlertSeverity } from '@/types/alert';

/**
 * Maps alert severity to display properties.
 */
export const SEVERITY_CONFIG: Record<AlertSeverity, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  INFO: {
    label: 'Info',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  WARNING: {
    label: 'Warning',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
};

/**
 * Get display properties for a severity level.
 */
export function getSeverityConfig(severity: AlertSeverity) {
  return SEVERITY_CONFIG[severity];
}
