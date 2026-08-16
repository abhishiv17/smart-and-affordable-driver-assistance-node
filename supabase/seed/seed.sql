-- =============================================================================
-- SADAN — Development Seed Data
-- =============================================================================
-- Deterministic seed data using fixed UUIDs for reproducibility.
-- Contains realistic fleet data sufficient for dashboard development.
--
-- Contents:
--   1 fleet (SafeHaul Logistics)
--   10 drivers (mixed statuses)
--   10 devices (mixed connectivity)
--   10 vehicles (TRK-01 through TRK-10, mixed statuses)
--   5 trips (completed)
--   ~50 telemetry events (mix of types)
--   8 alerts (mix of types and severities)
--   1 AI report placeholder
--
-- Note: This seed is run using the service_role key, which bypasses RLS.
-- This script is IDEMPOTENT — safe to re-run.
-- =============================================================================

-- =============================================================================
-- Cleanup: Remove existing seed data (cascade handles child tables)
-- =============================================================================
DELETE FROM ai_reports WHERE fleet_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM telemetry WHERE vehicle_id IN (SELECT id FROM vehicles WHERE fleet_id = 'a0000000-0000-0000-0000-000000000001');
DELETE FROM alerts WHERE vehicle_id IN (SELECT id FROM vehicles WHERE fleet_id = 'a0000000-0000-0000-0000-000000000001');
DELETE FROM trips WHERE vehicle_id IN (SELECT id FROM vehicles WHERE fleet_id = 'a0000000-0000-0000-0000-000000000001');
DELETE FROM vehicles WHERE fleet_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM devices WHERE id IN ('e0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000007','e0000000-0000-0000-0000-000000000008','e0000000-0000-0000-0000-000000000009','e0000000-0000-0000-0000-000000000010');
DELETE FROM drivers WHERE fleet_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM fleet_members WHERE fleet_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM fleets WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- =============================================================================
-- Fleet
-- =============================================================================
INSERT INTO fleets (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'SafeHaul Logistics');

-- =============================================================================
-- Drivers (10)
-- =============================================================================
INSERT INTO drivers (id, fleet_id, name, phone, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Rajesh Kumar',      '+91-9876543210', 'ACTIVE'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Amit Sharma',       '+91-9876543211', 'ACTIVE'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Suresh Patel',      '+91-9876543212', 'ACTIVE'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Vikram Singh',      '+91-9876543213', 'ACTIVE'),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Manoj Verma',       '+91-9876543214', 'ACTIVE'),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Deepak Yadav',      '+91-9876543215', 'ACTIVE'),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Arun Gupta',        '+91-9876543216', 'INACTIVE'),
  ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Pradeep Joshi',     '+91-9876543217', 'INACTIVE'),
  ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Sanjay Mishra',     '+91-9876543218', 'SUSPENDED'),
  ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Ravi Tiwari',       '+91-9876543219', 'ACTIVE');

-- =============================================================================
-- Devices (10)
-- =============================================================================
INSERT INTO devices (id, device_serial, firmware_version, connectivity_status, last_seen) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'DG-SN-001', '1.2.0', 'ONLINE',  now() - interval '2 minutes'),
  ('e0000000-0000-0000-0000-000000000002', 'DG-SN-002', '1.2.0', 'ONLINE',  now() - interval '5 minutes'),
  ('e0000000-0000-0000-0000-000000000003', 'DG-SN-003', '1.1.0', 'ONLINE',  now() - interval '1 minute'),
  ('e0000000-0000-0000-0000-000000000004', 'DG-SN-004', '1.2.0', 'ONLINE',  now() - interval '3 minutes'),
  ('e0000000-0000-0000-0000-000000000005', 'DG-SN-005', '1.1.0', 'ONLINE',  now() - interval '10 minutes'),
  ('e0000000-0000-0000-0000-000000000006', 'DG-SN-006', '1.2.0', 'ONLINE',  now() - interval '4 minutes'),
  ('e0000000-0000-0000-0000-000000000007', 'DG-SN-007', '1.0.0', 'OFFLINE', now() - interval '2 hours'),
  ('e0000000-0000-0000-0000-000000000008', 'DG-SN-008', '1.0.0', 'OFFLINE', now() - interval '6 hours'),
  ('e0000000-0000-0000-0000-000000000009', 'DG-SN-009', '1.2.0', 'ONLINE',  now() - interval '7 minutes'),
  ('e0000000-0000-0000-0000-000000000010', 'DG-SN-010', '1.1.0', 'ONLINE',  now() - interval '15 minutes');

