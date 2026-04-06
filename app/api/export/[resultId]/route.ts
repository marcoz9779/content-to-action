import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { exportRequestSchema } from "@/lib/validation/schemas";
import { structuredOutputSchema } from "@/lib/ai/schemas";
import { formatResultAsText, formatResultAsJson } from "@/lib/exports/format";
import { generatePdf } from "@/lib/exports/pdf";
import { trackEvent } from "@/lib/analytics/track";
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
  created_at: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;
    const body = (await request.json()) as unknown;
    const parsed = exportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        { error: "Invalid format. Use 'text' or 'json'." },
        { status: 400 }
      );
    }

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

    const parsedOutput = structuredOutputSchema.safeParse(
      result.structured_output
    );
    if (!parsedOutput.success) {
      return NextResponse.json<ApiError>(
        { error: "Result data is corrupted." },
        { status: 500 }
      );
    }

    const resultResponse: ResultResponse = {
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
      structuredOutput: parsedOutput.data, thumbnailUrl: null, sourceCreator: null, sourceUrl: null,
      createdAt: result.created_at,
    };

    void trackEvent("result_exported", {
      resultId,
      format: parsed.data.format,
    });

    const safeFilename = result.title.replace(/[^a-z0-9]/gi, "-");

    if (parsed.data.format === "pdf") {
      const pdfBuffer = generatePdf(resultResponse);
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeFilename}.pdf"`,
        },
      });
    }

    if (parsed.data.format === "json") {
      const content = formatResultAsJson(resultResponse);
      return new NextResponse(content, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${safeFilename}.json"`,
        },
      });
    }

    const content = formatResultAsText(resultResponse);
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}.txt"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to export result." },
      { status: 500 }
    );
  }
}
