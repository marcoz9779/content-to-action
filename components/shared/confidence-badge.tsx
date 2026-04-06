"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

interface ConfidenceBadgeProps {
  score: number;
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const { t } = useTranslation();
  const percentage = Math.round(score * 100);

  const variant =
    score >= 0.8 ? "success" : score >= 0.5 ? "warning" : "destructive";

  const label =
    score >= 0.8
      ? t.results.highConfidence
      : score >= 0.5
        ? t.results.mediumConfidence
        : t.results.lowConfidence;

  return (
    <Badge variant={variant} className="gap-1">
      {percentage}% — {label}
    </Badge>
  );
}
