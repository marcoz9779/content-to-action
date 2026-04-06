import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

interface TeamRow {
  id: string;
  name: string;
  invite_code: string;
  owner_member_id: string | null;
  created_at: string;
}

interface MemberRow {
  id: string;
  team_id: string;
  display_name: string;
  color: string;
  role: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;

    if (
      !body ||
      typeof body !== "object" ||
      !("inviteCode" in body) ||
      !("displayName" in body) ||
      !("color" in body)
    ) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields: inviteCode, displayName, color." },
        { status: 400 }
      );
    }

    const { inviteCode, displayName, color } = body as {
      inviteCode: string;
      displayName: string;
      color: string;
    };

    if (!inviteCode.trim() || !displayName.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Invite code and display name are required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Find team by invite code
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("invite_code", inviteCode.trim())
      .single<TeamRow>();

    if (teamError || !team) {
      return NextResponse.json<ApiError>(
        { error: "Invalid invite code. Team not found." },
        { status: 404 }
      );
    }

    // Add member to team
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        display_name: displayName.trim(),
        color,
        role: "member",
      })
      .select("*")
      .single<MemberRow>();

    if (memberError || !member) {
      console.error("Join team error:", memberError);
      return NextResponse.json<ApiError>(
        { error: "Failed to join team." },
        { status: 500 }
      );
    }

    // Fetch all members for the response
    const { data: allMembers } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", team.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        inviteCode: team.invite_code,
        ownerMemberId: team.owner_member_id,
        createdAt: team.created_at,
        members: ((allMembers ?? []) as MemberRow[]).map((m) => ({
          id: m.id,
          displayName: m.display_name,
          color: m.color,
          role: m.role,
          createdAt: m.created_at,
        })),
      },
      memberId: member.id,
    });
  } catch (error) {
    console.error("Join team error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
