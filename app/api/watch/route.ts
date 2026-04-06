import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";
import { z } from "zod";

const watchSchema = z.object({
  userId: z.string().uuid(),
  platform: z.enum(["instagram", "tiktok", "facebook", "youtube"]),
  accountHandle: z.string().min(1).max(100),
});

interface WatchRow {
  id: string;
  user_id: string;
  platform: string;
  account_handle: string;
  is_active: boolean;
  last_checked_at: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json<ApiError>({ error: "Missing userId." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("watched_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<WatchRow[]>();

    if (error) {
      return NextResponse.json<ApiError>({ error: "Failed to fetch watches." }, { status: 500 });
    }

    return NextResponse.json({
      watches: (data ?? []).map((w) => ({
        id: w.id,
        platform: w.platform,
        accountHandle: w.account_handle,
        isActive: w.is_active,
        lastCheckedAt: w.last_checked_at,
        createdAt: w.created_at,
      })),
    });
  } catch {
    return NextResponse.json<ApiError>({ error: "Failed to fetch watches." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = watchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiError>({ error: "Invalid request." }, { status: 400 });
    }

    const handle = parsed.data.accountHandle.replace(/^@/, "");

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("watched_accounts")
      .insert({
        user_id: parsed.data.userId,
        platform: parsed.data.platform,
        account_handle: handle,
      })
      .select("id")
      .single<{ id: string }>();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json<ApiError>({ error: "Already watching this account." }, { status: 409 });
      }
      return NextResponse.json<ApiError>({ error: "Failed to add watch." }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch {
    return NextResponse.json<ApiError>({ error: "Failed to add watch." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const watchId = searchParams.get("id");

    if (!watchId) {
      return NextResponse.json<ApiError>({ error: "Missing id." }, { status: 400 });
    }

    const supabase = createServiceClient();
    await supabase.from("watched_accounts").delete().eq("id", watchId);

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json<ApiError>({ error: "Failed to delete watch." }, { status: 500 });
  }
}
