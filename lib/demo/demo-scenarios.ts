// =============================================================================
// Demo Scenarios — Deterministic Hero Scenario
// =============================================================================
// Defines the step-by-step telemetry sequence for the SADAN demo.
//
// Hero Scenario: "The Drowsy Driver"
// Vehicle: TRK-03 (Suresh Patel) — Hebbal → Bellary Road → Mekhri Circle
//
// Arc:
//   1. Normal driving (building baseline)
//   2. Drowsiness onset (escalating scores)
//   3. Harsh braking (drowsy reaction)
//   4. Network failure (device goes offline)
//   5. Harsh braking while offline (cached event)
//   6. Network recovery + sync
//   7. Trip end
//
// Total duration: ~50 seconds (compressed real-world timeline)
// =============================================================================

import type { TelemetryEventType, TelemetryNetworkStatus } from '@/types/telemetry';

// =============================================================================
// Types
// =============================================================================

/** A single step in a demo scenario */
export interface DemoStep {
  /** Delay in ms from the start of the scenario */
  delayMs: number;
  /** Human-readable label for the UI progress indicator */
  label: string;
  /** Telemetry event type */
  eventType: TelemetryEventType;
  /** Vehicle speed in km/h */
  speed: number;
  /** G-force magnitude */
  gForce: number;
  /** Drowsiness score (0.0–1.0) */
  drowsinessScore: number;
  /** Eye aspect ratio */
  eyeAspectRatio: number;
  /** GPS latitude */
  latitude: number;
  /** GPS longitude */
  longitude: number;
  /** Network status */
  networkStatus: TelemetryNetworkStatus;
}

/** Complete demo scenario definition */
export interface DemoScenario {
  /** Unique identifier for the scenario */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** The vehicle ID to use (must exist in seed data) */
  vehicleId: string;
  /** The device ID to use (must exist in seed data) */
  deviceId: string;
  /** Ordered list of telemetry steps */
  steps: DemoStep[];
}

// =============================================================================
// Hero Scenario: "The Drowsy Driver"
// =============================================================================
// Route: Hebbal Flyover → Bellary Road → Mekhri Circle, Bangalore
// Vehicle: TRK-03 (Ashok Leyland Dost) — Driver: Suresh Patel
// =============================================================================

export const HERO_VEHICLE_ID = 'b0000000-0000-0000-0000-000000000003';
export const HERO_DEVICE_ID = 'e0000000-0000-0000-0000-000000000003';

export const heroScenario: DemoScenario = {
  id: 'hero-drowsy-driver',
  name: 'The Drowsy Driver',
  description:
    'TRK-03 begins a normal delivery. Drowsiness escalates, triggers harsh braking, ' +
    'then the device goes offline. On reconnection, cached events sync to reveal the full picture.',
  vehicleId: HERO_VEHICLE_ID,
  deviceId: HERO_DEVICE_ID,
  steps: [
    // =========================================================================
    // Act 1: Normal Driving (T+0s to T+12s)
    // Establishing baseline — everything looks safe
    // =========================================================================
    {
      delayMs: 0,
      label: 'Trip started — normal driving on Hebbal flyover',
      eventType: 'NORMAL',
      speed: 42.0,
      gForce: 0.12,
      drowsinessScore: 0.05,
      eyeAspectRatio: 0.38,
      latitude: 13.0358,
      longitude: 77.5970,
      networkStatus: 'ONLINE',
    },
    {
      delayMs: 4000,
      label: 'Steady pace on Bellary Road',
      eventType: 'NORMAL',
      speed: 48.0,
      gForce: 0.15,
      drowsinessScore: 0.08,
      eyeAspectRatio: 0.36,
      latitude: 13.0340,
      longitude: 77.5955,
      networkStatus: 'ONLINE',
    },
    {
      delayMs: 8000,
      label: 'Approaching Mekhri Circle — traffic clear',
      eventType: 'NORMAL',
      speed: 52.0,
      gForce: 0.14,
      drowsinessScore: 0.10,
      eyeAspectRatio: 0.35,
      latitude: 13.0320,
      longitude: 77.5940,
      networkStatus: 'ONLINE',
    },

    // =========================================================================
    // Act 2: Drowsiness Onset (T+12s to T+24s)
    // Eye closure increasing, drowsiness score escalating
    // =========================================================================
    {
      delayMs: 12000,
      label: '⚠️ Drowsiness detected — score rising',
      eventType: 'DROWSINESS',
      speed: 50.0,
      gForce: 0.12,
      drowsinessScore: 0.55,
      eyeAspectRatio: 0.24,
      latitude: 13.0300,
      longitude: 77.5920,
      networkStatus: 'ONLINE',
    },
    {
      delayMs: 16000,
      label: '⚠️ Drowsiness escalating — eyes closing',
      eventType: 'DROWSINESS',
      speed: 48.0,
      gForce: 0.10,
      drowsinessScore: 0.72,
      eyeAspectRatio: 0.19,
      latitude: 13.0280,
      longitude: 77.5905,
      networkStatus: 'ONLINE',
    },
    {
      delayMs: 20000,
      label: '🚨 CRITICAL drowsiness — immediate danger',
      eventType: 'DROWSINESS',
      speed: 45.0,
      gForce: 0.08,
      drowsinessScore: 0.88,
      eyeAspectRatio: 0.14,
      latitude: 13.0260,
      longitude: 77.5890,
      networkStatus: 'ONLINE',
    },

    // =========================================================================
    // Act 3: Harsh Braking (T+24s)
    // Driver snaps awake and brakes hard
    // =========================================================================
    {
      delayMs: 24000,
      label: '🔴 Harsh braking — driver snapped awake',
      eventType: 'HARSH_BRAKING',
      speed: 18.0,
      gForce: 0.85,
      drowsinessScore: 0.40,
      eyeAspectRatio: 0.30,
      latitude: 13.0245,
      longitude: 77.5878,
      networkStatus: 'ONLINE',
    },

    // =========================================================================
    // Act 4: Network Failure (T+28s)
    // Cellular modem drops — device goes offline
    // =========================================================================
    {
      delayMs: 28000,
      label: '📡 Network lost — device going offline',
      eventType: 'DEVICE_OFFLINE',
      speed: 35.0,
      gForce: 0.15,
      drowsinessScore: 0.20,
      eyeAspectRatio: 0.32,
      latitude: 13.0230,
      longitude: 77.5865,
      networkStatus: 'OFFLINE',
    },

    // =========================================================================
    // Act 5: Harsh Braking While Offline (T+32s)
    // Another incident while disconnected — data is cached locally
    // =========================================================================
    {
      delayMs: 32000,
      label: '🔴 Harsh braking while offline — data cached on device',
      eventType: 'HARSH_BRAKING',
      speed: 12.0,
      gForce: 0.78,
      drowsinessScore: 0.15,
      eyeAspectRatio: 0.33,
      latitude: 13.0215,
      longitude: 77.5850,
      networkStatus: 'OFFLINE',
    },

    // =========================================================================
    // Act 6: Network Recovery + Sync (T+38s)
    // Device reconnects — cached events sync to cloud
    // =========================================================================
    {
      delayMs: 38000,
      label: '✅ Network recovered — syncing cached data',
      eventType: 'DEVICE_RECOVERED',
      speed: 30.0,
      gForce: 0.10,
      drowsinessScore: 0.10,
      eyeAspectRatio: 0.36,
      latitude: 13.0200,
      longitude: 77.5835,
      networkStatus: 'ONLINE',
    },

    // =========================================================================
    // Act 7: Return to Normal + Trip End (T+42s to T+46s)
    // Driver has recovered, driving carefully
    // =========================================================================
    {
      delayMs: 42000,
      label: 'Driver recovered — driving cautiously',
      eventType: 'NORMAL',
      speed: 35.0,
      gForce: 0.10,
      drowsinessScore: 0.08,
      eyeAspectRatio: 0.37,
      latitude: 13.0185,
      longitude: 77.5820,
      networkStatus: 'ONLINE',
    },
    {
      delayMs: 46000,
      label: 'Trip ending — approaching destination',
      eventType: 'NORMAL',
      speed: 20.0,
      gForce: 0.06,
      drowsinessScore: 0.05,
      eyeAspectRatio: 0.39,
      latitude: 13.0170,
      longitude: 77.5805,
      networkStatus: 'ONLINE',
    },
  ],
};

