// =============================================================================
// Demo Seed Data — TypeScript Source of Truth
// =============================================================================
// Typed seed data for the SADAN demo, mirroring the SQL seed but usable
// programmatically from the /api/demo/seed endpoint.
//
// All UUIDs are deterministic and match the original seed.sql.
// =============================================================================

// =============================================================================
// Fixed UUIDs
// =============================================================================

export const FLEET_ID = 'a0000000-0000-0000-0000-000000000001';

export const DRIVER_IDS = {
  RAJESH:  'd0000000-0000-0000-0000-000000000001',
  AMIT:    'd0000000-0000-0000-0000-000000000002',
  SURESH:  'd0000000-0000-0000-0000-000000000003',
  VIKRAM:  'd0000000-0000-0000-0000-000000000004',
  MANOJ:   'd0000000-0000-0000-0000-000000000005',
  DEEPAK:  'd0000000-0000-0000-0000-000000000006',
  ARUN:    'd0000000-0000-0000-0000-000000000007',
  PRADEEP: 'd0000000-0000-0000-0000-000000000008',
  SANJAY:  'd0000000-0000-0000-0000-000000000009',
  RAVI:    'd0000000-0000-0000-0000-000000000010',
} as const;

export const DEVICE_IDS = {
  DG_001: 'e0000000-0000-0000-0000-000000000001',
  DG_002: 'e0000000-0000-0000-0000-000000000002',
  DG_003: 'e0000000-0000-0000-0000-000000000003',
  DG_004: 'e0000000-0000-0000-0000-000000000004',
  DG_005: 'e0000000-0000-0000-0000-000000000005',
  DG_006: 'e0000000-0000-0000-0000-000000000006',
  DG_007: 'e0000000-0000-0000-0000-000000000007',
  DG_008: 'e0000000-0000-0000-0000-000000000008',
  DG_009: 'e0000000-0000-0000-0000-000000000009',
  DG_010: 'e0000000-0000-0000-0000-000000000010',
} as const;

export const VEHICLE_IDS = {
  TRK_01: 'b0000000-0000-0000-0000-000000000001',
  TRK_02: 'b0000000-0000-0000-0000-000000000002',
  TRK_03: 'b0000000-0000-0000-0000-000000000003',
  TRK_04: 'b0000000-0000-0000-0000-000000000004',
  TRK_05: 'b0000000-0000-0000-0000-000000000005',
  TRK_06: 'b0000000-0000-0000-0000-000000000006',
  TRK_07: 'b0000000-0000-0000-0000-000000000007',
  TRK_08: 'b0000000-0000-0000-0000-000000000008',
  TRK_09: 'b0000000-0000-0000-0000-000000000009',
  TRK_10: 'b0000000-0000-0000-0000-000000000010',
} as const;

// =============================================================================
// Seed Data Arrays
// =============================================================================

export const seedFleet = {
  id: FLEET_ID,
  name: 'SafeHaul Logistics — Bangalore Hub',
};

