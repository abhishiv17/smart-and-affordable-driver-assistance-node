// =============================================================================
// POST /api/demo/seed — Re-seed Database with Demo Data
// =============================================================================
// Seeds the database with deterministic demo data from the TypeScript
// seed data module. Designed to be called after /api/demo/reset.
//
// This endpoint is idempotent — it uses upsert operations.
// =============================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  seedFleet,
  seedDrivers,
  seedDevices,
  seedVehicles,
  deviceVehicleMap,
} from '@/lib/demo/demo-seed-data';

export async function POST() {
  try {
    const supabase = createAdminClient();
    const counts = {
      fleets: 0,
      drivers: 0,
      devices: 0,
      vehicles: 0,
    };

    // 1. Upsert fleet
    const { error: fleetError } = await supabase
      .from('fleets')
      .upsert(seedFleet, { onConflict: 'id' });
    if (fleetError) throw new Error(`Fleet seed failed: ${fleetError.message}`);
    counts.fleets = 1;

    // 2. Upsert drivers
    const { error: driverError } = await supabase
      .from('drivers')
      .upsert(seedDrivers, { onConflict: 'id' });
    if (driverError) throw new Error(`Driver seed failed: ${driverError.message}`);
    counts.drivers = seedDrivers.length;

    // 3. Upsert devices (without vehicle_id first)
    const devicesWithoutVehicle = seedDevices.map((d) => ({
      ...d,
      last_seen: new Date().toISOString(),
    }));
    const { error: deviceError } = await supabase
      .from('devices')
      .upsert(devicesWithoutVehicle, { onConflict: 'id' });
    if (deviceError) throw new Error(`Device seed failed: ${deviceError.message}`);
    counts.devices = seedDevices.length;

    // 4. Upsert vehicles
    const vehiclesWithTimestamp = seedVehicles.map((v) => ({
      ...v,
      last_seen: v.status === 'IDLE' && !v.driver_id ? null : new Date().toISOString(),
    }));
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .upsert(vehiclesWithTimestamp, { onConflict: 'id' });
    if (vehicleError) throw new Error(`Vehicle seed failed: ${vehicleError.message}`);
    counts.vehicles = seedVehicles.length;

    // 5. Update devices with vehicle_id mapping
    for (const [deviceId, vehicleId] of Object.entries(deviceVehicleMap)) {
      const { error } = await supabase
        .from('devices')
        .update({ vehicle_id: vehicleId })
        .eq('id', deviceId);
      if (error) {
        console.error(`[seed] Failed to map device ${deviceId} → vehicle ${vehicleId}:`, error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      seeded: counts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[demo/seed] Failed to seed database:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
