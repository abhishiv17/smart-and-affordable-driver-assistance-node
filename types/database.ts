// =============================================================================
// Database Types — Supabase Schema Types
// =============================================================================
// These types will be generated from Supabase migrations in a later phase.
// For now, they re-export the domain types to establish the contract.
//
// Phase 2+: Replace with auto-generated types from `supabase gen types typescript`
// =============================================================================

export type { Fleet, FleetSummary } from './fleet';
export type { Vehicle, VehicleSummary, VehicleStatus } from './vehicle';
export type { Driver, DriverSummary, DriverStatus } from './driver';
export type { Device, DeviceStatus, NetworkStatus } from './device';
export type {
  TelemetryEvent,
  TelemetryEventType,
  TelemetryNetworkStatus,
  TelemetrySubmission,
  TelemetrySubmissionResponse,
  TelemetryValidationError,
} from './telemetry';
export type { SafetyAlert, AlertSeverity, AlertType, AlertStatus } from './alert';
export type { Trip, TripStatus } from './trip';
export type { AIReport, AIReportType, AIReportStatus, AIInsight, AIReportRequest } from './ai';
