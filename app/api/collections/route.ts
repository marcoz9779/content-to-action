import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";
import crypto from "crypto";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json<ApiError>(
        { error: "userId is required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: collections, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<CollectionRow[]>();

    if (error) {
      console.error("Collections list error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch collections." },
        { status: 500 }
      );
    }

    // Get item counts for each collection
    const collectionIds = (collections ?? []).map((c) => c.id);
    let itemCounts: Record<string, number> = {};

    if (collectionIds.length > 0) {
      const { data: counts, error: countError } = await supabase
        .from("collection_items")
        .select("collection_id")
        .in("collection_id", collectionIds);

      if (!countError && counts) {
        itemCounts = counts.reduce<Record<string, number>>((acc, item) => {
          acc[item.collection_id] = (acc[item.collection_id] || 0) + 1;
          return acc;
        }, {});
      }
    }

    const result = (collections ?? []).map((c) => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      description: c.description,
      isPublic: c.is_public,
      shareToken: c.share_token,
      itemCount: itemCounts[c.id] || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    return NextResponse.json({ collections: result });
  } catch (error) {
    console.error("Collections list error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch collections." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description } = body as {
      userId?: string;
      name?: string;
      description?: string;
    };

    if (!userId || !name?.trim()) {
      return NextResponse.json<ApiError>(
        { error: "userId and name are required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const shareToken = crypto.randomUUID();

    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        is_public: false,
        share_token: shareToken,
      })
      .select("*")
      .single<CollectionRow>();

    if (error) {
      console.error("Collection create error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to create collection." },
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
      itemCount: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("Collection create error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create collection." },
      { status: 500 }
    );
  }
}
