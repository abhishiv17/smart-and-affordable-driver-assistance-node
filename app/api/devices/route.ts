import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api/errors';

/**
 * GET /api/devices
 *
 * List all SADAN devices with optional connectivity filter.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const unlinked = searchParams.get('unlinked');

    const supabase = await createClient();

    let query = supabase
      .from('devices')
      .select('*, vehicles(id, vehicle_number)')
      .order('device_serial', { ascending: true });

    if (status) {
      query = query.eq('connectivity_status', status as 'ONLINE' | 'OFFLINE');
    }

    if (unlinked === 'true') {
      query = query.is('vehicle_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[devices] Query error:', error.message);
      return errorResponse('Failed to query devices', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error('[devices] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * POST /api/devices
 *
 * Register a new SADAN device (black box).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_serial, firmware_version } = body;

    if (!device_serial) {
      return errorResponse('device_serial is required', 'BAD_REQUEST', 400);
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('devices')
      .insert({
        device_serial,
        firmware_version: firmware_version ?? '1.0.0',
        connectivity_status: 'OFFLINE',
      })
      .select()
      .single();

    if (error) {
      console.error('[devices] Insert error:', error.message);
      if (error.code === '23505') {
        return errorResponse('Device serial already exists', 'CONFLICT', 409);
      }
      return errorResponse('Failed to register device', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[devices] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
