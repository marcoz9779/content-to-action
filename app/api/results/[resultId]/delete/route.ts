import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;
    const supabase = createServiceClient();

    // Delete result (cascades to saved_results via FK)
    const { error } = await supabase
      .from("analysis_results")
      .delete()
      .eq("id", resultId);

    if (error) {
      return NextResponse.json<ApiError>(
        { error: "Failed to delete result." },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json<ApiError>(
      { error: "Failed to delete result." },
      { status: 500 }
    );
  }
}
