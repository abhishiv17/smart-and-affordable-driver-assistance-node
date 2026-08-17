import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

    const supabase = createAdminClient();

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
