import type { DbAlert, DbTelemetry } from '@/types/database';
import { EVENT_DEDUCTIONS } from '@/lib/safety/scoring';

// =============================================================================
// Incident Intelligence Engine
// =============================================================================
// Analyzes a safety alert in the context of its surrounding telemetry to
// extract compound risks (e.g., speeding + harsh braking, or fatigue + braking).
// =============================================================================

export interface CompoundFactor {
  name: string;
  description: string;
  multiplier: number;
}

export interface IncidentAnalysis {
  alert: DbAlert;
  primaryFactor: string;
  baseDeduction: number;
  contributingFactors: CompoundFactor[];
  totalDeduction: number;
  isCompoundRisk: boolean;
  summaryTitle: string;
  summaryDescription: string;
}

export function analyzeIncident(
  alert: DbAlert,
  telemetryWindow: DbTelemetry[]
): IncidentAnalysis {
  const baseDeduction = EVENT_DEDUCTIONS[alert.type] || 0;
  let primaryFactor = 'Unknown Event';
  let summaryTitle = alert.message;
  let summaryDescription = 'An isolated safety event occurred.';
  const contributingFactors: CompoundFactor[] = [];
  let multiplier = 1.0;

  // Ensure telemetry is sorted by timestamp
  const sortedTelemetry = [...telemetryWindow].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Separate telemetry into "before" and "during/after" the alert
  const alertTime = new Date(alert.timestamp).getTime();
  const preAlertTelemetry = sortedTelemetry.filter(
    (t) => new Date(t.timestamp).getTime() <= alertTime
  );

  // 1. Primary Factor Classification
  switch (alert.type) {
    case 'DROWSINESS':
      primaryFactor = 'Driver Fatigue Detected';
      summaryDescription = 'Facial tracking indicated significant eye closure or microsleeps.';
      break;
    case 'HARSH_BRAKING':
      primaryFactor = 'Harsh Braking Event';
      summaryDescription = 'IMU detected severe deceleration indicative of emergency braking.';
      break;
    case 'HARSH_ACCELERATION':
      primaryFactor = 'Harsh Acceleration';
      summaryDescription = 'Aggressive throttle input detected.';
      break;
    case 'DEVICE_OFFLINE':
      primaryFactor = 'Connection Lost';
      summaryDescription = 'Device lost cellular connectivity, caching data locally.';
      break;
    case 'DEVICE_RECOVERED':
      primaryFactor = 'Connection Restored';
      summaryDescription = 'Device reconnected and synchronized cached telemetry.';
      break;
  }

  // 2. Compound Risk Analysis
  
  // Check for preceding drowsiness
  const wasDrowsy = preAlertTelemetry.some((t) => t.drowsiness_score > 0.4);
  if (wasDrowsy && alert.type !== 'DROWSINESS') {
    contributingFactors.push({
      name: 'Preceding Fatigue',
      description: 'Drowsiness signs were detected in the seconds leading up to this event.',
      multiplier: 1.5,
    });
  }

  // Check for high speed at time of event
  const alertTelemetry = sortedTelemetry.find(
    (t) => Math.abs(new Date(t.timestamp).getTime() - alertTime) < 2000
  );
  if (alertTelemetry && alertTelemetry.speed > 80) {
    contributingFactors.push({
      name: 'High Speed',
      description: `Vehicle was traveling at ${Math.round(alertTelemetry.speed)} km/h during the event.`,
      multiplier: 1.25,
    });
  } else if (alertTelemetry && alertTelemetry.speed > 60 && alert.type === 'HARSH_BRAKING') {
    contributingFactors.push({
      name: 'Moderate Speed',
      description: `Braking occurred at ${Math.round(alertTelemetry.speed)} km/h.`,
      multiplier: 1.1,
    });
  }

  // 3. Summarize
  contributingFactors.forEach((f) => {
    multiplier *= f.multiplier;
  });

  const isCompoundRisk = contributingFactors.length > 0;
  
  if (isCompoundRisk) {
    if (wasDrowsy && alert.type === 'HARSH_BRAKING') {
      summaryTitle = 'Fatigue-Induced Emergency Braking';
      summaryDescription = 'Driver exhibited signs of fatigue immediately prior to a harsh braking event, suggesting delayed reaction time.';
    } else if (alert.type === 'HARSH_BRAKING' && alertTelemetry && alertTelemetry.speed > 80) {
      summaryTitle = 'High-Speed Emergency Braking';
      summaryDescription = 'Severe deceleration event occurring at highway speeds, presenting high risk of loss of control.';
    }
  }

  const totalDeduction = Math.min(100, Math.round(baseDeduction * multiplier));

  return {
    alert,
    primaryFactor,
    baseDeduction,
    contributingFactors,
    totalDeduction,
    isCompoundRisk,
    summaryTitle,
    summaryDescription,
  };
}
