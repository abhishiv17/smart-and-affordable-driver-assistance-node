import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api/errors';

/**
 * PUT /api/drivers/[driverId]
 *
 * Update driver details.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const body = await request.json();
    const { name, phone, status } = body;

    const supabase = await createClient();

    // Build update payload
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return errorResponse('No fields to update', 'BAD_REQUEST', 400);
    }

    const { data, error } = await supabase
      .from('drivers')
      .update(updates as any)
      .eq('id', driverId)
      .select()
      .single();

    if (error) {
      console.error('[drivers] Update error:', error.message);
      return errorResponse('Failed to update driver', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[drivers] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * DELETE /api/drivers/[driverId]
 *
 * Remove a driver from the fleet.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from('drivers').delete().eq('id', driverId);

    if (error) {
      console.error('[drivers] Delete error:', error.message);
      return errorResponse('Failed to delete driver', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[drivers] Unhandled error:', err);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
