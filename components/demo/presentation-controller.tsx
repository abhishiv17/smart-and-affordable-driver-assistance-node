'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoOrchestrator } from '@/hooks/use-demo-orchestrator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Square, Presentation, ChevronUp, ChevronDown, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function PresentationController() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const orchestrator = useDemoOrchestrator('hero-drowsy-driver');

  // Auto-Navigation Logic
  useEffect(() => {
    if (orchestrator.phase === 'running') {
      // Step 0: Initial Normal Driving -> Go to Live Map
      if (orchestrator.currentStep === 0) {
        router.push('/map');
      }
      
      // Step 3: Drowsiness Detected -> Go to Dashboard to see real-time alert pop up
      if (orchestrator.currentStep === 3) {
        router.push('/dashboard');
      }

      // Step 6: Harsh Braking Compound Risk -> We stay on Dashboard, maybe scroll up
      if (orchestrator.currentStep === 6) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    if (orchestrator.phase === 'complete') {
      // Demo finished -> Go to AI to show fleet report summarizing the incident
      router.push('/ai');
    }
  }, [orchestrator.phase, orchestrator.currentStep, router]);

  const handleStart = () => {
    setIsExpanded(true);
    orchestrator.start();
  };

  const handleStop = () => {
    orchestrator.stop();
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsExpanded(true)}
          className="rounded-full shadow-lg h-12 w-12 p-0 bg-indigo-600 hover:bg-indigo-700"
        >
          <Presentation className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-indigo-500/30 shadow-xl bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm">Presentation Mode</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {orchestrator.phase === 'idle' ? 'Ready for Pitch' : orchestrator.phase.toUpperCase()}
            </p>
            
            {orchestrator.isActive && (
              <div className="space-y-2">
                <Progress value={orchestrator.progress} className="h-1.5" />
                <p className="text-sm font-medium leading-tight min-h-10 text-foreground">
                  {orchestrator.stepLabel || 'Initializing...'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            {orchestrator.phase === 'idle' || orchestrator.phase === 'complete' || orchestrator.phase === 'error' ? (
              <Button onClick={handleStart} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Play className="h-4 w-4 mr-2" fill="currentColor" />
                Start Cinematic Demo
              </Button>
            ) : (
              <Button onClick={handleStop} variant="destructive" className="w-full">
                <Square className="h-4 w-4 mr-2" fill="currentColor" />
                Stop Demo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