export const seedDrivers = [
  { id: DRIVER_IDS.RAJESH,  fleet_id: FLEET_ID, name: 'Rajesh Kumar',   phone: '+91-9876543210', status: 'ACTIVE' as const },
  { id: DRIVER_IDS.AMIT,    fleet_id: FLEET_ID, name: 'Amit Sharma',    phone: '+91-9876543211', status: 'ACTIVE' as const },
  { id: DRIVER_IDS.SURESH,  fleet_id: FLEET_ID, name: 'Suresh Patel',   phone: '+91-9876543212', status: 'ACTIVE' as const },
  { id: DRIVER_IDS.VIKRAM,  fleet_id: FLEET_ID, name: 'Vikram Singh',   phone: '+91-9876543213', status: 'ACTIVE' as const },
  { id: DRIVER_IDS.MANOJ,   fleet_id: FLEET_ID, name: 'Manoj Verma',    phone: '+91-9876543214', status: 'ACTIVE' as const },
  { id: DRIVER_IDS.DEEPAK,  fleet_id: FLEET_ID, name: 'Deepak Yadav',   phone: '+91-9876543215', status: 'ACTIVE' as const },
  { id: DRIVER_IDS.ARUN,    fleet_id: FLEET_ID, name: 'Arun Gupta',     phone: '+91-9876543216', status: 'INACTIVE' as const },
  { id: DRIVER_IDS.PRADEEP, fleet_id: FLEET_ID, name: 'Pradeep Joshi',  phone: '+91-9876543217', status: 'INACTIVE' as const },
  { id: DRIVER_IDS.SANJAY,  fleet_id: FLEET_ID, name: 'Sanjay Mishra',  phone: '+91-9876543218', status: 'SUSPENDED' as const },
  { id: DRIVER_IDS.RAVI,    fleet_id: FLEET_ID, name: 'Ravi Tiwari',    phone: '+91-9876543219', status: 'ACTIVE' as const },
];

export const seedDevices = [
  { id: DEVICE_IDS.DG_001, device_serial: 'DG-SN-001', firmware_version: '1.2.0', connectivity_status: 'ONLINE' as const },
  { id: DEVICE_IDS.DG_002, device_serial: 'DG-SN-002', firmware_version: '1.2.0', connectivity_status: 'ONLINE' as const },
  { id: DEVICE_IDS.DG_003, device_serial: 'DG-SN-003', firmware_version: '1.1.0', connectivity_status: 'ONLINE' as const },
  { id: DEVICE_IDS.DG_004, device_serial: 'DG-SN-004', firmware_version: '1.2.0', connectivity_status: 'ONLINE' as const },
  { id: DEVICE_IDS.DG_005, device_serial: 'DG-SN-005', firmware_version: '1.1.0', connectivity_status: 'ONLINE' as const },
  { id: DEVICE_IDS.DG_006, device_serial: 'DG-SN-006', firmware_version: '1.2.0', connectivity_status: 'ONLINE' as const },
  { id: DEVICE_IDS.DG_007, device_serial: 'DG-SN-007', firmware_version: '1.0.0', connectivity_status: 'OFFLINE' as const },
  { id: DEVICE_IDS.DG_008, device_serial: 'DG-SN-008', firmware_version: '1.0.0', connectivity_status: 'OFFLINE' as const },
  { id: DEVICE_IDS.DG_009, device_serial: 'DG-SN-009', firmware_version: '1.2.0', connectivity_status: 'ONLINE' as const },
  { id: DEVICE_IDS.DG_010, device_serial: 'DG-SN-010', firmware_version: '1.1.0', connectivity_status: 'ONLINE' as const },
];

