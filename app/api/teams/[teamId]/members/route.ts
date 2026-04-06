import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

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

    const { data: members, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Members fetch error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch members." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      members: ((members ?? []) as MemberRow[]).map((m) => ({
        id: m.id,
        displayName: m.display_name,
        color: m.color,
        role: m.role,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error("Members list error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = (await request.json()) as unknown;

    if (
      !body ||
      typeof body !== "object" ||
      !("displayName" in body) ||
      !("color" in body)
    ) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields: displayName, color." },
        { status: 400 }
      );
    }

    const { displayName, color } = body as {
      displayName: string;
      color: string;
    };

    if (!displayName.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Display name is required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Verify team exists
    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("id", teamId)
      .single<{ id: string }>();

    if (!team) {
      return NextResponse.json<ApiError>(
        { error: "Team not found." },
        { status: 404 }
      );
    }

    const { data: member, error } = await supabase
      .from("team_members")
      .insert({
        team_id: teamId,
        display_name: displayName.trim(),
        color,
        role: "member",
      })
      .select("*")
      .single<MemberRow>();

    if (error || !member) {
      console.error("Member creation error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to add member." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: member.id,
      displayName: member.display_name,
      color: member.color,
      role: member.role,
      createdAt: member.created_at,
    });
  } catch (error) {
    console.error("Member add error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
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

    if (!body || typeof body !== "object" || !("memberId" in body)) {
      return NextResponse.json<ApiError>(
        { error: "Missing required field: memberId." },
        { status: 400 }
      );
    }

    const { memberId, displayName, color } = body as {
      memberId: string;
      displayName?: string;
      color?: string;
    };

    const updates: Record<string, string> = {};
    if (displayName !== undefined) updates.display_name = displayName.trim();
    if (color !== undefined) updates.color = color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiError>(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: member, error } = await supabase
      .from("team_members")
      .update(updates)
      .eq("id", memberId)
      .eq("team_id", teamId)
      .select("*")
      .single<MemberRow>();

    if (error || !member) {
      return NextResponse.json<ApiError>(
        { error: "Failed to update member." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: member.id,
      displayName: member.display_name,
      color: member.color,
      role: member.role,
      createdAt: member.created_at,
    });
  } catch (error) {
    console.error("Member update error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json<ApiError>(
        { error: "Missing query param: memberId." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Prevent deleting the owner
    const { data: member } = await supabase
      .from("team_members")
      .select("role")
      .eq("id", memberId)
      .eq("team_id", teamId)
      .single<{ role: string }>();

    if (!member) {
      return NextResponse.json<ApiError>(
        { error: "Member not found." },
        { status: 404 }
      );
    }

    if (member.role === "owner") {
      return NextResponse.json<ApiError>(
        { error: "Cannot remove the team owner." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId)
      .eq("team_id", teamId);

    if (error) {
      console.error("Member delete error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to remove member." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Member delete error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
