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
