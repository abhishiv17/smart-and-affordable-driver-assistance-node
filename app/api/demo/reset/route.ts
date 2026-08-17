import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const supabase = createAdminClient();

    // 1. Delete telemetry
    const { error: telError } = await supabase.from('telemetry').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (telError) throw telError;

    // 2. Delete alerts
    const { error: alertError } = await supabase.from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (alertError) throw alertError;

    // 3. Delete trips
    const { error: tripError } = await supabase.from('trips').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (tripError) throw tripError;

    // 4. Delete AI reports
    const { error: aiError } = await supabase.from('ai_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (aiError) throw aiError;

    // 5. Reset Vehicles
    const { error: vError } = await supabase
      .from('vehicles')
      .update({
        status: 'IDLE',
        safety_score: 100,
        last_seen: null,
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (vError) throw vError;

    return NextResponse.json({ success: true, message: 'Database reset successfully' });
  } catch (error: any) {
    console.error('Failed to reset database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
