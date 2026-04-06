"use client";

import { useEffect, useState, use } from "react";
import { ResultHeader } from "@/components/results/result-header";
import { ResultRenderer } from "@/components/results/result-renderer";
import { ResultSkeleton } from "@/components/results/result-skeleton";
import { ResultChat } from "@/components/results/result-chat";
import { ModifyPanel } from "@/components/results/modify-panel";
import { NutritionCard } from "@/components/results/nutrition-card";
import { WarningCard } from "@/components/shared/warning-card";
import { MissingInfoCard } from "@/components/shared/missing-info-card";
import { CopyButton } from "@/components/shared/copy-button";
import { ExportMenu } from "@/components/shared/export-menu";
import { SaveButton } from "@/components/shared/save-button";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition, SlideUp } from "@/components/shared/page-transition";
import { AddToCollection } from "@/components/shared/add-to-collection";
import { Button } from "@/components/ui/button";
import { Plus, ListOrdered } from "lucide-react";
import { formatResultAsText } from "@/lib/exports/format";
import { useTranslation } from "@/lib/i18n";
import type { ResultResponse } from "@/types";
import Link from "next/link";

export default function ResultPage({ params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = use(params);
  const { t } = useTranslation();
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [displayOutput, setDisplayOutput] = useState<ResultResponse["structuredOutput"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await fetch(`/api/results/${resultId}`);
        if (!response.ok) { setError(t.results.notFound); return; }
        const data = (await response.json()) as ResultResponse;
        setResult(data);
        setDisplayOutput(data.structuredOutput);
      } catch {
        setError(t.results.loadFailed);
      }
    }
    fetchResult();
  }, [resultId, t]);

  if (error) {
    return (
      <div className="container max-w-2xl py-8">
        <PageTransition><ErrorState title={t.results.loadErrorTitle} message={error} /></PageTransition>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container max-w-2xl py-8 pb-24">
        <ResultSkeleton />
      </div>
    );
  }

  const copyText = formatResultAsText(result);

  return (
    <PageTransition className="container max-w-2xl py-8 pb-24">
      <div className="space-y-6">
        <SlideUp>
          <ResultHeader title={result.title} summary={result.summary} contentType={result.contentType} confidenceScore={result.confidenceScore} />
        </SlideUp>

        {/* Action strip */}
        <SlideUp delay={0.05}>
          <div className="flex flex-wrap items-center gap-2">
            <ModifyPanel
              resultId={resultId}
              onModified={(output, title, summary) => {
                setDisplayOutput(output);
                setResult((prev) => prev ? { ...prev, title, summary, structuredOutput: output } : prev);
              }}
            />
            {result.contentType === "recipe" && <NutritionCard resultId={resultId} />}
            {hasSteps(result) && (
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link href={`/app/step-by-step/${resultId}`}>
                  <ListOrdered className="h-4 w-4" />
                  <span className="hidden sm:inline">Step-by-Step</span>
                </Link>
              </Button>
            )}
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          {displayOutput && <ResultRenderer output={displayOutput} thumbnailUrl={result.thumbnailUrl} sourceCreator={result.sourceCreator} sourceUrl={result.sourceUrl} resultId={resultId} />}
        </SlideUp>
        <SlideUp delay={0.2}>
          <WarningCard warnings={result.warnings} />
        </SlideUp>
        <SlideUp delay={0.25}>
          <MissingInfoCard items={result.missingInformation} />
        </SlideUp>
      </div>

      <ResultChat
        resultId={resultId}
        contentType={result.contentType}
        summary={result.summary}
        structuredOutput={result.structuredOutput}
      />

      <div className="fixed bottom-16 left-0 right-0 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:bottom-0">
        <div className="container flex max-w-2xl items-center justify-between gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/app/new"><Plus className="h-4 w-4" />{t.results.newButton}</Link>
          </Button>
          <div className="flex items-center gap-1.5">
            <SaveButton resultId={resultId} />
            <AddToCollection resultId={resultId} />
            <CopyButton text={copyText} />
            <ExportMenu resultId={resultId} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function hasSteps(result: ResultResponse): boolean {
  const o = result.structuredOutput;
  switch (o.contentType) {
    case "recipe": return o.steps.length > 0;
    case "diy": return o.steps.length > 0;
    case "workout": return o.exercises.length > 0;
    case "education": return o.concepts.length > 0;
    case "business": return o.actionItems.length > 0;
    default: return "suggestedActions" in o && o.suggestedActions.length > 0;
  }
}
