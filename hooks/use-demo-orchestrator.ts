'use client';

// =============================================================================
// useDemoOrchestrator — One-Click Demo Flow
// =============================================================================
// State machine that drives the complete demo cycle:
//   idle → resetting → seeding → running → complete
//
// Each phase is a real API call. The "running" phase iterates through the
// hero scenario steps, sending each as a POST /api/telemetry call.
// =============================================================================

import { useState, useRef, useCallback } from 'react';
import {
  heroScenario,
  DEMO_SCENARIOS,
  HERO_VEHICLE_ID,
  HERO_DEVICE_ID,
} from '@/lib/demo/demo-scenarios';
import type { DemoStep } from '@/lib/demo/demo-scenarios';
import type { TelemetrySubmission } from '@/types/telemetry';

// =============================================================================
// Types
// =============================================================================

export type DemoPhase = 'idle' | 'resetting' | 'seeding' | 'running' | 'complete' | 'error';

export interface DemoOrchestratorState {
  /** Current phase of the demo */
  phase: DemoPhase;
  /** Current step index (0-based) during the 'running' phase */
  currentStep: number;
  /** Total number of steps in the scenario */
  totalSteps: number;
  /** Progress percentage (0–100) */
  progress: number;
  /** Human-readable label for the current action */
  stepLabel: string;
  /** Error message if phase is 'error' */
  errorMessage: string | null;
  /** Whether the demo is actively running (resetting, seeding, or running) */
  isActive: boolean;
}

// =============================================================================
// Hook
// =============================================================================

export function useDemoOrchestrator(scenarioId: string = 'hero-drowsy-driver') {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const activeScenario = DEMO_SCENARIOS[scenarioId] || heroScenario;
  const totalSteps = activeScenario.steps.length;

  const isActive = phase === 'resetting' || phase === 'seeding' || phase === 'running';

  const progress = (() => {
    switch (phase) {
      case 'idle': return 0;
      case 'resetting': return 5;
      case 'seeding': return 15;
      case 'running': return 15 + Math.round((currentStep / totalSteps) * 80);
      case 'complete': return 100;
      case 'error': return 0;
      default: return 0;
    }
  })();

  /**
   * Build a telemetry payload from a demo step.
   */
  const buildPayload = useCallback((step: DemoStep): TelemetrySubmission => {
    return {
      deviceId: HERO_DEVICE_ID,
      submittedAt: new Date().toISOString(),
      events: [
        {
          id: crypto.randomUUID(),
          deviceId: HERO_DEVICE_ID,
          vehicleId: HERO_VEHICLE_ID,
          timestamp: new Date().toISOString(),
          latitude: step.latitude,
          longitude: step.longitude,
          speed: step.speed,
          gForce: step.gForce,
          drowsinessScore: step.drowsinessScore,
          eyeAspectRatio: step.eyeAspectRatio,
          eventType: step.eventType,
          networkStatus: step.networkStatus,
        },
      ],
    };
  }, []);

  /**
   * Send a telemetry event to the API.
   */
  const sendTelemetry = useCallback(async (step: DemoStep): Promise<void> => {
    const payload = buildPayload(step);
    const res = await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Telemetry failed: ${res.status}`);
    }
  }, [buildPayload]);

  /**
   * Clear all pending timeouts.
   */
  const clearAllTimeouts = useCallback(() => {
    for (const t of timeoutsRef.current) {
      clearTimeout(t);
    }
    timeoutsRef.current = [];
  }, []);

  /**
   * Execute the running phase — iterate through scenario steps with delays.
   */
  const runScenario = useCallback(async () => {
    const steps = activeScenario.steps;

    for (let i = 0; i < steps.length; i++) {
      if (abortRef.current) return;

      const step = steps[i];

      // Wait for the delay between this step and the previous one
      if (i > 0) {
        const delay = step.delayMs - steps[i - 1].delayMs;
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, delay);
          timeoutsRef.current.push(t);
        });
      }

      if (abortRef.current) return;

      setCurrentStep(i);
      setStepLabel(step.label);

      try {
        await sendTelemetry(step);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setErrorMessage(`Step ${i + 1} failed: ${message}`);
        setPhase('error');
        return;
      }
    }

    if (!abortRef.current) {
      setPhase('complete');
      setStepLabel('Demo complete — check Dashboard and AI Reports');
    }
  }, [sendTelemetry, activeScenario]);

  /**
   * Start the complete demo cycle: reset → seed → run scenario.
   */
  const start = useCallback(async () => {
    abortRef.current = false;
    setErrorMessage(null);

    // Phase 1: Reset
    setPhase('resetting');
    setStepLabel('Clearing database...');
    setCurrentStep(0);

    try {
      const resetRes = await fetch('/api/demo/reset', { method: 'POST' });
      if (!resetRes.ok) {
        const data = await resetRes.json().catch(() => ({}));
        throw new Error(data.error || `Reset failed: ${resetRes.status}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(`Reset failed: ${message}`);
      setPhase('error');
      return;
    }

    if (abortRef.current) return;

    // Phase 2: Seed
    setPhase('seeding');
    setStepLabel('Seeding demo data...');

    try {
      const seedRes = await fetch('/api/demo/seed', { method: 'POST' });
      if (!seedRes.ok) {
        const data = await seedRes.json().catch(() => ({}));
        throw new Error(data.error || `Seed failed: ${seedRes.status}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(`Seed failed: ${message}`);
      setPhase('error');
      return;
    }

    if (abortRef.current) return;

    // Phase 3: Run the scenario
    setPhase('running');
    await runScenario();
  }, [runScenario]);

  /**
   * Stop/cancel the running demo.
   */
  const stop = useCallback(() => {
    abortRef.current = true;
    clearAllTimeouts();
    setPhase('idle');
    setStepLabel('');
    setCurrentStep(0);
    setErrorMessage(null);
  }, [clearAllTimeouts]);

  /**
   * Reset to idle state (after complete or error).
   */
  const reset = useCallback(() => {
    abortRef.current = false;
    clearAllTimeouts();
    setPhase('idle');
    setStepLabel('');
    setCurrentStep(0);
    setErrorMessage(null);
  }, [clearAllTimeouts]);

  const state: DemoOrchestratorState = {
    phase,
    currentStep,
    totalSteps,
    progress,
    stepLabel,
    errorMessage,
    isActive,
  };

  return { ...state, start, stop, reset };
}