-- =============================================================================
-- Vehicles (10) — TRK-01 through TRK-10
-- =============================================================================
-- Mixed statuses: 6 ACTIVE, 2 IDLE, 1 OFFLINE, 1 MAINTENANCE
-- Locations around Mumbai, India (realistic logistics hub)
INSERT INTO vehicles (id, fleet_id, vehicle_number, model, driver_id, device_id, status, safety_score, latitude, longitude, last_seen) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'TRK-01', 'Tata Ace Gold',       'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'ACTIVE',      92.50, 19.0760, 72.8777, now() - interval '2 minutes'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'TRK-02', 'Mahindra Bolero Pickup','d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'ACTIVE',      85.00, 19.1176, 72.9060, now() - interval '5 minutes'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'TRK-03', 'Ashok Leyland Dost',   'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'ACTIVE',      45.00, 19.2183, 72.9781, now() - interval '1 minute'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'TRK-04', 'Tata 407',             'd0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'ACTIVE',      78.75, 18.9220, 72.8347, now() - interval '3 minutes'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'TRK-05', 'Eicher Pro 2049',      'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'ACTIVE',      55.25, 19.0330, 73.0297, now() - interval '10 minutes'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'TRK-06', 'BharatBenz 1015R',     'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 'ACTIVE',      88.00, 19.1860, 72.9755, now() - interval '4 minutes'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'TRK-07', 'Tata Ace',             NULL,                                   'e0000000-0000-0000-0000-000000000007', 'OFFLINE',     70.00, 19.0596, 72.8295, now() - interval '2 hours'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'TRK-08', 'Mahindra Supro',       NULL,                                   'e0000000-0000-0000-0000-000000000008', 'IDLE',        95.00, 19.0760, 72.8777, NULL),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'TRK-09', 'Ashok Leyland Partner','d0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000009', 'IDLE',        60.00, 19.1467, 72.8564, now() - interval '7 minutes'),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'TRK-10', 'Tata LPT 1613',        'd0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', 'MAINTENANCE', 82.00, NULL,    NULL,    now() - interval '1 day');

-- Update devices with vehicle_id (after vehicles are inserted)
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000001' WHERE id = 'e0000000-0000-0000-0000-000000000001';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000002' WHERE id = 'e0000000-0000-0000-0000-000000000002';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000003' WHERE id = 'e0000000-0000-0000-0000-000000000003';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000004' WHERE id = 'e0000000-0000-0000-0000-000000000004';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000005' WHERE id = 'e0000000-0000-0000-0000-000000000005';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000006' WHERE id = 'e0000000-0000-0000-0000-000000000006';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000007' WHERE id = 'e0000000-0000-0000-0000-000000000007';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000008' WHERE id = 'e0000000-0000-0000-0000-000000000008';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000009' WHERE id = 'e0000000-0000-0000-0000-000000000009';
UPDATE devices SET vehicle_id = 'b0000000-0000-0000-0000-000000000010' WHERE id = 'e0000000-0000-0000-0000-000000000010';

-- =============================================================================
-- Trips (5 completed trips)
-- =============================================================================
INSERT INTO trips (id, vehicle_id, driver_id, started_at, ended_at, distance, safety_score) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', now() - interval '6 hours', now() - interval '3 hours', 145.80, 94.00),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', now() - interval '8 hours', now() - interval '5 hours', 210.50, 82.00),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', now() - interval '4 hours', now() - interval '1 hour',  98.20,  42.00),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', now() - interval '10 hours', now() - interval '7 hours', 320.00, 76.50),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', now() - interval '5 hours', now() - interval '2 hours', 175.30, 58.00);

-- =============================================================================
-- Telemetry (~50 events)
-- =============================================================================
-- Mix of NORMAL, DROWSINESS, HARSH_BRAKING, HARSH_ACCELERATION,
-- DEVICE_OFFLINE, DEVICE_RECOVERED events across multiple vehicles.

