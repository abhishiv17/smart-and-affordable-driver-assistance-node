-- =============================================================================
-- Migration 003: Row Level Security & Realtime Preparation
-- =============================================================================
-- Enables RLS on all application tables and creates fleet-isolation policies.
--
-- Security model:
--   Fleet isolation is enforced via the fleet_members table.
--   A user can only access data for fleets they are a member of.
--   The service_role key bypasses RLS for server-side operations
--   (telemetry ingestion, admin tasks, seed data).
--
-- For tables that don't directly have a fleet_id (telemetry, devices),
-- the policy joins through the vehicle → fleet chain.
--
-- Realtime preparation:
--   Enables Supabase Realtime on tables that will have live subscriptions
--   in future phases.
-- =============================================================================

-- =============================================================================
-- Helper function: Get the fleet IDs a user belongs to
-- =============================================================================
CREATE OR REPLACE FUNCTION get_user_fleet_ids()
RETURNS SETOF uuid AS $$
  SELECT fleet_id FROM fleet_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- Enable RLS on all tables
-- =============================================================================
ALTER TABLE fleets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Policies: fleets
-- =============================================================================
-- Users can only see fleets they are a member of.
CREATE POLICY "Users can view their fleets"
  ON fleets FOR SELECT
  USING (id IN (SELECT get_user_fleet_ids()));

CREATE POLICY "Fleet owners can update their fleet"
  ON fleets FOR UPDATE
  USING (id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
  ));

-- =============================================================================
-- Policies: fleet_members
-- =============================================================================
-- Users can see members of their fleets.
CREATE POLICY "Users can view fleet members"
  ON fleet_members FOR SELECT
  USING (fleet_id IN (SELECT get_user_fleet_ids()));

-- Only OWNER/ADMIN can manage members
CREATE POLICY "Admins can manage fleet members"
  ON fleet_members FOR INSERT
  WITH CHECK (fleet_id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
  ));

CREATE POLICY "Admins can remove fleet members"
  ON fleet_members FOR DELETE
  USING (fleet_id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
  ));

-- =============================================================================
-- Policies: drivers
-- =============================================================================
CREATE POLICY "Users can view fleet drivers"
  ON drivers FOR SELECT
  USING (fleet_id IN (SELECT get_user_fleet_ids()));

CREATE POLICY "Admins can manage drivers"
  ON drivers FOR INSERT
  WITH CHECK (fleet_id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN', 'OPERATOR')
  ));

CREATE POLICY "Admins can update drivers"
  ON drivers FOR UPDATE
  USING (fleet_id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN', 'OPERATOR')
  ));

CREATE POLICY "Admins can delete drivers"
  ON drivers FOR DELETE
  USING (fleet_id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
  ));

-- =============================================================================
-- Policies: vehicles
-- =============================================================================
CREATE POLICY "Users can view fleet vehicles"
  ON vehicles FOR SELECT
  USING (fleet_id IN (SELECT get_user_fleet_ids()));

CREATE POLICY "Admins can manage vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (fleet_id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN', 'OPERATOR')
  ));

CREATE POLICY "Admins can update vehicles"
  ON vehicles FOR UPDATE
  USING (fleet_id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN', 'OPERATOR')
  ));

CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE
  USING (fleet_id IN (
    SELECT fleet_id FROM fleet_members
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
  ));

-- =============================================================================
-- Policies: devices
-- =============================================================================
-- Devices are accessed through their vehicle's fleet.
CREATE POLICY "Users can view fleet devices"
  ON devices FOR SELECT
  USING (
    vehicle_id IS NULL
    OR vehicle_id IN (
      SELECT id FROM vehicles WHERE fleet_id IN (SELECT get_user_fleet_ids())
    )
  );

CREATE POLICY "Admins can manage devices"
  ON devices FOR INSERT
  WITH CHECK (
    vehicle_id IS NULL
    OR vehicle_id IN (
      SELECT id FROM vehicles WHERE fleet_id IN (
        SELECT fleet_id FROM fleet_members
        WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
      )
    )
  );

CREATE POLICY "Admins can update devices"
  ON devices FOR UPDATE
  USING (
    vehicle_id IS NULL
    OR vehicle_id IN (
      SELECT id FROM vehicles WHERE fleet_id IN (
        SELECT fleet_id FROM fleet_members
        WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
      )
    )
  );

-- =============================================================================
-- Policies: trips
-- =============================================================================
CREATE POLICY "Users can view fleet trips"
  ON trips FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE fleet_id IN (SELECT get_user_fleet_ids())
    )
  );

-- =============================================================================
-- Policies: telemetry
-- =============================================================================
-- Telemetry SELECT: fleet members can view telemetry for their fleet's vehicles.
-- Telemetry INSERT: restricted to service role (API ingestion only).
-- No client-side INSERT policy — telemetry is ingested via the API route
-- handler which uses the service_role key.
CREATE POLICY "Users can view fleet telemetry"
  ON telemetry FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE fleet_id IN (SELECT get_user_fleet_ids())
    )
  );

-- =============================================================================
-- Policies: alerts
-- =============================================================================
CREATE POLICY "Users can view fleet alerts"
  ON alerts FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE fleet_id IN (SELECT get_user_fleet_ids())
    )
  );

-- Operators can acknowledge alerts
CREATE POLICY "Operators can update alerts"
  ON alerts FOR UPDATE
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE fleet_id IN (
        SELECT fleet_id FROM fleet_members
        WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN', 'OPERATOR')
      )
    )
  );

-- =============================================================================
-- Policies: ai_reports
-- =============================================================================
CREATE POLICY "Users can view fleet reports"
  ON ai_reports FOR SELECT
  USING (fleet_id IN (SELECT get_user_fleet_ids()));

-- =============================================================================
-- Supabase Realtime Preparation
-- =============================================================================
-- Enable Realtime on tables that will have live subscriptions in Phase 3+:
--   - vehicles: Live vehicle state updates (position, status, safety score)
--   - telemetry: Live telemetry event stream
--   - alerts: New alert notifications
--   - devices: Connectivity status changes
--
-- React subscription hooks will be implemented in a future phase.
-- This migration only enables the database-side infrastructure.

-- Note: Supabase Realtime is enabled per-table via the supabase_realtime
-- publication. We add the tables that need live updates.
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE devices;
