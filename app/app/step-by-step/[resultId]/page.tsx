"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/shared/page-transition";
import { useTranslation } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ResultResponse } from "@/types";

export default function StepByStepPage({ params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetch(`/api/results/${resultId}`)
      .then((r) => r.json())
      .then((data: ResultResponse) => setResult(data))
      .catch(() => router.push("/app/history"));
  }, [resultId, router]);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const steps = getSteps(result);
  const totalSteps = steps.length;

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const toggleComplete = useCallback(() => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(currentStep)) next.delete(currentStep);
      else next.add(currentStep);
      return next;
    });
  }, [currentStep]);

  // Keyboard + swipe
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Enter") { e.preventDefault(); toggleComplete(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, toggleComplete]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!result || totalSteps === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const step = steps[currentStep]!;
  const progress = ((completedSteps.size / totalSteps) * 100).toFixed(0);

  return (
    <PageTransition className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/app/results/${resultId}`)}>
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{result.title}</p>
            <p className="text-sm font-medium">{currentStep + 1} / {totalSteps}</p>
          </div>
          <div className="text-xs text-muted-foreground">{progress}%</div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${(currentStep + 1) / totalSteps * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="container flex flex-1 flex-col items-center justify-center max-w-xl px-6 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <Card className={`transition-colors ${completedSteps.has(currentStep) ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20" : ""}`}>
              <CardContent className="p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {currentStep + 1}
                  </span>
                  <Button
                    variant={completedSteps.has(currentStep) ? "default" : "outline"}
                    size="sm"
                    onClick={toggleComplete}
                    className="gap-1"
                  >
                    <Check className="h-4 w-4" />
                    {completedSteps.has(currentStep) ? t.jobStatus.completed : "Done"}
                  </Button>
                </div>
                <p className="text-lg leading-relaxed">{step}</p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Timer */}
        <div className="mt-6 flex items-center gap-3">
          <div className="font-mono text-2xl tabular-nums text-muted-foreground">
            {formatTimer(timerSeconds)}
          </div>
          <Button variant="outline" size="icon" onClick={() => setTimerRunning(!timerRunning)}>
            {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setTimerSeconds(0); setTimerRunning(false); }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t bg-background p-4">
        <div className="container flex max-w-xl items-center justify-between gap-4">
          <Button variant="outline" size="lg" onClick={goPrev} disabled={currentStep === 0} className="flex-1">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            size="lg"
            onClick={currentStep === totalSteps - 1 ? () => router.push(`/app/results/${resultId}`) : goNext}
            className="flex-1"
          >
            {currentStep === totalSteps - 1 ? "Finish" : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

function getSteps(result: ResultResponse | null): string[] {
  if (!result) return [];
  const output = result.structuredOutput;
  switch (output.contentType) {
    case "recipe": return output.steps;
    case "diy": return output.steps;
    case "workout": return output.exercises.map((e) => {
      const parts = [e.sets && `${e.sets} sets`, e.reps && `${e.reps} reps`, e.duration].filter(Boolean).join(", ");
      return `${e.name}${parts ? ` — ${parts}` : ""}${e.notes ? `\n${e.notes}` : ""}`;
    });
    case "education": return output.concepts.map((c) => `${c.name}\n\n${c.explanation}`);
    case "business": return output.actionItems;
    default: return "suggestedActions" in output ? output.suggestedActions : [];
  }
}
