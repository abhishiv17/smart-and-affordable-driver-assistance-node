// =============================================================================
// Telemetry API — Integration Tests
// =============================================================================
// Tests the POST /api/telemetry endpoint end-to-end by sending HTTP
// requests and verifying responses.
//
// NOTE: These tests require:
// 1. The dev server running (`npm run dev`)
// 2. Supabase database with migrations applied
// 3. Valid environment variables in .env
//
// Run with: npx vitest run tests/integration/telemetry-api.test.ts
// =============================================================================

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

// =============================================================================
// Test Helpers
// =============================================================================

function createSubmission(overrides: Record<string, unknown> = {}) {
  const eventId = crypto.randomUUID();
  return {
    deviceId: 'e0000000-0000-0000-0000-000000000001',
    submittedAt: new Date().toISOString(),
    events: [
      {
        id: eventId,
        deviceId: 'e0000000-0000-0000-0000-000000000001',
        vehicleId: 'b0000000-0000-0000-0000-000000000001',
        timestamp: new Date().toISOString(),
        latitude: 19.076,
        longitude: 72.877,
        speed: 45,
        gForce: 0.15,
        drowsinessScore: 0.05,
        eyeAspectRatio: 0.38,
        eventType: 'NORMAL',
        networkStatus: 'ONLINE',
        ...overrides,
      },
    ],
  };
}

async function postTelemetry(body: unknown) {
  return fetch(`${BASE_URL}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// =============================================================================
// Tests
// =============================================================================

describe('POST /api/telemetry — Integration', () => {
  it('should accept a valid NORMAL telemetry event', async () => {
    const submission = createSubmission();
    const response = await postTelemetry(submission);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.accepted).toBe(true);
    expect(data.eventsIngested).toBe(1);
    expect(data.alertsCreated).toBe(0);
  });

  it('should create a CRITICAL alert for DROWSINESS with score >= 0.7', async () => {
    const submission = createSubmission({
      eventType: 'DROWSINESS',
      drowsinessScore: 0.82,
      eyeAspectRatio: 0.17,
    });
    const response = await postTelemetry(submission);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.accepted).toBe(true);
    expect(data.eventsIngested).toBe(1);
    expect(data.alertsCreated).toBe(1);
  });

  it('should create a WARNING alert for HARSH_BRAKING', async () => {
    const submission = createSubmission({
      eventType: 'HARSH_BRAKING',
      gForce: 0.65,
      speed: 55,
    });
    const response = await postTelemetry(submission);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.alertsCreated).toBe(1);
  });

  it('should create a WARNING alert for HARSH_ACCELERATION', async () => {
    const submission = createSubmission({
      eventType: 'HARSH_ACCELERATION',
      gForce: 0.58,
      speed: 65,
    });
    const response = await postTelemetry(submission);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.alertsCreated).toBe(1);
  });

  it('should create an INFO alert for DEVICE_OFFLINE', async () => {
    const submission = createSubmission({
      eventType: 'DEVICE_OFFLINE',
      networkStatus: 'OFFLINE',
    });
    const response = await postTelemetry(submission);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.alertsCreated).toBe(1);
  });

  it('should create an INFO alert for DEVICE_RECOVERED', async () => {
    const submission = createSubmission({
      eventType: 'DEVICE_RECOVERED',
      networkStatus: 'ONLINE',
    });
    const response = await postTelemetry(submission);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.alertsCreated).toBe(1);
  });

  it('should skip duplicate events', async () => {
    const eventId = crypto.randomUUID();
    const submission = createSubmission();
    submission.events[0].id = eventId;

    // First submission
    const response1 = await postTelemetry(submission);
    const data1 = await response1.json();
    expect(data1.eventsIngested).toBe(1);
    expect(data1.eventsDuplicated).toBe(0);

    // Second submission with same event ID
    const response2 = await postTelemetry(submission);
    const data2 = await response2.json();
    expect(data2.eventsIngested).toBe(0);
    expect(data2.eventsDuplicated).toBe(1);
  });

  it('should reject invalid JSON', async () => {
    const response = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    expect(response.status).toBe(400);
  });

  it('should reject missing required fields', async () => {
    const response = await postTelemetry({});
    expect(response.status).toBe(400);
  });

  it('should reject out-of-range values', async () => {
    const submission = createSubmission({
      latitude: 999, // Invalid: must be -90 to 90
    });
    const response = await postTelemetry(submission);
    expect(response.status).toBe(400);
  });
});

describe('GET /api/telemetry — Integration', () => {
  it('should return telemetry data', async () => {
    const response = await fetch(`${BASE_URL}/api/telemetry`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should filter by vehicleId', async () => {
    const vehicleId = 'b0000000-0000-0000-0000-000000000001';
    const response = await fetch(
      `${BASE_URL}/api/telemetry?vehicleId=${vehicleId}`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    // All results should match the vehicleId
    for (const event of data.data) {
      expect(event.vehicle_id).toBe(vehicleId);
    }
  });

  it('should respect limit parameter', async () => {
    const response = await fetch(`${BASE_URL}/api/telemetry?limit=5`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.length).toBeLessThanOrEqual(5);
  });
});
