-- =============================================================================
-- SADAN — Development Seed Data (Bangalore)
-- =============================================================================
-- Deterministic seed data using fixed UUIDs for reproducibility.
-- Contains realistic fleet data based in Bangalore, India.
--
-- Contents:
--   1 fleet (SafeHaul Logistics — Bangalore Hub)
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
  ('a0000000-0000-0000-0000-000000000001', 'SafeHaul Logistics — Bangalore Hub');

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
-- Locations across Bangalore: Electronic City, Whitefield, Hebbal,
-- Koramangala, MG Road, Outer Ring Road, JP Nagar, Yeshwanthpur,
-- Indiranagar, Peenya Industrial Area
INSERT INTO vehicles (id, fleet_id, vehicle_number, model, driver_id, device_id, status, safety_score, latitude, longitude, last_seen) VALUES
  -- TRK-01: Electronic City (Rajesh)
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'TRK-01', 'Tata Ace Gold',        'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'ACTIVE',      92.50, 12.8399, 77.6770, now() - interval '2 minutes'),
  -- TRK-02: Whitefield (Amit)
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'TRK-02', 'Mahindra Bolero Pickup','d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'ACTIVE',      85.00, 12.9698, 77.7500, now() - interval '5 minutes'),
  -- TRK-03: Hebbal (Suresh — drowsy driver)
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'TRK-03', 'Ashok Leyland Dost',   'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'ACTIVE',      45.00, 13.0358, 77.5970, now() - interval '1 minute'),
  -- TRK-04: Koramangala (Vikram — harsh acceleration)
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'TRK-04', 'Tata 407',             'd0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'ACTIVE',      78.75, 12.9352, 77.6245, now() - interval '3 minutes'),
  -- TRK-05: Outer Ring Road / Marathahalli (Manoj)
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'TRK-05', 'Eicher Pro 2049',      'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'ACTIVE',      55.25, 12.9562, 77.7010, now() - interval '10 minutes'),
  -- TRK-06: MG Road / Brigade Road (Deepak)
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'TRK-06', 'BharatBenz 1015R',     'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 'ACTIVE',      88.00, 12.9756, 77.6070, now() - interval '4 minutes'),
  -- TRK-07: JP Nagar (offline)
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'TRK-07', 'Tata Ace',             NULL,                                   'e0000000-0000-0000-0000-000000000007', 'OFFLINE',     70.00, 12.9063, 77.5857, now() - interval '2 hours'),
  -- TRK-08: Yeshwanthpur (idle, no driver)
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'TRK-08', 'Mahindra Supro',       NULL,                                   'e0000000-0000-0000-0000-000000000008', 'IDLE',        95.00, 13.0067, 77.5439, NULL),
  -- TRK-09: Indiranagar (idle)
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'TRK-09', 'Ashok Leyland Partner','d0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000009', 'IDLE',        60.00, 12.9719, 77.6412, now() - interval '7 minutes'),
  -- TRK-10: Peenya Industrial Area (maintenance)
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'TRK-10', 'Tata LPT 1613',        'd0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', 'MAINTENANCE', 82.00, 13.0285, 77.5190, now() - interval '1 day');

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
-- Trips (5 completed trips — Bangalore routes)
-- =============================================================================
INSERT INTO trips (id, vehicle_id, driver_id, started_at, ended_at, distance, safety_score) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', now() - interval '6 hours', now() - interval '3 hours', 45.80, 94.00),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', now() - interval '8 hours', now() - interval '5 hours', 62.50, 82.00),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', now() - interval '4 hours', now() - interval '1 hour',  28.20, 42.00),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', now() - interval '10 hours', now() - interval '7 hours', 55.00, 76.50),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', now() - interval '5 hours', now() - interval '2 hours', 38.30, 58.00);

-- =============================================================================
-- Telemetry (~50 events) — Bangalore coordinates
-- =============================================================================

-- TRK-01: Normal driving along Electronics City Elevated Expressway
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '60 minutes', 12.8399, 77.6770, 42.5, 0.15, 0.05, 0.38, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '55 minutes', 12.8450, 77.6730, 48.0, 0.18, 0.08, 0.36, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '50 minutes', 12.8510, 77.6690, 55.0, 0.12, 0.04, 0.39, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '45 minutes', 12.8580, 77.6650, 52.0, 0.20, 0.06, 0.37, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now() - interval '40 minutes', 12.8650, 77.6610, 45.0, 0.14, 0.03, 0.40, 'NORMAL', 'ONLINE');

