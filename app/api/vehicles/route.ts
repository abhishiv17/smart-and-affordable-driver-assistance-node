import { notImplementedResponse } from '@/lib/api/errors';

/**
 * GET /api/vehicles
 *
 * List all vehicles in the fleet.
 *
 * Query params (Phase 2+):
 * - status: VehicleStatus filter
 * - page: pagination
 * - limit: page size
 *
 * Response: { data: Vehicle[], total: number }
 *
 * Phase 2+: Will query Supabase for vehicle data.
 */
export async function GET() {
  return notImplementedResponse('Vehicle listing');
}
