-- =============================================================================
-- Migration 001: Initial Schema
-- =============================================================================
-- Creates all SADAN tables with relationships, constraints, and triggers.
--
-- Tables: fleets, fleet_members, drivers, devices, vehicles, trips,
--         telemetry, alerts, ai_reports
--
-- Design notes:
-- - UUIDs for all primary keys (gen_random_uuid())
-- - timestamptz for all timestamps (UTC)
-- - CHECK constraints for enums (not CREATE TYPE — easier to migrate)
-- - CHECK constraints for numeric ranges (sensor data validation)
-- - updated_at auto-maintained via trigger
-- - ON DELETE behavior documented per FK
--
-- Table creation order resolves FK dependencies:
--   fleets → fleet_members, drivers → devices → vehicles → trips,
--   telemetry, alerts, ai_reports
-- =============================================================================

-- Enable UUID extension (usually enabled by default on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Trigger function: auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Table: fleets
-- =============================================================================
-- Top-level organizational entity. A fleet represents a logistics company.
CREATE TABLE fleets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_fleets_updated_at
  BEFORE UPDATE ON fleets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Table: fleet_members
-- =============================================================================
-- Maps Supabase Auth users to fleets for RLS-based fleet isolation.
-- This is the security boundary: a user can only access data for fleets
-- they are a member of.
--
-- Roles:
--   OWNER    - Full access, can manage fleet settings and members
--   ADMIN    - Full data access, can manage drivers/vehicles
--   OPERATOR - Can view and acknowledge alerts, view dashboards
--   VIEWER   - Read-only access to dashboards and reports
CREATE TABLE fleet_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id  uuid NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'OPERATOR', 'VIEWER')),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- A user can only be a member of a fleet once
  UNIQUE (fleet_id, user_id)
);

-- =============================================================================
-- Table: drivers
-- =============================================================================
-- Represents a commercial vehicle driver in a logistics fleet.
--
-- ON DELETE fleet_id CASCADE: Deleting a fleet removes all its drivers.
CREATE TABLE drivers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id    uuid NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  name        text NOT NULL,
  phone       text,
  status      text NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Table: devices
