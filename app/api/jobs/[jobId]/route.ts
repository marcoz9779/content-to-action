import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { JobStatusResponse, ApiError } from "@/types";

interface JobRow {
  id: string;
  status: string;
  progress_percent: number;
  error_message: string | null;
}

interface ResultRow {
  id: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const supabase = createServiceClient();

    const { data: job, error } = await supabase
      .from("analysis_jobs")
      .select("id, status, progress_percent, error_message")
      .eq("id", jobId)
      .single<JobRow>();

    if (error || !job) {
      return NextResponse.json<ApiError>(
        { error: "Job not found." },
        { status: 404 }
      );
    }

    // If completed, fetch the result ID
    let resultId: string | null = null;
    if (job.status === "completed") {
      const { data: result } = await supabase
        .from("analysis_results")
        .select("id")
        .eq("job_id", jobId)
        .single<ResultRow>();
      resultId = result?.id ?? null;
    }

    const response: JobStatusResponse = {
      id: job.id,
      status: job.status as JobStatusResponse["status"],
      progressPercent: job.progress_percent,
      errorMessage: job.error_message,
      resultId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Job status error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch job status." },
      { status: 500 }
    );
  }
}
