import { NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

// Initialize Groq provider
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// The strict schema we force Groq to adhere to
const reportSchema = z.object({
  summary: z.string().describe('A 2-3 paragraph professional summary of the fleet safety over the period.'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).describe('Overall risk level based on incidents.'),
  keyFindings: z.array(z.string()).describe('List of 3-5 critical findings or trends.'),
  recommendations: z.array(z.string()).describe('List of 3-5 actionable recommendations for fleet managers.'),
  insights: z.array(
    z.object({
      category: z.enum(['SAFETY', 'EFFICIENCY', 'MAINTENANCE', 'COMPLIANCE']),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      title: z.string().describe('Short, punchy title (e.g., "Harsh Braking Spike")'),
      description: z.string().describe('Detailed explanation of the insight.'),
      recommendation: z.string().describe('What should the admin do right now?'),
    })
  ).describe('A list of specific, categorized insights derived from the data.'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fleetId, type } = body;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API Key is missing.' },
        { status: 500 }
      );
    }

    // 1. Fetch real context from Supabase
    const supabase = createAdminClient();

    // Fetch the latest 50 alerts
    const { data: recentAlerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*, vehicles:vehicle_id(label)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (alertsError) {
      console.error('Failed to fetch alerts for AI:', alertsError);
      return NextResponse.json({ error: 'Failed to fetch context.' }, { status: 500 });
    }

    // 2. Format the context for the LLM
    const contextStr = recentAlerts && recentAlerts.length > 0
      ? recentAlerts.map((a: any) => 
          `[${new Date(a.created_at).toLocaleString()}] Vehicle: ${a.vehicles?.label || a.vehicle_id} | Type: ${a.type} | Severity: ${a.severity} | Status: ${a.status} | Msg: ${a.message}`
        ).join('\n')
      : 'No recent alerts found in the database. The fleet is operating perfectly safely.';

    // 3. Ask Groq to analyze the data
    const systemPrompt = `
      You are an expert Fleet Safety Analyst AI for the SADAN platform.
      Your job is to analyze the raw telemetry and alert data provided and generate a strictly structured safety report.
      
      REPORT CONTEXT:
      - Report Type: ${type || 'FLEET_SAFETY_SUMMARY'}
      - Timeframe: Recent activity

      RAW DATA (Latest Alerts):
      ${contextStr}

      INSTRUCTIONS:
      1. Analyze the raw data for patterns (e.g., multiple harsh braking events by one vehicle).
      2. Determine the overall risk level. If there are CRITICAL alerts, risk should be HIGH or CRITICAL.
      3. Generate specific insights with actionable recommendations.
      4. DO NOT hallucinate vehicles or alerts that are not in the raw data.
      5. Adopt a professional, industrial-safety tone.
    `;

    // We use llama3-8b-8192 for maximum speed
    const { object } = await generateObject({
      model: groq('llama3-8b-8192'),
      schema: reportSchema,
      prompt: systemPrompt,
    });

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
