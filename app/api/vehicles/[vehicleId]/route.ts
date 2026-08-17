import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api/errors';

/**
 * PUT /api/vehicles/[vehicleId]
 *
 * Update vehicle details, assign/unassign driver or device.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    const body = await request.json();
    const { vehicle_number, model, driver_id, device_id, status } = body;

    const supabase = await createClient();

    // Build update payload — only include fields that were provided
    const updates: Record<string, unknown> = {};
    if (vehicle_number !== undefined) updates.vehicle_number = vehicle_number;
    if (model !== undefined) updates.model = model;
    if (driver_id !== undefined) updates.driver_id = driver_id;
    if (device_id !== undefined) updates.device_id = device_id;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return errorResponse('No fields to update', 'BAD_REQUEST', 400);
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update(updates as any)
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) {
      console.error('[vehicles] Update error:', error.message);
      return errorResponse('Failed to update vehicle', 'INTERNAL_ERROR', 500);
    }

    // Sync device linkage
    if (device_id !== undefined) {
      // Unlink old device
      await supabase.from('devices').update({ vehicle_id: null }).eq('vehicle_id', vehicleId);
      // Link new device
      if (device_id) {
        await supabase.from('devices').update({ vehicle_id: vehicleId }).eq('id', device_id);
      }
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[vehicles] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * DELETE /api/vehicles/[vehicleId]
 *
 * Remove a vehicle from the fleet.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    const supabase = await createClient();

    // Unlink device first
    await supabase.from('devices').update({ vehicle_id: null }).eq('vehicle_id', vehicleId);

    const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);

    if (error) {
      console.error('[vehicles] Delete error:', error.message);
      return errorResponse('Failed to delete vehicle', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[vehicles] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
