import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { errorResponse } from '@/lib/api/errors';

/**
 * GET /api/drivers
 *
 * List all drivers with optional status filter and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10) || 0;

    const supabase = createAdminClient();

    let query = supabase
      .from('drivers')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;
      type DriverStatusValue = typeof validStatuses[number];
      if (validStatuses.includes(status as DriverStatusValue)) {
        query = query.eq('status', status as DriverStatusValue);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[drivers] Query error:', error.message);
      return errorResponse('Failed to query drivers', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ data: data ?? [], total: count ?? 0, limit, offset });
  } catch (err) {
    console.error('[drivers] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * POST /api/drivers
 *
 * Create a new driver.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, fleet_id } = body;

    if (!name) {
      return errorResponse('name is required', 'BAD_REQUEST', 400);
    }

    const supabase = createAdminClient();
    const fleetId = fleet_id ?? 'a0000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase
      .from('drivers')
      .insert({
        fleet_id: fleetId,
        name,
        phone: phone ?? null,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) {
      console.error('[drivers] Insert error:', error.message);
      return errorResponse('Failed to create driver', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[drivers] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
