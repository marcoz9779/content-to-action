"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/processing/progress-bar";
import { ProcessingSteps } from "@/components/processing/processing-steps";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition, FadeIn } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";
import { POLLING_INTERVAL_MS } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import type { JobStatusResponse } from "@/types";
import Link from "next/link";

export default function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchJobStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) { setError(t.processing.failedFetch); return; }
      const data = (await response.json()) as JobStatusResponse;
      setJob(data);
      if (data.status === "completed" && data.resultId) { router.push(`/app/results/${data.resultId}`); return; }
      if (data.status === "failed") { setError(data.errorMessage ?? t.processing.failedGeneric); return; }
      setPollCount((c) => c + 1);
    } catch {
      setError(t.processing.connectionError);
    }
  }, [jobId, router, t]);

  useEffect(() => { fetchJobStatus(); }, [fetchJobStatus]);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") return;
    const timer = setTimeout(fetchJobStatus, POLLING_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [job, fetchJobStatus, pollCount]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
  };

  if (error) {
    return (
      <PageTransition className="container max-w-2xl py-8">
        <ErrorState title={t.processing.failedTitle} message={error} onRetry={() => { setError(null); setJob(null); startTime.current = Date.now(); fetchJobStatus(); }} />
        <div className="mt-4 text-center">
          <Button asChild variant="outline"><Link href="/app/new">{t.processing.newAnalysis}</Link></Button>
        </div>
      </PageTransition>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition className="container max-w-2xl py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.processing.title}</h1>
          <p className="mt-1 text-muted-foreground">{t.jobStatus[job.status]}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatElapsed(elapsed)}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">{t.processing.progressLabel}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <ProgressBar value={job.progressPercent} label={t.jobStatus[job.status]} />
          <ProcessingSteps currentStatus={job.status} />

          {/* Animated processing indicator */}
          <div className="flex items-center justify-center py-4">
            <motion.div
              className="flex gap-1.5"
              initial="hidden"
              animate="visible"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-primary"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </div>

          {pollCount > 15 && (
            <FadeIn>
              <p className="text-center text-sm text-muted-foreground">{t.processing.slowNote}</p>
            </FadeIn>
          )}
        </CardContent>
      </Card>
    </PageTransition>
  );
}
