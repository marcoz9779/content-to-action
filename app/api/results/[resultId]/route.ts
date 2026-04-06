import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { structuredOutputSchema } from "@/lib/ai/schemas";
import type { ResultResponse, ApiError } from "@/types";

interface ResultRow {
  id: string;
  job_id: string;
  content_type: string;
  title: string;
  summary: string;
  confidence_score: number;
  warnings: unknown;
  missing_information: unknown;
  structured_output: unknown;
  thumbnail_url: string | null;
  source_creator: string | null;
  source_url: string | null;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;
    const supabase = createServiceClient();

    const { data: result, error } = await supabase
      .from("analysis_results")
      .select("*")
      .eq("id", resultId)
      .single<ResultRow>();

    if (error || !result) {
      return NextResponse.json<ApiError>(
        { error: "Result not found." },
        { status: 404 }
      );
    }

    // Parse and validate the structured output
    const parsedOutput = structuredOutputSchema.safeParse(
      result.structured_output
    );

    if (!parsedOutput.success) {
      console.error("Stored output validation failed:", parsedOutput.error);
      return NextResponse.json<ApiError>(
        { error: "Result data is corrupted." },
        { status: 500 }
      );
    }

    const response: ResultResponse = {
      id: result.id,
      jobId: result.job_id,
      contentType: result.content_type as ResultResponse["contentType"],
      title: result.title,
      summary: result.summary,
      confidenceScore: Number(result.confidence_score),
      warnings: Array.isArray(result.warnings)
        ? (result.warnings as string[])
        : [],
      missingInformation: Array.isArray(result.missing_information)
        ? (result.missing_information as string[])
        : [],
      structuredOutput: parsedOutput.data,
      thumbnailUrl: result.thumbnail_url ?? null,
      sourceCreator: result.source_creator ?? null,
      sourceUrl: result.source_url ?? null,
      createdAt: result.created_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Result fetch error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch result." },
      { status: 500 }
    );
  }
}
