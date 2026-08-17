import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

// Initialize Groq provider
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// The strict schema we force Groq to adhere to
const reportSchema = z.object({
  summary: z.string().describe('A 2-3 paragraph professional summary of the fleet safety over the period. Must mention specific vehicle numbers and driver names if applicable.'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).describe('Overall risk level based on incidents.'),
  keyFindings: z.array(z.string()).describe('List of 3-5 critical findings or trends across the fleet.'),
  recommendations: z.array(z.string()).describe('List of 3-5 actionable, evidence-backed recommendations for fleet managers.'),
  insights: z.array(
    z.object({
      category: z.enum(['SAFETY', 'EFFICIENCY', 'MAINTENANCE', 'COMPLIANCE']),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      title: z.string().describe('Short, punchy title (e.g., "TRK-03: Harsh Braking Spike")'),
      description: z.string().describe('Detailed explanation of the insight, citing specific data.'),
      recommendation: z.string().describe('What should the admin do right now?'),
    })
  ).describe('A list of specific, categorized insights derived from the data.'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fleetId, type, driverId } = body;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API Key is missing.' },
        { status: 500 }
      );
    }

    // 1. Fetch real context from Supabase
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the fleet (we need it to save the report later)
    let actualFleetId = fleetId;
    if (!actualFleetId) {
      const { data: fleets } = await supabase.from('fleets').select('id').limit(1);
      if (fleets && fleets.length > 0) {
        actualFleetId = fleets[0].id;
      }
    }

    // Fetch Vehicles (Fleet State)
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, vehicle_number, status, safety_score, drivers(name)')
      .eq('fleet_id', actualFleetId || '');
      
    // Fetch Alerts
    let query = supabase
      .from('alerts')
      .select('*, vehicles:vehicle_id(vehicle_number), drivers:driver_id(name)')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (type === 'DRIVER_ASSESSMENT' && driverId) {
      query = query.eq('driver_id', driverId);
    }

    const { data: recentAlerts, error: alertsError } = await query;

    if (alertsError) {
      console.error('Failed to fetch alerts for AI:', alertsError);
      return NextResponse.json({ error: 'Failed to fetch context.' }, { status: 500 });
    }

    // 2. Format the context for the LLM
    const vehiclesStr = vehicles && vehicles.length > 0
      ? vehicles.map((v: any) => 
          `Vehicle: ${v.vehicle_number} | Driver: ${v.drivers?.name || 'Unassigned'} | Status: ${v.status} | Safety Score: ${v.safety_score}/100`
        ).join('\n')
      : 'No vehicles found.';

    const alertsStr = recentAlerts && recentAlerts.length > 0
      ? recentAlerts.map((a: any) => 
          `[${new Date(a.created_at).toLocaleString()}] Vehicle: ${a.vehicles?.vehicle_number || a.vehicle_id} | Driver: ${a.drivers?.name || 'Unknown'} | Type: ${a.type} | Severity: ${a.severity} | Msg: ${a.message}`
        ).join('\n')
      : 'No recent alerts found in the database. The fleet is operating perfectly safely.';

    // 3. Ask Groq to analyze the data
    const systemPrompt = type === 'DRIVER_ASSESSMENT' ? `
      You are an expert Fleet Safety Analyst AI for the SADAN platform.
      Your job is to analyze the raw telemetry and alert data for a specific driver and generate a strictly structured safety report.
      
      REPORT CONTEXT:
      - Report Type: DRIVER_ASSESSMENT
      - Timeframe: Recent activity

      FLEET STATE (Vehicle Context):
      ${vehiclesStr}

      RAW DATA (Latest Alerts for this driver):
      ${alertsStr}

      INSTRUCTIONS:
      1. Analyze the driver's specific behavior for patterns (e.g., frequent drowsiness or harsh braking).
      2. Determine the driver's risk level. If there are CRITICAL alerts, risk should be HIGH or CRITICAL.
      3. Generate personalized coaching insights with actionable recommendations for the driver.
      4. DO NOT hallucinate alerts that are not in the raw data.
      5. Adopt an empathetic, coaching-focused tone.
    ` : `
      You are an expert Fleet Safety Analyst AI for the SADAN platform.
      Your job is to analyze the raw telemetry, vehicle safety scores, and alert data provided to generate a strictly structured safety report.
      
      REPORT CONTEXT:
      - Report Type: ${type || 'FLEET_SAFETY_SUMMARY'}
      - Timeframe: Recent activity

      FLEET STATE (Current Vehicle Safety Scores):
      ${vehiclesStr}

      RAW DATA (Latest Fleet Alerts):
      ${alertsStr}

      INSTRUCTIONS:
      1. Analyze the data to find fleet-wide patterns (e.g., "Vehicle X has the lowest safety score and multiple harsh braking events" or "Driver Y shows elevated fatigue").
      2. Provide evidence-backed recommendations (e.g., "Enforce rest intervals for Driver Y due to 3 drowsiness alerts").
      3. Determine the overall risk level. If there are CRITICAL alerts, risk should be HIGH or CRITICAL.
      4. Cite specific vehicle numbers and driver names to prove you are analyzing real data.
      5. DO NOT hallucinate vehicles or alerts that are not in the raw data.
      6. Adopt a professional, industrial-safety tone.
    `;

    // We use a high-tier Groq model for superior reasoning
    const { object } = await generateObject({
      model: groq('llama3-70b-8192'),
      schema: reportSchema,
      prompt: systemPrompt,
    });

    // 4. Save the generated report to the database
    if (actualFleetId) {
      await supabase.from('ai_reports').insert({
        fleet_id: actualFleetId,
        period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Roughly last 7 days
        period_end: new Date().toISOString(),
        summary: object.summary,
        risk_level: object.riskLevel,
        key_findings: object.keyFindings,
        recommendations: object.recommendations,
      });
    }

    return NextResponse.json({
      success: true,
      report: object,
    });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI report' },
      { status: 500 }
    );
  }
}
