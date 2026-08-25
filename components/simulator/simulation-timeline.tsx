'use client';

// =============================================================================
// SimulationTimeline — Scenario Event Progress
// =============================================================================
// Displays a horizontal timeline of events for the currently active scenario.
// Highlights the current step as it happens.
// =============================================================================

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { EventIndicator } from '@/components/dashboard/event-indicator';
import type { DemoScenario } from '@/lib/demo/demo-scenarios';

interface SimulationTimelineProps {
  scenario: DemoScenario | null;
  currentStepIndex: number;
  isActive: boolean;
  className?: string;
}

export function SimulationTimeline({
  scenario,
  currentStepIndex,
  isActive,
  className,
}: SimulationTimelineProps) {
  if (!scenario) return null;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="flex overflow-x-auto pb-4 pt-6 px-6 hide-scrollbar relative">
          {/* Connecting Line */}
          <div className="absolute top-9 left-10 right-10 h-0.5 bg-muted z-0" />
          <div
            className="absolute top-9 left-10 h-0.5 bg-violet-500 z-0 transition-all duration-500 ease-out"
            style={{
              width: isActive && scenario.steps.length > 1
                ? `calc(${(currentStepIndex / (scenario.steps.length - 1)) * 100}% - 2.5rem)`
                : '0%',
            }}
          />

          {scenario.steps.map((step, index) => {
            const isCompleted = isActive && index <= currentStepIndex;
            const isCurrent = isActive && index === currentStepIndex;

            return (
              <div
                key={index}
                className={cn(
                  "relative z-10 flex flex-col items-center min-w-[140px] px-2 gap-3 transition-opacity duration-300",
                  !isCompleted && isActive ? "opacity-40 grayscale" : "opacity-100"
                )}
              >
                {/* Node */}
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                  isCurrent ? "border-violet-500 bg-violet-500/20 ring-4 ring-violet-500/10" :
                  isCompleted ? "border-violet-500 bg-violet-500" : "border-muted bg-background text-muted-foreground"
                )}>
                  {isCompleted && !isCurrent ? (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  ) : isCurrent ? (
                    <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                  ) : (
                    <span className="text-[10px] font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="text-center space-y-1.5 flex flex-col items-center">
                  <EventIndicator type={step.eventType} showLabel={false} size="sm" />
                  <p className="text-[10px] font-medium text-muted-foreground max-w-[120px] leading-tight line-clamp-2">
                    {step.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 uppercase font-semibold">
                    T+{Math.round(step.delayMs / 1000)}s
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
