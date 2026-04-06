"use client";

import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface AnalyzeButtonProps {
  loading: boolean;
  disabled: boolean;
}

export function AnalyzeButton({ loading, disabled }: AnalyzeButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      type="submit"
      size="lg"
      className="w-full text-base font-semibold"
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          {t.newAnalysis.analyzingButton}
        </>
      ) : (
        <>
          <Zap className="h-5 w-5" />
          {t.newAnalysis.analyzeButton}
        </>
      )}
    </Button>
  );
}
