// =============================================================================
// Telemetry Processor — Unit Tests
// =============================================================================
// Tests the alert classification rules, safety scoring algorithm,
// and deduplication logic. These tests do NOT require a database connection.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { classifyEvent, THRESHOLDS } from '@/lib/telemetry/alert-rules';
import { calculateScoreFromCounts, getSafetyBand, SAFETY_SCORE_BANDS } from '@/lib/safety/scoring';
import type { TelemetryEvent } from '@/types/telemetry';

// =============================================================================
// Test Helpers
// =============================================================================

function createEvent(overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    deviceId: 'e0000000-0000-0000-0000-000000000001',
    vehicleId: 'b0000000-0000-0000-0000-000000000001',
    timestamp: '2026-08-16T10:00:00Z',
    latitude: 19.076,
    longitude: 72.877,
    speed: 45,
    gForce: 0.15,
    drowsinessScore: 0.05,
    eyeAspectRatio: 0.38,
    eventType: 'NORMAL',
    networkStatus: 'ONLINE',
    ...overrides,
  };
}

// =============================================================================
// Alert Classification Tests
// =============================================================================

describe('Alert Classification — classifyEvent', () => {
  it('NORMAL event should NOT generate an alert', () => {
    const event = createEvent({ eventType: 'NORMAL' });
    const result = classifyEvent(event);
    expect(result).toBeNull();
  });

  it('DROWSINESS event with score >= 0.7 should generate CRITICAL alert', () => {
    const event = createEvent({
      eventType: 'DROWSINESS',
      drowsinessScore: 0.82,
      eyeAspectRatio: 0.17,
    });
    const result = classifyEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('DROWSINESS');
    expect(result!.severity).toBe('CRITICAL');
    expect(result!.message).toContain('0.82');
  });

  it('DROWSINESS event with score >= 0.5 but < 0.7 should generate WARNING alert', () => {
    const event = createEvent({
      eventType: 'DROWSINESS',
      drowsinessScore: 0.55,
      eyeAspectRatio: 0.24,
    });
    const result = classifyEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('DROWSINESS');
    expect(result!.severity).toBe('WARNING');
  });

  it('HARSH_BRAKING event with gForce >= 0.8 should generate CRITICAL alert', () => {
    const event = createEvent({
      eventType: 'HARSH_BRAKING',
      gForce: 0.92,
      speed: 60,
    });
    const result = classifyEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('HARSH_BRAKING');
    expect(result!.severity).toBe('CRITICAL');
    expect(result!.message).toContain('0.92');
  });

  it('HARSH_BRAKING event with gForce >= 0.5 but < 0.8 should generate WARNING alert', () => {
    const event = createEvent({
      eventType: 'HARSH_BRAKING',
      gForce: 0.65,
      speed: 55,
    });
    const result = classifyEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('HARSH_BRAKING');
    expect(result!.severity).toBe('WARNING');
  });

  it('HARSH_ACCELERATION event with gForce >= 0.8 should generate CRITICAL alert', () => {
    const event = createEvent({
      eventType: 'HARSH_ACCELERATION',
      gForce: 0.85,
      speed: 70,
    });
    const result = classifyEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('HARSH_ACCELERATION');
    expect(result!.severity).toBe('CRITICAL');
  });

  it('HARSH_ACCELERATION event with gForce < 0.8 should generate WARNING alert', () => {
    const event = createEvent({
      eventType: 'HARSH_ACCELERATION',
      gForce: 0.58,
      speed: 65,
    });
    const result = classifyEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('HARSH_ACCELERATION');
    expect(result!.severity).toBe('WARNING');
  });

  it('DEVICE_OFFLINE event should generate INFO alert', () => {
    const event = createEvent({
      eventType: 'DEVICE_OFFLINE',
      networkStatus: 'OFFLINE',
    });
    const result = classifyEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('DEVICE_OFFLINE');
    expect(result!.severity).toBe('INFO');
  });

  it('DEVICE_RECOVERED event should generate INFO alert', () => {
    const event = createEvent({
      eventType: 'DEVICE_RECOVERED',
      networkStatus: 'ONLINE',
    });
    const result = classifyEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('DEVICE_RECOVERED');
    expect(result!.severity).toBe('INFO');
  });

  it('thresholds should be correctly configured', () => {
    expect(THRESHOLDS.DROWSINESS_CRITICAL).toBe(0.7);
    expect(THRESHOLDS.DROWSINESS_WARNING).toBe(0.5);
    expect(THRESHOLDS.HARSH_DRIVING_CRITICAL).toBe(0.8);
    expect(THRESHOLDS.HARSH_DRIVING_WARNING).toBe(0.5);
  });
});

