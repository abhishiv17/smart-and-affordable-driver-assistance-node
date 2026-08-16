-- =============================================================================
-- Migration 002: Indexes
-- =============================================================================
-- Creates performance indexes for common query patterns.
-- Each index is documented with the query pattern it optimizes.
-- =============================================================================

-- =============================================================================
-- Telemetry Indexes
-- =============================================================================
-- Telemetry is the highest-write, highest-read table.
-- Primary query patterns:
--   1. Vehicle telemetry history (vehicle_id + timestamp range)
--   2. Device telemetry history (device_id + timestamp range)
--   3. Filtered event queries (vehicle_id + event_type + timestamp)
--   4. Time-range scans across all vehicles (timestamp)
--   5. Event type filtering (event_type)

-- Vehicle history: "Show telemetry for vehicle X in time range Y..Z"
CREATE INDEX idx_telemetry_vehicle_timestamp
  ON telemetry (vehicle_id, timestamp DESC);

-- Device history: "Show telemetry from device X in time range Y..Z"
CREATE INDEX idx_telemetry_device_timestamp
  ON telemetry (device_id, timestamp DESC);

-- Filtered events: "Show DROWSINESS events for vehicle X in time range"
CREATE INDEX idx_telemetry_vehicle_event_timestamp
  ON telemetry (vehicle_id, event_type, timestamp DESC);

-- Event type filtering: "Show all HARSH_BRAKING events"
CREATE INDEX idx_telemetry_event_type
  ON telemetry (event_type);

-- Time range scans: "Show all events in the last hour"
CREATE INDEX idx_telemetry_timestamp
  ON telemetry (timestamp DESC);

-- =============================================================================
-- Alert Indexes
-- =============================================================================
-- Primary query patterns:
--   1. Vehicle alert history
--   2. Driver alert history
--   3. Severity filtering (show CRITICAL alerts)
--   4. Unacknowledged alerts (operational priority)
--   5. Alert type filtering

-- Vehicle alerts: "Show alerts for vehicle X ordered by time"
CREATE INDEX idx_alerts_vehicle_timestamp
  ON alerts (vehicle_id, timestamp DESC);

-- Driver alerts: "Show alerts for driver X"
CREATE INDEX idx_alerts_driver_id
  ON alerts (driver_id);

-- Severity filtering: "Show all CRITICAL alerts"
CREATE INDEX idx_alerts_severity
  ON alerts (severity);

-- Unacknowledged alerts: "Show alerts requiring attention"
-- Partial index — only indexes unacknowledged alerts (smaller, faster)
CREATE INDEX idx_alerts_unacknowledged
  ON alerts (acknowledged, timestamp DESC)
  WHERE acknowledged = false;

-- Alert type filtering: "Show all DROWSINESS alerts"
CREATE INDEX idx_alerts_type
  ON alerts (type);

-- =============================================================================
-- Vehicle Indexes
-- =============================================================================
-- Primary query patterns:
--   1. Fleet vehicle listing
--   2. Status filtering

-- Fleet listing: "Show all vehicles for fleet X"
CREATE INDEX idx_vehicles_fleet_id
  ON vehicles (fleet_id);

-- Status filtering: "Show all ACTIVE vehicles"
CREATE INDEX idx_vehicles_status
  ON vehicles (status);

-- =============================================================================
-- Driver Indexes
-- =============================================================================
-- Primary query pattern: Fleet driver listing

-- Fleet listing: "Show all drivers for fleet X"
CREATE INDEX idx_drivers_fleet_id
  ON drivers (fleet_id);

-- =============================================================================
-- Trip Indexes
-- =============================================================================
-- Primary query patterns:
--   1. Vehicle trip history
--   2. Driver trip history

-- Vehicle trips: "Show trips for vehicle X"
CREATE INDEX idx_trips_vehicle_id
  ON trips (vehicle_id, started_at DESC);

-- Driver trips: "Show trips for driver X"
CREATE INDEX idx_trips_driver_id
  ON trips (driver_id, started_at DESC);

-- =============================================================================
-- Fleet Members Indexes
-- =============================================================================
-- Primary query pattern: RLS policy lookups ("which fleet does user X belong to?")

-- User lookup: Used by every RLS policy to determine fleet access
CREATE INDEX idx_fleet_members_user_id
  ON fleet_members (user_id);

-- =============================================================================
-- AI Reports Indexes
-- =============================================================================
-- Primary query patterns: fleet reports, vehicle reports

CREATE INDEX idx_ai_reports_fleet_id
  ON ai_reports (fleet_id, created_at DESC);

CREATE INDEX idx_ai_reports_vehicle_id
  ON ai_reports (vehicle_id, created_at DESC);

-- =============================================================================
-- Device Indexes
-- =============================================================================
-- Primary query pattern: Find device by vehicle

CREATE INDEX idx_devices_vehicle_id
  ON devices (vehicle_id);
