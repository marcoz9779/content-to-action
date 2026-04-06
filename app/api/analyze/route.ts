import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/validation/schemas";
import { createServiceClient } from "@/lib/supabase/server";
import { detectPlatform } from "@/lib/source/detect-platform";
import { processJob } from "@/lib/jobs/processor";
import { trackEvent } from "@/lib/analytics/track";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/security/rate-limit";
import type { ApiError } from "@/types";

// Allow up to 60 seconds for processing (Vercel Pro: 300s)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = checkRateLimit(getRateLimitKey(request), RATE_LIMITS.analyze);
    if (!rateLimitResult.allowed) {
      return NextResponse.json<ApiError>(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = (await request.json()) as unknown;
    const parsed = analyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return NextResponse.json<ApiError>(
        { error: "Invalid request.", details },
        { status: 400 }
      );
    }

    const { sourceType, sourceUrl, uploadPath, captionText, commentText } =
      parsed.data;

    const platform =
      sourceType === "url" && sourceUrl
        ? detectPlatform(sourceUrl)
        : "unknown";

    const supabase = createServiceClient();
    const { data: job, error: insertError } = await supabase
      .from("analysis_jobs")
      .insert({
        source_type: sourceType,
        source_platform: platform,
        source_url: sourceUrl ?? null,
        upload_path: uploadPath ?? null,
        caption_text: captionText ?? null,
        comment_text: commentText ?? null,
        status: "queued",
        progress_percent: 5,
      })
      .select("id, status")
      .single<{ id: string; status: string }>();

    if (insertError || !job) {
      console.error("Job creation error:", insertError);
      return NextResponse.json<ApiError>(
        { error: "Failed to create analysis job." },
        { status: 500 }
      );
    }

    void trackEvent("analysis_started", { jobId: job.id, sourceType, platform });

    // Process job SYNCHRONOUSLY — Vercel kills background tasks after response
    await processJob(job.id);

    // Fetch the result ID after processing
    const { data: completedJob } = await supabase
      .from("analysis_jobs")
      .select("status, error_message")
      .eq("id", job.id)
      .single<{ status: string; error_message: string | null }>();

    if (completedJob?.status === "failed") {
      return NextResponse.json<ApiError>(
        { error: completedJob.error_message ?? "Analyse fehlgeschlagen." },
        { status: 500 }
      );
    }

    const { data: result } = await supabase
      .from("analysis_results")
      .select("id")
      .eq("job_id", job.id)
      .single<{ id: string }>();

    return NextResponse.json({
      jobId: job.id,
      status: completedJob?.status ?? "completed",
      resultId: result?.id ?? null,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
