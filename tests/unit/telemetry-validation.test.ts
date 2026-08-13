import { describe, it, expect } from 'vitest';
import { telemetryEventSchema, telemetrySubmissionSchema } from '@/lib/telemetry/validation';

describe('Telemetry Validation', () => {
  it('should validate a correct telemetry event', () => {
    const validEvent = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      deviceId: '550e8400-e29b-41d4-a716-446655440001',
      vehicleId: '550e8400-e29b-41d4-a716-446655440002',
      timestamp: '2025-01-15T10:30:00.000Z',
      latitude: 19.076,
      longitude: 72.8777,
      speed: 45.5,
      gForce: 0.3,
      drowsinessScore: 0.1,
      eyeAspectRatio: 0.35,
      eventType: 'NORMAL' as const,
      networkStatus: 'ONLINE' as const,
    };

    const result = telemetryEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('should reject an event with invalid latitude', () => {
    const invalidEvent = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      deviceId: '550e8400-e29b-41d4-a716-446655440001',
      vehicleId: '550e8400-e29b-41d4-a716-446655440002',
      timestamp: '2025-01-15T10:30:00.000Z',
      latitude: 91, // Invalid: max is 90
      longitude: 72.8777,
      speed: 45.5,
      gForce: 0.3,
      drowsinessScore: 0.1,
      eyeAspectRatio: 0.35,
      eventType: 'NORMAL' as const,
      networkStatus: 'ONLINE' as const,
    };

    const result = telemetryEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
  });

  it('should reject an event with invalid event type', () => {
    const invalidEvent = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      deviceId: '550e8400-e29b-41d4-a716-446655440001',
      vehicleId: '550e8400-e29b-41d4-a716-446655440002',
      timestamp: '2025-01-15T10:30:00.000Z',
      latitude: 19.076,
      longitude: 72.8777,
      speed: 45.5,
      gForce: 0.3,
      drowsinessScore: 0.1,
      eyeAspectRatio: 0.35,
      eventType: 'INVALID_TYPE',
      networkStatus: 'ONLINE',
    };

    const result = telemetryEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
  });

  it('should validate a correct telemetry submission', () => {
    const validSubmission = {
      events: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          deviceId: '550e8400-e29b-41d4-a716-446655440001',
          vehicleId: '550e8400-e29b-41d4-a716-446655440002',
          timestamp: '2025-01-15T10:30:00.000Z',
          latitude: 19.076,
          longitude: 72.8777,
          speed: 45.5,
          gForce: 0.3,
          drowsinessScore: 0.1,
          eyeAspectRatio: 0.35,
          eventType: 'NORMAL' as const,
          networkStatus: 'ONLINE' as const,
        },
      ],
      deviceId: '550e8400-e29b-41d4-a716-446655440001',
      submittedAt: '2025-01-15T10:30:05.000Z',
    };

    const result = telemetrySubmissionSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('should reject an empty event batch', () => {
    const emptySubmission = {
      events: [],
      deviceId: '550e8400-e29b-41d4-a716-446655440001',
      submittedAt: '2025-01-15T10:30:05.000Z',
    };

    const result = telemetrySubmissionSchema.safeParse(emptySubmission);
    expect(result.success).toBe(false);
  });
});

describe('Safety Scoring Bands', () => {
  it('should classify scores into correct bands', async () => {
    const { getSafetyBand } = await import('@/lib/safety/scoring');

    expect(getSafetyBand(95).label).toBe('Excellent');
    expect(getSafetyBand(75).label).toBe('Good');
    expect(getSafetyBand(55).label).toBe('Fair');
    expect(getSafetyBand(35).label).toBe('Poor');
    expect(getSafetyBand(15).label).toBe('Critical');
  });
});
