import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics/track";
import type { ApiError } from "@/types";
import { z } from "zod";

const saveSchema = z.object({
  resultId: z.string().uuid(),
  userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = saveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("saved_results")
      .insert({
        user_id: parsed.data.userId,
        result_id: parsed.data.resultId,
      });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ saved: true });
      }
      return NextResponse.json<ApiError>(
        { error: "Failed to save result." },
        { status: 500 }
      );
    }

    void trackEvent("result_saved", { resultId: parsed.data.resultId }, parsed.data.userId);

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json<ApiError>(
      { error: "Failed to save result." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get("resultId");
    const userId = searchParams.get("userId");

    if (!resultId || !userId) {
      return NextResponse.json<ApiError>(
        { error: "Missing parameters." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    await supabase
      .from("saved_results")
      .delete()
      .eq("result_id", resultId)
      .eq("user_id", userId);

    return NextResponse.json({ saved: false });
  } catch {
    return NextResponse.json<ApiError>(
      { error: "Failed to remove saved result." },
      { status: 500 }
    );
  }
}