-- TRK-02: Normal with harsh braking on Whitefield Main Road
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '50 minutes', 12.9698, 77.7500, 60.0, 0.22, 0.10, 0.35, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '45 minutes', 12.9720, 77.7460, 65.0, 0.18, 0.08, 0.36, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '40 minutes', 12.9745, 77.7420, 20.0, 0.72, 0.12, 0.34, 'HARSH_BRAKING', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '35 minutes', 12.9770, 77.7380, 55.0, 0.15, 0.07, 0.37, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', now() - interval '30 minutes', 12.9795, 77.7340, 58.0, 0.20, 0.09, 0.35, 'NORMAL', 'ONLINE');

-- TRK-03: Drowsy driver on Hebbal flyover / Bellary Road
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '45 minutes', 13.0358, 77.5970, 50.0, 0.16, 0.15, 0.34, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '40 minutes', 13.0320, 77.5940, 48.0, 0.14, 0.45, 0.26, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '35 minutes', 13.0280, 77.5910, 45.0, 0.12, 0.65, 0.21, 'DROWSINESS', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '30 minutes', 13.0240, 77.5880, 42.0, 0.10, 0.82, 0.17, 'DROWSINESS', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '25 minutes', 13.0200, 77.5850, 30.0, 0.08, 0.35, 0.30, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '20 minutes', 13.0160, 77.5820, 52.0, 0.18, 0.72, 0.19, 'DROWSINESS', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', now() - interval '15 minutes', 13.0120, 77.5790, 35.0, 0.55, 0.40, 0.28, 'HARSH_BRAKING', 'ONLINE');

-- TRK-04: Harsh acceleration on Koramangala / Hosur Road
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '40 minutes', 12.9352, 77.6245, 35.0, 0.15, 0.05, 0.38, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '35 minutes', 12.9310, 77.6280, 70.0, 0.62, 0.08, 0.36, 'HARSH_ACCELERATION', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '30 minutes', 12.9270, 77.6320, 65.0, 0.20, 0.06, 0.37, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '25 minutes', 12.9230, 77.6360, 75.0, 0.58, 0.07, 0.35, 'HARSH_ACCELERATION', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', now() - interval '20 minutes', 12.9190, 77.6400, 60.0, 0.18, 0.05, 0.38, 'NORMAL', 'ONLINE');

-- TRK-05: Mixed events on Outer Ring Road / Marathahalli
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '50 minutes', 12.9562, 77.7010, 55.0, 0.16, 0.10, 0.35, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '45 minutes', 12.9540, 77.6970, 62.0, 0.65, 0.12, 0.33, 'HARSH_BRAKING', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '40 minutes', 12.9520, 77.6930, 48.0, 0.14, 0.55, 0.24, 'DROWSINESS', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '35 minutes', 12.9500, 77.6890, 52.0, 0.18, 0.15, 0.35, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', now() - interval '30 minutes', 12.9480, 77.6850, 58.0, 0.52, 0.08, 0.37, 'HARSH_ACCELERATION', 'ONLINE');

-- TRK-06: Clean driver along MG Road
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '30 minutes', 12.9756, 77.6070, 40.0, 0.12, 0.04, 0.40, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '25 minutes', 12.9770, 77.6100, 45.0, 0.14, 0.05, 0.39, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '20 minutes', 12.9785, 77.6130, 42.0, 0.10, 0.03, 0.41, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '15 minutes', 12.9800, 77.6160, 38.0, 0.11, 0.04, 0.40, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', now() - interval '10 minutes', 12.9815, 77.6190, 50.0, 0.16, 0.06, 0.38, 'NORMAL', 'ONLINE');

-- TRK-07: Device offline/recovered at JP Nagar
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', now() - interval '3 hours',    12.9063, 77.5857, 45.0, 0.15, 0.08, 0.36, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', now() - interval '2.5 hours',  12.9080, 77.5880, 40.0, 0.12, 0.06, 0.38, 'DEVICE_OFFLINE', 'OFFLINE'),
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', now() - interval '2 hours',    12.9063, 77.5857, 0.0,  0.02, 0.04, 0.40, 'DEVICE_RECOVERED', 'ONLINE');

