import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

interface ResultRow {
  id: string;
  job_id: string;
  content_type: string;
  title: string;
  summary: string;
  confidence_score: number;
  thumbnail_url: string | null;
  created_at: string;
}

interface TagRow {
  result_id: string;
  tag: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const supabase = createServiceClient();

    // If filtering by tag, first get matching result IDs
    let tagFilterIds: string[] | null = null;
    if (tag) {
      const { data: tagRows } = await supabase
        .from("result_tags")
        .select("result_id")
        .eq("tag", tag)
        .returns<{ result_id: string }[]>();

      tagFilterIds = (tagRows ?? []).map((r) => r.result_id);
      if (tagFilterIds.length === 0) {
        return NextResponse.json({ results: [] });
      }
    }

    let query = supabase
      .from("analysis_results")
      .select("id, job_id, content_type, title, summary, confidence_score, thumbnail_url, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (contentType && contentType !== "all") {
      query = query.eq("content_type", contentType);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    if (tagFilterIds) {
      query = query.in("id", tagFilterIds);
    }

    const { data, error } = await query.returns<ResultRow[]>();

    if (error) {
      console.error("Results list error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch results." },
        { status: 500 }
      );
    }

    const resultIds = (data ?? []).map((r) => r.id);

    // Fetch tags for all returned results
    const tagsByResult: Record<string, string[]> = {};
    if (resultIds.length > 0) {
      const { data: tagRows } = await supabase
        .from("result_tags")
        .select("result_id, tag")
        .in("result_id", resultIds)
        .returns<TagRow[]>();

      for (const row of tagRows ?? []) {
        const existing = tagsByResult[row.result_id];
        if (existing) {
          existing.push(row.tag);
        } else {
          tagsByResult[row.result_id] = [row.tag];
        }
      }
    }

    const results = (data ?? []).map((row) => ({
      id: row.id,
      jobId: row.job_id,
      contentType: row.content_type,
      title: row.title,
      summary: row.summary,
      confidenceScore: Number(row.confidence_score),
      thumbnailUrl: row.thumbnail_url ?? null,
      createdAt: row.created_at,
      tags: tagsByResult[row.id] ?? [],
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Results list error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch results." },
      { status: 500 }
    );
  }
}