// =============================================================================
// Safety Scoring Tests
// =============================================================================

describe('Safety Scoring — calculateScoreFromCounts', () => {
  it('should return 100 for no events', () => {
    const score = calculateScoreFromCounts({});
    expect(score).toBe(100);
  });

  it('should deduct 8 points per DROWSINESS event', () => {
    const score = calculateScoreFromCounts({ DROWSINESS: 2 });
    expect(score).toBe(100 - 2 * 8);  // 84
  });

  it('should deduct 5 points per HARSH_BRAKING event', () => {
    const score = calculateScoreFromCounts({ HARSH_BRAKING: 3 });
    expect(score).toBe(100 - 3 * 5);  // 85
  });

  it('should deduct 3 points per HARSH_ACCELERATION event', () => {
    const score = calculateScoreFromCounts({ HARSH_ACCELERATION: 4 });
    expect(score).toBe(100 - 4 * 3);  // 88
  });

  it('should deduct 2 points per DEVICE_OFFLINE event', () => {
    const score = calculateScoreFromCounts({ DEVICE_OFFLINE: 5 });
    expect(score).toBe(100 - 5 * 2);  // 90
  });

  it('should handle mixed event types', () => {
    const score = calculateScoreFromCounts({
      DROWSINESS: 3,     // -24
      HARSH_BRAKING: 4,  // -20
      HARSH_ACCELERATION: 2,  // -6
      DEVICE_OFFLINE: 1, // -2
    });
    expect(score).toBe(100 - 24 - 20 - 6 - 2);  // 48
  });

  it('should floor at 0 for extreme events', () => {
    const score = calculateScoreFromCounts({ DROWSINESS: 20 });
    expect(score).toBe(0);
  });

  it('should not exceed 100', () => {
    const score = calculateScoreFromCounts({ NORMAL: 100 });
    expect(score).toBe(100);  // NORMAL has no deduction
  });
});

describe('Safety Scoring — getSafetyBand', () => {
  it('should classify 95 as Excellent', () => {
    expect(getSafetyBand(95)).toBe(SAFETY_SCORE_BANDS.EXCELLENT);
  });

  it('should classify 75 as Good', () => {
    expect(getSafetyBand(75)).toBe(SAFETY_SCORE_BANDS.GOOD);
  });

  it('should classify 55 as Fair', () => {
    expect(getSafetyBand(55)).toBe(SAFETY_SCORE_BANDS.FAIR);
  });

  it('should classify 35 as Poor', () => {
    expect(getSafetyBand(35)).toBe(SAFETY_SCORE_BANDS.POOR);
  });

  it('should classify 15 as Critical', () => {
    expect(getSafetyBand(15)).toBe(SAFETY_SCORE_BANDS.CRITICAL);
  });

  it('should classify 0 as Critical', () => {
    expect(getSafetyBand(0)).toBe(SAFETY_SCORE_BANDS.CRITICAL);
  });

  it('should classify 100 as Excellent', () => {
    expect(getSafetyBand(100)).toBe(SAFETY_SCORE_BANDS.EXCELLENT);
  });

  it('should classify boundary 90 as Excellent', () => {
    expect(getSafetyBand(90)).toBe(SAFETY_SCORE_BANDS.EXCELLENT);
  });

  it('should classify boundary 70 as Good', () => {
    expect(getSafetyBand(70)).toBe(SAFETY_SCORE_BANDS.GOOD);
  });
});