-- TRK-09: Normal events at Indiranagar
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', now() - interval '20 minutes', 12.9719, 77.6412, 35.0, 0.10, 0.08, 0.37, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', now() - interval '15 minutes', 12.9735, 77.6440, 42.0, 0.14, 0.06, 0.38, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', now() - interval '10 minutes', 12.9750, 77.6470, 38.0, 0.12, 0.10, 0.35, 'NORMAL', 'ONLINE');

-- TRK-10: Recent events near Peenya before maintenance
INSERT INTO telemetry (device_id, vehicle_id, timestamp, latitude, longitude, speed, g_force, drowsiness_score, eye_aspect_ratio, event_type, network_status) VALUES
  ('e0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', now() - interval '26 hours', 13.0285, 77.5190, 50.0, 0.15, 0.07, 0.36, 'NORMAL', 'ONLINE'),
  ('e0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', now() - interval '25 hours', 13.0300, 77.5220, 55.0, 0.18, 0.09, 0.35, 'NORMAL', 'ONLINE');

-- =============================================================================
-- Alerts (8 — Bangalore coordinates)
-- =============================================================================
INSERT INTO alerts (id, vehicle_id, driver_id, type, severity, timestamp, latitude, longitude, message, acknowledged) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'HARSH_BRAKING', 'WARNING', now() - interval '40 minutes', 12.9745, 77.7420, 'Harsh braking detected on TRK-02 near Whitefield. G-force: 0.72g', false),
  ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'DROWSINESS', 'CRITICAL', now() - interval '35 minutes', 13.0280, 77.5910, 'Drowsiness detected on TRK-03 near Hebbal. Score: 0.65', false),
  ('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'DROWSINESS', 'CRITICAL', now() - interval '30 minutes', 13.0240, 77.5880, 'Severe drowsiness on TRK-03 near Bellary Road. Score: 0.82', false),
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'HARSH_BRAKING', 'WARNING', now() - interval '15 minutes', 13.0120, 77.5790, 'Harsh braking on TRK-03 near Mekhri Circle. G-force: 0.55g', true),
  ('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'HARSH_ACCELERATION', 'WARNING', now() - interval '35 minutes', 12.9310, 77.6280, 'Harsh acceleration on TRK-04 near Koramangala. G-force: 0.62g', true),
  ('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'DROWSINESS', 'WARNING', now() - interval '40 minutes', 12.9520, 77.6930, 'Drowsiness detected on TRK-05 near Marathahalli. Score: 0.55', false),
  ('f0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', NULL, 'DEVICE_OFFLINE', 'INFO', now() - interval '2.5 hours', 12.9080, 77.5880, 'Device DG-SN-007 went offline on TRK-07 at JP Nagar', true),
  ('f0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000007', NULL, 'DEVICE_RECOVERED', 'INFO', now() - interval '2 hours', 12.9063, 77.5857, 'Device DG-SN-007 recovered on TRK-07 at JP Nagar', true);

UPDATE alerts SET acknowledged_at = timestamp + interval '5 minutes' WHERE acknowledged = true;

-- =============================================================================
-- AI Reports (1 placeholder)
-- =============================================================================
INSERT INTO ai_reports (id, fleet_id, vehicle_id, period_start, period_end, summary, risk_level, key_findings, recommendations) VALUES
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL, now() - interval '7 days', now(), 'Weekly fleet safety summary for SafeHaul Logistics — Bangalore Hub. Overall fleet safety score is moderate with specific concerns around driver drowsiness on TRK-03 (Hebbal/Bellary Road corridor) and aggressive driving on TRK-04 (Koramangala area).', 'MEDIUM', '["TRK-03 driver Suresh Patel has 3 drowsiness events on Bellary Road","TRK-04 shows repeated harsh acceleration near Koramangala","TRK-07 experienced connectivity issues at JP Nagar","6 of 10 vehicles maintain good or excellent safety scores"]'::jsonb, '["Schedule mandatory rest break for Suresh Patel (TRK-03)","Review driving training for Vikram Singh (TRK-04)","Inspect cellular modem on device DG-SN-007 (TRK-07)","Consider firmware update for devices running v1.0.0"]'::jsonb);
