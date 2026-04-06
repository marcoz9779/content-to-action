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
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const supabase = createServiceClient();

    const { data: collection, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single<CollectionRow>();

    if (error || !collection) {
      return NextResponse.json<ApiError>(
        { error: "Collection not found." },
        { status: 404 }
      );
    }

    // Fetch collection items
    const { data: items, error: itemsError } = await supabase
      .from("collection_items")
      .select("*")
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false })
      .returns<CollectionItemRow[]>();

    if (itemsError) {
      console.error("Collection items error:", itemsError);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch collection items." },
        { status: 500 }
      );
    }

    // Fetch result details for each item
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
      userId: collection.user_id,
      name: collection.name,
      description: collection.description,
      isPublic: collection.is_public,
      shareToken: collection.share_token,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
      items: itemsWithDetails,
    });
  } catch (error) {
    console.error("Collection fetch error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch collection." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const body = await request.json();
    const { name, description, isPublic } = body as {
      name?: string;
      description?: string;
      isPublic?: boolean;
    };

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim() || null;
    if (isPublic !== undefined) updates.is_public = isPublic;
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 1) {
      // Only updated_at, nothing to update
      return NextResponse.json<ApiError>(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", collectionId)
      .select("*")
      .single<CollectionRow>();

    if (error || !data) {
      console.error("Collection update error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to update collection." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      isPublic: data.is_public,
      shareToken: data.share_token,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("Collection update error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to update collection." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const supabase = createServiceClient();

    // Delete items first
    await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId);

    // Delete collection
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (error) {
      console.error("Collection delete error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to delete collection." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Collection delete error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to delete collection." },
      { status: 500 }
    );
  }
}