/** Vehicle seed data with Bangalore locations */
export const seedVehicles = [
  {
    id: VEHICLE_IDS.TRK_01, fleet_id: FLEET_ID, vehicle_number: 'TRK-01',
    model: 'Tata Ace Gold', driver_id: DRIVER_IDS.RAJESH, device_id: DEVICE_IDS.DG_001,
    status: 'ACTIVE' as const, safety_score: 92.50, latitude: 12.8399, longitude: 77.6770,
  },
  {
    id: VEHICLE_IDS.TRK_02, fleet_id: FLEET_ID, vehicle_number: 'TRK-02',
    model: 'Mahindra Bolero Pickup', driver_id: DRIVER_IDS.AMIT, device_id: DEVICE_IDS.DG_002,
    status: 'ACTIVE' as const, safety_score: 85.00, latitude: 12.9698, longitude: 77.7500,
  },
  {
    id: VEHICLE_IDS.TRK_03, fleet_id: FLEET_ID, vehicle_number: 'TRK-03',
    model: 'Ashok Leyland Dost', driver_id: DRIVER_IDS.SURESH, device_id: DEVICE_IDS.DG_003,
    status: 'ACTIVE' as const, safety_score: 45.00, latitude: 13.0358, longitude: 77.5970,
  },
  {
    id: VEHICLE_IDS.TRK_04, fleet_id: FLEET_ID, vehicle_number: 'TRK-04',
    model: 'Tata 407', driver_id: DRIVER_IDS.VIKRAM, device_id: DEVICE_IDS.DG_004,
    status: 'ACTIVE' as const, safety_score: 78.75, latitude: 12.9352, longitude: 77.6245,
  },
  {
    id: VEHICLE_IDS.TRK_05, fleet_id: FLEET_ID, vehicle_number: 'TRK-05',
    model: 'Eicher Pro 2049', driver_id: DRIVER_IDS.MANOJ, device_id: DEVICE_IDS.DG_005,
    status: 'ACTIVE' as const, safety_score: 55.25, latitude: 12.9562, longitude: 77.7010,
  },
  {
    id: VEHICLE_IDS.TRK_06, fleet_id: FLEET_ID, vehicle_number: 'TRK-06',
    model: 'BharatBenz 1015R', driver_id: DRIVER_IDS.DEEPAK, device_id: DEVICE_IDS.DG_006,
    status: 'ACTIVE' as const, safety_score: 88.00, latitude: 12.9756, longitude: 77.6070,
  },
  {
    id: VEHICLE_IDS.TRK_07, fleet_id: FLEET_ID, vehicle_number: 'TRK-07',
    model: 'Tata Ace', driver_id: null, device_id: DEVICE_IDS.DG_007,
    status: 'OFFLINE' as const, safety_score: 70.00, latitude: 12.9063, longitude: 77.5857,
  },
  {
    id: VEHICLE_IDS.TRK_08, fleet_id: FLEET_ID, vehicle_number: 'TRK-08',
    model: 'Mahindra Supro', driver_id: null, device_id: DEVICE_IDS.DG_008,
    status: 'IDLE' as const, safety_score: 95.00, latitude: 13.0067, longitude: 77.5439,
  },
  {
    id: VEHICLE_IDS.TRK_09, fleet_id: FLEET_ID, vehicle_number: 'TRK-09',
    model: 'Ashok Leyland Partner', driver_id: DRIVER_IDS.SANJAY, device_id: DEVICE_IDS.DG_009,
    status: 'IDLE' as const, safety_score: 60.00, latitude: 12.9719, longitude: 77.6412,
  },
  {
    id: VEHICLE_IDS.TRK_10, fleet_id: FLEET_ID, vehicle_number: 'TRK-10',
    model: 'Tata LPT 1613', driver_id: DRIVER_IDS.RAVI, device_id: DEVICE_IDS.DG_010,
    status: 'MAINTENANCE' as const, safety_score: 82.00, latitude: 13.0285, longitude: 77.5190,
  },
];

/** Device-to-vehicle mapping for the seed */
export const deviceVehicleMap: Record<string, string> = {
  [DEVICE_IDS.DG_001]: VEHICLE_IDS.TRK_01,
  [DEVICE_IDS.DG_002]: VEHICLE_IDS.TRK_02,
  [DEVICE_IDS.DG_003]: VEHICLE_IDS.TRK_03,
  [DEVICE_IDS.DG_004]: VEHICLE_IDS.TRK_04,
  [DEVICE_IDS.DG_005]: VEHICLE_IDS.TRK_05,
  [DEVICE_IDS.DG_006]: VEHICLE_IDS.TRK_06,
  [DEVICE_IDS.DG_007]: VEHICLE_IDS.TRK_07,
  [DEVICE_IDS.DG_008]: VEHICLE_IDS.TRK_08,
  [DEVICE_IDS.DG_009]: VEHICLE_IDS.TRK_09,
  [DEVICE_IDS.DG_010]: VEHICLE_IDS.TRK_10,
};
