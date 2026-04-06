import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

interface TeamRow {
  id: string;
  name: string;
  invite_code: string;
  owner_member_id: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberRow {
  id: string;
  team_id: string;
  display_name: string;
  color: string;
  role: string;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = createServiceClient();

    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single<TeamRow>();

    if (error || !team) {
      return NextResponse.json<ApiError>(
        { error: "Team not found." },
        { status: 404 }
      );
    }

    const { data: members } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      id: team.id,
      name: team.name,
      inviteCode: team.invite_code,
      ownerMemberId: team.owner_member_id,
      createdAt: team.created_at,
      members: ((members ?? []) as MemberRow[]).map((m) => ({
        id: m.id,
        displayName: m.display_name,
        color: m.color,
        role: m.role,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error("Team fetch error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch team." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || !("name" in body)) {
      return NextResponse.json<ApiError>(
        { error: "Missing required field: name." },
        { status: 400 }
      );
    }

    const { name } = body as { name: string };

    if (!name.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Team name cannot be empty." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: team, error } = await supabase
      .from("teams")
      .update({ name: name.trim() })
      .eq("id", teamId)
      .select("*")
      .single<TeamRow>();

    if (error || !team) {
      return NextResponse.json<ApiError>(
        { error: "Failed to update team." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: team.id,
      name: team.name,
      inviteCode: team.invite_code,
      ownerMemberId: team.owner_member_id,
      createdAt: team.created_at,
    });
  } catch (error) {
    console.error("Team update error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (error) {
      console.error("Team delete error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to delete team." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Team delete error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