-- =============================================================================
-- Represents a SADAN edge device (ARM processor + sensors).
-- Each device is installed in one vehicle.
--
-- connectivity_status tracks the last known network state.
-- last_seen tracks the last heartbeat/telemetry timestamp.
--
-- Note: vehicle_id FK is added after vehicles table is created (below)
-- to avoid circular dependency.
CREATE TABLE devices (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id            uuid,
  device_serial         text NOT NULL UNIQUE,
  firmware_version      text NOT NULL DEFAULT '0.0.0',
  connectivity_status   text NOT NULL DEFAULT 'OFFLINE'
                          CHECK (connectivity_status IN ('ONLINE', 'OFFLINE')),
  last_seen             timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Table: vehicles
-- =============================================================================
-- Represents a commercial vehicle in the fleet.
-- Contains both identity fields and "current state" fields.
--
-- Current-state fields (latitude, longitude, safety_score, last_seen, status)
-- are updated from the latest telemetry. This is distinct from the
-- telemetry table which is an append-only historical event stream.
--
-- ON DELETE:
--   fleet_id CASCADE  - Deleting fleet removes all vehicles
--   driver_id SET NULL - Unassign driver, keep vehicle
--   device_id SET NULL - Unassign device, keep vehicle
CREATE TABLE vehicles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id        uuid NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  vehicle_number  text NOT NULL,
  model           text,
  driver_id       uuid REFERENCES drivers(id) ON DELETE SET NULL,
  device_id       uuid UNIQUE REFERENCES devices(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'IDLE'
                    CHECK (status IN ('ACTIVE', 'IDLE', 'OFFLINE', 'MAINTENANCE')),
  safety_score    numeric(5,2) DEFAULT 100.00
                    CHECK (safety_score >= 0 AND safety_score <= 100),
  latitude        double precision
                    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude       double precision
                    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  last_seen       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Vehicle number must be unique within a fleet
  UNIQUE (fleet_id, vehicle_number)
);

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Now add the FK from devices → vehicles (resolves circular dependency)
ALTER TABLE devices
  ADD CONSTRAINT fk_devices_vehicle_id
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;

-- =============================================================================
-- Table: trips
-- =============================================================================
-- Represents a vehicle/driver journey. Created when a trip starts,
-- updated when it ends with distance and safety score.
--
-- ON DELETE:
--   vehicle_id CASCADE - If vehicle deleted, trips are deleted
--   driver_id SET NULL - Preserve trip history even if driver removed
CREATE TABLE trips (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id    uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id     uuid REFERENCES drivers(id) ON DELETE SET NULL,
  started_at    timestamptz NOT NULL,
  ended_at      timestamptz,
  distance      numeric(10,2) DEFAULT 0
                  CHECK (distance >= 0),
  safety_score  numeric(5,2)
                  CHECK (safety_score IS NULL OR (safety_score >= 0 AND safety_score <= 100)),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Table: telemetry
-- =============================================================================
-- Append-only historical event stream from edge devices.
-- This is the highest-write table in the system.
--
-- Each incoming telemetry event becomes a new row. Vehicle current-state
-- fields (latitude, longitude, safety_score, last_seen) are maintained
-- separately on the vehicles table.
--
-- ON DELETE:
--   device_id SET NULL  - Preserve telemetry if device removed
--   vehicle_id SET NULL - Preserve telemetry if vehicle removed
CREATE TABLE telemetry (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id         uuid REFERENCES devices(id) ON DELETE SET NULL,
  vehicle_id        uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  timestamp         timestamptz NOT NULL,
  latitude          double precision NOT NULL
                      CHECK (latitude >= -90 AND latitude <= 90),
  longitude         double precision NOT NULL
                      CHECK (longitude >= -180 AND longitude <= 180),
  speed             double precision NOT NULL
                      CHECK (speed >= 0 AND speed <= 300),
  g_force           double precision NOT NULL
                      CHECK (g_force >= 0 AND g_force <= 10),
  drowsiness_score  double precision NOT NULL
                      CHECK (drowsiness_score >= 0 AND drowsiness_score <= 1),
  eye_aspect_ratio  double precision NOT NULL
                      CHECK (eye_aspect_ratio >= 0 AND eye_aspect_ratio <= 1),
  event_type        text NOT NULL
                      CHECK (event_type IN (
                        'NORMAL', 'DROWSINESS', 'HARSH_BRAKING',
                        'HARSH_ACCELERATION', 'DEVICE_OFFLINE', 'DEVICE_RECOVERED'
                      )),
  network_status    text NOT NULL
                      CHECK (network_status IN ('ONLINE', 'OFFLINE')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Table: alerts
-- =============================================================================
-- Safety alerts generated from telemetry analysis.
--
-- ON DELETE:
--   vehicle_id CASCADE - Alerts deleted with vehicle
--   driver_id SET NULL - Preserve alert history if driver removed
CREATE TABLE alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id       uuid REFERENCES drivers(id) ON DELETE SET NULL,
  type            text NOT NULL
                    CHECK (type IN (
                      'DROWSINESS', 'HARSH_BRAKING', 'HARSH_ACCELERATION',
                      'DEVICE_OFFLINE', 'DEVICE_RECOVERED'
                    )),
  severity        text NOT NULL
                    CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  timestamp       timestamptz NOT NULL,
  latitude        double precision
                    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude       double precision
                    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  message         text NOT NULL,
  acknowledged    boolean NOT NULL DEFAULT false,
  acknowledged_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Table: ai_reports
-- =============================================================================
-- AI-generated safety intelligence reports (via Groq API in Phase 3).
--
-- key_findings and recommendations are stored as JSONB arrays of strings.
--
-- ON DELETE:
--   fleet_id CASCADE    - Reports deleted with fleet
--   vehicle_id SET NULL - Report preserved if vehicle removed
CREATE TABLE ai_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id        uuid NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  vehicle_id      uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  period_start    timestamptz NOT NULL,
  period_end      timestamptz NOT NULL,
  summary         text,
  risk_level      text CHECK (risk_level IS NULL OR risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  key_findings    jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