// =============================================================================
// Scenario 2: "Normal Journey"
// =============================================================================
// A safe, uneventful trip. Useful for demonstrating the baseline.
// =============================================================================

export const normalJourneyScenario: DemoScenario = {
  id: 'normal-journey',
  name: 'Normal Journey',
  description: 'TRK-03 completes a safe delivery without any incidents or network drops.',
  vehicleId: HERO_VEHICLE_ID,
  deviceId: HERO_DEVICE_ID,
  steps: [
    {
      delayMs: 0,
      label: 'Trip started — leaving warehouse',
      eventType: 'NORMAL',
      speed: 30.0,
      gForce: 0.10,
      drowsinessScore: 0.02,
      eyeAspectRatio: 0.40,
      latitude: 13.0358,
      longitude: 77.5970,
      networkStatus: 'ONLINE',
    },
    {
      delayMs: 5000,
      label: 'Cruising on main road',
      eventType: 'NORMAL',
      speed: 45.0,
      gForce: 0.12,
      drowsinessScore: 0.03,
      eyeAspectRatio: 0.39,
      latitude: 13.0300,
      longitude: 77.5920,
      networkStatus: 'ONLINE',
    },
    {
      delayMs: 10000,
      label: 'Approaching destination',
      eventType: 'NORMAL',
      speed: 25.0,
      gForce: 0.08,
      drowsinessScore: 0.05,
      eyeAspectRatio: 0.38,
      latitude: 13.0245,
      longitude: 77.5878,
      networkStatus: 'ONLINE',
    },
    {
      delayMs: 15000,
      label: 'Trip complete — parked safely',
      eventType: 'NORMAL',
      speed: 0.0,
      gForce: 0.01,
      drowsinessScore: 0.02,
      eyeAspectRatio: 0.40,
      latitude: 13.0200,
      longitude: 77.5835,
      networkStatus: 'ONLINE',
    },
  ],
};

// =============================================================================
// Registry
// =============================================================================

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  'hero-drowsy-driver': heroScenario,
  'normal-journey': normalJourneyScenario,
};

// =============================================================================
// Helpers
// =============================================================================

/** Total duration of the hero scenario in milliseconds */
export function getScenarioDuration(scenario: DemoScenario): number {
  if (scenario.steps.length === 0) return 0;
  return scenario.steps[scenario.steps.length - 1].delayMs;
}

/** Total number of steps */
export function getStepCount(scenario: DemoScenario): number {
  return scenario.steps.length;
}