-- TRK-01: Normal driving (Rajesh Kumar — excellent driver)
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '60 minutes', 19.0760, 72.8777, 42.5, 0.15, 0.05, 0.38, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '55 minutes', 19.0820, 72.8810, 48.0, 0.18, 0.08, 0.36, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '50 minutes', 19.0890, 72.8850, 55.0, 0.12, 0.04, 0.39, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '45 minutes', 19.0960, 72.8900, 52.0, 0.20, 0.06, 0.37, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '40 minutes', 19.1020, 72.8940, 45.0, 0.14, 0.03, 0.40, 'NORMAL', 'ONLINE');

-- TRK-02: Normal with one harsh braking event
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '50 minutes', 19.1176, 72.9060, 60.0, 0.22, 0.10, 0.35, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '45 minutes', 19.1230, 72.9100, 65.0, 0.18, 0.08, 0.36, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '40 minutes', 19.1280, 72.9130, 20.0, 0.72, 0.12, 0.34, 'HARSH_BRAKING', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '35 minutes', 19.1320, 72.9160, 55.0, 0.15, 0.07, 0.37, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '30 minutes', 19.1360, 72.9190, 58.0, 0.20, 0.09, 0.35, 'NORMAL', 'ONLINE');

-- TRK-03: Drowsy driver events (Suresh Patel — poor safety score)
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '45 minutes', 19.2183, 72.9781, 50.0, 0.16, 0.15, 0.34, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '40 minutes', 19.2210, 72.9810, 48.0, 0.14, 0.45, 0.26, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '35 minutes', 19.2240, 72.9840, 45.0, 0.12, 0.65, 0.21, 'DROWSINESS', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '30 minutes', 19.2270, 72.9870, 42.0, 0.10, 0.82, 0.17, 'DROWSINESS', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '25 minutes', 19.2300, 72.9900, 30.0, 0.08, 0.35, 0.30, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '20 minutes', 19.2330, 72.9930, 52.0, 0.18, 0.72, 0.19, 'DROWSINESS', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '15 minutes', 19.2360, 72.9960, 35.0, 0.55, 0.40, 0.28, 'HARSH_BRAKING', 'ONLINE');

-- TRK-04: Harsh acceleration events
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '40 minutes', 18.9220, 72.8347, 35.0, 0.15, 0.05, 0.38, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '35 minutes', 18.9280, 72.8380, 70.0, 0.62, 0.08, 0.36, 'HARSH_ACCELERATION', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '30 minutes', 18.9340, 72.8420, 65.0, 0.20, 0.06, 0.37, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '25 minutes', 18.9400, 72.8460, 75.0, 0.58, 0.07, 0.35, 'HARSH_ACCELERATION', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '20 minutes', 18.9460, 72.8500, 60.0, 0.18, 0.05, 0.38, 'NORMAL', 'ONLINE');

-- TRK-05: Mixed events
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '50 minutes', 19.0330, 73.0297, 55.0, 0.16, 0.10, 0.35, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '45 minutes', 19.0380, 73.0340, 62.0, 0.65, 0.12, 0.33, 'HARSH_BRAKING', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '40 minutes', 19.0430, 73.0380, 48.0, 0.14, 0.55, 0.24, 'DROWSINESS', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '35 minutes', 19.0480, 73.0420, 52.0, 0.18, 0.15, 0.35, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '30 minutes', 19.0530, 73.0460, 58.0, 0.52, 0.08, 0.37, 'HARSH_ACCELERATION', 'ONLINE');

-- TRK-06: Clean driver (Deepak Yadav)
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '30 minutes', 19.1860, 72.9755, 40.0, 0.12, 0.04, 0.40, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '25 minutes', 19.1900, 72.9790, 45.0, 0.14, 0.05, 0.39, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '20 minutes', 19.1940, 72.9820, 42.0, 0.10, 0.03, 0.41, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '15 minutes', 19.1980, 72.9850, 38.0, 0.11, 0.04, 0.40, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '10 minutes', 19.2020, 72.9880, 50.0, 0.16, 0.06, 0.38, 'NORMAL', 'ONLINE');

