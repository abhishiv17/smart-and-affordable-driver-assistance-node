import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api/errors';

/**
 * GET /api/vehicles
 *
 * List all vehicles with optional status filter and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10) || 0;

    const supabase = await createClient();

    let query = supabase
      .from('vehicles')
      .select('*, drivers(name), devices:devices!vehicles_device_id_fkey(device_serial, connectivity_status)', { count: 'exact' })
      .order('vehicle_number', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) {
      const validStatuses = ['ACTIVE', 'IDLE', 'OFFLINE', 'MAINTENANCE'] as const;
      type VehicleStatusValue = typeof validStatuses[number];
      if (validStatuses.includes(status as VehicleStatusValue)) {
        query = query.eq('status', status as VehicleStatusValue);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[vehicles] Query error:', error.message);
      return errorResponse('Failed to query vehicles', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ data: data ?? [], total: count ?? 0, limit, offset });
  } catch (err) {
    console.error('[vehicles] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * POST /api/vehicles
 *
 * Create a new vehicle and optionally assign a driver and device.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicle_number, model, driver_id, device_id, fleet_id } = body;

    if (!vehicle_number) {
      return errorResponse('vehicle_number is required', 'BAD_REQUEST', 400);
    }

    const supabase = await createClient();

    // Dynamically resolve user's fleet
    let fleetId = fleet_id;
    if (!fleetId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

      const { data: fleetMember } = await supabase
        .from('fleet_members')
        .select('fleet_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
        
      if (!fleetMember) {
        return errorResponse('User is not assigned to any fleet', 'FORBIDDEN', 403);
      }
      fleetId = fleetMember.fleet_id;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        fleet_id: fleetId,
        vehicle_number,
        model: model ?? null,
        driver_id: driver_id ?? null,
        device_id: device_id ?? null,
        status: 'IDLE',
        safety_score: 100,
      })
      .select()
      .single();

    if (error) {
      console.error('[vehicles] Insert error:', error.message);
      if (error.code === '23505') {
        return errorResponse('Vehicle number already exists', 'CONFLICT', 409);
      }
      return errorResponse('Failed to create vehicle', 'INTERNAL_ERROR', 500);
    }

    // Link device to vehicle if provided
    if (device_id) {
      await supabase.from('devices').update({ vehicle_id: data.id }).eq('id', device_id);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[vehicles] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
