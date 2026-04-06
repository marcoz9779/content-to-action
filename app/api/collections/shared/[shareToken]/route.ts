import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

interface CollectionRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_token: string;
  created_at: string;
  updated_at: string;
}

interface CollectionItemRow {
  id: string;
  collection_id: string;
  result_id: string;
  added_at: string;
}

interface ResultRow {
  id: string;
  content_type: string;
  title: string;
  summary: string;
  confidence_score: number;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const supabase = createServiceClient();

    const { data: collection, error } = await supabase
      .from("collections")
      .select("*")
      .eq("share_token", shareToken)
      .single<CollectionRow>();

    if (error || !collection) {
      return NextResponse.json<ApiError>(
        { error: "Collection not found." },
        { status: 404 }
      );
    }

    if (!collection.is_public) {
      return NextResponse.json<ApiError>(
        { error: "This collection is private." },
        { status: 403 }
      );
    }

    // Fetch collection items
    const { data: items, error: itemsError } = await supabase
      .from("collection_items")
      .select("*")
      .eq("collection_id", collection.id)
      .order("added_at", { ascending: false })
      .returns<CollectionItemRow[]>();

    if (itemsError) {
      console.error("Shared collection items error:", itemsError);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch collection items." },
        { status: 500 }
      );
    }

    // Fetch result details
    const resultIds = (items ?? []).map((item) => item.result_id);
    let resultsMap: Record<string, ResultRow> = {};

    if (resultIds.length > 0) {
      const { data: results, error: resultsError } = await supabase
        .from("analysis_results")
        .select("id, content_type, title, summary, confidence_score, created_at")
        .in("id", resultIds)
        .returns<ResultRow[]>();

      if (!resultsError && results) {
        resultsMap = results.reduce<Record<string, ResultRow>>((acc, r) => {
          acc[r.id] = r;
          return acc;
        }, {});
      }
    }

    const itemsWithDetails = (items ?? []).map((item) => {
      const result = resultsMap[item.result_id];
      return {
        id: item.id,
        resultId: item.result_id,
        addedAt: item.added_at,
        title: result?.title ?? "Unknown",
        contentType: result?.content_type ?? "other",
        summary: result?.summary ?? "",
        confidenceScore: result ? Number(result.confidence_score) : 0,
        resultCreatedAt: result?.created_at ?? item.added_at,
      };
    });

    return NextResponse.json({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      createdAt: collection.created_at,
      items: itemsWithDetails,
    });
  } catch (error) {
    console.error("Shared collection error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch shared collection." },
      { status: 500 }
    );
  }
}
