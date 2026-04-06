"use client";

import { Check, Loader2, Circle } from "lucide-react";
import { PROGRESS_MAP } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";
import type { JobStatus } from "@/types";

interface ProcessingStepsProps {
  currentStatus: JobStatus;
}

const ORDERED_STEPS: JobStatus[] = [
  "queued",
  "fetching_source",
  "transcribing",
  "extracting_ocr",
  "classifying",
  "structuring",
  "completed",
];

export function ProcessingSteps({ currentStatus }: ProcessingStepsProps) {
  const { t } = useTranslation();
  const currentIndex = ORDERED_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-3">
      {ORDERED_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const progress = PROGRESS_MAP[step] ?? 0;

        return (
          <div key={step} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
              {isCompleted ? (
                <Check className="h-5 w-5 text-primary" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40" />
              )}
            </div>
            <span
              className={`text-sm ${
                isCompleted
                  ? "text-muted-foreground"
                  : isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground/50"
              }`}
            >
              {t.jobStatus[step]}
            </span>
            {isCurrent && (
              <span className="ml-auto text-xs text-muted-foreground">
                {progress}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
