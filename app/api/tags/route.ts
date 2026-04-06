import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

interface TagCountRow {
  tag: string;
  count: number;
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Use RPC or raw query to get tag counts
    // Supabase JS doesn't support GROUP BY natively, so we query all tags
    // and aggregate in JS, or use an rpc. We'll aggregate client-side for simplicity.
    const { data, error } = await supabase
      .from("result_tags")
      .select("tag")
      .returns<{ tag: string }[]>();

    if (error) {
      console.error("Tags fetch error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch tags." },
        { status: 500 }
      );
    }

    // Count occurrences of each tag
    const countMap = new Map<string, number>();
    for (const row of data ?? []) {
      countMap.set(row.tag, (countMap.get(row.tag) ?? 0) + 1);
    }

    // Sort by count descending
    const tags: TagCountRow[] = Array.from(countMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Tags fetch error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch tags." },
      { status: 500 }
    );
  }
}
