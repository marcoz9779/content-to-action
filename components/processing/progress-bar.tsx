"use client";

import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/i18n";

interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label ?? t.processing.progressLabel}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} aria-label={`${t.processing.progressLabel}: ${value}%`} />
    </div>
  );
}