-- TRK-07: Device offline/recovered sequence
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', now() - interval '3 hours',    19.0596, 72.8295, 45.0, 0.15, 0.08, 0.36, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', now() - interval '2.5 hours',  19.0620, 72.8320, 40.0, 0.12, 0.06, 0.38, 'DEVICE_OFFLINE', 'OFFLINE'),
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', now() - interval '2 hours',    19.0596, 72.8295, 0.0,  0.02, 0.04, 0.40, 'DEVICE_RECOVERED', 'ONLINE');

-- TRK-09: Some normal events
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', now() - interval '20 minutes', 19.1467, 72.8564, 35.0, 0.10, 0.08, 0.37, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', now() - interval '15 minutes', 19.1490, 72.8590, 42.0, 0.14, 0.06, 0.38, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', now() - interval '10 minutes', 19.1510, 72.8610, 38.0, 0.12, 0.10, 0.35, 'NORMAL', 'ONLINE');

-- TRK-10: Recent events before maintenance
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', now() - interval '26 hours', 19.0200, 72.8400, 50.0, 0.15, 0.07, 0.36, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', now() - interval '25 hours', 19.0250, 72.8450, 55.0, 0.18, 0.09, 0.35, 'NORMAL', 'ONLINE');

-- =============================================================================
-- Alerts (8 alerts — mix of types and severities)
-- =============================================================================
INSERT INTO alerts (id, vehicle_id, driver_id, type, severity, timestamp, latitude, longitude, message, acknowledged) VALUES
  -- TRK-02: Harsh braking (WARNING)
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'HARSH_BRAKING', 'WARNING', now() - interval '40 minutes', 19.1280, 72.9130, 'Harsh braking detected on TRK-02. G-force: 0.72g', false),
  -- TRK-03: Drowsiness (CRITICAL — multiple occurrences)
  ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'DROWSINESS', 'CRITICAL', now() - interval '35 minutes', 19.2240, 72.9840, 'Drowsiness detected on TRK-03. Score: 0.65', false),
  ('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'DROWSINESS', 'CRITICAL', now() - interval '30 minutes', 19.2270, 72.9870, 'Severe drowsiness on TRK-03. Score: 0.82', false),
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'HARSH_BRAKING', 'WARNING', now() - interval '15 minutes', 19.2360, 72.9960, 'Harsh braking on TRK-03. G-force: 0.55g', true),
  -- TRK-04: Harsh acceleration (WARNING)
  ('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'HARSH_ACCELERATION', 'WARNING', now() - interval '35 minutes', 18.9280, 72.8380, 'Harsh acceleration on TRK-04. G-force: 0.62g', true),
  -- TRK-05: Mixed
  ('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'DROWSINESS', 'WARNING', now() - interval '40 minutes', 19.0430, 73.0380, 'Drowsiness detected on TRK-05. Score: 0.55', false),
  -- TRK-07: Device offline (INFO)
  ('f0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', NULL, 'DEVICE_OFFLINE', 'INFO', now() - interval '2.5 hours', 19.0620, 72.8320, 'Device DG-SN-007 went offline on TRK-07', true),
  ('f0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000007', NULL, 'DEVICE_RECOVERED', 'INFO', now() - interval '2 hours', 19.0596, 72.8295, 'Device DG-SN-007 recovered on TRK-07', true);

-- Set acknowledged_at for acknowledged alerts
UPDATE alerts SET acknowledged_at = timestamp + interval '5 minutes' WHERE acknowledged = true;

-- =============================================================================
-- AI Reports (1 placeholder)
-- =============================================================================
INSERT INTO ai_reports (id, fleet_id, vehicle_id, period_start, period_end, summary, risk_level, key_findings, recommendations) VALUES
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL, now() - interval '7 days', now(), 'Weekly fleet safety summary for SafeHaul Logistics. Overall fleet safety score is moderate with specific concerns around driver drowsiness on TRK-03 and aggressive driving on TRK-04.', 'MEDIUM', '["TRK-03 driver Suresh Patel has 3 drowsiness events in the past week","TRK-04 shows repeated harsh acceleration patterns","TRK-07 experienced connectivity issues","6 of 10 vehicles maintain good or excellent safety scores"]'::jsonb, '["Schedule mandatory rest break for Suresh Patel (TRK-03)","Review driving training for Vikram Singh (TRK-04)","Inspect cellular modem on device DG-SN-007 (TRK-07)","Consider firmware update for devices running v1.0.0"]'::jsonb);
