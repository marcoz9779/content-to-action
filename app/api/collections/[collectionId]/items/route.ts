import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

interface CollectionItemRow {
  id: string;
  collection_id: string;
  result_id: string;
  added_at: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const body = await request.json();
    const { resultId } = body as { resultId?: string };

    if (!resultId) {
      return NextResponse.json<ApiError>(
        { error: "resultId is required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if already exists
    const { data: existing } = await supabase
      .from("collection_items")
      .select("id")
      .eq("collection_id", collectionId)
      .eq("result_id", resultId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json<ApiError>(
        { error: "Item already in collection." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("collection_items")
      .insert({
        collection_id: collectionId,
        result_id: resultId,
      })
      .select("*")
      .single<CollectionItemRow>();

    if (error) {
      console.error("Add item error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to add item to collection." },
        { status: 500 }
      );
    }

    // Update collection's updated_at
    await supabase
      .from("collections")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", collectionId);

    return NextResponse.json({
      id: data.id,
      collectionId: data.collection_id,
      resultId: data.result_id,
      addedAt: data.added_at,
    });
  } catch (error) {
    console.error("Add item error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to add item to collection." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get("resultId");

    if (!resultId) {
      return NextResponse.json<ApiError>(
        { error: "resultId query param is required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("result_id", resultId);

    if (error) {
      console.error("Remove item error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to remove item from collection." },
        { status: 500 }
      );
    }

    // Update collection's updated_at
    await supabase
      .from("collections")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", collectionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove item error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to remove item from collection." },
      { status: 500 }
    );
  }
}
