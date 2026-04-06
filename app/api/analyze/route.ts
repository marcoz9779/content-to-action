import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/validation/schemas";
import { createServiceClient } from "@/lib/supabase/server";
import { detectPlatform } from "@/lib/source/detect-platform";
import { processJob } from "@/lib/jobs/processor";
import { trackEvent } from "@/lib/analytics/track";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/security/rate-limit";
import type { AnalyzeResponse, ApiError } from "@/types";

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

    // Track event
    void trackEvent("analysis_started", {
      jobId: job.id,
      sourceType,
      platform,
    });

    // Start processing asynchronously (fire and forget)
    // In production, this would be a queue job
    void processJob(job.id);

    return NextResponse.json<AnalyzeResponse>({
      jobId: job.id,
      status: "queued",
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
