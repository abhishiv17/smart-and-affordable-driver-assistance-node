import { notImplementedResponse } from '@/lib/api/errors';

/**
 * GET /api/drivers
 *
 * List all drivers in the fleet.
 *
 * Query params (Phase 2+):
 * - status: DriverStatus filter
 * - page: pagination
 * - limit: page size
 *
 * Response: { data: Driver[], total: number }
 *
 * Phase 2+: Will query Supabase for driver data.
 */
export async function GET() {
  return notImplementedResponse('Driver listing');
}
