import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api/errors';

/**
 * GET /api/alerts
 *
 * List safety alerts with optional severity/acknowledged filters and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const acknowledged = searchParams.get('acknowledged');
    const vehicleId = searchParams.get('vehicleId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10) || 0;

    const supabase = await createClient();

    let query = supabase
      .from('alerts')
      .select('*, vehicles(vehicle_number), drivers(name)', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (severity) {
      const validSeverities = ['INFO', 'WARNING', 'CRITICAL'] as const;
      type SeverityValue = typeof validSeverities[number];
      if (validSeverities.includes(severity as SeverityValue)) {
        query = query.eq('severity', severity as SeverityValue);
      }
    }

    if (acknowledged !== null && acknowledged !== undefined) {
      query = query.eq('acknowledged', acknowledged === 'true');
    }

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[alerts] Query error:', error.message);
      return errorResponse('Failed to query alerts', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ data: data ?? [], total: count ?? 0, limit, offset });
  } catch (err) {
    console.error('[alerts] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * PATCH /api/alerts
 *
 * Acknowledge an alert.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, acknowledged } = body;

    if (!alertId) {
      return errorResponse('alertId is required', 'BAD_REQUEST', 400);
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('alerts')
      .update({
        acknowledged: acknowledged ?? true,
        acknowledged_at: acknowledged !== false ? new Date().toISOString() : null,
      })
      .eq('id', alertId);

    if (error) {
      console.error('[alerts] Update error:', error.message);
      return errorResponse('Failed to update alert', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[alerts] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
